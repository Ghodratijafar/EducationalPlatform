import axios from 'axios';
import { API_URL } from '../config';
import { setAuthToken, removeAuthToken } from '../utils/auth';

const authService = {
  login: async (credentials) => {
    try {
      // First try to get the token
      const response = await axios.post(`${API_URL}/api/token/`, {
        email: credentials.username,     // Changed from username to email
        password: credentials.password
      });

      if (response.data.access) {
        const token = response.data.access;
        setAuthToken(token);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        // Get user data after successful login
        const userResponse = await axios.get(`${API_URL}/api/users/me/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        return {
          token,
          refresh: response.data.refresh,
          user: userResponse.data
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        // If we have a specific error message from the server
        const errorMessage = error.response.data.detail || 
                           error.response.data.message ||
                           Object.values(error.response.data)[0]?.[0];
        throw new Error(errorMessage || 'Login failed');
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  },

  register: async (userData) => {
    try {
      const registerData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword || userData.password
      };
      
      const response = await axios.post(`${API_URL}/api/users/register/`, registerData);
      
      if (response.data) {
        // After successful registration, login the user
        return await authService.login({
          username: userData.email,
          password: userData.password
        });
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = 
          errorData.detail || 
          errorData.message ||
          errorData.confirm_password?.[0] ||
          Object.values(errorData)[0]?.[0] ||
          'Registration failed';
        throw new Error(errorMessage);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const response = await axios.get(`${API_URL}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Try to refresh token
        const newToken = await authService.refreshToken();
        if (newToken) {
          return authService.getCurrentUser();
        }
      }
      removeAuthToken();
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await axios.post(`${API_URL}/api/token/refresh/`, {
        refresh: refreshToken
      });

      if (response.data.access) {
        const token = response.data.access;
        setAuthToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  initializeAuth: () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Add axios interceptor to handle token expiration
  setupAxiosInterceptors: () => {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh token
            const newToken = await authService.refreshToken();
            if (newToken) {
              // Retry original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
          
          // If refresh failed, logout and redirect to login
          authService.logout();
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  },
};

export default authService; 