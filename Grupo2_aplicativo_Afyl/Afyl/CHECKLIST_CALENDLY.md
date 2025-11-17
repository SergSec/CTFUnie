# 📋 Checklist de Configuración de Calendly

Usa este checklist para asegurarte de que todo está configurado correctamente.

## ✅ Configuración Inicial

- [ ] **Cuenta de Calendly creada**
  - Email: _________________
  - URL de perfil: calendly.com/_________________

## ✅ Configuración del Evento

- [ ] **Evento creado en Calendly**
  - Nombre del evento: _________________
  - Duración: _______ minutos
  - Tipo de reunión: ☐ Google Meet  ☐ Zoom  ☐ Microsoft Teams  ☐ Otro: _______

- [ ] **Disponibilidad configurada**
  - Horarios establecidos: Lun-Vie ___:___ - ___:___
  - Buffer time: _____ minutos
  - Advance notice: _____ horas

- [ ] **Preguntas personalizadas agregadas**
  - [ ] Pregunta sobre tipo de servicio (internal label: `a1`)
  - [ ] Pregunta sobre descripción de consulta (internal label: `consulta`)

- [ ] **Notificaciones configuradas**
  - [ ] Recordatorio 1 día antes
  - [ ] Recordatorio 1 hora antes

- [ ] **Evento publicado y activo**

## ✅ Configuración en la Aplicación

- [ ] **Archivo .env creado en frontend/**
  ```
  frontend/.env existe
  ```

- [ ] **URL de Calendly configurada**
  ```
  REACT_APP_CALENDLY_URL=https://calendly.com/_____/_____
  ```

- [ ] **Dependencias instaladas**
  ```bash
  cd frontend && npm install
  cd backend && npm install
  ```

## ✅ Pruebas

- [ ] **Backend iniciado correctamente**
  ```bash
  cd backend && npm start
  # Puerto: 5000
  ```

- [ ] **Frontend iniciado correctamente**
  ```bash
  cd frontend && npm start
  # Puerto: 3000
  ```

- [ ] **Página de Consulta Online accesible**
  - URL: http://localhost:3000/consulta-online

- [ ] **Widget de Calendly se muestra correctamente**
  - Formulario se llena correctamente
  - Widget aparece después de enviar formulario
  - Se pueden ver los horarios disponibles

- [ ] **Reserva de prueba realizada**
  - Email de confirmación recibido
  - Cita aparece en calendario de Calendly
  - Datos del formulario se pre-llenan en Calendly

## ✅ Webhooks (Opcional - Solo con Plan de Pago)

- [ ] **Plan de pago de Calendly activado**
  - Plan: ☐ Essentials  ☐ Professional  ☐ Teams

- [ ] **Webhook configurado en Calendly**
  - URL: https://________________________/api/calendly/webhook
  - Eventos: ☐ invitee.created  ☐ invitee.canceled  ☐ invitee.updated

- [ ] **Signing Key configurado**
  ```
  backend/.env tiene CALENDLY_SIGNING_KEY
  ```

- [ ] **Webhook probado y funcionando**
  - [ ] Se reciben eventos en el backend
  - [ ] Se crean citas en la base de datos
  - [ ] Se asignan asesores automáticamente

## ✅ Verificación con Script

- [ ] **Script de verificación ejecutado**
  ```bash
  cd backend
  node scripts/checkCalendly.js
  ```

- [ ] **Todos los checks pasaron**

## 📝 Notas

_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

## 🎯 Estado Final

- [ ] **Todo funciona correctamente**
- [ ] **Listo para usar en producción**

---

Fecha de completado: _____ / _____ / _________
Configurado por: ________________________________
