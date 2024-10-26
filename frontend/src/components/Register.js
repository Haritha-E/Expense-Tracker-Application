import React, { useState } from 'react';
import './Login.css'; // Reuse the same CSS
import { registerUser } from '../api'; // Adjust the path if necessary

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await registerUser({ email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Registration successful!');
        onRegister();
      } else {
        throw new Error('No token returned');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
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
          <p>Register to start tracking your expenses.</p>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p>
            Already have an account? <a href="/">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
