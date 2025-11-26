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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
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
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = async () => {
    try {
      await api.put(`/users/${user._id}`, { password: newPassword });
      alert('Contraseña actualizada correctamente');
      setOpenPasswordDialog(false);
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error al actualizar la contraseña');
    }
  };

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
      icon: <CaseIcon sx={{ fontSize: 32 }} />,
      color: '#1976d2',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      path: '/cliente/casos',
    },
    {
      title: 'Citas',
      description: 'Agendar y ver tus citas con asesores',
      icon: <AppointmentIcon sx={{ fontSize: 32 }} />,
      color: '#2e7d32',
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      path: '/cliente/citas',
      disabled: caseData && caseData.status !== 'aceptado',
    },
    {
      title: 'Foro',
      description: 'Participar en el foro de la comunidad',
      icon: <ForumIcon sx={{ fontSize: 32 }} />,
      color: '#ed6c02',
      gradient: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
      path: '/cliente/foro',
    },
    {
      title: 'Pagos',
      description: 'Ver historial de pagos y facturas',
      icon: <PaymentIcon sx={{ fontSize: 32 }} />,
      color: '#9c27b0',
      gradient: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      path: '/cliente/pagos',
    },
    {
      title: 'Chat',
      description: 'Contactar con tu asesor asignado',
      icon: <ChatIcon sx={{ fontSize: 32 }} />,
      color: '#0288d1',
      gradient: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
      path: '/cliente/mensajes',
      disabled: caseData && caseData.status !== 'aceptado',
    },
  ];

  const statusInfo = getCaseStatusInfo();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }} className="animate-fade-in">
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 5,
          borderRadius: 4,
          color: 'white',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          boxShadow: '0 20px 40px rgba(26, 35, 126, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bienvenido, {user?.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '800px' }}>
            Panel de Cliente - Gestiona tus casos y servicios legales con facilidad
          </Typography>
        </Box>
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -50,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -80,
          left: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
        }} />
      </Paper>

      {/* Mostrar credenciales temporales si el usuario es temporal */}
      {user && user.isTemporary && user.expiresAt && (
        <Alert
          severity="info"
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(2, 136, 209, 0.15)',
            border: '1px solid rgba(2, 136, 209, 0.3)'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Cuenta Temporal
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tu cuenta expira el: {new Date(user.expiresAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
          <Box sx={{ p: 1.5, bgcolor: 'rgba(2, 136, 209, 0.08)', borderRadius: 2, display: 'inline-block' }}>
            <Typography variant="body2">
              Contraseña temporal: <strong>{user.temporaryPassword}</strong>
            </Typography>
          </Box>
          <Typography variant="caption" display="block" sx={{ mt: 1.5, color: 'text.secondary' }}>
            Guarda estas credenciales. Si tu caso es aceptado, tu cuenta se hará permanente.
          </Typography>
        </Alert>
      )}

      {/* Estado del caso */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : statusInfo && (
        <Card
          className="glass-card"
          sx={{
            mb: 5,
            borderLeft: `6px solid`,
            borderLeftColor: `${statusInfo.color}.main`,
            overflow: 'visible'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  color: `${statusInfo.color}.main`,
                  mr: 2,
                  p: 1.5,
                  borderRadius: '50%',
                  bgcolor: (theme) => theme.palette[statusInfo.color].light + '20',
                  display: 'flex'
                }}
              >
                {React.cloneElement(statusInfo.icon, { fontSize: 'large' })}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {statusInfo.title}
                </Typography>
                <Chip
                  label={caseData.status.replace('_', ' ').toUpperCase()}
                  color={statusInfo.color}
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              </Box>
            </Box>

            <Alert
              severity={statusInfo.color}
              variant="outlined"
              sx={{
                mb: 3,
                borderRadius: 2,
                borderWidth: 2,
                '& .MuiAlert-icon': { fontSize: 24 }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {statusInfo.message}
              </Typography>
            </Alert>

            {statusInfo.showAppointment && (
              <Box sx={{
                mt: 3,
                p: 3,
                border: '1px dashed',
                borderColor: 'primary.main',
                borderRadius: 3,
                backgroundColor: 'rgba(26, 35, 126, 0.03)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                  📅 Agenda tu Cita con AFYL
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Hemos desactivado temporalmente la integración con Calendly para usar nuestro propio calendario interno.
                  Puedes gestionar tus citas desde el panel de <strong>Citas</strong>.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/cliente/citas')}
                  sx={{ borderRadius: 2, px: 4 }}
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

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Accesos Rápidos
      </Typography>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className="glass-card"
              sx={{
                height: '100%',
                cursor: action.disabled ? 'not-allowed' : 'pointer',
                opacity: action.disabled ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': action.disabled ? {} : {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                  '& .icon-box': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                },
              }}
              onClick={() => !action.disabled && navigate(action.path)}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box
                  className="icon-box"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 70,
                    height: 70,
                    borderRadius: '20px',
                    background: action.gradient,
                    color: 'white',
                    mb: 3,
                    mx: 'auto',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {action.icon}
                </Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  {action.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {action.description}
                </Typography>
                {action.disabled && (
                  <Chip
                    label="Bloqueado"
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ mt: 2, fontWeight: 600 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Password Change Dialog */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ingresa tu nueva contraseña para asegurar tu cuenta.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nueva Contraseña"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenPasswordDialog(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handlePasswordChange} variant="contained" color="primary">Actualizar</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Button
          variant="text"
          onClick={() => setOpenPasswordDialog(true)}
          sx={{
            color: 'text.secondary',
            textDecoration: 'underline',
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
          }}
        >
          Cambiar Contraseña
        </Button>
      </Box>
    </Container>
  );
}
