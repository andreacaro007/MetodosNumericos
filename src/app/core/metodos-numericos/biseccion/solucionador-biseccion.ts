import type { ExpresionAnalizada } from '../../matematicas/modelos-matematicos';
import { EvaluadorExpresiones } from '../../matematicas/evaluador-expresiones';
import { CalculadoraErrores } from '../compartido/calculadora-errores';
import type { EstadoConvergencia, RazonParada } from '../compartido/modelos-solucion';
import type { IteracionBiseccion, ParametrosBiseccion, ResultadoBiseccion } from './modelos-biseccion';
import { ValidadorBiseccion } from './validador-biseccion';

export class SolucionadorBiseccion {
  constructor(
    private readonly evaluador = new EvaluadorExpresiones(),
    private readonly validador = new ValidadorBiseccion(),
  ) {}

  resolver(parametros: ParametrosBiseccion, expresion: ExpresionAnalizada): ResultadoBiseccion {
    const inicio = performance.now();
    this.validador.validar(parametros);
    const funcion = this.evaluador.compilar(expresion);
    let a = parametros.extremoIzquierdo;
    let b = parametros.extremoDerecho;
    let valorA = funcion(a);
    let valorB = funcion(b);
    this.validador.validarCambioDeSigno(valorA, valorB);

    if (valorA === 0) return this.resultadoEnExtremo(parametros, expresion, a, inicio, 'izquierdo');
    if (valorB === 0) return this.resultadoEnExtremo(parametros, expresion, b, inicio, 'derecho');

    const iteraciones: IteracionBiseccion[] = [];
    let puntoAnterior: number | undefined;
    let razonParada: RazonParada = 'MAXIMO_ITERACIONES';
    let estado: EstadoConvergencia = 'MAXIMO_ITERACIONES';
    let descripcion = 'Se alcanzó el máximo de iteraciones antes de cumplir la tolerancia.';

    for (let numero = 1; numero <= parametros.maximoIteraciones; numero += 1) {
      const puntoMedio = a + (b - a) / 2;
      const valorPuntoMedio = funcion(puntoMedio);
      const errores = CalculadoraErrores.calcular(puntoMedio, puntoAnterior);
      const productoSignos = valorA * valorPuntoMedio;
      let decision: IteracionBiseccion['decision'];
      let nuevoA = a;
      let nuevoB = b;

      if (valorPuntoMedio === 0) {
        decision = 'RAIZ_ENCONTRADA';
      } else if (Math.sign(valorA) !== Math.sign(valorPuntoMedio)) {
        decision = 'INTERVALO_IZQUIERDO';
        nuevoB = puntoMedio;
      } else {
        decision = 'INTERVALO_DERECHO';
        nuevoA = puntoMedio;
      }

      if (valorPuntoMedio === 0) {
        razonParada = 'RAIZ_EXACTA';
        estado = 'RAIZ_EXACTA';
        descripcion = 'Se encontró una raíz exacta porque f(xₘ) = 0.';
      } else if (Math.abs(valorPuntoMedio) < parametros.tolerancia) {
        razonParada = 'RESIDUO';
        estado = 'CONVERGENCIA_ALCANZADA';
        descripcion = 'Convergencia alcanzada porque el residuo |f(xₘ)| es menor que la tolerancia.';
      } else if (errores.absoluto !== undefined && errores.absoluto < parametros.tolerancia) {
        razonParada = 'ERROR_ABSOLUTO';
        estado = 'CONVERGENCIA_ALCANZADA';
        descripcion = 'Convergencia alcanzada porque el error absoluto es menor que la tolerancia.';
      }

      const debeParar = estado !== 'MAXIMO_ITERACIONES' || numero === parametros.maximoIteraciones;
      iteraciones.push({
        numero,
        extremoIzquierdo: a,
        extremoDerecho: b,
        valorExtremoIzquierdo: valorA,
        valorExtremoDerecho: valorB,
        puntoMedio,
        valorPuntoMedio,
        productoSignos,
        nuevoExtremoIzquierdo: nuevoA,
        nuevoExtremoDerecho: nuevoB,
        errorAbsoluto: errores.absoluto,
        errorRelativo: errores.relativo,
        errorPorcentual: errores.porcentual,
        decision,
        razonParada: debeParar ? descripcion : undefined,
      });

      if (debeParar) break;
      if (decision === 'INTERVALO_IZQUIERDO') {
        b = puntoMedio;
        valorB = valorPuntoMedio;
      } else {
        a = puntoMedio;
        valorA = valorPuntoMedio;
      }
      puntoAnterior = puntoMedio;
    }

    const ultima = iteraciones.at(-1)!;
    return {
      metodo: 'BISECCION', estado,
      expresion: expresion.entradaOriginal,
      expresionNormalizada: expresion.expresionNormalizada,
      expresionLatex: expresion.latex,
      raiz: ultima.puntoMedio,
      iteraciones,
      cantidadIteraciones: iteraciones.length,
      tolerancia: parametros.tolerancia,
      maximoIteraciones: parametros.maximoIteraciones,
      errorAbsolutoFinal: ultima.errorAbsoluto,
      errorRelativoFinal: ultima.errorRelativo,
      errorPorcentualFinal: ultima.errorPorcentual,
      residuoFinal: Math.abs(ultima.valorPuntoMedio),
      razonParada,
      descripcionParada: descripcion,
      advertencias: estado === 'MAXIMO_ITERACIONES' ? [descripcion] : [],
      errores: [],
      tiempoEjecucionMs: performance.now() - inicio,
    };
  }

  private resultadoEnExtremo(
    parametros: ParametrosBiseccion,
    expresion: ExpresionAnalizada,
    raiz: number,
    inicio: number,
    extremo: 'izquierdo' | 'derecho',
  ): ResultadoBiseccion {
    const descripcion = `Se encontró una raíz exacta en el extremo ${extremo} del intervalo.`;
    return {
      metodo: 'BISECCION', estado: 'RAIZ_EXACTA', expresion: expresion.entradaOriginal,
      expresionNormalizada: expresion.expresionNormalizada, expresionLatex: expresion.latex,
      raiz, iteraciones: [], cantidadIteraciones: 0, tolerancia: parametros.tolerancia,
      maximoIteraciones: parametros.maximoIteraciones, residuoFinal: 0,
      razonParada: 'RAIZ_EXACTA', descripcionParada: descripcion,
      advertencias: [], errores: [], tiempoEjecucionMs: performance.now() - inicio,
    };
  }
}
