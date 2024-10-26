// src/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Update this if you deploy to a different domain


export const registerUser = async (userData) => {
  return await axios.post('http://localhost:5000/api/register', userData); // Ensure the URL is correct
};


// Login user
export const loginUser = async (userData) => {
  return await axios.post(`${API_URL}/users/login`, userData);
};

// Fetch expenses
export const getExpenses = async (token) => {
  return await axios.get(`${API_URL}/expenses`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// Add expense
export const addExpense = async (expenseData, token) => {
  return await axios.post(`${API_URL}/expenses`, expenseData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};
