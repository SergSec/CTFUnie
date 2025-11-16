import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';

export default function Messages() {
  const [message, setMessage] = useState('');
  const { data, isLoading, error } = useQuery('messages', () =>
    api.get('/messages').then((res) => res.data)
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar los mensajes</Alert>;
  }

  const messages = data?.messages || [];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Mensajes
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Escribe tu mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Enviar
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg) => (
          <Paper key={msg._id} sx={{ p: 2 }}>
            <Typography variant="body1">{msg.content}</Typography>
            <Typography variant="caption" color="text.secondary">
              {msg.senderId?.name} - {new Date(msg.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

