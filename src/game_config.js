import React from 'react';

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

export default GameConfig;