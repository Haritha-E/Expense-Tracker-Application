// src/components/YearlyExpensesChart.js
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

const YearlyExpensesChart = ({ expenses }) => {
    const [transactionType, setTransactionType] = useState('Expense');


    const yearlyData = {};
    
    expenses
        .filter(expense => expense.transactionType === transactionType)
        .forEach(expense => {
            const year = new Date(expense.createdAt).getFullYear();
            if (!yearlyData[year]) {
                yearlyData[year] = 0;
            }
            yearlyData[year] += expense.amount;
        });

    const data = {
        labels: Object.keys(yearlyData),
        datasets: [{
            label: `Yearly ${transactionType}`,
            data: Object.values(yearlyData),
            fill: false,
            borderColor: transactionType === 'Expense' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)',

        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Prevent aspect ratio constraints
    };

    return (
            <div style={{ width: '100%', height: '320px', padding: '20px' }}>
            <div style={{ marginBottom: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <label htmlFor="transaction-type-select" style={{ marginRight: '10px' }}>Select Transaction Type:</label>
                <select
                    id="transaction-type-select"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    style={{ padding: '5px', width: '120px' }}
                >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                </select>
            </div>


            {/* Line Chart with specified height and width */}
            <Line data={data} options={options} width={800} height={400} />
        </div>
    );
};

export default YearlyExpensesChart;
