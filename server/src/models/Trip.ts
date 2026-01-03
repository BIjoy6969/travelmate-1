import mongoose, { Document, Schema } from "mongoose";

export interface ITrip extends Document {
    userId?: mongoose.Types.ObjectId;
    title: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    type: string;
    createdAt: Date;
    updatedAt: Date;
}

const tripSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        destination: {
            type: String,
            required: true,
            trim: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        type: {
            type: String,
            default: "Leisure",
            trim: true,
        },
    },
    { timestamps: true }
);

const Trip = mongoose.models.Trip || mongoose.model<ITrip>("Trip", tripSchema);

export default Trip;
