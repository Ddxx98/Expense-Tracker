import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Provider, useSelector } from 'react-redux';
import store from './store'; // adjust as needed

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4FC7F7' },
    background: { default: '#fff', paper: '#f5f7fa' },
    // Your colors etc.
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9', contrastText: '#000' },
    background: { default: '#121212', paper: '#1d1d1d' },
    text: {
      primary: '#fff',
      secondary: '#bbb', 
    },
  },
});

function ThemeWrapper() {
  const mode = useSelector((state) => state.theme.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <App/>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeWrapper />
  </Provider>
);
