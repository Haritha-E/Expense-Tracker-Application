import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseForm.css';

const API_URL = process.env.REACT_APP_API_URL;
const ExpenseForm = () => {
  const [transactionType, setTransactionType] = useState('Expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false); // State for success popup visibility

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = [
        'Food', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Education', 'Shopping',
        'Bills', 'Rent', 'Salary', 'Other'
      ];
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expense = { 
      transactionType, 
      amount: Number(amount), 
      category, 
      createdAt, 
      description 
    };

    try {
      await axios.post(`${API_URL}/expenses`, expense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTransactionType('Expense');
      setAmount('');
      setCategory('');
      setCreatedAt('');
      setDescription('');
      
      // Show success message for 3 seconds
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
      
      console.log('Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>Add Transaction (in INR)</h2>
      {successMessage && (
        <div className="success-popup">Transaction added successfully!</div>
      )}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Transaction Type</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            required
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount (INR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (INR)"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (Optional)"
          />
        </div>

        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
};

export default ExpenseForm;
