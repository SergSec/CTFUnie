import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

export default function Forum() {
  const { data, isLoading, error } = useQuery('forum', () =>
    api.get('/forum').then((res) => res.data)
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error al cargar el foro</Alert>;
  }

  const posts = data?.posts || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Foro
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nueva Publicación
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {posts.map((post) => (
          <Paper key={post._id} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {post.content}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Por {post.authorId?.name} - {new Date(post.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

