# Arquitectura

```text
Electron (proceso principal seguro)
  └── Angular (presentación)
       └── CasoUsoResolverBiseccion (aplicación)
            ├── SolucionadorBiseccion (método numérico)
            └── Analizador/Evaluador (motor matemático)
                 └── math.js
```

Electron crea la ventana, carga el build local y expone un único canal IPC restringido para el motor numérico auxiliar. El preload no expone Node.js: solo permite solicitar operaciones incluidas en una lista cerrada. El proceso principal ejecuta motor-numerico.exe con entrada y salida JSON, sin servidor, puertos ni acceso general al sistema.

Angular y TypeScript se comunican mediante contextBridge con el canal motor-numerico:ejecutar, que invoca el motor Python empaquetado.

Los solucionadores de Bisección, Newton-Raphson y Punto Fijo permanecen en TypeScript. Python calcula la cota teórica de Bisección en la aplicación empaquetada; la implementación TypeScript se conserva como respaldo para pruebas, navegador o fallos del proceso auxiliar.

La entrada se convierte en `ExpresionAnalizada`, que conserva texto original, normalización, AST y LaTeX. El solucionador compila una vez y produce un `ResultadoBiseccion` consumido por resumen, tabla, pasos y gráfica. `Calculadora` sincroniza la iteración activa mediante señales.

## Seguridad y offline

- La expresión nunca se ejecuta como JavaScript.
- El AST solo admite constantes, `x`, operadores y una lista científica controlada.
- Electron usa `contextIsolation: true`, `nodeIntegration: false` y `sandbox: true`.
- Se bloquean ventanas nuevas; fuentes, KaTeX, math.js y JSXGraph son locales.
- El IPC acepta únicamente operaciones numéricas declaradas y el proceso Python se ejecuta oculto, con tiempo máximo de respuesta.

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

El formulario comparte función, tolerancia y máximo de iteraciones; habilita intervalo para Bisección o x₀ para Newton. Cambiar de método conserva los parámetros suministrados y limpia el resultado, el error, la reproducción y la iteración activa. Las tablas y gráficas son específicas, mientras navegación, resumen y visualización KaTeX se reutilizan.

## Comparación entre métodos

`CasoUsoCompararMetodos` reutiliza `CasoUsoResolverBiseccion`, `CasoUsoResolverNewton` y `CasoUsoResolverPuntoFijo`. Ejecuta cada método de forma independiente con los parámetros proporcionados por el usuario, representa los métodos incompletos como no disponibles y entrega resultados normalizados al componente `PanelComparacion`.

El layout usa 100dvh y scroll independiente para configuración y área de trabajo en escritorio; debajo de 780 px se apila. Las gráficas observan cambios de tamaño con ResizeObserver, resizeContainer() y fullUpdate().

## Motor de análisis científico

El análisis de funciones está separado de `Calculadora` y de los solucionadores:

```text
PanelAnalisis
    │
    ▼
CasoUsoAnalizarFuncion
    │
    ▼
AnalizadorFuncion
    ├── ClasificadorFuncion
    ├── ExploradorFuncion
    │      └── DetectorIntervalos
    ├── AnalizadorExpresiones
    ├── DerivadorExpresiones
    ├── EvaluadorExpresiones
    └── FormateadorExpresiones
```

- `core/analisis-funciones/modelos-analisis.ts` define análisis, muestreo, intervalos candidatos, zonas cercanas a cero y sugerencias de Newton.
- `clasificador-funcion.ts` recorre el AST validado para identificar familias y restricciones estructurales.
- `explorador-funcion.ts` compila `f(x)` y `f'(x)` una sola vez por exploración, muestrea el rango y calcula estadísticas observadas.
- `detector-intervalos.ts` detecta cambios de signo y aplica filtros conservadores a saltos asintóticos.
- `panel-analisis/` coordina la ficha científica, evaluación puntual, exploración y transferencias de parámetros.
- `grafica-general.ts` usa JSXGraph para representar `f(x)` antes de ejecutar un método.

La comunicación con `EntradaFuncion` ocurre mediante eventos y métodos de carga explícitos. Transferir parámetros cambia el método y completa los campos, pero conserva el requisito académico de pulsar **Resolver**.
