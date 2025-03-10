import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

// Async thunks
export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching courses...');
            const response = await courseService.getAllCourses();
            console.log('Fetched courses:', response);
            return response;
        } catch (error) {
            console.error('Error in fetchCourses thunk:', error);
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
        }
    }
);

export const fetchCourseById = createAsyncThunk(
    'courses/fetchCourseById',
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await courseService.getCourseById(courseId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch course details');
        }
    }
);

export const enrollInCourse = createAsyncThunk(
    'courses/enrollInCourse',
    async (courseId, { rejectWithValue }) => {
        try {
            const response = await courseService.enrollInCourse(courseId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to enroll in course');
        }
    }
);

export const rateCourse = createAsyncThunk(
    'courses/rateCourse',
    async ({ courseId, rating, review }, { rejectWithValue }) => {
        try {
            const response = await courseService.rateCourse(courseId, rating, review);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to rate course');
        }
    }
);

const initialState = {
    courses: [],
    currentCourse: null,
    enrolledCourses: [],
    loading: false,
    error: null,
    courseLoading: false,
    courseError: null,
    enrollmentLoading: false,
    enrollmentError: null,
    ratingLoading: false,
    ratingError: null,
};

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        clearCourseError: (state) => {
            state.error = null;
            state.courseError = null;
            state.enrollmentError = null;
            state.ratingError = null;
        },
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all courses
        builder
            .addCase(fetchCourses.pending, (state) => {
                console.log('fetchCourses.pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                console.log('fetchCourses.fulfilled:', action.payload);
                state.loading = false;
                state.courses = action.payload;
                state.error = null;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                console.log('fetchCourses.rejected:', action.payload);
                state.loading = false;
                state.error = action.payload;
            })

        // Fetch course by ID
            .addCase(fetchCourseById.pending, (state) => {
                state.courseLoading = true;
                state.courseError = null;
            })
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.courseLoading = false;
                state.currentCourse = action.payload;
                state.courseError = null;
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.courseLoading = false;
                state.courseError = action.payload;
            })

        // Enroll in course
            .addCase(enrollInCourse.pending, (state) => {
                state.enrollmentLoading = true;
                state.enrollmentError = null;
            })
            .addCase(enrollInCourse.fulfilled, (state, action) => {
                state.enrollmentLoading = false;
                state.enrolledCourses.push(action.payload);
                if (state.currentCourse?.id === action.payload.courseId) {
                    state.currentCourse.isEnrolled = true;
                }
                state.enrollmentError = null;
            })
            .addCase(enrollInCourse.rejected, (state, action) => {
                state.enrollmentLoading = false;
                state.enrollmentError = action.payload;
            })

        // Rate course
            .addCase(rateCourse.pending, (state) => {
                state.ratingLoading = true;
                state.ratingError = null;
            })
            .addCase(rateCourse.fulfilled, (state, action) => {
                state.ratingLoading = false;
                if (state.currentCourse?.id === action.payload.courseId) {
                    state.currentCourse.rating = action.payload.rating;
                    state.currentCourse.ratingCount = action.payload.ratingCount;
                    state.currentCourse.userRating = action.payload.userRating;
                }
                state.ratingError = null;
            })
            .addCase(rateCourse.rejected, (state, action) => {
                state.ratingLoading = false;
                state.ratingError = action.payload;
            });
    },
});

export const { clearCourseError, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer; 