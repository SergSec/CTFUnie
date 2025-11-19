import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import api from '../../services/api';

export default function ClientCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [files, setFiles] = useState([]);

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

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Mis Casos
      </Typography>

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
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{c.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{c.description}</Typography>
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

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {['aceptado', 'pendiente_cita'].includes(c.status) && (
                    <Button variant="contained" onClick={() => handleOpen(c)}>Solicitar / Agendar Cita</Button>
                  )}
                  <Button variant="outlined" href={`/cliente/casos/${c._id}`}>Ver Detalles</Button>
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
    </Container>
  );
}
