# ✅ NUEVAS FUNCIONALIDADES IMPLEMENTADAS

## 📋 Resumen

Se han implementado dos funcionalidades principales:
1. **Upload de archivos en consultas online**
2. **Panel de administración para gestionar servicios (CRUD completo)**

---

## 1. 📎 UPLOAD DE ARCHIVOS EN CONSULTAS

### Backend

#### Modelos Creados:
- **`backend/models/Consultation.js`**: Modelo para guardar consultas con archivos adjuntos
- **`backend/models/Service.js`**: Modelo para servicios disponibles

#### Rutas Creadas:
- **`backend/routes/consultations.js`**: 
  - `POST /api/consultations` - Crear consulta con archivos (público)
  - `GET /api/consultations` - Listar consultas (admin/asesor)
  - `GET /api/consultations/:id` - Ver detalle de consulta
  - `PUT /api/consultations/:id` - Actualizar consulta
  - `GET /api/consultations/:id/files/:fileId` - Descargar archivo
  - `DELETE /api/consultations/:id` - Eliminar consulta

#### Características:
- ✅ Upload de hasta 5 archivos por consulta
- ✅ Tamaño máximo: 10MB por archivo
- ✅ Formatos permitidos: PDF, DOC, DOCX, JPG, PNG, GIF, XLS, XLSX, TXT
- ✅ Los archivos se guardan en `backend/uploads/consultations/`
- ✅ Validación automática de tipo y tamaño de archivo

### Frontend

#### Página Actualizada:
- **`frontend/src/pages/ConsultaOnline.js`**: Ahora incluye:
  - ✅ Carga dinámica de servicios desde la API
  - ✅ Botón para adjuntar archivos
  - ✅ Lista de archivos seleccionados con opción de eliminar
  - ✅ Envío de formulario con archivos vía FormData
  - ✅ Mensajes de éxito/error
  - ✅ Integración con Calendly después de enviar

---

## 2. 🛠️ PANEL DE ADMINISTRACIÓN DE SERVICIOS (CRUD)

### Backend

#### Rutas Creadas:
- **`backend/routes/services.js`**:
  - `GET /api/services` - Listar servicios activos (público)
  - `GET /api/services/all` - Listar todos los servicios (admin)
  - `GET /api/services/:id` - Ver detalle de servicio
  - `POST /api/services` - Crear servicio (admin)
  - `PUT /api/services/:id` - Actualizar servicio (admin)
  - `DELETE /api/services/:id` - Desactivar servicio (admin)
  - `DELETE /api/services/:id/permanent` - Eliminar permanentemente (admin)

#### Scripts:
- **`backend/scripts/seedServices.js`**: Poblar servicios iniciales

### Frontend

#### Página Nueva:
- **`frontend/src/pages/ServiceManagement.js`**: Panel completo con:
  - ✅ Tabla de servicios con información completa
  - ✅ Crear nuevos servicios
  - ✅ Editar servicios existentes
  - ✅ Activar/Desactivar servicios
  - ✅ Eliminar servicios
  - ✅ Control de orden de aparición
  - ✅ Solo accesible para administradores

#### Ruta Agregada:
- `/admin/services` - Gestión de servicios (admin only)

#### Navegación:
- Nuevo ítem en el menú lateral del admin: **"Servicios"**

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### Backend - Nuevos Archivos:
```
backend/
├── models/
│   ├── Consultation.js          [NUEVO]
│   └── Service.js                [NUEVO]
├── routes/
│   ├── consultations.js          [NUEVO]
│   └── services.js               [NUEVO]
└── scripts/
    └── seedServices.js           [NUEVO]
```

### Backend - Archivos Modificados:
```
backend/
└── server.js                     [MODIFICADO] - Agregadas rutas de servicios y consultas
```

### Frontend - Nuevos Archivos:
```
frontend/
└── src/
    └── pages/
        └── ServiceManagement.js  [NUEVO]
```

