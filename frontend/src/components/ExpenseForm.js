import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseForm.css';

const ExpenseForm = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [createdAt, setCreatedAt] = useState(''); // New date field
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = [
        'Food',
        'Transport',
        'Entertainment',
        'Utilities',
        'Health',
        'Education',
        'Shopping',
        'Bills',
        'Rent',
        'Other'
      ];
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expense = { amount: Number(amount), category, createdAt, description };

    try {
      await axios.post('http://localhost:5000/api/expenses', expense, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAmount('');
      setCategory('');
      setCreatedAt('');
      setDescription('');
      console.log('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>Add Expense (in INR)</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (INR)"
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
        <input
          type="date"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          placeholder="Date"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (Optional)"
        />
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
};

export default ExpenseForm;
