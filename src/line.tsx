import React from 'react';
import { Coordinate, LineData } from './interfaces';
import Square from './square';

interface LineProps {
    hovered_coordinates: Coordinate;
    squares: LineData;
    onLeftClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onRightClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter:(event: React.MouseEvent<HTMLButtonElement>) => void;
    game_over: Boolean;
    game_won: Boolean;
    highlighted: Boolean;
    even_line: Boolean;
}

class Line extends React.Component<LineProps> {
    renderSquare(i: number) {
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

export default Line;