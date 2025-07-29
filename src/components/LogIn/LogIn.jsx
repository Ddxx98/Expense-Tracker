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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [firebaseError, setFirebaseError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

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
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" style={{ color: '#4FC3F7', textDecoration: 'underline' }}>
                            Create New Account
                        </Link>
                    </Typography>
                </form>
            </Box>
        </Container>
    );
}

export default Login;
