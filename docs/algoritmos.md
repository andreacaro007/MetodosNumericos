# Algoritmos

## Entrada y salida

Entrada: `f(x)`, extremos `a` y `b`, tolerancia positiva `ε` y entero `n_max` entre 1 y 1000. Salida: `ResultadoBiseccion` con estado, raíz, residuo, errores, razón de parada, tiempo y todas las iteraciones.

## Precondiciones

- `a < b`, parámetros finitos y `ε > 0`.
- expresión dentro de la lista controlada de símbolos, funciones y operadores.
- `f(a)` y `f(b)` reales finitos y signos opuestos, salvo raíz exacta en un extremo.

## Pseudocódigo

```text
analizar y compilar f
validar a, b, ε y n_max
evaluar fa y fb
si fa = 0 o fb = 0: devolver raíz exacta
si fa y fb tienen el mismo signo: rechazar

x_anterior ← no definido
para n desde 1 hasta n_max:
    xm ← a + (b-a)/2
    fxm ← f(xm)
    calcular errores respecto de x_anterior
    seleccionar el subintervalo que conserva el cambio de signo
    determinar criterio de parada
    guardar todos los datos de la iteración
    si debe parar: devolver solución
    actualizar intervalo y x_anterior

devolver estado MAXIMO_ITERACIONES
```

Los errores de sintaxis, símbolos, dominio, valores no finitos y parámetros se convierten en mensajes en español. `ConstructorPasosBiseccion` reconstruye fórmula, sustitución, evaluación, decisión, error y convergencia sin recalcular ni hardcodear resultados.

## Newton-Raphson

    analizar f y calcular f' con math.js
    x_actual = x0
    para n = 1 ... máximo_iteraciones:
        evaluar f(x_actual) y f'(x_actual)
        si el residuo cumple: guardar y detener
        si la derivada es cero o casi cero: guardar y detener
        siguiente_x = x_actual - f(x_actual) / f'(x_actual)
        validar finitud y dominio de siguiente_x
        calcular errores y residuo
        guardar todos los valores de la iteración
        si cumple criterio o muestra divergencia: detener
        x_actual = siguiente_x
    devolver máximo de iteraciones

SolucionadorNewton implementa el algoritmo; math.js únicamente analiza, deriva, simplifica y evalúa. ConstructorPasosNewton transforma los datos guardados en fórmulas, sustituciones, resultados y explicaciones deterministas.
