import axios from 'axios';
import i18n from '../i18n';

const API_URL = 'http://localhost:8000/api';

// Add request interceptor for auth token
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // Transform error message based on current language
        const message = error.response?.data?.detail || error.message;
        error.message = message;
        
        return Promise.reject(error);
    }
);

const courseService = {
    async getAllCourses() {
        try {
            console.log('Fetching from:', `${API_URL}/courses/`);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/`);
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    async getCourseById(courseId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/${courseId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error;
        }
    },

    async enrollInCourse(courseId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.post(`${API_URL}/courses/${courseId}/enroll/`);
            return response.data;
        } catch (error) {
            console.error('Error enrolling in course:', error);
            throw error;
        }
    },

    async rateCourse(courseId, rating, review) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.post(`${API_URL}/courses/${courseId}/rate/`, {
                rating,
                review,
            });
            return response.data;
        } catch (error) {
            console.error('Error rating course:', error);
            throw error;
        }
    },

    async getEnrolledCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/enrolled/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            throw error;
        }
    },

    async getCourseLessons(courseId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/${courseId}/lessons/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course lessons:', error);
            throw error;
        }
    },

    async getLessonContent(courseId, lessonId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/${courseId}/lessons/${lessonId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching lesson content:', error);
            throw error;
        }
    },

    async markLessonComplete(courseId, lessonId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.post(`${API_URL}/courses/${courseId}/lessons/${lessonId}/complete/`);
            return response.data;
        } catch (error) {
            console.error('Error marking lesson as complete:', error);
            throw error;
        }
    },

    async getCourseProgress(courseId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/${courseId}/progress/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course progress:', error);
            throw error;
        }
    },

    async getCourseReviews(courseId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error(i18n.t('errors.auth.required'));
            }
            const response = await axios.get(`${API_URL}/courses/${courseId}/reviews/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course reviews:', error);
            throw error;
        }
    },

    getLessonsByCourse: async (courseId) => {
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}/lessons/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch lessons' };
        }
    },

    getLessonById: async (courseId, lessonId) => {
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}/lessons/${lessonId}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch lesson' };
        }
    },

    updateLessonProgress: async (courseId, lessonId, progressData) => {
        try {
            const response = await axios.post(
                `${API_URL}/courses/${courseId}/lessons/${lessonId}/progress/`,
                progressData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update lesson progress' };
        }
    },

    createCourse: async (courseData) => {
        try {
            const response = await axios.post(`${API_URL}/courses/`, courseData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error creating course' };
        }
    },

    updateCourse: async (courseId, courseData) => {
        try {
            const response = await axios.put(`${API_URL}/courses/${courseId}/`, courseData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error updating course' };
        }
    },

    deleteCourse: async (courseId) => {
        try {
            await axios.delete(`${API_URL}/courses/${courseId}/`);
        } catch (error) {
            throw error.response?.data || { message: 'Error deleting course' };
        }
    },

    getLessonNotes: async (courseId, lessonId) => {
        const response = await axios.get(`${API_URL}/courses/${courseId}/lessons/${lessonId}/notes`);
        return response.data;
    },

    addLessonNote: async (courseId, lessonId, noteData) => {
        const response = await axios.post(`${API_URL}/courses/${courseId}/lessons/${lessonId}/notes`, noteData);
        return response.data;
    },

    updateLessonNote: async (courseId, lessonId, noteId, noteData) => {
        const response = await axios.put(
            `${API_URL}/courses/${courseId}/lessons/${lessonId}/notes/${noteId}`,
            noteData
        );
        return response.data;
    },

    deleteLessonNote: async (courseId, lessonId, noteId) => {
        await axios.delete(`${API_URL}/courses/${courseId}/lessons/${lessonId}/notes/${noteId}`);
    },

    shareNote: async (courseId, lessonId, noteId, shareData) => {
        try {
            const response = await axios.post(
                `${API_URL}/courses/${courseId}/lessons/${lessonId}/notes/${noteId}/share/`,
                shareData
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error sharing note' };
        }
    },

    exportNotes: async (courseId, lessonId, format = 'json') => {
        try {
            const response = await axios.get(
                `${API_URL}/courses/${courseId}/lessons/${lessonId}/notes/export/`,
                {
                    params: { format },
                    responseType: 'blob',
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error exporting notes' };
        }
    },

    getCourseEnrolledUsers: async (courseId) => {
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}/enrolled-users/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching enrolled users' };
        }
    },

    getLessonTags: async (courseId, lessonId) => {
        try {
            const response = await axios.get(
                `${API_URL}/courses/${courseId}/lessons/${lessonId}/notes/tags/`
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error fetching tags' };
        }
    },

    async getFeaturedCourses() {
        try {
            const response = await axios.get(`${API_URL}/featured-courses/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching featured courses:', error);
            throw error;
        }
    },

    async getTestimonials() {
        try {
            const response = await axios.get(`${API_URL}/testimonials/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            throw error;
        }
    },
};

export default courseService; 