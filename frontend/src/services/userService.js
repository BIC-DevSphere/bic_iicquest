import axiosInstance from '@/configs/axiosConfig';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Authentication Services

// Register user
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.register, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Login user
export const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.login, credentials);
        
        // Store token in localStorage if login successful
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Logout user
export const logoutUser = () => {
    localStorage.removeItem('authToken');
};

// Profile Services

// Get user profile
export const getUserProfile = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getProfile);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateProfile, profileData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update password
export const updatePassword = async (passwordData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updatePassword, passwordData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update learning goals
export const updateLearningGoals = async (goalsData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateLearningGoals, goalsData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
};

// Get stored token
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
}; 