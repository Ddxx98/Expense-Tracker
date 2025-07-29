// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Header({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Logout
      onLogout();
    } else {
      // Redirect to Signup/Login page
      navigate('/signup');
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Expense Tracker
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/products">
            Products
          </Button>
          <Button color="inherit" component={Link} to="/about">
            About Us
          </Button>
        </Box>

        <Button color="inherit" onClick={handleAuthAction}>
          {isAuthenticated ? 'Logout' : 'SignUp / Login'}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
