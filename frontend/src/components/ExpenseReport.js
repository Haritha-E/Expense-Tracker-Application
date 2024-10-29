import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Import jsPDF library
import 'jspdf-autotable'; // Import autoTable plugin

const ExpenseReport = () => {
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/api/expenses', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExpenses(response.data);
            } catch (error) {
                console.error('Error fetching expenses:', error);
            }
        };
        fetchExpenses();
    }, []);

    // Function to download the Excel report
    const handleDownloadReport = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:5000/api/expenses/report', {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'expense_report.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report', error);
            alert('Failed to download report. Please try again.');
        }
    };

    // Function to generate PDF using jsPDF
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Expense Report", 14, 15);
        doc.setFontSize(12);

        // Table configuration for expenses
        const tableColumn = ["Description", "Amount ($)", "Category", "Date"];
        const tableRows = [];

        // Populate table rows with expense data
        expenses.forEach(expense => {
            const expenseData = [
                expense.description,
                expense.amount.toFixed(2),
                expense.category,
                new Date(expense.createdAt).toLocaleDateString(),
            ];
            tableRows.push(expenseData);
        });

        // Use autoTable plugin to generate the table
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            margin: { top: 10 },
            styles: { fontSize: 10 },
        });

        doc.save("expense_report.pdf");
    };

    return (
        <div>
            <h2>Expense Report</h2>
            {expenses.length === 0 ? (
                <p>No expenses to report.</p>
            ) : (
                <>
                    <h3>Total Expenses: ₹{expenses.reduce((total, expense) => total + expense.amount, 0).toFixed(2)}</h3>
                    <button onClick={handleDownloadReport}>Download Excel Report</button>
                    <button onClick={generatePDF}>Generate PDF Report</button>
                </>
            )}
        </div>
    );
};

export default ExpenseReport;
