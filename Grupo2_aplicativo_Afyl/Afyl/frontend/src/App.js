import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './components/PublicLayout';
import Layout from './components/Layout';
import ClientLayout from './components/ClientLayout';
import Home from './pages/Home';
import ConsultaOnline from './pages/ConsultaOnline';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Appointments from './pages/Appointments';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import AdvisorManagement from './pages/AdvisorManagement';
import ServiceManagement from './pages/ServiceManagement';
import ClientDashboard from './pages/cliente/ClientDashboard';
import ClientCases from './pages/cliente/ClientCases';
import ClientAppointments from './pages/cliente/ClientAppointments';
import ClientForum from './pages/cliente/ClientForum';
import ClientPayments from './pages/cliente/ClientPayments';
import ClientMessages from './pages/cliente/ClientMessages';
import ClientProfile from './pages/cliente/ClientProfile';
import legalTheme from './theme/legalTheme';

function App() {
  return (
    <ThemeProvider theme={legalTheme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="consulta-online" element={<ConsultaOnline />} />
            <Route path="contacto" element={<Contacto />} />
          </Route>

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<Login />} />
          
          {/* Rutas privadas del portal de clientes */}
          <Route
            path="/cliente"
            element={
              <PrivateRoute allowedRoles={['cliente']}>
                <ClientLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/cliente/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="casos"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientCases />
                </PrivateRoute>
              }
            />
            <Route
              path="citas"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientAppointments />
                </PrivateRoute>
              }
            />
            <Route
              path="foro"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientForum />
                </PrivateRoute>
              }
            />
            <Route
              path="pagos"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientPayments />
                </PrivateRoute>
              }
            />
            <Route
              path="mensajes"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientMessages />
                </PrivateRoute>
              }
            />
            <Route
              path="perfil"
              element={
                <PrivateRoute allowedRoles={['cliente']}>
                  <ClientProfile />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Rutas privadas del panel de administrador */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin', 'asesor']}>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <PrivateRoute allowedRoles={['admin', 'asesor']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="cases"
              element={
                <PrivateRoute allowedRoles={['admin', 'asesor']}>
                  <Cases />
                </PrivateRoute>
              }
            />
            <Route
              path="cases/:id"
              element={
                <PrivateRoute allowedRoles={['admin', 'asesor']}>
                  <CaseDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="advisors"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdvisorManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="services"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <ServiceManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="appointments"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="payments"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Payments />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute allowedRoles={['admin', 'asesor']}>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Redirect any unknown route to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

