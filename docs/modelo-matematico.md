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

# Modelo matemático — Método de Punto Fijo

Para resolver una ecuación original:

$$f(x)=0$$

se transforma algebraicamente en una forma equivalente de punto fijo:

$$x=g(x)$$

Un valor $\alpha$ es punto fijo de $g$ si y solo si $g(\alpha)=\alpha$. Si la transformación es equivalente en el dominio de interés, $\alpha$ es raíz de $f(x)=0$.

## Iteración

Dada una aproximación inicial $x_0$, el método genera la sucesión:

$$x_{n+1}=g(x_n)$$

## Convergencia y condición local

Por el Teorema del Punto Fijo de Banach, si $g$ es continuamente derivable en un entorno que contiene al punto fijo y:

$$|g'(\alpha)| < 1$$

entonces la iteración converge localmente hacia $\alpha$. En la aplicación se evalúa $g'(x)$ simbólicamente mediante `DerivadorExpresiones` y se registra:

- $|g'(x_0)|$: condición inicial favorable si es menor que 1, o desfavorable con advertencia si es mayor o igual que 1.
- $|g'(x_n)|$: seguimiento local en cada paso para observar si la iteración transita por zonas contractivas o expansivas.

No se presenta $|g'(x_0)| < 1$ como una garantía global universal.

## Diferenciación fundamental de residuos

La aplicación distingue formalmente dos conceptos:

1. **Residuo de punto fijo**: $|g(x_n) - x_n|$, que mide qué tan cerca está $x_n$ de ser invariante bajo $g$.
2. **Residuo de la ecuación original**: $|f(x_{n+1})|$, que evalúa si la aproximación encontrada realmente anula la función original $f(x)$.

Si la sucesión converge a un punto fijo de $g(x)$ pero $|f(x^*)|$ no es pequeño, la aplicación emite una advertencia explícita indicando que la transformación $g(x)$ no es matemáticamente consistente con $f(x)=0$.

## Criterios de parada y divergencia

Punto Fijo se detiene por:
- Raíz exacta cuando el residuo de punto fijo y el de la función original son cero.
- Tolerancia alcanzada sobre $|g(x_n) - x_n| < \varepsilon$.
- Máximo de iteraciones alcanzado.
- Valor no finito si $g(x_n)$, $g'(x_n)$ o $f(x_n)$ caen fuera del dominio.
- Posible divergencia ante crecimiento sostenido de errores, magnitudes extremas o ciclos oscilatorios persistentes.

# Modelo matemático — Método de Punto Fijo

Para resolver una ecuación original:

$$f(x)=0$$

se transforma algebraicamente en una forma equivalente de punto fijo:

$$x=g(x)$$

Un valor $\alpha$ es punto fijo de $g$ si y solo si $g(\alpha)=\alpha$. Si la transformación es equivalente en el dominio de interés, $\alpha$ es raíz de $f(x)=0$.

## Iteración

Dada una aproximación inicial $x_0$, el método genera la sucesión:

$$x_{n+1}=g(x_n)$$

## Convergencia y condición local

Por el Teorema del Punto Fijo de Banach, si $g$ es continuamente derivable en un entorno que contiene al punto fijo y:

$$|g'(\alpha)| < 1$$

entonces la iteración converge localmente hacia $\alpha$. En la aplicación se evalúa $g'(x)$ simbólicamente mediante `DerivadorExpresiones` y se registra:

- $|g'(x_0)|$: condición inicial favorable si es menor que 1, o desfavorable con advertencia si es mayor o igual que 1.
- $|g'(x_n)|$: seguimiento local en cada paso para observar si la iteración transita por zonas contractivas o expansivas.

No se presenta $|g'(x_0)| < 1$ como una garantía global universal.

## Diferenciación fundamental de residuos

La aplicación distingue formalmente dos conceptos:

1. **Residuo de punto fijo**: $|g(x_n) - x_n|$, que mide qué tan cerca está $x_n$ de ser invariante bajo $g$.
2. **Residuo de la ecuación original**: $|f(x_{n+1})|$, que evalúa si la aproximación encontrada realmente anula la función original $f(x)$.

