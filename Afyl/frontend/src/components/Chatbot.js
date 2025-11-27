import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

// Opciones predefinidas para el chatbot
const getQuickOptions = () => {
  const isVulnerablePort = window.location.port === '6969';
  return isVulnerablePort ? [
    { label: '📁 Subir archivos', value: 'subir archivos' },
    { label: '📋 Mis casos', value: 'casos' },
    { label: '📅 Agendar cita', value: 'cita' },
    { label: '💰 Pagos', value: 'pagos' },
    { label: '👤 Mi perfil', value: 'perfil' },
  ] : [
    { label: '📋 Mis casos', value: 'casos' },
    { label: '📅 Agendar cita', value: 'cita' },
    { label: '💰 Pagos', value: 'pagos' },
    { label: '👤 Mi perfil', value: 'perfil' },
  ];
};

export default function Chatbot({ open, onClose }) {
  const quickOptions = getQuickOptions();
  const [messages, setMessages] = useState([
    {
      text: 'Hola, soy el asistente virtual de AFYL. ¿En qué puedo ayudarte?',
      sender: 'bot',
      showOptions: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionClick = async (option) => {
    const userMessage = { text: option.label, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { message: option.value });
      setMessages((prev) => [
        ...prev,
        { text: response.data.response, sender: 'bot', showOptions: true },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Lo siento, hubo un error. Por favor, intenta de nuevo.',
          sender: 'bot',
          showOptions: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { message: input });
      setMessages((prev) => [
        ...prev,
        { text: response.data.response, sender: 'bot', showOptions: true },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Lo siento, hubo un error. Por favor, intenta de nuevo.',
          sender: 'bot',
          showOptions: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        width: 350,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Asistente Virtual
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          overflowY: 'auto',
          bgcolor: '#f5f5f5',
        }}
      >
        {messages.map((msg, index) => (
          <Box key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            </Box>
            {/* Mostrar opciones rápidas después de mensajes del bot */}
            {msg.sender === 'bot' && msg.showOptions && index === messages.length - 1 && !loading && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2, ml: 1 }}>
                {quickOptions.map((option, optIndex) => (
                  <Chip
                    key={optIndex}
                    label={option.label}
                    onClick={() => handleOptionClick(option)}
                    size="small"
                    sx={{
                      cursor: 'pointer',
                      bgcolor: 'primary.light',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Escribiendo...
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            disabled={loading}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}

