// export const API_BASE_URL = "https://8b22-202-51-86-227.ngrok-free.app/api"
export const API_BASE_URL = "http://localhost:3000/api"

export const API_ENDPOINTS = {
    // Course endpoints
    getCoursesInfo: "/courses",
    getCourseById: (id) => `/courses/${id}`,
    searchCourses: (query) => `/courses/search?query=${query}`,
    getCoursesByCategory: (category) => `/courses/category/${category}`,
    getCategoryCount: "/courses/category-count",
    getCoursesByLearningOutcome: (outcome) => `/courses/learning-outcome?outcome=${outcome}`,

    // Course navigation endpoints
    getCourseChapters: (courseId) => `/courses/${courseId}/chapters`,
    getChapterDetails: (courseId, chapterId) => `/courses/${courseId}/chapters/${chapterId}`,
    getChapterLevels: (courseId, chapterId) => `/courses/${courseId}/chapters/${chapterId}/levels`,
    getLevelDetails: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}`,
    getLevelContent: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/content`,
    getLevelTestCases: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/test-cases`,
    getNextLevel: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/next`,

    // Course creation endpoints
    createCourse: "/courses",
    addChapter: (courseId) => `/courses/${courseId}/chapters`,
    addLevel: (courseId, chapterId) => `/courses/${courseId}/chapters/${chapterId}/levels`,
    addContent: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/content`,
    addTestCase: (courseId, chapterId, levelId) => 
        `/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/test-cases`,
    updateCourseStatus: (courseId) => `/courses/${courseId}/status`,

    // Community endpoints
    getCommunityPosts: "/post",
    getCommunityPostById: (id) => `/post/${id}`,
    createCommunityPost: "/post",
    commentOnPost: (id) => `/post/comment/${id}`,
    
    // Project endpoints
    getAllProjects: "/projects",
    getProjectById: (id) => `/projects/${id}`,
    getProjectsByTechnology: (technology) => `/projects/technology/${technology}`,
    createProject: "/projects",
    updateProject: (id) => `/projects/${id}`,
    applyForRole: (id) => `/projects/${id}/apply`,
    applyForProject: (id) => `/projects/user/projects/apply/${id}`,
    getUserProjects: "/projects/user/projects",
    updateProjectStatus: (id) => `/projects/${id}/status`,
    getProjectApplications: (id) => `/projects/${id}/applications`,
    updateApplicationStatus: (projectId, applicationId) => `/projects/${projectId}/applications/${applicationId}/status`,

    // User endpoints
    register: "/users/register",
    login: "/users/login",
    getProfile: "/users/profile",
    updateProfile: "/users/profile",
    updatePassword: "/users/password",
    updateLearningGoals: "/users/learning-goals",

    // User Progress endpoints
    initializeProgress: "/user-progress/initialize",
    getCourseProgress: (courseId) => `/user-progress/course/${courseId}`,
    getAllProgress: "/user-progress",
    updateLevelProgress: "/user-progress/level",
    completeLevelTest: "/user-progress/complete-test",
    completeChapter: "/user-progress/complete-chapter",
    completeCourse: "/user-progress/complete-course",
    
    // Legacy progress endpoints (for backward compatibility)
    updateTestCaseProgress: "/progress/test-case",
    updateTimeSpent: "/progress/time-spent",
    abandonCourse: (courseId) => `/progress/abandon/${courseId}`,
}