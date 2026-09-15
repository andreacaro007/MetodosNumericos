import { AnalizadorExpresiones } from '../core/matematicas/analizador-expresiones';
import { DerivadorExpresiones } from '../core/matematicas/derivador-expresiones';
import { EvaluadorExpresiones } from '../core/matematicas/evaluador-expresiones';
import type { ParametrosPuntoFijo, ResultadoPuntoFijo } from '../core/metodos-numericos/punto-fijo/modelos-punto-fijo';
import { SolucionadorPuntoFijo } from '../core/metodos-numericos/punto-fijo/solucionador-punto-fijo';

export class CasoUsoResolverPuntoFijo {
  private readonly analizador = new AnalizadorExpresiones();
  private readonly derivador = new DerivadorExpresiones(this.analizador);
  private readonly solucionador = new SolucionadorPuntoFijo(new EvaluadorExpresiones());

  ejecutar(parametros: ParametrosPuntoFijo): ResultadoPuntoFijo {
    const original = this.analizador.analizar(parametros.expresionOriginal);
    const iteracion = this.analizador.analizar(parametros.expresionIteracion);
    const derivada = this.derivador.derivar(iteracion);
    return this.solucionador.resolver(parametros, original, iteracion, derivada);
  }

  vistaLatex(original: string, iteracion: string): { funcion?: string; iteracion?: string; derivada?: string } {
    const vista: { funcion?: string; iteracion?: string; derivada?: string } = {};
    try { vista.funcion = this.analizador.analizar(original).latex; } catch { /* Vista parcial. */ }
    try {
      const analizada = this.analizador.analizar(iteracion);
      vista.iteracion = analizada.latex;
      vista.derivada = this.derivador.derivar(analizada).latex;
    } catch { /* Vista parcial. */ }
    return vista;
  }

  mensaje(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error controlado al resolver el ejercicio.';
  }
}