Si la sucesión converge a un punto fijo de $g(x)$ pero $|f(x^*)|$ no es pequeño, la aplicación emite una advertencia explícita indicando que la transformación $g(x)$ no es matemáticamente consistente con $f(x)=0$.

## Criterios de parada y divergencia

Punto Fijo se detiene por:
- Raíz exacta cuando el residuo de punto fijo y el de la función original son cero.
- Tolerancia alcanzada sobre $|g(x_n) - x_n| < \varepsilon$.
- Máximo de iteraciones alcanzado.
- Valor no finito si $g(x_n)$, $g'(x_n)$ o $f(x_n)$ caen fuera del dominio.
- Posible divergencia ante crecimiento sostenido de errores, magnitudes extremas o ciclos oscilatorios persistentes.

# Modelo matemático — Método de Punto Fijo

Para resolver una ecuación original:

$$f(x)=0$$

se transforma algebraicamente en una forma equivalente de punto fijo:

$$x=g(x)$$

Un valor $\alpha$ es punto fijo de $g$ si y solo si $g(\alpha)=\alpha$. Si la transformación es equivalente en el dominio de interés, $\alpha$ es raíz de $f(x)=0$.

## Iteración

Dada una aproximación inicial $x_0$, el método genera la sucesión:

$$x_{n+1}=g(x_n)$$

## Convergencia y condición local

Por el Teorema del Punto Fijo de Banach, si $g$ es continuamente derivable en un entorno que contiene al punto fijo y:

$$|g'(\alpha)| < 1$$

entonces la iteración converge localmente hacia $\alpha$. En la aplicación se evalúa $g'(x)$ simbólicamente mediante `DerivadorExpresiones` y se registra:

- $|g'(x_0)|$: condición inicial favorable si es menor que 1, o desfavorable con advertencia si es mayor o igual que 1.
- $|g'(x_n)|$: seguimiento local en cada paso para observar si la iteración transita por zonas contractivas o expansivas.

No se presenta $|g'(x_0)| < 1$ como una garantía global universal.

## Diferenciación fundamental de residuos

La aplicación distingue formalmente dos conceptos:

1. **Residuo de punto fijo**: $|g(x_n) - x_n|$, que mide qué tan cerca está $x_n$ de ser invariante bajo $g$.
2. **Residuo de la ecuación original**: $|f(x_{n+1})|$, que evalúa si la aproximación encontrada realmente anula la función original $f(x)$.

Si la sucesión converge a un punto fijo de $g(x)$ pero $|f(x^*)|$ no es pequeño, la aplicación emite una advertencia explícita indicando que la transformación $g(x)$ no es matemáticamente consistente con $f(x)=0$.

## Criterios de parada y divergencia

Punto Fijo se detiene por:
- Raíz exacta cuando el residuo de punto fijo y el de la función original son cero.
- Tolerancia alcanzada sobre $|g(x_n) - x_n| < \varepsilon$.
- Máximo de iteraciones alcanzado.
- Valor no finito si $g(x_n)$, $g'(x_n)$ o $f(x_n)$ caen fuera del dominio.
- Posible divergencia ante crecimiento sostenido de errores, magnitudes extremas o ciclos oscilatorios persistentes.

# Modelo matemático — Método de Punto Fijo

Para resolver una ecuación original:

$$f(x)=0$$

se transforma algebraicamente en una forma equivalente de punto fijo:

$$x=g(x)$$

Un valor $\alpha$ es punto fijo de $g$ si y solo si $g(\alpha)=\alpha$. Si la transformación es equivalente en el dominio de interés, $\alpha$ es raíz de $f(x)=0$.

## Iteración

Dada una aproximación inicial $x_0$, el método genera la sucesión:

$$x_{n+1}=g(x_n)$$

## Convergencia y condición local

Por el Teorema del Punto Fijo de Banach, si $g$ es continuamente derivable en un entorno que contiene al punto fijo y:

$$|g'(\alpha)| < 1$$

