import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expenses: [],
  premiumActivated: false,
};

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
    }
  },
});

export const {
  addExpense,
  deleteExpense,
  updateExpense,
  setExpenses,
  activatePremium,
} = expenseSlice.actions;

export default expenseSlice.reducer;
