import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

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

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Expense Report", 14, 15);
        doc.setFontSize(12);

        const tableColumn = ["Description", "Amount (₹)", "Category", "Date"];
        const tableRows = [];

        expenses.forEach(expense => {
            const expenseData = [
                expense.description,
                `₹${expense.amount.toFixed(2)}`,
                expense.category,
                new Date(expense.createdAt).toLocaleDateString(),
            ];
            tableRows.push(expenseData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            margin: { top: 10 },
            styles: { fontSize: 10 },
        });

        return doc.output('datauristring'); // Get PDF data as a data URI
    };

    const handleDownloadPDF = () => {
        const pdfData = generatePDF();
        const link = document.createElement('a');
        link.href = pdfData;
        link.setAttribute('download', 'expense_report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcel = async () => {
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
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'expense_report.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportToMail = async () => {
        const token = localStorage.getItem('token');
        const pdfData = await generatePDF(); // Generate PDF data

        try {
            const response = await axios.post('http://localhost:5000/api/expenses/export-to-mail', 
                { pdfData: pdfData.split(',')[1] }, // Send only the base64 part
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            alert(response.data.message);
        } catch (error) {
            console.error('Error exporting report to email:', error);
            alert('Failed to send report to email. Please try again.');
        }
    };

    return (
        <div>
            <h2>Expense Report</h2>
            <button onClick={handleDownloadPDF}>Download PDF Report</button>
            <button onClick={handleDownloadExcel}>Download Excel Report</button>
            <button onClick={handleExportToMail}>Send Report to Email</button>
        </div>
    );
};

export default ExpenseReport;
