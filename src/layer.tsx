import React from 'react';
import { Coordinate, LayerData } from './interfaces';
import Line from './line';

interface LayerProps {
    hovered_coordinates: Coordinate;
    lines: LayerData;
    onLeftClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onRightClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter:(event: React.MouseEvent<HTMLButtonElement>) => void;
    game_over: Boolean;
    game_won: Boolean;
    highlighted: Boolean;
}

class Layer extends React.Component<LayerProps> {
    renderLine(i: number) {
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

export default Layer;