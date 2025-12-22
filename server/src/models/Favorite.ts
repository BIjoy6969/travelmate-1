import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
    userId: string;
    destinationId: string;
    name: string;
    image?: string;
    location?: string;
    notes?: string;
    createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    destinationId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    location: {
        type: String
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
