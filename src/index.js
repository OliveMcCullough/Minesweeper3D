import React, {Fragment} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './images/Flag.png';
import './images/Mine.png';
import './images/NoMine.png';
import './images/Smiley.png';
import './images/Dead.png';
import './images/Sunglasses.png';

class Square extends React.Component {
    preventContextMenu (event) {
        event.preventDefault();
    }

    renderButtonContent(revealed, value) {
        if (!revealed || value === "0" || value === "X"){
            return null;
        } else {
            const value_to_colour_dict = {
                "1": "blue_text",
                "2": "green_text",
                "3": "red_text",
                "4": "dark_blue_text",
                "5": "dark_red_text",
                "6": "turquoise_text"
            };
            let text_class;
            if (parseInt(value)>= 7) {
                text_class = "black_text";
            } else {
                text_class = value_to_colour_dict[value];
            }

            return (
                <span className={text_class}> {value} </span>
            )
        }
    }

    render () {
        const revealed = this.props.revealed;
        const has_flag = this.props.has_flag;
        const highlighted = this.props.highlighted;
        const value = this.props.value;
        const even = this.props.even;
        const game_over = this.props.game_over;

        const classes = "square"
        + (revealed?" revealed":" hidden") 
        + (has_flag? " has_flag":" no_flag") 
        + (highlighted? " highlighted": "")
        + (value === "X" && (revealed || game_over)? " has_mine": "")
        + (even? " dark": " light")
        + ((value !== "X" && has_flag && game_over)?" has_no_mine":"")

        return(
            <button 
                className={classes} 
                onClick={this.props.onLeftClick} 
                onContextMenu={this.props.onRightClick} 
                onMouseEnter={this.props.onMouseEnter} 
            > 
                {this.renderButtonContent(revealed, value)} 
            </button>
        )
    }
}

class Line extends React.Component {
    renderSquare(i) {
        const square = this.props.squares[i];
        const value = square.value;
        const revealed = square.revealed;
        const has_flag = square.has_flag;
        const hovered_coordinates = this.props.hovered_coordinates;
        const highlighted = (i >= hovered_coordinates.x - 1 && i <= hovered_coordinates.x + 1) && this.props.highlighted;
        const even_line = this.props.even_line;
        const even = ((i + (even_line?0:1)) % 2 === 0)
        return (
            <Square
                key = {i}
                value={value}
                revealed={revealed}
                has_flag={has_flag}
                onLeftClick={this.props.onLeftClick}
                onRightClick={this.props.onRightClick}
                onMouseEnter={this.props.onMouseEnter}
                highlighted={highlighted}
                even={even}
                game_over={this.props.game_over}
                game_won={this.props.game_won}
            />
        );
    }

    render() {
        const squares = this.props.squares
        const line = squares.map((square, index) => {
            return (
                this.renderSquare(index)
            )
        })
        return(
            line
        )
    }
}

class Layer extends React.Component {
    renderLine(i) {
        const hovered_coordinates = this.props.hovered_coordinates;
        const highlighted = (i >= hovered_coordinates.y - 1 && i <= hovered_coordinates.y + 1) && this.props.highlighted;
        const even_line = (i  % 2 === 0)
        return (
            <div className="line" key={i}>
                <Line
                    squares={this.props.lines[i]}
                    onLeftClick={this.props.onLeftClick}
                    onRightClick={this.props.onRightClick}
                    onMouseEnter={this.props.onMouseEnter}
                    hovered_coordinates={this.props.hovered_coordinates}
                    highlighted={highlighted}
                    even_line={even_line}
                    game_over={this.props.game_over}
                    game_won={this.props.game_won}
                />
            </div>
        );
    }

    render() {
        const lines = this.props.lines
        const layer = lines.map((line, index) => {
            return (
                this.renderLine(index)
            )
        })
        return (
            layer
        )
    }
}

class LayeredBoard extends React.Component {
    renderLayer (i) {
        const hovered_coordinates = this.props.hovered_coordinates;
        const highlighted = (i >= hovered_coordinates.z - 1 && i <= hovered_coordinates.z + 1);
        return (
            <div className="layer" key={i}>
                <Layer
                    lines={this.props.layers[i]}
                    onLeftClick={this.props.onLeftClick}
                    onRightClick={this.props.onRightClick}
                    onMouseEnter={this.props.onMouseEnter}
                    hovered_coordinates={this.props.hovered_coordinates}
                    highlighted={highlighted}
                    game_over={this.props.game_over}
                    game_won={this.props.game_won}
                />
            </div>
        );
    }

    render () {
        const layers = this.props.layers
        const board =  layers.map((layer, index) => {
            return (
                this.renderLayer(index)
            )
        });
        return (
            board
        )
    }
}

