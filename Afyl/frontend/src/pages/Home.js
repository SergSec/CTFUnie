import React, { useEffect, useState } from 'react';
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
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import api from '../services/api';

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
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get('/services?format=tree');
        setServices(response.data.data || []);
        setServicesError('');
      } catch (error) {
        console.error('Error al cargar servicios públicos:', error);
        setServicesError('No pudimos cargar las áreas de práctica. Inténtalo de nuevo más tarde.');
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fafc' }} className="animate-fade-in">
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0a1929 0%, #1a237e 100%)',
          color: 'white',
          py: { xs: 10, md: 16 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, opacity: 0.1 }}>
          <svg width="600" height="600" viewBox="0 0 200 200">
            <path d="M0,0 L200,200 M200,0 L0,200" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="0.5" fill="none" />
          </svg>
        </Box>



        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: '800px' }}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem', lg: '4.5rem' },
                letterSpacing: '-0.03em',
                background: 'linear-gradient(90deg, #ffffff 0%, #bbdefb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Asistencia legal online
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 3,
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 400,
                fontSize: { xs: '1.2rem', md: '1.75rem' },
                lineHeight: 1.4,
              }}
            >
              Tecnología para asesorarte rápido, con cercanía y transparencia.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 6,
                fontWeight: 500,
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: 'rgba(255,255,255,0.7)',
                maxWidth: '600px',
              }}
            >
              ¡Estés donde estés, eligiendo tú el día y la hora que te conviene a ti!
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/consulta-online')}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Consulta Online
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/contacto')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  fontWeight: 600,
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
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
      <Container maxWidth="lg" sx={{ py: 10, mt: -8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                className="glass-card"
                sx={{
                  textAlign: 'center',
                  p: 4,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 3,
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(26, 35, 126, 0.05)',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {feature.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it works Section */}
      <Box sx={{ py: 12, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              PROCESO SIMPLIFICADO
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 800, mt: 1, mb: 2, color: 'text.primary' }}
            >
              Cómo funciona AFYL
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto', fontWeight: 400 }}
            >
              Un proceso diseñado para resolver tus necesidades legales sin complicaciones
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    position: 'relative',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: '#f8fafc',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      transform: 'translateY(-5px)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      mb: 3,
                      boxShadow: '0 10px 20px rgba(26, 35, 126, 0.2)',
                    }}
                  >
                    {step.number}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 12, bgcolor: '#f1f5f9' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.1em' }}
            >
              NUESTROS SERVICIOS
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 800, mt: 1, mb: 2 }}
            >
              Áreas de práctica
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: '700px', mx: 'auto', fontWeight: 400 }}
            >
              Nuestro equipo se adapta a las necesidades que configuras en el panel de administración
            </Typography>
          </Box>

          {loadingServices ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          ) : servicesError ? (
            <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>{servicesError}</Alert>
          ) : services.length === 0 ? (
            <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>Aún no hay áreas de práctica configuradas.</Alert>
          ) : (
            <Grid container spacing={4}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card
                    className="glass-card"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      textAlign: 'center',
                      border: 'none',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 4 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {service.description}
                      </Typography>
                      {service.children?.length > 0 && (
                        <Chip
                          label={`${service.children.length} tipos de conflicto`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: '8px' }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, mb: 3, letterSpacing: '-0.02em' }}>
              ¿Listo para resolver tus necesidades legales?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.9, fontWeight: 400, lineHeight: 1.6 }}>
              Sabemos que cuando tienes un problema legal o financiero, lo que necesitas es una solución rápida, clara y sin rodeos.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/consulta-online')}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 700,
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Iniciar Consulta Online
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

