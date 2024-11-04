const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit'); // Import PDFKit
const jwt = require('jsonwebtoken');
const Expense = require('./models/Expense'); // Import the Expense model
const nodemailer = require('nodemailer');

require('dotenv').config();

// Create an instance of Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit to handle PDF Blob
app.use(bodyParser.urlencoded({ extended: true })); // To handle URL encoded data

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
      req.user = user; // Ensure user object includes email
      next();
    });
  } else {
    return res.status(403).json({ message: 'Unauthorized' });
  }
};


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Endpoint to export expenses report to email
app.post('/api/expenses/export-to-mail', isAuthenticated, async (req, res) => {
  try {
    if (!req.user.email) {
      return res.status(400).json({ message: 'User email is not defined' });
    }
    const { pdfData } = req.body; // Get PDF data from the request

    // Send Email with PDF Attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email, // Use the logged-in user's email
      subject: 'Your Expense Report',
      text: 'Please find your expense report in the attachment.',
      attachments: [
        {
          filename: 'expense_report.pdf',
          content: Buffer.from(pdfData, 'base64'), // Convert base64 string to buffer
          contentType: 'application/pdf',
        },
      ],
    });

    res.status(200).json({ message: 'Report sent to email successfully!' });
  } catch (error) {
    console.error('Error sending report via email:', error);
    res.status(500).json({ message: `Error sending report via email: ${error.message}` });
  }
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
