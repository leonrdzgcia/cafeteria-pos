/**
 * Script de Deployment Genérico
 *
 * Este script construye el proyecto y muestra instrucciones para deployment manual
 * Para deployment automático FTP, usa: npm run deploy:ftp
 */

const path = require('path');
const fs = require('fs');

console.log('\x1b[36m%s\x1b[0m', '╔════════════════════════════════════════════════════════╗');
console.log('\x1b[36m%s\x1b[0m', '║         Sistema POS Cafetería - Deployment             ║');
console.log('\x1b[36m%s\x1b[0m', '╚════════════════════════════════════════════════════════╝');
console.log('');

const distPath = path.join(__dirname, 'dist', 'cafeteria-pos', 'browser');

// Verificar que exista el build
if (!fs.existsSync(distPath)) {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: No se encontró el directorio de build');
  console.log('\x1b[33m%s\x1b[0m', '💡 Ejecuta primero: npm run build:prod');
  process.exit(1);
}

// Mostrar resumen del build
const files = fs.readdirSync(distPath);
const fileCount = files.length;

console.log('\x1b[32m%s\x1b[0m', '✅ Build de producción completado exitosamente!');
console.log('');
console.log('\x1b[1m%s\x1b[0m', '📦 Archivos generados:');
console.log('\x1b[90m%s\x1b[0m', `   Ubicación: ${distPath}`);
console.log('\x1b[90m%s\x1b[0m', `   Total de archivos: ${fileCount}`);
console.log('');

console.log('\x1b[1m%s\x1b[0m', '🚀 Opciones de Deployment:');
console.log('');

console.log('\x1b[36m%s\x1b[0m', '1. Deployment Automático FTP:');
console.log('\x1b[90m%s\x1b[0m', '   npm run deploy:ftp');
console.log('');

console.log('\x1b[36m%s\x1b[0m', '2. Deployment Manual (FTP/SFTP):');
console.log('\x1b[90m%s\x1b[0m', '   - Conecta a tu servidor FTP usando FileZilla o similar');
console.log('\x1b[90m%s\x1b[0m', `   - Sube todo el contenido de: ${distPath}`);
console.log('\x1b[90m%s\x1b[0m', '   - Al directorio: /public_html/ (o el que uses)');
console.log('');

console.log('\x1b[36m%s\x1b[0m', '3. Netlify (Drag & Drop):');
console.log('\x1b[90m%s\x1b[0m', '   - Ve a: https://app.netlify.com/drop');
console.log('\x1b[90m%s\x1b[0m', `   - Arrastra la carpeta: ${distPath}`);
console.log('');

console.log('\x1b[36m%s\x1b[0m', '4. Vercel:');
console.log('\x1b[90m%s\x1b[0m', '   npm install -g vercel');
console.log('\x1b[90m%s\x1b[0m', '   vercel');
console.log('');

console.log('\x1b[36m%s\x1b[0m', '5. GitHub Pages:');
console.log('\x1b[90m%s\x1b[0m', '   npm install -g angular-cli-ghpages');
console.log('\x1b[90m%s\x1b[0m', '   npx angular-cli-ghpages --dir=dist/cafeteria-pos/browser');
console.log('');

console.log('\x1b[33m%s\x1b[0m', '📖 Para más información, lee: DEPLOYMENT.md');
console.log('');
