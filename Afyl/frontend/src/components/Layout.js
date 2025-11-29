import React, { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import GavelIcon from '@mui/icons-material/Gavel';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../services/api';
import Chatbot from './Chatbot';

const drawerWidth = 280;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isAdvisor } = useAuth();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    if (user?.role === 'admin') {
      navigate('/privilegiados/login');
    } else if (user?.role === 'asesor') {
      navigate('/asesor/login');
    } else {
      navigate('/login');
    }
    handleMenuClose();
  };

  const menuItems = useMemo(() => {
    const items = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    ];

    if (isAdmin || isAdvisor) {
      items.push(
        { text: 'Casos', icon: <FolderIcon />, path: '/admin/cases' },
        { text: 'Solicitudes de Citas', icon: <EventAvailableIcon />, path: '/admin/appointments/requests' }
      );
    }

    if (isAdmin) {
      items.push(
        { text: 'Asesores', icon: <SupportAgentIcon />, path: '/admin/advisors' },
        { text: 'Servicios', icon: <MiscellaneousServicesIcon />, path: '/admin/services' },
        { text: 'Citas', icon: <CalendarTodayIcon />, path: '/admin/appointments' },
        { text: 'Pagos', icon: <PaymentIcon />, path: '/admin/payments' },
        { text: 'Recargas', icon: <AccountBalanceWalletIcon />, path: '/admin/wallets' }
      );
    }

    return items;
  }, [isAdmin, isAdvisor]);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
      <Box
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Box
          component="img"
          src="/logo-afyl.png"
          alt="Afyl"
          sx={{
            height: 50,
            width: 'auto',
            objectFit: 'contain',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 3,
            p: 1,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'scale(1.05)' },
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        />
        <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Panel de Administración
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, pt: 3, px: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path ||
            (item.path === '/admin/cases' && location.pathname.startsWith('/admin/cases'));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  const target = item.path && item.path.startsWith('/') ? item.path : `/${item.path}`;
                  if (item.path === '/admin/wallets' || item.text === 'Recargas') {
                    window.location.assign('/admin/wallets');
                    return;
                  }
                  navigate(target);
                }}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(90deg, rgba(26, 35, 126, 0.15) 0%, rgba(26, 35, 126, 0.05) 100%)',
                    color: 'primary.main',
                    '&:hover': {
                      background: 'linear-gradient(90deg, rgba(26, 35, 126, 0.2) 0%, rgba(26, 35, 126, 0.1) 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(0,0,0,0.03)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid rgba(0,0,0,0.05)',
          background: 'rgba(255,255,255,0.5)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={user?.profilePicture ? `${API_URL.replace('/api', '')}${user.profilePicture}` : null}
            sx={{
              bgcolor: 'primary.main',
              width: 44,
              height: 44,
              boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
              border: '2px solid white',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }} noWrap>
              {user?.role === 'cliente' && 'Cliente'}
              {user?.role === 'asesor' && 'Asesor Legal'}
              {user?.role === 'admin' && 'Administrador'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 4, height: 70 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Plataforma de Asesoría
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Asistente Virtual">
              <IconButton
                onClick={() => setChatbotOpen(!chatbotOpen)}
                sx={{
                  color: chatbotOpen ? 'primary.main' : 'text.secondary',
                  background: chatbotOpen ? 'rgba(26, 35, 126, 0.1)' : 'transparent',
                  '&:hover': { background: 'rgba(26, 35, 126, 0.05)' },
                }}
              >
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                border: '2px solid transparent',
                '&:hover': { borderColor: 'rgba(26, 35, 126, 0.1)' },
                transition: 'all 0.2s',
              }}
            >
              <Avatar
                src={user?.profilePicture ? `${API_URL.replace('/api', '')}${user.profilePicture}` : null}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 220,
                overflow: 'visible',
                filter: 'drop-shadow(0px 10px 40px rgba(0,0,0,0.1))',
                borderRadius: 3,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate('/admin/profile');
                handleMenuClose();
              }}
              sx={{ py: 1.5, borderRadius: 1, mx: 1 }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText primary="Mi Perfil" primaryTypographyProps={{ fontWeight: 500 }} />
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, borderRadius: 1, mx: 1, color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontWeight: 500 }} />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              background: 'transparent',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0,0,0,0.05)',
              background: 'transparent',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 9 },
          minHeight: 'calc(100vh - 72px)',
        }}
      >
        <Outlet />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          top: chatbotOpen ? 80 : 'auto',
          right: chatbotOpen ? 24 : 'auto',
          bottom: chatbotOpen ? 'auto' : 32,
          zIndex: 1300,
          display: chatbotOpen ? 'block' : 'none',
        }}
      >
        <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      </Box>
    </Box>
  );
}

