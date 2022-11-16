import React, { MouseEventHandler } from 'react';
import GameConfig from './game_config';
import { Coordinate, LayerData, LayerSetData, LineData, SquareData } from './interfaces';
import LayeredBoard from './layered_board';

interface GameSessionProps {
    width: number;
    height: number;
    layer_amount: number;
    mine_amount: number;
}

interface GameSessionState {
    layers: LayerSetData;
    game_started: Boolean;
    layer_amount: number,
    width: number,
    height: number,
    mine_amount: number,
    hovered_coordinates:Coordinate,
    game_over: Boolean,
    game_won: Boolean,
    flags_placed: number,
    timer: number,
    timer_function: null | number,
    restart_surprised: Boolean,
    
}

class GameSession extends React.Component<GameSessionProps, GameSessionState> {
    constructor(props: GameSessionProps) {
        super(props);

        const width = this.props.width;
        const height = this.props.height;
        const layer_amount = this.props.layer_amount;
        const mine_amount = this.props.mine_amount;

        const layers = this.getLayers(width, height, layer_amount)

        this.state = {
            layers: layers,
            game_started: false,
            layer_amount: layer_amount,
            width: width,
            height: height,
            mine_amount: mine_amount,
            hovered_coordinates: {x:Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z:Number.NEGATIVE_INFINITY},
            game_over: false,
            game_won: false,
            flags_placed: 0,
            timer: 0,
            timer_function: null,
            restart_surprised: false,
        }
    }

    getLayers(width: number, height: number, layer_amount: number) {
        const base_value = {
            revealed: false,
            value: 0,
            has_flag: false,
        }
        const layers = [...Array(layer_amount)].map(e => [...Array(height)].map(e => Array(width).fill(base_value)))
        return layers;
    }

