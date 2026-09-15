"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("motorNumerico", Object.freeze({
  ejecutar: (solicitud) => ipcRenderer.sendSync("motor-numerico:ejecutar", solicitud),
}));
