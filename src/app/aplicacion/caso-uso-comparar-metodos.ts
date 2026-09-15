import { CasoUsoResolverBiseccion } from './caso-uso-resolver-biseccion';
import { CasoUsoResolverNewton } from './caso-uso-resolver-newton';
import { CasoUsoResolverPuntoFijo } from './caso-uso-resolver-punto-fijo';
import type {
  ConfiguracionComparacion,
  DisponibilidadMetodo,
  ResultadoAplicacion,
  ResultadoComparacion,
  ResultadoMetodoComparado,
} from '../core/comparacion/modelos-comparacion';
import type { MetodoNumerico } from '../core/metodos-numericos/compartido/modelos-solucion';

const NOMBRES_METODOS: Record<MetodoNumerico, string> = {
  BISECCION: 'Bisección',
  NEWTON_RAPHSON: 'Newton-Raphson',
  PUNTO_FIJO: 'Punto Fijo',
};

export class CasoUsoCompararMetodos {
  private readonly biseccion = new CasoUsoResolverBiseccion();
  private readonly newton = new CasoUsoResolverNewton();
  private readonly puntoFijo = new CasoUsoResolverPuntoFijo();

  evaluarDisponibilidad(configuracion: ConfiguracionComparacion): DisponibilidadMetodo[] {
    const faltaFuncion = !configuracion.expresion.trim();
    return [
      {
        metodo: 'BISECCION',
        disponible:
          !faltaFuncion &&
          this.esNumero(configuracion.extremoIzquierdo) &&
          this.esNumero(configuracion.extremoDerecho),
        motivo: faltaFuncion
          ? 'Falta definir f(x).'
          : !this.esNumero(configuracion.extremoIzquierdo) || !this.esNumero(configuracion.extremoDerecho)
            ? 'Falta definir el intervalo [a, b].'
            : undefined,
      },
      {
        metodo: 'NEWTON_RAPHSON',
        disponible: !faltaFuncion && this.esNumero(configuracion.valorInicial),
        motivo: faltaFuncion
          ? 'Falta definir f(x).'
          : !this.esNumero(configuracion.valorInicial)
            ? 'Falta definir el valor inicial x₀.'
            : undefined,
      },
      {
        metodo: 'PUNTO_FIJO',
        disponible:
          !faltaFuncion &&
          Boolean(configuracion.expresionIteracion.trim()) &&
          this.esNumero(configuracion.valorInicial),
        motivo: faltaFuncion
          ? 'Falta definir f(x).'
          : !configuracion.expresionIteracion.trim()
            ? 'Falta definir g(x).'
            : !this.esNumero(configuracion.valorInicial)
              ? 'Falta definir el valor inicial x₀.'
              : undefined,
      },
    ];
  }

  ejecutar(configuracion: ConfiguracionComparacion): ResultadoComparacion {
    const disponibilidades = this.evaluarDisponibilidad(configuracion);
    const metodos = disponibilidades.map((disponibilidad) =>
      disponibilidad.disponible
        ? this.ejecutarMetodo(disponibilidad.metodo, configuracion)
        : {
            metodo: disponibilidad.metodo,
            ejecutado: false,
            estado: 'NO_DISPONIBLE' as const,
            descripcion: disponibilidad.motivo ?? 'No disponible para esta comparación.',
          }
    );

    return {
      expresion: configuracion.expresion,
      tolerancia: configuracion.tolerancia,
      maximoIteraciones: configuracion.maximoIteraciones,
      metodos,
      observaciones: this.generarObservaciones(metodos, configuracion.tolerancia),
    };
  }

