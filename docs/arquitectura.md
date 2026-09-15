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

## Arquitectura multi-método

```text
                         Calculadora
                             │
                  Método seleccionado
               /             |              \
              ▼              ▼               ▼
       Bisección          Newton         Punto Fijo
              │              │               │
              ▼              ▼               ▼
    Solucionador       Solucionador     Solucionador
     Bisección           Newton          PuntoFijo
              \              |              /
               └─────────────┼─────────────┘
                             ▼
                      Motor matemático
                             │
                           math.js
```

Punto Fijo cuenta con:
- `SolucionadorPuntoFijo` en `core/metodos-numericos/punto-fijo/`.
- `ValidadorPuntoFijo` para rangos y tipos numéricos.
- `ConstructorPasosPuntoFijo` para reconstrucción determinista sin IA.
- `CasoUsoResolverPuntoFijo` como puerto de aplicación.
- Componentes visuales especializados: `TablaPuntoFijo`, `PasoAPasoPuntoFijo` y `GraficaPuntoFijo` (Cobweb Plot interactivo con curva $y=g(x)$ y recta identidad $y=x$).

El formulario comparte función, tolerancia y máximo de iteraciones; habilita intervalo para Bisección o x₀ para Newton. Cambiar de método limpia resultado, error, reproducción e iteración activa. Las tablas y gráficas son específicas, mientras navegación, resumen y visualización KaTeX se reutilizan.

El layout usa 100dvh y scroll independiente para configuración y área de trabajo en escritorio; debajo de 780 px se apila. Las gráficas observan cambios de tamaño con ResizeObserver, resizeContainer() y fullUpdate().
