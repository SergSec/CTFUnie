import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ClientAppointments() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Mis Citas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí podrás agendar y ver tus citas con asesores legales.
        </Typography>
      </Paper>
    </Container>
  );
}
