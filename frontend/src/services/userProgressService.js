import axiosInstance from '@/configs/axiosConfig';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Initialize course progress for a user
export const initializeProgress = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.initializeProgress, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get course progress for current user
export const getCourseProgress = async (courseId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCourseProgress(courseId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update level progress
export const updateLevelProgress = async (data) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateLevelProgress, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Complete level test
export const completeLevelTest = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.completeLevelTest, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get user's overall progress
export const getUserProgress = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getAllProgress);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update chapter completion
export const completeChapter = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.completeChapter, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Complete entire course
export const completeCourse = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.completeCourse, data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all user progress
export const getAllProgress = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getAllProgress);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update test case progress
export const updateTestCaseProgress = async (progressData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateTestCaseProgress, progressData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update time spent on a level
export const updateTimeSpent = async (timeData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateTimeSpent, timeData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Abandon a course
export const abandonCourse = async (courseId) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.abandonCourse(courseId));
        return response.data;
    } catch (error) {
        throw error;
    }
}; 