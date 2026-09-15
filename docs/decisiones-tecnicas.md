# Decisiones técnicas

## Plataforma

Angular 21 se conserva como renderer por su tipado, formularios y reactividad. Las rutas de recursos son relativas para funcionar bajo `file://`. Electron es mínimo, no expone Node.js y produce primero una distribución portable; el instalador queda fuera de alcance.

## Matemáticas

math.js resuelve parsing, AST, compilación, evaluación y LaTeX. Una lista controlada limita la entrada a una función real de `x`. Los valores internos no se redondean; el formateador solo modifica la presentación.

## Visualización y estado

JSXGraph aporta navegación y objetos matemáticos con un único motor gráfico. La solución se calcula una vez; señales locales gestionan pestaña e iteración activa y las vistas no ejecutan el algoritmo.
