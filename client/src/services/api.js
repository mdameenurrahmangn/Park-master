import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkmaster_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('parkmaster_token');
      localStorage.removeItem('parkmaster_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;