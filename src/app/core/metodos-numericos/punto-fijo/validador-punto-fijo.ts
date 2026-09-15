import type { ParametrosPuntoFijo } from './modelos-punto-fijo';
import { ErrorValidacionPuntoFijo } from './modelos-punto-fijo';

export class ValidadorPuntoFijo {
  validar(parametros: ParametrosPuntoFijo): void {
    if (!Number.isFinite(parametros.valorInicial)) throw new ErrorValidacionPuntoFijo('El valor inicial x₀ debe ser un número finito.');
    if (!Number.isFinite(parametros.tolerancia) || parametros.tolerancia <= 0) throw new ErrorValidacionPuntoFijo('La tolerancia debe ser un número mayor que cero.');
    if (!Number.isInteger(parametros.maximoIteraciones) || parametros.maximoIteraciones < 1) throw new ErrorValidacionPuntoFijo('El máximo de iteraciones debe ser un entero positivo.');
    if (parametros.maximoIteraciones > 1000) throw new ErrorValidacionPuntoFijo('El máximo permitido es de 1000 iteraciones.');
  }
}
