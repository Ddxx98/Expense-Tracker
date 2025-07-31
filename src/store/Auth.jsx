// src/store/Auth.js
import { createSlice } from "@reduxjs/toolkit";

const initialAuth = {
  isAuthenticated: false,
  userId: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuth,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
