import {Game} from './models/game';

let i: number = 0;
let promises: Promise<Game>[] = Array();

let trues = 0;
let falses = 0;

while(i < 10000) {
    let gm = new Game();
    promises.push(gm.selectDoor(1)
        .then(() => { return gm.switchDoor() })
        .then(() => { return gm.resolveGame() }));
    i++;
}

Promise.all(promises).then((results: Game[]) => {
    results.forEach(result => {
        if(result.result) trues++;
        else falses++;
    });

    console.log(trues + ' vs ' + falses);
});