# Guía de Inicio Rápido - Proyecto Reorganizado

## 📁 Nueva Estructura

```
lore--fit/
├── frontend/           # Aplicación web (HTML, CSS, JS)
│   ├── assets/
│   ├── pages/
│   ├── scss/
│   └── index.html
├── backend/            # Servidor Node.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
└── .gitignore
```

## 🚀 Cómo Iniciar el Servidor

1. **Navega al directorio backend**:
   ```bash
   cd backend
   ```

2. **Instala dependencias** (solo la primera vez):
   ```bash
   npm install
   ```

3. **Inicia el servidor con auto-compilación SCSS**:
   ```bash
   npm run dev
   ```
   
   Esto ejecuta en paralelo:
   - ✅ Servidor Node.js con recarga automática
   - ✅ Compilador SCSS en modo watch (recompila al guardar)

4. **Abre en el navegador**:
   ```
   http://localhost:3000
   ```

## 🔧 Configuración

El archivo `backend/.env` contiene las credenciales de MercadoPago. Asegúrate de tenerlo configurado correctamente.

## 📝 Comandos Disponibles

Desde el directorio `backend/`:

- `npm run dev` - **Recomendado**: Inicia servidor + compilador SCSS en paralelo
- `npm start` - Inicia solo el servidor en modo producción
- `npm run dev:server` - Inicia solo el servidor con recarga automática
- `npm run dev:scss` - Inicia solo el compilador SCSS en modo watch
- `npm run build:scss` - Compila SCSS a CSS una sola vez

## 🎨 Desarrollo con SCSS

Los archivos SCSS están en `frontend/scss/`. El archivo principal es `style.scss`.

Cuando ejecutas `npm run dev`:
- Los cambios en archivos `.scss` se compilan automáticamente a `frontend/assets/css/style.css`
- El CSS generado está minificado para producción
- No necesitas compilar manualmente

## ✅ Verificación

El servidor sirve los archivos del directorio `frontend/` automáticamente. Todas las rutas funcionan correctamente:

- `/` → `frontend/index.html`
- `/pages/planes/clasic.html` → `frontend/pages/planes/clasic.html`
- `/assets/css/style.css` → `frontend/assets/css/style.css`

## 🎯 Próximos Pasos

1. Prueba el checkout en cualquier plan
2. Verifica que las páginas de resultado funcionen (success, pending, failure)
3. Modifica archivos SCSS y verifica que se compilen automáticamente
4. Haz commit de los cambios cuando todo funcione correctamente
