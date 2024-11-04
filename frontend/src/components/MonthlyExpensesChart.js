import React from 'react';
import { Bar } from 'react-chartjs-2';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyExpensesChart = ({ expenses, selectedYear }) => {
    const monthlyData = Array(12).fill(0); // Initialize an array for 12 months

    // Filter expenses by the selected year
    const filteredExpenses = expenses.filter(expense => 
        new Date(expense.createdAt).getFullYear() === parseInt(selectedYear)
    );

    filteredExpenses.forEach(expense => {
        const monthIndex = new Date(expense.createdAt).getMonth();
        monthlyData[monthIndex] += expense.amount; // Sum up expenses by month
    });

    const data = {
        labels: MONTHS, // Use the defined MONTHS array
        datasets: [{
            label: 'Monthly Expenses',
            data: monthlyData, // Data is already in the correct order
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
    };

    const options = {
        scales: {
            x: {
                ticks: {
                    autoSkip: false, // Ensure all labels are displayed
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
};

export default MonthlyExpensesChart;
