import type { ParametrosNewton } from './modelos-newton';
import { ErrorValidacionNewton } from './modelos-newton';

export class ValidadorNewton {
  validar(parametros: ParametrosNewton): void {
    if (!Number.isFinite(parametros.valorInicial)) throw new ErrorValidacionNewton('El valor inicial x₀ debe ser un número finito.');
    if (!Number.isFinite(parametros.tolerancia) || parametros.tolerancia <= 0) throw new ErrorValidacionNewton('La tolerancia debe ser un número mayor que cero.');
    if (!Number.isInteger(parametros.maximoIteraciones) || parametros.maximoIteraciones < 1) throw new ErrorValidacionNewton('El máximo de iteraciones debe ser un entero positivo.');
    if (parametros.maximoIteraciones > 1000) throw new ErrorValidacionNewton('El máximo permitido es de 1000 iteraciones.');
  }
}
