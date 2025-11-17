import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
} from '@mui/material';
import {
  Description as CaseIcon,
  CalendarToday as AppointmentIcon,
  Forum as ForumIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Mis Casos',
      description: 'Ver y gestionar tus casos legales',
      icon: <CaseIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/cliente/casos',
    },
    {
      title: 'Citas',
      description: 'Agendar y ver tus citas con asesores',
      icon: <AppointmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/cliente/citas',
    },
    {
      title: 'Foro',
      description: 'Participar en el foro de la comunidad',
      icon: <ForumIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/cliente/foro',
    },
    {
      title: 'Pagos',
      description: 'Ver historial de pagos y facturas',
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/cliente/pagos',
    },
    {
      title: 'Chat',
      description: 'Contactar con tu asesor asignado',
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      path: '/cliente/mensajes',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Bienvenido, {user?.name}
        </Typography>
        <Typography variant="body1">
          Panel de Cliente - Gestiona tus casos y servicios legales
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    bgcolor: action.color,
                    color: 'white',
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button fullWidth variant="outlined" color="primary">
                  Acceder
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Información de tu Cuenta
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Email:
            </Typography>
            <Typography variant="body1">{user?.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Rol:
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {user?.role}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Teléfono:
            </Typography>
            <Typography variant="body1">{user?.phone || 'No especificado'}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