  private ejecutarMetodo(
    metodo: MetodoNumerico,
    configuracion: ConfiguracionComparacion
  ): ResultadoMetodoComparado {
    try {
      let resultado: ResultadoAplicacion;
      if (metodo === 'BISECCION') {
        resultado = this.biseccion.ejecutar({
          expresion: configuracion.expresion,
          extremoIzquierdo: configuracion.extremoIzquierdo!,
          extremoDerecho: configuracion.extremoDerecho!,
          tolerancia: configuracion.tolerancia,
          maximoIteraciones: configuracion.maximoIteraciones,
        });
      } else if (metodo === 'NEWTON_RAPHSON') {
        resultado = this.newton.ejecutar({
          expresion: configuracion.expresion,
          valorInicial: configuracion.valorInicial!,
          tolerancia: configuracion.tolerancia,
          maximoIteraciones: configuracion.maximoIteraciones,
        });
      } else {
        resultado = this.puntoFijo.ejecutar({
          expresionOriginal: configuracion.expresion,
          expresionIteracion: configuracion.expresionIteracion,
          valorInicial: configuracion.valorInicial!,
          tolerancia: configuracion.tolerancia,
          maximoIteraciones: configuracion.maximoIteraciones,
        });
      }
      return this.resumir(resultado);
    } catch (error) {
      return {
        metodo,
        ejecutado: true,
        estado: 'ERROR_VALIDACION',
        descripcion: this.mensajeError(metodo, error),
      };
    }
  }

  private resumir(resultado: ResultadoAplicacion): ResultadoMetodoComparado {
    return {
      metodo: resultado.metodo,
      ejecutado: true,
      estado: resultado.estado,
      raiz: resultado.raiz,
      iteraciones: resultado.cantidadIteraciones,
      errorAbsolutoFinal: resultado.errorAbsolutoFinal,
      errorRelativoFinal: resultado.errorRelativoFinal,
      residuoFuncion: resultado.residuoFinal,
      razonParada: resultado.razonParada,
      descripcion: resultado.descripcionParada,
    };
  }

  private generarObservaciones(
    resultados: ResultadoMetodoComparado[],
    tolerancia: number
  ): string[] {
    const observaciones: string[] = [];
    for (const resultado of resultados) {
      if (!resultado.ejecutado) {
        observaciones.push(NOMBRES_METODOS[resultado.metodo] + ' no fue ejecutado: ' + resultado.descripcion);
      } else if (resultado.estado === 'ERROR_VALIDACION') {
        observaciones.push(NOMBRES_METODOS[resultado.metodo] + ' no pudo ejecutarse: ' + resultado.descripcion);
      } else if (resultado.estado === 'MAXIMO_ITERACIONES') {
        observaciones.push(NOMBRES_METODOS[resultado.metodo] + ' alcanzó el máximo de iteraciones configurado.');
      }
    }

    const convergentes = resultados.filter(
      (resultado) =>
        (resultado.estado === 'CONVERGENCIA_ALCANZADA' || resultado.estado === 'RAIZ_EXACTA') &&
        this.esNumero(resultado.raiz)
    );
    if (convergentes.length >= 2) {
      const umbral = Math.max(tolerancia * 10, Number.EPSILON * 10);
      const compatibles = convergentes.every((actual, indice) =>
        convergentes.slice(indice + 1).every((otro) => Math.abs(actual.raiz! - otro.raiz!) <= umbral)
      );
      observaciones.push(
        compatibles
          ? 'Las aproximaciones obtenidas son compatibles con la tolerancia utilizada.'
          : 'Los métodos convergieron a raíces distintas. Esto puede ocurrir cuando la función posee varias raíces y se utilizan condiciones iniciales diferentes.'
      );
    }

    const conIteraciones = convergentes.filter((resultado) => this.esNumero(resultado.iteraciones));
    if (conIteraciones.length >= 2) {
      const minimo = Math.min(...conIteraciones.map((resultado) => resultado.iteraciones!));
      const masRapidos = conIteraciones.filter((resultado) => resultado.iteraciones === minimo);
      if (masRapidos.length === 1) {
        observaciones.push(
          'Para este ejercicio y estos parámetros, ' + NOMBRES_METODOS[masRapidos[0].metodo] + ' utilizó menos iteraciones entre los métodos que convergieron.'
        );
      }
    }

    if (observaciones.length === 0) {
      observaciones.push('La tabla presenta cada estado, error y residuo por separado para su interpretación académica.');
    }
    return observaciones;
  }

  private mensajeError(metodo: MetodoNumerico, error: unknown): string {
    if (metodo === 'BISECCION') return this.biseccion.mensaje(error);
    if (metodo === 'NEWTON_RAPHSON') return this.newton.mensaje(error);
    return this.puntoFijo.mensaje(error);
  }

  private esNumero(valor: number | null | undefined): valor is number {
    return typeof valor === 'number' && Number.isFinite(valor);
  }
}
