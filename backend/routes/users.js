const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import the jwt package
const User = require('../models/User'); // Assuming a User model is defined

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message }); // Send detailed error message
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body; // Change from username to email

  try {
    const user = await User.findOne({ email }); // Change from username to email
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token: token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});


module.exports = router;
