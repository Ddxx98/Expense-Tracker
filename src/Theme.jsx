// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4FC3F7', // Light blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#90CAF9', // Light blue accent
    },
    background: {
      default: '#FFFFFF', // Background White
      paper: '#F6F8FA', // Slightly gray for cards
    },
    success: {
      main: '#81C784', // Green for income
    },
    error: {
      main: '#E57373', // Red for expenses
    },
  },
});

export default theme;
