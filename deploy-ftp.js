const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();
const path = require('path');
const fs = require('fs');

// Cargar configuración desde archivo .env o deploy-config.json
let config;
const configPath = path.join(__dirname, 'deploy-config.json');

if (fs.existsSync(configPath)) {
  config = require(configPath);
} else {
  console.error('\x1b[31m%s\x1b[0m', '❌ Error: No se encontró el archivo deploy-config.json');
  console.log('\x1b[33m%s\x1b[0m', '💡 Copia deploy-config.example.json a deploy-config.json y configura tus credenciales');
  process.exit(1);
}

const ftpConfig = {
  user: config.ftp.user,
  password: config.ftp.password,
  host: config.ftp.host,
  port: config.ftp.port || 21,
  localRoot: path.join(__dirname, 'dist', 'cafeteria-pos', 'browser'),
  remoteRoot: config.ftp.remoteRoot,
  include: ['*', '**/*'],
  exclude: [
    'dist/**/*.map',
    'node_modules/**',
    'node_modules/**/.*',
    '.git/**'
  ],
  deleteRemote: config.ftp.deleteRemote || false,
  forcePasv: true,
  sftp: false
};

console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando deployment a ' + config.ftp.host);
console.log('\x1b[90m%s\x1b[0m', '📁 Directorio local: ' + ftpConfig.localRoot);
console.log('\x1b[90m%s\x1b[0m', '📂 Directorio remoto: ' + ftpConfig.remoteRoot);
console.log('');

ftpDeploy
  .deploy(ftpConfig)
  .then(res => {
    console.log('\x1b[32m%s\x1b[0m', '✅ Deployment completado exitosamente!');
    console.log('\x1b[36m%s\x1b[0m', '🌐 Tu aplicación está disponible en: ' + (config.url || config.ftp.host));
  })
  .catch(err => {
    console.error('\x1b[31m%s\x1b[0m', '❌ Error durante el deployment:');
    console.error(err);
    process.exit(1);
  });

ftpDeploy.on('uploading', function (data) {
  const percentage = ((data.transferredFileCount / data.totalFilesCount) * 100).toFixed(1);
  console.log('\x1b[33m%s\x1b[0m', `📤 Subiendo: ${data.filename} (${percentage}%)`);
});

ftpDeploy.on('uploaded', function (data) {
  console.log('\x1b[32m%s\x1b[0m', '✓ Subido: ' + data.filename);
});

ftpDeploy.on('log', function (data) {
  console.log('\x1b[90m%s\x1b[0m', data);
});
