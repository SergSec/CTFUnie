import React, { useState, useEffect } from 'react';
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
        message: '¡Consulta enviada exitosamente! Se ha creado tu cuenta temporal.'
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
    <Box sx={{ py: 8, minHeight: '100vh', bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Consulta Online
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Completa el formulario y nuestro equipo revisará tu caso. No incluyas fecha de cita aquí.
        </Typography>

        {submitStatus.message && (
          <Alert severity={submitStatus.type} sx={{ mb: 3 }} onClose={() => setSubmitStatus({ type: '', message: '' })}>
            {submitStatus.message}
          </Alert>
        )}

        {/* Mostrar credenciales temporales */}
        {credentials && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              border: '2px solid',
              borderColor: 'success.main'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              ✅ ¡Consulta Enviada Exitosamente!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Se ha creado una cuenta temporal para que puedas seguir el estado de tu caso.
            </Typography>

            <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
                📧 Tus Credenciales de Acceso:
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>
                  <strong>Email:</strong> {credentials.email}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}>
                  <strong>Contraseña Temporal:</strong> <code style={{
                    background: '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '1.1em',
                    fontWeight: 'bold'
                  }}>{credentials.password}</code>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  Esta cuenta es válida hasta: {new Date(credentials.expiresAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>⚠️ Importante:</strong> Guarda estas credenciales en un lugar seguro.
            </Alert>

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>¿Qué pasa ahora?</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ ml: 2, mb: 2 }}>
              • Nuestro equipo revisará tu caso<br />
              • Si es aceptado, podrás agendar una cita y tu cuenta se hará permanente<br />
              • Si es rechazado, recibirás una notificación y tu cuenta se eliminará en 48 horas
            </Typography>

            <Button
              variant="contained"
              size="large"
              href="/login"
              sx={{
                bgcolor: 'white',
                color: 'success.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Ir al Panel de Cliente
            </Button>
          </Paper>
        )}

        <Grid container spacing={4}>
          {/* Servicios Disponibles */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Servicios Disponibles
            </Typography>

            {loadingServices ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
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
                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedHelpId === service.id ? '2px solid' : '1px solid',
                          borderColor: selectedHelpId === service.id ? 'primary.main' : 'divider',
                          bgcolor: selectedHelpId === service.id ? 'rgba(26, 35, 126, 0.05)' : 'white',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0px 8px 24px rgba(26, 35, 126, 0.15)',
                          },
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {service.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                          {selectedHelpId === service.id && (
                            <Chip
                              label="Seleccionado"
                              size="small"
                              color="primary"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {selectedHelp && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      ¿Qué tipo de conflicto tienes?
                    </Typography>
                    {conflictOptions.length === 0 ? (
                      <Alert severity="info">
                        Esta ayuda todavía no tiene conflictos configurados. Selecciona otra o envíanos tu consulta igualmente.
                      </Alert>
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {conflictOptions.map((conflict) => (
                          <Chip
                            key={conflict._id}
                            label={conflict.title}
                            variant={selectedConflictId === conflict._id ? 'filled' : 'outlined'}
                            color={selectedConflictId === conflict._id ? 'primary' : 'default'}
                            onClick={() => {
                              setSelectedConflictId(conflict._id);
                              setSelectedProblemId(conflict.problems?.[0]?.id || '');
                            }}
                            sx={{ mb: 1 }}
                          />
                        ))}
                      </Stack>
                    )}

                    {problemOptions.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                          Problema específico
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {problemOptions.map((problem) => (
                            <Chip
                              key={problem.id}
                              label={problem.label}
                              variant={selectedProblemId === problem.id ? 'filled' : 'outlined'}
                              color={selectedProblemId === problem.id ? 'secondary' : 'default'}
                              onClick={() => setSelectedProblemId(problem.id)}
                              sx={{ mb: 1 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          {/* Formulario */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Información de Contacto
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Teléfono (opcional)"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>¿Con qué necesitas ayuda?</InputLabel>
                  <Select
                    value={selectedHelpId}
                    label="¿Con qué necesitas ayuda?"
                    onChange={(e) => {
                      const service = services.find((item) => item.id === e.target.value);
                      if (service) {
                        handleServiceSelect(service);
                      }
                    }}
                    required
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={!selectedHelpId || conflictOptions.length === 0}>
                  <InputLabel>¿Qué tipo de conflicto tienes?</InputLabel>
                  <Select
                    value={selectedConflictId || ''}
                    label="¿Qué tipo de conflicto tienes?"
                    onChange={(e) => handleConflictSelect(e.target.value)}
                    required={conflictOptions.length > 0}
                  >
                    {conflictOptions.map((conflict) => (
                      <MenuItem key={conflict._id} value={conflict._id}>
                        {conflict.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  fullWidth
                  margin="normal"
                  disabled={!selectedConflictId || problemOptions.length === 0}
                >
                  <InputLabel>Problema específico (opcional)</InputLabel>
                  <Select
                    value={selectedProblemId || ''}
                    label="Problema específico (opcional)"
                    onChange={(e) => handleProblemSelect(e.target.value)}
                  >
                    {problemOptions.map((problem) => (
                      <MenuItem key={problem.id} value={problem.id}>
                        {problem.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Consulta"
                  name="consulta"
                  value={formData.consulta}
                  onChange={handleInputChange}
                  multiline
                  rows={6}
                  required
                  margin="normal"
                  placeholder="Describe tu situación o necesidad..."
                />

                {/* Sección de archivos */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Adjuntar archivos (opcional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Máximo 5 archivos. Tamaño máximo: 10MB por archivo.
                    Formatos: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    fullWidth
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
                        <ListItem key={index} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
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
                  sx={{ mt: 3, py: 1.5 }}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Consulta'}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Información adicional */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            ¿Necesitas ayuda? Contáctanos directamente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tel: +34 636 43 35 93 | Email: hola@afyl.legal
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

