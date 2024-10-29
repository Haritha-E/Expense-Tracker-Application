const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    required: true, // Updated to make the date required and set by the user
  },
  description: {
    type: String,
    required: false,
  }
});

module.exports = mongoose.model('Expense', expenseSchema);
