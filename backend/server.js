const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');
const Expense = require('./models/Expense'); // Import the Expense model
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

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
      req.user = user; // Attach user info to req object
      next();
    });
  } else {
    return res.status(403).json({ message: 'Unauthorized' });
  }
};

// Endpoint to generate Excel report
app.get('/api/expenses/report', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }); // Fetch expenses for the logged-in user

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expenses');

    // Add column headers
    worksheet.columns = [
      { header: 'Description', key: 'description' },
      { header: 'Amount', key: 'amount' },
      { header: 'Category', key: 'category' },
      { header: 'Date', key: 'date' }
    ];

    // Add rows to the worksheet
    expenses.forEach(expense => {
      worksheet.addRow({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.createdAt).toLocaleDateString(),
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=expense_report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
