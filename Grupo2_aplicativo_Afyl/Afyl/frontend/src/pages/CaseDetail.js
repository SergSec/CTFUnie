import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdvisor, isAdmin } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ type: '', message: '' });
  
  const { data, isLoading, error } = useQuery(['case', id], () =>
    api.get(`/cases/${id}`).then((res) => res.data)
  );

  const handleDeleteComplete = async () => {
    setDeleting(true);
    try {
      const response = await api.delete(`/cases/${id}/complete`);
      setDeleteAlert({
        type: 'success',
        message: response.data.message
      });
      
      // Esperar un momento para que el usuario vea el mensaje
      setTimeout(() => {
        navigate('/admin/cases');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar caso:', error);
      setDeleteAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al eliminar el caso completamente'
      });
    } finally {
      setDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

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

      {deleteAlert.message && (
        <Alert 
          severity={deleteAlert.type} 
          sx={{ mb: 3 }}
          onClose={() => setDeleteAlert({ type: '', message: '' })}
        >
          {deleteAlert.message}
        </Alert>
      )}

      <Paper sx={{ p: 4 }}>
        {isAdvisor && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Solo puedes consultar la información del caso que te ha sido asignado.
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {caseData?.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={caseData?.status} color="primary" />
              <Chip label={caseData?.category} variant="outlined" />
            </Box>
          </Box>
          
          {(isAdmin || isAdvisor) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setOpenDeleteDialog(true)}
              disabled={deleting}
            >
              Eliminar Completamente
            </Button>
          )}
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

      {/* Dialog de confirmación para eliminación completa */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => !deleting && setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          ⚠️ Eliminar Caso Completamente
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <strong>Esta acción es IRREVERSIBLE y eliminará:</strong>
          </DialogContentText>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <li>El caso actual</li>
            <li>Todas las consultas relacionadas</li>
            <li>Todos los documentos y archivos adjuntos</li>
            <li>Todas las citas programadas</li>
            <li>El usuario cliente (si no tiene otros casos activos)</li>
          </Box>
          <Alert severity="error" sx={{ mt: 2 }}>
            Esta acción NO se puede deshacer. ¿Estás completamente seguro?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteComplete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteForeverIcon />}
          >
            {deleting ? 'Eliminando...' : 'Sí, Eliminar Todo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

