// src/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;


export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/register`, { // Adjust the URL as needed
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response; // Ensure you're returning the full response
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
