import React from 'react';
import Square from './square';

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

export default Line;