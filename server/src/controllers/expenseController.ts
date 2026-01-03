import { Request, Response } from "express";
import Expense from "../models/Expense";

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const { userId, tripId } = req.query;
        const query: any = { userId };
        if (tripId) query.tripId = tripId;

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.json(expenses);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

export const getExpenseById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const expense = await Expense.findOne({ _id: id, userId });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(expense);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch expense" });
    }
};

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { userId, tripId, category, amount, description } = req.body;

        if (!userId || !tripId || !category || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const expense = new Expense({
            userId,
            tripId,
            category,
            amount: Number(amount),
            description: description || "",
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create expense" });
    }
};

export const updateExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        const updateData = req.body;

        const expense = await Expense.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(expense);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update expense" });
    }
};

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        const expense = await Expense.findOneAndDelete({ _id: id, userId });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json({ message: "Expense deleted successfully" });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete expense" });
    }
};
