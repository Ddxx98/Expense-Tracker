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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { auth, database } from '../../firebase'; 
import { ref, push, onValue } from 'firebase/database';

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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch expenses from Firebase DB for logged-in user
    const user = auth.currentUser;
    if (!user) {
      // No user (maybe token invalid), redirect to login
      navigate('/login');
      return;
    }

    const expensesRef = ref(database, `expenses/${user.uid}`);

    // Attach listener to fetch expenses on data change
    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array
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

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit expense and store in Firebase DB
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.amount === '' || isNaN(formData.amount) || Number(formData.amount) <= 0) {
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

      // Push a new expense node in DB
      await push(expensesRef, {
        amount: Number(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
        createdAt: Date.now(),
      });

      // Reset form only on success
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
              .sort((a, b) => b.createdAt - a.createdAt) // latest first
              .map((expense) => (
                <React.Fragment key={expense.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${expense.description} - ₹${expense.amount.toFixed(2)}`}
                      secondary={expense.category}
                    />
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
