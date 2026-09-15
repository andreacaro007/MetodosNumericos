import { CasoUsoResolverPuntoFijo } from '../../../aplicacion/caso-uso-resolver-punto-fijo';
import type { ParametrosPuntoFijo } from './modelos-punto-fijo';

describe('SolucionadorPuntoFijo', () => {
  const casoUso = new CasoUsoResolverPuntoFijo();
  const parametros = (expresionOriginal: string, expresionIteracion: string, valorInicial: number, cambios: Partial<ParametrosPuntoFijo> = {}): ParametrosPuntoFijo => ({
    expresionOriginal, expresionIteracion, valorInicial, tolerancia: 1e-10, maximoIteraciones: 200, ...cambios,
  });

  it.each([
    ['cos(x) - x', 'cos(x)', 0.5, 0.7390851332],
    ['exp(-x) - x', 'exp(-x)', 0.5, 0.5671432904],
    ['x^3 - x - 2', '(x + 2)^(1/3)', 1.5, 1.5213797068],
  ])('aproxima un punto fijo que satisface %s', (original, iteracion, inicial, esperada) => {
    const resultado = casoUso.ejecutar(parametros(original, iteracion, inicial));
    expect(resultado.raiz).toBeCloseTo(esperada, 9);
    expect(resultado.estado).toBe('CONVERGENCIA_ALCANZADA');
    expect(resultado.transformacionSatisfaceOriginal).toBe(true);
    expect(resultado.iteraciones.length).toBeGreaterThan(1);
  });

  it('registra errores, dos residuos y la derivada sin redondeo interno', () => {
    const resultado = casoUso.ejecutar(parametros('cos(x) - x', 'cos(x)', 0.5, { maximoIteraciones: 2, tolerancia: 1e-30 }));
    const primera = resultado.iteraciones[0];
    expect(primera.siguienteX).toBe(Math.cos(0.5));
    expect(resultado.iteraciones[1].xActual).toBe(primera.siguienteX);
    expect(primera.errorAbsoluto).toBe(Math.abs(Math.cos(0.5) - 0.5));
    expect(primera.residuoPuntoFijo).toBe(primera.errorAbsoluto);
    expect(primera.residuoFuncionOriginal).toBe(Math.abs(Math.cos(primera.siguienteX) - primera.siguienteX));
    expect(primera.valorDerivadaG).toBeCloseTo(-Math.sin(0.5), 14);
  });

  it('advierte cuando |g\'(x₀)| es desfavorable sin rechazar el cálculo', () => {
    const resultado = casoUso.ejecutar(parametros('x', '2*x', 0.25));
    expect(resultado.moduloDerivadaInicial).toBe(2);
    expect(resultado.advertencias.join(' ')).toMatch(/condición local es desfavorable/i);
  });

  it('detecta divergencia y oscilación persistente', () => {
    expect(casoUso.ejecutar(parametros('x', '2*x', 1)).estado).toBe('POSIBLE_DIVERGENCIA');
    expect(casoUso.ejecutar(parametros('x - 0.5', '1 - x', 0.2)).estado).toBe('POSIBLE_DIVERGENCIA');
  });

  it('rechaza valores iniciales fuera del dominio de forma controlada', () => {
    expect(() => casoUso.ejecutar(parametros('sqrt(x) - 1', 'sqrt(x)', -1))).toThrow(/dominio/i);
  });

  it('registra el máximo de iteraciones', () => {
    const resultado = casoUso.ejecutar(parametros('cos(x) - x', 'cos(x)', 0.5, { tolerancia: 1e-30, maximoIteraciones: 2 }));
    expect(resultado.estado).toBe('MAXIMO_ITERACIONES');
    expect(resultado.iteraciones).toHaveLength(2);
  });

  it('advierte si el punto fijo no satisface la ecuación original', () => {
    const resultado = casoUso.ejecutar(parametros('x - 2', '0.5*x', 1));
    expect(resultado.estado).toBe('CONVERGENCIA_ALCANZADA');
    expect(resultado.transformacionSatisfaceOriginal).toBe(false);
    expect(resultado.advertencias.join(' ')).toMatch(/revisa la transformación/i);
  });
});
