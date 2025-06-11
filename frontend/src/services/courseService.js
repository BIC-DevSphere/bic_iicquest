import axios from 'axios';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.getCoursesInfo);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get course by ID
export const getCourseById = async (id) => {
    try {
        const response = await axios.get(API_ENDPOINTS.getCourseById(id));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Search courses
export const searchCourses = async (query) => {
    try {
        const response = await axios.get(API_ENDPOINTS.searchCourses(query));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get courses by category
export const getCoursesByCategory = async (category) => {
    try {
        const response = await axios.get(API_ENDPOINTS.getCoursesByCategory(category));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get category count
export const getCategoryCount = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.getCategoryCount);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get courses by learning outcome
export const getCoursesByLearningOutcome = async (outcome) => {
    try {
        const response = await axios.get(API_ENDPOINTS.getCoursesByLearningOutcome(outcome));
        return response.data;
    } catch (error) {
        throw error;
    }
}; 