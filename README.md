# Afyl - Plataforma de Asesoría Legal-Financiera

Plataforma web interactiva que funciona como foro y canal de comunicación entre clientes y la asesoría legal-financiera.

## Características

- **Gestión de Usuarios**: Registro e inicio de sesión con roles (cliente, asesor, admin)
- **Gestión de Casos**: Creación, seguimiento y gestión de casos legales y financieros
- **Documentos**: Subida, visualización y descarga de documentos
- **Citas**: Sistema de agenda y reservas de citas con integración de videollamadas
- **Pagos**: Gestión de pagos y facturación
- **Mensajería**: Sistema de chat/foro para comunicación entre clientes y asesores
- **Auditoría**: Sistema de logs y trazabilidad de acciones

## Tecnologías

### Backend
- Node.js con Express
- MongoDB con Mongoose
- JWT para autenticación
- Multer para subida de archivos

### Frontend
- React.js
- Material-UI
- React Router
- React Query

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm o yarn

### Pasos

1. Clonar el repositorio

2. Instalar dependencias:
```bash
npm run install-all
```

3. Configurar variables de entorno:
   - Copiar `backend/.env.example` a `backend/.env`
   - Configurar las variables necesarias (MongoDB URI, JWT_SECRET, etc.)

4. Iniciar MongoDB (si es local)

5. Iniciar la aplicación:
```bash
# Desarrollo (inicia frontend y backend)
npm run dev

# O por separado:
npm run server  # Backend en puerto 5000
npm run client  # Frontend en puerto 3000
```

## Estructura del Proyecto

