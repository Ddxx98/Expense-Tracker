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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Basic validation
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

    // Add the new expense to the list
    setExpenses(prev => [
      ...prev,
      {
        id: Date.now(),
        amount: Number(formData.amount),
        description: formData.description.trim(),
        category: formData.category,
      },
    ]);

    // Clear form inputs
    setFormData({
      amount: '',
      description: '',
      category: '',
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Add Daily Expense
        </Typography>
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
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
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
            {expenses.map(expense => (
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
