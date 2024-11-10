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
import Swal from 'sweetalert2';
const API_URL = process.env.REACT_APP_API_URL;


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
                const response = await axios.get(`${API_URL}/expenses`, {
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
        const totalBalance = totalIncome - totalExpense;
    
        // Setting up background color and section for totals
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        doc.rect(14, 40, doc.internal.pageSize.getWidth() - 28, 25, 'F');

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        // Display Total Income and Total Expense
        doc.text(`Total Income: Rs. ${totalIncome.toFixed(2)}`, 20, 47);
        doc.text(`Total Expense: Rs. ${totalExpense.toFixed(2)}`, 20, 54);

        // Arrow placement based on balance
        const balanceText = `Total Balance: Rs. ${Math.abs(totalBalance).toFixed(2)}`;
        const textX = 20; // X position for balance text
        const arrowX = textX + doc.getTextWidth(balanceText) + 3; // Position arrow closer to amount

        if (totalBalance >= 0) {
            doc.setTextColor(0, 255, 0); // Green for positive balance
            doc.text(balanceText, textX, 61); // Draw text

            // Draw upward arrow, slightly adjusting Y position to align with text
            doc.setDrawColor(0, 255, 0);
            doc.line(arrowX, 57.5, arrowX, 61.5); // Vertical line
            doc.line(arrowX - 1, 59.0, arrowX, 57.5); // Left diagonal
            doc.line(arrowX + 1, 59.0, arrowX, 57.5); // Right diagonal
        } else {
            doc.setTextColor(255, 127, 127);  // Red for negative balance
            doc.text(balanceText, textX, 61); // Draw text

            // Draw downward arrow, slightly adjusting Y position to align with text
            doc.setDrawColor(255, 127, 127);
            doc.line(arrowX, 57.5, arrowX, 61.5); // Vertical line
            doc.line(arrowX - 1, 59.5, arrowX, 61.5); // Left diagonal
            doc.line(arrowX + 1, 59.5, arrowX, 61.5); // Right diagonal
        }

        
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
            const monthExpenses = groupedExpenses[monthYear];
            
            // Calculate total income and total expense for the month
            const totalIncomeMonth = monthExpenses
                .filter(expense => expense.transactionType === 'Income')
                .reduce((acc, expense) => acc + expense.amount, 0);
            const totalExpenseMonth = monthExpenses
                .filter(expense => expense.transactionType === 'Expense')
                .reduce((acc, expense) => acc + expense.amount, 0);
            const totalBalanceMonth = totalIncomeMonth - totalExpenseMonth;
        
            // Define text parts and calculate positions
            const monthYearText = `${monthYear}`;
            const balanceLabelText = `Balance: `;
            let balanceAmountText;
            if (totalBalanceMonth > 0) {
                balanceAmountText = `(+) Rs. ${Math.abs(totalBalanceMonth).toFixed(2)}`;
            } else {
                balanceAmountText = `(-) Rs. ${Math.abs(totalBalanceMonth).toFixed(2)}`;
            }

        
            // Render month-year text
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0); // Black for month-year
            doc.text(monthYearText, 14, startY);
        
            // Render balance label right after month-year
            const balanceLabelX = 14 + doc.getTextWidth(monthYearText) + 5;
            doc.text(balanceLabelText, balanceLabelX, startY);
        
            // Render balance amount with conditional color
            const amountX = balanceLabelX + doc.getTextWidth(balanceLabelText);
            if (totalBalanceMonth >= 0) {
                doc.setTextColor(0, 128, 0); // Green for positive balance
            } else {
                doc.setTextColor(255, 0, 0); // Red for negative balance
            }
            doc.text(balanceAmountText, amountX, startY);
        
            // Move to the next line
            startY += 10;
        
            // Reset text color for further content
            doc.setTextColor(0, 0, 0);               
        
    // Table headers and row data for each group
    const tableColumn = ["Amount (Rs.)", "Category", "Date", "Description"];
    const tableRows = monthExpenses.map(expense => {
        const amountDisplay = expense.transactionType === 'Income'
            ? `(+) Rs. ${expense.amount.toFixed(2)}`
            : `(-) Rs. ${expense.amount.toFixed(2)}`;
        const amountStyle = expense.transactionType === 'Income' ? [0, 128, 0] : [255, 0, 0];
        
        return [
            { content: amountDisplay, styles: { textColor: amountStyle } },
            expense.category,
            new Date(expense.createdAt).toLocaleDateString(),
            expense.description || '',
        ];
    });
    
    // Create table with expenses for the month
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

    // Update the startY for the next month section
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
    const totalBalance = totalIncome - totalExpense;

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

    // Total Balance Logic (with arrows)
    const arrow = totalBalance > 0 ? '↑' : '↓'; // Green for positive, Red for negative
    const arrowColor = totalBalance > 0 ? 'FF008000' : 'FFFF0000'; // Green for positive, Red for negative

    worksheet.mergeCells('A6:D6');
    const turnoverCell = worksheet.getCell('A6');
    turnoverCell.value = `Total Balance: ₹${Math.abs(totalBalance).toFixed(2)} ${arrow}`;
    turnoverCell.font = { size: 12, bold: true };
    turnoverCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Apply color to the arrow
    turnoverCell.font.color = { argb: arrowColor };

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
        groupedExpenses[monthYear] = { expenses: [], totalIncome: 0, totalExpense: 0 };
    }
    groupedExpenses[monthYear].expenses.push(expense);
    if (expense.transactionType === 'Income') {
        groupedExpenses[monthYear].totalIncome += expense.amount;
    } else {
        groupedExpenses[monthYear].totalExpense += expense.amount;
    }
});

