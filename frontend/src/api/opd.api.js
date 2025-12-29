import api from './axios.js';
export const fetchOPD = () => api.get('/opd');
