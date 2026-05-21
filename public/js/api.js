const API_BASE = '/api';

const api = {
    async request(endpoint, method = 'GET', body = null, isFormData = false) {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['x-auth-token'] = token;
        if (!isFormData) headers['Content-Type'] = 'application/json';

        const config = {
            method,
            headers,
            body: isFormData ? body : (body ? JSON.stringify(body) : null)
        };

        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API Error');
        return data;
    },

    auth: {
        register: (data) => api.request('/auth/register', 'POST', data),
        login: (data) => api.request('/auth/login', 'POST', data),
        getMe: () => api.request('/auth/me')
    },

    posts: {
        getAll: (category) => api.request(`/posts${category ? `?category=${category}` : ''}`),
        create: (formData) => api.request('/posts', 'POST', formData, true),
        like: (id) => api.request(`/posts/${id}/like`, 'POST'),
        comment: (id, text) => api.request(`/posts/${id}/comment`, 'POST', { text })
    },

    stories: {
        getAll: () => api.request('/stories'),
        create: (formData) => api.request('/stories', 'POST', formData, true)
    },

    users: {
        updateProfile: (formData) => api.request('/users/profile', 'PUT', formData, true),
        getNearby: (lng, lat) => api.request(`/users/nearby?lng=${lng}&lat=${lat}`),
        search: (query) => api.request(`/users/search?q=${query}`)
    },

    chat: {
        getRecent: () => api.request('/chat/recent'),
        getHistory: (userId) => api.request(`/chat/history/${userId}`)
    }
};
