import { AnalizadorExpresiones } from '../core/matematicas/analizador-expresiones';
import { DerivadorExpresiones } from '../core/matematicas/derivador-expresiones';
import { EvaluadorExpresiones } from '../core/matematicas/evaluador-expresiones';
import type { ParametrosNewton, ResultadoNewton } from '../core/metodos-numericos/newton/modelos-newton';
import { SolucionadorNewton } from '../core/metodos-numericos/newton/solucionador-newton';

export class CasoUsoResolverNewton {
  private readonly analizador = new AnalizadorExpresiones();
  private readonly derivador = new DerivadorExpresiones(this.analizador);
  private readonly solucionador = new SolucionadorNewton(new EvaluadorExpresiones());

  ejecutar(parametros: ParametrosNewton): ResultadoNewton {
    const expresion = this.analizador.analizar(parametros.expresion);
    const derivada = this.derivador.derivar(expresion);
    return this.solucionador.resolver(parametros, expresion, derivada);
  }

  vistaLatex(expresion: string): { funcion: string; derivada: string } | undefined {
    try {
      const analizada = this.analizador.analizar(expresion);
      return { funcion: analizada.latex, derivada: this.derivador.derivar(analizada).latex };
    } catch { return undefined; }
  }

  mensaje(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error controlado al resolver el ejercicio.';
  }
}
