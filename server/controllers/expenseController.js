const Expense = require("../models/Expense");

exports.getExpenses = async (req, res) => {
  try {
    const { tripId } = req.query;
    const query = { userId: req.user.id };
    if (tripId) query.tripId = tripId;

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOne({ _id: id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch expense" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { tripId, category, amount, description, title } = req.body;

    if (!tripId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const expense = new Expense({
      userId: req.user.id,
      tripId,
      title: title || description || "Untitled Expense",
      category: category || "Other",
      amount: Number(amount),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};
