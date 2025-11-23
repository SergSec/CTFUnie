import React, { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../services/api';

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState('pendiente');
  const { data, isLoading, error } = useQuery('payments', () =>
    api.get('/payments').then((res) => res.data)
  );
  const {
    data: walletResponse,
    isLoading: walletLoading,
    error: walletError,
  } = useQuery(['wallet', 'me'], () => api.get('/wallet').then((res) => res.data), {
    staleTime: 60 * 1000,
  });

  const payments = data?.payments || [];

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'todos') {
      return payments;
    }
    return payments.filter((payment) => payment.status === statusFilter);
  }, [payments, statusFilter]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar los pagos</Alert>;
  }

  const handleFilterChange = (_, value) => {
    if (value !== null) {
      setStatusFilter(value);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'warning',
      procesando: 'info',
      completado: 'success',
      fallido: 'error',
      reembolsado: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pagos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revisa los importes pendientes que se generan tras solicitar una cita.
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="pendiente">Pendientes</ToggleButton>
          <ToggleButton value="procesando">Procesando</ToggleButton>
          <ToggleButton value="completado">Completados</ToggleButton>
          <ToggleButton value="todos">Todos</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ mb: 3, p: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Pasarela Virtual AFYL
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Estamos usando una moneda virtual interna para preparar la integración con Stripe. Cada pago marcado
          como <strong>AFYL</strong> descuenta del saldo disponible en la wallet del cliente.
        </Typography>
        {walletLoading ? (
          <CircularProgress size={20} />
        ) : walletError ? (
          <Alert severity="warning" sx={{ mb: 0 }}>
            No se pudo cargar el saldo de tu wallet.
          </Alert>
        ) : (
          <Chip
            label={`Saldo disponible: ${(walletResponse?.wallet?.balance || 0).toFixed(2)} AFYL`}
            color="primary"
            sx={{ fontWeight: 600 }}
          />
        )}
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Descripción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay pagos con el estado seleccionado.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    {format(new Date(payment.createdAt), 'PP')}
                  </TableCell>
                  <TableCell>{payment.clientId?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {payment.amount.toFixed(2)} {payment.currency}
                  </TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{payment.description || 'N/A'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

