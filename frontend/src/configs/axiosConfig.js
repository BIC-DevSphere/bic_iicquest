import axios from 'axios';
import { API_BASE_URL } from './apiConfigs';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData requests, remove content-type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing token');
      localStorage.removeItem('authToken');
      
      // Optional: Redirect to login page
      // window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.log('Access forbidden');
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.log('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 