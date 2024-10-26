import React, { useState } from 'react';
import './Login.css';
import { loginUser } from '../api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('token', response.data.token); // Save token in localStorage
      localStorage.setItem('userId', response.data.userId); // Save userId in localStorage
      onLogin();
      alert('Login successful!');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src="https://moneyview.in/images/blog/wp-content/uploads/2017/10/Blog-11-reasonsfeature-min.jpg"
          alt="Expenses"
          className="login-image"
        />
        <div className="login-form">
          <h2>Expense Tracker</h2>
          <p>Welcome back! Please login to manage your expenses.</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p>
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
