import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as FileIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function CaseReview() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [price, setPrice] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchPendingCases();
  }, []);

  const fetchPendingCases = async () => {
    try {
      const response = await api.get('/cases/pending-review');
      setCases(response.data.data);
    } catch (error) {
      console.error('Error al cargar casos:', error);
      setAlert({ type: 'error', message: 'Error al cargar los casos pendientes' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (caseData, action) => {
    setSelectedCase(caseData);
    setReviewAction(action);
    setPrice('');
    setRejectionReason('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCase(null);
    setReviewAction('');
    setPrice('');
    setRejectionReason('');
  };

  const handleSubmitReview = async () => {
    if (reviewAction === 'accept' && (!price || price <= 0)) {
      setAlert({ type: 'error', message: 'Debes introducir un precio válido' });
      return;
    }

    if (reviewAction === 'reject' && !rejectionReason.trim()) {
      setAlert({ type: 'error', message: 'Debes proporcionar un motivo de rechazo' });
      return;
    }

    try {
      await api.put(`/cases/${selectedCase._id}/review`, {
        action: reviewAction,
        price: reviewAction === 'accept' ? parseFloat(price) : null,
        rejectionReason: reviewAction === 'reject' ? rejectionReason : null,
      });

      setAlert({
        type: 'success',
        message: `Caso ${reviewAction === 'accept' ? 'aceptado' : 'rechazado'} exitosamente`,
      });

      handleCloseDialog();
      fetchPendingCases();
    } catch (error) {
      console.error('Error al revisar caso:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al procesar la revisión',
      });
    }
  };

  const toggleRow = (caseId) => {
    setExpandedRows(prev => ({
      ...prev,
      [caseId]: !prev[caseId]
    }));
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
        Revisión de Casos Pendientes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Revisa y acepta o rechaza los casos de nuevos clientes
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
      ) : cases.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No hay casos pendientes de revisión
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Servicio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cases.map((caseData) => (
                <React.Fragment key={caseData._id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(caseData._id)}
                      >
                        {expandedRows[caseData._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {caseData.clientId.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {caseData.clientId.email}
                      </Typography>
                      {caseData.clientId.phone && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Tel: {caseData.clientId.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={caseData.serviceType || caseData.category} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(caseData.createdAt).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label="Pendiente" color="warning" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<AcceptIcon />}
                        onClick={() => handleOpenDialog(caseData, 'accept')}
                        sx={{ mr: 1 }}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleOpenDialog(caseData, 'reject')}
                      >
                        Rechazar
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={6} sx={{ py: 0 }}>
                      <Collapse in={expandedRows[caseData._id]} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom>
                            Detalles del Caso
                          </Typography>
                          <Typography variant="subtitle2" gutterBottom>
                            Título: {caseData.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {caseData.description}
                          </Typography>
                          
                          {caseData.consultationId && caseData.consultationId.archivos && 
                           caseData.consultationId.archivos.length > 0 && (
                            <>
                              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                                Archivos Adjuntos:
                              </Typography>
                              <List dense>
                                {caseData.consultationId.archivos.map((file, index) => (
                                  <ListItem key={index}>
                                    <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <ListItemText
                                      primary={file.originalName}
                                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para aceptar/rechazar caso */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewAction === 'accept' ? 'Aceptar Caso' : 'Rechazar Caso'}
        </DialogTitle>
        <DialogContent>
          {selectedCase && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Cliente:</strong> {selectedCase.clientId.name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedCase.clientId.email}
              </Typography>
              <Typography variant="body2" gutterBottom sx={{ mb: 3 }}>
                <strong>Caso:</strong> {selectedCase.title}
              </Typography>

              {reviewAction === 'accept' ? (
                <TextField
                  fullWidth
                  label="Precio del Servicio (€)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  helperText="Introduce el precio estimado del servicio"
                  InputProps={{
                    startAdornment: '€',
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  label="Motivo del Rechazo"
                  multiline
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  helperText="Explica brevemente por qué no puedes atender este caso"
                />
              )}

              {reviewAction === 'accept' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Al aceptar, la cuenta temporal del cliente se hará permanente y podrá agendar una cita.
                </Alert>
              )}

              {reviewAction === 'reject' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Al rechazar, la cuenta del cliente será eliminada en 48 horas.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            color={reviewAction === 'accept' ? 'success' : 'error'}
          >
            {reviewAction === 'accept' ? 'Aceptar Caso' : 'Rechazar Caso'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
