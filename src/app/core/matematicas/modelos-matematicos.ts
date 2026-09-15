import type { MathNode } from 'mathjs';

export interface ExpresionAnalizada {
  entradaOriginal: string;
  expresionNormalizada: string;
  nodo: MathNode;
  latex: string;
}

export class ErrorExpresionMatematica extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorExpresionMatematica';
  }
}
