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
        <CircularProgress />
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
      icon: <FolderIcon sx={{ fontSize: 48 }} />,
      gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      onClick: () => navigate('/admin/cases'),
    },
    ...(isAdmin
      ? [
          {
            title: 'Próximas Citas',
            value: upcomingAppointments,
            subtitle: 'Pendientes',
            icon: <CalendarTodayIcon sx={{ fontSize: 48 }} />,
            gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            onClick: () => navigate('/admin/appointments'),
          },
          {
            title: 'Pagos Pendientes',
            value: pendingPayments,
            subtitle: 'Por procesar',
            icon: <PaymentIcon sx={{ fontSize: 48 }} />,
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
            icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
            gradient: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
            onClick: () => navigate('/admin/payments'),
          },
        ]
      : []),
  ];

  return (
    <Box className="fade-in">
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <path d="M0,0 L200,200 M200,0 L0,200" stroke="white" strokeWidth="2"/>
          </svg>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            Bienvenido, {user?.name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            {isClient && 'Panel de Gestión del Cliente'}
            {isAdvisor && 'Panel de Gestión del Asesor'}
            {user?.role === 'admin' && 'Panel de Administración'}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              onClick={card.onClick}
              sx={{
                cursor: 'pointer',
                background: card.gradient,
                color: 'white',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0px 12px 40px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.8 }}>
                    {card.icon}
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
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

