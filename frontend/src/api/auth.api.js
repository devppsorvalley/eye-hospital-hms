import api from './axios.js';
export const login = (payload) => api.post('/auth/login', payload);
