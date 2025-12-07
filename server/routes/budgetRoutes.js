const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// Get Budget for User
router.get('/:userId', async (req, res) => {
    try {
        let budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update Budget
router.post('/', async (req, res) => {
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
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add Expense
router.post('/:userId/expenses', async (req, res) => {
    const { category, amount, description, date } = req.body;
    try {
        const budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        budget.expenses.push({ category, amount, description, date });
        await budget.save();
        res.json(budget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete Expense
router.delete('/:userId/expenses/:expenseId', async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.params.userId });
        if (!budget) return res.status(404).json({ message: "Budget not found" });

        budget.expenses = budget.expenses.filter(exp => exp._id.toString() !== req.params.expenseId);
        await budget.save();
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
