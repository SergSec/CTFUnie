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
} from '@mui/material';

const services = [
  {
    id: 'laboral',
    title: 'Laboral',
    description: 'Despidos, contratos, indemnizaciones, incapacidades…',
  },
  {
    id: 'mercantil',
    title: 'Mercantil / Empresarial',
    description: 'Contratos, constitución de empresas, cambios societarios…',
  },
  {
    id: 'familia',
    title: 'Familia',
    description: 'Separaciones, herencias, custodias, pensiones de alimentos…',
  },
  {
    id: 'proteccion-datos',
    title: 'Protección de datos',
    description: 'Páginas web, servicios profesionales, venta electrónica.',
  },
  {
    id: 'seguros',
    title: 'Seguros / Contratos / Inmobiliario',
    description: 'Redacción y revisión de contratos. Reclamaciones de consumo y contra seguros.',
  },
  {
    id: 'extranjeria',
    title: 'Extranjería',
    description: 'Certificado UE, Visa nómada digital, permisos de residencia, residencia no lucrativa…',
  },
];

export default function ConsultaOnline() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    consulta: '',
    servicio: '',
  });
  const [selectedService, setSelectedService] = useState(null);
  const [showCalendly, setShowCalendly] = useState(false);

  useEffect(() => {
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    setShowCalendly(true);
    setTimeout(() => {
      document.querySelector('.calendly-inline-widget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const calendlyUrl = process.env.REACT_APP_CALENDLY_URL || 'https://calendly.com/example/30min';

  const buildCalendlyUrl = () => {
    if (!calendlyUrl) return calendlyUrl;
    const params = new URLSearchParams();
    if (formData.nombre) params.set('name', formData.nombre);
    if (formData.email) params.set('email', formData.email);
    if (formData.servicio) params.set('a1', formData.servicio);
    params.set('hide_event_type_details', '1');
    params.set('background_color', 'ffffff');
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

        <Grid container spacing={4}>
          {/* Servicios Disponibles */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Servicios Disponibles
            </Typography>
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
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, py: 1.5 }}
                >
                  Enviar y Agendar Cita
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
                Agenda tu Cita
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Selecciona el día y la hora que mejor te convenga para tu consulta
              </Typography>
              <Box
                className="calendly-inline-widget"
                data-url={buildCalendlyUrl()}
                style={{
                  minWidth: '320px',
                  height: '700px',
                  borderRadius: '8px',
                  overflow: 'hidden'
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

