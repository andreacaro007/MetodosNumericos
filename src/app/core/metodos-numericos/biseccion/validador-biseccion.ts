import type { ParametrosBiseccion } from './modelos-biseccion';
import { ErrorValidacionBiseccion } from './modelos-biseccion';

export class ValidadorBiseccion {
  static readonly LIMITE_DURO_ITERACIONES = 1000;

  validar(parametros: ParametrosBiseccion): void {
    const { extremoIzquierdo: a, extremoDerecho: b, tolerancia, maximoIteraciones } = parametros;
    if (![a, b, tolerancia, maximoIteraciones].every(Number.isFinite)) {
      throw new ErrorValidacionBiseccion('Todos los parámetros numéricos deben contener valores finitos.');
    }
    if (a === b) throw new ErrorValidacionBiseccion('Los extremos del intervalo no pueden ser iguales.');
    if (a > b) throw new ErrorValidacionBiseccion('El extremo izquierdo debe ser menor que el extremo derecho.');
    if (tolerancia <= 0) throw new ErrorValidacionBiseccion('La tolerancia debe ser mayor que cero.');
    if (!Number.isInteger(maximoIteraciones) || maximoIteraciones < 1) {
      throw new ErrorValidacionBiseccion('El máximo de iteraciones debe ser un número entero positivo.');
    }
    if (maximoIteraciones > ValidadorBiseccion.LIMITE_DURO_ITERACIONES) {
      throw new ErrorValidacionBiseccion(`El máximo permitido es ${ValidadorBiseccion.LIMITE_DURO_ITERACIONES} iteraciones.`);
    }
  }

  validarCambioDeSigno(valorA: number, valorB: number): void {
    if (valorA === 0 || valorB === 0) return;
    if (Math.sign(valorA) === Math.sign(valorB)) {
      throw new ErrorValidacionBiseccion('No se puede aplicar Bisección: f(a) y f(b) tienen el mismo signo. Selecciona otro intervalo.');
    }
  }
}