entonces la iteración converge localmente hacia $\alpha$. En la aplicación se evalúa $g'(x)$ simbólicamente mediante `DerivadorExpresiones` y se registra:

- $|g'(x_0)|$: condición inicial favorable si es menor que 1, o desfavorable con advertencia si es mayor o igual que 1.
- $|g'(x_n)|$: seguimiento local en cada paso para observar si la iteración transita por zonas contractivas o expansivas.

No se presenta $|g'(x_0)| < 1$ como una garantía global universal.

## Diferenciación fundamental de residuos

La aplicación distingue formalmente dos conceptos:

1. **Residuo de punto fijo**: $|g(x_n) - x_n|$, que mide qué tan cerca está $x_n$ de ser invariante bajo $g$.
2. **Residuo de la ecuación original**: $|f(x_{n+1})|$, que evalúa si la aproximación encontrada realmente anula la función original $f(x)$.

Si la sucesión converge a un punto fijo de $g(x)$ pero $|f(x^*)|$ no es pequeño, la aplicación emite una advertencia explícita indicando que la transformación $g(x)$ no es matemáticamente consistente con $f(x)=0$.

## Criterios de parada y divergencia

Punto Fijo se detiene por:
- Raíz exacta cuando el residuo de punto fijo y el de la función original son cero.
- Tolerancia alcanzada sobre $|g(x_n) - x_n| < \varepsilon$.
- Máximo de iteraciones alcanzado.
- Valor no finito si $g(x_n)$, $g'(x_n)$ o $f(x_n)$ caen fuera del dominio.
- Posible divergencia ante crecimiento sostenido de errores, magnitudes extremas o ciclos oscilatorios persistentes.

# Modelo matemático — Método de Punto Fijo

Para resolver una ecuación original:

$$f(x)=0$$

se transforma algebraicamente en una forma equivalente de punto fijo:

$$x=g(x)$$

Un valor $\alpha$ es punto fijo de $g$ si y solo si $g(\alpha)=\alpha$. Si la transformación es equivalente en el dominio de interés, $\alpha$ es raíz de $f(x)=0$.

## Iteración

Dada una aproximación inicial $x_0$, el método genera la sucesión:

$$x_{n+1}=g(x_n)$$

## Convergencia y condición local

Por el Teorema del Punto Fijo de Banach, si $g$ es continuamente derivable en un entorno que contiene al punto fijo y:

$$|g'(\alpha)| < 1$$

entonces la iteración converge localmente hacia $\alpha$. En la aplicación se evalúa $g'(x)$ simbólicamente mediante `DerivadorExpresiones` y se registra:

- $|g'(x_0)|$: condición inicial favorable si es menor que 1, o desfavorable con advertencia si es mayor o igual que 1.
- $|g'(x_n)|$: seguimiento local en cada paso para observar si la iteración transita por zonas contractivas o expansivas.

No se presenta $|g'(x_0)| < 1$ como una garantía global universal.

## Diferenciación fundamental de residuos

La aplicación distingue formalmente dos conceptos:

1. **Residuo de punto fijo**: $|g(x_n) - x_n|$, que mide qué tan cerca está $x_n$ de ser invariante bajo $g$.
2. **Residuo de la ecuación original**: $|f(x_{n+1})|$, que evalúa si la aproximación encontrada realmente anula la función original $f(x)$.

Si la sucesión converge a un punto fijo de $g(x)$ pero $|f(x^*)|$ no es pequeño, la aplicación emite una advertencia explícita indicando que la transformación $g(x)$ no es matemáticamente consistente con $f(x)=0$.

## Criterios de parada y divergencia

Punto Fijo se detiene por:
- Raíz exacta cuando el residuo de punto fijo y el de la función original son cero.
- Tolerancia alcanzada sobre $|g(x_n) - x_n| < \varepsilon$.
- Máximo de iteraciones alcanzado.
- Valor no finito si $g(x_n)$, $g'(x_n)$ o $f(x_n)$ caen fuera del dominio.
- Posible divergencia ante crecimiento sostenido de errores, magnitudes extremas o ciclos oscilatorios persistentes.
