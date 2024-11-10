import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseReport from './components/ExpenseReport';
import Login from './components/Login';
import Register from './components/Register';
import './App.css'; // Import the styling

const App = () => {
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('token') ? true : false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleRegister = () => {
    alert("Registration successful! Please log in.");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('token'); // Clear the token on logout
    localStorage.removeItem('userId'); // Clear userId on logout
  };

  return (
    <Router>
      <ToastContainer />  
      <Routes>
        <Route path="/" element={loggedIn ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        {/* Protected routes */}
        <Route path="/home" element={
          loggedIn ? (
            <div>
              <Navbar onLogout={handleLogout} />
              <div className="homepage">
                <div className="card">
                  <Link to="/add-expense">
                    <img src="https://t3.ftcdn.net/jpg/00/79/57/02/360_F_79570227_8hAFZ2EWXLq8kpjLqQXNmiAh4Fql8rI7.jpg" alt="Add Transaction" style={{ width: '100%', height: 'auto' }} />
                    <h3>Add Transaction</h3>
                    <button>Add Transaction</button>
                  </Link>
                </div>
                <div className="card">
                  <Link to="/list-expenses">
                    <img src="https://images.pexels.com/photos/6963017/pexels-photo-6963017.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Expense List" style={{ width: '100%', height: 'auto' }} />
                    <h3>Expense List</h3>
                    <button>View List</button>
                  </Link>
                </div>
                <div className="card">
                  <Link to="/expense-report">
                    <img src="https://png.pngtree.com/thumb_back/fh260/background/20220313/pngtree-business-financial-report-data-analysis-table-image_1059516.jpg" alt="Expense Report" style={{ width: '100%', height: 'auto' }} />
                    <h3>Expense Report</h3>
                    <button>View Report</button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/add-expense" element={
          loggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <ExpenseForm />
            </>
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/list-expenses" element={
          loggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <ExpenseList />
            </>
          ) : (
            <Navigate to="/" />
          )
        } />

        <Route path="/expense-report" element={
          loggedIn ? (
            <>
              <Navbar onLogout={handleLogout} />
              <ExpenseReport />
            </>
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;
