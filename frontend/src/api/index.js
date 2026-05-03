import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://your-api-domain.com' 
  : 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const authApi = {
  register: (data) => api.post('/api/register', data),
  login: (data) => api.post('/api/login', data),
};

export const categoryApi = {
  getAll: () => api.get('/api/categories'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const cuisineApi = {
  getAll: () => api.get('/api/cuisines'),
  create: (data) => api.post('/api/cuisines', data),
};

export const tasteApi = {
  getAll: () => api.get('/api/tastes'),
  create: (data) => api.post('/api/tastes', data),
};

export const recipeApi = {
  getAll: (params = {}) => api.get('/api/recipes', { params }),
  getById: (id) => api.get(`/api/recipes/${id}`),
  create: (data) => api.post('/api/recipes', data),
  update: (id, data) => api.put(`/api/recipes/${id}`, data),
  delete: (id) => api.delete(`/api/recipes/${id}`),
  approve: (id) => api.post(`/api/recipes/${id}/approve`),
  reject: (id) => api.post(`/api/recipes/${id}/reject`),
  getByUser: (userId) => api.get(`/api/users/${userId}/recipes`),
};

export const favoriteApi = {
  getByUser: (userId) => api.get(`/api/favorites/${userId}`),
  add: (data) => api.post('/api/favorites', data),
  remove: (id) => api.delete(`/api/favorites/${id}`),
};

export const commentApi = {
  getByRecipe: (recipeId) => api.get(`/api/comments/${recipeId}`),
  create: (data) => api.post('/api/comments', data),
};

export default api;
