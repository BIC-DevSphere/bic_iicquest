// Get current user ID from stored JWT token
export const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Decode JWT token to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || payload.sub;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

// Get current user info from stored JWT token
export const getCurrentUserInfo = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // Decode JWT token to get user info
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId || payload.sub,
      username: payload.username,
      fullName: payload.fullName,
      email: payload.email
    };
  } catch (error) {
    console.error('Error extracting user info from token:', error);
    return null;
  }
}; 