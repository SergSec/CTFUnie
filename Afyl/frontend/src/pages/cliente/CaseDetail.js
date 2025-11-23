import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip, List, ListItem, ListItemText, Alert, Button } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import api from '../../services/api';

const STATUS_MAP = {
  pendiente_revision: { label: 'Pendiente de revisión', color: 'default' },
  aceptado: { label: 'Aceptado', color: 'success' },
  rechazado: { label: 'Rechazado', color: 'error' },
  pendiente_cita: { label: 'Pendiente de cita', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'info' },
  cerrado: { label: 'Cerrado', color: 'default' }
};

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data.case);
    } catch (err) {
      console.error('Error fetching case', err);
    }
  };

  if (!caseData) return (
    <Container maxWidth="lg"><Typography>Cargando...</Typography></Container>
  );

  const statusInfo = STATUS_MAP[caseData.status] || { label: caseData.status, color: 'default' };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{caseData.title}</Typography>
      <Chip label={statusInfo.label} color={statusInfo.color} sx={{ mb: 2 }} />

      {['aceptado', 'pendiente_cita', 'en_proceso'].includes(caseData.status) && caseData.advisorId && (
        <Alert severity="info" sx={{ mb: 3 }} action={
          <Button 
            color="inherit" 
            size="small" 
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/cliente/casos')}
          >
            Solicitar Cita
          </Button>
        }>
          Tu caso ha sido aceptado. Puedes solicitar una cita con tu asesor para comenzar el proceso.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Descripción</Typography>
        <Typography variant="body2" color="text.secondary">{caseData.description}</Typography>
        
        {caseData.estimatedCost && caseData.estimatedCost > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.dark' }}>
              Precio Estimado: €{caseData.estimatedCost}
            </Typography>
          </Box>
        )}
        
        {caseData.advisorId && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Asesor Asignado:</Typography>
            <Typography variant="body2" color="text.secondary">
              {caseData.advisorId.name || 'Sin asignar'}
            </Typography>
            {caseData.advisorId.email && (
              <Typography variant="body2" color="text.secondary">
                {caseData.advisorId.email}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Historial / Timeline</Typography>
        <List>
          <ListItem>
            <ListItemText primary={`Creado: ${new Date(caseData.createdAt).toLocaleString()}`} />
          </ListItem>
          {caseData.reviewedAt && (
            <ListItem>
              <ListItemText primary={`Revisado: ${new Date(caseData.reviewedAt).toLocaleString()}`} />
            </ListItem>
          )}
          {caseData.closedAt && (
            <ListItem>
              <ListItemText primary={`Cerrado: ${new Date(caseData.closedAt).toLocaleString()}`} />
            </ListItem>
          )}
          {caseData.notes && caseData.notes.length > 0 && caseData.notes.map((n, idx) => (
            <ListItem key={idx}><ListItemText primary={n.content} secondary={new Date(n.createdAt).toLocaleString()} /></ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
