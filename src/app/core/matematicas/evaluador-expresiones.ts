import type { EvalFunction } from 'mathjs';
import { ErrorExpresionMatematica, type ExpresionAnalizada } from './modelos-matematicos';

export class EvaluadorExpresiones {
  compilar(expresion: ExpresionAnalizada): (x: number) => number {
    const compilada = expresion.nodo.compile();
    return (x: number) => this.evaluarCompilada(compilada, x);
  }

  evaluar(expresion: ExpresionAnalizada, x: number): number {
    return this.evaluarCompilada(expresion.nodo.compile(), x);
  }

  private evaluarCompilada(compilada: EvalFunction, x: number): number {
    let resultado: unknown;
    try {
      resultado = compilada.evaluate({ x });
    } catch {
      throw new ErrorExpresionMatematica(`No se pudo evaluar la función en x = ${this.formatear(x)}.`);
    }
    if (typeof resultado !== 'number' || !Number.isFinite(resultado)) {
      throw new ErrorExpresionMatematica(`La función produce un valor no finito en x = ${this.formatear(x)}.`);
    }
    return resultado;
  }

  private formatear(valor: number): string {
    return Number.isFinite(valor) ? valor.toPrecision(10).replace(/\.?0+$/, '') : String(valor);
  }
}
