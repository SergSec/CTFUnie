# 🔄 FLUJO COMPLETO: SISTEMA DE CONSULTAS CON CUENTAS TEMPORALES

## 📋 Descripción General

Sistema completo que gestiona el flujo desde que un cliente hace una consulta online hasta que agenda una cita, incluyendo:
- Creación automática de caso y usuario temporal
- Revisión por asesores (aceptar/rechazar)
- Gestión de credenciales temporales
- Limpieza automática de usuarios

---

## 🔄 FLUJO COMPLETO

### 1️⃣ CLIENTE ENVÍA CONSULTA ONLINE

**Ruta**: `/consulta-online`

**Proceso**:
1. Cliente completa formulario con:
   - Nombre, email, teléfono
   - Servicio solicitado
   - Descripción del caso
   - Archivos adjuntos (opcional, hasta 5 archivos, 10MB c/u)

2. **Sistema crea automáticamente**:
   - ✅ Usuario temporal con contraseña aleatoria
   - ✅ Caso vinculado al usuario
   - ✅ Consulta con archivos adjuntos

3. **Cliente recibe**:
   - Email temporal: `cliente@email.com`
   - Contraseña temporal: `abc123def` (ejemplo)
   - Fecha de expiración: 10 días desde la solicitud

**Estado inicial**:
- Usuario: `isTemporary: true`, `expiresAt: +10 días`
- Caso: `status: 'pendiente_revision'`
- Consulta: `status: 'pendiente'`

---

### 2️⃣ ASESOR REVISA EL CASO

**Ruta**: `/admin/cases/review`

**Proceso**:
1. Asesor/Admin accede al panel de revisión
2. Ve lista de casos pendientes con:
   - Información del cliente
   - Descripción del caso
   - Archivos adjuntos
   - Fecha de solicitud

3. **Opciones**:

#### ✅ ACEPTAR CASO:
- Debe introducir **precio estimado** del servicio
- Sistema actualiza:
  - Caso: `status: 'aceptado'`, `estimatedCost: €precio`
  - Usuario: `isTemporary: false` (**cuenta permanente**)
  - Consulta: `status: 'aceptada'`

#### ❌ RECHAZAR CASO:
- Debe proporcionar **motivo de rechazo**
- Sistema actualiza:
  - Caso: `status: 'rechazado'`, `rejectionReason: motivo`
  - Usuario: `isActive: false`, `deleteAt: +48 horas`
  - Consulta: `status: 'rechazada'`

---

### 3️⃣ CLIENTE ACCEDE AL PANEL

**Ruta**: `/admin/login` → `/cliente/dashboard`

**Credenciales**: Email + Contraseña temporal recibida

#### 🟢 SI CASO FUE ACEPTADO:
```
✅ ¡Caso Aceptado!
Tu caso ha sido aceptado. Precio estimado: €XXX

[Botón: Agendar Cita Ahora]

- Panel de citas: DESBLOQUEADO
- Panel de mensajes: DESBLOQUEADO
- Cuenta: PERMANENTE
```

#### 🟡 SI CASO AÚN ESTÁ EN REVISIÓN:
```
⏳ Caso en Revisión
Tu caso está siendo revisado por nuestros asesores.
Te notificaremos cuando tengamos una respuesta.

Cuenta válida hasta: [fecha]
Contraseña temporal: [password]

- Panel de citas: BLOQUEADO
- Panel de mensajes: BLOQUEADO
```

#### 🔴 SI CASO FUE RECHAZADO:
```
❌ Caso Rechazado
Lo sentimos, no podemos atender tu caso en este momento.
Razón: [motivo]

Tu cuenta será eliminada el: [fecha +48h]

- Panel de citas: BLOQUEADO
- Panel de mensajes: BLOQUEADO
- Cuenta: SE ELIMINARÁ EN 48H
```

---

### 4️⃣ AGENDAR CITA (Solo si caso aceptado)

**Ruta**: `/cliente/citas`

**Proceso**:
1. Cliente accede al panel de citas
2. Integración con Calendly
3. Selecciona fecha/hora disponible
4. Recibe confirmación por email

---

### 5️⃣ LIMPIEZA AUTOMÁTICA

**Script**: `cleanTemporaryUsers.js`

**Ejecutar**:
```bash
node scripts/cleanTemporaryUsers.js
```

**Acciones**:
1. Elimina usuarios temporales expirados (>10 días sin revisión)
2. Elimina usuarios rechazados (>48h después del rechazo)

**Recomendación**: Configurar como cron job:
```bash
# Ejecutar cada día a las 3 AM
0 3 * * * cd /ruta/backend && node scripts/cleanTemporaryUsers.js
```

---

## 📦 ARCHIVOS NUEVOS/MODIFICADOS

### Backend:

#### Modelos Modificados:
- `models/User.js`: Añadidos campos temporales
  - `isTemporary`, `temporaryPassword`, `expiresAt`, `deleteAt`, `caseId`

- `models/Case.js`: Añadidos estados y campos
  - Estados: `pendiente_revision`, `aceptado`, `rechazado`
  - Campos: `reviewedAt`, `rejectionReason`, `serviceType`, `consultationId`

