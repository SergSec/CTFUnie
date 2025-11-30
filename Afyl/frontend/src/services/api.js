import axios from 'axios';

// API Service v3.0 - Network compatible con URL dinámica
// La URL se calcula en cada petición basándose en window.location

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Allow sending cookies for cookie-based auth (backend sets httpOnly cookie for admin/asesor)
  withCredentials: true,
});

// Interceptor para establecer la baseURL dinámicamente en cada petición
api.interceptors.request.use(
  (config) => {
    // Calcular la URL del API basándose en la ubicación actual del navegador
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // Usar el mismo puerto que la página actual (para 6969 o 5000)
    const port = window.location.port || '5000';
    
    // Establecer baseURL dinámicamente
    if (!config.baseURL) {
      config.baseURL = protocol + '//' + hostname + ':' + port + '/api';
    }
    
    // Agregar token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función helper para obtener la URL actual (para logging)
export const getApiUrl = () => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  // Usar el mismo puerto que la página actual (para 6969 o 5000)
  const port = window.location.port || '5000';
  return protocol + '//' + hostname + ':' + port + '/api';
};

// API_URL dinámico - usa el puerto actual de la página
export const API_URL = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:${window.location.port || '5000'}/api`
  : '/api';

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
        window.location.href = '/privilegiados/login';
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

