import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdvisor } = useAuth();
  const { data, isLoading, error } = useQuery(['case', id], () =>
    api.get(`/cases/${id}`).then((res) => res.data)
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar el caso</Alert>;
  }

  const caseData = data?.case;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/cases')}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Paper sx={{ p: 4 }}>
        {isAdvisor && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Solo puedes consultar la información del caso que te ha sido asignado.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {caseData?.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={caseData?.status} color="primary" />
              <Chip label={caseData?.category} variant="outlined" />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Descripción
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {caseData?.description}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Cliente:</strong> {caseData?.clientId?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Asesor:</strong> {caseData?.advisorId?.name || 'Sin asignar'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Prioridad:</strong> {caseData?.priority}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

