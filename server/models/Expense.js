import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema({
  userId: String,
  tripId: String,
  category: String,
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Expense", ExpenseSchema);

