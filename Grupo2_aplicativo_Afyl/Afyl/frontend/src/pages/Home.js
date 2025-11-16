import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

const services = [
  {
    title: 'Laboral',
    description: 'Despidos, contratos, indemnizaciones, incapacidades…',
  },
  {
    title: 'Mercantil / Empresarial',
    description: 'Contratos, constitución de empresas, cambios societarios…',
  },
  {
    title: 'Familia',
    description: 'Separaciones, herencias, custodias, pensiones de alimentos…',
  },
  {
    title: 'Protección de datos',
    description: 'Páginas web, servicios profesionales, venta electrónica.',
  },
  {
    title: 'Seguros / Contratos / Inmobiliario',
    description: 'Redacción y revisión de contratos. Reclamaciones de consumo y contra seguros.',
  },
  {
    title: 'Extranjería',
    description: 'Certificado UE, Visa nómada digital, permisos de residencia, residencia no lucrativa…',
  },
];

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    title: 'Seguridad garantizada',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 48 }} />,
    title: 'Respuesta rápida',
  },
  {
    icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
    title: 'Tarifas transparentes',
  },
];

const steps = [
  {
    number: '1',
    title: 'Cuéntanos tu necesidad',
    description: 'Explica la situación con tus palabras, en texto o audio. Selecciona la especialidad para asegurar a nuestro experto.',
  },
  {
    number: '2',
    title: 'Comparte información',
    description: 'Añade contratos, correos o documentación adicional en nuestra plataforma segura.',
  },
  {
    number: '3',
    title: 'Elige tu cita',
    description: 'Selecciona día y horario que te resulte más conveniente.',
  },
  {
    number: '4',
    title: 'Contacto',
    description: 'Conéctate con tu asesor legal por videollamada o teléfono. Lo que te resulte más cómodo.',
  },
  {
    number: '5',
    title: 'Informe',
    description: 'Recibe un resumen claro de lo que comentemos con una orientación clara de próximos pasos.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'white' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: '800px' }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                color: 'white',
              }}
            >
              Asistencia legal online
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: { xs: '1.1rem', md: '1.5rem' },
              }}
            >
              Tecnología para asesorarte rápido, con cercanía y transparencia.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                fontWeight: 600,
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'rgba(255,255,255,0.95)', // asegurar contraste con el fondo
              }}
            >
              ¡Estés donde estés, eligiendo tú el día y la hora que te conviene a ti!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/consulta-online')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                  },
                }}
              >
                Consulta Online
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/contacto')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Contacto
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0px 4px 20px rgba(26, 35, 126, 0.1)',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works Section */}
      <Box sx={{ backgroundColor: '#f5f7fa', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Cómo funciona AFYL
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Un proceso sencillo para resolver tus necesidades legales
          </Typography>
          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      left: 20,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, mb: 2 }}
        >
          Áreas de práctica
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Somos especialistas en diferentes áreas del derecho
        </Typography>
        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0px 12px 40px rgba(26, 35, 126, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2, color: 'rgba(255,255,255,0.98)' }}>
              ¿Listo para resolver tus necesidades legales?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)' }}>
              Sabemos que cuando tienes un problema legal o financiero, lo que necesitas es una solución rápida, clara y sin rodeos.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/consulta-online')}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                px: 6,
                py: 1.5,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                },
              }}
            >
              Consulta Online
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