- `models/Consultation.js`: Añadidos vínculos
  - `caseId`, `temporaryUserId`, `status: 'aceptada'/'rechazada'`

#### Rutas Modificadas:
- `routes/consultations.js`: Crear caso y usuario automáticamente
- `routes/cases.js`: Nuevas rutas:
  - `GET /api/cases/pending-review` - Listar casos pendientes
  - `PUT /api/cases/:id/review` - Aceptar/rechazar caso

#### Scripts Nuevos:
- `scripts/cleanTemporaryUsers.js` - Limpiar usuarios temporales

### Frontend:

#### Páginas Nuevas:
- `pages/CaseReview.js` - Panel de revisión para asesores
- `pages/cliente/ClientDashboard.js` - Actualizado con estados de caso

#### Páginas Modificadas:
- `pages/ConsultaOnline.js` - Mostrar credenciales temporales
- `App.js` - Nueva ruta `/admin/cases/review`
- `components/Layout.js` - Nuevo menú "Revisar Casos"

---

## 🔐 PERMISOS

### Rutas Públicas:
- `POST /api/consultations` - Enviar consulta (crear usuario y caso)

### Rutas Admin/Asesor:
- `GET /api/cases/pending-review` - Ver casos pendientes
- `PUT /api/cases/:id/review` - Aceptar/rechazar caso

### Rutas Cliente:
- `GET /api/cases/:id` - Ver su propio caso
- Panel de citas - Solo si caso aceptado
- Panel de mensajes - Solo si caso aceptado

---

## ⚙️ CONFIGURACIÓN

### 1. Instalar Dependencias:
```bash
cd backend
npm install
```

### 2. Variables de Entorno:
Ya configuradas en `backend/.env`:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
```

### 3. Ejecutar Backend:
```bash
cd backend
npm start
```

### 4. Ejecutar Frontend:
```bash
cd frontend
npm start
```

---

## 🎯 CASOS DE USO

### Ejemplo 1: Cliente nuevo - Caso Aceptado
1. Cliente envía consulta → Recibe: email@example.com / pass123
2. Asesor revisa → Acepta con precio €500
3. Cliente inicia sesión → Ve botón "Agendar Cita"
4. Cliente agenda cita → Recibe confirmación
5. Cuenta ahora es PERMANENTE

### Ejemplo 2: Cliente nuevo - Caso Rechazado
1. Cliente envía consulta → Recibe: email@example.com / pass123
2. Asesor revisa → Rechaza (fuera de especialidad)
3. Cliente inicia sesión → Ve mensaje de rechazo
4. Después de 48h → Usuario eliminado automáticamente

### Ejemplo 3: Cliente nuevo - Sin revisión
1. Cliente envía consulta → Recibe credenciales
2. Pasan 10 días sin revisión
3. Script de limpieza → Usuario eliminado automáticamente

---

## 📊 ESTADÍSTICAS

Ver usuarios temporales activos:
```bash
node scripts/cleanTemporaryUsers.js
```

Salida:
```
📊 Estadísticas actuales:
   - Usuarios temporales activos: 5
   - Usuarios pendientes de eliminación: 2
```

---

## 🔄 MANTENIMIENTO

### Limpieza Manual:
```bash
cd backend
node scripts/cleanTemporaryUsers.js
```

### Limpieza Automática (Cron):
```bash
# Linux/Mac - Editar crontab
crontab -e

# Agregar línea:
0 3 * * * cd /ruta/backend && node scripts/cleanTemporaryUsers.js

# Windows - Task Scheduler
schtasks /create /tn "Cleanup Temp Users" /tr "node C:\ruta\backend\scripts\cleanTemporaryUsers.js" /sc daily /st 03:00
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Seguridad**:
   - Las contraseñas temporales se generan aleatoriamente
   - Se hashean antes de guardar en BD
   - No se envían por email en producción (implementar servicio de email)

2. **Notificaciones**:
   - Implementar envío de emails con credenciales
   - Notificar cuando caso es aceptado/rechazado
   - Recordatorio antes de expiración (opcional)

3. **Limpieza**:
   - Configurar cron job para ejecutar script diariamente
   - Revisar logs de limpieza periódicamente

4. **Escalabilidad**:
   - Considerar archiving en lugar de eliminación permanente
   - Implementar soft-delete para auditoría

---

## 📝 MEJORAS FUTURAS

1. **Notificaciones por Email**:
   - Enviar credenciales por email
   - Notificar aceptación/rechazo
   - Recordatorios de expiración

2. **Dashboard de Asesores**:
   - Estadísticas de casos revisados
   - Tiempo promedio de respuesta
   - Tasa de aceptación/rechazo

3. **Cliente**:
   - Historial de consultas
   - Exportar caso a PDF
   - Chat en tiempo real con asesor

4. **Sistema**:
   - Audit log de cambios
   - Backup de usuarios eliminados
   - Recuperación de cuentas

---

**Fecha de implementación**: 18 de noviembre de 2025
**Desarrollado por**: GitHub Copilot
