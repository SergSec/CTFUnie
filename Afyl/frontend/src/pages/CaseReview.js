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
  Divider,
  Grid,
} from '@mui/material';
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as FileIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
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
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);

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

  const handleOpenDetails = (caseData) => {
    setSelectedCaseDetails(caseData);
    setDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setSelectedCaseDetails(null);
  };

  const handleDownloadFile = async (filename) => {
    try {
      setDownloadingFile(filename);
      const token = localStorage.getItem('token');
      const response = await fetch(`${api.defaults.baseURL}/consultations/download/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      // Obtener el nombre del archivo del header Content-Disposition si está disponible
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = filename;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setAlert({ 
        type: 'success', 
        message: 'Archivo descargado correctamente' 
      });
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      setAlert({ 
        type: 'error', 
        message: 'Error al descargar el archivo. Por favor, intenta de nuevo.' 
      });
    } finally {
      setDownloadingFile(null);
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
                <TableCell align="center">Detalles</TableCell>
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
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleOpenDetails(caseData)}
                      >
                        Ver
                      </Button>
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
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={expandedRows[caseData._id]} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" gutterBottom>
                            Vista Rápida
                          </Typography>
                          <Typography variant="subtitle2" gutterBottom>
                            Título: {caseData.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {caseData.description?.substring(0, 200)}
                            {caseData.description?.length > 200 && '...'}
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<ViewIcon />}
                            onClick={() => handleOpenDetails(caseData)}
                          >
                            Ver Detalles Completos
                          </Button>
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

      {/* Dialog para ver detalles completos del caso */}
      <Dialog 
        open={detailsDialog} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Detalles Completos de la Consulta
        </DialogTitle>
        <DialogContent>
          {selectedCaseDetails && (
            <Box sx={{ mt: 2 }}>
              {/* Información del Cliente */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  👤 Información del Cliente
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCaseDetails.clientId?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedCaseDetails.clientId?.email}
                    </Typography>
                  </Grid>
                  {selectedCaseDetails.clientId?.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCaseDetails.clientId.phone}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha de Solicitud:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedCaseDetails.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Información del Caso */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'info.lighter' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                  📋 Información del Caso
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Título:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedCaseDetails.title}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Servicio Solicitado:
                  </Typography>
                  <Chip 
                    label={selectedCaseDetails.serviceType || selectedCaseDetails.category} 
                    color="primary" 
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Paper>

              {/* Descripción de la Consulta */}
              {selectedCaseDetails.consultation && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'warning.lighter' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                    💬 Descripción de la Consulta
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {selectedCaseDetails.consultation.consulta || selectedCaseDetails.description}
                  </Typography>
                </Paper>
              )}

              {/* Archivos Adjuntos */}
              {selectedCaseDetails.consultation?.archivos && 
               selectedCaseDetails.consultation.archivos.length > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'success.lighter' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                    📎 Archivos Adjuntos ({selectedCaseDetails.consultation.archivos.length})
                  </Typography>
                  <List>
                    {selectedCaseDetails.consultation.archivos.map((file, index) => (
                      <React.Fragment key={index}>
                        <ListItem
                          sx={{
                            bgcolor: 'white',
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': {
                              bgcolor: 'grey.50',
                            },
                          }}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => handleDownloadFile(file.filename)}
                              color="primary"
                              disabled={downloadingFile === file.filename}
                            >
                              {downloadingFile === file.filename ? (
                                <CircularProgress size={24} />
                              ) : (
                                <DownloadIcon />
                              )}
                            </IconButton>
                          }
                        >
                          <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary={file.originalName}
                            secondary={
                              <Box component="span">
                                <Chip 
                                  label={file.mimetype} 
                                  size="small" 
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                                <Typography component="span" variant="caption">
                                  {(file.size / 1024).toFixed(2)} KB
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < selectedCaseDetails.consultation.archivos.length - 1 && (
                          <Divider sx={{ my: 0.5 }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}

              {!selectedCaseDetails.consultation?.archivos?.length && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No se adjuntaron archivos con esta consulta
                </Alert>
              )}

              {/* Acciones rápidas */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AcceptIcon />}
                  onClick={() => {
                    handleCloseDetails();
                    handleOpenDialog(selectedCaseDetails, 'accept');
                  }}
                >
                  Aceptar Caso
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => {
                    handleCloseDetails();
                    handleOpenDialog(selectedCaseDetails, 'reject');
                  }}
                >
                  Rechazar Caso
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
