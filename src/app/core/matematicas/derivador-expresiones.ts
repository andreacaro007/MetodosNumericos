import { derivative, simplify } from 'mathjs';
import { AnalizadorExpresiones } from './analizador-expresiones';
import { ErrorExpresionMatematica, type ExpresionAnalizada } from './modelos-matematicos';

export class DerivadorExpresiones {
  constructor(private readonly analizador = new AnalizadorExpresiones()) {}

  derivar(expresion: ExpresionAnalizada): ExpresionAnalizada {
    try {
      const nodoDerivado = simplify(derivative(expresion.nodo, 'x'));
      return this.analizador.analizar(nodoDerivado.toString({ implicit: 'show', parenthesis: 'keep' }));
    } catch {
      throw new ErrorExpresionMatematica('No se pudo obtener una derivada simbólica válida para la función ingresada.');
    }
  }
}
