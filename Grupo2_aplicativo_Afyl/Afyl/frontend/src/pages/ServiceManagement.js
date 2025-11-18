import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ServiceManagement() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    icon: '',
    order: 0,
    isActive: true,
  });
  const [alert, setAlert] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/all');
      setServices(response.data.data);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setAlert({ type: 'error', message: 'Error al cargar los servicios' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        id: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon || '',
        order: service.order,
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        id: '',
        title: '',
        description: '',
        icon: '',
        order: services.length,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData({
      id: '',
      title: '',
      description: '',
      icon: '',
      order: 0,
      isActive: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        // Actualizar servicio existente
        await api.put(`/services/${editingService.id}`, formData);
        setAlert({ type: 'success', message: 'Servicio actualizado exitosamente' });
      } else {
        // Crear nuevo servicio
        await api.post('/services', formData);
        setAlert({ type: 'success', message: 'Servicio creado exitosamente' });
      }
      fetchServices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar servicio:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar el servicio',
      });
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await api.put(`/services/${service.id}`, {
        isActive: !service.isActive,
      });
      setAlert({
        type: 'success',
        message: `Servicio ${!service.isActive ? 'activado' : 'desactivado'} exitosamente`,
      });
      fetchServices();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setAlert({ type: 'error', message: 'Error al cambiar el estado del servicio' });
    }
  };

  const handleDelete = async (service) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.title}"?`)) {
      try {
        await api.delete(`/services/${service.id}`);
        setAlert({ type: 'success', message: 'Servicio eliminado exitosamente' });
        fetchServices();
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
        setAlert({ type: 'error', message: 'Error al eliminar el servicio' });
      }
    }
  };

  if (user && user.role !== 'admin') {
    return (
      <Container>
        <Alert severity="error">No tienes permisos para acceder a esta página</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Servicios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Servicio
        </Button>
      </Box>

      {alert.message && (
        <Alert
          severity={alert.type}
          sx={{ mb: 3 }}
          onClose={() => setAlert({ type: '', message: '' })}
        >
          {alert.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Orden</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay servicios registrados
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {service.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {service.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {service.description.substring(0, 80)}
                      {service.description.length > 80 && '...'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={service.order} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    {service.isActive ? (
                      <Chip label="Activo" color="success" size="small" />
                    ) : (
                      <Chip label="Inactivo" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={service.isActive ? 'Desactivar' : 'Activar'}>
                      <IconButton
                        size="small"
                        color={service.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleActive(service)}
                      >
                        {service.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(service)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar servicio */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="ID"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              required
              disabled={!!editingService}
              margin="normal"
              helperText="Identificador único (sin espacios, minúsculas, guiones permitidos)"
            />
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Icono (opcional)"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              margin="normal"
              helperText="Nombre del icono de Material-UI (ej: Gavel, Business, etc.)"
            />
            <TextField
              fullWidth
              label="Orden"
              name="order"
              type="number"
              value={formData.order}
              onChange={handleInputChange}
              margin="normal"
              helperText="Número para ordenar los servicios (menor aparece primero)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  name="isActive"
                />
              }
              label="Servicio activo"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingService ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
