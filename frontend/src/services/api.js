// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 20000,
  withCredentials: true // Include cookies if needed
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Auto logout if 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

// Register with FormData
export const registerUser = async (formData) => {
  try {
    const response = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Login user
export const loginUser = async (payload) => {
  try {
    const response = await api.post('/users/login', payload);
    
    // Store user data in localStorage on successful login
    if (response.data?.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Get all users
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Get single user
export const getUser = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Update user with FormData
export const updateUser = async (id, formData) => {
  try {
    const response = await api.put(`/users/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Delete user
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// Logout user (clear localStorage)
export const logoutUser = () => {
  localStorage.removeItem('user');
  return Promise.resolve();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return !!user;
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || 'null');
};

export default api;