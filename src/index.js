import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './images/Flag.png';
import './images/Mine.png';

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

        const classes = "square"
        + (revealed?" revealed":" hidden") 
        + (has_flag? " has_flag":" no_flag") 
        + (highlighted? " highlighted": "")
        + (value === "X" && revealed? " has_mine": "")
        + (even? " dark": " light")

        return(
            <button className={classes} onClick={this.props.onLeftClick} onContextMenu={this.props.onRightClick} onMouseEnter={this.props.onMouseEnter} > {this.renderButtonContent(revealed, value)} </button>
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

        const width = 10;
        const height = 10;
        const layer_amount = 5;
        const mine_amount = 25;

        const base_value = {
            revealed: false,
            value: 0,
            has_flag: false,
        }
        const layers = [...Array(layer_amount)].map(e => [...Array(height)].map(e => Array(width).fill(base_value)))

        this.state = {
            layers: layers,
            game_started: false,
            layer_amount: layer_amount,
            width: width,
            height: height,
            mine_amount: mine_amount,
            hovered_coordinates: {x:Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z:Number.NEGATIVE_INFINITY}
        }
    }

    checkCoordinateAvoided(mine_coordinate, avoid_coordinate) {
        for (let z = avoid_coordinate.z-1; z <= avoid_coordinate.z + 1; z ++) {
            for (let y = avoid_coordinate.y-1; y <= avoid_coordinate.y + 1; y ++) {
                for (let x = avoid_coordinate.x-1; x <= avoid_coordinate.x + 1; x ++) {
                    if(mine_coordinate.x == x && mine_coordinate.y == y && mine_coordinate.z == z) {
                        return false;
                    }
                }
            }
        }
        return true;
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
            if (block.value == "0") {
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

    handleMouseEnter(event) {
        const button = event.target;
        const button_coordinates = this.getSquareCoordinates(button)
        
        this.setState({
            hovered_coordinates: button_coordinates,
        })
    }

    handleLeftClick(event) {
        const button = event.target;
        const button_coordinates = this.getSquareCoordinates(button)
        const x = button_coordinates.x
        const y = button_coordinates.y
        const z = button_coordinates.z

        let layers = this.state.layers;

        if(!this.state.game_started) {
            const avoid_coordinate = {x: x, y: y, z: z}

            layers = this.generateNewMap(this.state.width, this.state.height, this.state.layer_amount, this.state.mine_amount, avoid_coordinate)
        }

        if(!layers[z][y][x].has_flag) {
            layers = this.revealBlock(layers, x,y,z);

            this.setState({
                layers: layers,
                game_started: true,
            })
        }
    }

    handleRightClick(event) {
        event.preventDefault();
        
        if (this.state.game_started) {
            const button = event.target;
            const button_coordinates = this.getSquareCoordinates(button)
            const x = button_coordinates.x
            const y = button_coordinates.y
            const z = button_coordinates.z

            let layers = this.state.layers;
            if (!layers[z][y][x].revealed) {
                layers[z][y][x].has_flag = !layers[z][y][x].has_flag;
            }

            this.setState({
                layers: layers,
            })
        }
    }

    render() {
        return (
            <div className="session">
                <div className= "layered-board">
                    <LayeredBoard 
                        layers={this.state.layers}
                        onLeftClick={event => this.handleLeftClick(event)}
                        onRightClick={event => this.handleRightClick(event)}
                        onMouseEnter={event => this.handleMouseEnter(event)}
                        hovered_coordinates={this.state.hovered_coordinates}
                    />
                </div>
            </div>
        )
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<GameSession />);