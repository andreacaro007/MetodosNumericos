# Requisitos del producto

## Alcance actual — GOAL-004

- **RF-001:** ingresar una función real de una variable `x` con sintaxis científica amigable.
- **RF-002:** visualizar la función mediante notación matemática.
- **RF-003:** configurar extremos, tolerancia y máximo de iteraciones.
- **RF-004:** validar parámetros, evaluabilidad y cambio de signo.
- **RF-005:** resolver ecuaciones mediante Bisección.
- **RF-006:** resolver ecuaciones mediante Newton-Raphson con derivada simbólica automática.
- **RF-007:** sincronizar tabla, paso a paso y tangente con la iteración activa.
- **RF-008:** iniciar función, extremos y x₀ vacíos; los ejemplos se cargan solo por acción explícita.
- **RF-009:** mantener navegación usable entre 390 px y resoluciones de escritorio, sin scroll horizontal global.
- **RF-010:** reconstruir el procedimiento mediante reglas deterministas.
- **RF-011:** representar función, eje X, intervalo, `a`, `b`, `xₘ` y raíz en una gráfica interactiva.
- **RF-012:** navegar y reproducir las iteraciones.
- **RF-013:** cargar ejemplos polinómico, trigonométrico y exponencial.
- **RF-014:** operar sin Internet en una aplicación de escritorio Windows.
- **RF-015:** resolver ecuaciones mediante Punto Fijo con f(x) y función de iteración g(x) configurable.
- **RF-016:** calcular analíticamente g'(x) mediante math.js y analizar la condición local |g'(x₀)| y |g'(xₙ)|.
- **RF-017:** advertir si el punto fijo hallado para g(x) no anula suficientemente la ecuación original f(x)=0.
- **RF-018:** generar diagrama de telaraña (Cobweb Plot) con curva g(x), recta identidad y sincronización de pasos.
- **RF-019:** analizar una función en una capa independiente de los tres solucionadores.
- **RF-020:** obtener y renderizar la primera y segunda derivada mediante derivación sucesiva con math.js.
- **RF-021:** evaluar `f(x)` en un punto real y mostrar la sustitución matemática utilizada.
- **RF-022:** clasificar la estructura de la expresión sin afirmar propiedades simbólicas no demostradas.
- **RF-023:** informar restricciones observables asociadas a divisiones, logaritmos y radicales.
- **RF-024:** explorar un intervalo configurable mediante un número acotado de muestras compilando la expresión una sola vez.
- **RF-025:** informar valores evaluables, puntos no evaluables, mínimo observado y máximo observado dentro del intervalo explorado.
- **RF-026:** detectar cambios de signo como intervalos candidatos para Bisección y filtrar discontinuidades aparentes mediante heurísticas conservadoras.
- **RF-027:** mostrar separadamente zonas cercanas a cero que puedan corresponder a raíces pares, sin tratarlas como intervalos válidos de Bisección.
- **RF-028:** proponer valores iniciales para Newton-Raphson e indicar el fundamento numérico de cada sugerencia.
- **RF-029:** transferir `a`, `b` o `x₀` al formulario del método correspondiente sin ejecutar la resolución automáticamente.
- **RF-030:** mostrar una gráfica general de `f(x)` antes de resolver, con zoom, desplazamiento y reinicio de vista.
- **RF-031:** ofrecer un teclado científico organizado por categorías e insertar cada operación en la posición actual del cursor.
- **RF-032:** permitir `Ctrl+Enter` para resolver y `Esc` para detener la reproducción sin interferir con la escritura normal.

## Requisitos no funcionales

- TypeScript estricto; sin `eval` ni `new Function`.
- Electron con `contextIsolation`, sin `nodeIntegration` ni contenido remoto.
- math.js encapsulado; UI y documentación en español.
- Una ejecución alimenta todas las vistas; máximo duro de 1000 iteraciones.
- El muestreo científico se limita a entre 10 y 2000 puntos y reutiliza una expresión compilada.
- Interfaz utilizable desde 390 px y sin backend, telemetría, CDN o red en ejecución.
- Los resultados del explorador se describen siempre como observados, aproximados o candidatos.
- No se incorporan IA, backend, persistencia, números complejos silenciosos ni librerías matemáticas adicionales.

## Alcance futuro — GOAL-005

- Comparación académica entre métodos, manual de usuario, exportaciones útiles y pulido general de UX.
