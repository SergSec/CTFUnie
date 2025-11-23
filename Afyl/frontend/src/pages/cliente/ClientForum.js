import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function ClientForum() {
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Foro de la Comunidad
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Participa en discusiones y comparte experiencias con otros clientes.
        </Typography>
      </Paper>
    </Container>
  );
}
