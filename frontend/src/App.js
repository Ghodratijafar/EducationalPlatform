import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';
import theme from './theme';

// Components
import Navbar from './components/layout/Navbar';
import Home from './components/Home';
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import LessonContent from './components/courses/learning/LessonContent';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Profile from './components/auth/Profile';
import Blog from './components/blog/Blog';
import PostDetail from './components/blog/PostDetail';
import PrivateRoute from './components/routing/PrivateRoute';
import LanguageSwitcher from './components/common/LanguageSwitcher';

// Services and Actions
import authService from './services/authService';
import { setUser } from './store/slices/authSlice';

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize authentication
      authService.initializeAuth();
      // Setup axios interceptors for token expiration
      authService.setupAxiosInterceptors();

      try {
        // Try to get current user if token exists
        const user = await authService.getCurrentUser();
        store.dispatch(setUser(user));
      } catch (error) {
        console.error('Error initializing app:', error);
        store.dispatch(setUser(null));
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div dir={theme.direction}>
            <Navbar />
            <LanguageSwitcher />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<PostDetail />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/courses/:courseId/lessons/:lessonId"
                element={
                  <PrivateRoute>
                    <LessonContent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ThemeProvider>
      </CacheProvider>
    </Provider>
  );
};

export default App;
