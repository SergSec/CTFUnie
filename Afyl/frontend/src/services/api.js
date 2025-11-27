import axios from 'axios';

// Usar el mismo puerto en el que corre el frontend (para que 6969 use su propio backend)
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  const port = window.location.port || '5000';
  return `http://${window.location.hostname}:${port}/api`;
};

export const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow sending cookies for cookie-based auth (backend sets httpOnly cookie for admin/asesor)
  withCredentials: true,
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginSource');

      // Redirect to appropriate login page based on stored role or default to cliente login
      const storedRole = localStorage.getItem('userRole');
      if (storedRole === 'admin') {
        window.location.href = '/admin/login';
      } else if (storedRole === 'asesor') {
        window.location.href = '/asesor/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

