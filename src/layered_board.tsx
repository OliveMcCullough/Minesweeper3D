import React from 'react';
import { Coordinate, LayerSetData } from './interfaces';
import Layer from './layer';

interface LayeredBoardProps {
    hovered_coordinates: Coordinate;
    layers: LayerSetData;
    onLeftClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onRightClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter:(event: React.MouseEvent<HTMLButtonElement>) => void;
    game_over: Boolean;
    game_won: Boolean;
}

class LayeredBoard extends React.Component<LayeredBoardProps> {
    renderLayer (i: number) {
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

export default LayeredBoard;