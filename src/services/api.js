import axios from 'axios';

const API_URL = 'https://simenaback.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  register: async (name, email, password, experienceLevel) => {
    const { data } = await api.post('/auth/register', { name, email, password, experienceLevel });
    return data;
  }
};

export const promptService = {
  getList: async () => {
    const { data } = await api.get('/prompts/list');
    return data;
  },
  getContent: async (id) => {
    const { data } = await api.get(`/prompts/content/${id}`);
    return data;
  },
  review: async (promptText) => {
    const { data } = await api.post('/prompts/review', { promptText });
    return data;
  }
};

export const userService = {
  togglePayment: async () => {
    const { data } = await api.post('/users/toggle-payment', {});
    return data;
  }
};

export default api;
