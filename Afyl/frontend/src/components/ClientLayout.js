import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as CaseIcon,
  CalendarToday as AppointmentIcon,
  Forum as ForumIcon,
  Payment as PaymentIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
  Gavel as GavelIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export default function ClientLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/cliente/dashboard' },
    { text: 'Mis Casos', icon: <CaseIcon />, path: '/cliente/casos' },
    { text: 'Citas', icon: <AppointmentIcon />, path: '/cliente/citas' },
    { text: 'Foro', icon: <ForumIcon />, path: '/cliente/foro' },
    { text: 'Pagos', icon: <PaymentIcon />, path: '/cliente/pagos' },
    { text: 'Mensajes', icon: <ChatIcon />, path: '/cliente/mensajes' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}>
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
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
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase', mt: 1 }}>
          Portal de Cliente
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1, pt: 3, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: '12px',
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(26, 35, 126, 0.05)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.05)', background: 'rgba(255,255,255,0.5)' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 Afyl Legal
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 70 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'primary.main' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Bienvenido, {user?.name?.split(' ')[0]}
          </Typography>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0.5,
              border: '2px solid transparent',
              '&:hover': { borderColor: 'rgba(26, 35, 126, 0.1)' },
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                width: 40,
                height: 40,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontWeight: 700
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1.5,
                minWidth: 200,
                filter: 'drop-shadow(0px 10px 40px rgba(0,0,0,0.1))',
                borderRadius: 3,
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/cliente/perfil'); }} sx={{ py: 1.5, borderRadius: 1, mx: 1 }}>
              <PersonIcon sx={{ mr: 1.5, color: 'primary.main' }} /> Mi Perfil
            </MenuItem>
            <Divider sx={{ my: 1 }} />
            <MenuItem onClick={handleLogout} sx={{ py: 1.5, borderRadius: 1, mx: 1, color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Cerrar Sesión
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
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid rgba(0,0,0,0.05)', background: 'transparent' },
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
          minHeight: '100vh',
          mt: { xs: 8, sm: 9 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
