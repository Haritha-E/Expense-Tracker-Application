import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Import jsPDF

const ExpenseReport = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      try {
        const response = await axios.get('http://localhost:5000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        });
        setExpenses(response.data); // Set expenses in state
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Expense Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Total Expenses: $${calculateTotalExpenses().toFixed(2)}`, 20, 30);
    
    // Add table headers
    doc.text("Description", 20, 50);
    doc.text("Amount", 100, 50);
    doc.text("Category", 140, 50);
    
    let y = 60;
    expenses.forEach(expense => {
      doc.text(expense.description, 20, y);
      doc.text(expense.amount.toString(), 100, y);
      doc.text(expense.category, 140, y);
      y += 10; // Move down for the next row
    });

    doc.save("expense_report.pdf"); // Save the PDF with a filename
  };

  return (
    <div>
      <h2>Expense Report</h2>
      {expenses.length === 0 ? (
        <p>No expenses to report.</p>
      ) : (
        <>
          <h3>Total Expenses: ${calculateTotalExpenses().toFixed(2)}</h3>
          <button onClick={generatePDF}>Generate PDF Report</button> {/* Button to generate PDF */}
        </>
      )}
    </div>
  );
};

export default ExpenseReport;
