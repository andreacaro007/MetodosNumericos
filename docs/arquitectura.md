# Arquitectura

```text
Electron (proceso principal seguro)
  └── Angular (presentación)
       └── CasoUsoResolverBiseccion (aplicación)
            ├── SolucionadorBiseccion (método numérico)
            └── Analizador/Evaluador (motor matemático)
                 └── math.js
```

Electron solamente crea una ventana y carga el build local. No existe IPC porque el renderer no necesita capacidades del sistema operativo.

La entrada se convierte en `ExpresionAnalizada`, que conserva texto original, normalización, AST y LaTeX. El solucionador compila una vez y produce un `ResultadoBiseccion` consumido por resumen, tabla, pasos y gráfica. `Calculadora` sincroniza la iteración activa mediante señales.

## Seguridad y offline

- La expresión nunca se ejecuta como JavaScript.
- El AST solo admite constantes, `x`, operadores y una lista científica controlada.
- Electron usa `contextIsolation: true`, `nodeIntegration: false` y `sandbox: true`.
- Se bloquean ventanas nuevas; fuentes, KaTeX, math.js y JSXGraph son locales.
