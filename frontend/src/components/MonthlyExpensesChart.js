import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyExpensesChart = ({ expenses, availableYears }) => {
    const sortedYears = availableYears.sort((a, b) => a - b); // Sort years in ascending order
    const [selectedYear, setSelectedYear] = useState(sortedYears[sortedYears.length - 1]); // Set the latest year as default
    const [transactionType, setTransactionType] = useState('Expense');

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    // Filter expenses by year and type
    const filteredExpenses = expenses.filter(expense => 
        new Date(expense.createdAt).getFullYear() === parseInt(selectedYear) &&
        expense.transactionType === transactionType
    );

    // Initialize monthly data
    const monthlyData = Array(12).fill(0);
    filteredExpenses.forEach(expense => {
        const monthIndex = new Date(expense.createdAt).getMonth();
        monthlyData[monthIndex] += expense.amount;
    });

    const data = {
        labels: MONTHS,
        datasets: [{
            label: `Monthly ${transactionType}`,
            data: monthlyData,
            backgroundColor: transactionType === 'Expense' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)',
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    autoSkip: false,
                },
            },
        },
    };

    const selectStyle = { padding: '5px', width: '120px', marginLeft: '10px' };

    return (
        <div style={{ width: '100%', height: '310px', padding: '20px', textAlign: 'center' }}>            
            {/* Year and Transaction Type dropdowns side by side */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                <div>
                    <label htmlFor="year-select">Select Year:</label>
                    <select
                        id="year-select"
                        value={selectedYear}
                        onChange={handleYearChange}
                        style={selectStyle}
                    >
                        {availableYears.sort((a, b) => a - b).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="transaction-type-select">Transaction Type:</label>
                    <select
                        id="transaction-type-select"
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="Expense">Expense</option>
                        <option value="Income">Income</option>
                    </select>
                </div>
            </div>

            {/* Bar chart */}
            <Bar data={data} options={options} />
        </div>
    );
};

export default MonthlyExpensesChart;
