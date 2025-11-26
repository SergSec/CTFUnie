import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { value: 'services', label: 'Servicios' },
  { value: 'help', label: '¿Con qué necesitas ayuda?' },
  { value: 'conflicts', label: '¿Qué tipo de conflicto tienes?' },
];

const initialForm = {
  id: '',
  title: '',
  description: '',
  order: 0,
  isActive: true,
  parentId: '',
  tags: [],
};

const initialProblem = {
  id: '',
  label: '',
  description: '',
  order: 0,
  isActive: true,
};

const flattenServices = (nodes = [], parent = null, level = 0) => {
  let result = [];
  nodes.forEach((node) => {
    result.push({
      ...node,
      level,
      parentTitle: parent?.title || null,
    });
    if (node.children?.length) {
      result = result.concat(flattenServices(node.children, node, level + 1));
    }
  });
  return result;
};

const findServiceByCustomId = (nodes = [], id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const child = findServiceByCustomId(node.children, id);
      if (child) return child;
    }
  }
  return null;
};

export default function ServiceManagement() {
  const { user } = useAuth();
  const [servicesTree, setServicesTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [activeTab, setActiveTab] = useState('services');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContext, setDialogContext] = useState('service');
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [selectedHelpId, setSelectedHelpId] = useState('');
  const [selectedConflictId, setSelectedConflictId] = useState('');
  const [problemDialogOpen, setProblemDialogOpen] = useState(false);
  const [editingProblemIndex, setEditingProblemIndex] = useState(null);
  const [problemForm, setProblemForm] = useState(initialProblem);

  const [conflicts, setConflicts] = useState([]);
  const [loadingConflicts, setLoadingConflicts] = useState(false);

  // New states for configurable form fields per service
  const [formFieldDialogOpen, setFormFieldDialogOpen] = useState(false);
  const [editingFormFieldIndex, setEditingFormFieldIndex] = useState(null);
  const [formFieldForm, setFormFieldForm] = useState({ id: '', label: '', type: 'text', options: [], placeholder: '', required: false, order: 0, isActive: true });

  const flatServices = useMemo(
    () => flattenServices(servicesTree),
    [servicesTree]
  );

  const topLevelServices = useMemo(
    () => servicesTree.filter((service) => !service.parent),
    [servicesTree]
  );

  const selectedHelp = useMemo(
    () => (selectedHelpId ? findServiceByCustomId(servicesTree, selectedHelpId) : null),
    [servicesTree, selectedHelpId]
  );

  const selectedConflict = useMemo(
    () => (selectedConflictId ? conflicts.find(c => c._id === selectedConflictId) : null),
    [conflicts, selectedConflictId]
  );

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchServices();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedHelpId && topLevelServices.length > 0) {
      setSelectedHelpId(topLevelServices[0].id);
    }
  }, [topLevelServices, selectedHelpId]);

  useEffect(() => {
    if (selectedHelpId) {
      fetchConflicts(selectedHelpId);
    } else {
      setConflicts([]);
    }
  }, [selectedHelpId]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get('/services/all?format=tree');
      setServicesTree(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar los servicios',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConflicts = async (serviceId) => {
    setLoadingConflicts(true);
    try {
      const response = await api.get(`/conflicts/all/service/${serviceId}`);
      setConflicts(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar conflictos:', error);
      setAlert({
        type: 'error',
        message: 'Error al cargar los conflictos',
      });
    } finally {
      setLoadingConflicts(false);
    }
  };

  const handleOpenDialog = (item = null, options = {}) => {
    const context = options.context || 'service';
    setDialogContext(context);

    if (context === 'conflict') {
      if (item) {
        setEditingService(item); // Reusing editingService state for conflict
        setFormData({
          id: item._id, // Conflict uses _id
          title: item.title,
          description: item.description,
          order: item.order,
          isActive: item.isActive,
          parentId: options.parentId || '', // Service ID
        });
      } else {
        setEditingService(null);
        setFormData({
          title: '',
          description: '',
          order: 0,
          isActive: true,
          parentId: options.parentId || '', // Service ID
        });
      }
    } else {
      // Service logic
      if (item) {
        setEditingService(item);
        setFormData({
          id: item.id,
          title: item.title,
          description: item.description,
          order: item.order,
          isActive: item.isActive,
          parentId: item.parent ? item.parent.toString() : '',
          tags: item.tags || [],
          formFields: item.formFields || [],
        });
      } else {
        setEditingService(null);
        setFormData({
          ...initialForm,
          parentId: options.parentId || '',
          order: 0,
          formFields: [],
        });
      }
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
    setFormData(initialForm);
    setFormFieldForm({ id: '', label: '', type: 'text', options: [], placeholder: '', required: false, order: 0, isActive: true });
    setFormFieldDialogOpen(false);
    setEditingFormFieldIndex(null);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (dialogContext === 'conflict') {
        const payload = {
          title: formData.title,
          description: formData.description,
          order: Number(formData.order),
          isActive: formData.isActive,
          serviceId: formData.parentId, // We stored serviceId in parentId
        };

        if (editingService) {
          await api.put(`/conflicts/${editingService._id}`, payload);
          setAlert({ type: 'success', message: 'Conflicto actualizado correctamente' });
        } else {
          await api.post('/conflicts', payload);
          setAlert({ type: 'success', message: 'Conflicto creado correctamente' });
        }
        fetchConflicts(formData.parentId);
      } else {
        // Service logic
        const payload = {
          ...formData,
          order: Number(formData.order),
          parentId: formData.parentId || null,
          formFields: formData.formFields || [],
        };

        if (editingService) {
          await api.put(`/services/${editingService.id}`, payload);
          setAlert({ type: 'success', message: 'Servicio actualizado correctamente' });
        } else {
          await api.post('/services', payload);
          setAlert({ type: 'success', message: 'Servicio creado correctamente' });
        }
        fetchServices();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar',
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
        message: `Servicio ${!service.isActive ? 'activado' : 'desactivado'} correctamente`,
      });
      fetchServices();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setAlert({ type: 'error', message: 'Error al cambiar el estado del servicio' });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.title}"?`)) return;
    try {
      if (activeTab === 'conflicts') {
        await api.delete(`/conflicts/${item._id}`);
        setAlert({ type: 'success', message: 'Conflicto eliminado correctamente' });
        fetchConflicts(selectedHelpId);
      } else {
        await api.delete(`/services/${item.id}`);
        setAlert({ type: 'success', message: 'Servicio eliminado correctamente' });
        fetchServices();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      setAlert({ type: 'error', message: 'Error al eliminar' });
    }
  };

  const openProblemDialog = (problem = null, conflictContext = null) => {
    const targetConflict = conflictContext || selectedConflict;
    if (!targetConflict) return;
    if (problem) {
      setProblemForm({
        id: problem.id,
        label: problem.label,
        description: problem.description,
        order: problem.order,
        isActive: problem.isActive,
      });
      const index = targetConflict.problems?.findIndex((p) => p.id === problem.id) ?? -1;
      setEditingProblemIndex(index);
    } else {
      setProblemForm({
        ...initialProblem,
        order: targetConflict.problems?.length || 0,
      });
      setEditingProblemIndex(null);
    }
    setSelectedConflictId(targetConflict._id); // Use _id
    setProblemDialogOpen(true);
  };

  const handleSaveProblem = async () => {
    if (!selectedConflict) return;
    const existingProblems = selectedConflict.problems || [];
    const normalizedProblem = {
      ...problemForm,
      id: problemForm.id.trim().toLowerCase().replace(/\s+/g, '-'),
      label: problemForm.label.trim(),
      description: problemForm.description.trim(),
      order: Number(problemForm.order),
    };

    const updatedProblems =
      editingProblemIndex !== null
        ? existingProblems.map((problem, index) =>
          index === editingProblemIndex ? normalizedProblem : problem
        )
        : [...existingProblems, normalizedProblem];

    try {
      await api.put(`/conflicts/${selectedConflict._id}`, {
        problems: updatedProblems,
      });
      setAlert({ type: 'success', message: 'Problemas actualizados correctamente' });
      setProblemDialogOpen(false);
      setProblemForm(initialProblem);
      setEditingProblemIndex(null);
      fetchConflicts(selectedHelpId);
    } catch (error) {
      console.error('Error al guardar problema:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error al guardar el problema',
      });
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!selectedConflict) return;
    const updatedProblems = (selectedConflict.problems || []).filter(
      (problem) => problem.id !== problemId
    );
    try {
      await api.put(`/conflicts/${selectedConflict._id}`, {
        problems: updatedProblems,
      });
      setAlert({ type: 'success', message: 'Problema eliminado' });
      fetchConflicts(selectedHelpId);
    } catch (error) {
      console.error('Error al eliminar problema:', error);
      setAlert({ type: 'error', message: 'Error al eliminar el problema' });
    }
  };

  const openFormFieldDialog = (field = null, index = null) => {
    if (field) {
      setFormFieldForm({
        id: field.id,
        label: field.label,
        type: field.type || 'text',
        options: field.options || [],
        placeholder: field.placeholder || '',
        required: !!field.required,
        order: field.order || 0,
        isActive: field.isActive !== undefined ? !!field.isActive : true,
      });
      setEditingFormFieldIndex(index);
    } else {
      setFormFieldForm({ id: '', label: '', type: 'text', options: [], placeholder: '', required: false, order: 0, isActive: true });
      setEditingFormFieldIndex(null);
    }
    setFormFieldDialogOpen(true);
  };

  const handleSaveFormField = async () => {
    // validate
    if (!formFieldForm.id || !formFieldForm.label) {
      setAlert({ type: 'error', message: 'ID y Título del campo son requeridos' });
      return;
    }

    const normalized = {
      ...formFieldForm,
      id: formFieldForm.id.toString().trim().toLowerCase().replace(/\s+/g, '-'),
      label: formFieldForm.label.toString().trim(),
      options: Array.isArray(formFieldForm.options) ? formFieldForm.options.map(o => o.toString()) : [],
      order: Number(formFieldForm.order || 0),
    };

    const currentFields = formData.formFields || [];
    let updated;
    if (editingFormFieldIndex !== null) {
      updated = currentFields.map((f, idx) => (idx === editingFormFieldIndex ? normalized : f));
    } else {
      updated = [...currentFields, normalized];
    }

    setFormData((prev) => ({ ...prev, formFields: updated }));
    setFormFieldDialogOpen(false);
    setEditingFormFieldIndex(null);
  };

  const handleDeleteFormField = (index) => {
    if (!window.confirm('¿Eliminar este campo de formulario?')) return;
    const updated = (formData.formFields || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, formFields: updated }));
  };

  const handleFormFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFieldForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProblemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProblemForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  if (user && user.role !== 'admin') {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          No tienes permisos para acceder a esta página
        </Alert>
      </Container>
    );
  }

  const dialogTitles = {
    service: editingService ? 'Editar servicio' : 'Nuevo servicio',
    help: editingService ? 'Editar ayuda' : 'Nueva ayuda',
    conflict: editingService ? 'Editar conflicto' : 'Nuevo conflicto',
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestión de Servicios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura el árbol de servicios, ayudas y conflictos disponibles para los clientes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null, { context: 'service' })}
        >
          Nuevo servicio
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

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 3 }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {activeTab === 'services' && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Padre</TableCell>
                  <TableCell align="center">Nivel</TableCell>
                  <TableCell align="center">Orden</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Cargando…
                    </TableCell>
                  </TableRow>
                ) : flatServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay servicios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  flatServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{service.id}</TableCell>
                      <TableCell>{service.title}</TableCell>
                      <TableCell>{service.parentTitle || '—'}</TableCell>
                      <TableCell align="center">{service.level}</TableCell>
                      <TableCell align="center">
                        <Chip label={service.order} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={service.isActive ? 'Activo' : 'Inactivo'}
                          color={service.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleOpenDialog(service, { context: 'service' })}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={service.isActive ? 'Desactivar' : 'Activar'}>
                          <IconButton
                            color={service.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleActive(service)}
                          >
                            {service.isActive ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton color="error" onClick={() => handleDelete(service)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 'help' && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ¿Con qué necesitas ayuda?
            </Typography>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => handleOpenDialog(null, { context: 'help', parentId: '' })}
            >
              Nueva ayuda
            </Button>
          </Box>
          {loading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>Cargando…</Paper>
          ) : topLevelServices.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              No hay ayudas registradas. Crea la primera para habilitar el árbol de conflictos.
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {topLevelServices.map((service) => (
                <Grid key={service.id} item xs={12} md={6} lg={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderColor: selectedHelpId === service.id ? 'primary.main' : 'divider',
                      boxShadow: selectedHelpId === service.id ? '0 0 0 2px rgba(26,35,126,0.08)' : 'none',
                    }}
                    onClick={() => setSelectedHelpId(service.id)}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, mt: 1 }}>
                        {service.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={1}>
                        <Chip label={`Orden ${service.order}`} size="small" />
                        <Chip
                          label={service.isActive ? 'Activo' : 'Inactivo'}
                          color={service.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(service, { context: 'help' })}>
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(service)}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 'conflicts' && (
        <Box>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configura los tipos de conflicto relacionados con cada ayuda.
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Selecciona la ayuda</InputLabel>
              <Select
                label="Selecciona la ayuda"
                value={selectedHelpId}
                onChange={(event) => {
                  setSelectedHelpId(event.target.value);
                  setSelectedConflictId('');
                }}
              >
                {topLevelServices.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="subtitle1">
                {selectedHelp ? `Conflictos en: ${selectedHelp.title}` : 'Selecciona una ayuda para continuar'}
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                disabled={!selectedHelp}
                onClick={() =>
                  handleOpenDialog(null, { context: 'conflict', parentId: selectedHelp?.id || '' })
                }
              >
                Nuevo conflicto
              </Button>
            </Box>
          </Stack>

          {!selectedHelp ? (
            <Alert severity="info">Selecciona una ayuda para ver sus conflictos.</Alert>
          ) : loadingConflicts ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>Cargando conflictos...</Paper>
          ) : conflicts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              Aún no hay conflictos configurados para esta ayuda.
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {conflicts.map((conflict) => (
                <Grid item xs={12} md={6} key={conflict._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderColor: selectedConflictId === conflict._id ? 'primary.main' : 'divider',
                    }}
                    onClick={() => setSelectedConflictId(conflict._id)}
                  >
                    <CardContent>
                      <Typography variant="h6">{conflict.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, mt: 1 }}>
                        {conflict.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={1}>
                        <Chip label={`Orden ${conflict.order}`} size="small" />
                        <Chip
                          label={`${conflict.problems?.length || 0} problemas`}
                          size="small"
                          color="info"
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                        <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(conflict, { context: 'conflict', parentId: selectedHelpId })}>
                          Editar
                        </Button>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => openProblemDialog(null, conflict)}
                        >
                          Añadir problema
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(conflict)}>
                          Eliminar
                        </Button>
                      </Stack>

                      {selectedConflictId === conflict._id && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Problemas
                          </Typography>
                          {conflict.problems?.length ? (
                            <List dense>
                              {conflict.problems.map((problem) => (
                                <ListItem key={problem.id}>
                                  <ListItemText
                                    primary={problem.label}
                                    secondary={problem.description || 'Sin descripción'}
                                  />
                                  <ListItemSecondaryAction>
                                    <Chip label={`Orden ${problem.order}`} size="small" sx={{ mr: 1 }} />
                                    <Chip
                                      label={problem.isActive ? 'Activo' : 'Inactivo'}
                                      color={problem.isActive ? 'success' : 'default'}
                                      size="small"
                                      sx={{ mr: 1 }}
                                    />
                                    <IconButton
                                      edge="end"
                                      size="small"
                                      onClick={() => openProblemDialog(problem, conflict)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      edge="end"
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteProblem(problem.id)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No hay problemas configurados.
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{dialogTitles[dialogContext]}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {dialogContext !== 'conflict' && (
                <TextField
                  label="ID"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  required
                  helperText="Minúsculas, sin espacios. Ej: laboral"
                />
              )}
              <TextField
                label="Título"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                multiline
                minRows={3}
              />
              <TextField
                label="Orden"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                helperText="Permite números negativos para forzar prioridad"
              />
              {dialogContext !== 'conflict' && (
                <FormControl fullWidth>
                  <InputLabel>Servicio padre (opcional)</InputLabel>
                  <Select
                    label="Servicio padre (opcional)"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Sin padre (nivel raíz)</MenuItem>
                    {flatServices.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {'—'.repeat(service.level)} {service.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    name="isActive"
                  />
                }
                label="Activo"
              />

              {/* Form fields configuration for this service (admin) */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Campos del formulario</Typography>
                {(formData.formFields || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No hay campos configurados.</Typography>
                ) : (
                  <List dense>
                    {(formData.formFields || []).map((f, idx) => (
                      <ListItem key={f.id} secondaryAction={
                        <Box>
                          <IconButton edge="end" size="small" onClick={() => openFormFieldDialog(f, idx)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton edge="end" size="small" color="error" onClick={() => handleDeleteFormField(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }>
                        <ListItemText primary={`${f.label} (${f.type})`} secondary={f.placeholder || ''} />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Box sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openFormFieldDialog(null)}>
                    Añadir campo
                  </Button>
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingService ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={problemDialogOpen} onClose={() => setProblemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProblemIndex !== null ? 'Editar problema' : 'Nuevo problema'}</DialogTitle>
        <DialogContent dividers>
          {selectedConflict ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                Conflicto: <strong>{selectedConflict.title}</strong>
              </Alert>
              <TextField
                label="ID"
                name="id"
                value={problemForm.id}
                onChange={handleProblemChange}
                required
                helperText="Identificador corto, minúsculas sin espacios"
              />
              <TextField
                label="Título"
                name="label"
                value={problemForm.label}
                onChange={handleProblemChange}
                required
              />
              <TextField
                label="Descripción"
                name="description"
                value={problemForm.description}
                onChange={handleProblemChange}
                multiline
                minRows={3}
              />
              <TextField
                label="Orden"
                name="order"
                type="number"
                value={problemForm.order}
                onChange={handleProblemChange}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={problemForm.isActive}
                    onChange={handleProblemChange}
                    name="isActive"
                  />
                }
                label="Activo"
              />
            </Stack>
          ) : (
            <Alert severity="warning">Selecciona un conflicto para gestionar sus problemas.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProblemDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSaveProblem}
            disabled={!selectedConflict}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formFieldDialogOpen} onClose={() => setFormFieldDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFormFieldIndex !== null ? 'Editar campo' : 'Nuevo campo'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="ID" name="id" value={formFieldForm.id} onChange={handleFormFieldChange} required helperText="minúsculas, sin espacios" />
            <TextField label="Título" name="label" value={formFieldForm.label} onChange={handleFormFieldChange} required />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select label="Tipo" name="type" value={formFieldForm.type} onChange={handleFormFieldChange}>
                <MenuItem value="text">Texto</MenuItem>
                <MenuItem value="textarea">Área de texto</MenuItem>
                <MenuItem value="select">Select</MenuItem>
                <MenuItem value="checkbox">Checkbox</MenuItem>
              </Select>
            </FormControl>
            {formFieldForm.type === 'select' && (
              <TextField label="Opciones (separadas por coma)" name="options" value={(formFieldForm.options || []).join(',')} onChange={(e) => setFormFieldForm(prev => ({ ...prev, options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
            )}
            <TextField label="Placeholder" name="placeholder" value={formFieldForm.placeholder} onChange={handleFormFieldChange} />
            <TextField label="Orden" name="order" type="number" value={formFieldForm.order} onChange={handleFormFieldChange} />
            <FormControlLabel control={<Switch checked={formFieldForm.required} onChange={(e) => setFormFieldForm(prev => ({ ...prev, required: e.target.checked }))} name="required" />} label="Requerido" />
            <FormControlLabel control={<Switch checked={formFieldForm.isActive} onChange={(e) => setFormFieldForm(prev => ({ ...prev, isActive: e.target.checked }))} name="isActive" />} label="Activo" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormFieldDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveFormField}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
