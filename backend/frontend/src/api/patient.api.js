import api from './axios.js';
export const fetchPatients = () => api.get('/patients');
