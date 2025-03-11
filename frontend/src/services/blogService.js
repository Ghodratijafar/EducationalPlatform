import axios from 'axios';
import { API_BASE_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        throw new Error('Authentication required');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const blogService = {
    // Posts
    getPosts: async (params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/blog/posts/`, { params });
        return response.data;
    },

    getPost: async (slug) => {
        const response = await axios.get(`${API_BASE_URL}/blog/posts/${slug}/`);
        return response.data;
    },

    createPost: async (postData) => {
        const response = await axios.post(`${API_BASE_URL}/blog/posts/`, postData, { headers: getHeaders() });
        return response.data;
    },

    updatePost: async (slug, postData) => {
        const response = await axios.put(`${API_BASE_URL}/blog/posts/${slug}/`, postData, { headers: getHeaders() });
        return response.data;
    },

    deletePost: async (slug) => {
        await axios.delete(`${API_BASE_URL}/blog/posts/${slug}/`, { headers: getHeaders() });
    },

    likePost: async (slug) => {
        const response = await axios.post(`${API_BASE_URL}/blog/posts/${slug}/like/`, {}, { headers: getHeaders() });
        return response.data;
    },

    bookmarkPost: async (slug) => {
        const response = await axios.post(`${API_BASE_URL}/blog/posts/${slug}/bookmark/`, {}, { headers: getHeaders() });
        return response.data;
    },

    sharePost: async (slug, platform) => {
        const response = await axios.post(`${API_BASE_URL}/blog/posts/${slug}/share/`, { platform }, { headers: getHeaders() });
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await axios.get(`${API_BASE_URL}/blog/categories/`);
        return response.data;
    },

    getCategory: async (slug) => {
        const response = await axios.get(`${API_BASE_URL}/blog/categories/${slug}/`);
        return response.data;
    },

    getCategoryPosts: async (slug, params = {}) => {
        const response = await axios.get(`${API_BASE_URL}/blog/categories/${slug}/posts/`, { params });
        return response.data;
    },

    // Tags
    getTags: async () => {
        const response = await axios.get(`${API_BASE_URL}/blog/tags/`);
        return response.data;
    },

    getTag: async (slug) => {
        const response = await axios.get(`${API_BASE_URL}/blog/tags/${slug}/`);
        return response.data;
    },

    // Comments
    getComments: async (postId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/blog/comments/`, {
                params: { post: postId }
            });
            return response.data;
        } catch (error) {
            console.error('Get comments error:', error);
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    createComment: async (commentData) => {
        try {
            const headers = getHeaders();
            const response = await axios.post(
                `${API_BASE_URL}/blog/comments/`, 
                {
                    content: commentData.content,
                    post: commentData.postId || commentData.post_id || commentData.post
                },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Create comment error:', error);
            if (error.message === 'Authentication required') {
                throw new Error('Please login to comment');
            }
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    updateComment: async (commentId, commentData) => {
        try {
            const headers = getHeaders();
            const response = await axios.put(
                `${API_BASE_URL}/blog/comments/${commentId}/`,
                {
                    content: commentData.content,
                    post: commentData.postId || commentData.post_id || commentData.post
                },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Update comment error:', error);
            if (error.message === 'Authentication required') {
                throw new Error('Please login to update comments');
            }
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    deleteComment: async (commentId) => {
        try {
            const headers = getHeaders();
            await axios.delete(`${API_BASE_URL}/blog/comments/${commentId}/`, { headers });
        } catch (error) {
            console.error('Delete comment error:', error);
            if (error.message === 'Authentication required') {
                throw new Error('Please login to delete comments');
            }
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    likeComment: async (commentId, postId) => {
        try {
            const headers = getHeaders();
            const response = await axios.post(
                `${API_BASE_URL}/blog/comments/${commentId}/like/`,
                { post: postId },
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Like comment error:', error);
            if (error.message === 'Authentication required') {
                throw new Error('لطفاً برای لایک کردن وارد شوید');
            }
            if (error.response?.status === 403) {
                throw new Error('شما اجازه لایک کردن این نظر را ندارید');
            }
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    replyToComment: async (commentId, commentData) => {
        try {
            const headers = getHeaders();
            if (!commentData.post && !commentData.postId && !commentData.post_id) {
                throw new Error('شناسه پست برای پاسخ به نظر الزامی است');
            }

            const requestData = {
                content: commentData.content,
                post: commentData.postId || commentData.post_id || commentData.post
            };
            
            const response = await axios.post(
                `${API_BASE_URL}/blog/comments/${commentId}/reply/`,
                requestData,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error('Reply to comment error:', error);
            if (error.message === 'Authentication required') {
                throw new Error('لطفاً برای پاسخ دادن وارد شوید');
            }
            if (error.response?.status === 403) {
                throw new Error('شما اجازه پاسخ دادن به این نظر را ندارید');
            }
            throw error.response?.data?.detail || error.response?.data || error.message;
        }
    },

    // Post View Count
    incrementViewCount: async (slug) => {
        const response = await axios.post(`${API_BASE_URL}/blog/posts/${slug}/view/`);
        return response.data;
    },

    // Social Share URLs
    getSocialShareUrls: (post) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(post.title);
        
        return {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            telegram: `https://t.me/share/url?url=${url}&text=${title}`,
            whatsapp: `https://api.whatsapp.com/send?text=${title}%20${url}`
        };
    }
};

export default blogService; 