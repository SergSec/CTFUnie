import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as ConfirmedIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectedIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ClientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    caseId: '',
    scheduledDate: '',
    duration: 30,
    type: 'videollamada',
    notes: '',
  });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchCases();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      setAlert({ type: 'error', message: 'Error al cargar las citas' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      // Filtrar solo casos aceptados o en proceso que tengan asesor asignado
      const acceptedCases = response.data.cases.filter(
        c => (c.status === 'aceptado' || c.status === 'en_proceso') && c.advisorId
      );
      setCases(acceptedCases);
    } catch (error) {
      console.error('Error al cargar casos:', error);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);
    setFormData({ 
      caseId: cases.length > 0 ? cases[0]._id : '',
      scheduledDate: minDate,
      duration: 30,
      type: 'videollamada',
      notes: '',
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      caseId: '',
      scheduledDate: '',
      duration: 30,
      type: 'videollamada',
      notes: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.caseId) {
      setAlert({ type: 'error', message: 'Debes seleccionar un caso' });
      return;
    }
    if (!formData.scheduledDate) {
      setAlert({ type: 'error', message: 'La fecha y hora son requeridas' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/appointments', formData);

      setAlert({
        type: 'success',
        message: 'Solicitud de cita enviada. El asesor confirmará la disponibilidad.',
      });
      handleCloseDialog();
      fetchAppointments();
    } catch (error) {
      console.error('Error al crear cita:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al crear la solicitud de cita',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'solicitada':
        return {
          color: 'warning',
          icon: <PendingIcon />,
          label: 'Pendiente',
          description: 'El asesor revisará la disponibilidad',
        };
      case 'confirmada':
        return {
          color: 'success',
          icon: <ConfirmedIcon />,
          label: 'Confirmada',
          description: 'Cita confirmada por el asesor',
        };
      case 'rechazada':
        return {
          color: 'error',
          icon: <RejectedIcon />,
          label: 'Rechazada',
          description: 'Proponer otra fecha',
        };
      case 'cancelada':
        return {
          color: 'default',
          icon: <RejectedIcon />,
          label: 'Cancelada',
          description: 'Cita cancelada',
        };
      case 'completada':
        return {
          color: 'info',
          icon: <ConfirmedIcon />,
          label: 'Completada',
          description: 'Cita realizada',
        };
      default:
        return {
          color: 'default',
          icon: <PendingIcon />,
          label: status,
          description: '',
        };
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

  if (!loading && cases.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          Debes tener un caso aceptado para solicitar citas. Por favor, espera a que tu caso sea revisado y aceptado por un asesor.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Mis Citas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          size="large"
        >
          Solicitar Cita
        </Button>
      </Box>

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
            No tienes citas programadas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Solicita tu primera cita con el asesor
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Solicitar Cita
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {appointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            const isConfirmed = appointment.status === 'confirmada';
            
            return (
              <Grid item xs={12} md={6} key={appointment._id}>
                <Card
                  sx={{
                    borderLeft: `4px solid`,
                    borderLeftColor: `${statusInfo.color}.main`,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(appointment.type)}
                        <Typography variant="h6">
                          {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                        </Typography>
                      </Box>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fecha y Hora:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
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

                    {appointment.advisorId && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Asesor:
                        </Typography>
                        <Typography variant="body1">
                          {appointment.advisorId.name}
                        </Typography>
                      </Box>
                    )}

                    {appointment.notes && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Notas:
                        </Typography>
                        <Typography variant="body2">
                          {appointment.notes}
                        </Typography>
                      </Box>
                    )}

                    {appointment.status === 'rechazada' && appointment.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Motivo del rechazo:</strong> {appointment.rejectionReason}
                        </Typography>
                      </Alert>
                    )}

                    {isConfirmed && appointment.teamsLink && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<VideoIcon />}
                        href={appointment.teamsLink}
                        target="_blank"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Unirse a la Reunión
                      </Button>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 2 }}
                    >
                      {statusInfo.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar Nueva Cita</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }} required>
              <InputLabel>Caso</InputLabel>
              <Select
                value={formData.caseId}
                label="Caso"
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
              >
                {cases.map((caseItem) => (
                  <MenuItem key={caseItem._id} value={caseItem._id}>
                    {caseItem.title} - {caseItem.advisorId?.name || 'Sin asesor'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Fecha y Hora"
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
              sx={{ mb: 2 }}
              required
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Cita</InputLabel>
              <Select
                value={formData.type}
                label="Tipo de Cita"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="videollamada">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideoIcon /> Videollamada
                  </Box>
                </MenuItem>
                <MenuItem value="telefonica">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon /> Telefónica
                  </Box>
                </MenuItem>
                <MenuItem value="presencial">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon /> Presencial
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Duración</InputLabel>
              <Select
                value={formData.duration}
                label="Duración"
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              >
                <MenuItem value={30}>30 minutos</MenuItem>
                <MenuItem value={60}>1 hora</MenuItem>
                <MenuItem value={90}>1.5 horas</MenuItem>
                <MenuItem value={120}>2 horas</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notas (opcional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Agrega cualquier información adicional que el asesor deba conocer..."
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              El asesor revisará tu solicitud y confirmará si la fecha y hora están disponibles.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Enviar Solicitud'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

