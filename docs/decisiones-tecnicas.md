# Decisiones técnicas

## Plataforma

Angular 21 se conserva como renderer por su tipado, formularios y reactividad. Las rutas de recursos son relativas para funcionar bajo `file://`. Electron es mínimo, no expone Node.js y produce primero una distribución portable; el instalador queda fuera de alcance.

## Matemáticas

math.js resuelve parsing, AST, compilación, evaluación, derivación simbólica, simplificación y LaTeX. Una lista controlada limita la entrada a una función real de x. DerivadorExpresiones mantiene la derivación fuera de Angular. Los valores internos no se redondean; el formateador solo modifica la presentación.

## Visualización y estado

JSXGraph aporta navegación y objetos matemáticos con un único motor gráfico. La solución se calcula una vez; señales locales gestionan pestaña e iteración activa y las vistas no ejecutan el algoritmo.

Newton-Raphson es implementación propia. La tangente usa exactamente xₙ, f(xₙ), f'(xₙ) y xₙ₊₁ almacenados. Para derivadas casi nulas se usa √Number.EPSILON: una tolerancia basada en la precisión de number, no en redondeos visuales. Saltos crecientes repetidos o magnitudes superiores a 10¹² se reportan como posible divergencia, no como error de entrada.

El responsive no depende solo del ancho: el shell ocupa 100dvh, los paneles tienen scroll independiente y el modo apilado elimina esa restricción. Electron conserva resize, inicia en 1400×900 y permite bajar hasta 390×560.
