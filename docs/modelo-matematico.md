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
