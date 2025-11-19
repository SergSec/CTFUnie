import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AppointmentRequests() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      const response = await api.get('/appointments/pending-confirmation');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setAlert({ type: 'error', message: 'Error al cargar las solicitudes de citas' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (appointment, actionType) => {
    setSelectedAppointment(appointment);
    setAction(actionType);
    setRejectionReason('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
    setAction('');
    setRejectionReason('');
  };

  const handleSubmit = async () => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setAlert({ type: 'error', message: 'El motivo de rechazo es requerido' });
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = action === 'accept' ? 'confirm' : 'reject';
      await api.put(`/appointments/${selectedAppointment._id}/${endpoint}`, {
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      });

      setAlert({
        type: 'success',
        message: `Cita ${action === 'accept' ? 'confirmada' : 'rechazada'} exitosamente`,
      });
      handleCloseDialog();
      fetchPendingAppointments();
    } catch (error) {
      console.error('Error al procesar cita:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al procesar la solicitud',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'videollamada':
        return <VideoIcon />;
      case 'telefonica':
        return <PhoneIcon />;
      case 'presencial':
        return <LocationIcon />;
      default:
        return <EventIcon />;
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'asesor') {
    return (
      <Container>
        <Alert severity="error">No tienes permisos para acceder a esta página</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Solicitudes de Citas Pendientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Revisa y confirma las solicitudes de citas de tus clientes
      </Typography>

      {alert.message && (
        <Alert
          severity={alert.type}
          sx={{ mb: 3 }}
          onClose={() => setAlert({ type: '', message: '' })}
        >
          {alert.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay solicitudes de citas pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Todas las solicitudes han sido procesadas
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment._id}>
              <Card sx={{ borderLeft: '4px solid', borderLeftColor: 'warning.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(appointment.type)}
                      <Typography variant="h6">
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                      </Typography>
                    </Box>
                    <Chip label="Pendiente" color="warning" size="small" />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Cliente:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {appointment.clientId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.clientId.email}
                    </Typography>
                    {appointment.clientId.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Tel: {appointment.clientId.phone}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Caso:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {appointment.caseId.title}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha y Hora Propuesta:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {new Date(appointment.scheduledDate).toLocaleString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Duración:
                    </Typography>
                    <Typography variant="body1">
                      {appointment.duration} minutos
                    </Typography>
                  </Box>

                  {appointment.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Notas del Cliente:
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, mt: 0.5 }}
                      >
                        <Typography variant="body2">{appointment.notes}</Typography>
                      </Paper>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AcceptIcon />}
                      onClick={() => handleOpenDialog(appointment, 'accept')}
                      fullWidth
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleOpenDialog(appointment, 'reject')}
                      fullWidth
                    >
                      Rechazar
                    </Button>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Solicitada: {new Date(appointment.createdAt).toLocaleDateString('es-ES')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para confirmar/rechazar cita */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'accept' ? 'Confirmar Cita' : 'Rechazar Cita'}
        </DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Cliente:</strong> {selectedAppointment.clientId.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Fecha:</strong>{' '}
                {new Date(selectedAppointment.scheduledDate).toLocaleString('es-ES')}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                <strong>Tipo:</strong> {selectedAppointment.type}
              </Typography>

              {action === 'reject' && (
                <>
                  <TextField
                    fullWidth
                    label="Motivo del Rechazo"
                    multiline
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                    placeholder="Por ejemplo: No tengo disponibilidad en esa fecha. ¿Podrías proponer otra hora?"
                  />
                  <Alert severity="info" sx={{ mt: 2 }}>
                    El cliente recibirá una notificación con el motivo del rechazo y podrá proponer otra fecha.
                  </Alert>
                </>
              )}

              {action === 'accept' && (
                <Alert severity="success">
                  Al confirmar, el cliente recibirá una notificación y la cita aparecerá en ambos dashboards.
                  {selectedAppointment.type === 'videollamada' && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Se generará automáticamente un enlace de reunión.
                    </Typography>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === 'accept' ? 'success' : 'error'}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : action === 'accept' ? (
              'Confirmar Cita'
            ) : (
              'Rechazar Cita'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
