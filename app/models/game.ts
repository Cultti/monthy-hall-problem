import {IGameResultModel, GameResultModel} from './gameResult';

export enum doorStatus {
    closed,
    open,
    selected,
    answer,
    selectedAnswer,
    selectedOpen
}

export class Game {
    public id: string
    private answer: number
    private doors: doorStatus[]
    public selected: number
    public switched: boolean
    public result: boolean

    public static new(): Game {
        return new this();
    }

    constructor() {
        this.id = this.generateId();
        this.answer = this.getRandom(0, 2);
        this.doors = [doorStatus.closed, doorStatus.closed, doorStatus.closed];
        this.switched = false;
    }

    public toJson(): string {
        return JSON.stringify({
            doors: this.doors,
            selected: this.selected,
            result: this.result
        });
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