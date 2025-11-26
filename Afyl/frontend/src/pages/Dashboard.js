import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Folder as FolderIcon,
  CalendarToday as CalendarTodayIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user, isClient, isAdvisor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: casesData, isLoading: casesLoading } = useQuery('cases', () =>
    api.get('/cases').then((res) => res.data)
  );

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery('appointments', () =>
    api.get('/appointments').then((res) => res.data)
  );

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery('payments', () =>
    api.get('/payments').then((res) => res.data)
  );

  if (casesLoading || appointmentsLoading || paymentsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const cases = casesData?.cases || [];
  const appointments = appointmentsData?.appointments || [];
  const payments = paymentsData?.payments || [];

  const activeCases = cases.filter(c => !['cerrado'].includes(c.status)).length;
  const totalCases = cases.length;
  const upcomingAppointments = appointments.filter(a =>
    new Date(a.scheduledDate) > new Date() && a.status !== 'cancelada'
  ).length;
  const pendingPayments = payments.filter(p => p.status === 'pendiente').length;
  const totalPaid = payments
    .filter(p => p.status === 'completado')
    .reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    {
      title: isAdvisor ? 'Casos asignados' : 'Casos activos',
      value: activeCases,
      subtitle: `${totalCases} total`,
      icon: <FolderIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      onClick: () => navigate('/admin/cases'),
    },
    ...(isAdmin
      ? [
        {
          title: 'Próximas Citas',
          value: upcomingAppointments,
          subtitle: 'Pendientes',
          icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
          gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          onClick: () => navigate('/admin/appointments'),
        },
        {
          title: 'Pagos Pendientes',
          value: pendingPayments,
          subtitle: 'Por procesar',
          icon: <PaymentIcon sx={{ fontSize: 40 }} />,
          gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
          onClick: () => navigate('/admin/payments'),
        },
      ]
      : []),
    ...(isClient
      ? [
        {
          title: 'Total Pagado',
          value: `€${totalPaid.toFixed(2)}`,
          subtitle: 'Servicios completados',
          icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
          gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          onClick: () => navigate('/admin/payments'),
        },
      ]
      : []),
  ];

  return (
    <Box className="animate-fade-in">
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          mb: 5,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(26, 35, 126, 0.2)',
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
          <svg width="300" height="300" viewBox="0 0 200 200">
            <path d="M0,0 L200,200 M200,0 L0,200" stroke="white" strokeWidth="1" />
            <circle cx="100" cy="100" r="80" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bienvenido, {user?.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            {isClient && 'Panel de Gestión del Cliente'}
            {isAdvisor && 'Panel de Gestión del Asesor'}
            {user?.role === 'admin' && 'Panel de Administración'}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Resumen General
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={isAdmin ? 4 : 6} key={index}>
            <Card
              className="glass-card"
              onClick={card.onClick}
              sx={{
                cursor: 'pointer',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                  '& .card-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '6px',
                  background: card.gradient
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    className="card-icon"
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      background: card.gradient,
                      color: 'white',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

