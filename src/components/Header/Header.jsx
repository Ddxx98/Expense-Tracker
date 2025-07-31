// src/components/Header.jsx
import React, { useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import { logout, login } from "../../store/Auth";
import { useDispatch, useSelector } from "react-redux";

function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const tokenStored = localStorage.getItem("token");
    const userIdStored = localStorage.getItem("userId");
    if (tokenStored) {
      dispatch(login({ userId: userIdStored, token: tokenStored }));
    }
  }, [dispatch]);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await signOut(auth);
        dispatch(logout());
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        navigate("/login");
      } catch (error) {
        alert("Logout failed: " + error.message);
      }
    } else {
      navigate("/signup");
    }
  };

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
            Expense Tracker
          </Link>
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mr: 2 }}>
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
          {isAuthenticated ? "Logout" : "SignUp / Login"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
