import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { 
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon,
  VideoCall as VideoIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import api from '../../services/api';

export default function ClientCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [open, setOpen] = useState(false);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [files, setFiles] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    scheduledDate: '',
    duration: 30,
    type: 'videollamada',
    notes: '',
  });
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await api.get('/cases');
      setCases(res.data.cases || []);
    } catch (error) {
      console.error('Error fetching cases', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (caseItem) => {
    setSelectedCase(caseItem);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCase(null);
    setNotes('');
    setAppointmentDate('');
    setFiles([]);
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).slice(0, 5);
    setFiles(selected);
  };

  const handleSubmitRequest = async () => {
    if (!selectedCase) return;

    const form = new FormData();
    form.append('consulta', notes || 'Solicitud de cita');
    form.append('caseId', selectedCase._id);
    if (appointmentDate) form.append('appointmentDate', appointmentDate);
    selectedCase.serviceType && form.append('servicio', selectedCase.serviceType);
    files.forEach((f) => form.append('archivos', f));

    try {
      await api.post('/consultations/client', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleClose();
      fetchCases();
      alert('Solicitud enviada. El asesor la revisará y confirmará la cita.');
    } catch (error) {
      console.error('Error enviando solicitud', error);
      alert(error.response?.data?.message || 'Error al enviar la solicitud');
    }
  };

  const handleOpenAppointmentDialog = (caseItem) => {
    setSelectedCase(caseItem);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);
    setAppointmentData({
      scheduledDate: minDate,
      duration: 30,
      type: 'videollamada',
      notes: '',
    });
    setOpenAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = () => {
    setOpenAppointmentDialog(false);
    setSelectedCase(null);
    setAppointmentData({
      scheduledDate: '',
      duration: 30,
      type: 'videollamada',
      notes: '',
    });
  };

  const handleSubmitAppointment = async () => {
    if (!selectedCase) return;
    if (!appointmentData.scheduledDate) {
      setAlert({ type: 'error', message: 'La fecha y hora son requeridas' });
      return;
    }

    try {
      await api.post('/appointments', {
        caseId: selectedCase._id,
        ...appointmentData,
      });

      setAlert({
        type: 'success',
        message: 'Solicitud de cita enviada. El asesor confirmará la disponibilidad.',
      });
      handleCloseAppointmentDialog();
      fetchCases();
    } catch (error) {
      console.error('Error al crear cita:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al crear la solicitud de cita',
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Mis Casos
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
        <Typography>Cargando...</Typography>
      ) : cases.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" color="text.secondary">No hay casos asociados a tu cuenta.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {cases.map((c) => (
            <Grid item xs={12} md={6} key={c._id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{c.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{c.description}</Typography>
                    
                    {c.estimatedCost && c.estimatedCost > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`Precio: €${c.estimatedCost}`} 
                          color="success" 
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    )}
                    
                    {c.advisorId && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Asesor: {c.advisorId.name}
                      </Typography>
                    )}
                  </Box>
                  {
                    (() => {
                      const map = {
                        pendiente_revision: { label: 'Pendiente de revisión', color: 'default' },
                        aceptado: { label: 'Aceptado', color: 'success' },
                        rechazado: { label: 'Rechazado', color: 'error' },
                        pendiente_cita: { label: 'Pendiente de cita', color: 'warning' },
                        en_proceso: { label: 'En proceso', color: 'info' },
                        cerrado: { label: 'Cerrado', color: 'default' }
                      };
                      const info = map[c.status] || { label: c.status, color: 'default' };
                      return <Chip label={info.label} color={info.color} />;
                    })()
                  }
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['aceptado', 'pendiente_cita', 'en_proceso'].includes(c.status) && c.advisorId && (
                    <Button 
                      variant="contained" 
                      startIcon={<CalendarIcon />}
                      onClick={() => handleOpenAppointmentDialog(c)}
                      size="small"
                    >
                      Solicitar Cita
                    </Button>
                  )}
                  <Button 
                    variant="outlined" 
                    href={`/cliente/casos/${c._id}`}
                    size="small"
                  >
                    Ver Detalles
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Solicitar / Agendar Cita</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Envia una solicitud para agendar una cita con tu asesor. Si indicas fecha, la solicitud incluirá la propuesta de cita.
          </Typography>
          <TextField
            label="Notas / Descripción"
            multiline
            rows={4}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Fecha propuesta de cita"
            type="datetime-local"
            fullWidth
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
            Adjuntar archivos
            <input type="file" hidden multiple onChange={handleFileSelect} />
          </Button>

          {files.length > 0 && (
            <List>
              {files.map((f, i) => (
                <ListItem key={i}><ListItemText primary={f.name} /></ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitRequest}>Enviar Solicitud</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para solicitar cita directamente */}
      <Dialog open={openAppointmentDialog} onClose={handleCloseAppointmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar Cita para: {selectedCase?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Tu solicitud será enviada al asesor <strong>{selectedCase?.advisorId?.name}</strong> quien confirmará la disponibilidad.
            </Alert>

            <TextField
              fullWidth
              label="Fecha y Hora"
              type="datetime-local"
              value={appointmentData.scheduledDate}
              onChange={(e) => setAppointmentData({ ...appointmentData, scheduledDate: e.target.value })}
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
                value={appointmentData.type}
                label="Tipo de Cita"
                onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value })}
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
                value={appointmentData.duration}
                label="Duración"
                onChange={(e) => setAppointmentData({ ...appointmentData, duration: e.target.value })}
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
              value={appointmentData.notes}
              onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
              placeholder="Agrega cualquier información adicional..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitAppointment}>Enviar Solicitud</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
