import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { FaSortAmountDownAlt, FaSortAmountUp, FaArrowUp, FaArrowDown, FaEdit, FaTrashAlt } from 'react-icons/fa';
import './ExpenseList.css';
const API_URL = process.env.REACT_APP_API_URL;

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchTransactionType, setSearchTransactionType] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    // eslint-disable-next-line no-unused-vars
    const [editingIndex, setEditingIndex] = useState(null);
    const [searchYear, setSearchYear] = useState('');
    const [searchMonth, setSearchMonth] = useState('');

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

    const years = useMemo(() => {
        const uniqueYears = new Set(expenses.map(expense => new Date(expense.createdAt).getFullYear()));
        return Array.from(uniqueYears).sort((a, b) => b - a); // Sort years in descending order
      }, [expenses]);      

    const months = [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        const matchesCategory = searchCategory ? expense.category === searchCategory : true;
        const matchesDate = searchDate ? expenseDate.toISOString().slice(0, 10) === searchDate : true;
        const matchesTransactionType = searchTransactionType ? expense.transactionType === searchTransactionType : true;
        const matchesYear = searchYear ? expenseDate.getFullYear().toString() === searchYear : true;
        const matchesMonth = searchMonth ? (expenseDate.getMonth() + 1).toString().padStart(2, '0') === searchMonth : true;
        return matchesCategory && matchesDate && matchesTransactionType && matchesYear && matchesMonth;
    });

    // Memoize totals calculation
    const calculateTotals = useMemo(() => {
        let totalExpense = 0;
        let totalIncome = 0;
    
        filteredExpenses.forEach(expense => {
            if (expense.transactionType === 'Income') {
                totalIncome += expense.amount;
            } else if (expense.transactionType === 'Expense') {
                totalExpense += expense.amount;
            }
        });
    
        return {
            totalExpense,
            totalIncome,
            totalBalance: totalIncome - totalExpense,
        };
    }, [filteredExpenses]);  // Recalculate when filteredExpenses change
    

    const { totalExpense, totalIncome, totalBalance } = calculateTotals;



    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        const aValue = sortBy === 'amount' ? a.amount : new Date(a.createdAt).getTime();
        const bValue = sortBy === 'amount' ? b.amount : new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    const handleClearFilters = () => {
        setSearchCategory('');
        setSearchDate('');
        setSearchTransactionType('');
        setSearchYear('');
        setSearchMonth('');
        setSortBy('date');
        setSortOrder('desc');
    };
    

    const resetForm = () => {
        setCurrentExpense(null);
        setDescription('');
        setAmount('');
        setCategory('');
        setTransactionType('');
        setDate('');
        setIsEditing(false);
        setEditingIndex(null);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(expenses.filter(expense => expense._id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error.response ? error.response.data : error.message);
        }
    };

    const handleEdit = (expense, index) => {
        setCurrentExpense(expense);
        setDescription(expense.description || '');
        setAmount(expense.amount);
        setCategory(expense.category);
        setTransactionType(expense.transactionType);
        setDate(new Date(expense.createdAt).toISOString().slice(0, 10));
        setIsEditing(true);
        setEditingIndex(index);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!amount || !category || !date || !transactionType) {
            alert('Please fill in all fields.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const updatedExpense = {
                description: description || undefined,
                amount: Number(amount),
                category,
                transactionType,
                createdAt: date,
            };
            await axios.put(`${API_URL}/expenses/${currentExpense._id}`, updatedExpense, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(expenses.map(expense =>
                expense._id === currentExpense._id ? { ...expense, ...updatedExpense } : expense
            ));
            resetForm();
        } catch (error) {
            console.error('Error updating expense:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div>
            <h2>Your Transactions</h2>
            <div className="search-bar">
                <div className="filter-container">
                    <select onChange={(e) => setSearchCategory(e.target.value)} value={searchCategory}>
                        <option value="">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Health">Health</option>
                        <option value="Education">Education</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Rent">Rent</option>
                        <option value="Salary">Salary</option>
                        <option value="Other">Other</option>
                    </select>
                    <select onChange={(e) => setSearchTransactionType(e.target.value)} value={searchTransactionType}>
                        <option value="">All Transaction Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                    <select onChange={(e) => setSearchYear(e.target.value)} value={searchYear}>
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select onChange={(e) => setSearchMonth(e.target.value)} value={searchMonth}>
                        <option value="">All Months</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />
                    <button onClick={handleClearFilters}>Clear Filters</button>
                </div>
                <div className="sort-container">
                    <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
                        <option value="amount">Sort by Amount</option>
                        <option value="date">Sort by Date</option>
                    </select>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                        {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDownAlt />}
                    </button>
                </div>
            </div>

            <div className="totals">
                <h3>Total Expense: ₹{totalExpense.toFixed(2)}</h3>
                <h3>Total Income: ₹{totalIncome.toFixed(2)}</h3>
                <h3>
                    Total Balance: 
                    <span style={{ color: totalBalance >= 0 ? 'green' : 'red', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {totalBalance >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        ₹{Math.abs(totalBalance).toFixed(2)}
                    </span>
                </h3>
            </div>


            {sortedExpenses.length === 0 ? (
                <p>No transactions found for the selected filters.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Transaction Type</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedExpenses.map((expense) => (
                            <tr key={expense._id}>
                                <td style={{ color: expense.transactionType === 'Income' ? 'green' : 'red' }}>
                                    {expense.transactionType === 'Income' ? (
                                        <><FaArrowUp /> ₹{expense.amount}</>
                                    ) : (
                                        <><FaArrowDown /> ₹{expense.amount}</>
                                    )}
                                </td>
                                <td>{expense.category}</td>
                                <td>{expense.transactionType}</td>
                                <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                                <td>{expense.description}</td>
                                <td>
                                    <FaEdit onClick={() => handleEdit(expense)} style={{ cursor: 'pointer', color: 'blue' }} />
                                    <FaTrashAlt onClick={() => handleDelete(expense._id)} style={{ cursor: 'pointer', color: 'red', marginLeft: '10px' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal for Edit Expense */}
            {isEditing && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Expense</h3>
                        <form onSubmit={handleUpdate}>
                            <label>Transaction Type</label>
                            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                                <option value="Expense">Expense</option>
                                <option value="Income">Income</option>
                            </select>

                            <label>Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                            />

                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Bills">Bills</option>
                            <option value="Rent">Rent</option>
                            <option value="Salary">Salary</option>
                            <option value="Other">Other</option>
                            </select>

                            <label>Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />

                            <label>Description (Optional)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                            />

                            <button type="submit">Update</button>
                            <button type="button" onClick={resetForm}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseList;
