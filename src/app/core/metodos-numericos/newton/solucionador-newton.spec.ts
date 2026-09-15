import { CasoUsoResolverNewton } from '../../../aplicacion/caso-uso-resolver-newton';
import type { ParametrosNewton } from './modelos-newton';
import { UMBRAL_DERIVADA_CASI_CERO } from './solucionador-newton';

describe('SolucionadorNewton', () => {
  const casoUso = new CasoUsoResolverNewton();
  const parametros = (expresion: string, valorInicial: number, cambios: Partial<ParametrosNewton> = {}): ParametrosNewton => ({
    expresion, valorInicial, tolerancia: 1e-10, maximoIteraciones: 100, ...cambios,
  });

  it.each([
    ['x^3 - x - 2', 1.5, 1.5213797068],
    ['cos(x) - x', 0.5, 0.7390851332],
    ['exp(-x) - x', 0.5, 0.5671432904],
  ])('aproxima la raíz de %s', (expresion, inicial, esperada) => {
    const resultado = casoUso.ejecutar(parametros(expresion, inicial));
    expect(resultado.raiz).toBeCloseTo(esperada, 9);
    expect(resultado.estado).not.toBe('MAXIMO_ITERACIONES');
    expect(resultado.derivadaLatex).toBeTruthy();
  });

  it('registra y detiene una derivada cero', () => {
    const resultado = casoUso.ejecutar(parametros('x^2 + 1', 0));
    expect(resultado.estado).toBe('DERIVADA_CERO');
    expect(resultado.iteraciones).toHaveLength(1);
    expect(resultado.iteraciones[0].siguienteX).toBeUndefined();
  });

  it('detiene una derivada demasiado pequeña según el umbral documentado', () => {
    const resultado = casoUso.ejecutar(parametros('x^3 + 1', 1e-5));
    expect(resultado.estado).toBe('DERIVADA_CASI_CERO');
    expect(Math.abs(resultado.iteraciones[0].valorDerivada)).toBeLessThan(UMBRAL_DERIVADA_CASI_CERO);
  });

  it('rechaza expresiones inválidas y valores iniciales fuera del dominio', () => {
    expect(() => casoUso.ejecutar(parametros('x +', 1))).toThrow(/no es válida/i);
    expect(() => casoUso.ejecutar(parametros('sqrt(x) - 2', -1))).toThrow(/no finito/i);
  });

  it('registra el máximo de iteraciones', () => {
    const resultado = casoUso.ejecutar(parametros('x^3 - x - 2', 1.5, { tolerancia: 1e-30, maximoIteraciones: 2 }));
    expect(resultado.estado).toBe('MAXIMO_ITERACIONES');
    expect(resultado.iteraciones).toHaveLength(2);
  });

  it('interrumpe una siguiente aproximación fuera del dominio', () => {
    const resultado = casoUso.ejecutar(parametros('sqrt(x) + 1', 0.01));
    expect(resultado.estado).toBe('VALOR_NO_FINITO');
  });

  it('conserva la precisión interna de cada aproximación', () => {
    const resultado = casoUso.ejecutar(parametros('x^3 - x - 2', 1.5, { tolerancia: 1e-30, maximoIteraciones: 2 }));
    const primera = resultado.iteraciones[0];
    expect(primera.siguienteX).toBe(1.5 - (1.5 ** 3 - 1.5 - 2) / (3 * 1.5 ** 2 - 1));
    expect(resultado.iteraciones[1].xActual).toBe(primera.siguienteX);
  });
});
