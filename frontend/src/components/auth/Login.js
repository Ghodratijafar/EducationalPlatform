import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
} from '@mui/material';
import authService from '../../services/authService';
import { setUser } from '../../store/slices/authSlice';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({
                username: formData.username,
                password: formData.password
            });
            
            // Update global state with user info
            dispatch(setUser(response.user));
            
            // Redirect to home page
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" align="center" gutterBottom>
                        {t('Sign in')}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label={t('Email')}
                            name="username"
                            type="email"
                            value={formData.username}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoFocus
                            autoComplete="email"
                        />
                        
                        <TextField
                            fullWidth
                            label={t('Password')}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? t('Signing in...') : t('Sign In')}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                                <Typography color="primary" sx={{ mb: 1 }}>
                                    {t('Forgot password?')}
                                </Typography>
                            </Link>
                            
                            <Typography variant="body2" color="text.secondary">
                                {t("Don't have an account?")}
                                {' '}
                                <Link to="/register" style={{ textDecoration: 'none' }}>
                                    <Typography component="span" color="primary">
                                        {t('Sign Up')}
                                    </Typography>
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login; 