### Frontend - Archivos Modificados:
```
frontend/
└── src/
    ├── App.js                    [MODIFICADO] - Agregada ruta de servicios
    ├── components/
    │   └── Layout.js             [MODIFICADO] - Agregado menú de servicios
    └── pages/
        └── ConsultaOnline.js     [MODIFICADO] - Upload de archivos y carga dinámica
```

---

## 🚀 CÓMO USAR

### 1. Iniciar el Backend
```bash
cd backend
npm start
```

### 2. Poblar Servicios Iniciales (solo primera vez)
```bash
cd backend
node scripts/seedServices.js
```

### 3. Iniciar el Frontend
```bash
cd frontend
npm start
```

### 4. Acceder como Administrador
1. Ir a: `http://localhost:3000/admin/login`
2. Iniciar sesión con credenciales de admin
3. En el menú lateral, hacer clic en **"Servicios"**

### 5. Gestionar Servicios
- **Crear**: Click en "Nuevo Servicio"
- **Editar**: Click en el ícono de lápiz
- **Activar/Desactivar**: Click en el ícono de ojo
- **Eliminar**: Click en el ícono de basura

### 6. Probar Consultas con Archivos
1. Ir a: `http://localhost:3000/consulta-online`
2. Completar formulario
3. Click en "Seleccionar archivos"
4. Elegir hasta 5 archivos
5. Click en "Enviar y Agendar Cita"

---

## 📊 SERVICIOS INICIALES INCLUIDOS

1. **Laboral** - Despidos, contratos, indemnizaciones, incapacidades…
2. **Mercantil / Empresarial** - Contratos, constitución de empresas, cambios societarios…
3. **Familia** - Separaciones, herencias, custodias, pensiones de alimentos…
4. **Protección de datos** - Páginas web, servicios profesionales, venta electrónica
5. **Seguros / Contratos / Inmobiliario** - Redacción y revisión de contratos
6. **Extranjería** - Certificado UE, Visa nómada digital, permisos de residencia…

---

## 🔐 PERMISOS

### Rutas Públicas:
- `GET /api/services` - Ver servicios activos
- `POST /api/consultations` - Enviar consulta con archivos

### Rutas Admin/Asesor:
- `GET /api/consultations` - Ver todas las consultas
- `GET /api/consultations/:id` - Ver detalle de consulta
- `PUT /api/consultations/:id` - Actualizar consulta
- `GET /api/consultations/:id/files/:fileId` - Descargar archivo

### Rutas Solo Admin:
- Todos los endpoints de `/api/services/*` (excepto GET /api/services)
- `DELETE /api/consultations/:id` - Eliminar consulta

---

## 📝 NOTAS IMPORTANTES

1. **Archivos**: Los archivos subidos se guardan en `backend/uploads/consultations/`
2. **Base de datos**: Todo se guarda en la base de datos "Afyl" de MongoDB Atlas
3. **Servicios**: Los servicios se pueden activar/desactivar sin eliminarlos
4. **Orden**: El campo "orden" controla cómo aparecen los servicios (menor número = primero)
5. **Validación**: El backend valida automáticamente tipo y tamaño de archivos

---

## ✨ MEJORAS FUTURAS SUGERIDAS

1. **Consultas**:
   - Agregar vista para admins/asesores para ver todas las consultas
   - Sistema de notificaciones cuando llega una nueva consulta
   - Responder consultas directamente desde el panel
   - Exportar consultas a PDF

2. **Servicios**:
   - Agregar imágenes/iconos personalizados
   - Estadísticas de servicios más solicitados
   - Precios por servicio
   - Categorías de servicios

3. **Archivos**:
   - Vista previa de documentos
   - OCR para extraer texto de PDFs
   - Compresión automática de imágenes
   - Almacenamiento en la nube (AWS S3, Cloudinary)

---

**Fecha de implementación**: 18 de noviembre de 2025
**Desarrollado por**: GitHub Copilot
