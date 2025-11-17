import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ClientCases() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Mis Casos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí podrás ver y gestionar todos tus casos legales.
        </Typography>
      </Paper>
    </Container>
  );
}
