import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    consulta: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario de contacto enviado:', formData);
    alert('¡Gracias por contactarnos! Nos pondremos en contacto contigo pronto.');
    setFormData({ nombre: '', email: '', consulta: '' });
  };

  const contactInfo = [
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Teléfono',
      content: '+34 636 43 35 93',
    },
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'Email',
      content: 'hola@afyl.legal',
    },
    {
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      title: 'Oficinas',
      content: 'Barcelona | Madrid | Salamanca',
    },
  ];

  return (
    <Box sx={{ py: 8, minHeight: '100vh', bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2, color: '#1a237e' }}
        >
          Contacto
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Estamos aquí para ayudarte. Ponte en contacto con nosotros
        </Typography>

        <Grid container spacing={4}>
          {/* Información de contacto */}
          <Grid item xs={12} md={4}>
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  textAlign: 'center',
                  p: 3,
                  border: 'none',
                  boxShadow: '0px 4px 20px rgba(26, 35, 126, 0.1)',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{info.icon}</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {info.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {info.content}
                </Typography>
              </Card>
            ))}
          </Grid>

          {/* Formulario de contacto */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Envíanos un mensaje
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
                  label="Consulta"
                  name="consulta"
                  value={formData.consulta}
                  onChange={handleInputChange}
                  multiline
                  rows={6}
                  required
                  margin="normal"
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 3, py: 1.5 }}
                >
                  Enviar
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Elemento gráfico decorativo */}
        <Box sx={{ mt: 8, position: 'relative', height: '200px', overflow: 'hidden' }}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '200px',
              bgcolor: '#1a237e',
              clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </Box>

        {/* Información adicional */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Horario de atención: Lunes a Viernes de 9:00 a 18:00
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Respondemos todas las consultas en un plazo máximo de 24 horas
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

