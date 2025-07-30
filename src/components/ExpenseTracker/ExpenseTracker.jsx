import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { auth, database } from '../../firebase';
import { ref, push, onValue, remove, update } from 'firebase/database';

const categories = [
  'Food',
  'Petrol',
  'Salary',
  'Transport',
  'Shopping',
  'Entertainment',
  'Other',
];

function ExpenseTracker() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
  });
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    amount: '',
    description: '',
    category: '',
  });

  // Check authentication and fetch expenses
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    const expensesRef = ref(database, `expenses/${user.uid}`);
    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const expensesArray = Object.entries(data).map(([id, expense]) => ({
            id,
            ...expense,
          }));
          setExpenses(expensesArray);
        } else {
          setExpenses([]);
        }
        setLoading(false);
      },
      (error) => {
        setError('Failed to load expenses.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [navigate]);

  // For add new
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // For editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.amount === '' ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    ) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (formData.description.trim() === '') {
      alert('Please enter a description.');
      return;
    }
    if (formData.category === '') {
      alert('Please select a category.');
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated. Please login again.');
      navigate('/login');
      return;
    }
    setError('');
    try {
      const expensesRef = ref(database, `expenses/${user.uid}`);
      await push(expensesRef, {
        amount: Number(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        createdAt: Date.now(),
      });
      setFormData({
        amount: '',
        description: '',
        category: '',
      });
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense. Please try again.');
    }
  };

  // Delete expense
  const handleDelete = async (expenseId) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await remove(ref(database, `expenses/${user.uid}/${expenseId}`));
      console.log('Expense successfully deleted');
    } catch (error) {
      setError('Failed to delete expense. Please try again.');
    }
  };

  // Start editing
  const handleEdit = (expense) => {
    setEditId(expense.id);
    setEditData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({ amount: '', description: '', category: '' });
  };

  // Save edit to Firebase
  const handleSaveEdit = async (expenseId) => {
    const user = auth.currentUser;
    if (!user) return;
    if (
      editData.amount === '' ||
      isNaN(editData.amount) ||
      Number(editData.amount) <= 0
    ) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (editData.description.trim() === '') {
      alert('Please enter a description.');
      return;
    }
    if (editData.category === '') {
      alert('Please select a category.');
      return;
    }

    try {
      await update(ref(database, `expenses/${user.uid}/${expenseId}`), {
        amount: Number(editData.amount),
        description: editData.description.trim(),
        category: editData.category,
      });
      setEditId(null);
      setEditData({ amount: '', description: '', category: '' });
    } catch (error) {
      setError('Failed to update expense. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Add Daily Expense
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Money Spent"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            inputProps={{ min: '0', step: '0.01' }}
          />
          <TextField
            label="Description"
            name="description"
            type="text"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Category"
            name="category"
            select
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Add Expense
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Your Expenses
        </Typography>
        {expenses.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No expenses added yet.
          </Typography>
        ) : (
          <List>
            {expenses
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((expense) => (
                <React.Fragment key={expense.id}>
                  <ListItem
                    alignItems="flex-start"
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
                        <TextField
                          label="Money"
                          name="amount"
                          type="number"
                          size="small"
                          fullWidth
                          sx={{ mb: 1 }}
                          value={editData.amount}
                          onChange={handleEditChange}
                        />
                        <TextField
                          label="Description"
                          name="description"
                          size="small"
                          fullWidth
                          sx={{ mb: 1 }}
                          value={editData.description}
                          onChange={handleEditChange}
                        />
                        <TextField
                          label="Category"
                          name="category"
                          select
                          size="small"
                          fullWidth
                          sx={{ mb: 2 }}
                          value={editData.category}
                          onChange={handleEditChange}
                        >
                          {categories.map(cat => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleSaveEdit(expense.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <ListItemText
                        primary={`${expense.description} - ₹${expense.amount.toFixed(2)}`}
                        secondary={expense.category}
                      />
                    )}
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
          </List>
        )}
      </Box>
    </Container>
  );
}

export default ExpenseTracker;
