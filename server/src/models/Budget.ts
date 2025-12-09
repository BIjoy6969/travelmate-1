import mongoose, { Document, Schema } from 'mongoose';

interface IExpense {
    category: 'Food' | 'Transport' | 'Lodging' | 'Activities' | 'Shopping' | 'Other';
    amount: number;
    description?: string;
    date: Date;
    _id?: mongoose.Types.ObjectId;
}

export interface IBudget extends Document {
    userId: string;
    totalBudget: number;
    expenses: IExpense[];
    tripStartDate?: Date;
    tripEndDate?: Date;
}

const ExpenseSchema: Schema = new Schema({
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

const BudgetSchema: Schema = new Schema({
    userId: {
        type: String,
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
