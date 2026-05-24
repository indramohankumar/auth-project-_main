import API from './api';

export const getUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await API.put(`/users/${userId}/role`, { role });
  return response.data;
};