import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    userId: string;
    targetId: string;
    rating: number;
    categories: {
        cleanliness?: number;
        location?: number;
        service?: number;
        value?: number;
    };
    comment: string;
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true
    },
    targetId: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    categories: {
        cleanliness: { type: Number, min: 1, max: 5 },
        location: { type: Number, min: 1, max: 5 },
        service: { type: Number, min: 1, max: 5 },
        value: { type: Number, min: 1, max: 5 }
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
