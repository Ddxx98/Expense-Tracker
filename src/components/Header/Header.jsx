// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/Auth";
import { useDispatch, useSelector } from "react-redux";
import { setLightTheme } from "../../store/Theme";

function Header() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        localStorage.removeItem("themeMode")
        dispatch(logout());
        dispatch(setLightTheme());
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
          {isAuthenticated && (
            <Button color="inherit" component={Link} to="/profile">
              Profile
            </Button>
          )}
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
