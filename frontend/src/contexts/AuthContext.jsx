import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const cachedUser = localStorage.getItem('user_data');
        
        // Optimistic restore
        if (token && cachedUser) {
            setUser(JSON.parse(cachedUser));
            setLoading(false); // Immediate load
        }

        if (token) {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            // Update with fresh data
            setUser(data.user);
            localStorage.setItem('user_data', JSON.stringify(data.user));
          } else {
            // Token invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            setUser(null);
          }
        } else {
            setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, if we had cached user, we might want to keep it or clear it
        // For safety, let's keep it but maybe show a warning? 
        // Or just do nothing and let the next request fail if network is down.
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    console.log('Attempting login with API URL:', API_BASE_URL);
    const startTime = Date.now();
    
    try {
      console.log('Sending login request...');
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Login response received after', Date.now() - startTime, 'ms');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed with status:', response.status, 'Error:', errorData);
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, received token');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error after', Date.now() - startTime, 'ms:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to the server. Please try again later.' 
      };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, loading, login, register, logout
  }), [user, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};