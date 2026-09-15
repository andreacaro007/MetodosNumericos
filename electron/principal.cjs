const { app, BrowserWindow, ipcMain } = require("electron");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const OPERACIONES_PERMITIDAS = new Set(["iteraciones_biseccion"]);

function rutaMotorNumerico() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "motor-numerico.exe")
    : path.join(__dirname, "..", "python", "dist", "motor-numerico.exe");
}

ipcMain.on("motor-numerico:ejecutar", (evento, solicitud) => {
  if (!solicitud || typeof solicitud !== "object" || !OPERACIONES_PERMITIDAS.has(solicitud.operacion)) {
    evento.returnValue = { ok: false, motor: "python", error: "Operación no permitida." };
    return;
  }

  const proceso = spawnSync(rutaMotorNumerico(), [], {
    input: JSON.stringify(solicitud),
    encoding: "utf8",
    timeout: 5000,
    windowsHide: true,
  });

  if (proceso.error || proceso.status !== 0) {
    evento.returnValue = { ok: false, motor: "python", error: "El motor numérico no respondió." };
    return;
  }

  try {
    evento.returnValue = JSON.parse(proceso.stdout);
  } catch {
    evento.returnValue = { ok: false, motor: "python", error: "Respuesta inválida del motor numérico." };
  }
});

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
