const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
      req.user = user; // Attach user info to req object
      next();
    });
  } else {
    return res.status(403).json({ message: 'Unauthorized' });
  }
};

// Create a new expense
router.post('/', isAuthenticated, async (req, res) => {
  const { amount, category, createdAt, description } = req.body;
  const userId = req.user.id;

  if (!createdAt) {
    return res.status(400).json({ message: 'Date is required for an expense.' });
  }

  try {
    const newExpense = new Expense({ userId, amount, category, createdAt, description });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: 'Error creating expense', error: err.message });
  }
});

// Get all expenses for a user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
});

// Update an expense by ID
router.put('/:id', isAuthenticated, async (req, res) => {
  const { amount, category, createdAt, description } = req.body;

  if (!createdAt) {
    return res.status(400).json({ message: 'Date is required for updating an expense.' });
  }

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, createdAt, description },
      { new: true }
    );
    res.status(200).json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Error updating expense', error: err.message });
  }
});

// Delete an expense by ID
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
});

module.exports = router;
