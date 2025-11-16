import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import api from '../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  password: '',
};

export default function AdvisorManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
  } = useQuery(['advisors'], () =>
    api.get('/users', { params: { role: 'asesor' } }).then((res) => res.data.users)
  );

  const createAdvisor = useMutation(
    (payload) => api.post('/users', { ...payload, role: 'asesor' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['advisors']);
        setDialogOpen(false);
        setFormData(initialForm);
        setFormError('');
      },
      onError: (mutationError) => {
        const message = mutationError.response?.data?.message || 'Error al crear asesor';
        setFormError(message);
      },
    }
  );

  const toggleAdvisorStatus = useMutation(
    ({ id, isActive }) => api.put(`/users/${id}`, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['advisors']);
      },
    }
  );

  const advisors = data || [];

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData(initialForm);
    setFormError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAdvisor = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Nombre, email y contraseña son obligatorios');
      return;
    }

    createAdvisor.mutate(formData);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar asesores</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Gestión de Asesores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormData(initialForm);
            setFormError('');
            setDialogOpen(true);
          }}
        >
          Nuevo Asesor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Especialización</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {advisors.map((advisor) => (
              <TableRow key={advisor._id}>
                <TableCell>{advisor.name}</TableCell>
                <TableCell>{advisor.email}</TableCell>
                <TableCell>{advisor.phone || 'N/A'}</TableCell>
                <TableCell>{advisor.specialization || 'Sin definir'}</TableCell>
                <TableCell>
                  <Chip
                    label={advisor.isActive ? 'Activo' : 'Inactivo'}
                    color={advisor.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      color={advisor.isActive ? 'warning' : 'success'}
                      startIcon={advisor.isActive ? <PersonOffIcon /> : <PersonAddAltIcon />}
                      onClick={() =>
                        toggleAdvisorStatus.mutate({
                          id: advisor._id,
                          isActive: !advisor.isActive,
                        })
                      }
                    >
                      {advisor.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Crear nuevo asesor</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre completo"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              label="Teléfono"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Especialización"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              label="Contraseña temporal"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              helperText="Comparte esta contraseña inicial con el asesor"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleCreateAdvisor}
            disabled={createAdvisor.isLoading}
          >
            {createAdvisor.isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


