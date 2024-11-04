// src/components/YearlyExpensesChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const YearlyExpensesChart = ({ expenses }) => {
    const yearlyData = {}; // Object to store yearly expenses
    
    expenses.forEach(expense => {
        const year = new Date(expense.createdAt).getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = 0;
        }
        yearlyData[year] += expense.amount; // Summing up expenses by year
    });

    const data = {
        labels: Object.keys(yearlyData),
        datasets: [{
            label: 'Yearly Expenses',
            data: Object.values(yearlyData),
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
        }],
    };

    return <Line data={data} />;
};

export default YearlyExpensesChart;
