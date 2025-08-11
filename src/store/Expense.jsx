import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://expense-tracker-d5475-default-rtdb.firebaseio.com";

const initialState = {
  expenses: [],
  premiumActivated: false,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchExpensesAsync = createAsyncThunk(
  "expense/fetchExpenses",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/expenses/${userId}.json?auth=${token}`);
      const data = response.data;
      if (data) {
        return Object.entries(data).map(([id, expense]) => ({ id, ...expense }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch expenses");
    }
  }
);

export const addExpenseAsync = createAsyncThunk(
  "expense/addExpense",
  async ({ expenseData, userId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/expenses/${userId}.json?auth=${token}`,
        expenseData
      );
      return { id: response.data.name, ...expenseData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to add expense");
    }
  }
);

export const updateExpenseAsync = createAsyncThunk(
  "expense/updateExpense",
  async ({ id, expenseData, userId, token }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${BASE_URL}/expenses/${userId}/${id}.json?auth=${token}`,
        expenseData
      );
      return { id, ...expenseData };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to update expense");
    }
  }
);

export const deleteExpenseAsync = createAsyncThunk(
  "expense/deleteExpense",
  async ({ id, userId, token }, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/expenses/${userId}/${id}.json?auth=${token}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error?.message || "Failed to delete expense");
    }
  }
);

const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    addExpense(state, action) {
      state.expenses.push(action.payload);
    },
    deleteExpense(state, action) {
      state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
    },
    updateExpense(state, action) {
      const { id, amount, description, category } = action.payload;
      const expenseToUpdate = state.expenses.find(exp => exp.id === id);
      if (expenseToUpdate) {
        expenseToUpdate.amount = amount;
        expenseToUpdate.description = description;
        expenseToUpdate.category = category;
      }
    },
    setExpenses(state, action) {
      state.expenses = action.payload;
    },
    activatePremium(state) {
      state.premiumActivated = true;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpensesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpensesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpensesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add expense
      .addCase(addExpenseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.push(action.payload);
      })
      .addCase(addExpenseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update expense
      .addCase(updateExpenseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { id, amount, description, category } = action.payload;
        const expenseToUpdate = state.expenses.find(exp => exp.id === id);
        if (expenseToUpdate) {
          expenseToUpdate.amount = amount;
          expenseToUpdate.description = description;
          expenseToUpdate.category = category;
        }
      })
      .addCase(updateExpenseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete expense
      .addCase(deleteExpenseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpenseAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
      })
      .addCase(deleteExpenseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addExpense,
  deleteExpense,
  updateExpense,
  setExpenses,
  activatePremium,
  clearError,
} = expenseSlice.actions;

export default expenseSlice.reducer;
