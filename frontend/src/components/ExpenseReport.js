import React from 'react';
import axios from 'axios';

const ExpenseReport = () => {
    const handleDownloadReport = async () => {
        const token = localStorage.getItem('token'); // Get the token from local storage
        console.log("Downloading report with token:", token); // Debug log
        try {
            const response = await axios.get('http://localhost:5000/api/expenses/report', {
                responseType: 'blob', // Important for Excel file download
                headers: {
                    Authorization: `Bearer ${token}` // Include token in request
                }
            });
            console.log("Report response:", response); // Debug log
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'expense_report.xlsx'); // File name for download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report', error);
            alert('Failed to download report. Please try again.'); // User feedback
        }
    };

    return (
        <div>
            <h2>Expense Report</h2>
            <button onClick={handleDownloadReport}>Download Excel Report</button>
        </div>
    );
};

export default ExpenseReport;
