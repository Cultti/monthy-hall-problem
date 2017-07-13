import * as express from 'express';
import * as bluebird from 'bluebird';
import * as mongoose from 'mongoose';

import {gameRouter} from './game/game.router';

export class Server {
    public app: express.Application;

    public static async bootstrap(): Promise<Server> {
        require('mongoose').Promise = bluebird;
        await mongoose.connect('mongodb://localhost/monthyhall');
        return new this();
    }

    constructor() {
        this.app = express();

        this.routes();
    }

    private routes() {
        this.app.use("/api/game", gameRouter);
    }
};