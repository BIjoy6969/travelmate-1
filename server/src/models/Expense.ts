import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
    userId: string;
    tripId: string;
    category: string;
    amount: number;
    description: string;
    date: Date;
}

const ExpenseSchema: Schema = new Schema({
    userId: { type: String, required: true },
    tripId: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
});

export default mongoose.model<IExpense>("Expense", ExpenseSchema);
