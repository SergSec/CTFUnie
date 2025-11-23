import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      // No token in localStorage: try cookie-based session (for advisors/admin)
      (async () => {
        try {
          // Make a single request with credentials to check cookie session
          const prev = axios.defaults.withCredentials;
          axios.defaults.withCredentials = true;
          await fetchUser();
          axios.defaults.withCredentials = prev;
        } catch (e) {
          setLoading(false);
        }
      })();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      const userData = response.data.user;
      
      // Validate that stored role matches fetched user role
      const storedRole = localStorage.getItem('userRole');
      if (storedRole && storedRole !== userData.role) {
        console.warn('Role mismatch detected - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginSource');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginSource');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password, loginSource = 'general') => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password,
        loginSource, // Send login source to backend for validation
      }, { withCredentials: true });

      // Backend returns { success: true, token, user: { id, name, email, role } }
      const { token, user } = response.data;
      
      if (!token || !user) {
        return {
          success: false,
          message: 'Respuesta inválida del servidor',
        };
      }

      // Validate that user role matches the expected login source
      if (loginSource !== 'general') {
        if (loginSource === 'admin' && user.role !== 'admin') {
          return {
            success: false,
            message: 'Este formulario es exclusivo para administradores.',
          };
        }
        if (loginSource === 'asesor' && user.role !== 'asesor') {
          return {
            success: false,
            message: 'Este formulario es exclusivo para asesores.',
          };
        }
        if (loginSource === 'cliente' && user.role !== 'cliente') {
          return {
            success: false,
            message: 'Este formulario es exclusivo para clientes.',
          };
        }
      }

      console.log('Frontend: Login successful for role:', user.role, 'from source:', loginSource);

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role); // Store role for quick access
      localStorage.setItem('loginSource', loginSource); // Store login source
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Check if backend returned a wrongLoginSource error
      if (error.response?.data?.wrongLoginSource) {
        return {
          success: false,
          message: error.response.data.message,
          wrongLoginSource: true,
          userRole: error.response.data.userRole,
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario',
      };
    }
  };

  const logout = () => {
    // Try to clear server cookie as well
    try {
      axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {});
    } catch (e) {}

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginSource');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const isClient = user?.role === 'cliente';
  const isAdvisor = user?.role === 'asesor';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        isClient,
        isAdvisor,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

