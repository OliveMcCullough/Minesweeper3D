import React from 'react';
import Layer from './layer';

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

export default LayeredBoard;