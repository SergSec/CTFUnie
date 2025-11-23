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
    // Redirect to appropriate login based on user role
    if (user?.role === 'admin') {
      navigate('/admin/login');
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        {/* Logo removed from admin layout per request */}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path || 
            (item.path === '/admin/cases' && location.pathname.startsWith('/admin/cases'));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 2 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => {
                  // Ensure we navigate using an absolute path to avoid nested route resolution issues
                  const target = item.path && item.path.startsWith('/') ? item.path : `/${item.path}`;
                  // Debugging: log navigation target and current user role to help diagnose routing issues
                  try {
                    // eslint-disable-next-line no-console
                    console.log('Admin menu navigate ->', { target, role: user?.role });
                  } catch (e) {}
                  // Special-case: if this is the Recargas item, force the admin path
                  if (item.path === '/admin/wallets' || item.text === 'Recargas') {
                    // Force a full page navigation to avoid client-side redirect issues
                    // This ensures the router renders the admin wallets page reliably
                    window.location.assign('/admin/wallets');
                    return;
                  }
                  navigate(target);
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.1) 0%, rgba(40, 53, 147, 0.1) 100%)',
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.15) 0%, rgba(40, 53, 147, 0.15) 100%)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(26, 35, 126, 0.05)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
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
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: 'rgba(26, 35, 126, 0.02)',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            src={user?.profilePicture ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}` : null}
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Plataforma de Asesoría Legal-Financiera
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
            <Tooltip title="Asistente Virtual">
              <IconButton
                onClick={() => setChatbotOpen(!chatbotOpen)}
                size="small"
                sx={{
                  color: chatbotOpen ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    background: 'rgba(26, 35, 126, 0.08)',
                  },
                }}
              >
                <SmartToyIcon />
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                '&:hover': {
                  background: 'rgba(26, 35, 126, 0.08)',
                },
              }}
            >
              <Avatar
                src={user?.profilePicture ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profilePicture}` : null}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  border: '2px solid',
                  borderColor: 'background.paper',
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
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: '0px 4px 20px rgba(26, 35, 126, 0.15)',
                borderRadius: 2,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate('/admin/profile');
                handleMenuClose();
              }}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Mi Perfil" />
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
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
              borderRight: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
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
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
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
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
      <Box
        sx={{
          position: 'fixed',
          top: chatbotOpen ? 64 : 'auto',
          right: chatbotOpen ? 16 : 'auto',
          bottom: chatbotOpen ? 'auto' : 24,
          zIndex: 1300,
          display: chatbotOpen ? 'block' : 'none',
        }}
      >
        <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      </Box>
    </Box>
  );
}

