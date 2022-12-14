import React from 'react';
import { SquareValue } from './interfaces';

interface SquareProps {
    revealed: Boolean;
    has_flag:Boolean;
    highlighted:Boolean;
    value:SquareValue;
    even:Boolean;
    game_over:Boolean;
    game_won:Boolean;
    onLeftClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onRightClick:(event: React.MouseEvent<HTMLButtonElement>) => void;
    onMouseEnter:(event: React.MouseEvent<HTMLButtonElement>) => void;
}

class Square extends React.Component<SquareProps> {
    preventContextMenu (event:React.MouseEvent) {
        event.preventDefault();
    }

    renderButtonContent(revealed: Boolean, value: SquareValue) {
        if (!revealed || value === 0 || value === "X"){
            return null;
        } else {
            const value_to_colour_dict:{[key:number]:string} = {
                1: "blue_text",
                2: "green_text",
                3: "red_text",
                4: "dark_blue_text",
                5: "dark_red_text",
                6: "turquoise_text"
            };
            let text_class:string;
            if (value>= 7) {
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

export default Square;