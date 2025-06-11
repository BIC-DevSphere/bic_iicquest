// export const API_BASE_URL = "https://8b22-202-51-86-227.ngrok-free.app/api"
export const API_BASE_URL = "http://localhost:3000/api"

export const API_ENDPOINTS = {
    // Course endpoints
    getCoursesInfo: `${API_BASE_URL}/courses`,
    getCourseById: (id) => `${API_BASE_URL}/courses/${id}`,
    searchCourses: (query) => `${API_BASE_URL}/courses/search?query=${query}`,
    getCoursesByCategory: (category) => `${API_BASE_URL}/courses/category/${category}`,
    getCategoryCount: `${API_BASE_URL}/courses/category-count`,
    getCoursesByLearningOutcome: (outcome) => `${API_BASE_URL}/courses/learning-outcome?outcome=${outcome}`,

    // Course navigation endpoints
    getCourseChapters: (courseId) => `${API_BASE_URL}/courses/${courseId}/chapters`,
    getChapterDetails: (courseId, chapterId) => `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}`,
    getChapterLevels: (courseId, chapterId) => `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels`,
    getLevelDetails: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}`,
    getLevelContent: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/content`,
    getLevelTestCases: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/test-cases`,
    getNextLevel: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/next`,

    // Course creation endpoints
    createCourse: `${API_BASE_URL}/courses`,
    addChapter: (courseId) => `${API_BASE_URL}/courses/${courseId}/chapters`,
    addLevel: (courseId, chapterId) => `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels`,
    addContent: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/content`,
    addTestCase: (courseId, chapterId, levelId) => 
        `${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/levels/${levelId}/test-cases`,
    updateCourseStatus: (courseId) => `${API_BASE_URL}/courses/${courseId}/status`,
}