# Manual de Métodos Numéricos

## 1. Introducción

Métodos Numéricos es una aplicación educativa de escritorio para resolver ecuaciones no lineales, estudiar cada iteración y explorar funciones reales. Todo el cálculo se realiza localmente mediante reglas deterministas; la aplicación no utiliza inteligencia artificial ni necesita conexión a Internet.

## 2. Objetivo del programa

El programa permite:

- resolver ecuaciones mediante Bisección, Newton-Raphson y Punto Fijo;
- revisar la raíz aproximada, errores, residuos y razón de parada;
- relacionar el procedimiento numérico con tablas, fórmulas y gráficas;
- analizar una función antes de elegir parámetros;
- comparar métodos que cuenten con datos suficientes;
- exportar resultados académicos en archivos Markdown.

La aplicación apoya el análisis del estudiante, pero no reemplaza la verificación de hipótesis matemáticas como continuidad, derivabilidad o equivalencia de una transformación de Punto Fijo.

## 3. Cómo ejecutar MetodosNumericos.exe

1. Ubica **MetodosNumericos.exe** en la carpeta donde fue descargado o copiado.
2. Haz doble clic en el archivo.
3. Si Windows muestra una advertencia de protección para un ejecutable sin firma comercial, revisa que el archivo provenga del proyecto y utiliza la opción de ejecución que ofrece el sistema.
4. Espera a que aparezca la ventana **Métodos Numéricos**.

El ejecutable es portable: no requiere instalación, Node.js ni permisos de administrador. Puede copiarse a otra carpeta o memoria USB. Los reportes exportados se guardan en la ubicación que gestione el navegador interno de Electron, normalmente **Descargas**.

## 4. Interfaz principal

La ventana se divide en dos áreas:

- **Panel de configuración:** método, función, parámetros numéricos, teclado científico y ejemplos.
- **Área de trabajo:** Resumen, Gráfica, Iteraciones, Paso a paso, Análisis científico y Comparación.

La interfaz conserva los datos escritos al cambiar de método para que puedas completar los parámetros de varios métodos y luego compararlos. Cambiar de método no ejecuta ningún cálculo por sí solo.

Atajos disponibles:

- **Ctrl+Enter:** resolver el método seleccionado.
- **Esc:** detener la reproducción automática de iteraciones.

## 5. Cómo escribir funciones

Escribe únicamente la expresión del lado izquierdo. Para resolver x³ - x - 2 = 0, ingresa:

~~~text
x^3 - x - 2
~~~

La variable permitida es **x**. Usa paréntesis para dejar clara la precedencia y **^** para potencias. Se acepta multiplicación explícita, como 2*x, e implícita, como 2x o 3(x+1).

No uses f(x)=, el signo igual, asignaciones, variables adicionales ni código JavaScript.

## 6. Sintaxis matemática soportada

| Entrada | Significado |
| --- | --- |
| x^2 | Potencia |
| 2*x o 2x | Multiplicación |
| sin(x) | Seno |
| cos(x) | Coseno |
| tan(x) | Tangente |
| asin(x) | Arcoseno |
| acos(x) | Arcocoseno |
| atan(x) | Arcotangente |
| sinh(x) | Seno hiperbólico |
| cosh(x) | Coseno hiperbólico |
| tanh(x) | Tangente hiperbólica |
| sec(x), csc(x), cot(x) | Funciones trigonométricas recíprocas |
| sqrt(x) | Raíz cuadrada |
| ln(x) o log(x) | Logaritmo natural |
| exp(x) | Exponencial natural |
| abs(x) | Valor absoluto |
| floor(x) | Piso |
| ceil(x) | Techo |
| pi o π | Constante π |
| e | Número de Euler |
| +, -, *, /, ^ | Operadores permitidos |

Las funciones se evalúan sobre los números reales. Por ejemplo, sqrt(x) no es evaluable para x < 0 dentro del alcance real de la aplicación.

## 7. Teclado científico

