import axios from 'axios';

// Dynamically determine API URL based on current location
const getApiUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }
  
  const protocol = window.location.protocol;
  const host = window.location.host;
  
  // For development, use localhost
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  
  // For production, use the same origin (Render URL)
  return `${protocol}//${host}/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
