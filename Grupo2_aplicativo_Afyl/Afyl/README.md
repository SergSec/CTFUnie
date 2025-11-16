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
├── backend/
│   ├── models/          # Modelos de MongoDB
│   ├── routes/          # Rutas de la API
│   ├── middleware/      # Middleware (auth, etc.)
│   ├── uploads/         # Archivos subidos
│   └── server.js        # Servidor principal
├── frontend/
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── contexts/    # Contextos (Auth, etc.)
│   │   └── services/    # Servicios API
│   └── public/
└── package.json
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

### Calendly
1. Obtener API key de Calendly
2. Configurar webhook para eventos
3. Actualizar variables en `.env`

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

