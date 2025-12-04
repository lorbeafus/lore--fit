# Guía de Configuración de MongoDB Cloud

Esta guía te ayudará a configurar MongoDB Atlas (MongoDB Cloud) para tu aplicación Lore-fit.

## Paso 1: Crear una Cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Haz clic en "Try Free" o "Sign Up"
3. Completa el registro con tu email o usa Google/GitHub

## Paso 2: Crear un Cluster

1. Una vez dentro del dashboard, haz clic en **"Build a Database"**
2. Selecciona la opción **FREE** (M0 Sandbox)
3. Elige un proveedor de cloud:
   - **AWS**, **Google Cloud**, o **Azure**
   - Selecciona la región más cercana a tu ubicación
4. Dale un nombre a tu cluster (opcional) o deja el nombre por defecto
5. Haz clic en **"Create Cluster"**
6. Espera 1-3 minutos mientras se crea el cluster

## Paso 3: Configurar Acceso a la Base de Datos

### 3.1 Crear un Usuario de Base de Datos

1. En el menú lateral, ve a **"Database Access"**
2. Haz clic en **"Add New Database User"**
3. Selecciona **"Password"** como método de autenticación
4. Ingresa:
   - **Username**: `lorefit-admin` (o el que prefieras)
   - **Password**: Genera una contraseña segura (guárdala, la necesitarás)
5. En "Database User Privileges", selecciona **"Read and write to any database"**
6. Haz clic en **"Add User"**

### 3.2 Configurar IP Whitelist

1. En el menú lateral, ve a **"Network Access"**
2. Haz clic en **"Add IP Address"**
3. Para desarrollo local, selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **Nota**: En producción, deberías agregar solo las IPs específicas de tu servidor
4. Haz clic en **"Confirm"**

## Paso 4: Obtener el Connection String

1. Ve a **"Database"** en el menú lateral
2. Haz clic en **"Connect"** en tu cluster
3. Selecciona **"Connect your application"**
4. Asegúrate de que esté seleccionado:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. Copia el **connection string** que aparece. Se verá algo así:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Paso 5: Configurar tu Aplicación

1. En el directorio `backend`, crea un archivo `.env` (si no existe):
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` y actualiza las siguientes variables:

   ```env
   # Reemplaza con tu connection string
   MONGODB_URI=mongodb+srv://lorefit-admin:TU_PASSWORD_AQUI@cluster0.xxxxx.mongodb.net/lorefit?retryWrites=true&w=majority
   
   # Genera un JWT secret seguro (ejecuta este comando en tu terminal):
   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   JWT_SECRET=tu-secret-generado-aqui
   
   JWT_EXPIRE=30d
   ```

3. **Importante**: Reemplaza en el connection string:
   - `<username>` con tu usuario (ej: `lorefit-admin`)
   - `<password>` con la contraseña que creaste
   - Agrega el nombre de la base de datos después de `.net/` (ej: `lorefit`)

### Ejemplo de Connection String Completo:
```
mongodb+srv://lorefit-admin:MiPassword123@cluster0.abc123.mongodb.net/lorefit?retryWrites=true&w=majority
```

## Paso 6: Generar JWT Secret

Ejecuta este comando en tu terminal para generar un secret seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y pégalo en tu archivo `.env` como valor de `JWT_SECRET`.

## Paso 7: Verificar la Conexión

1. Inicia tu servidor:
   ```bash
   npm run dev
   ```

2. Deberías ver en la consola:
   ```
   ✅ Conectado a MongoDB
   🚀 Servidor iniciado en http://localhost:3000
   🗄️  MongoDB configurado: Sí
   ```

3. Si ves un error, verifica:
   - Que el username y password sean correctos
   - Que hayas configurado el Network Access (IP Whitelist)
   - Que el connection string esté completo y sin espacios

## Paso 8: Ver tus Datos en MongoDB Atlas

1. Ve a **"Database"** en el menú lateral
2. Haz clic en **"Browse Collections"**
3. Aquí verás las colecciones que se crean cuando registres usuarios
4. La colección `users` aparecerá automáticamente cuando registres el primer usuario

## Solución de Problemas Comunes

### Error: "MongoServerError: bad auth"
- Verifica que el username y password en el connection string sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "MongooseServerSelectionError"
- Verifica que hayas configurado el Network Access (IP Whitelist)
- Asegúrate de que tu conexión a internet esté funcionando

### Error: "MONGODB_URI is not defined"
- Verifica que el archivo `.env` esté en el directorio `backend`
- Asegúrate de que la variable `MONGODB_URI` esté definida sin espacios

## Recursos Adicionales

- [Documentación de MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Connection String](https://www.mongodb.com/docs/manual/reference/connection-string/)

## Seguridad

⚠️ **IMPORTANTE**:
- Nunca compartas tu archivo `.env`
- Nunca subas tu archivo `.env` a Git (ya está en `.gitignore`)
- Usa contraseñas seguras para tu usuario de MongoDB
- En producción, restringe el Network Access solo a las IPs de tu servidor
