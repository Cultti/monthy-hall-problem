import {Document, model, Schema} from 'mongoose';

export interface IGameResultModel extends Document {
    answer: number
    result: boolean
    country: string
    created: Date
}

const GameResultSchema = new Schema({
    answer: Number,
    result: Boolean,
    country: String,
    created: {type: Date, default: Date.now}
});

export const GameResultModel = model<IGameResultModel>("GameResultModel", GameResultSchema);