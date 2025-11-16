# 🚀 Inicio Rápido - Plataforma Afyl

## ✅ Configuración Completada

El proyecto está completamente configurado y listo para usar:

- ✅ Archivo `.env` creado con MongoDB Atlas
- ✅ Contraseña de MongoDB configurada
- ✅ Carpetas necesarias creadas
- ✅ Backend y Frontend configurados

## 📋 Pasos para Iniciar

### 1. Verificar que MongoDB Atlas esté configurado

Asegúrate de que en MongoDB Atlas:
- ✅ Tu IP esté en la whitelist de **Network Access** (0.0.0.0/0 para desarrollo)
- ✅ El usuario `adrianhermosilla_db_user` tenga permisos de lectura/escritura

### 2. Iniciar la aplicación

Desde la raíz del proyecto, ejecuta:

```bash
npm run dev
```

Esto iniciará:
- **Backend** en http://localhost:5000
- **Frontend** en http://localhost:3000

### 3. Acceder a la aplicación

1. Abre tu navegador en: http://localhost:3000
2. Registra un nuevo usuario o inicia sesión
3. ¡Listo para usar!

## 🔍 Verificación

Si todo está correcto, deberías ver en la consola:

```
✅ MongoDB conectado exitosamente
📊 Base de datos: afyl
Servidor corriendo en puerto 5000
```

Y en el frontend:
```
Compiled successfully!
You can now view afyl-frontend in the browser.
```

## 🐛 Solución de Problemas

### Error: "MongoDB no conectado"

1. Verifica que tu IP esté en Network Access de MongoDB Atlas
2. Verifica que el usuario y contraseña sean correctos en `backend/.env`
3. Verifica que el cluster esté activo en MongoDB Atlas

### Error: "Puerto 5000 ya en uso"

Cambia el puerto en `backend/.env`:
```
PORT=5001
```

### Error: "Frontend no compila"

Asegúrate de tener todas las dependencias instaladas:
```bash
npm run install-all
```

## 📝 Notas Importantes

- El archivo `.env` contiene información sensible y está en `.gitignore`
- Nunca subas el archivo `.env` a un repositorio público
- En producción, cambia `JWT_SECRET` por una clave más segura
- La contraseña de MongoDB está en texto plano en `.env` (normal para desarrollo)

## 🎯 Próximos Pasos

1. Registra tu primer usuario
2. Crea un caso de prueba
3. Explora las funcionalidades de la plataforma

¡Disfruta usando la plataforma Afyl! 🎉

