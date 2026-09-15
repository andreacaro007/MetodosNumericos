import { AnalizadorExpresiones } from '../core/matematicas/analizador-expresiones';
import { EvaluadorExpresiones } from '../core/matematicas/evaluador-expresiones';
import { SolucionadorBiseccion } from '../core/metodos-numericos/biseccion/solucionador-biseccion';
import type { AnalisisIntervalo, ParametrosBiseccion, ResultadoBiseccion } from '../core/metodos-numericos/biseccion/modelos-biseccion';

export class CasoUsoResolverBiseccion {
  private readonly analizador = new AnalizadorExpresiones();
  private readonly evaluador = new EvaluadorExpresiones();
  private readonly solucionador = new SolucionadorBiseccion(this.evaluador);

  ejecutar(parametros: ParametrosBiseccion): ResultadoBiseccion {
    const expresion = this.analizador.analizar(parametros.expresion);
    return this.solucionador.resolver(parametros, expresion);
  }

  analizarIntervalo(parametros: ParametrosBiseccion): AnalisisIntervalo {
    try {
      const expresion = this.analizador.analizar(parametros.expresion);
      const funcion = this.evaluador.compilar(expresion);
      const valorA = funcion(parametros.extremoIzquierdo);
      const valorB = funcion(parametros.extremoDerecho);
      const cambioSigno = valorA === 0 || valorB === 0 || Math.sign(valorA) !== Math.sign(valorB);
      return {
        funcionValida: true, valorA, valorB, cambioSigno, metodoAplicable: cambioSigno,
        mensaje: cambioSigno
          ? 'El intervalo cumple la condición de cambio de signo.'
          : 'f(a) y f(b) tienen el mismo signo; cambia el intervalo.',
      };
    } catch (error) {
      return { funcionValida: false, cambioSigno: false, metodoAplicable: false, mensaje: this.mensaje(error) };
    }
  }

  vistaLatex(expresion: string): string | undefined {
    try { return this.analizador.analizar(expresion).latex; } catch { return undefined; }
  }

  mensaje(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error controlado al resolver el ejercicio.';
  }
}
