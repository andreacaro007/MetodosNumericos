import type { ResultadoMetodoNumerico } from '../compartido/modelos-solucion';

export interface ParametrosNewton {
  expresion: string;
  valorInicial: number;
  tolerancia: number;
  maximoIteraciones: number;
}

export interface IteracionNewton {
  numero: number;
  xActual: number;
  valorFuncion: number;
  valorDerivada: number;
  cocienteNewton?: number;
  siguienteX?: number;
  valorFuncionSiguiente?: number;
  errorAbsoluto?: number;
  errorRelativo?: number;
  errorPorcentual?: number;
  residuo: number;
  razonParada?: string;
}

export interface ResultadoNewton extends ResultadoMetodoNumerico<IteracionNewton> {
  metodo: 'NEWTON_RAPHSON';
  derivadaNormalizada: string;
  derivadaLatex: string;
  umbralDerivada: number;
}

export class ErrorValidacionNewton extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionNewton';
  }
}
