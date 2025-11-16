import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicLayout from './components/PublicLayout';
import Layout from './components/Layout';
import Home from './pages/Home';
import ConsultaOnline from './pages/ConsultaOnline';
import Contacto from './pages/Contacto';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Appointments from './pages/Appointments';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import AdvisorManagement from './pages/AdvisorManagement';
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

          {/* Rutas de autenticación del admin */}
          <Route path="/admin/login" element={<Login />} />
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