class GameSession extends React.Component {
    constructor(props) {
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

    getLayers(width, height, layer_amount) {
        const base_value = {
            revealed: false,
            value: "0",
            has_flag: false,
        }
        const layers = [...Array(layer_amount)].map(e => [...Array(height)].map(e => Array(width).fill(base_value)))
        return layers;
    }

    checkCoordinateAvoided(mine_coordinate, avoid_coordinate) {
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

    handleRestartGame(event) {
        const width = this.state.width;
        const height = this.state.height;
        const layer_amount = this.state.layer_amount;

        const layers = this.getLayers(width, height, layer_amount);

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

    generateMineCoordinates(width, height, layer_amount, mine_amount, avoid_coordinate) {
        const mine_coordinates = []
        for(let i = 0; i < mine_amount; i++) {
            let mine_coordinate;
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

    getCoordValue(x, y, z, mine_coordinates, width, height, layer_amount) {
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
            return amount_surrounding_mines.toString();
        }
    }

    generateNewMap(width, height, layer_amount, mine_amount, avoid_coordinate) {
        const mine_coordinates = this.generateMineCoordinates(width, height, layer_amount, mine_amount, avoid_coordinate);

        const layers = []
        for(let z = 0; z < this.state.layer_amount; z++){
            let lines = []
            for(let y = 0; y < this.state.height; y++){
                let row = [];
                for(let x = 0; x < width; x++){
                    let value = this.getCoordValue(x, y, z, mine_coordinates, width, height, layer_amount);
                    let square = {
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

    revealBlock(layers, x, y, z) {
        const block = layers[z][y][x]
        if(!block.revealed && !block.has_flag){
            block.revealed = true;
            if (block.value === "0") {
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

    getSquareCoordinates(button) {
        const line = button.closest(".line")
        const layer = line.closest(".layer")
        const board = layer.closest(".layered-board")
        
        const x = Array.prototype.indexOf.call(line.children, button);
        const y = Array.prototype.indexOf.call(layer.children, line);
        const z = Array.prototype.indexOf.call(board.children, layer);
        return {x: x, y: y, z: z};
    }

    incrementTimer() {
        if(this.state.game_started && !this.state.game_over && !this.state.game_won)
        {
            const timer_function = setTimeout(this.incrementTimer.bind(this), 1000)
            let timer = this.state.timer;
            timer ++;

            this.setState({
                timer: timer,
                timer_function: timer_function,
            })
        }
    }

    handleMouseEnter(event) {
        const button = event.target;
        const button_coordinates = this.getSquareCoordinates(button)
        
        this.setState({
            hovered_coordinates: button_coordinates,
        })
    }

    handleLeftClick(event) {
        if (!this.state.game_over && !this.state.game_won) {
            const button = event.target;
            const button_coordinates = this.getSquareCoordinates(button)
            const x = button_coordinates.x
            const y = button_coordinates.y
            const z = button_coordinates.z

            let layers = this.state.layers;

            let timer_function = this.state.timer_function;

            if(!this.state.game_started) {
                const avoid_coordinate = {x: x, y: y, z: z}

                layers = this.generateNewMap(this.state.width, this.state.height, this.state.layer_amount, this.state.mine_amount, avoid_coordinate)
                
                timer_function = setTimeout(this.incrementTimer.bind(this), 1000)
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

    updateGameSession(width, height, layer_amount, mine_amount) {
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

    handleRightClick(event) {
        event.preventDefault();
        
        if (this.state.game_started && !this.state.game_over  && !this.state.game_won) {
            const button = event.target;
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
                        updateGameSession={(width, height, layer_amount, mine_amount) => this.updateGameSession(width, height, layer_amount, mine_amount)}
                />
                <div className="session">
                    <div className= "game-hud">
                        <div className= "flag-info">
                            <div className="flag-icon">Flags left:</div>
                            <span> {flags_left} </span>
                        </div>
                        <button className={restart_button_classes} onClick={event => this.handleRestartGame(event)}> Restart </button>
                        <div className="timer-display"> <span> {timer_display} </span> </div>
                    </div>
                    <div className= "layered-board">
                        <LayeredBoard 
                            layers={this.state.layers}
                            onLeftClick={event => this.handleLeftClick(event)}
                            onRightClick={event => this.handleRightClick(event)}
                            onMouseEnter={event => this.handleMouseEnter(event)}
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

class GameConfig extends React.Component {
    constructor(props) {
        super(props)

        const width = this.props.width;
        const height = this.props.height;
        const layer_amount = this.props.layer_amount;
        const mine_amount = this.props.mine_amount;

        this.state = {
            layer_amount: layer_amount,
            height: height,
            width: width,
            mine_amount: mine_amount,
            config_valid: true,
        }
    }

    checkConfigValid(layer_amount, height, width, mine_amount) {
        const square_amount = layer_amount * height * width;
        const max_remaining_squares_first_go = square_amount - 27;

        const maximum_mine_rate = 0.18;
        const maximum_mines = max_remaining_squares_first_go * maximum_mine_rate;

        const area = height * width;
        const max_area = 300;

        if(isNaN(layer_amount) || isNaN(height) || isNaN(width) || isNaN(mine_amount)) {
            return false;
        }

        if(layer_amount === 2 || layer_amount <= 0 || height< 5 || width < 5 || mine_amount < 5) {
            return false;
        }
        
        if(layer_amount > 10 || height > 30 || width > 30) {
            return false;
        }

        if(area > max_area) {
            return false;
        }

        if(mine_amount > maximum_mines) {
            return false;
        }

        console.log(mine_amount / max_remaining_squares_first_go);

        return true;
    }

    updateWidthValue(event) {
        const layer_amount = parseInt(this.state.layer_amount);
        const height = parseInt(this.state.height);
        const width = parseInt(event.target.value);
        const mine_amount = parseInt(this.state.mine_amount);

        const config_valid = this.checkConfigValid(layer_amount, height, width, mine_amount)
        this.setState({
            width: width,
            config_valid: config_valid
        })
    }

    updateHeightValue(event) {
        const layer_amount = parseInt(this.state.layer_amount);
        const height = parseInt(event.target.value);
        const width = parseInt(this.state.width);
        const mine_amount = parseInt(this.state.mine_amount);

        const config_valid = this.checkConfigValid(layer_amount, parseInt(height), width, mine_amount)
        this.setState({
            height: height,
            config_valid: config_valid
        })
    }

    updateLayerAmountValue(event) {
        const layer_amount = parseInt(event.target.value);
        const height = parseInt(this.state.height);
        const width = parseInt(this.state.width);
        const mine_amount = parseInt(this.state.mine_amount);

        const config_valid = this.checkConfigValid(parseInt(layer_amount), height, width, mine_amount)
        this.setState({
            layer_amount: layer_amount,
            config_valid: config_valid
        })
    }

    updateMineAmountValue(event) {        
        const layer_amount = parseInt(this.state.layer_amount);
        const height = parseInt(this.state.height);
        const width = parseInt(this.state.width);
        const mine_amount = parseInt(event.target.value);

        const config_valid = this.checkConfigValid(layer_amount, height, width, parseInt(mine_amount))
        this.setState({
            mine_amount: mine_amount,
            config_valid: config_valid
        })
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const width = parseInt(this.state.width)
        const height = parseInt(this.state.height)
        const layer_amount = parseInt(this.state.layer_amount)
        const mine_amount = parseInt(this.state.mine_amount)
        if(this.checkConfigValid(layer_amount, height, width, mine_amount))
            this.props.updateGameSession(this.state.width, this.state.height, this.state.layer_amount, this.state.mine_amount);
    }

    render () {
        const button_inactive = !this.state.config_valid;
        return(
            <form className="game-config" onSubmit={(event) => this.handleFormSubmit(event)}>
                <ul>
                    <li>
                        <label htmlFor="width_id">Width:</label> 
                        <input
                            id="width_id" 
                            type="number" 
                            value={this.state.width}
                            min="5"
                            onChange={event => this.updateWidthValue(event)}
                        />
                    </li>
                    <li>
                        <label htmlFor="height_id">Height:</label> 
                        <input
                            id="height_id" 
                            type="number" 
                            value={this.state.height}
                            min="5"
                            onChange={event => this.updateHeightValue(event)}
                        />
                    </li>
                    <li>
                        <label htmlFor="layer_amount_id">Depth:</label> 
                        <input 
                            id="layer_amount_id" 
                            type="number"
                            min="1"
                            value={this.state.layer_amount}
                            onChange={event => this.updateLayerAmountValue(event)}
                        />
                    </li>
                    <li>
                        <label htmlFor="mine_amount_id">Mines:</label> 
                        <input 
                            id="mine_amount_id" 
                            type="number" 
                            min="5"
                            value={this.state.mine_amount}
                            onChange={event => this.updateMineAmountValue(event)}
                        />
                    </li>
                    <li>
                        <button disabled={button_inactive}>
                            Apply 
                        </button>
                    </li>
                </ul>
            </form>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <GameSession
        width={10}
        height={10}
        layer_amount={5}
        mine_amount={30}
    />
);