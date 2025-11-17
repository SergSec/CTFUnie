# 📅 Guía Completa de Configuración de Calendly para AFYL

Esta guía te llevará paso a paso para configurar completamente la integración de Calendly en tu aplicación.

## 📋 Tabla de Contenidos
1. [Crear Cuenta de Calendly](#1-crear-cuenta-de-calendly)
2. [Configurar Evento de Calendly](#2-configurar-evento-de-calendly)
3. [Obtener y Configurar la URL](#3-obtener-y-configurar-la-url)
4. [Configurar Webhooks](#4-configurar-webhooks-opcional)
5. [Probar la Integración](#5-probar-la-integración)
6. [Personalización Avanzada](#6-personalización-avanzada)

---

## 1. Crear Cuenta de Calendly

### Paso 1.1: Registro
1. Ve a **https://calendly.com**
2. Haz clic en **"Sign Up"** (Registrarse)
3. Puedes usar:
   - ✅ **Email profesional** (recomendado): hola@afyl.legal
   - Google Account
   - Microsoft Account

### Paso 1.2: Completar Perfil
1. Nombre: `AFYL Legal`
2. URL personalizada: `afyl-legal` (quedará como: calendly.com/afyl-legal)
3. Zona horaria: `(GMT+01:00) Madrid, Barcelona`

### Paso 1.3: Conectar Calendario (Importante)
1. En el dashboard, ve a **"Integrations"** → **"Calendar Connection"**
2. Conecta tu calendario de Google/Outlook para evitar dobles reservas
3. Calendly sincronizará automáticamente tu disponibilidad

---

## 2. Configurar Evento de Calendly

### Paso 2.1: Crear Nuevo Evento
1. En el dashboard de Calendly, haz clic en **"+ New Event Type"**
2. Selecciona **"One-on-One"** (reunión 1 a 1)

### Paso 2.2: Configuración Básica
```
📝 Configuración Recomendada:

Nombre del evento: "Consulta Legal - Primera Evaluación"
Ubicación: Video Conference (Google Meet / Zoom / Microsoft Teams)
Duración: 30 minutos
Color: Azul (#1A237E - para coincidir con tu branding)
```

### Paso 2.3: Descripción del Evento
Copia y pega esto en la descripción:
```
Consulta legal personalizada con nuestro equipo de expertos de AFYL.

En esta sesión de 30 minutos:
✅ Evaluaremos tu caso específico
✅ Responderemos tus preguntas legales
✅ Te proporcionaremos una orientación inicial
✅ Discutiremos los próximos pasos

Por favor, ten preparada la siguiente información:
• Descripción breve de tu situación
• Documentos relevantes (si los tienes)
• Preguntas específicas que quieras resolver

¡Nos vemos pronto!
Equipo AFYL Legal
```

### Paso 2.4: Configurar Disponibilidad
1. Ve a la pestaña **"When can people book this event?"**
2. Configura tus horarios:
   ```
   Lunes a Viernes: 9:00 AM - 6:00 PM
   (Ajusta según tu horario real)
   ```
3. **Buffer Time** (tiempo de descanso):
   - Antes del evento: 5-10 minutos
   - Después del evento: 5-10 minutos
4. **Advance Notice**: Mínimo 2 horas (para prepararte)
5. **Date Range**: Hasta 60 días en el futuro

### Paso 2.5: Preguntas Personalizadas (MUY IMPORTANTE)
Estas preguntas se integran con tu aplicación:

1. Haz clic en **"Add Questions"** o **"Invitee Questions"**
2. Agrega estas preguntas personalizadas:

**Pregunta 1:**
```
Tipo: One Line Text
Pregunta: ¿Qué tipo de servicio necesitas?
Respuesta: Campo de texto
Requerido: Sí
Internal Label: a1
```

**Pregunta 2:**
```
Tipo: Multi-Line Text
Pregunta: Describe brevemente tu consulta
Respuesta: Área de texto
Requerido: Sí
Internal Label: consulta
```

⚠️ **Importante**: Los "Internal Labels" (a1 y consulta) son cruciales porque tu aplicación los busca para sincronizar los datos.

### Paso 2.6: Notificaciones y Recordatorios
1. Ve a **"Notifications and Cancellation Policy"**
2. Activa:
   - ✅ Email reminder 1 día antes
   - ✅ Email reminder 1 hora antes
   - ✅ SMS reminder (si tienes plan de pago)
3. Política de cancelación:
   ```
   Los clientes pueden cancelar o reprogramar hasta 4 horas antes de la cita.
   ```

### Paso 2.7: Confirmar y Publicar
1. Revisa toda la configuración
2. Haz clic en **"Save & Close"**
3. **Activa el evento** (toggle en verde)

---

## 3. Obtener y Configurar la URL

### Paso 3.1: Copiar URL del Evento
1. En tu dashboard de Calendly, verás tu evento creado
2. Haz clic en **"Copy Link"** junto al nombre del evento
3. La URL será algo como: `https://calendly.com/afyl-legal/consulta-legal-primera-evaluacion`

### Paso 3.2: Configurar en tu Aplicación

**Opción A: Usar archivo .env (✅ RECOMENDADO)**

1. El archivo `frontend/.env` ya está creado
2. Abre el archivo: `frontend/.env`
3. Reemplaza la URL con tu URL real:
   ```env
   REACT_APP_CALENDLY_URL=https://calendly.com/TU-USUARIO/TU-EVENTO
   ```
   Ejemplo:
   ```env
   REACT_APP_CALENDLY_URL=https://calendly.com/afyl-legal/consulta-legal-primera-evaluacion
   ```

4. **Guarda el archivo**

**Opción B: Editar directamente en el código** (no recomendado)
Si prefieres no usar .env:
1. Abre `frontend/src/pages/ConsultaOnline.js`
2. Busca la línea 96
3. Reemplaza la URL de ejemplo por tu URL real

### Paso 3.3: Reiniciar el Servidor Frontend
Después de modificar el .env:
```bash
cd frontend
npm start
```

---

## 4. Configurar Webhooks (Opcional pero Recomendado)

Los webhooks permiten que tu aplicación reciba notificaciones automáticas cuando alguien agenda, cancela o modifica una cita.

### Paso 4.1: Configurar Webhook en Calendly

⚠️ **Nota**: Los webhooks solo están disponibles en planes de pago de Calendly (Essentials, Professional, Teams)

1. Ve a **"Integrations"** en el menú de Calendly
2. Busca **"Webhooks"** o **"API & Webhooks"**
3. Haz clic en **"Add Webhook"**

### Paso 4.2: URL del Webhook

**Para desarrollo local:**
- Necesitas exponer tu servidor local a internet usando **ngrok** o **localtunnel**
- URL del webhook: `https://tu-dominio-ngrok.ngrok.io/api/calendly/webhook`

**Para producción:**
- URL del webhook: `https://tu-dominio.com/api/calendly/webhook`

### Paso 4.3: Eventos a Suscribir
Selecciona estos eventos:
- ✅ `invitee.created` - Cuando alguien agenda una cita
- ✅ `invitee.canceled` - Cuando se cancela una cita
- ✅ `invitee.updated` - Cuando se modifica una cita

### Paso 4.4: Verificación del Webhook
1. Calendly enviará un evento de prueba
2. Tu servidor debe responder con status 200
3. Verifica los logs de tu servidor backend para confirmar que recibe los eventos

### Paso 4.5: Configurar Signing Key (Seguridad)
1. Calendly te proporcionará un "Signing Key"
2. Agrégalo a tu `backend/.env`:
   ```env
   CALENDLY_SIGNING_KEY=tu_signing_key_aqui
   ```

---

## 5. Probar la Integración

### Paso 5.1: Verificar que todo está corriendo
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

### Paso 5.2: Prueba Completa
1. Abre tu navegador en `http://localhost:3000`
2. Ve a la página **"Consulta Online"**
3. Verifica que:
   - ✅ Los servicios se muestran correctamente
   - ✅ Puedes llenar el formulario
   - ✅ El widget de Calendly aparece al enviar el formulario
   - ✅ Puedes seleccionar una fecha y hora
   - ✅ Recibes email de confirmación

### Paso 5.3: Hacer una Reserva de Prueba
1. Completa el formulario con datos de prueba
2. Selecciona un horario disponible
3. Confirma la cita
4. Verifica:
   - ✅ Email de confirmación recibido
   - ✅ La cita aparece en tu calendario
   - ✅ (Si configuraste webhooks) La cita aparece en tu dashboard de la aplicación

### Paso 5.4: Verificar en la Base de Datos
Si configuraste webhooks, verifica que se creó la cita:
```bash
cd backend
node scripts/checkDatabase.js
```

---

## 6. Personalización Avanzada

### 6.1: Personalizar Colores del Widget
En `ConsultaOnline.js`, puedes personalizar el widget:
```javascript
const buildCalendlyUrl = () => {
  const params = new URLSearchParams();
  // ... código existente ...
  params.set('primary_color', '1a237e'); // Color principal (azul de AFYL)
  params.set('background_color', 'ffffff'); // Fondo blanco
  params.set('text_color', '333333'); // Texto oscuro
  return `${calendlyUrl}?${params.toString()}`;
};
```

### 6.2: Prefill Automático de Datos
El código ya incluye prefill automático:
- Nombre del usuario
- Email del usuario
- Servicio seleccionado

### 6.3: Campos Personalizados Adicionales
Si necesitas más campos, agrégalos en Calendly y luego en tu formulario:
```javascript
params.set('a2', 'valor_adicional'); // a2, a3, a4, etc.
```

### 6.4: Múltiples Tipos de Eventos
Si quieres diferentes duraciones según el servicio:
1. Crea múltiples eventos en Calendly:
   - Consulta Express (15 min)
   - Consulta Standard (30 min)
   - Consulta Extendida (60 min)
2. Modifica el código para seleccionar la URL según el servicio

### 6.5: Idioma del Widget
Para cambiar el idioma a español:
```javascript
params.set('locale', 'es'); // Español
```

---

## 🔧 Troubleshooting (Solución de Problemas)

### Problema 1: El widget no se muestra
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores relacionados con Calendly
3. Verifica que la URL sea correcta y el evento esté activo
4. Asegúrate de que el script de Calendly se cargó: `window.Calendly`

### Problema 2: "This Calendly URL is not valid"
**Solución:**
1. Verifica que tu evento esté **activo** en Calendly
2. Verifica que la URL sea exactamente la que copiaste
3. No incluyas parámetros adicionales al copiar la URL base

### Problema 3: Los webhooks no funcionan
**Solución:**
1. Verifica que tienes un plan de pago de Calendly
2. Para desarrollo local, usa ngrok: `ngrok http 5000`
3. Verifica que tu servidor responda con status 200
4. Revisa los logs del servidor backend

### Problema 4: Las citas no aparecen en la aplicación
**Solución:**
1. Verifica que los webhooks estén configurados
2. Revisa los logs del backend para ver si llegan los eventos
3. Verifica la conexión a MongoDB
4. Asegúrate de que los usuarios y asesores existan en la base de datos

### Problema 5: Error de CORS
**Solución:**
- Calendly maneja CORS automáticamente, pero si tienes problemas, verifica que tu backend tenga CORS habilitado (ya está configurado)

---

## 📊 Plan de Calendly: Gratis vs Pago

### Plan Gratuito (Suficiente para empezar)
- ✅ 1 tipo de evento activo
- ✅ Reservas ilimitadas
- ✅ Integración con Google Calendar
- ✅ Notificaciones por email
- ❌ Sin webhooks
- ❌ Sin personalización de marca

### Plan Essentials ($10/mes)
- ✅ Eventos ilimitados
- ✅ Webhooks
- ✅ Recordatorios SMS
- ✅ Personalización de marca
- ✅ Campos personalizados ilimitados

**Recomendación:** Empieza con el plan gratuito para probar, luego actualiza si necesitas webhooks.

---

## 🎯 Resumen de Pasos Rápidos

```bash
# 1. Crear cuenta en Calendly (https://calendly.com)
# 2. Crear evento "Consulta Legal - 30 min"
# 3. Copiar la URL del evento
# 4. Configurar .env

cd frontend
echo REACT_APP_CALENDLY_URL=https://calendly.com/TU-USUARIO/TU-EVENTO > .env

# 5. Reiniciar servidores
cd backend
npm start

cd frontend
npm start

# 6. Probar en http://localhost:3000/consulta-online
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor backend
3. Verifica que la URL de Calendly sea correcta
4. Consulta la documentación oficial: https://help.calendly.com

---

## ✅ Checklist Final

Antes de lanzar a producción:
- [ ] Cuenta de Calendly creada
- [ ] Evento configurado y activo
- [ ] URL configurada en .env
- [ ] Horarios de disponibilidad configurados
- [ ] Preguntas personalizadas agregadas (a1, consulta)
- [ ] Calendario conectado (Google/Outlook)
- [ ] Notificaciones de email activadas
- [ ] Prueba completa realizada
- [ ] Webhooks configurados (si tienes plan de pago)
- [ ] Variables de entorno en producción configuradas

---

¡Listo! Tu integración de Calendly debería estar funcionando perfectamente. 🎉
