import { isFunctionNode, isOperatorNode, isSymbolNode, parse, type MathNode } from 'mathjs';
import { ErrorExpresionMatematica, type ExpresionAnalizada } from './modelos-matematicos';

const FUNCIONES_PERMITIDAS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'sqrt', 'abs', 'exp',
  'log', 'floor', 'ceil', 'sec', 'csc', 'cot',
]);

const SIMBOLOS_PERMITIDOS = new Set(['x', 'e', 'pi']);
const OPERADORES_PERMITIDOS = new Set(['+', '-', '*', '/', '^']);
const TIPOS_PERMITIDOS = new Set([
  'ConstantNode', 'SymbolNode', 'OperatorNode', 'FunctionNode', 'ParenthesisNode',
]);

export class AnalizadorExpresiones {
  analizar(entrada: string): ExpresionAnalizada {
    const original = entrada.trim();
    if (!original) {
      throw new ErrorExpresionMatematica('Escribe una función antes de resolver.');
    }

    const expresionNormalizada = this.normalizar(original);
    let nodo: MathNode;
    try {
      nodo = parse(expresionNormalizada);
    } catch {
      throw new ErrorExpresionMatematica('La expresión matemática no es válida. Revisa paréntesis y operadores.');
    }

    this.validarNodo(nodo);
    return {
      entradaOriginal: original,
      expresionNormalizada: nodo.toString({ implicit: 'show', parenthesis: 'keep' }),
      nodo,
      latex: nodo.toTex({ parenthesis: 'keep', implicit: 'hide' }),
    };
  }

  normalizar(entrada: string): string {
    return entrada
      .replaceAll('π', 'pi')
      .replaceAll('×', '*')
      .replaceAll('÷', '/')
      .replace(/\bln\s*\(/gi, 'log(')
      .replace(/\b([A-Z]+)\b/gi, (coincidencia) => coincidencia.toLowerCase());
  }

  private validarNodo(nodo: MathNode): void {
    nodo.traverse((actual, _ruta, padre) => {
      if (!TIPOS_PERMITIDOS.has(actual.type)) {
        throw new ErrorExpresionMatematica('La expresión contiene una operación no permitida.');
      }
      if (isSymbolNode(actual) && !SIMBOLOS_PERMITIDOS.has(actual.name)) {
        const esNombreFuncion = padre !== null && isFunctionNode(padre) && padre.fn === actual;
        if (!esNombreFuncion) {
          throw new ErrorExpresionMatematica(`El símbolo “${actual.name}” no está permitido. Usa solamente x, e o π.`);
        }
      }
      if (isFunctionNode(actual)) {
        const nombre = actual.fn.name;
        if (!nombre || !FUNCIONES_PERMITIDAS.has(nombre)) {
          throw new ErrorExpresionMatematica(`La función “${nombre ?? 'desconocida'}” no está permitida.`);
        }
      }
      if (isOperatorNode(actual) && !OPERADORES_PERMITIDOS.has(actual.op)) {
        throw new ErrorExpresionMatematica(`El operador “${actual.op}” no está permitido.`);
      }
    });
  }
}
