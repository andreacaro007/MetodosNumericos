import { describe, expect, it } from 'vitest';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import { CasoUsoResolverNewton } from '../../aplicacion/caso-uso-resolver-newton';
import { CasoUsoResolverPuntoFijo } from '../../aplicacion/caso-uso-resolver-punto-fijo';
import { ConstructorRespuestaBiseccion, estimarIteracionesBiseccion } from './constructor-respuesta-biseccion';
import { ConstructorRespuestaNewton } from './constructor-respuesta-newton';
import { ConstructorRespuestaPuntoFijo } from './constructor-respuesta-punto-fijo';

describe('Respuestas académicas', () => {
  it('calcula 24 como cota teórica para [0,1] con tolerancia 1e-7', () => {
    expect(estimarIteracionesBiseccion(0, 1, 1e-7)?.iteraciones).toBe(24);
  });

  it('construye la aplicabilidad y conserva la parada de Bisección', () => {
    const resultado = new CasoUsoResolverBiseccion().ejecutar({
      expresion: '10*(0.5*pi - asin(x) - x*sqrt(1-x^2)) - 12.4',
      extremoIzquierdo: 0, extremoDerecho: 1, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaBiseccion().construir(resultado);
    expect(respuesta.valorA).toBeCloseTo(3.3079632679, 9);
    expect(respuesta.valorB).toBeCloseTo(-12.4, 9);
    expect(respuesta.hayCambioSigno).toBe(true);
    expect(respuesta.cotaIteraciones?.iteraciones).toBe(24);
    expect(resultado.raiz).toBeCloseTo(0.166166, 5);
    expect(respuesta.primerasIteraciones.map((iteracion) => iteracion.puntoMedio)).toEqual([0.5, 0.25, 0.125, 0.1875]);
    expect(respuesta.primerasIteraciones.map((iteracion) => [iteracion.nuevoExtremoIzquierdo, iteracion.nuevoExtremoDerecho])).toEqual([
      [0, 0.5], [0, 0.25], [0.125, 0.25], [0.125, 0.1875],
    ]);
    expect(respuesta.resultado.razonParada).toBe(resultado.razonParada);
    expect(respuesta.advertenciaContinuidad).not.toMatch(/^la función es continua/i);
  });

  it('reutiliza exactamente las primeras cuatro iteraciones calculadas', () => {
    const resultado = new CasoUsoResolverBiseccion().ejecutar({
      expresion: 'exp(-x)-x', extremoIzquierdo: 0, extremoDerecho: 1, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaBiseccion().construir(resultado);
    expect(respuesta.primerasIteraciones).toHaveLength(4);
    respuesta.primerasIteraciones.forEach((iteracion, indice) => expect(iteracion).toBe(resultado.iteraciones[indice]));
  });

  it('explica Newton con f(x₀), f\'(x₀) y el estado real', () => {
    const resultado = new CasoUsoResolverNewton().ejecutar({
      expresion: 'cos(x)-x', valorInicial: 0.5, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaNewton().construir(resultado);
    expect(respuesta.valorFuncionInicial).toBe(resultado.iteraciones[0].valorFuncion);
    expect(respuesta.valorDerivadaInicial).toBe(resultado.iteraciones[0].valorDerivada);
    expect(respuesta.resultado.estado).toBe(resultado.estado);
  });

  it('distingue una derivada inicial válida de una derivada cero posterior', () => {
    const resultado = new CasoUsoResolverNewton().ejecutar({
      expresion: 'x^2+1', valorInicial: 1, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaNewton().construir(resultado);
    expect(respuesta.valorDerivadaInicial).toBe(2);
    expect(resultado.razonParada).toBe('DERIVADA_CERO');
    expect(respuesta.interpretacion).toMatch(/pudo inicializarse correctamente/i);
    expect(respuesta.interpretacion).toMatch(/posteriormente.*derivada fue cero/i);
    expect(respuesta.interpretacion).not.toMatch(/f'\(x₀\) es cero/i);
  });

  it('diferencia los dos residuos de Punto Fijo', () => {
    const resultado = new CasoUsoResolverPuntoFijo().ejecutar({
      expresionOriginal: 'cos(x)-x', expresionIteracion: 'cos(x)', valorInicial: 0.5, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaPuntoFijo().construir(resultado);
    expect(respuesta.residuoPuntoFijo).toBe(resultado.residuoPuntoFijoFinal);
    expect(respuesta.residuoOriginal).toBe(resultado.residuoFinal);
  });

  it('no declara éxito cuando g(x) no satisface la ecuación original', () => {
    const resultado = new CasoUsoResolverPuntoFijo().ejecutar({
      expresionOriginal: 'x-2', expresionIteracion: '0.5*x', valorInicial: 1, tolerancia: 1e-7, maximoIteraciones: 100,
    });
    const respuesta = new ConstructorRespuestaPuntoFijo().construir(resultado);
    expect(respuesta.transformacionSatisfaceOriginal).toBe(false);
    expect(respuesta.conclusion).toMatch(/no satisface suficientemente/i);
  });

  it('no presenta la discontinuidad 1/x como una raíz de Bisección', () => {
    expect(() => new CasoUsoResolverBiseccion().ejecutar({
      expresion: '1/x', extremoIzquierdo: -1, extremoDerecho: 1, tolerancia: 1e-7, maximoIteraciones: 100,
    })).toThrow(/no finito|dominio/i);
  });
});
