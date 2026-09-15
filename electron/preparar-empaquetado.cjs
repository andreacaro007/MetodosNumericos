const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const destino = path.join(raiz, '.electron-app');
const buildAngular = path.join(raiz, 'dist', 'numerical-lab', 'browser');

if (!fs.existsSync(path.join(buildAngular, 'index.html'))) {
  throw new Error('No existe el build de Angular. Ejecuta npm run compilar antes de empaquetar.');
}

fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(path.join(destino, 'dist', 'numerical-lab'), { recursive: true });
fs.cpSync(buildAngular, path.join(destino, 'dist', 'numerical-lab', 'browser'), { recursive: true });
fs.copyFileSync(path.join(__dirname, 'principal.cjs'), path.join(destino, 'principal.cjs'));
fs.copyFileSync(path.join(__dirname, 'precarga.cjs'), path.join(destino, 'precarga.cjs'));
fs.writeFileSync(path.join(destino, 'package.json'), JSON.stringify({
  name: 'metodos-numericos',
  version: '1.0.0',
  description: 'Aplicación educativa de Métodos Numéricos',
  author: 'Proyecto académico de Métodos Numéricos',
  main: 'principal.cjs',
  build: {
    appId: 'edu.metodosnumericos.app',
    productName: 'Métodos Numéricos',
    electronVersion: '44.3.0',
    asar: true,
    npmRebuild: false,
    directories: { output: '../release' },
    files: ['**/*'],
    win: { target: ['portable'], artifactName: 'MetodosNumericos.exe' },
    portable: { artifactName: 'MetodosNumericos.exe' },
  },
}, null, 2));
