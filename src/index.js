import React from 'react';
import ReactDOM from 'react-dom/client';

import GameSession from './game_session';

import './index.css';
import './images/Flag.png';
import './images/Mine.png';
import './images/NoMine.png';
import './images/Smiley.png';
import './images/Dead.png';
import './images/Sunglasses.png';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <GameSession
        width={10}
        height={10}
        layer_amount={5}
        mine_amount={30}
    />
);