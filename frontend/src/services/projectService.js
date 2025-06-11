import axiosInstance from '@/configs/axiosConfig';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Get all projects
export const getAllProjects = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getAllProjects);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get project by ID
export const getProjectById = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getProjectById(id));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get projects by technology
export const getProjectsByTechnology = async (technology) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getProjectsByTechnology(technology));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new project
export const createProject = async (projectData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.createProject, projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update project
export const updateProject = async (id, projectData) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateProject(id), projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Apply for role in project
export const applyForRole = async (projectId, roleData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.applyForRole(projectId), roleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get user's projects (created or collaborated)
export const getUserProjects = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getUserProjects);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update project status
export const updateProjectStatus = async (id, statusData) => {
    try {
        const response = await axiosInstance.patch(API_ENDPOINTS.updateProjectStatus(id), statusData);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 