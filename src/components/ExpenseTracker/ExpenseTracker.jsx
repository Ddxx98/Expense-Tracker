import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, Typography, Box,
  MenuItem, Paper, List, ListItem, ListItemText,
  Divider, CircularProgress, Alert, IconButton
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  addExpense, updateExpense, deleteExpense, setExpenses, activatePremium
} from '../../store/Expense';

import { setDarkTheme, toggleTheme } from '../../store/Theme';

import { database } from '../../firebase';
import { ref, push, onValue, remove, update } from 'firebase/database';

import { formatINRCurrency } from '../../utils/formatCurrency';

const categories = [
  'Food', 'Petrol', 'Salary', 'Transport', 'Shopping', 'Entertainment', 'Other'
];

function ExpenseTracker() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const expenses = useSelector(state => state.expense.expenses);
  const premiumActivated = useSelector(state => state.expense.premiumActivated);
  const themeMode = useSelector(state => state.theme.mode);

  const [formData, setFormData] = useState({ amount: '', description: '', category: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', description: '', category: '' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load expenses from Firebase and keep synced
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const expensesRef = ref(database, `expenses/${userId}`);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesArr = Object.entries(data).map(([id, expense]) => ({ id, ...expense }));
        dispatch(setExpenses(expensesArr));
      } else {
        dispatch(setExpenses([]));
      }
      setLoading(false);
    }, (err) => {
      setError('Failed to load expenses.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  // Round number to 2 decimals helper
  const roundToTwo = (num) => Number(Number(num).toFixed(2));

  // Form inputs handlers
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Add new expense
  const handleSubmit = async e => {
    e.preventDefault();

    const { amount, description, category } = formData;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }
    if (!category) {
      alert('Please select a category.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User session expired. Please login again.');
      navigate('/login');
      return;
    }

    setError('');
    try {
      const expensesRef = ref(database, `expenses/${userId}`);
      await push(expensesRef, {
        amount: roundToTwo(amount),
        description: description.trim(),
        category,
        createdAt: Date.now(),
      });
      setFormData({ amount: '', description: '', category: '' });
    } catch (err) {
      setError('Failed to add expense. Please try again.');
    }
  };

  // Delete expense
  const handleDelete = async id => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      await remove(ref(database, `expenses/${userId}/${id}`));
      dispatch(deleteExpense(id));
      console.log('Expense successfully deleted');
    } catch {
      setError('Failed to delete expense. Please try again.');
    }
  };

  // Start edit
  const handleEdit = expense => {
    setEditId(expense.id);
    setEditData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ amount: '', description: '', category: '' });
  };

  // Save edit
  const handleSave = async id => {
    const { amount, description, category } = editData;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }
    if (!category) {
      alert('Please select a category.');
      return;
    }
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setError('');
    try {
      await update(ref(database, `expenses/${userId}/${id}`), {
        amount: roundToTwo(amount),
        description: description.trim(),
        category,
      });
      dispatch(updateExpense({ id, amount: roundToTwo(amount), description: description.trim(), category }));
      setEditId(null);
      setEditData({ amount: '', description: '', category: '' });
    } catch {
      setError('Failed to update expense. Please try again.');
    }
  };

  // Total expenses sum
  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Activate premium and enable dark mode
  const handleActivatePremium = () => {
    dispatch(activatePremium());
    dispatch(setDarkTheme());
    alert('Premium activated! Dark theme enabled.');
  };

  // Toggle theme button
  const toggleThemeHandler = () => {
    dispatch(toggleTheme());
  };

  // Download CSV of expenses
  const downloadCsv = () => {
    if (!expenses.length) {
      alert('No expenses to download.');
      return;
    }
    const headers = ['Amount', 'Description', 'Category', 'Date'];
    const rows = expenses.map(({ amount, description, category, createdAt }) => [
      amount,
      description,
      category,
      new Date(createdAt).toLocaleDateString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map(row => row.map(item => `"${item}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `expenses_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <Container sx={{ mt: 6, textAlign: 'center' }}><CircularProgress /></Container>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Add Daily Expense</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Money Spent"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Category"
            name="category"
            select
            value={formData.category}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" color="primary" fullWidth>Add Expense</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2, my: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {totalAmount > 10000 && !premiumActivated && (
          <Box>
            <Button variant="contained" color="secondary" onClick={handleActivatePremium}>Buy Premium</Button>
            <Typography sx={{ mt: 1, color: 'text.secondary' }}>You have exceeded ₹10,000. Activate Premium for dark mode and more.</Typography>
          </Box>
        )}
        {premiumActivated && (
          <Typography variant="subtitle1" color="primary" sx={{ flexGrow: 1 }}>
            Premium Activated — Enjoy the Dark Theme! 🎉
          </Typography>
        )}
        <Button variant="outlined" onClick={toggleThemeHandler}>Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Theme</Button>
        <Button variant="outlined" onClick={downloadCsv}>Download CSV</Button>
      </Paper>

      <List>
        {expenses.length === 0
          ? <Typography color="text.secondary">No expenses recorded yet.</Typography>
          : [...expenses].sort((a, b) => b.createdAt - a.createdAt).map(expense => (
            <React.Fragment key={expense.id}>
              <ListItem alignItems="flex-start" 
                secondaryAction={
                  editId === expense.id ? null : (
                    <>
                      <IconButton edge="end" color="primary" onClick={() => handleEdit(expense)}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" color="error" onClick={() => handleDelete(expense.id)}>
                        <Delete />
                      </IconButton>
                    </>
                  )
                }
              >
                {editId === expense.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField label="Money"
                      name="amount"
                      type="number"
                      size="small"
                      value={editData.amount}
                      onChange={handleEditChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField label="Description"
                      name="description"
                      size="small"
                      value={editData.description}
                      onChange={handleEditChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField label="Category"
                      name="category"
                      select
                      size="small"
                      value={editData.category}
                      onChange={handleEditChange}
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </TextField>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleSave(expense.id)}>Save</Button>
                      <Button variant="outlined" color="secondary" size="small" onClick={handleCancelEdit}>Cancel</Button>
                    </Box>
                  </Box>
                ) : (
                  <ListItemText 
                    primary={`${expense.description} — ${formatINRCurrency(expense.amount)}`} 
                    secondary={<Typography color="text.secondary">{expense.category}</Typography>}
                  />
                )}
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
      </List>
    </Container>
  );
}

export default ExpenseTracker;
