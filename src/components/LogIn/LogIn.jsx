import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Forgot Password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Input validation
  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email address is invalid';

    if (!formData.password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setFirebaseError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFirebaseError('');
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem('token', idToken);
      setToken(idToken);
      navigate('/email');
      console.log('User logged in successfully, token stored.');
    } catch (error) {
      console.error(error);
      let message = 'Failed to login. Please try again.';
      if (error.code === 'auth/user-not-found')
        message = 'User not found. Please sign up first.';
      else if (error.code === 'auth/wrong-password')
        message = 'Incorrect password. Please try again.';
      else if (error.code === 'auth/too-many-requests')
        message = 'Too many attempts. Please try later.';
      setFirebaseError(message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handlers
  const handleForgotOpen = () => {
    setForgotOpen(true);
    setResetEmail('');
    setResetError('');
    setResetSuccess('');
  };
  const handleForgotClose = () => setForgotOpen(false);

  const handleResetEmailChange = e => {
    setResetEmail(e.target.value);
    setResetError('');
    setResetSuccess('');
  };

  const handleResetSubmit = async e => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(
        'You would receive a password reset link in your email if the account exists. Open the link and change your password. Now try logging in with the new password.'
      );
    } catch (error) {
      let msg = 'Failed to send password reset email.';
      if (error.code === 'auth/user-not-found')
        msg = 'No user found with this email. Please check your email address.';
      else if (error.code === 'auth/too-many-requests')
        msg = 'Too many requests. Please try again later.';
      else if (error.code === 'auth/invalid-email')
        msg = 'Invalid email address.';
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  if (token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Expense Tracker
        </Typography>
        <Typography variant="body1">
          You have successfully logged in.
        </Typography>
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Your profile is incomplete.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, mx: "auto", display: "block" }}
          onClick={() => navigate("/profile")}
        >
          Complete Now
        </Button>
      </Container>
    );
  }

  const isSubmitDisabled = !formData.email || !formData.password;

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Box
        sx={{
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Login
        </Typography>

        {firebaseError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {firebaseError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading || isSubmitDisabled}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#4FC3F7', textDecoration: 'underline' }}>
              Create New Account
            </Link>
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, color: '#4FC3F7', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={handleForgotOpen}
          >
            Forgot Password?
          </Typography>
        </form>
      </Box>
      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onClose={handleForgotClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter your email address below. You will receive a password reset link if the account exists.
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={resetEmail}
            onChange={handleResetEmailChange}
            fullWidth
            disabled={resetLoading}
            required
          />
          {resetError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {resetError}
            </Alert>
          )}
          {resetSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {resetSuccess}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleForgotClose} disabled={resetLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResetSubmit}
            color="primary"
            disabled={resetLoading || !resetEmail}
          >
            {resetLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Login;
