import React from 'react';
import { Container, Typography, Paper, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientProfile() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Mi Perfil
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre"
              value={user?.name || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={user?.phone || 'No especificado'}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rol"
              value={user?.role || ''}
              disabled
              sx={{ textTransform: 'capitalize' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary">
              Editar Perfil
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
