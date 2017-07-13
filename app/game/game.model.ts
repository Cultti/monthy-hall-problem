import {IGameResultModel, GameResultModel} from '../models/gameResult';
// import {redisClient} from '../helpers/redis';
import {redisClient} from '../helpers/redis';

export enum doorStatus {
    closed,
    open,
    selected,
    answer,
    selectedAnswer,
    selectedOpen
}

export interface IGame {
    doors: doorStatus[]
    selected: number
    result: boolean
    switched: boolean
}

export class Game implements IGame{
    public id: string
    private answer: number
    public doors: doorStatus[]
    public selected: number
    public switched: boolean
    public result: boolean

    public static new(): Game {
        return new this();
    }

    constructor(init: boolean = true) {
        if(!init)
            return;
        this.id = this.generateId();
        this.answer = this.getRandom(0, 2);
        this.doors = [doorStatus.closed, doorStatus.closed, doorStatus.closed];
        this.switched = false;
        this.selected = null;
        this.result = null;
    }

    public toJson(): string {
        return JSON.stringify({
            doors: this.doors,
            selected: this.selected,
            result: this.result
        });
    }

    public getGameState(): IGame {
        return {
            doors: this.doors,
            selected: this.selected,
            result: this.result,
            switched: this.switched
        };
    }

    public selectDoor(door: number): Promise<Game> {
        return new Promise<Game>((resolve, reject) => {
            if(this.selected) return reject('Door already selected');
            if(door < 0 || door > 2) return reject('Door out of range');

            this.selected = door;
            this.doors[door] = doorStatus.selected;

            // Open one door. The door can't be the answer or selected
            let selectAble = this.doors.map((val, i, arr) => { // Get keys
                return i;
            }).filter((val, i) => {
                return !(val === door || val === this.answer); // The door can't be selected or answer
            });
            
            this.doors[selectAble[this.getRandom(0,selectAble.length - 1)]] = doorStatus.open; // Set door that is not answer open

            resolve(this);
        });
    }

    public switchDoor(): Promise<Game> {
        return new Promise<Game>((resolve, reject) => {
            if(!this.selected) return reject('Door not selected');
            if(this.switched) return reject('Door already switched');

            this.doors[this.selected] = doorStatus.closed;

            let selectAble = this.doors.map((val, i, arr) => {
                return {
                    door: i,
                    doorStatus: val
                };
            }).filter((val, i, arr) => {
                if(val.door === this.selected) return false;
                return val.doorStatus === doorStatus.closed;
            }).map((val, i, arr) => {
                return val.door;
            });

            this.selected = selectAble[0];
            this.doors[this.selected] = doorStatus.selected;
            this.switched = true;

            resolve(this);
        });
    }

    public resolveGame(): Promise<Game> {
        return new Promise<Game>((resolve, reject) => {
            if(!(this.selected >= 0 && this.selected <= 2)) return reject('Door not selected');
            if(this.result) return reject('Result already given');
            
            if(this.selected === this.answer){
                this.result = true;
                this.doors = this.doors.map((val: doorStatus, i: number): doorStatus => {
                    if(i === this.selected) return doorStatus.selectedAnswer;
                    else if(i === this.answer) return doorStatus.answer;
                    else return doorStatus.open;
                });
            } else {
                this.result = false;
                this.doors[this.answer] = doorStatus.answer;
                this.doors[this.selected] = doorStatus.selectedOpen;
            }

            return resolve(this);
        });
    }

    public saveGameState(): Promise<Game> {
        return new Promise<Game>((resolve, reject) => {
            redisClient.set(this.id, JSON.stringify(this), (err) => {
                if(err)
                    return reject(err);
                return resolve(this);
            });
        });
    }

    public static async restoreGameState(id: string): Promise<Game> {
        return new Promise<Game>((resolve, reject) => {
            redisClient.get(id, (err, result) => {
                if(err || result === null)
                    return reject("Could not find game");
                let parsed: Game = JSON.parse(result);
                let game = new Game(false);
                
                game.id = parsed.id;
                game.answer = parsed.answer;
                game.doors = parsed.doors;
                game.switched = parsed.switched;
                game.selected = parsed.selected;
                game.result = parsed.result;

                resolve(game);
            });
        });
    }

    public saveGameResult(): Promise<IGameResultModel> {
        return new Promise<IGameResultModel>((resolve, reject) => {
            let gameResult = new GameResultModel();
            gameResult.answer = this.answer;
            gameResult.result = this.result;
            gameResult.save()
                .then(resolve)
                .catch(reject);
        });
    }

    private getRandom(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    private generateId(length: number = 10, cb?: Function): string {
        const chars = "ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz1234567";
        let id = "";
        for(let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return id;
    }
}