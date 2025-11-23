import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'cliente',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role,
    });

    if (result.success) {
      // Redirigir según el rol del usuario
      const userRole = result.user?.role || 'cliente';
      if (userRole === 'admin' || userRole === 'asesor') {
        navigate('/admin/dashboard');
      } else {
        navigate('/cliente/dashboard');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card
            sx={{
              width: '100%',
              borderRadius: 4,
              boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                p: 3,
                textAlign: 'center',
                color: 'white',
              }}
            >
              <Avatar
                sx={{
                  m: '0 auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 64,
                  height: 64,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <GavelIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Crear Cuenta
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Únete a nuestra plataforma de asesoría legal
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <PersonAddIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Registro
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="name"
                  label="Nombre completo"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="email"
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="phone"
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="normal"
                  select
                  fullWidth
                  name="role"
                  label="Tipo de usuario"
                  value={formData.role}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="cliente">Cliente</MenuItem>
                  <MenuItem value="asesor">Asesor Legal</MenuItem>
                </TextField>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  helperText="Mínimo 6 caracteres"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Crear Cuenta'
                  )}
                </Button>
                <Divider sx={{ my: 3 }}>o</Divider>
                <Box sx={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      ¿Ya tienes cuenta? Inicia sesión aquí
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Typography
            variant="caption"
            sx={{
              mt: 3,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
            }}
          >
            © 2024 Afyl Legal. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

