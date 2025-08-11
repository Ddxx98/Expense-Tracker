// src/store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Get initial theme mode from localStorage or default to 'light'
const savedMode = localStorage.getItem('themeMode');
const initialState = {
  mode: savedMode || 'light',  // 'light' or 'dark'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      // Save to localStorage
      localStorage.setItem('themeMode', state.mode);
    },
    setDarkTheme(state) {
      state.mode = 'dark';
      // Save to localStorage
      localStorage.setItem('themeMode', state.mode);
    },
    setLightTheme(state) {
      state.mode = 'light';
      // Save to localStorage
      localStorage.setItem('themeMode', state.mode);
    },
  },
});

export const { toggleTheme, setDarkTheme, setLightTheme } = themeSlice.actions;
export default themeSlice.reducer;
