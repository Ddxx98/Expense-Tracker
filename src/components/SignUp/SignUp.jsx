// src/components/SignUp.jsx
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { auth, createUserWithEmailAndPassword } from '../../firebase';
import { Link } from 'react-router-dom';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate inputs before submit
  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email address is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Confirm Password is required';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('User has successfully signed up', userCredential.user);

    } catch (error) {
      console.error(error);
      setFirebaseError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = !formData.email || !formData.password || !formData.confirmPassword;

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
          Sign Up
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
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            type="email"
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

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading || isSubmitDisabled}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4FC3F7', textDecoration: 'underline' }}>
              Login here
            </Link>
          </Typography>
        </form>
      </Box>
    </Container>
  );
}

export default SignUp;
