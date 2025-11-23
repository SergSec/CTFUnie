import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Description as CaseIcon,
  CalendarToday as AppointmentIcon,
  Forum as ForumIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.caseId) {
      fetchCaseData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCaseData = async () => {
    try {
      const response = await api.get(`/cases/${user.caseId}`);
      setCaseData(response.data.case);
      
    } catch (error) {
      console.error('Error al cargar caso:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCaseStatusInfo = () => {
    if (!caseData) return null;

    const status = caseData.status;
    
    switch (status) {
      case 'pendiente_revision':
        return {
          color: 'warning',
          icon: <PendingIcon />,
          title: 'Caso en Revisión',
          message: 'Tu caso está siendo revisado por nuestros asesores. Te notificaremos cuando tengamos una respuesta.',
          showAppointment: false
        };
      case 'aceptado':
        return {
          color: 'success',
          icon: <CheckIcon />,
          title: '¡Caso Aceptado!',
          message: `Tu caso ha sido aceptado. Precio estimado: €${caseData.estimatedCost}`,
          showAppointment: true
        };
      case 'rechazado':
        return {
          color: 'error',
          icon: <CancelIcon />,
          title: 'Caso Rechazado',
          message: `Lo sentimos, no podemos atender tu caso en este momento. Razón: ${caseData.rejectionReason || 'No especificada'}. Tu cuenta será eliminada en 48 horas.`,
          showAppointment: false
        };
      default:
        return null;
    }
  };

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
      disabled: caseData && caseData.status !== 'aceptado',
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
      disabled: caseData && caseData.status !== 'aceptado',
    },
  ];

  const statusInfo = getCaseStatusInfo();

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

      {/* Mostrar credenciales temporales si el usuario es temporal */}
      {user && user.isTemporary && user.expiresAt && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Cuenta Temporal
          </Typography>
          <Typography variant="body2">
            Tu cuenta expira el: {new Date(user.expiresAt).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Tu contraseña temporal: <strong>{user.temporaryPassword}</strong>
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Guarda estas credenciales. Si tu caso es aceptado, tu cuenta se hará permanente.
          </Typography>
        </Alert>
      )}

      {/* Estado del caso */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : statusInfo && (
        <Card sx={{ mb: 4, borderLeft: `6px solid`, borderLeftColor: `${statusInfo.color}.main` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ color: `${statusInfo.color}.main`, mr: 2 }}>
                {statusInfo.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {statusInfo.title}
              </Typography>
              <Chip 
                label={caseData.status.replace('_', ' ').toUpperCase()} 
                color={statusInfo.color}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Alert severity={statusInfo.color} sx={{ mb: 2 }}>
              {statusInfo.message}
            </Alert>
            
            {statusInfo.showAppointment && (
              <Box sx={{ mt: 3, p: 3, border: '1px dashed', borderColor: 'divider', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.8)' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📅 Agenda tu Cita con AFYL
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Hemos desactivado temporalmente la integración con Calendly para usar nuestro propio calendario interno.
                  Puedes gestionar tus citas desde el panel de <strong>Citas</strong>.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/cliente/citas')}
                >
                  Abrir Calendario Interno
                </Button>
              </Box>
            )}

            {!statusInfo.showAppointment && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Nota:</strong> Una vez que tu caso sea aceptado, podrás agendar una cita aquí mismo.
                </Typography>
              </Box>
            )}

            {caseData.status === 'rechazado' && user.deleteAt && (
              <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 600 }}>
                Tu cuenta será eliminada el: {new Date(user.deleteAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.5 : 1,
                transition: 'all 0.3s ease',
                '&:hover': action.disabled ? {} : {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 12px 24px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => !action.disabled && navigate(action.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: `${action.color}15`,
                    color: action.color,
                    mb: 2,
                    mx: 'auto',
                  }}
                >
                  {action.icon}
                </Box>
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {action.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  {action.description}
                </Typography>
                {action.disabled && (
                  <Chip
                    label="Bloqueado"
                    size="small"
                    color="warning"
                    sx={{ mt: 2, display: 'block', mx: 'auto', width: 'fit-content' }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
