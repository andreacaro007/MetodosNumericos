# Modelo matemático — Método de Bisección

Sea una función real `f: [a,b] → ℝ`. El método requiere continuidad en el intervalo y `f(a) · f(b) < 0`. Por el Teorema del Valor Intermedio existe al menos un `c ∈ (a,b)` tal que `f(c)=0`. La aplicación verifica evaluabilidad y signos; no afirma continuidad simbólica cuando no puede demostrarla.

## Iteración

El punto medio es `xₘ = (a + b) / 2`. Si `f(xₘ)=0`, se encontró una raíz exacta. Si `f(a)·f(xₘ)<0`, el nuevo intervalo es `[a,xₘ]`; en caso contrario es `[xₘ,b]`.

## Errores

```text
Error absoluto    Eₐ = |xₙ - xₙ₋₁|
Error relativo    Eᵣ = Eₐ / |xₙ|
Error porcentual  E% = 100 · Eᵣ
```

La primera iteración no tiene error de aproximación. Si `xₙ=0`, se omiten relativo y porcentual para evitar división por cero.

## Criterios de parada

1. `f(xₘ)=0`: raíz exacta.
2. `|f(xₘ)| < ε`: residuo menor que la tolerancia.
3. `|xₙ-xₙ₋₁| < ε`: error absoluto menor que la tolerancia.
4. `n = n_max`: máximo de iteraciones.

## Convergencia, ventajas y limitaciones

La Bisección converge linealmente y reduce el ancho a la mitad por iteración. Es robusta, determinista y no requiere derivadas. Requiere cambio de signo, puede ser lenta, no detecta raíces pares mediante signos y una discontinuidad puede imitar un cambio de signo.

# Modelo matemático — Newton-Raphson

Para resolver f(x)=0 desde una aproximación x₀ se aplica:

$$x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}$$

Geométricamente, xₙ₊₁ es la intersección con el eje X de la recta tangente y=f(xₙ)+f'(xₙ)(x-xₙ). El método requiere una función derivable en la zona recorrida, un x₀ evaluable y derivadas no nulas. Su convergencia es local y puede fallar o divergir cuando x₀ es inadecuado.

Se calculan el error absoluto |xₙ₊₁-xₙ|, el error relativo respecto de |xₙ₊₁|, el porcentaje y el residuo |f(xₙ₊₁)|. Se detiene por raíz exacta, residuo, error absoluto, máximo de iteraciones, derivada cero, derivada casi cero, valor no finito o posible divergencia.

Newton suele converger rápidamente cerca de una raíz simple, pero no garantiza convergencia global. El umbral de derivada casi cero es √Number.EPSILON, escala ligada a la resolución de doble precisión y usada para evitar divisiones numéricamente inestables.
