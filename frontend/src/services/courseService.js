import axiosInstance from '@/configs/axiosConfig';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCoursesInfo);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get course by ID
export const getCourseById = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCourseById(id));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Search courses
export const searchCourses = async (query) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.searchCourses(query));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get courses by category
export const getCoursesByCategory = async (category) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCoursesByCategory(category));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get category count
export const getCategoryCount = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCategoryCount);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get courses by learning outcome
export const getCoursesByLearningOutcome = async (outcome) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCoursesByLearningOutcome(outcome));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Course Navigation Services

// Get course chapters
export const getCourseChapters = async (courseId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getCourseChapters(courseId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get chapter by ID
export const getChapterById = async (courseId, chapterId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getChapterDetails(courseId, chapterId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get chapter levels
export const getChapterLevels = async (courseId, chapterId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getChapterLevels(courseId, chapterId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get level by ID
export const getLevelById = async (courseId, chapterId, levelId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getLevelDetails(courseId, chapterId, levelId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get level content
export const getLevelContent = async (courseId, chapterId, levelId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getLevelContent(courseId, chapterId, levelId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get level test cases
export const getLevelTestCases = async (courseId, chapterId, levelId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getLevelTestCases(courseId, chapterId, levelId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get next level
export const getNextLevel = async (courseId, chapterId, levelId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getNextLevel(courseId, chapterId, levelId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Legacy functions for backward compatibility
export const getChapterDetails = getChapterById;
export const getLevelDetails = getLevelById; 