import type { ExpresionAnalizada } from '../../matematicas/modelos-matematicos';
import { EvaluadorExpresiones } from '../../matematicas/evaluador-expresiones';
import { CalculadoraErrores } from '../compartido/calculadora-errores';
import type { EstadoConvergencia, RazonParada } from '../compartido/modelos-solucion';
import type { IteracionNewton, ParametrosNewton, ResultadoNewton } from './modelos-newton';
import { ValidadorNewton } from './validador-newton';

export const UMBRAL_DERIVADA_CASI_CERO = Math.sqrt(Number.EPSILON);
const LIMITE_MAGNITUD = 1e12;

export class SolucionadorNewton {
  constructor(private readonly evaluador = new EvaluadorExpresiones(), private readonly validador = new ValidadorNewton()) {}

  resolver(parametros: ParametrosNewton, expresion: ExpresionAnalizada, derivada: ExpresionAnalizada): ResultadoNewton {
    const inicio = performance.now();
    this.validador.validar(parametros);
    const funcion = this.evaluador.compilar(expresion);
    const funcionDerivada = this.evaluador.compilar(derivada);
    const iteraciones: IteracionNewton[] = [];
    let xActual = parametros.valorInicial;
    let estado: EstadoConvergencia = 'MAXIMO_ITERACIONES';
    let razonParada: RazonParada = 'MAXIMO_ITERACIONES';
    let descripcion = 'Se alcanzó el máximo de iteraciones antes de cumplir la tolerancia.';
    let errorAnterior: number | undefined;
    let aumentosConsecutivos = 0;

    for (let numero = 1; numero <= parametros.maximoIteraciones; numero += 1) {
      const valorFuncion = funcion(xActual);
      const valorDerivada = funcionDerivada(xActual);
      if (Math.abs(valorFuncion) < parametros.tolerancia) {
        estado = valorFuncion === 0 ? 'RAIZ_EXACTA' : 'CONVERGENCIA_ALCANZADA';
        razonParada = valorFuncion === 0 ? 'RAIZ_EXACTA' : 'RESIDUO';
        descripcion = valorFuncion === 0 ? 'Se encontró una raíz exacta porque f(xₙ) = 0.' : 'Convergencia alcanzada porque el residuo |f(xₙ)| es menor que la tolerancia.';
        iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, residuo: Math.abs(valorFuncion), razonParada: descripcion });
        break;
      }
      if (valorDerivada === 0) {
        estado = 'DERIVADA_CERO'; razonParada = 'DERIVADA_CERO';
        descripcion = 'No se puede continuar con Newton-Raphson porque la derivada es cero en la aproximación actual.';
        iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, residuo: Math.abs(valorFuncion), razonParada: descripcion });
        break;
      }
      if (Math.abs(valorDerivada) < UMBRAL_DERIVADA_CASI_CERO) {
        estado = 'DERIVADA_CASI_CERO'; razonParada = 'DERIVADA_CASI_CERO';
        descripcion = 'Newton-Raphson se detuvo porque la derivada es demasiado cercana a cero y el cociente sería numéricamente inestable.';
        iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, residuo: Math.abs(valorFuncion), razonParada: descripcion });
        break;
      }
      const cocienteNewton = valorFuncion / valorDerivada;
      const siguienteX = xActual - cocienteNewton;
      if (!Number.isFinite(cocienteNewton) || !Number.isFinite(siguienteX)) {
        estado = 'VALOR_NO_FINITO'; razonParada = 'VALOR_NO_FINITO';
        descripcion = 'Newton-Raphson produjo un valor no finito y se detuvo de forma controlada.';
        iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, cocienteNewton, siguienteX, residuo: Math.abs(valorFuncion), razonParada: descripcion });
        break;
      }
      let valorFuncionSiguiente: number;
      try { valorFuncionSiguiente = funcion(siguienteX); } catch {
        estado = 'VALOR_NO_FINITO'; razonParada = 'VALOR_NO_FINITO';
        descripcion = 'La siguiente aproximación queda fuera del dominio evaluable de la función.';
        iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, cocienteNewton, siguienteX, residuo: Math.abs(valorFuncion), razonParada: descripcion });
        break;
      }
      const errores = CalculadoraErrores.calcular(siguienteX, xActual);
      const residuo = Math.abs(valorFuncionSiguiente);
      if (errorAnterior !== undefined && errores.absoluto !== undefined && errores.absoluto > errorAnterior * 8) aumentosConsecutivos += 1;
      else aumentosConsecutivos = 0;
      errorAnterior = errores.absoluto;
      if (residuo < parametros.tolerancia) {
        estado = valorFuncionSiguiente === 0 ? 'RAIZ_EXACTA' : 'CONVERGENCIA_ALCANZADA';
        razonParada = valorFuncionSiguiente === 0 ? 'RAIZ_EXACTA' : 'RESIDUO';
        descripcion = valorFuncionSiguiente === 0 ? 'Se encontró una raíz exacta porque f(xₙ₊₁) = 0.' : 'Convergencia alcanzada porque el residuo |f(xₙ₊₁)| es menor que la tolerancia.';
      } else if (errores.absoluto !== undefined && errores.absoluto < parametros.tolerancia) {
        estado = 'CONVERGENCIA_ALCANZADA'; razonParada = 'ERROR_ABSOLUTO';
        descripcion = 'Convergencia alcanzada porque el error absoluto es menor que la tolerancia.';
      } else if (Math.abs(siguienteX) > LIMITE_MAGNITUD || aumentosConsecutivos >= 3) {
        estado = 'POSIBLE_DIVERGENCIA'; razonParada = 'POSIBLE_DIVERGENCIA';
        descripcion = 'La sucesión presenta saltos crecientes o una magnitud extrema; existe posible divergencia.';
      }
      const debeParar = estado !== 'MAXIMO_ITERACIONES' || numero === parametros.maximoIteraciones;
      iteraciones.push({ numero, xActual, valorFuncion, valorDerivada, cocienteNewton, siguienteX, valorFuncionSiguiente, errorAbsoluto: errores.absoluto, errorRelativo: errores.relativo, errorPorcentual: errores.porcentual, residuo, razonParada: debeParar ? descripcion : undefined });
      xActual = siguienteX;
      if (debeParar) break;
    }
    const ultima = iteraciones.at(-1)!;
    return {
      metodo: 'NEWTON_RAPHSON', estado, expresion: expresion.entradaOriginal, expresionNormalizada: expresion.expresionNormalizada,
      expresionLatex: expresion.latex, derivadaNormalizada: derivada.expresionNormalizada, derivadaLatex: derivada.latex,
      umbralDerivada: UMBRAL_DERIVADA_CASI_CERO, raiz: ultima.siguienteX ?? ultima.xActual, iteraciones,
      cantidadIteraciones: iteraciones.length, tolerancia: parametros.tolerancia, maximoIteraciones: parametros.maximoIteraciones,
      errorAbsolutoFinal: ultima.errorAbsoluto, errorRelativoFinal: ultima.errorRelativo, errorPorcentualFinal: ultima.errorPorcentual,
      residuoFinal: ultima.residuo, razonParada, descripcionParada: descripcion,
      advertencias: estado === 'CONVERGENCIA_ALCANZADA' || estado === 'RAIZ_EXACTA' ? [] : [descripcion], errores: [],
      tiempoEjecucionMs: performance.now() - inicio,
    };
  }
}
