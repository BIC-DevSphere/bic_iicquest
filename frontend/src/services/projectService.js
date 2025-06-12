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

// Apply for project (general application)
export const applyForProject = async (projectId, applicationData) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.applyForProject(projectId), applicationData);
        return response.data;
    } catch (error) {
        throw error;
    }
}; 

// Get project applications (for project owner)
export const getProjectApplications = async (projectId) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.getProjectApplications(projectId));
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update application status
export const updateApplicationStatus = async (projectId, applicationId, status) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.updateApplicationStatus(projectId, applicationId), { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get project collaboration data (objectives, goals, chat)
export const getProjectCollaboration = async (projectId) => {
    try {
        const response = await axiosInstance.get(`/projects/${projectId}/collaboration`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add project objective
export const addProjectObjective = async (projectId, objectiveData) => {
    try {
        const response = await axiosInstance.post(`/projects/${projectId}/objectives`, objectiveData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update project objective
export const updateProjectObjective = async (projectId, objectiveId, updateData) => {
    try {
        const response = await axiosInstance.put(`/projects/${projectId}/objectives/${objectiveId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add weekly goals
export const addWeeklyGoals = async (projectId, goalsData) => {
    try {
        const response = await axiosInstance.post(`/projects/${projectId}/weekly-goals`, goalsData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update weekly goal completion
export const updateWeeklyGoal = async (projectId, weeklyGoalId, goalId, completionData) => {
    try {
        const response = await axiosInstance.put(`/projects/${projectId}/weekly-goals/${weeklyGoalId}/goals/${goalId}`, completionData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Send message to group chat
export const sendMessage = async (groupChatId, messageData) => {
    try {
        const response = await axiosInstance.post(`/projects/groupchat/${groupChatId}/message`, messageData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get group chat messages
export const getMessages = async (groupChatId) => {
    try {
        const response = await axiosInstance.get(`/projects/groupchat/${groupChatId}/messages`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update message
export const updateMessage = async (groupChatId, messageId, messageData) => {
    try {
        const response = await axiosInstance.put(`/projects/groupchat/${groupChatId}/message/${messageId}`, messageData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete message
export const deleteMessage = async (groupChatId, messageId) => {
    try {
        const response = await axiosInstance.delete(`/projects/groupchat/${groupChatId}/message/${messageId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Upload file to project
export const uploadProjectFile = async (projectId, fileData) => {
    try {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('description', fileData.description || '');
        
        const response = await axiosInstance.post(`/projects/${projectId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get project files
export const getProjectFiles = async (projectId) => {
    try {
        const response = await axiosInstance.get(`/projects/${projectId}/files`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete project file
export const deleteProjectFile = async (projectId, fileId) => {
    try {
        const response = await axiosInstance.delete(`/projects/${projectId}/files/${fileId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get project activity feed
export const getProjectActivity = async (projectId) => {
    try {
        const response = await axiosInstance.get(`/projects/${projectId}/activity`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Invite member to project
export const inviteProjectMember = async (projectId, inviteData) => {
    try {
        const response = await axiosInstance.post(`/projects/${projectId}/invite`, inviteData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Remove member from project
export const removeProjectMember = async (projectId, memberId) => {
    try {
        const response = await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update member role
export const updateMemberRole = async (projectId, memberId, roleData) => {
    try {
        const response = await axiosInstance.put(`/projects/${projectId}/members/${memberId}/role`, roleData);
        return response.data;
    } catch (error) {
        throw error;
    }
};