import axiosInstance from '@/configs/axiosConfig';
import { API_ENDPOINTS } from '@/configs/apiConfigs';

// Get all community posts
export const getCommunityPosts = async () => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getCommunityPosts);
    return response.data;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

// Get community post by ID
export const getCommunityPostById = async (id) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.getCommunityPostById(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching community post:', error);
    throw error;
  }
};

// Create a new community post
export const createCommunityPost = async (postData) => {
  try {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('body', postData.body);
    
    if (postData.image) {
      formData.append('image', postData.image);
    }

    const response = await axiosInstance.post(API_ENDPOINTS.createCommunityPost, formData);
    return response.data;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
};

// Comment on a post
export const commentOnPost = async (postId, commentData) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.commentOnPost(postId), commentData);
    return response.data;
  } catch (error) {
    console.error('Error commenting on post:', error);
    throw error;
  }
}; 