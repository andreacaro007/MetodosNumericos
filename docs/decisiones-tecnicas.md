# Decisiones técnicas

## Plataforma

Angular 21 se conserva como renderer por su tipado, formularios y reactividad. Las rutas de recursos son relativas para funcionar bajo `file://`. Electron es mínimo, no expone Node.js y produce primero una distribución portable; el instalador queda fuera de alcance.

## Matemáticas

math.js resuelve parsing, AST, compilación, evaluación, derivación simbólica, simplificación y LaTeX. Una lista controlada limita la entrada a una función real de x. DerivadorExpresiones mantiene la derivación fuera de Angular. Los valores internos no se redondean; el formateador solo modifica la presentación.

## Visualización y estado

JSXGraph aporta navegación y objetos matemáticos con un único motor gráfico. La solución se calcula una vez; señales locales gestionan pestaña e iteración activa y las vistas no ejecutan el algoritmo.

Newton-Raphson es implementación propia. La tangente usa exactamente xₙ, f(xₙ), f'(xₙ) y xₙ₊₁ almacenados. Para derivadas casi nulas se usa √Number.EPSILON: una tolerancia basada en la precisión de number, no en redondeos visuales. Saltos crecientes repetidos o magnitudes superiores a 10¹² se reportan como posible divergencia, no como error de entrada.

El responsive no depende solo del ancho: el shell ocupa 100dvh, los paneles tienen scroll independiente y el modo apilado elimina esa restricción. Electron conserva resize, inicia en 1400×900 y permite bajar hasta 390×560.

## Punto Fijo y Cobweb Plot

- Se exige al usuario ingresar explícitamente $f(x)$ y su transformación $g(x)$. No se realiza despeje algebraico automático en este goal para no forzar una rama de convergencia particular.
- $g'(x)$ se deriva analíticamente usando `DerivadorExpresiones` para calcular con exactitud la condición local $|g'(x_n)|$.
- El diagrama de telaraña dibuja segmentos verticales $(x_n, x_n) \to (x_n, g(x_n))$ y horizontales $(x_n, g(x_n)) \to (g(x_n), g(x_n))$ hasta la iteración activa, permitiendo la reconstrucción visual del atractor o repulsor.
- Se verifica si $|f(x^*)|$ es cercano a cero. Si no lo es, se informa mediante advertencia de transformación incoherente sin corromper el cálculo del punto fijo.

## Análisis científico sin CAS adicional

- Se reutilizan math.js, KaTeX y JSXGraph; no se añadieron Plotly, D3, Chart.js, Nerdamer, SymPy, Python ni otro parser.
- La primera derivada se obtiene con `DerivadorExpresiones` y la segunda se obtiene derivando nuevamente el resultado. No se implementaron reglas simbólicas paralelas.
- La clasificación usa únicamente la estructura del AST validado. Cuando hay varias familias se informa una clasificación mixta en lugar de forzar una etiqueta única.
- Las restricciones de división, logaritmo y radical son advertencias estructurales; no se presentan como una solución simbólica completa del dominio.

## Evidencia numérica observada

- La exploración compila la expresión una vez y evalúa una malla acotada, separada de la resolución formal de raíces.
- Mínimos, máximos, zonas cercanas a cero y puntos no evaluables se describen como observados dentro del intervalo elegido.
- Los cambios de signo son intervalos candidatos. Una heurística revisa magnitudes extremas y el punto medio para reducir falsos positivos causados por discontinuidades como `1/x`.
- Las sugerencias de Newton exigen una derivada evaluable y no cercana a cero cuando esa información está disponible; nunca garantizan convergencia.
- Las transferencias a Bisección y Newton no ejecutan el método automáticamente, para mantener el control del estudiante sobre la resolución.
