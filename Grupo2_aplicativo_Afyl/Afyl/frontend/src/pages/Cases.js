import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const categories = [
  { value: 'legal', label: 'Legal' },
  { value: 'financiero', label: 'Financiero' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'laboral', label: 'Laboral' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'otro', label: 'Otro' },
];

const priorities = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export default function Cases() {
  const navigate = useNavigate();
  const { isAdmin, isAdvisor } = useAuth();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setCaseFormError('');
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedCase(null);
    setAssignAdvisorId('');
    setAssignFormError('');
  };

  const [caseFormError, setCaseFormError] = useState('');
  const [assignFormError, setAssignFormError] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [assignAdvisorId, setAssignAdvisorId] = useState('');
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    category: 'legal',
    priority: 'media',
    clientId: '',
    advisorId: '',
  });

  const { data, isLoading, error } = useQuery(['cases', isAdvisor ? 'advisor' : 'admin'], () =>
    api.get('/cases').then((res) => res.data)
  );

  const { data: advisorsData, isLoading: advisorsLoading } = useQuery(
    ['advisors', 'options'],
    () => api.get('/users', { params: { role: 'asesor' } }).then((res) => res.data.users),
    { enabled: isAdmin }
  );

  const { data: clientsData, isLoading: clientsLoading } = useQuery(
    ['clients', 'options'],
    () => api.get('/users', { params: { role: 'cliente' } }).then((res) => res.data.users),
    { enabled: isAdmin }
  );

  const advisors = advisorsData || [];
  const clients = clientsData || [];

  const createCase = useMutation(
    (payload) => api.post('/cases', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        setCreateDialogOpen(false);
        setCaseForm({
          title: '',
          description: '',
          category: 'legal',
          priority: 'media',
          clientId: '',
          advisorId: '',
        });
        setCaseFormError('');
      },
      onError: (mutationError) => {
        const message = mutationError.response?.data?.message || 'Error al crear el caso';
        setCaseFormError(message);
      },
    }
  );

  const assignAdvisor = useMutation(
    ({ caseId, advisorId }) => api.put(`/cases/${caseId}`, { advisorId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cases'] });
        setAssignDialogOpen(false);
        setSelectedCase(null);
        setAssignFormError('');
      },
      onError: (mutationError) => {
        const message = mutationError.response?.data?.message || 'Error al asignar asesor';
        setAssignFormError(message);
      },
    }
  );

  // Mover todos los hooks antes de los returns condicionales
  const cases = data?.cases || [];
  const canCreateCases = isAdmin;

  const sortedCases = useMemo(() => {
    if (!cases || cases.length === 0) return [];
    return [...cases].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [cases]);

  const handleCaseInputChange = (e) => {
    const { name, value } = e.target;
    setCaseForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    setCaseFormError('');

    if (!caseForm.clientId || !caseForm.title || !caseForm.description) {
      setCaseFormError('Cliente, título y descripción son obligatorios');
      return;
    }

    createCase.mutate({
      ...caseForm,
      advisorId: caseForm.advisorId || undefined,
    });
  };

  const handleOpenAssignDialog = (caseItem) => {
    setSelectedCase(caseItem);
    setAssignAdvisorId(caseItem.advisorId?._id || '');
    setAssignDialogOpen(true);
  };

  const handleAssignAdvisor = () => {
    if (!selectedCase) return;
    setAssignFormError('');

    assignAdvisor.mutate({
      caseId: selectedCase._id,
      advisorId: assignAdvisorId || null,
    });
  };

  // Returns condicionales después de todos los hooks
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar los casos</Alert>;
  }

  const getStatusColor = (status) => {
    const colors = {
      nuevo: 'default',
      en_analisis: 'info',
      pendiente_cita: 'warning',
      en_proceso: 'primary',
      cerrado: 'success',
    };
    return colors[status] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isAdvisor ? 'Casos asignados' : 'Gestión de casos'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdvisor
              ? 'Consulta los detalles de los casos que has recibido.'
              : 'Crea nuevos casos y asigna asesores desde este panel.'}
          </Typography>
        </Box>
        {canCreateCases && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nuevo Caso
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Prioridad</TableCell>
              {!isAdvisor && <TableCell>Cliente</TableCell>}
              <TableCell>Asesor</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCases.map((caseItem) => (
              <TableRow
                key={caseItem._id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.02)',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/admin/cases/${caseItem._id}`)}
              >
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {caseItem.title}
                  </Typography>
                </TableCell>
                <TableCell>{caseItem.category}</TableCell>
                <TableCell>
                  <Chip
                    label={caseItem.status}
                    color={getStatusColor(caseItem.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{caseItem.priority}</TableCell>
                {!isAdvisor && (
                  <TableCell>
                    {caseItem.clientId?.name || 'N/A'}
                  </TableCell>
                )}
                <TableCell>
                  {caseItem.advisorId?.name || 'Sin asignar'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/cases/${caseItem._id}`);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <Tooltip title="Asignar asesor">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAssignDialog(caseItem);
                        }}
                      >
                        <AssignmentTurnedInIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Crear caso */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo caso</DialogTitle>
        <DialogContent dividers>
          {caseFormError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {caseFormError}
            </Alert>
          )}
          {!clientsLoading && clients.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay clientes registrados. Crea un cliente antes de generar un caso.
            </Alert>
          )}
          <Stack spacing={2}>
            <FormControl fullWidth required>
              <InputLabel id="client-select">Cliente</InputLabel>
              <Select
                labelId="client-select"
                label="Cliente"
                name="clientId"
                value={caseForm.clientId}
                onChange={handleCaseInputChange}
              >
                {clients.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.name} - {client.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Título"
              name="title"
              value={caseForm.title}
              onChange={handleCaseInputChange}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              name="description"
              value={caseForm.description}
              onChange={handleCaseInputChange}
              required
              fullWidth
              multiline
              rows={4}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="category-select">Categoría</InputLabel>
                <Select
                  labelId="category-select"
                  label="Categoría"
                  name="category"
                  value={caseForm.category}
                  onChange={handleCaseInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="priority-select">Prioridad</InputLabel>
                <Select
                  labelId="priority-select"
                  label="Prioridad"
                  name="priority"
                  value={caseForm.priority}
                  onChange={handleCaseInputChange}
                >
                  {priorities.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <InputLabel id="advisor-select">Asesor</InputLabel>
              <Select
                labelId="advisor-select"
                label="Asesor"
                name="advisorId"
                value={caseForm.advisorId}
                onChange={handleCaseInputChange}
                displayEmpty
                disabled={advisorsLoading}
              >
                <MenuItem value="">
                  <em>Sin asignar</em>
                </MenuItem>
                {advisors.map((advisor) => (
                  <MenuItem key={advisor._id} value={advisor._id}>
                    {advisor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseCreateDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateCase}
            disabled={createCase.isLoading || clients.length === 0 || clientsLoading}
          >
            {createCase.isLoading ? 'Guardando...' : 'Crear caso'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Asignar asesor */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar asesor</DialogTitle>
        <DialogContent dividers>
          {assignFormError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignFormError}
            </Alert>
          )}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {selectedCase?.title}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="assign-advisor-select">Asesor</InputLabel>
            <Select
              labelId="assign-advisor-select"
              label="Asesor"
              value={assignAdvisorId}
              onChange={(e) => setAssignAdvisorId(e.target.value)}
              disabled={advisorsLoading}
            >
              <MenuItem value="">
                <em>Sin asignar</em>
              </MenuItem>
              {advisors.map((advisor) => (
                <MenuItem key={advisor._id} value={advisor._id}>
                  {advisor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAssignDialog}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleAssignAdvisor}
            disabled={assignAdvisor.isLoading}
          >
            {assignAdvisor.isLoading ? 'Actualizando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

