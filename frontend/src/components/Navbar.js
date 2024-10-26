import React from 'react';
import './Navbar.css'; // Add styling for the Navbar

const Navbar = ({ onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h2>Expense Tracker</h2>
      </div>
      <div className="navbar-links">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
