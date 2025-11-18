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
  const [selectedService, setSelectedService] = useState(null);
  const [showCalendly, setShowCalendly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    // Cargar servicios desde la API
    fetchServices();
    
    // Cargar script de Calendly
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
      
      // Cargar estilos de Calendly
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.data);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setFormData((prev) => ({
      ...prev,
      servicio: service.id,
    }));
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
      await api.post('/consultations', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSubmitStatus({
        type: 'success',
        message: '¡Consulta enviada exitosamente! Ahora puedes agendar tu cita.'
      });

      // Mostrar Calendly después de enviar
      setTimeout(() => {
        setShowCalendly(true);
        setIsLoading(false);
        
        // Scroll suave al widget de Calendly
        setTimeout(() => {
          document.querySelector('.calendly-inline-widget')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 300);
      }, 1000);
    } catch (error) {
      console.error('Error al enviar consulta:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Error al enviar la consulta. Por favor, intenta de nuevo.'
      });
      setIsLoading(false);
    }
  };

  const calendlyUrl = process.env.REACT_APP_CALENDLY_URL || 'https://calendly.com/afyl-legal/consulta-30min';

  const buildCalendlyUrl = () => {
    if (!calendlyUrl) return calendlyUrl;
    const params = new URLSearchParams();
    
    // Pre-llenar datos del usuario
    if (formData.nombre) params.set('name', formData.nombre);
    if (formData.email) params.set('email', formData.email);
    if (formData.servicio) params.set('a1', formData.servicio);
    if (formData.consulta) params.set('consulta', formData.consulta);
    
    // Configuración visual
    params.set('hide_event_type_details', '1');
    params.set('background_color', 'ffffff');
    params.set('text_color', '333333');
    params.set('primary_color', '1a237e'); // Color azul de AFYL
    
    return `${calendlyUrl}?${params.toString()}`;
  };

  useEffect(() => {
    if (!showCalendly) return;
    const url = buildCalendlyUrl();

    if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
      const container = document.querySelector('.calendly-inline-widget');
      if (container) {
        try {
          window.Calendly.initInlineWidget({
            url,
            parentElement: container,
            prefill: {},
            utm: {}
          });
        } catch (err) {
          container.setAttribute('data-url', url);
        }
      }
    } else {
      const container = document.querySelector('.calendly-inline-widget');
      if (container) container.setAttribute('data-url', url);
    }
  }, [showCalendly, formData]);

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
          Completa el formulario y agenda tu cita con nuestro equipo de expertos
        </Typography>

        {submitStatus.message && (
          <Alert severity={submitStatus.type} sx={{ mb: 3 }} onClose={() => setSubmitStatus({ type: '', message: '' })}>
            {submitStatus.message}
          </Alert>
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
              <Grid container spacing={2}>
                {services.map((service) => (
                  <Grid item xs={12} sm={6} key={service.id}>
                    <Card
                      onClick={() => handleServiceSelect(service)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: selectedService?.id === service.id ? '2px solid' : '1px solid',
                        borderColor: selectedService?.id === service.id ? 'primary.main' : 'divider',
                        bgcolor: selectedService?.id === service.id ? 'rgba(26, 35, 126, 0.05)' : 'white',
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
                        {selectedService?.id === service.id && (
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
                  <InputLabel>Servicio</InputLabel>
                  <Select
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleInputChange}
                    label="Servicio"
                    required
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.title}
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
                  {isLoading ? 'Enviando...' : 'Enviar y Agendar Cita'}
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Calendly Widget */}
        {showCalendly && (
          <Box sx={{ mt: 6 }}>
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                📅 Agenda tu Cita
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Selecciona el día y la hora que mejor te convenga para tu consulta. 
                Recibirás una confirmación por email.
              </Typography>
              
              {/* Advertencia si se está usando URL de ejemplo */}
              {calendlyUrl.includes('example') || calendlyUrl.includes('afyl-legal/consulta-30min') ? (
                <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107' }}>
                  <Typography variant="body2" sx={{ color: '#856404' }}>
                    ⚠️ <strong>Configuración pendiente:</strong> Este es un calendario de ejemplo. 
                    Para activar las reservas reales, configura tu cuenta de Calendly siguiendo 
                    las instrucciones en <code>GUIA_COMPLETA_CALENDLY.md</code>
                  </Typography>
                </Box>
              ) : null}
              
              <Box
                className="calendly-inline-widget"
                data-url={buildCalendlyUrl()}
                style={{
                  minWidth: '320px',
                  height: '700px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0'
                }}
              />
            </Paper>
          </Box>
        )}

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

