# Configuración de MongoDB Atlas - Guía Paso a Paso

## Paso 1: Crear cuenta y cluster

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Selecciona el plan **M0 (Free)**
4. Elige la región más cercana a tu ubicación
5. Crea el cluster (puede tardar 2-3 minutos)

## Paso 2: Configurar acceso a la base de datos

1. En el menú lateral, ve a **"Database Access"**
2. Haz clic en **"Add New Database User"**
3. Elige **"Password"** como método de autenticación
4. Crea un usuario (ej: `afyl_user`) y una contraseña **segura**
   - ⚠️ **IMPORTANTE**: Guarda la contraseña, la necesitarás después
5. En "Database User Privileges", selecciona **"Atlas admin"** o **"Read and write to any database"**
6. Haz clic en **"Add User"**

## Paso 3: Configurar acceso de red

1. En el menú lateral, ve a **"Network Access"**
2. Haz clic en **"Add IP Address"**
3. Para desarrollo, selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ En producción, agrega solo las IPs específicas que necesites
4. Haz clic en **"Confirm"**

## Paso 4: Obtener la connection string

1. En el menú lateral, ve a **"Database"**
2. Haz clic en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Selecciona **"Node.js"** como driver
5. Copia la connection string que aparece (se verá algo como):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Paso 5: Configurar el archivo .env

1. Abre el archivo `backend/.env` (si no existe, créalo)
2. Reemplaza la línea `MONGODB_URI` con tu connection string:

```env
MONGODB_URI=mongodb+srv://afyl_user:TU_CONTRASEÑA_AQUI@cluster0.xxxxx.mongodb.net/Afyl?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE:**
- Reemplaza `<username>` con el usuario que creaste (ej: `afyl_user`)
- Reemplaza `<password>` con la contraseña que creaste
- Reemplaza `<dbname>` con `Afyl` (el nombre de la base de datos debe ser "Afyl")
- Si tu contraseña tiene caracteres especiales, necesitas codificarlos en URL:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`
  - `?` → `%3F`

### Ejemplo:

Si tu connection string original es:
```
mongodb+srv://afyl_user:MiP@ssw0rd#123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Debes codificar la contraseña:
```
mongodb+srv://afyl_user:MiP%40ssw0rd%23123@cluster0.xxxxx.mongodb.net/Afyl?retryWrites=true&w=majority
```

## Paso 6: Verificar la conexión

1. Reinicia el servidor backend:
   ```bash
   npm run dev
   ```

2. Deberías ver:
   ```
   ✅ MongoDB conectado exitosamente
   📊 Base de datos: Afyl
   ```

## Solución de problemas comunes

### Error: "authentication failed"
- Verifica que el usuario y contraseña sean correctos
- Si tu contraseña tiene caracteres especiales, codifícalos en URL

### Error: "ECONNREFUSED" o "timeout"
- Verifica que tu IP está en la whitelist de Network Access
- Asegúrate de que seleccionaste "Allow Access from Anywhere" (0.0.0.0/0)

### Error: "Invalid connection string"
- Verifica que la connection string esté entre comillas si tiene espacios
- Asegúrate de que no haya espacios extra en el archivo .env
- Verifica que el nombre de la base de datos esté antes de `?retryWrites`

### La connection string no funciona
- Asegúrate de haber reemplazado `<username>`, `<password>` y `<dbname>`
- Verifica que el cluster esté completamente creado (puede tardar unos minutos)
- Intenta generar una nueva connection string desde el dashboard de Atlas

## Herramienta para codificar contraseñas

Si tu contraseña tiene caracteres especiales, puedes usar esta herramienta online:
https://www.urlencoder.org/

O usar JavaScript:
```javascript
encodeURIComponent('tu-contraseña-aquí')
```

