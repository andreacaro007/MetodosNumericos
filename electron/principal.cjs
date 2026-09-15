const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function crearVentana() {
  const ventana = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 390,
    minHeight: 560,
    title: 'Métodos Numéricos',
    backgroundColor: '#f7f6f0',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'precarga.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const raizAplicacion = app.isPackaged ? __dirname : path.join(__dirname, '..');
  ventana.loadFile(path.join(raizAplicacion, 'dist', 'numerical-lab', 'browser', 'index.html'));
  ventana.once('ready-to-show', () => ventana.show());
  ventana.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(() => {
  crearVentana();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) crearVentana(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
