import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ClientPayments() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Mis Pagos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí podrás ver tu historial de pagos y facturas.
        </Typography>
      </Paper>
    </Container>
  );
}
