import { describe, expect, it } from 'vitest';
import { CasoUsoCompararMetodos } from './caso-uso-comparar-metodos';
import type { ConfiguracionComparacion } from '../core/comparacion/modelos-comparacion';

const base = (cambios: Partial<ConfiguracionComparacion> = {}): ConfiguracionComparacion => ({
  expresion: 'x^3 - x - 2',
  expresionIteracion: '',
  extremoIzquierdo: 1,
  extremoDerecho: 2,
  valorInicial: 1.5,
  tolerancia: 0.000001,
  maximoIteraciones: 100,
  ...cambios,
});

describe('CasoUsoCompararMetodos', () => {
  const casoUso = new CasoUsoCompararMetodos();

  it('compara Bisección y Newton cuando convergen a la misma raíz', () => {
    const resultado = casoUso.ejecutar(base());
    const biseccion = resultado.metodos.find((metodo) => metodo.metodo === 'BISECCION')!;
    const newton = resultado.metodos.find((metodo) => metodo.metodo === 'NEWTON_RAPHSON')!;
    expect(biseccion.raiz).toBeCloseTo(newton.raiz!, 5);
    expect(resultado.observaciones.join(' ')).toMatch(/compatibles/i);
  });

  it('ejecuta los tres métodos cuando todos los parámetros fueron suministrados', () => {
    const resultado = casoUso.ejecutar(base({ expresionIteracion: '(x + 2)^(1/3)' }));
    expect(resultado.metodos.every((metodo) => metodo.ejecutado)).toBe(true);
    expect(resultado.metodos.every((metodo) => metodo.raiz !== undefined)).toBe(true);
  });

  it('marca Punto Fijo como no disponible cuando falta g(x)', () => {
    const puntoFijo = casoUso.ejecutar(base()).metodos.find((metodo) => metodo.metodo === 'PUNTO_FIJO')!;
    expect(puntoFijo.ejecutado).toBe(false);
    expect(puntoFijo.descripcion).toContain('g(x)');
  });

  it('mantiene Newton ejecutable cuando el intervalo de Bisección es inválido', () => {
    const resultado = casoUso.ejecutar(base({ extremoIzquierdo: 2, extremoDerecho: 3 }));
    const biseccion = resultado.metodos.find((metodo) => metodo.metodo === 'BISECCION')!;
    const newton = resultado.metodos.find((metodo) => metodo.metodo === 'NEWTON_RAPHSON')!;
    expect(biseccion.estado).toBe('ERROR_VALIDACION');
    expect(newton.raiz).toBeCloseTo(1.5213797, 5);
  });

  it('informa cuando los métodos convergen a raíces diferentes', () => {
    const resultado = casoUso.ejecutar(
      base({ expresion: 'x^2 - 1', extremoIzquierdo: 0, extremoDerecho: 2, valorInicial: -2 })
    );
    expect(resultado.observaciones.join(' ')).toMatch(/raíces distintas/i);
  });

  it('informa cuando un método alcanza el máximo de iteraciones', () => {
    const resultado = casoUso.ejecutar(
      base({ extremoIzquierdo: null, extremoDerecho: null, maximoIteraciones: 1 })
    );
    const newton = resultado.metodos.find((metodo) => metodo.metodo === 'NEWTON_RAPHSON')!;
    expect(newton.estado).toBe('MAXIMO_ITERACIONES');
    expect(resultado.observaciones.join(' ')).toMatch(/máximo de iteraciones/i);
  });

  it('genera observaciones académicas sin declarar un método universalmente mejor', () => {
    const observaciones = casoUso.ejecutar(base()).observaciones.join(' ').toLowerCase();
    expect(observaciones).not.toContain('mejor método');
    expect(observaciones).not.toMatch(/es el mejor/);
  });
});
