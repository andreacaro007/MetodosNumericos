import { describe, expect, it } from 'vitest';
import { CasoUsoCompararMetodos } from './caso-uso-comparar-metodos';
import { CasoUsoResolverNewton } from './caso-uso-resolver-newton';
import { GeneradorReporteMarkdown } from './generador-reporte-markdown';

describe('GeneradorReporteMarkdown', () => {
  const generador = new GeneradorReporteMarkdown();

  it('genera un reporte de resolución con configuración, resultado e iteraciones', () => {
    const resultado = new CasoUsoResolverNewton().ejecutar({
      expresion: 'x^3 - x - 2',
      valorInicial: 1.5,
      tolerancia: 0.000001,
      maximoIteraciones: 100,
    });
    const markdown = generador.generarResultado(resultado);
    expect(markdown).toContain('# Resolución — Métodos Numéricos');
    expect(markdown).toContain('f(x) = x ^ 3 - x - 2');
    expect(markdown).toContain('Método: Newton-Raphson');
    expect(markdown).toContain('Valor inicial x₀: 1.5');
    expect(markdown).toContain('Raíz aproximada:');
    expect(markdown).toContain('| n | xₙ |');
    expect(markdown).toContain('## Conclusión');
    expect(markdown).not.toContain('undefined');
    expect(markdown).not.toContain('NaN');
  });

  it('genera una comparación con tabla y observaciones sin valores no controlados', () => {
    const comparacion = new CasoUsoCompararMetodos().ejecutar({
      expresion: 'x^3 - x - 2',
      expresionIteracion: '',
      extremoIzquierdo: 1,
      extremoDerecho: 2,
      valorInicial: 1.5,
      tolerancia: 0.000001,
      maximoIteraciones: 100,
    });
    comparacion.metodos[0].raiz = Number.NaN;
    const markdown = generador.generarComparacion(comparacion);
    expect(markdown).toContain('# Comparación de métodos');
    expect(markdown).toContain('## Función');
    expect(markdown).toContain('| Método | Estado | Raíz | Iteraciones | Error absoluto | Residuo |');
    expect(markdown).toContain('## Observaciones');
    expect(markdown).toContain('No disponible');
    expect(markdown).not.toContain('undefined');
    expect(markdown).not.toContain('NaN');
  });
});
