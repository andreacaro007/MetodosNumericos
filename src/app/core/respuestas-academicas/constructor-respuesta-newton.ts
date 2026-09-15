import type { ResultadoNewton } from '../metodos-numericos/newton/modelos-newton';
import type { RespuestaAcademicaNewton } from './modelos-respuesta-academica';

export class ConstructorRespuestaNewton {
  construir(resultado: ResultadoNewton): RespuestaAcademicaNewton {
    const primera = resultado.iteraciones[0];
    let interpretacion = 'No hay una iteración inicial disponible para evaluar las condiciones de inicio.';
    if (primera) {
      if (resultado.estado === 'DERIVADA_CERO') {
        interpretacion = 'f\'(x₀) es cero; Newton-Raphson no puede construir el siguiente paso y se detuvo.';
      } else if (resultado.estado === 'DERIVADA_CASI_CERO') {
        interpretacion = 'f\'(x₀) es demasiado cercana a cero según el umbral del solucionador; continuar sería numéricamente inestable.';
      } else {
        interpretacion = 'f\'(x₀) es distinta de cero y Newton-Raphson puede inicializarse. Esto no constituye una garantía general de convergencia.';
      }
    }
    return {
      metodo: 'NEWTON_RAPHSON', valorInicial: primera?.xActual,
      valorFuncionInicial: primera?.valorFuncion, valorDerivadaInicial: primera?.valorDerivada,
      interpretacion,
      resultado: {
        raiz: resultado.raiz, cantidadIteraciones: resultado.cantidadIteraciones,
        errorFinal: resultado.errorAbsolutoFinal, residuoFinal: resultado.residuoFinal,
        razonParada: resultado.razonParada, descripcionParada: resultado.descripcionParada, estado: resultado.estado,
      },
      conclusion: 'Newton-Raphson obtuvo la aproximación indicada después de ' + resultado.cantidadIteraciones + ' iteraciones. ' + resultado.descripcionParada,
    };
  }
}
