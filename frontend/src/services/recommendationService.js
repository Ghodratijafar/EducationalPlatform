import api from './api';

const recommendationService = {
  getRecommendedCourses: async () => {
    try {
      const response = await api.get('/courses/recommendations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPersonalizedSuggestions: async () => {
    try {
      const response = await api.get('/courses/suggestions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPopularCourses: async () => {
    try {
      const response = await api.get('/courses/popular');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTrendingTopics: async () => {
    try {
      const response = await api.get('/courses/trending-topics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default recommendationService; 