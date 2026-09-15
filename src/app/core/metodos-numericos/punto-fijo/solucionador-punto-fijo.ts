import type { ExpresionAnalizada } from '../../matematicas/modelos-matematicos';
import { EvaluadorExpresiones } from '../../matematicas/evaluador-expresiones';
import { CalculadoraErrores } from '../compartido/calculadora-errores';
import type { EstadoConvergencia, RazonParada } from '../compartido/modelos-solucion';
import type { IteracionPuntoFijo, ParametrosPuntoFijo, ResultadoPuntoFijo } from './modelos-punto-fijo';
import { ValidadorPuntoFijo } from './validador-punto-fijo';

const LIMITE_MAGNITUD = 1e12;
const ITERACIONES_PARA_DIVERGENCIA = 4;
const FACTOR_RESIDUO_ORIGINAL = 10;

export class SolucionadorPuntoFijo {
  constructor(private readonly evaluador = new EvaluadorExpresiones(), private readonly validador = new ValidadorPuntoFijo()) {}

  resolver(parametros: ParametrosPuntoFijo, expresionOriginal: ExpresionAnalizada, expresionIteracion: ExpresionAnalizada, derivadaIteracion: ExpresionAnalizada): ResultadoPuntoFijo {
    const inicio = performance.now();
    this.validador.validar(parametros);
    const funcionOriginal = this.evaluador.compilar(expresionOriginal);
    const funcionIteracion = this.evaluador.compilar(expresionIteracion);
    const funcionDerivada = this.evaluador.compilar(derivadaIteracion);
    const iteraciones: IteracionPuntoFijo[] = [];
    let xActual = parametros.valorInicial;
    let estado: EstadoConvergencia = 'MAXIMO_ITERACIONES';
    let razonParada: RazonParada = 'MAXIMO_ITERACIONES';
    let descripcion = 'Se alcanzó el máximo de iteraciones antes de cumplir la tolerancia.';
    let aumentosConsecutivos = 0;
    let errorAnterior: number | undefined;
    let repeticionDosPasos = 0;

    for (let numero = 1; numero <= parametros.maximoIteraciones; numero += 1) {
      let siguienteX: number;
      let valorFuncionOriginal: number;
      let valorDerivadaG: number;
      try {
        siguienteX = funcionIteracion(xActual);
        valorFuncionOriginal = funcionOriginal(siguienteX);
        valorDerivadaG = funcionDerivada(xActual);
      } catch {
        estado = 'VALOR_NO_FINITO';
        razonParada = 'VALOR_NO_FINITO';
        descripcion = 'Punto Fijo encontró un valor fuera del dominio o no finito y se detuvo de forma controlada.';
        break;
      }

      const errores = CalculadoraErrores.calcular(siguienteX, xActual);
      const residuoPuntoFijo = Math.abs(siguienteX - xActual);
      const residuoFuncionOriginal = Math.abs(valorFuncionOriginal);
      const moduloDerivadaG = Math.abs(valorDerivadaG);

      if (residuoPuntoFijo < parametros.tolerancia) {
        estado = residuoPuntoFijo === 0 && residuoFuncionOriginal === 0 ? 'RAIZ_EXACTA' : 'CONVERGENCIA_ALCANZADA';
        razonParada = estado === 'RAIZ_EXACTA' ? 'RAIZ_EXACTA' : 'ERROR_ABSOLUTO';
        descripcion = estado === 'RAIZ_EXACTA' ? 'Se encontró un punto fijo exacto que satisface f(x) = 0.' : 'Convergencia alcanzada porque |g(xₙ) − xₙ| es menor que la tolerancia.';
      } else {
        if (errorAnterior !== undefined && residuoPuntoFijo > errorAnterior * 1.5) aumentosConsecutivos += 1;
        else aumentosConsecutivos = 0;
        const dosAtras = iteraciones.at(-1)?.xActual;
        if (dosAtras !== undefined && errorAnterior !== undefined && Math.abs(siguienteX - dosAtras) < parametros.tolerancia && residuoPuntoFijo >= errorAnterior * 0.99) repeticionDosPasos += 1;
        else repeticionDosPasos = 0;
        if (Math.abs(siguienteX) > LIMITE_MAGNITUD || aumentosConsecutivos >= ITERACIONES_PARA_DIVERGENCIA || repeticionDosPasos >= 2) {
          estado = 'POSIBLE_DIVERGENCIA';
          razonParada = 'POSIBLE_DIVERGENCIA';
          descripcion = repeticionDosPasos >= 2 ? 'La sucesión presenta una oscilación persistente de período dos; existe posible divergencia.' : 'La sucesión crece o se aleja de forma sostenida; existe posible divergencia.';
        }
      }

      const debeParar = estado !== 'MAXIMO_ITERACIONES' || numero === parametros.maximoIteraciones;
      iteraciones.push({ numero, xActual, valorG: siguienteX, siguienteX, valorFuncionOriginal, valorDerivadaG, moduloDerivadaG, errorAbsoluto: errores.absoluto, errorRelativo: errores.relativo, errorPorcentual: errores.porcentual, residuoPuntoFijo, residuoFuncionOriginal, razonParada: debeParar ? descripcion : undefined });
      errorAnterior = residuoPuntoFijo;
      xActual = siguienteX;
      if (debeParar) break;
    }

    if (iteraciones.length === 0) throw new Error('No fue posible iniciar la iteración. Revisa el dominio de f(x), g(x) y g\'(x).');
    const ultima = iteraciones.at(-1)!;
    const transformacionSatisfaceOriginal = ultima.residuoFuncionOriginal <= Math.max(parametros.tolerancia * FACTOR_RESIDUO_ORIGINAL, Number.EPSILON);
    const advertencias: string[] = [];
    if (iteraciones[0].moduloDerivadaG >= 1) advertencias.push('En x₀, |g\'(x₀)| ≥ 1. La condición local es desfavorable, aunque esto no demuestra divergencia global.');
    if (!transformacionSatisfaceOriginal && (estado === 'CONVERGENCIA_ALCANZADA' || estado === 'RAIZ_EXACTA')) advertencias.push('La iteración encontró un punto fijo de g(x), pero la aproximación obtenida no satisface suficientemente la ecuación original f(x)=0. Revisa la transformación utilizada para g(x).');
    if (estado !== 'CONVERGENCIA_ALCANZADA' && estado !== 'RAIZ_EXACTA') advertencias.push(descripcion);

    return {
      metodo: 'PUNTO_FIJO', estado, expresion: expresionOriginal.entradaOriginal, expresionNormalizada: expresionOriginal.expresionNormalizada,
      expresionLatex: expresionOriginal.latex, expresionIteracion: expresionIteracion.entradaOriginal,
      expresionIteracionNormalizada: expresionIteracion.expresionNormalizada, expresionIteracionLatex: expresionIteracion.latex,
      derivadaIteracionNormalizada: derivadaIteracion.expresionNormalizada, derivadaIteracionLatex: derivadaIteracion.latex,
      raiz: ultima.siguienteX, iteraciones, cantidadIteraciones: iteraciones.length, tolerancia: parametros.tolerancia,
      maximoIteraciones: parametros.maximoIteraciones, errorAbsolutoFinal: ultima.errorAbsoluto,
      errorRelativoFinal: ultima.errorRelativo, errorPorcentualFinal: ultima.errorPorcentual,
      residuoFinal: ultima.residuoFuncionOriginal, residuoPuntoFijoFinal: ultima.residuoPuntoFijo,
      moduloDerivadaInicial: iteraciones[0].moduloDerivadaG, moduloDerivadaFinal: ultima.moduloDerivadaG,
      maximoModuloDerivada: Math.max(...iteraciones.map((iteracion) => iteracion.moduloDerivadaG)),
      transformacionSatisfaceOriginal, razonParada, descripcionParada: descripcion, advertencias, errores: [],
      tiempoEjecucionMs: performance.now() - inicio,
    };
  }
}
