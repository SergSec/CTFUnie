import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
} from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';

export default function ConsultaOnline() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    consulta: '',
    servicio: '',
  });
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedHelpId, setSelectedHelpId] = useState('');
  const [selectedConflictId, setSelectedConflictId] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [conflicts, setConflicts] = useState([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [credentials, setCredentials] = useState(null);

  const selectedHelp = services.find((service) => service.id === selectedHelpId) || null;
  const conflictOptions = conflicts;
  const selectedConflict =
    conflictOptions.find((conflict) => conflict._id === selectedConflictId) || null;
  const problemOptions = selectedConflict?.problems || [];
  const selectedProblem =
    problemOptions.find((problem) => problem.id === selectedProblemId) || null;

  useEffect(() => {
    // Cargar servicios desde la API
    fetchServices();
  }, []);

  useEffect(() => {
    if (!loadingServices && services.length > 0 && !selectedHelpId) {
      setSelectedHelpId(services[0].id);
    }
  }, [loadingServices, services, selectedHelpId]);

  useEffect(() => {
    if (selectedHelpId) {
      fetchConflicts(selectedHelpId);
    } else {
      setConflicts([]);
    }
  }, [selectedHelpId]);

  useEffect(() => {
    if (selectedHelp && conflictOptions.length > 0 && !selectedConflictId) {
      setSelectedConflictId(conflictOptions[0]._id);
    }
  }, [selectedHelp, conflictOptions, selectedConflictId]);

  useEffect(() => {
    const selectedSlug = selectedProblem?.id || selectedConflict?._id || selectedHelp?.id || '';
    setFormData((prev) => ({
      ...prev,
      servicio: selectedSlug,
    }));
  }, [selectedHelp, selectedConflict, selectedProblem]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services?format=tree');
      setServices(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Error al cargar los servicios. Por favor, recarga la página.'
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchConflicts = async (serviceId) => {
    setLoadingConflicts(true);
    try {
      const response = await api.get(`/conflicts/service/${serviceId}`);
      setConflicts(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar conflictos:', error);
    } finally {
      setLoadingConflicts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (service) => {
    setSelectedHelpId(service.id);
    // Conflicts will be fetched by useEffect
    setSelectedConflictId('');
    setSelectedProblemId('');
  };

  const handleConflictSelect = (conflictId) => {
    setSelectedConflictId(conflictId);
    const conflict = conflictOptions.find((item) => item._id === conflictId);
    setSelectedProblemId(conflict?.problems?.[0]?.id || '');
  };

  const handleProblemSelect = (problemId) => {
    setSelectedProblemId(problemId);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setSubmitStatus({
          type: 'error',
          message: `El archivo ${file.name} es demasiado grande. Máximo 10MB.`
        });
        return false;
      }
      return true;
    });

    // Limitar a 5 archivos
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 5) {
      setSubmitStatus({
        type: 'warning',
        message: 'Máximo 5 archivos permitidos.'
      });
      setSelectedFiles([...selectedFiles, ...validFiles].slice(0, 5));
    } else {
      setSelectedFiles([...selectedFiles, ...validFiles]);
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefono', formData.telefono || '');
      formDataToSend.append('servicio', formData.servicio);
      formDataToSend.append('consulta', formData.consulta);
      if (selectedConflictId) formDataToSend.append('conflictId', selectedConflictId);
      if (selectedProblemId) formDataToSend.append('problemId', selectedProblemId);

      // Agregar archivos
      selectedFiles.forEach((file) => {
        formDataToSend.append('archivos', file);
      });

      // Enviar consulta
      const response = await api.post('/consultations', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Guardar credenciales
      if (response.data.data && response.data.data.credentials) {
        setCredentials(response.data.data.credentials);
      } else if (response.data.credentials) {
        setCredentials(response.data.credentials);
      }

      setSubmitStatus({
        type: 'success',
        message: response.data.message || '¡Consulta enviada exitosamente!'
      });

      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        consulta: '',
        servicio: '',
      });
      setSelectedFiles([]);
      setIsLoading(false);

      // Scroll suave a las credenciales
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error('Error al enviar consulta:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Error al enviar la consulta. Por favor, intenta de nuevo.'
      });
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      py: 8,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden'
    }} className="animate-fade-in">
      {/* Decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26, 35, 126, 0.05) 0%, rgba(26, 35, 126, 0) 70%)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 70%)',
        zIndex: 0
      }} />



      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            className="gradient-text"
            sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}
          >
            Consulta Online
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}
          >
            Completa el formulario y nuestro equipo experto revisará tu caso con la máxima confidencialidad.
          </Typography>
        </Box>

        {submitStatus.message && (
          <Alert
            severity={submitStatus.type}
            variant="filled"
            sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            onClose={() => setSubmitStatus({ type: '', message: '' })}
          >
            {submitStatus.message}
          </Alert>
        )}

        {/* Mostrar credenciales temporales */}
        {credentials && (
          <Paper
            elevation={0}
            className="glass-card"
            sx={{
              p: 5,
              mb: 6,
              border: '2px solid',
              borderColor: 'success.main',
              background: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: 'success.light',
                color: 'success.contrastText',
                mb: 2
              }}>
                <Typography variant="h4">✅</Typography>
              </Box>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.dark' }}>
                ¡Consulta Enviada Exitosamente!
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
                Se ha creado una cuenta temporal para que puedas seguir el estado de tu caso.
              </Typography>
            </Box>

            <Box sx={{
              bgcolor: 'rgba(46, 125, 50, 0.05)',
              p: 4,
              borderRadius: 3,
              mb: 4,
              border: '1px dashed',
              borderColor: 'success.main'
            }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.dark', fontWeight: 700, mb: 3 }}>
                📧 Tus Credenciales de Acceso:
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {credentials.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Contraseña Temporal
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {credentials.password}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 3, textAlign: 'center' }}>
                Esta cuenta es válida hasta: <strong>{new Date(credentials.expiresAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</strong>
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
              <strong>Importante:</strong> Guarda estas credenciales en un lugar seguro. No podrás recuperarlas si cierras esta ventana.
            </Alert>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                href="/login"
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)',
                  color: 'white', // Force white text
                }}
                color="success"
              >
                Ir al Panel de Cliente
              </Button>
            </Box>
          </Paper>
        )}

        <Grid container spacing={4}>
          {/* Servicios Disponibles */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              1. Selecciona tu caso
            </Typography>

            {loadingServices ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : services.length === 0 ? (
              <Alert severity="info">No hay servicios disponibles en este momento.</Alert>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  {services.map((service) => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Card
                        onClick={() => handleServiceSelect(service)}
                        className={selectedHelpId === service.id ? 'active-service-card' : ''}
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          border: selectedHelpId === service.id ? '2px solid' : '1px solid',
                          borderColor: selectedHelpId === service.id ? 'primary.main' : 'divider',
                          bgcolor: selectedHelpId === service.id ? 'rgba(26, 35, 126, 0.04)' : 'white',
                          borderRadius: 3,
                          height: '100%',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                            borderColor: 'primary.light',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                            {service.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {service.description}
                          </Typography>
                          {selectedHelpId === service.id && (
                            <Chip
                              label="Seleccionado"
                              size="small"
                              color="primary"
                              sx={{ mt: 2, fontWeight: 600 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>


              </Box>
            )}
          </Grid>

          {/* Formulario */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              className="glass-card"
              sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.5)'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                2. Información de Contacto
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre Completo"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono (opcional)"
                      name="telefono"
                      type="tel"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ my: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="service-select-label">¿Con qué necesitas ayuda?</InputLabel>
                        <Select
                          labelId="service-select-label"
                          id="service-select"
                          value={selectedHelpId}
                          label="¿Con qué necesitas ayuda?"
                          onChange={(e) => {
                            const service = services.find(s => s.id === e.target.value);
                            if (service) handleServiceSelect(service);
                          }}
                          sx={{ borderRadius: 2, bgcolor: 'white' }}
                        >
                          {services.map((service) => (
                            <MenuItem key={service.id} value={service.id}>
                              {service.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={!selectedHelp || conflictOptions.length === 0}>
                        <InputLabel id="conflict-select-label">¿Qué tipo de conflicto tienes?</InputLabel>
                        <Select
                          labelId="conflict-select-label"
                          id="conflict-select"
                          value={selectedConflictId}
                          label="¿Qué tipo de conflicto tienes?"
                          onChange={(e) => {
                            setSelectedConflictId(e.target.value);
                            const conflict = conflictOptions.find((item) => item._id === e.target.value);
                            setSelectedProblemId(conflict?.problems?.[0]?.id || '');
                          }}
                          sx={{ borderRadius: 2, bgcolor: 'white' }}
                        >
                          {conflictOptions.map((conflict) => (
                            <MenuItem key={conflict._id} value={conflict._id}>
                              {conflict.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={!selectedConflict || problemOptions.length === 0}>
                        <InputLabel id="problem-select-label">Problema específico (opcional)</InputLabel>
                        <Select
                          labelId="problem-select-label"
                          id="problem-select"
                          value={selectedProblemId}
                          label="Problema específico (opcional)"
                          onChange={(e) => setSelectedProblemId(e.target.value)}
                          sx={{ borderRadius: 2, bgcolor: 'white' }}
                        >
                          {problemOptions.map((problem) => (
                            <MenuItem key={problem.id} value={problem.id}>
                              {problem.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  fullWidth
                  label="Detalla tu consulta"
                  name="consulta"
                  value={formData.consulta}
                  onChange={handleInputChange}
                  multiline
                  rows={6}
                  required
                  placeholder="Describe tu situación o necesidad con el mayor detalle posible..."
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                  sx={{ mb: 3 }}
                />

                {/* Sección de archivos */}
                <Box sx={{ mb: 4, p: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: 'rgba(255,255,255,0.5)' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Adjuntar documentación (opcional)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Máximo 5 archivos (PDF, DOC, JPG, PNG). Máx 10MB c/u.
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      '&:hover': { borderStyle: 'dashed', borderWidth: 2 }
                    }}
                  >
                    Seleccionar archivos
                    <input
                      type="file"
                      hidden
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt"
                      onChange={handleFileSelect}
                    />
                  </Button>

                  {selectedFiles.length > 0 && (
                    <List sx={{ mt: 2 }}>
                      {selectedFiles.map((file, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'white', mb: 1, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveFile(index)} color="error" size="small">
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    boxShadow: '0 8px 20px rgba(26, 35, 126, 0.2)',
                    textTransform: 'none',
                    color: 'white', // Force white text
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Consulta'}
                </Button>
                <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                  Al enviar este formulario aceptas nuestra política de privacidad y términos de servicio.
                </Typography>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Información adicional */}
        <Box sx={{ mt: 8, textAlign: 'center', pb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            ¿Necesitas ayuda inmediata?
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            Tel: +34 636 43 35 93 | Email: hola@afyl.legal
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

