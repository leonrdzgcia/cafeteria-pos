# Guía de Deployment - Sistema POS Cafetería

## 📋 Requisitos Previos

- Node.js y npm instalados
- Credenciales de acceso FTP a tu hosting
- Espacio en el hosting para aplicación Angular

## 🚀 Configuración Inicial

### 1. Copiar archivo de configuración

Copia el archivo de ejemplo y configúralo con tus credenciales:

```bash
copy deploy-config.example.json deploy-config.json
```

### 2. Editar deploy-config.json

Abre `deploy-config.json` y configura tus credenciales FTP:

```json
{
  "ftp": {
    "host": "ftp.tuhosting.com",
    "port": 21,
    "user": "tu_usuario_ftp",
    "password": "tu_password_ftp",
    "remoteRoot": "/public_html/",
    "deleteRemote": false
  },
  "url": "https://tu-sitio.com"
}
```

#### Parámetros:

- **host**: Servidor FTP de tu hosting (ej: ftp.mihosting.com)
- **port**: Puerto FTP (normalmente 21)
- **user**: Tu usuario FTP
- **password**: Tu contraseña FTP
- **remoteRoot**: Carpeta remota donde se subirán los archivos
  - cPanel/Hostinger: `/public_html/`
  - Otros: `/www/`, `/htdocs/`, etc.
- **deleteRemote**: `false` (no borrar archivos remotos) o `true` (limpiar antes de subir)
- **url**: URL pública de tu sitio

## 📦 Comandos Disponibles

### Build de Producción

Compila el proyecto optimizado para producción:

```bash
npm run build:prod
```

Los archivos se generan en: `dist/cafeteria-pos/browser/`

### Deploy Completo (Build + Upload FTP)

Construye y sube automáticamente a tu hosting:

```bash
npm run deploy:ftp
```

Este comando:
1. ✅ Compila el proyecto en modo producción
2. ✅ Sube todos los archivos al servidor FTP
3. ✅ Muestra progreso de cada archivo subido

## 🔧 Configuración del Hosting

### Configuración para cPanel/Hostinger

1. **Directorio de subida**: `/public_html/` o `/public_html/nombre-carpeta/`
2. **Archivo .htaccess**: El deployment automáticamente incluye este archivo

Si necesitas crear/editar el `.htaccess` manualmente:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Dominios y Subdominios

#### Para dominio principal (www.tu-sitio.com):
```json
"remoteRoot": "/public_html/"
```

#### Para subdirectorio (www.tu-sitio.com/app):
```json
"remoteRoot": "/public_html/app/"
```

#### Para subdominio (app.tu-sitio.com):
```json
"remoteRoot": "/public_html/app/"
```
(Configura el subdominio en tu panel de hosting)

## 🎯 Proceso Paso a Paso

### Primera vez:

1. Instalar dependencias:
```bash
npm install
```

2. Configurar credenciales FTP:
```bash
copy deploy-config.example.json deploy-config.json
# Editar deploy-config.json con tus credenciales
```

3. Ejecutar deployment:
```bash
npm run deploy:ftp
```

### Deployments posteriores:

Simplemente ejecuta:
```bash
npm run deploy:ftp
```

## 📊 Verificación del Deployment

Después del deployment, verifica:

1. ✅ Accede a tu URL en el navegador
2. ✅ Verifica que todas las rutas funcionan (Mesas, POS, Cobro, etc.)
3. ✅ Comprueba que los estilos se cargan correctamente
4. ✅ Revisa la consola del navegador (F12) para errores

## 🐛 Solución de Problemas

### Error: "No se encontró deploy-config.json"

**Solución**: Copia el archivo de ejemplo:
```bash
copy deploy-config.example.json deploy-config.json
```

### Error de conexión FTP

**Posibles causas**:
- Credenciales incorrectas
- Puerto incorrecto (prueba 21 o 22)
- Firewall bloqueando la conexión
- IP bloqueada en el hosting

**Solución**: Verifica tus credenciales en el panel de tu hosting

### Las rutas no funcionan (Error 404)

**Solución**: Asegúrate de que el archivo `.htaccess` esté en el servidor:

```apache
# Archivo: .htaccess en /public_html/
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Los estilos no se cargan

**Solución**: Verifica la URL base en `angular.json`:
- Si está en la raíz: `"baseHref": "/"`
- Si está en subdirectorio: `"baseHref": "/app/"`

## 🔐 Seguridad

⚠️ **IMPORTANTE**:
- ❌ **NUNCA** subas `deploy-config.json` a Git (ya está en .gitignore)
- ❌ **NUNCA** compartas tus credenciales FTP
- ✅ Cambia las contraseñas regularmente
- ✅ Usa contraseñas seguras

## 📱 Otras Opciones de Deployment

### GitHub Pages

```bash
npm install -g angular-cli-ghpages
ng build --configuration production --base-href "https://tu-usuario.github.io/tu-repo/"
npx angular-cli-ghpages --dir=dist/cafeteria-pos/browser
```

### Netlify

1. Arrastra la carpeta `dist/cafeteria-pos/browser/` a netlify.com
2. O conecta tu repositorio GitHub para auto-deploy

### Vercel

```bash
npm install -g vercel
vercel
```

## 📞 Soporte

Si tienes problemas con el deployment:
1. Verifica que el build local funcione: `npm run build:prod`
2. Revisa los logs del deployment
3. Contacta al soporte de tu hosting si el problema persiste

---

**Última actualización**: 2025
**Versión**: 1.0.0
