import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Box, Chip, List, ListItem, ListItemText } from '@mui/material';
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1">Descripción</Typography>
        <Typography variant="body2" color="text.secondary">{caseData.description}</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Historial / Timeline</Typography>
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
