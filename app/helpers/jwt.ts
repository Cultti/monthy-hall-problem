import * as jwt from 'jsonwebtoken';
import * as config from 'config';
import * as fs from 'fs';
import * as expressJWT from 'express-jwt';

const pub = fs.readFileSync(config.get("jwt.public"));
const priv = fs.readFileSync(config.get("jwt.private"));

export interface IJWTGame {
    gameId: string
}

export async function sign(payload: IJWTGame): Promise<String> {
    return jwt.sign(payload, priv, {expiresIn: "15min", algorithm: "RS256"})
}

export function verify(): expressJWT.RequestHandler  {
    return expressJWT({secret: pub, userProperty: "game"});
}