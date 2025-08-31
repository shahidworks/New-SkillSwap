import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Set base URL for API requests
  axios.defaults.baseURL = backendUrl;

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const response = await axios.get('/api/users/me');
      console.log('User data refreshed:', response.data.user);
      setUser(response.data.user);
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err.response?.data?.msg || 'Failed to refresh user data');
    }
  };

  // Set auth token if exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...');
      const response = await axios.get('/api/users/me');
      console.log('User data fetched:', response.data.user);
      setUser(response.data.user);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.msg || 'Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Registering user:', formData);
      const response = await axios.post('/api/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      await fetchUser();
      navigate('/home');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.msg || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Logging in with:', credentials);
      const response = await axios.post('/api/users/login', credentials);
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      await fetchUser();
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('Updating profile with:', profileData);
      const response = await axios.put('/api/users/me', profileData);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.msg || 'Failed to update profile');
      throw err;
    }
  };

  const updateAvatar = async (file) => {
    try {
      console.log('Updating avatar with file:', file);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.put('/api/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError(err.response?.data?.msg || 'Failed to update avatar');
      throw err;
    }
  };

  const addSkill = async (skillData) => {
    try {
      console.log('Adding skill:', skillData);
      const response = await axios.post('/api/users/skills', skillData);
      await fetchUser(); // Refresh user data
      return response.data;
    } catch (err) {
      console.error('Error adding skill:', err);
      setError(err.response?.data?.msg || 'Failed to add skill');
      throw err;
    }
  };

  const removeSkill = async (skillId, type) => {
    try {
      console.log(`Removing ${type} skill with ID:`, skillId);
      await axios.delete(`/api/users/skills/${type}/${skillId}`);
      await fetchUser(); // Refresh user data
    } catch (err) {
      console.error('Error removing skill:', err);
      setError(err.response?.data?.msg || 'Failed to remove skill');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        register,
        login,
        logout,
        fetchUser,
        updateProfile,
        updateAvatar,
        addSkill,
        removeSkill,
        setError,
        refreshUser
      }}
    >
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