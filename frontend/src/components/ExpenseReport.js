import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { Pie } from 'react-chartjs-2'; // Import Pie chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'; // Import required components
import ChartDataLabels from 'chartjs-plugin-datalabels';
import MonthlyExpensesChart from './MonthlyExpensesChart';
import YearlyExpensesChart from './YearlyExpensesChart';


// Register the components you need
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartDataLabels// Register ArcElement for Pie charts
);


const ExpenseReport = () => {
    const [expenses, setExpenses] = useState([]);
    const [showVisualization, setShowVisualization] = useState(false);

    // Styles for buttons and select
    const buttonStyle = {
        margin: '0 10px',
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    };

    const toggleButtonStyle = {
        margin: '10px 0',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: '#28a745',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    };


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
        
        // Report Title - Centered
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text("Expense Report", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
        // Date and Time of Report Generation - Centered Below Title
        const currentDate = new Date().toLocaleString();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report generated on: ${currentDate}`, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
        
        // Calculate Total Income, Total Expense, and Total Turnover
        const totalIncome = expenses
            .filter(expense => expense.transactionType === 'Income')
            .reduce((acc, expense) => acc + expense.amount, 0);
        const totalExpense = expenses
            .filter(expense => expense.transactionType === 'Expense')
            .reduce((acc, expense) => acc + expense.amount, 0);
        const totalTurnover = totalIncome - totalExpense;
    
        // Display Totals in a Styled Box
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        doc.rect(14, 40, doc.internal.pageSize.getWidth() - 28, 25, 'F'); // Background box for totals
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Income: Rs. ${totalIncome.toFixed(2)}`, 20, 47);
        doc.text(`Total Expense: Rs. ${totalExpense.toFixed(2)}`, 20, 54);
        doc.text(`Total Turnover: Rs. ${totalTurnover.toFixed(2)}`, 20, 61);
        
        // Section Header for Detailed Expenses
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("Detailed Expenses:", 14, 75);
    
        // Sort expenses by amount in descending order and group by month and year
        const sortedExpenses = [...expenses].sort(
            (a, b) => b.amount - a.amount
        );
        const groupedExpenses = {};
    
        sortedExpenses.forEach(expense => {
            const date = new Date(expense.createdAt);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!groupedExpenses[monthYear]) groupedExpenses[monthYear] = [];
            groupedExpenses[monthYear].push(expense);
        });
    
        let startY = 85;  // Positioning start point after the detailed expenses header
    
        // Loop through each month-year group and create a table for each
        Object.keys(groupedExpenses).forEach((monthYear) => {
            // Add month-year heading
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(monthYear, 14, startY);
            startY += 10;
            
            // Table headers and row data for each group
            const tableColumn = ["Amount (Rs.)", "Category", "Date", "Description"];
            const tableRows = groupedExpenses[monthYear].map(expense => {
                const amountDisplay = expense.transactionType === 'Income'
                    ? `↑ Rs. ${expense.amount.toFixed(2)}`
                    : `↓ Rs. ${expense.amount.toFixed(2)}`;
                const amountStyle = expense.transactionType === 'Income' ? [0, 128, 0] : [255, 0, 0];
                
                return [
                    { content: amountDisplay, styles: { textColor: amountStyle } },
                    expense.category,
                    new Date(expense.createdAt).toLocaleDateString(),
                    expense.description || '',
                ];
            });
            
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                margin: { left: 14, right: 14 },
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { lineColor: [204, 204, 204], lineWidth: 0.2 },
            });
    
            startY = doc.autoTable.previous.finalY + 15;
        });
    
        return doc.output('blob');
    };
    
    

    const handleDownloadPDF = () => {
        const pdfBlob = generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'expense_report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


  const handleDownloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense Report');

    // Report Title
    worksheet.mergeCells('A1:D1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Expense Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Date and Time of Report Generation
    const currentDate = new Date().toLocaleString();
    worksheet.mergeCells('A2:D2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Report generated on: ${currentDate}`;
    dateCell.font = { size: 12, italic: true };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Sort expenses by date (latest first)
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate total income, expense, and turnover
    const totalIncome = sortedExpenses
        .filter(expense => expense.transactionType === 'Income')
        .reduce((acc, expense) => acc + expense.amount, 0);
    const totalExpense = sortedExpenses
        .filter(expense => expense.transactionType === 'Expense')
        .reduce((acc, expense) => acc + expense.amount, 0);
    const totalTurnover = totalIncome - totalExpense;

    // Add Total Income, Total Expense, and Total Turnover to the top of the table
    worksheet.mergeCells('A4:D4');
    const incomeCell = worksheet.getCell('A4');
    incomeCell.value = `Total Income: ₹${totalIncome.toFixed(2)}`;
    incomeCell.font = { size: 12, bold: true };
    incomeCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A5:D5');
    const expenseCell = worksheet.getCell('A5');
    expenseCell.value = `Total Expense: ₹${totalExpense.toFixed(2)}`;
    expenseCell.font = { size: 12, bold: true };
    expenseCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('A6:D6');
    const turnoverCell = worksheet.getCell('A6');
    turnoverCell.value = `Total Turnover: ₹${totalTurnover.toFixed(2)}`;
    turnoverCell.font = { size: 12, bold: true };
    turnoverCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Table Headers with some space below the totals
    worksheet.addRow([]); // Blank row for spacing
    worksheet.addRow(['Amount (₹)', 'Category', 'Date', 'Description']);
    worksheet.getRow(8).font = { size: 12, bold: true };  // Make header bold

    // Group expenses by month and year
    const groupedExpenses = {};
    sortedExpenses.forEach(expense => {
        const date = new Date(expense.createdAt);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        if (!groupedExpenses[monthYear]) {
            groupedExpenses[monthYear] = [];
        }
        groupedExpenses[monthYear].push(expense);
    });

    // Add grouped expenses to the worksheet
    for (const [monthYear, expenses] of Object.entries(groupedExpenses)) {
        worksheet.addRow([]);
        worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
        const monthYearCell = worksheet.getCell(`A${worksheet.lastRow.number}`);
        monthYearCell.value = monthYear;
        monthYearCell.font = { size: 12, bold: true, color: { argb: 'FF0000' } };
        monthYearCell.alignment = { vertical: 'middle', horizontal: 'center' };

        expenses.forEach(expense => {
            const amountDisplay = expense.transactionType === 'Income'
                ? `↑ ₹${expense.amount.toFixed(2)}`
                : `↓ ₹${expense.amount.toFixed(2)}`;

            const amountStyle = expense.transactionType === 'Income' ? 'FF008000' : 'FFFF0000'; // Green for income, Red for expense

            const row = worksheet.addRow([
                amountDisplay,
                expense.category,
                new Date(expense.createdAt).toLocaleDateString(),
                expense.description || 'N/A',
            ]);

            // Apply color to Amount cell
            row.getCell(1).font = { color: { argb: amountStyle }, bold: true };
        });
    }

    // Auto-resize columns for better readability
    worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            maxLength = Math.max(maxLength, cell.value ? cell.value.toString().length : 0);
        });
        column.width = maxLength + 5;
    });

    // Export the Excel file
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
        const pdfBlob = generatePDF(); // Generate PDF as a Blob
        const pdfBase64 = await convertBlobToBase64(pdfBlob); // Convert Blob to Base64

        try {
            const response = await axios.post(
                'http://localhost:5000/api/expenses/export-to-mail',
                { pdfData: pdfBase64 },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert(response.data.message);
        } catch (error) {
            console.error('Error exporting report to email:', error);
            alert('Failed to send report to email. Please try again.');
        }
    };

    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Return only the base64 part
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const uniqueYears = [...new Set(expenses.map(expense => new Date(expense.createdAt).getFullYear()))];



    const toggleVisualization = () => {
        setShowVisualization(!showVisualization);
    };
    // Calculate data for Income vs. Expense Pie Chart
        const incomeExpenseData = {
            labels: ['Income', 'Expense'],
            datasets: [
                {
                    data: [
                        expenses.reduce((acc, expense) => expense.transactionType === 'Income' ? acc + expense.amount : acc, 0),
                        expenses.reduce((acc, expense) => expense.transactionType === 'Expense' ? acc + expense.amount : acc, 0)
                    ],
                    backgroundColor: ['#36A2EB', '#FF6384']
                }
            ]
        };

        // Calculate data for Category-wise Expenses Pie Chart
        const categoryExpenseData = expenses.reduce((acc, expense) => {
            if (expense.transactionType === 'Expense') {
                acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            }
            return acc;
        }, {});

        const expenseCategoryChartData = {
            labels: Object.keys(categoryExpenseData),
            datasets: [
                {
                    data: Object.values(categoryExpenseData),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                }
            ]
        };

        // Calculate data for Category-wise Income Pie Chart
        const categoryIncomeData = expenses.reduce((acc, expense) => {
            if (expense.transactionType === 'Income') {
                acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            }
            return acc;
        }, {});

        const incomeCategoryChartData = {
            labels: Object.keys(categoryIncomeData),
            datasets: [
                {
                    data: Object.values(categoryIncomeData),
                    backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF']
                }
            ]
        };

        return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Expense Report</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button style={buttonStyle} onClick={handleDownloadPDF}>Download PDF Report</button>
            <button style={buttonStyle} onClick={handleDownloadExcel}>Download Excel Report</button>
            <button style={buttonStyle} onClick={handleExportToMail}>Send Report to Email</button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button style={toggleButtonStyle} onClick={toggleVisualization}>
                {showVisualization ? 'Hide Visualization' : 'Visualize Expenses'}
            </button>
        </div>

        {showVisualization && (
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Income vs. Expense Pie Chart */}
                <div style={{ width: '50%', maxWidth: '400px', height: 'auto', marginBottom: '30px', textAlign: 'center' }}>
                    <h3>Income vs. Expense</h3>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Pie
                            data={incomeExpenseData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    datalabels: {
                                        formatter: (value, context) => {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            return ((value / total) * 100).toFixed(2) + '%';
                                        },
                                        color: '#fff'
                                    }
                                }
                            }}
                            width={400}
                            height={400}
                        />
                    </div>
                </div>

                {/* Side-by-Side Container for Category-wise Charts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginBottom: '30px' }}>
                    
                    {/* Category-wise Expenses Pie Chart */}
                    <div style={{ width: '48%', maxWidth: '400px', height: 'auto', textAlign: 'center' }}>
                        <h3>Category-wise Expenses</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Pie
                                data={expenseCategoryChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                        datalabels: {
                                            formatter: (value, context) => {
                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                return ((value / total) * 100).toFixed(2) + '%';
                                            },
                                            color: '#fff'
                                        }
                                    }
                                }}
                                width={400}
                                height={400}
                            />
                        </div>
                    </div>

                    {/* Category-wise Income Pie Chart */}
                    <div style={{ width: '48%', maxWidth: '400px', height: 'auto', textAlign: 'center' }}>
                        <h3>Category-wise Income</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Pie
                                data={incomeCategoryChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                        datalabels: {
                                            formatter: (value, context) => {
                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                return ((value / total) * 100).toFixed(2) + '%';
                                            },
                                            color: '#fff'
                                        }
                                    }
                                }}
                                width={400}
                                height={400}
                            />
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Container for Yearly and Monthly Expenses */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%' }}>
                    
                    {/* Yearly Expenses Chart */}
                    <div style={{ width: '48%', height: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                        <h3>Yearly Expenses</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <YearlyExpensesChart expenses={expenses} />
                        </div>
                    </div>

                    {/* Monthly Expenses Chart */}
                    <div style={{ width: '48%', height: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                    <h3>Monthly Expenses Chart</h3>
                    
                    {/* Render the MonthlyExpensesChart, passing expenses and uniqueYears */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <MonthlyExpensesChart expenses={expenses} availableYears={uniqueYears} />
                    </div>
                </div>

                </div>
            </div>
        )}
    </div>
);
      
    
};
    

export default ExpenseReport;
