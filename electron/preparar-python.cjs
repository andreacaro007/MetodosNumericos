const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const script = path.join(raiz, "python", "motor_numerico.py");
const dist = path.join(raiz, "python", "dist");
const work = path.join(raiz, "python", "build");
const ejecutable = path.join(dist, "motor-numerico.exe");
const python = process.env.PYTHON || "python";

fs.rmSync(dist, { recursive: true, force: true });
fs.rmSync(work, { recursive: true, force: true });

execFileSync(python, [
  "-m", "PyInstaller", "--noconfirm", "--clean", "--onefile",
  "--name", "motor-numerico", "--distpath", dist, "--workpath", work,
  "--specpath", path.join(raiz, "python"), script,
], { cwd: raiz, stdio: "inherit", windowsHide: true });

if (!fs.existsSync(ejecutable) || fs.statSync(ejecutable).size === 0) {
  throw new Error("PyInstaller no generó python/dist/motor-numerico.exe.");
}

const salida = execFileSync(ejecutable, [], {
  input: JSON.stringify({ operacion: "iteraciones_biseccion", a: 0, b: 1, tolerancia: 1e-7 }),
  encoding: "utf8", windowsHide: true,
});
const respuesta = JSON.parse(salida);
if (!respuesta.ok || respuesta.motor !== "python" || respuesta.iteracionesTeoricas !== 24) {
  throw new Error("El motor Python no confirmó la cota esperada: " + salida);
}

console.log(JSON.stringify({ ejecutable, motor: respuesta.motor, iteracionesTeoricas: respuesta.iteracionesTeoricas }, null, 2));