    checkCoordinateAvoided(mine_coordinate: Coordinate, avoid_coordinate: Coordinate) {
        for (let z = avoid_coordinate.z-1; z <= avoid_coordinate.z + 1; z ++) {
            for (let y = avoid_coordinate.y-1; y <= avoid_coordinate.y + 1; y ++) {
                for (let x = avoid_coordinate.x-1; x <= avoid_coordinate.x + 1; x ++) {
                    if(mine_coordinate.x === x && mine_coordinate.y === y && mine_coordinate.z === z) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    removeSurprised() {
        this.setState({
            restart_surprised: false,
        })
    }

    handleRestartGame(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        const width = this.state.width;
        const height = this.state.height;
        const layer_amount = this.state.layer_amount;

        const layers = this.getLayers(width, height, layer_amount);

        if(this.state.timer_function)
            clearTimeout(this.state.timer_function);

        this.setState({
            game_started: false,
            flags_placed: 0,
            game_over: false,
            game_won: false,
            hovered_coordinates: {x:Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z:Number.NEGATIVE_INFINITY},
            layers: layers,
            timer: 0,
        });
    }

    generateMineCoordinates(width: number, height: number, layer_amount: number, mine_amount: number, avoid_coordinate: Coordinate): Coordinate[] {
        const mine_coordinates:Coordinate[] = []
        for(let i = 0; i < mine_amount; i++) {
            let mine_coordinate: Coordinate;
            while (true) {
                const x = Math.floor(Math.random()*width);
                const y = Math.floor(Math.random()*height);
                const z = Math.floor(Math.random()*layer_amount);
                mine_coordinate = {x:x , y:y , z:z};
                const coordinate_is_new = mine_coordinates.find(coordinate => coordinate.x === x && coordinate.y === y  && coordinate.z === z) === undefined
                const coordinate_is_avoided = this.checkCoordinateAvoided(mine_coordinate, avoid_coordinate)
                if (coordinate_is_new && coordinate_is_avoided) {
                    break;
                }
            }
            mine_coordinates.push(mine_coordinate);
        }
        return mine_coordinates;
    }

    getCoordValue(x: number, y: number, z: number, mine_coordinates: Coordinate[], width: number, height: number, layer_amount: number): number | "X" {
        if(mine_coordinates.find(coordinate => coordinate.x === x && coordinate.y === y  && coordinate.z === z)){
            return 'X';
        } else {
            let amount_surrounding_mines = 0;
            for (let z_shift = -1; z_shift <= 1; z_shift ++){
                if (z+z_shift >= 0 && z+z_shift < layer_amount){
                    for (let y_shift = -1; y_shift <= 1; y_shift ++){
                        if (y+y_shift >= 0 && y+y_shift < height){
                            for (let x_shift = -1; x_shift <= 1; x_shift ++){
                                if (x+x_shift >= 0 && x+x_shift < height){
                                    if(mine_coordinates.find(coordinate => coordinate.x === x+x_shift && coordinate.y === y+y_shift  && coordinate.z === z+z_shift)){
                                        amount_surrounding_mines ++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return amount_surrounding_mines;
        }
    }

    generateNewMap(width: number, height: number, layer_amount: number, mine_amount: number, avoid_coordinate: Coordinate) {
        const mine_coordinates = this.generateMineCoordinates(width, height, layer_amount, mine_amount, avoid_coordinate);

        const layers:LayerSetData = []
        for(let z = 0; z < this.state.layer_amount; z++){
            let lines:LayerData = []
            for(let y = 0; y < this.state.height; y++){
                let row:LineData = [];
                for(let x = 0; x < width; x++){
                    let value = this.getCoordValue(x, y, z, mine_coordinates, width, height, layer_amount);
                    let square:SquareData = {
                        revealed: false,
                        value: value,
                        has_flag: false
                    }
                    row.push(square);
                }
                lines.push(row);
            }
            layers.push(lines);
        }

        return layers;
    }

    revealBlock(layers: LayerSetData, x: number, y: number, z: number) {
        const block = layers[z][y][x]
        if(!block.revealed && !block.has_flag){
            block.revealed = true;
            if (block.value === 0) {
                for(let z_shift = -1; z_shift <= 1; z_shift ++) {
                    if (z + z_shift >= 0 && z + z_shift < this.state.layer_amount) {
                        for(let y_shift = -1; y_shift <= 1; y_shift ++) {
                            if (y + y_shift >= 0 && y + y_shift < this.state.height) {
                                for(let x_shift = -1; x_shift <= 1; x_shift ++) {
                                    if (x + x_shift >= 0 && x + x_shift < this.state.width) {
                                        layers = this.revealBlock(layers, x + x_shift, y + y_shift, z + z_shift)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        layers[z][y][x] = block;
        return layers;
    }

    getSquareCoordinates(button: HTMLElement) {
        const line = button.closest(".line");
        const layer = line?.closest(".layer");
        const board = layer?.closest(".layered-board");

        if (board === undefined)
            throw Error("Incorrect coordinates");
        
        const x = Array.prototype.indexOf.call(line!.children, button);
        const y = Array.prototype.indexOf.call(layer!.children, line);
        const z = Array.prototype.indexOf.call(board!.children, layer);
        return {x: x, y: y, z: z};
    }

    incrementTimer() {
        if(this.state.game_started && !this.state.game_over && !this.state.game_won)
        {
            const timer_function = window.setTimeout(this.incrementTimer.bind(this), 1000)
            let timer = this.state.timer;
            timer ++;

            this.setState({
                timer: timer,
                timer_function: timer_function,
            })
        }
    }

    handleMouseEnter(event: React.MouseEvent<HTMLButtonElement>) {
        const button = event.currentTarget;
        const button_coordinates = this.getSquareCoordinates(button);
        
        this.setState({
            hovered_coordinates: button_coordinates,
        })
    }

    handleLeftClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (!this.state.game_over && !this.state.game_won) {
            const button = event.currentTarget;
            const button_coordinates = this.getSquareCoordinates(button)
            const x = button_coordinates.x
            const y = button_coordinates.y
            const z = button_coordinates.z

            let layers = this.state.layers;

            let timer_function:number|null = this.state.timer_function;

            if(!this.state.game_started) {
                const avoid_coordinate = {x: x, y: y, z: z}

                layers = this.generateNewMap(this.state.width, this.state.height, this.state.layer_amount, this.state.mine_amount, avoid_coordinate)
                
                timer_function = window.setTimeout(this.incrementTimer.bind(this), 1000)
            }

            let game_over = false;
            let game_won = false;
            let restart_surprised = false;

            if(!layers[z][y][x].has_flag && !layers[z][y][x].revealed) {
                restart_surprised = true;
                setTimeout(this.removeSurprised.bind(this), 300)
                layers = this.revealBlock(layers, x,y,z);
                if (layers[z][y][x].value === "X") {
                    game_over = true;
                } else {
                    game_won = this.checkGameWon();
                }
                


                this.setState({
                    layers: layers,
                    game_started: true,
                    game_over: game_over,
                    game_won: game_won,
                    timer_function: timer_function,
                    restart_surprised: restart_surprised,
                })
            }
        }
    }

    updateGameSession(width: number, height: number, layer_amount: number, mine_amount: number) {
        const layers = this.getLayers(width, height, layer_amount)

        this.setState ({
            layers: layers,
            game_started: false,
            layer_amount: layer_amount,
            width: width,
            height: height,
            mine_amount: mine_amount,
            hovered_coordinates: {x:Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z:Number.NEGATIVE_INFINITY},
            game_over: false,
            game_won: false,
            flags_placed: 0,
            timer: 0,
            timer_function: null,
            restart_surprised: false,
        });
    }

    handleRightClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        
        if (this.state.game_started && !this.state.game_over  && !this.state.game_won) {
            const button = event.currentTarget;
            const button_coordinates = this.getSquareCoordinates(button)
            const x = button_coordinates.x
            const y = button_coordinates.y
            const z = button_coordinates.z

            let flags_placed = this.state.flags_placed;

            let layers = this.state.layers;
            if (!layers[z][y][x].revealed) {
                layers[z][y][x].has_flag = !layers[z][y][x].has_flag;
                flags_placed += (layers[z][y][x].has_flag?1:-1);
            }

            this.setState({
                layers: layers,
                flags_placed: flags_placed,
            })
        }
    }

    checkGameWon() {
        const layers = this.state.layers;
        if (this.state.game_started) {
            for(let z=0; z < layers.length; z++){
                for(let y=0; y < layers[z].length; y++){
                    for(let x=0; x < layers[z][y].length; x++){
                        if(!layers[z][y][x].revealed && layers[z][y][x].value !== "X"){
                            return false;
                        }
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

    render() {
        const flags_left = this.state.mine_amount - this.state.flags_placed;
        const restart_button_classes = "restart-button"
        + (this.state.game_over?" dead":"")
        + (this.state.game_won?" sunglasses":"")
        + (this.state.restart_surprised?" surprised":"")
        const timer = this.state.timer;
        const seconds = timer % 60;
        const minutes = Math.floor(this.state.timer/ 60)
        const timer_display = minutes + ":" + (seconds < 10?"0":"") + seconds
        return (
            <div className="minesweeper-3d">
                <GameConfig 
                        width={this.state.width}
                        height={this.state.height}
                        layer_amount={this.state.layer_amount}
                        mine_amount={this.state.mine_amount}
                        updateGameSession={(width:number, height: number, layer_amount: number, mine_amount: number) => this.updateGameSession(width, height, layer_amount, mine_amount)}
                />
                <div className="session">
                    <div className= "game-hud">
                        <div className= "flag-info">
                            <div className="flag-icon">Flags left:</div>
                            <span> {flags_left} </span>
                        </div>
                        <button className={restart_button_classes} onClick={(event) => this.handleRestartGame(event)}> Restart </button>
                        <div className="timer-display"> <span> {timer_display} </span> </div>
                    </div>
                    <div className= "layered-board">
                        <LayeredBoard 
                            layers={this.state.layers}
                            onLeftClick={(event:React.MouseEvent<HTMLButtonElement>) => this.handleLeftClick(event)}
                            onRightClick={(event:React.MouseEvent<HTMLButtonElement>) => this.handleRightClick(event)}
                            onMouseEnter={(event:React.MouseEvent<HTMLButtonElement>) => this.handleMouseEnter(event)}
                            hovered_coordinates={this.state.hovered_coordinates}
                            game_over={this.state.game_over}
                            game_won={this.state.game_won}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default GameSession;