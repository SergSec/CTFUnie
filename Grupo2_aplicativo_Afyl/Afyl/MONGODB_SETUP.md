# Configuración de MongoDB

## Opción 1: MongoDB Local

### Instalación en Windows

1. **Descargar MongoDB Community Server:**
   - Ve a https://www.mongodb.com/try/download/community
   - Selecciona Windows y descarga la versión más reciente

2. **Instalar MongoDB:**
   - Ejecuta el instalador
   - Selecciona "Complete" installation
   - Marca "Install MongoDB as a Service"
   - Acepta la configuración predeterminada

3. **Verificar instalación:**
   ```bash
   mongod --version
   ```

4. **Iniciar MongoDB:**
   - MongoDB debería iniciarse automáticamente como servicio
   - Si no, puedes iniciarlo manualmente desde Services en Windows

### Verificar que MongoDB está corriendo

```bash
# Verificar que el servicio está activo
# En PowerShell:
Get-Service MongoDB

# O intentar conectar:
mongosh
```

## Opción 2: MongoDB Atlas (Cloud - Recomendado para desarrollo)

1. **Crear cuenta gratuita:**
   - Ve a https://www.mongodb.com/cloud/atlas/register
   - Crea una cuenta gratuita (M0 tier es gratuito)

2. **Crear un cluster:**
   - Selecciona la región más cercana
   - Elige el tier M0 (Free)
   - Crea el cluster (puede tardar unos minutos)

3. **Configurar acceso:**
   - Ve a "Database Access" → "Add New Database User"
   - Crea un usuario y contraseña (guárdalos)
   - Ve a "Network Access" → "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0) para desarrollo

4. **Obtener connection string:**
   - Ve a "Database" → "Connect"
   - Selecciona "Connect your application"
   - Copia la connection string
   - Reemplaza `<password>` con tu contraseña y `<dbname>` con `Afyl`

5. **Configurar en el proyecto:**
   - Crea `backend/.env` con:
   ```
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/Afyl?retryWrites=true&w=majority
   ```

## Opción 3: MongoDB con Docker

Si tienes Docker instalado:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Configuración en el proyecto

1. Crea el archivo `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/Afyl
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRE=7d
NODE_ENV=development
```

2. Si usas MongoDB Atlas, usa la connection string en lugar de `mongodb://localhost:27017/Afyl`

## Solución de problemas

### Error: connect ECONNREFUSED

**Causa:** MongoDB no está corriendo o no está accesible en el puerto 27017

**Solución:**
1. Verifica que MongoDB está corriendo:
   ```bash
   # Windows
   Get-Service MongoDB
   ```

2. Si no está corriendo, inícialo:
   ```bash
   # Windows - Iniciar servicio
   net start MongoDB
   ```

3. Verifica que el puerto 27017 está libre:
   ```bash
   netstat -an | findstr 27017
   ```

### MongoDB no se inicia automáticamente

**Solución:**
1. Abre Services (servicios.msc)
2. Busca "MongoDB Server"
3. Clic derecho → Properties → Start Type: Automatic
4. Inicia el servicio

### No puedo conectarme a MongoDB Atlas

**Solución:**
1. Verifica que tu IP está en la whitelist de Network Access
2. Verifica que el usuario y contraseña son correctos
3. Verifica que la connection string está bien formateada

