import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      try {
        const response = await axios.get('http://localhost:5000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        });
        setExpenses(response.data); // Set expenses in state
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    console.log('Deleting expense with ID:', id); // Log the ID being deleted
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in headers
      });
      setExpenses(expenses.filter(expense => expense._id !== id)); // Update local state
      console.log('Expense deleted successfully'); // Log success message
    } catch (error) {
      console.error('Error deleting expense:', error.response ? error.response.data : error.message);
    }
  };

  const handleEdit = (expense) => {
    setCurrentExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    setCategory(expense.category);
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); // Get token from localStorage
    try {
      const updatedExpense = {
        description,
        amount: Number(amount), // Ensure amount is a number
        category,
      };
      await axios.put(`http://localhost:5000/api/expenses/${currentExpense._id}`, updatedExpense, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in headers
      }); // Send PUT request to update the expense

      // Update local state with the new expense data
      setExpenses(expenses.map(expense => 
        expense._id === currentExpense._id ? { ...expense, ...updatedExpense } : expense
      ));
      resetForm();
    } catch (error) {
      console.error('Error updating expense:', error.response ? error.response.data : error.message);
    }
  };

  const resetForm = () => {
    setCurrentExpense(null);
    setDescription('');
    setAmount('');
    setCategory('');
    setIsEditing(false);
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div>
      <h2>Your Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses added yet.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense._id}>
                  <td>{expense.description}</td>
                  <td>{expense.amount}</td>
                  <td>{expense.category}</td>
                  <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(expense)}>Update</button>
                    <button onClick={() => handleDelete(expense._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total Expenses: ${calculateTotalExpenses().toFixed(2)}</h3> {/* Display total expenses */}
        </>
      )}

      {isEditing && (
        <div>
          <h3>Update Expense</h3>
          <form onSubmit={handleUpdate}>
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
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
            <button type="submit">Update Expense</button>
            <button type="button" onClick={resetForm}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
