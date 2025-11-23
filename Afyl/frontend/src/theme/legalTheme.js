import { createTheme } from '@mui/material/styles';

// Paleta de colores profesional para asesoría legal
const legalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Azul oscuro profesional
      light: '#283593',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4af37', // Dorado elegante
      light: '#f4d03f',
      dark: '#b7950b',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#c62828',
      light: '#e53935',
      dark: '#b71c1c',
    },
    info: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1a237e',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a237e',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1a237e',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a237e',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a237e',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a237e',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(26, 35, 126, 0.08)',
    '0px 4px 8px rgba(26, 35, 126, 0.12)',
    '0px 8px 16px rgba(26, 35, 126, 0.16)',
    '0px 12px 24px rgba(26, 35, 126, 0.20)',
    '0px 16px 32px rgba(26, 35, 126, 0.24)',
    ...Array(19).fill('0px 2px 4px rgba(26, 35, 126, 0.08)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(26, 35, 126, 0.2)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #f5a524 0%, #d97706 100%)',
          color: '#1f2933',
          '&:hover': {
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
          color: '#000',
          '&:hover': {
            background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(26, 35, 126, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(26, 35, 126, 0.15)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(26, 35, 126, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(26, 35, 126, 0.12)',
        },
        elevation3: {
          boxShadow: '0px 8px 24px rgba(26, 35, 126, 0.16)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          boxShadow: '0px 4px 20px rgba(26, 35, 126, 0.2)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#283593',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a237e',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f7fa',
          '& .MuiTableCell-head': {
            fontWeight: 700,
            color: '#1a237e',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(26, 35, 126, 0.08)',
        },
      },
    },
  },
});

export default legalTheme;

