const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Create an instance of Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


// Define the port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
