import { AnalizadorExpresiones } from '../../matematicas/analizador-expresiones';
import { SolucionadorBiseccion } from './solucionador-biseccion';
import type { ParametrosBiseccion } from './modelos-biseccion';

describe('SolucionadorBiseccion', () => {
  const analizador = new AnalizadorExpresiones();
  const solucionador = new SolucionadorBiseccion();
  const base = (expresion: string, extremoIzquierdo: number, extremoDerecho: number, extras: Partial<ParametrosBiseccion> = {}) => ({
    expresion, extremoIzquierdo, extremoDerecho, tolerancia: 1e-10, maximoIteraciones: 200, ...extras,
  });
  const resolver = (parametros: ParametrosBiseccion) => solucionador.resolver(parametros, analizador.analizar(parametros.expresion));

  it.each([
    ['x^3 - x - 2', 1, 2, 1.5213797068],
    ['cos(x) - x', 0, 1, 0.7390851332],
    ['exp(-x) - x', 0, 1, 0.5671432904],
  ])('aproxima la raíz de %s', (expresion, a, b, esperada) => {
    const resultado = resolver(base(expresion, a, b));
    expect(resultado.raiz).toBeCloseTo(esperada, 8);
    expect(resultado.estado).not.toBe('MAXIMO_ITERACIONES');
    expect(resultado.iteraciones.length).toBeGreaterThan(0);
  });

  it('detecta una raíz exactamente en el punto medio', () => {
    const resultado = resolver(base('x - 1', 0, 2));
    expect(resultado.raiz).toBe(1);
    expect(resultado.razonParada).toBe('RAIZ_EXACTA');
    expect(resultado.iteraciones).toHaveLength(1);
  });

  it('rechaza intervalos sin cambio de signo', () => {
    expect(() => resolver(base('x^2 + 1', -1, 1))).toThrow(/mismo signo/i);
  });

  it('rechaza extremos iguales, invertidos y tolerancia inválida', () => {
    expect(() => resolver(base('x', 1, 1))).toThrow(/iguales/i);
    expect(() => resolver(base('x', 2, 1))).toThrow(/izquierdo/i);
    expect(() => resolver(base('x', -1, 1, { tolerancia: 0 }))).toThrow(/tolerancia/i);
  });

  it('registra cuando alcanza el máximo de iteraciones', () => {
    const resultado = resolver(base('x^3 - x - 2', 1, 2, { tolerancia: 1e-30, maximoIteraciones: 2 }));
    expect(resultado.estado).toBe('MAXIMO_ITERACIONES');
    expect(resultado.razonParada).toBe('MAXIMO_ITERACIONES');
    expect(resultado.iteraciones).toHaveLength(2);
  });

  it('no redondea los valores internos', () => {
    const resultado = resolver(base('x^3 - x - 2', 1, 2, { maximoIteraciones: 3, tolerancia: 1e-30 }));
    expect(resultado.iteraciones.map((i) => i.puntoMedio)).toEqual([1.5, 1.75, 1.625]);
    expect(resultado.iteraciones[2].valorPuntoMedio).toBe(1.625 ** 3 - 1.625 - 2);
  });

  it('rechaza dominios no evaluables e iteraciones desmedidas', () => {
    expect(() => resolver(base('sqrt(x) - 1', -1, 2))).toThrow(/no finito/i);
    expect(() => resolver(base('x', -1, 1, { maximoIteraciones: 1001 }))).toThrow(/máximo permitido/i);
  });
});
