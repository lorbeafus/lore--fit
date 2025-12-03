# Scripts de Compilación SCSS

## 📦 Scripts Disponibles

### Desarrollo (con auto-compilación)
```bash
npm run dev
```
Este comando ejecuta **en paralelo**:
- `dev:server` - Servidor Node.js con nodemon (recarga automática)
- `dev:scss` - Compilador SCSS en modo watch (recompila automáticamente al guardar)

### Compilación Manual de SCSS
```bash
npm run build:scss
```
Compila todos los archivos SCSS a CSS una sola vez (sin watch).

### Solo Servidor (sin compilación SCSS)
```bash
npm run dev:server
```

### Solo Compilación SCSS (sin servidor)
```bash
npm run dev:scss
```

## 🎯 Cómo Funciona

1. **Archivo fuente**: `frontend/scss/style.scss`
2. **Archivo compilado**: `frontend/assets/css/style.css`
3. **Modo**: Comprimido (minificado)
4. **Watch**: Detecta cambios automáticamente en modo `dev`

## 🚀 Uso Recomendado

Para desarrollo, siempre usa:
```bash
cd backend
npm run dev
```

Esto iniciará:
- ✅ Servidor en `http://localhost:3000`
- ✅ Compilador SCSS en modo watch
- ✅ Recarga automática del servidor
- ✅ Recompilación automática de SCSS

## 📝 Notas

- Los cambios en archivos `.scss` se compilan automáticamente
- El CSS generado se guarda en `frontend/assets/css/style.css`
- El servidor se recarga automáticamente al cambiar archivos `.js`
- Ambos procesos corren en paralelo gracias a `npm-run-all`
