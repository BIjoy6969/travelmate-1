import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
    user: mongoose.Types.ObjectId;
    destination: string;
    startDate: Date;
    endDate: Date;
    tripType: 'solo' | 'couple' | 'family' | 'friends' | 'business' | 'other';
    notes?: string;
    createdAt: Date;
}

const TripSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tripType: { 
        type: String, 
        enum: ['solo', 'couple', 'family', 'friends', 'business', 'other'], 
        required: true 
    },
    notes: { type: String }
}, { timestamps: true });

export default mongoose.model<ITrip>('Trip', TripSchema);
