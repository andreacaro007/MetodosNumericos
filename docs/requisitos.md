# Requisitos del producto

## Alcance actual — GOAL-001

- **RF-001:** ingresar una función real de una variable `x` con sintaxis científica amigable.
- **RF-002:** visualizar la función mediante notación matemática.
- **RF-003:** configurar extremos, tolerancia y máximo de iteraciones.
- **RF-004:** validar parámetros, evaluabilidad y cambio de signo.
- **RF-005:** resolver ecuaciones mediante Bisección.
- **RF-006:** resolver ecuaciones mediante Newton-Raphson con derivada simbólica automática.
- **RF-007:** sincronizar tabla, paso a paso y tangente con la iteración activa.
- **RF-008:** iniciar función, extremos y x₀ vacíos; los ejemplos se cargan solo por acción explícita.
- **RF-009:** mantener navegación usable entre 390 px y resoluciones de escritorio, sin scroll horizontal global.
- **RF-006:** mostrar raíz, estado, residuo, errores e intervalo final.
- **RF-007:** conservar todas las iteraciones sin redondeo interno.
- **RF-008:** seleccionar una iteración en una tabla profesional.
- **RF-009:** sincronizar iteración, gráfica y explicación.
- **RF-010:** reconstruir el procedimiento mediante reglas deterministas.
- **RF-011:** representar función, eje X, intervalo, `a`, `b`, `xₘ` y raíz en una gráfica interactiva.
- **RF-012:** navegar y reproducir las iteraciones.
- **RF-013:** cargar ejemplos polinómico, trigonométrico y exponencial.
- **RF-014:** operar sin Internet en una aplicación de escritorio Windows.

## Requisitos no funcionales

- TypeScript estricto; sin `eval` ni `new Function`.
- Electron con `contextIsolation`, sin `nodeIntegration` ni contenido remoto.
- math.js encapsulado; UI y documentación en español.
- Una ejecución alimenta todas las vistas; máximo duro de 1000 iteraciones.
- Interfaz utilizable desde 390 px y sin backend, telemetría, CDN o red en ejecución.

## Requisitos futuros

- Newton-Raphson con derivación simbólica y visualización de tangentes.
- Punto Fijo con análisis de convergencia.
- Teclado científico ampliado, exportaciones y manual de usuario.

GOAL-002 incorpora Newton-Raphson, derivación simbólica, visualización de tangentes y responsive real. Punto Fijo, backend, usuarios, IA, nube, PDF y Excel permanecen fuera del alcance.
