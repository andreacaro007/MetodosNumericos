# Métodos Numéricos

Aplicación de escritorio educativa para estudiar métodos numéricos de forma visual, verificable y completamente offline. GOAL-001 implementa el **Método de Bisección** de extremo a extremo: entrada científica, validación, solución, errores, tabla, explicación determinista y gráfica interactiva.

## Características

- Expresiones polinómicas y científicas mediante una capa segura sobre math.js.
- Sintaxis amigable: `2x`, `3(x+1)`, `ln(x)`, `π`, trigonometría y exponenciales.
- Bisección implementada en TypeScript sin solucionadores externos.
- Criterios de parada por raíz exacta, residuo, error absoluto y máximo de iteraciones.
- Vista matemática con KaTeX y gráfica interactiva con JSXGraph.
- Tabla completa, selección de iteración, navegación y reproducción automática.
- Procedimiento paso a paso generado por reglas deterministas.
- Aplicación Electron aislada, sin integración de Node.js en el renderer y sin recursos remotos.

## Tecnologías

- Angular 21 y TypeScript estricto
- math.js 15
- KaTeX 0.18
- JSXGraph 1.13
- Electron y electron-builder
- Vitest mediante Angular CLI

## Desarrollo

```bash
npm install
npm run iniciar
npm run probar
npm run compilar
npm run escritorio
npm run ejecutable
```

El build local queda en `dist/numerical-lab/browser`. El ejecutable portable queda en `release/MetodosNumericos.exe`.

## Casos de aceptación

| Función | Intervalo | Raíz de referencia |
| --- | --- | ---: |
| `x^3 - x - 2` | `[1, 2]` | `1.5213797068…` |
| `cos(x) - x` | `[0, 1]` | `0.7390851332…` |
| `exp(-x) - x` | `[0, 1]` | `0.5671432904…` |

## Arquitectura

```text
Electron → Angular UI → Caso de uso → SolucionadorBiseccion
                                      ↓
                              EvaluadorExpresiones → math.js
```

La solución se calcula una sola vez. Resumen, gráfica, tabla y pasos consumen el mismo `ResultadoBiseccion`.

## Documentación

- [Requisitos](docs/requisitos.md)
- [Modelo matemático](docs/modelo-matematico.md)
- [Algoritmos](docs/algoritmos.md)
- [Arquitectura](docs/arquitectura.md)
- [Referencias y licencias](docs/referencias.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)

## Hoja de ruta

1. GOAL-001 — Fundación, Electron y Bisección.
2. GOAL-002 — Newton-Raphson, derivación simbólica y tangentes.
3. GOAL-003 — Punto Fijo.
4. GOAL-004 — Motor científico avanzado.

No se utiliza IA para calcular raíces ni para redactar el procedimiento matemático.
