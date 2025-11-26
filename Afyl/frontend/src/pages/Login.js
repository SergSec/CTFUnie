import React, { useState, useEffect } from 'react';
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
  const [lastLog, setLastLog] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // fetch last audit log to show on login (info for admins)
    let mounted = true;
    const fetchLastLog = async () => {
      try {
        const res = await fetch('/api/auditlogs?limit=1');
        if (!mounted) return;
        const json = await res.json();
        if (json && json.data && json.data.length) {
          setLastLog(json.data[0]);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchLastLog();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(identifier, password, 'cliente');

    if (result.success) {
      // Redirigir al dashboard de cliente
      navigate('/cliente/dashboard');
    } else {
      setError(result.message || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 50%, #0d47a1 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0) 70%)',
        animation: 'pulse 15s infinite ease-in-out',
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0) 70%)',
        animation: 'pulse 10s infinite ease-in-out reverse',
      }} />



      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }} className="animate-fade-in">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Card
            className="glass-card"
            sx={{
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.9) 0%, rgba(13, 71, 161, 0.9) 100%)',
                p: 4,
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />

              <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 0.5, letterSpacing: '-0.02em' }}>
                Afyl Legal
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Portal de Clientes
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Iniciar Sesión
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  variant="outlined"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    borderWidth: '1px',
                  }}
                >
                  {error}
                </Alert>
              )}

              {lastLog && (
                <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="caption" display="block">
                    Última actividad del sistema:
                  </Typography>
                  {lastLog.action} - {new Date(lastLog.createdAt).toLocaleString()}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="identifier"
                  label="Correo Electrónico o Usuario"
                  name="identifier"
                  autoComplete="username"
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
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
                  sx={{ mb: 4 }}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.8,
                    mb: 3,
                    fontSize: '1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 8px 16px rgba(26, 35, 126, 0.2)',
                    color: 'white', // Force white text
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Acceder a mi cuenta'
                  )}
                </Button>

                <Box sx={{ position: 'relative', my: 3 }}>
                  <Divider />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'background.paper',
                      px: 2,
                      color: 'text.secondary'
                    }}
                  >
                    o
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ¿Necesitas asistencia legal?
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/consulta-online')}
                    sx={{
                      fontWeight: 600,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      color: 'white',
                      bgcolor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      }
                    }}
                  >
                    Iniciar Consulta Online
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Typography
            variant="caption"
            sx={{
              mt: 4,
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
            }}
          >
            © {new Date().getFullYear()} Afyl Legal. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

