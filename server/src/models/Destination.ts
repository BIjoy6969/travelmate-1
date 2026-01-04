import mongoose, { Document, Schema } from 'mongoose';

export interface IDestination extends Document {
    user: mongoose.Schema.Types.ObjectId;
    place_id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
}

const DestinationSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    place_id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    lat: {
        type: Number,
        required: true,
    },
    lng: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});

const Destination = mongoose.model<IDestination>('Destination', DestinationSchema);

export default Destination;
