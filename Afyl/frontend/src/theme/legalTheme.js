import { createTheme } from '@mui/material/styles';

// Paleta de colores profesional para asesoría legal
const legalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e', // Deep Blue
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d4af37', // Gold
      light: '#ffe06c',
      dark: '#a08100',
      contrastText: '#000000',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#2d3748',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 4px 20px rgba(0, 0, 0, 0.05)', // 1: Soft card shadow
    '0px 8px 30px rgba(0, 0, 0, 0.08)', // 2: Hover state
    '0px 10px 40px rgba(26, 35, 126, 0.1)', // 3: Active/Modal
    '0px 20px 60px rgba(26, 35, 126, 0.15)', // 4: High elevation
    ...Array(21).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 28px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px -4px rgba(26, 35, 126, 0.2)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: '#ffffff',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
          color: '#000',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover': {
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#1a237e',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(26, 35, 126, 0.08)',
              '& fieldset': {
                borderWidth: 2,
                borderColor: '#1a237e',
              },
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
        filled: {
          border: '1px solid transparent',
        },
        outlined: {
          border: '1px solid currentColor',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0px 20px 60px rgba(26, 35, 126, 0.2)',
        },
      },
    },
  },
});

export default legalTheme;