// Add grouped expenses to the worksheet
for (const [monthYear, data] of Object.entries(groupedExpenses)) {
    const totalBalanceMonth = data.totalIncome - data.totalExpense;  // Calculate balance for the month
    const arrow = totalBalanceMonth >= 0 ? '↑' : '↓'; // Arrow for positive/negative balance
    const arrowColor = totalBalanceMonth >= 0 ? 'FF008000' : 'FFFF0000'; // Green for income, Red for expense
    
    worksheet.addRow([]);  // Add a blank row for spacing
    worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
    
    const monthYearCell = worksheet.getCell(`A${worksheet.lastRow.number}`);
    monthYearCell.value = `${monthYear} - Balance: ₹${Math.abs(totalBalanceMonth).toFixed(2)} ${arrow}`;
    monthYearCell.font = { size: 12, bold: true, color: { argb: 'FF000000' } }; // Label color black
    monthYearCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Apply color for the balance amount and arrow
    monthYearCell.font = {
        ...monthYearCell.font,
        color: { argb: arrowColor },
    };
    monthYearCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
        bottom: { style: 'thin' }, // Box the whole month row
    };

    // Add each expense of the month
    data.expenses.forEach(expense => {
        const amountDisplay = expense.transactionType === 'Income'
            ? `↑ ₹${expense.amount.toFixed(2)}`
            : `↓ ₹${expense.amount.toFixed(2)}`;

        const amountStyle = expense.transactionType === 'Income' ? 'FF008000' : 'FFFF0000'; // Green for income, Red for expense

        const row = worksheet.addRow([amountDisplay, expense.category, new Date(expense.createdAt).toLocaleDateString(), expense.description || 'N/A']);
        
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

    // Show loading message
    Swal.fire({
        title: '<h2 style="color: #4A90E2;">Sending...</h2>',
        html: '<p style="font-size: 1.0em; color: #333;">Please wait while your report is being sent.</p>',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await axios.post(
            `${API_URL}/expenses/export-to-mail`,
            { pdfData: pdfBase64 },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Show success message
        Swal.fire({
            icon: 'success',
            title: '<h2 style="color: #4CAF50;">Email Sent!</h2>',
            html: `<p style="font-size: 1.0em; color: #333;">${response.data.message}</p>`,
            timer: 3000,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error exporting report to email:', error);

        // Show error message
        Swal.fire({
            icon: 'error',
            title: '<h2 style="color: #E74C3C;">Failed to Send Email</h2>',
            html: '<p style="font-size: 1.0em; color: #333;">An error occurred while sending the report. Please try again.</p>',
            showConfirmButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#d33'
        });
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