El teclado está organizado por categorías: básicas, trigonometría, especiales y operadores. Al pulsar una tecla, el texto se inserta en la posición actual del cursor. En funciones con paréntesis, el cursor queda dentro de ellos para continuar escribiendo el argumento.

En Punto Fijo puedes enfocar f(x) o g(x) antes de usar el teclado. La inserción se realiza en el campo que tenga el foco.

## 8. Configuración numérica

Los campos comunes son:

- **Tolerancia:** precisión numérica solicitada.
- **Máximo de iteraciones:** límite de seguridad para evitar ejecuciones indefinidas.

Una tolerancia de 0.000001 equivale a 10⁻⁶. En términos sencillos, el método intenta detenerse cuando el error absoluto o el residuo aplicable es menor que una millonésima. Una tolerancia más pequeña normalmente exige mayor precisión y más iteraciones, aunque el comportamiento depende del método y de la función.

El máximo de iteraciones no garantiza convergencia. Si se alcanza, la aplicación muestra el estado correspondiente y conserva la última aproximación para análisis.

## 9. Método de Bisección

Bisección requiere una función f(x), un extremo izquierdo a, un extremo derecho b, tolerancia y máximo de iteraciones.

Debe cumplirse a < b, la función debe ser evaluable en los extremos y debe existir cambio de signo: f(a)·f(b) < 0. Matemáticamente, la garantía clásica también requiere continuidad en [a,b]; la aplicación verifica valores y signos, pero no afirma continuidad simbólica universal.

Cada iteración calcula xₘ=(a+b)/2 y conserva la mitad que mantiene el cambio de signo.

## 10. Método de Newton-Raphson

Newton-Raphson requiere una función f(x), un valor inicial x₀, tolerancia y máximo de iteraciones.

La aplicación deriva f(x) simbólicamente y aplica:

~~~text
xₙ₊₁ = xₙ - f(xₙ)/f'(xₙ)
~~~

La convergencia es local: un valor inicial diferente puede producir convergencia rápida, divergencia, una derivada cercana a cero o incluso otra raíz de la misma función.

## 11. Método de Punto Fijo

Punto Fijo requiere la ecuación original escrita como f(x)=0, una transformación proporcionada por el usuario x=g(x), un valor inicial x₀, tolerancia y máximo de iteraciones.

La iteración es:

~~~text
xₙ₊₁ = g(xₙ)
~~~

La elección de g(x) afecta directamente la convergencia. La condición local |g'(x)| < 1 cerca del punto fijo es favorable, pero no constituye una garantía global universal. La aplicación distingue el residuo de punto fijo |g(x)-x| del residuo de la ecuación original |f(x)| y advierte cuando la transformación no satisface adecuadamente la ecuación original.

## 12. Análisis científico

La pestaña **Análisis científico** funciona antes o después de resolver. Presenta clasificación estructural, primera y segunda derivada, restricciones detectadas, evaluación puntual, exploración numérica y una gráfica general interactiva.

La clasificación y las restricciones se basan en la estructura de la expresión. No sustituyen un estudio simbólico completo del dominio.

## 13. Exploración de funciones

Define un límite inferior, un límite superior y una cantidad de muestras. La aplicación reporta muestras evaluables y no evaluables, mínimo y máximo observados, cambios de signo, zonas cercanas a cero y sugerencias para Newton-Raphson.

Los mínimos y máximos son observaciones de la malla, no extremos absolutos demostrados. Aumentar las muestras mejora la resolución de observación, pero no convierte el muestreo en una demostración simbólica.

## 14. Intervalos candidatos

Un intervalo candidato aparece cuando dos muestras consecutivas presentan cambio de signo. Esto es una señal útil para Bisección, pero **no significa una raíz garantizada**: una discontinuidad también puede producir un cambio de signo aparente.

Pulsa **Usar en Bisección** para transferir a y b. La transferencia no resuelve automáticamente; revisa los valores y pulsa **Resolver** cuando estés listo.

## 15. Sugerencias para Newton

