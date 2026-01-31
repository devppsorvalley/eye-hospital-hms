import api from './axios.js';
export const fetchBilling = () => api.get('/billing');
