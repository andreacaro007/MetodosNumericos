# Métodos Numéricos

Aplicación de escritorio educativa para estudiar métodos numéricos y analizar funciones reales de forma visual, verificable y completamente offline. Incluye **Bisección**, **Newton-Raphson** y **Punto Fijo**, además de un motor científico independiente para explorar una función antes de resolverla.

## Características

- Expresiones polinómicas y científicas mediante una capa segura sobre math.js.
- Sintaxis amigable: `2x`, `3(x+1)`, `ln(x)`, `π`, trigonometría y exponenciales.
- Bisección, Newton-Raphson y Punto Fijo implementados en TypeScript sin solucionadores externos.
- Comparación académica entre los tres métodos, reutilizando únicamente los parámetros suministrados.
- Derivación simbólica automática con math.js y tangente sincronizada por iteración.
- Primera y segunda derivada en el panel de análisis científico, renderizadas con KaTeX.
- Evaluación puntual de `f(x)` con sustitución matemática y resultado numérico.
- Clasificación estructural de funciones y avisos sobre divisiones, logaritmos y radicales.
- Exploración configurable por muestreo, con mínimo y máximo observados y puntos no evaluables.
- Detección heurística de intervalos candidatos para Bisección y zonas cercanas a cero.
- Sugerencias justificadas de `x₀` para Newton-Raphson, sin prometer convergencia.
- Transferencia de intervalos y valores iniciales al método elegido sin resolver automáticamente.
- Gráfica general previa con zoom, desplazamiento y reinicio de vista.
- Teclado científico por categorías con inserción en la posición del cursor.
- Diagrama Cobweb (telaraña) para Punto Fijo con curva $g(x)$ y recta identidad $y=x$.
- Análisis riguroso de convergencia local mediante $|g'(x_0)|$ y seguimiento en cada iteración.
- Verificación cruzada entre el punto fijo de $g(x)$ y la satisfacción de la ecuación original $f(x)=0$.
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
Electron → Angular UI ─┬→ Casos de uso → Bisección / Newton / Punto Fijo
                      ├→ CasoUsoCompararMetodos → solucionadores existentes
                      └→ CasoUsoAnalizarFuncion → motor de análisis científico
                                                   ↓
                         Analizador / Derivador / Evaluador → math.js
                         KaTeX ← fórmulas     JSXGraph ← gráficas
```

Los solucionadores mantienen sus propios resultados inmutables para resumen, gráfica, tabla y pasos. El análisis científico reutiliza el mismo parser seguro, compilación y derivador, pero no ejecuta automáticamente ningún método.

## Documentación

- [Requisitos](docs/requisitos.md)
- [Modelo matemático](docs/modelo-matematico.md)
- [Algoritmos](docs/algoritmos.md)
- [Arquitectura](docs/arquitectura.md)
- [Referencias y licencias](docs/referencias.md)
- [Decisiones técnicas](docs/decisiones-tecnicas.md)
- [Manual](docs/manual.md)

## Hoja de ruta

1. GOAL-001 — Fundación, Electron y Bisección.
2. GOAL-002 — Newton-Raphson, derivación simbólica y tangentes. **Implementado**.
3. GOAL-003 — Punto Fijo con análisis de convergencia y Cobweb Plot. **Implementado**.
4. GOAL-004 — Motor científico avanzado. **Implementado**.
5. GOAL-005 — Comparación académica entre métodos. **Implementado**.
6. GOAL-006 — Cierre final del manual y pendientes de integración.

No se utiliza IA para calcular raíces ni para redactar el procedimiento matemático. La aplicación de escritorio incluye un motor Python auxiliar para la cota teórica de Bisección; los solucionadores principales continúan en TypeScript y conservan un fallback local.

La interfaz inicia sin ejercicio precargado, ofrece ejemplos voluntarios y usa paneles con desplazamiento independiente en escritorio. La ventana es adaptable desde 390 px y prioriza 1366×768 y 1280×720.