```
Afyl/
├── .gitignore
├── CAMBIOS_LOGO_ELIMINACION.md
├── LICENSE
├── NUEVAS_FUNCIONALIDADES.md
├── package.json
├── README.md
├── SEGURIDAD_AUTENTICACION.md
├── backend/                              # API del servidor: modelos, rutas y utilidades
│   ├── .env                              # Variables de entorno (no subir a repositorio)
│   ├── .env.example                       # Ejemplo de variables de entorno
│   ├── package.json                       # Dependencias y scripts del backend
│   ├── server.js                          # Punto de entrada del servidor Express
│   ├── update-env-password.js             # Utilidad para actualizar contraseñas en env
│   ├── middleware/                        # Middlewares (autenticación, etc.)
│   │   └── auth.js                        # Middleware de autenticación JWT
│   ├── models/                            # Modelos Mongoose (esquemas de datos)
│   │   ├── Appointment.js                 # Modelo de citas
│   │   ├── AuditLog.js                    # Modelo de auditoría
│   │   ├── Case.js                        # Modelo de caso
│   │   ├── Consultation.js                # Modelo de consulta
│   │   ├── Document.js                    # Modelo de documentos
│   │   ├── Message.js                     # Modelo de mensajes/chat
│   │   ├── Payment.js                     # Modelo de pagos
│   │   ├── Service.js                     # Modelo de servicios ofertados
│   │   ├── User.js                        # Modelo de usuario
│   │   └── Wallet.js                      # Modelo de wallets/pagos internos
│   ├── routes/                            # Rutas/handlers de la API
│   │   ├── appointments.js                # Endpoints de citas
│   │   ├── auth.js                        # Endpoints de autenticación
│   │   ├── calendly.js                    # Integración con Calendly
│   │   ├── cases.js                       # Endpoints de casos
│   │   ├── chatbot.js                     # Endpoints para chatbot/IA
│   │   ├── consultations.js               # Endpoints de consultas
│   │   ├── dev.js                         # Rutas de desarrollo/diagnóstico
│   │   ├── documents.js                   # Subida/descarga de documentos
│   │   ├── messages.js                    # Endpoints de mensajería
│   │   ├── payments.js                    # Endpoints de pagos
│   │   ├── services.js                    # Gestión de servicios
│   │   ├── users.js                       # Gestión de usuarios
│   │   └── wallet.js                      # Gestión de wallets
│   ├── scripts/                           # Scripts y herramientas de mantenimiento
│   │   ├── checkCalendly.js               # Verifica la integración Calendly
│   │   ├── checkDatabase.js               # Comprueba conexión a BD
│   │   ├── checkUser.js                   # Comprueba existencia de usuario
│   │   ├── cleanTemporaryUsers.js         # Limpieza de usuarios temporales
│   │   ├── fixAllPasswords.js             # Herramientas para corrección de contraseñas
│   │   ├── fixPassword.js                 # Script para reset de password
│   │   ├── listAdmins.js                  # Lista administradores
│   │   ├── listAllAdmins.js               # Lista todos los admins
│   │   ├── resetAdminPassword.js          # Reset de password de admin
│   │   ├── seedServices.js                # Seeder de servicios de ejemplo
│   │   ├── seedUsers.js                   # Seeder de usuarios de prueba
│   │   ├── testLogin.js                   # Script de prueba de login
│   │   ├── testQuery.js                   # Script de pruebas de consultas
│   │   └── verifyConnection.js            # Verifica conexión a servicios
│   ├── tests/                             # Tests unitarios / integración del backend
│   │   ├── consultations.test.js
│   │   └── setupTestApp.js
│   └── utils/                             # Utilidades compartidas del backend
│       ├── caseLogger.js                  # Logger de acciones sobre casos
│       ├── email.js                       # Envío de correos
│       └── wallet.js                      # Utilidades de wallet
├── frontend/                              # Aplicación cliente React
│   ├── .env                               # Variables de entorno del frontend
│   ├── .env.example                       # Ejemplo de env del frontend
│   ├── .gitignore                         # Ignorar build / node_modules del frontend
│   ├── package.json                       # Dependencias y scripts del frontend
│   ├── public/                            # Archivos públicos (index.html, favicon)
│   │   └── index.html
│   └── src/                               # Código fuente React
│       ├── App.js                         # Componente raíz de la aplicación
│       ├── index.css                       # Estilos globales
│       ├── index.js                        # Entrada principal React
│       ├── components/                    # Componentes reutilizables de UI
│       │   ├── Chatbot.js                 # Componente de conversación / asistente
│       │   ├── ClientLayout.js            # Layout específico para vistas de cliente
│       │   ├── Layout.js                  # Layout global (header, footer, navegación)
│       │   ├── PrivateRoute.js            # Componente que protege rutas (auth)
│       │   └── PublicLayout.js            # Layout para páginas públicas (login/registro)
│       ├── contexts/                      # Contextos (Auth, Theme, etc.)
│       │   └── AuthContext.js             # Contexto de autenticación y estado de usuario
│       ├── pages/                         # Vistas/páginas de la aplicación
│       │   ├── AdminLogin.js              # Login para administradores
│       │   ├── AdminWallets.js            # Gestión de wallets desde panel admin
│       │   ├── AdvisorManagement.js       # Gestión de asesores y sus permisos
│       │   ├── AppointmentRequests.js     # Solicitudes de cita pendientes
│       │   ├── Appointments.js            # Listado y gestión de citas
│       │   ├── AsesorLogin.js             # Login para asesores
│       │   ├── CaseDetail.js              # Vista detalle de un caso
│       │   ├── CaseReview.js              # Revisión y validación de casos
│       │   ├── Cases.js                   # Listado y creación de casos
│       │   ├── ConsultaOnline.js          # Módulo para consultas online / videollamada
│       │   ├── Contacto.js                # Página de contacto y formulario
│       │   ├── Dashboard.js               # Panel de control con métricas resumidas
│       │   ├── Forum.js                   # Foro de discusión y hilos
│       │   ├── Home.js                    # Página principal / landing
│       │   ├── Login.js                   # Login público de usuarios
│       │   ├── Messages.js                # Conversaciones y mensajes por caso
│       │   ├── Payments.js                # Gestión y visualización de pagos
│       │   ├── Profile.js                 # Perfil de usuario y edición de datos
│       │   ├── Register.js                # Registro de nuevos usuarios
│       │   ├── ServiceManagement.js       # CRUD de servicios ofrecidos
│       │   └── cliente/                    # Páginas específicas para clientes
│       │       ├── CaseDetail.js          # Detalle de caso (vista cliente)
│       │       ├── ClientAppointments.js  # Citas del cliente
│       │       ├── ClientCases.js         # Casos del cliente
│       │       ├── ClientDashboard_NEW.js # Versión nueva del dashboard cliente
│       │       ├── ClientDashboard.js     # Dashboard principal del cliente
│       │       ├── ClientForum.js         # Foro orientado a clientes
│       │       ├── ClientMessages.js      # Mensajería privada del cliente
│       │       ├── ClientPayments.js      # Historial y gestión de pagos del cliente
│       │       └── ClientProfile.js       # Perfil y datos personales del cliente
│       ├── services/                      # Lógica para llamadas a la API
│       │   └── api.js
│       └── theme/                         # Variables / tema de la app
│           └── legalTheme.js
└── README.md                              # Este archivo
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual

### Casos
- `GET /api/cases` - Listar casos
- `POST /api/cases` - Crear caso
- `GET /api/cases/:id` - Obtener caso
- `PUT /api/cases/:id` - Actualizar caso
- `DELETE /api/cases/:id` - Eliminar caso

### Documentos
- `POST /api/documents` - Subir documento
- `GET /api/documents/case/:caseId` - Listar documentos de un caso
- `GET /api/documents/:id/download` - Descargar documento
- `DELETE /api/documents/:id` - Eliminar documento

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

### Pagos
- `GET /api/payments` - Listar pagos
- `POST /api/payments` - Crear pago
- `POST /api/payments/:id/process` - Procesar pago

### Mensajes
- `GET /api/messages/case/:caseId` - Obtener mensajes de un caso
- `POST /api/messages` - Enviar mensaje
- `PUT /api/messages/:id/read` - Marcar como leído

## Configuración de Servicios Externos

### 📅 Calendly (Agenda de Citas)

La integración con Calendly permite que los clientes agenden citas directamente desde la aplicación.

#### Configuración Rápida (5 minutos)
Ver guía: **[INICIO_RAPIDO_CALENDLY.md](INICIO_RAPIDO_CALENDLY.md)**

#### Configuración Completa
Ver guía detallada: **[GUIA_COMPLETA_CALENDLY.md](GUIA_COMPLETA_CALENDLY.md)**

#### Verificar Configuración
```bash
cd backend
node scripts/checkCalendly.js
```

#### Pasos Básicos:
1. Crear cuenta en [Calendly](https://calendly.com)
2. Crear un evento (ej: "Consulta Legal - 30 min")
3. Copiar la URL del evento
4. Configurar en `frontend/.env`:
   ```env
   REACT_APP_CALENDLY_URL=https://calendly.com/tu-usuario/tu-evento
   ```
5. Reiniciar el frontend

**Nota**: Los webhooks son opcionales y requieren plan de pago de Calendly.

### Microsoft Teams
1. Registrar aplicación en Azure AD
2. Obtener Client ID y Secret
3. Configurar permisos para Teams API
4. Actualizar variables en `.env`

### Pasarela de Pago
1. Configurar con tu proveedor de pagos
2. Actualizar variables en `.env`
3. Implementar lógica de procesamiento en `routes/payments.js`

## Cumplimiento RGPD

El sistema incluye:
- Sistema de auditoría y logs
- Gestión de datos personales
- Procesos de retención/borrado de datos
- Control de acceso basado en roles

## Licencia

Este proyecto es propiedad de Afyl.

