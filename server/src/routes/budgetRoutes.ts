import express, { Request, Response } from 'express';
import Budget, { IBudget } from '../models/Budget';

const router = express.Router();

// Get Budget for User
router.get('/:userId', async (req: Request, res: Response) => {
    try {
        let budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) {
            res.status(404).json({ message: "Budget not found" });
            return;
        }
        res.json(budget);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update Budget
router.post('/', async (req: Request, res: Response) => {
    const { userId, totalBudget, tripStartDate, tripEndDate } = req.body;
    try {
        let budget = await Budget.findOne({ userId });
        if (budget) {
            budget.totalBudget = totalBudget;
            budget.tripStartDate = tripStartDate;
            budget.tripEndDate = tripEndDate;
            await budget.save();
        } else {
            budget = new Budget({ userId, totalBudget, tripStartDate, tripEndDate });
            await budget.save();
        }
        res.json(budget);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Add Expense
router.post('/:userId/expenses', async (req: Request, res: Response) => {
    const { category, amount, description, date } = req.body;
    try {
        const budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) {
            res.status(404).json({ message: "Budget not found" });
            return;
        }

        // @ts-ignore
        budget.expenses.push({ category, amount, description, date });
        await budget.save();
        res.json(budget);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Expense
router.delete('/:userId/expenses/:expenseId', async (req: Request, res: Response) => {
    try {
        const budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) {
            res.status(404).json({ message: "Budget not found" });
            return;
        }

        budget.expenses = budget.expenses.filter(exp => exp._id && exp._id.toString() !== req.params.expenseId);
        await budget.save();
        res.json(budget);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
