import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recommendationService from '../../services/recommendationService';

export const fetchRecommendedCourses = createAsyncThunk(
  'recommendation/fetchRecommendedCourses',
  async () => {
    const response = await recommendationService.getRecommendedCourses();
    return response.data;
  }
);

export const fetchPersonalizedSuggestions = createAsyncThunk(
  'recommendation/fetchPersonalizedSuggestions',
  async () => {
    const response = await recommendationService.getPersonalizedSuggestions();
    return response.data;
  }
);

export const fetchPopularCourses = createAsyncThunk(
  'recommendation/fetchPopularCourses',
  async () => {
    const response = await recommendationService.getPopularCourses();
    return response.data;
  }
);

export const fetchTrendingTopics = createAsyncThunk(
  'recommendation/fetchTrendingTopics',
  async () => {
    const response = await recommendationService.getTrendingTopics();
    return response.data;
  }
);

const initialState = {
  recommendedCourses: [],
  personalizedSuggestions: [],
  popularCourses: [],
  trendingTopics: [],
  loading: false,
  error: null,
};

const recommendationSlice = createSlice({
  name: 'recommendation',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Recommended Courses
      .addCase(fetchRecommendedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecommendedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendedCourses = action.payload;
      })
      .addCase(fetchRecommendedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Personalized Suggestions
      .addCase(fetchPersonalizedSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalizedSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.personalizedSuggestions = action.payload;
      })
      .addCase(fetchPersonalizedSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Popular Courses
      .addCase(fetchPopularCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.popularCourses = action.payload;
      })
      .addCase(fetchPopularCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Trending Topics
      .addCase(fetchTrendingTopics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrendingTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.trendingTopics = action.payload;
      })
      .addCase(fetchTrendingTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default recommendationSlice.reducer; 