import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Divider,
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password);

    if (result.success) {
      navigate('/admin/dashboard');
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
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
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
                Afyl Legal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Plataforma de Asesoría Legal-Financiera
              </Typography>
            </Box>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Iniciar Sesión
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
                  id="identifier"
                  label="Correo Electrónico o Nombre de Usuario"
                  name="identifier"
                  autoComplete="username"
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="Puedes usar tu correo electrónico o tu nombre de usuario"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    El acceso al panel se gestiona por el equipo de Afyl. 
                    Contacta con un administrador para crear o activar tu cuenta.
                  </Typography>
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