Las sugerencias de x₀ priorizan muestras cercanas a cero con derivada evaluable y no cercana a cero. Son puntos iniciales razonables según la evidencia observada, pero **no garantizan convergencia**.

Pulsa **Usar como x₀ en Newton** para transferir el valor sin ejecutar el método.

## 16. Comparación entre métodos

La pestaña **Comparación** utiliza únicamente los parámetros presentes en el formulario:

- Bisección está disponible con f(x), a y b.
- Newton-Raphson está disponible con f(x) y x₀.
- Punto Fijo está disponible con f(x), g(x) y x₀.

Completa parámetros cambiando entre métodos; los valores se conservan. Luego abre **Comparación** y pulsa **Comparar métodos**. Un método sin parámetros suficientes aparece como **No disponible** y no se trata como error.

La tabla separa estado, aproximación, iteraciones, error absoluto, error relativo, residuo y razón de parada. Las observaciones describen este ejercicio y estos parámetros; nunca declaran que un método sea universalmente mejor.

Si las raíces difieren más que el margen derivado de la tolerancia, la aplicación advierte que pueden existir varias raíces o condiciones iniciales distintas.

## 17. Gráficas

La pestaña **Gráfica** muestra:

- Bisección: función, intervalo, punto medio y raíz aproximada.
- Newton-Raphson: función y recta tangente de la iteración activa.
- Punto Fijo: curva g(x), recta y=x y diagrama Cobweb.

La gráfica general del Análisis científico permite zoom y desplazamiento. Las gráficas apoyan la interpretación; los resultados numéricos proceden de los solucionadores, no de la lectura de píxeles.

## 18. Tabla de iteraciones

La pestaña **Iteraciones** conserva todos los pasos calculados. Seleccionar una fila actualiza la gráfica y el Paso a paso. Los valores internos mantienen precisión de doble punto flotante; el redondeo se aplica únicamente al mostrar datos.

En pantallas estrechas, la tabla ofrece desplazamiento horizontal interno para no generar desplazamiento horizontal en toda la ventana.

## 19. Paso a paso

El Paso a paso se genera mediante reglas programadas a partir de la iteración seleccionada. Incluye fórmula, sustitución, evaluación, decisión y criterio de parada cuando corresponde. No es texto producido por inteligencia artificial.

Usa los controles de navegación para ir a la primera, anterior, siguiente o última iteración. **Reproducir** avanza automáticamente; Esc detiene la reproducción.

## 20. Interpretación de errores

- **Error absoluto:** Eₐ = |xₙ-xₙ₋₁|. Mide la diferencia directa entre aproximaciones consecutivas.
- **Error relativo:** Eᵣ = Eₐ/|xₙ|. Relaciona el cambio con el tamaño de la aproximación actual.
- **Error porcentual:** E% = 100·Eᵣ. Expresa el error relativo como porcentaje.
- **Residuo:** |f(xₙ)|. Mide qué tan cerca está la aproximación de anular la ecuación original.

Estos conceptos no son idénticos. Un error entre iteraciones pequeño puede coexistir con un residuo no suficientemente pequeño, especialmente si una formulación es inadecuada.

## 21. Criterios de parada

Según el método, la ejecución puede terminar por raíz exacta, error absoluto, residuo, máximo de iteraciones, derivada cero o casi cero, valor no finito, punto fuera del dominio real o posible divergencia.

Lee siempre el estado y la razón de parada; una última aproximación visible no implica necesariamente que el método haya convergido.

## 22. Exportación de resultados

Después de resolver un método, pulsa **Exportar resultado (.md)** en Resumen. El reporte incluye función, configuración, resultado, tabla de iteraciones y conclusión.

Después de comparar, pulsa **Exportar comparación (.md)**. El archivo incluye la tabla comparativa y las observaciones deterministas.

Markdown es texto plano legible en Bloc de notas, Visual Studio Code, GitHub y otros editores. La exportación no requiere Internet y no modifica el manual oficial del proyecto.

## 23. Ejemplos completos

### Bisección

