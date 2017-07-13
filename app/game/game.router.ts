import {Router, Request} from 'express';
import {Game} from './game.model';
import * as jwt from '../helpers/jwt';


export const gameRouter = Router();

interface IGameRequest extends Request {
    game: IGameInfo
}

interface IGameInfo {
    gameId: string
}

gameRouter.use(async (req, res, next) => {
    if(req.originalUrl === "/api/game/new")
        return next();

    jwt.verify()(req, res, next);
});

gameRouter.post("/new", async (req, res) => {
    let game = new Game();
    game.saveGameState();
    
    let token = await jwt.sign({gameId: game.id});

    res.json({
        token: token,
        state: game.getGameState()
    });
});

gameRouter.get("/", async (req: IGameRequest, res) => {
    let game = await Game.restoreGameState(req.game.gameId);
    return res.json(game.getGameState());
});