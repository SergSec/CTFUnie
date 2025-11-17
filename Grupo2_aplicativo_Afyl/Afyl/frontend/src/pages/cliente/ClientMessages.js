import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ClientMessages() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Mensajes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comunícate con tu asesor legal asignado.
        </Typography>
      </Paper>
    </Container>
  );
}
