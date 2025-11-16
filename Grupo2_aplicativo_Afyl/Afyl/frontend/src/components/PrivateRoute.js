import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Si el usuario es asesor e intenta acceder a una ruta solo de admin
    if (user.role === 'asesor' && allowedRoles.length === 1 && allowedRoles[0] === 'admin') {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <LockIcon sx={{ fontSize: 64, color: 'error.main' }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              Acceso Restringido
            </Typography>
            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>No tienes permisos para acceder a esta sección.</strong>
              </Typography>
              <Typography variant="body2">
                Como asesor, solo puedes acceder a las siguientes secciones:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li>Dashboard</li>
                <li>Casos asignados</li>
                <li>Mi Perfil</li>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Las funciones de administración (gestión de asesores, citas, pagos, etc.) están
                reservadas exclusivamente para usuarios con rol de administrador.
              </Typography>
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
              sx={{ mt: 2 }}
            >
              Volver
            </Button>
          </Paper>
        </Box>
      );
    }
    // Para otros casos, redirigir
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

