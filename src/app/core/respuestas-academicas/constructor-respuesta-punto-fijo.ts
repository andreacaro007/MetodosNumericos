import type { ResultadoPuntoFijo } from '../metodos-numericos/punto-fijo/modelos-punto-fijo';
import type { RespuestaAcademicaPuntoFijo } from './modelos-respuesta-academica';

export class ConstructorRespuestaPuntoFijo {
  construir(resultado: ResultadoPuntoFijo): RespuestaAcademicaPuntoFijo {
    const primera = resultado.iteraciones[0];
    return {
      metodo: 'PUNTO_FIJO', expresionOriginal: resultado.expresionNormalizada,
      expresionIteracion: resultado.expresionIteracionNormalizada, valorInicial: primera?.xActual,
      valorDerivadaInicial: primera?.valorDerivadaG, moduloDerivadaInicial: resultado.moduloDerivadaInicial,
      interpretacion: resultado.moduloDerivadaInicial < 1
        ? 'Como |g\'(x₀)| < 1, se observa una condición local favorable para la convergencia; no es una garantía global.'
        : 'Como |g\'(x₀)| ≥ 1, la condición local inicial es desfavorable y puede existir divergencia.',
      residuoPuntoFijo: resultado.residuoPuntoFijoFinal, residuoOriginal: resultado.residuoFinal,
      transformacionSatisfaceOriginal: resultado.transformacionSatisfaceOriginal,
      resultado: {
        raiz: resultado.raiz, cantidadIteraciones: resultado.cantidadIteraciones,
        errorFinal: resultado.errorAbsolutoFinal, residuoFinal: resultado.residuoFinal,
        razonParada: resultado.razonParada, descripcionParada: resultado.descripcionParada, estado: resultado.estado,
      },
      conclusion: resultado.transformacionSatisfaceOriginal
        ? 'La aproximación obtenida es un punto fijo de g(x) y también satisface la ecuación original f(x)=0 dentro de la tolerancia utilizada.'
        : 'La iteración encontró un punto fijo de g(x), pero el resultado no satisface suficientemente la ecuación original f(x)=0. Revisa la transformación utilizada para g(x).',
    };
  }
}
