import axios from './axios';

export const login = async (username, password) => {
  const response = await axios.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async () => {
  await axios.post('/auth/logout');
};

export const changePassword = async (oldPassword, newPassword) => {
  const response = await axios.post('/auth/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};
