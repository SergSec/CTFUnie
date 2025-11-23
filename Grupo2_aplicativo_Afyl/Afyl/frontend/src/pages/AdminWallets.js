import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import api from '../services/api';

export default function AdminWallets() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [walletError, setWalletError] = useState(null);

  const { data, isLoading, error } = useQuery(['users', 'clientes'], () =>
    api.get('/users', { params: { role: 'cliente' } }).then((res) => res.data.users)
  );

  const topupMutation = useMutation((payload) => api.post('/wallet/topup', payload), {
    onSuccess: () => {
      queryClient.invalidateQueries(['users', 'clientes']);
      queryClient.invalidateQueries(['wallet', 'me']);
      setDialogOpen(false);
      setSelectedUser(null);
      setAmount('');
      setDescription('');
    },
  });

  const openTopup = (user) => {
    setSelectedUser(user);
    setAmount('');
    setDescription('Recarga manual por admin');
    setWalletInfo(null);
    setDialogOpen(true);

    // Fetch wallet for selected user to show current balance
    (async () => {
      try {
        setWalletError(null);
        const resp = await api.get(`/wallet/user/${user._id}`, { withCredentials: true });
        setWalletInfo(resp.data.wallet);
      } catch (err) {
        console.error('Error fetching wallet:', err?.response?.data || err.message);
        setWalletError(err?.response?.data?.message || err.message || 'Error desconocido');
      }
    })();
  };

  const handleTopup = async () => {
    const parsed = Number(amount);
    if (!selectedUser || isNaN(parsed) || parsed <= 0) return;
    topupMutation.mutate({ userId: selectedUser._id, amount: parsed, description }, {
      onSuccess: (data) => {
        // show updated wallet if returned
        if (data?.data?.wallet) setWalletInfo(data.data.wallet);
      }
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar clientes</Alert>;
  }

  const clients = data || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Gestión de Saldo (Admin)</Typography>
          <Typography variant="body2" color="text.secondary">Recarga saldo AFYL a clientes.</Typography>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c._id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Chip label={c.isActive ? 'Activo' : 'Inactivo'} size="small" color={c.isActive ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="contained" size="small" onClick={() => openTopup(c)}>
                      Recargar saldo
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recargar saldo a {selectedUser?.name}</DialogTitle>
        <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {walletInfo ? (
                <Alert severity="info">Saldo actual: <strong>{walletInfo.balance?.toFixed?.(2) ?? walletInfo.balance} AFYL</strong></Alert>
              ) : (
                <Box>
                  {walletError ? (
                    <Alert severity="error">{walletError}</Alert>
                  ) : (
                    <Typography variant="body2" color="text.secondary">Cargando saldo...</Typography>
                  )}
                </Box>
              )}
              <TextField label="Monto (AFYL)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <TextField label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
              {topupMutation.isError && (
                <Alert severity="error">{topupMutation.error?.response?.data?.message || 'Error al recargar'}</Alert>
              )}
              {topupMutation.isSuccess && (
                <Alert severity="success">Recarga realizada correctamente</Alert>
              )}
            </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleTopup} disabled={topupMutation.isLoading}>
            {topupMutation.isLoading ? 'Recargando...' : 'Recargar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
