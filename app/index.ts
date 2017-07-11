require('mongoose').Promise = global.Promise;
import * as mongoose from 'mongoose';

// Connect to mongoose
mongoose.connect('mongodb://localhost/monthyhall').catch((err) => {
    console.log(err.message);
});

import {Game} from './models/game';

let i: number = 0;
let promises: Promise<Game>[] = Array();

let trues = 0;
let falses = 0;

while(i < 100000) {
    let gm = new Game();
    promises.push(gm.selectDoor(1)
        .then(() => gm.switchDoor())
        .then(() => gm.resolveGame()));
    i++;
}

Promise.all(promises).then((results: Game[]) => {
    let saves: Promise<void>[] = Array();

    results.forEach(result => {
        if(result.result) trues++;
        else falses++;

        saves.push(result.saveGameResult()
            .then(() => console.log('SAVED!'))
            .catch(console.log));
    });

    Promise.all(saves).then(() => console.log('ALL SAVED NOW'));

    console.log(trues + ' vs ' + falses);
});