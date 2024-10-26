import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseForm.css'; // Import the CSS file for styling

const ExpenseForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User is not logged in.');
      return;
    }

    const expense = { userId, description, amount: Number(amount), category }; // Ensure amount is a number

    try {
      await axios.post('http://localhost:5000/api/expenses', expense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDescription('');
      setAmount('');
      setCategory('');
      console.log('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>Add Expense</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
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
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
};

export default ExpenseForm;