~~~text
f(x) = x^3 - x - 2
a = 1
b = 2
tolerancia = 0.000001
~~~

La raíz de referencia es aproximadamente 1.5213797.

### Newton-Raphson

~~~text
f(x) = x^3 - x - 2
x₀ = 1.5
tolerancia = 0.000001
~~~

La aproximación converge cerca de 1.5213797 con estos parámetros.

### Punto Fijo

~~~text
f(x) = cos(x) - x
g(x) = cos(x)
x₀ = 0.5
tolerancia = 0.000001
~~~

La aproximación converge cerca de 0.7390851. Revisa tanto |g(x)-x| como |f(x)|.

### Comparación

Para comparar Bisección y Newton en x^3-x-2, completa [1,2] en Bisección, cambia a Newton-Raphson y completa x₀=1.5. Abre Comparación y ejecuta. Punto Fijo permanecerá no disponible hasta que proporciones una g(x).

## 24. Errores y advertencias frecuentes

| Mensaje o estado | Interpretación y acción |
| --- | --- |
| Expresión no válida | Revisa operadores y paréntesis. |
| Símbolo no permitido | Usa solamente x, e o π. |
| Valor no finito o fuera del dominio real | Revisa el punto, intervalo o valor inicial. |
| No existe cambio de signo | El intervalo no cumple la condición inicial de Bisección. |
| Derivada cero o casi cero | Newton no puede realizar una división numéricamente estable en ese punto. |
| Máximo de iteraciones | No se alcanzó otro criterio dentro del límite configurado. |
| Posible divergencia | Las aproximaciones muestran crecimiento, oscilación o magnitudes problemáticas. |
| Transformación inconsistente | El punto fijo de g(x) no anula suficientemente la f(x) original. |

## 25. Limitaciones

- Trabaja con una variable real x y un conjunto controlado de funciones.
- No demuestra continuidad o derivabilidad global.
- No calcula un dominio simbólico completo.
- El muestreo puede omitir raíces o detalles entre muestras.
- Las sugerencias de Newton no garantizan convergencia.
- No genera automáticamente g(x), intervalos ni valores iniciales.
- No exporta PDF, Word o Excel.
- No incluye métodos numéricos adicionales.

## 26. Solución de problemas

**El programa no abre:** vuelve a copiar el ejecutable completo, comprueba que Windows no lo haya bloqueado y verifica espacio disponible.

**La función aparece inválida:** elimina f(x)=, revisa paréntesis y consulta la tabla de sintaxis soportada.

**Bisección no se ejecuta:** confirma a < b, evaluabilidad en ambos extremos y signos opuestos.

**Newton se detiene pronto:** prueba un x₀ matemáticamente justificado o utiliza las sugerencias del Análisis científico.

**Punto Fijo diverge:** revisa la equivalencia de x=g(x) y la condición local |g'(x)|.

**Un método no aparece en Comparación:** completa sus parámetros en el panel izquierdo; no basta con haber resuelto otro método.

**La tabla es más ancha que la pantalla:** desplázala horizontalmente dentro de su contenedor.

## 27. Preguntas frecuentes

**¿Necesito Internet?** No. El ejecutable y sus recursos funcionan offline.

**¿La aplicación usa inteligencia artificial?** No. Los algoritmos, observaciones y pasos son deterministas.

**¿Por qué dos métodos pueden producir raíces diferentes?** Una función puede tener varias raíces y los métodos responden a intervalos, transformaciones y valores iniciales diferentes.

**¿Menos iteraciones significa mejor método?** No necesariamente. También deben revisarse el estado, error, residuo, hipótesis, costo por iteración y robustez para este ejercicio.

**¿Un intervalo candidato garantiza una raíz?** No. Es evidencia numérica de un cambio de signo observado y debe verificarse junto con continuidad y dominio.

**¿Una sugerencia de Newton garantiza convergencia?** No. Es un punto razonable según el muestreo y la derivada observada.

**¿Dónde está el manual oficial?** Este archivo, **docs/manual.md**, es el único manual de uso del proyecto.
