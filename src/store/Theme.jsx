// src/store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'light',  // 'light' or 'dark'
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
    setDarkTheme(state) {
      state.mode = 'dark';
    },
  },
});

export const { toggleTheme, setDarkTheme } = themeSlice.actions;
export default themeSlice.reducer;
