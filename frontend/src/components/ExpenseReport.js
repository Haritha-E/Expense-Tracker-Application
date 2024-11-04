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
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default to current year

    // Get unique years from expenses
    const uniqueYears = [...new Set(expenses.map(expense => new Date(expense.createdAt).getFullYear()))];

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };


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

    const selectStyle = {
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginTop: '10px',
        width: '80%',
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
        
        // Total Amount Displayed in a Styled Box at the Top
        const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        doc.setFillColor(41, 128, 185);
        doc.setTextColor(255, 255, 255);
        doc.rect(14, 40, doc.internal.pageSize.getWidth() - 28, 10, 'F'); // Background box for total
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: Rs. ${totalAmount.toFixed(2)}`, doc.internal.pageSize.getWidth() / 2, 47, { align: 'center' });
    
        // Section Header for Detailed Expenses
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text("Detailed Expenses:", 14, 60);
    
        // Sort expenses by date (latest first) and group by month and year
        const sortedExpenses = [...expenses].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const groupedExpenses = {};
    
        sortedExpenses.forEach(expense => {
            const date = new Date(expense.createdAt);
            const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!groupedExpenses[monthYear]) groupedExpenses[monthYear] = [];
            groupedExpenses[monthYear].push(expense);
        });
    
        let startY = 70;  // Positioning start point after the detailed expenses header
    
        // Loop through each month-year group and create a table for each
        Object.keys(groupedExpenses).forEach((monthYear) => {
            // Add month-year heading
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(monthYear, 14, startY);
            startY += 10;
            
            // Table headers and row data for each group
            const tableColumn = ["Amount (Rs.)", "Category", "Date", "Description"];
            const tableRows = groupedExpenses[monthYear].map(expense => [
                `Rs. ${expense.amount.toFixed(2)}`,
                expense.category,
                new Date(expense.createdAt).toLocaleDateString(),
                expense.description || '',
            ]);
            
            // Configure autoTable styling for a professional look
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: startY,
                theme: 'grid',
                margin: { left: 14, right: 14 },
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
                bodyStyles: { textColor: [34, 34, 34], lineColor: [204, 204, 204], lineWidth: 0.2 },
                columnStyles: { 0: { halign: 'right' } },  // Align amounts to the right
            });
            
            // Update startY for the next table, adding extra space between groups
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
    
        // Calculate total amount and add it to the top of the table
        const totalAmount = sortedExpenses.reduce((acc, expense) => acc + expense.amount, 0);
        worksheet.mergeCells('A4:D4');
        const totalCell = worksheet.getCell('A4');
        totalCell.value = `Total Amount: ₹${totalAmount.toFixed(2)}`;
        totalCell.font = { size: 12, bold: true };
        totalCell.alignment = { vertical: 'middle', horizontal: 'center' };
    
        // Table Headers with some space below the total
        worksheet.addRow([]); // Blank row for spacing
        worksheet.addRow(['Amount (₹)', 'Category', 'Date', 'Description']);
        worksheet.getRow(6).font = { size: 12, bold: true };  // Make header bold
    
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
            // Add month-year heading
            worksheet.addRow([]);
            worksheet.mergeCells(`A${worksheet.lastRow.number}:D${worksheet.lastRow.number}`);
            const monthYearCell = worksheet.getCell(`A${worksheet.lastRow.number}`);
            monthYearCell.value = monthYear;
            monthYearCell.font = { size: 12, bold: true, color: { argb: 'FF0000' } }; // Red color
            monthYearCell.alignment = { vertical: 'middle', horizontal: 'center' };
    
            // Add expense rows
            expenses.forEach(expense => {
                worksheet.addRow([
                    `₹${expense.amount.toFixed(2)}`,               // Amount with ₹ symbol
                    expense.category,                              // Category
                    new Date(expense.createdAt).toLocaleDateString(), // Date formatted
                    expense.description || 'N/A'                   // Description (default "N/A" if empty)
                ]);
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

    // Prepare data for chart visualization
    const categoryData = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                data: Object.values(categoryData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    const toggleVisualization = () => {
        setShowVisualization(!showVisualization);
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
                    {/* Pie Chart */}
                    <div style={{ width: '60%', height: '400px', marginBottom: '30px' }}>
                        <h3 style={{ textAlign: 'center' }}>Expenses by Category</h3>
                        <Pie 
                            data={chartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    datalabels: {
                                        formatter: (value, context) => {
                                            const datasets = context.chart.data.datasets;
                                            if (!datasets || datasets.length === 0) return '';
                                            
                                            const total = datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                                            return percentage;
                                        },
                                        color: '#fff',
                                    }
                                }
                            }} 
                        />
                    </div>
    
                    {/* Charts Container */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', marginTop: '20px' }}>
                        {/* Yearly Expenses Chart */}
                        <div style={{ width: '48%', height: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ textAlign: 'center' }}>Yearly Expenses</h3>
                            <YearlyExpensesChart expenses={expenses} />
                        </div>
    
                        {/* Monthly Expenses Chart */}
                        <div style={{ width: '48%', height: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <h3 style={{ textAlign: 'center' }}>Monthly Expenses for {selectedYear}</h3>
                            <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label htmlFor="year-select">Select Year:</label>
                                <select 
                                    id="year-select" 
                                    value={selectedYear} 
                                    onChange={handleYearChange} 
                                    style={selectStyle}
                                >
                                    {uniqueYears.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <MonthlyExpensesChart expenses={expenses} selectedYear={selectedYear} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
    

export default ExpenseReport;
