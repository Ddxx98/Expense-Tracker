// src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, getAuth } from 'firebase/auth';

function Header() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  });

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Remove token and sign out from Firebase
      localStorage.removeItem('token');
      signOut(auth)
        .then(() => {
          setIsAuthenticated(false);
          navigate('/login');
        })
        .catch(error => {
          alert('Logout failed: ' + error.message);
        });
    } else {
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
