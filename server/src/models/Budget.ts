import mongoose, { Schema, Document } from 'mongoose';

const ExpenseSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transport', 'Lodging', 'Activities', 'Shopping', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export interface IBudget extends Document {
    userId: string;
    totalBudget: number;
    expenses: any[];
    tripStartDate?: Date;
    tripEndDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
    userId: {
        type: String, // Keeping as String to match external repo logic, though ObjectId is better
        required: true,
        unique: true
    },
    totalBudget: {
        type: Number,
        required: true
    },
    expenses: [ExpenseSchema],
    tripStartDate: {
        type: Date
    },
    tripEndDate: {
        type: Date
    }
}, { timestamps: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
