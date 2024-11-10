import React, { useState } from 'react';
import './Login.css'; // Reuse the same CSS
import { registerUser } from '../api'; // Adjust this if necessary
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import default styling


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset error messages
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        // Step 1: Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        // Step 2: Validate password strength
        const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters long and contain at least one special character.');
            return;
        }

        // Step 3: Check if passwords match
        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match!');
            return;
        }

        // Step 4: Register the user if all validations pass
        try {
            setLoading(true);
            const response = await registerUser({ email, password });

            if (response.status === 201) {
                // Show success toast notification
                toast.success(
                    <div style={{ width: '400px'}}>
                        Registration successful!
                        <br />
                        Redirecting to login...
                    </div>,
                    {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    }
                );
                
                
                // Redirect to login page after a delay
                setTimeout(() => navigate('/'), 3000);
            } else {
                const data = await response.json();
                if (data.message) {
                    setEmailError(data.message);
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            setEmailError('Registration failed. Please try again.');
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
                            {emailError && <p className="error-message">{emailError}</p>}
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
                            {passwordError && <p className="error-message">{passwordError}</p>}
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
                            {confirmPasswordError && <p className="error-message">{confirmPasswordError}</p>}
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
            <ToastContainer /> {/* Toast container for displaying pop-up messages */}
        </div>
    );
};

export default Register;
