import type { ResultadoBiseccion } from '../metodos-numericos/biseccion/modelos-biseccion';
import { calcularIteracionesBiseccionConPython } from '../motor-numerico/motor-numerico';
import type { CotaIteracionesBiseccion, RespuestaAcademicaBiseccion } from './modelos-respuesta-academica';

export function estimarIteracionesBiseccion(
  extremoIzquierdo: number,
  extremoDerecho: number,
  tolerancia: number,
): CotaIteracionesBiseccion | undefined {
  const longitud = Math.abs(extremoDerecho - extremoIzquierdo);
  if (![extremoIzquierdo, extremoDerecho, tolerancia].every(Number.isFinite) || longitud === 0 || tolerancia <= 0) {
    return undefined;
  }
  const valorLogaritmo = Math.log2(longitud / tolerancia);
  return {
    formula: 'N = ceil(log₂(|b-a| / ε))',
    sustitucion: 'N = ceil(log₂(|' + extremoDerecho + '-' + extremoIzquierdo + '| / ' + tolerancia + '))',
    valorLogaritmo,
    iteraciones: Math.max(0, Math.ceil(valorLogaritmo)),
    motor: 'typescript',
  };
}

function obtenerCotaIteracionesBiseccion(
  extremoIzquierdo: number,
  extremoDerecho: number,
  tolerancia: number,
): CotaIteracionesBiseccion | undefined {
  const respuestaPython = calcularIteracionesBiseccionConPython(extremoIzquierdo, extremoDerecho, tolerancia);
  if (respuestaPython?.valorLogaritmo !== undefined && respuestaPython.iteracionesTeoricas !== undefined) {
    return {
      formula: "N = ceil(log₂(|b-a| / ε))",
      sustitucion: "N = ceil(log₂(|" + extremoDerecho + "-" + extremoIzquierdo + "| / " + tolerancia + "))",
      valorLogaritmo: respuestaPython.valorLogaritmo,
      iteraciones: respuestaPython.iteracionesTeoricas,
      motor: "python",
    };
  }
  return estimarIteracionesBiseccion(extremoIzquierdo, extremoDerecho, tolerancia);
}

export class ConstructorRespuestaBiseccion {
  construir(resultado: ResultadoBiseccion): RespuestaAcademicaBiseccion {
    const primera = resultado.iteraciones[0];
    const valorA = primera?.valorExtremoIzquierdo;
    const valorB = primera?.valorExtremoDerecho;
    const productoExtremos = valorA !== undefined && valorB !== undefined ? valorA * valorB : undefined;
    const hayCambioSigno = productoExtremos !== undefined && productoExtremos < 0;
    const cotaIteraciones = primera
      ? obtenerCotaIteracionesBiseccion(primera.extremoIzquierdo, primera.extremoDerecho, resultado.tolerancia)
      : undefined;
    const primerasIteraciones = resultado.iteraciones.slice(0, 4);

    return {
      metodo: 'BISECCION', valorA, valorB, productoExtremos, hayCambioSigno,
      aplicabilidad: hayCambioSigno
        ? 'f(a) y f(b) tienen signos opuestos. Existe un cambio de signo en el intervalo inicial y Bisección puede inicializarse bajo las condiciones comprobables por la aplicación.'
        : primera
          ? 'No se identificó un cambio de signo estricto en los extremos del intervalo inicial.'
          : 'La raíz se encontró en un extremo antes de iniciar las iteraciones; no fue necesario reducir el intervalo.',
      advertenciaContinuidad: 'La función es evaluable en los extremos y se comprueba el cambio de signo. El teorema que fundamenta Bisección requiere además continuidad en todo el intervalo; esta respuesta no la afirma sin demostrarla.',
      cotaIteraciones,
      primerasIteraciones,
      notaPrimerasIteraciones: primerasIteraciones.length < 4
        ? 'El método finalizó antes de completar cuatro iteraciones; se muestran únicamente las disponibles.'
        : undefined,
      resultado: {
        raiz: resultado.raiz, cantidadIteraciones: resultado.cantidadIteraciones,
        errorFinal: resultado.errorAbsolutoFinal, residuoFinal: resultado.residuoFinal,
        razonParada: resultado.razonParada, descripcionParada: resultado.descripcionParada, estado: resultado.estado,
      },
      conclusion: 'Bisección obtuvo la aproximación indicada después de ' + resultado.cantidadIteraciones + ' iteraciones. ' + resultado.descripcionParada,
    };
  }
}
