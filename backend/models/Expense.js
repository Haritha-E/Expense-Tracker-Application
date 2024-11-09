const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transactionType: {
    type: String,
    enum: ['Expense', 'Income'], // New field to differentiate between Expense and Income
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true, // User-provided date for transaction
  },
  description: {
    type: String,
    required: false,
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
