import type { ResultadoMetodoNumerico } from '../compartido/modelos-solucion';

export interface ParametrosPuntoFijo {
  expresionOriginal: string;
  expresionIteracion: string;
  valorInicial: number;
  tolerancia: number;
  maximoIteraciones: number;
}

export interface IteracionPuntoFijo {
  numero: number;
  xActual: number;
  valorG: number;
  siguienteX: number;
  valorFuncionOriginal: number;
  valorDerivadaG: number;
  moduloDerivadaG: number;
  errorAbsoluto?: number;
  errorRelativo?: number;
  errorPorcentual?: number;
  residuoPuntoFijo: number;
  residuoFuncionOriginal: number;
  razonParada?: string;
}

export interface ResultadoPuntoFijo extends ResultadoMetodoNumerico<IteracionPuntoFijo> {
  metodo: 'PUNTO_FIJO';
  expresionIteracion: string;
  expresionIteracionNormalizada: string;
  expresionIteracionLatex: string;
  derivadaIteracionNormalizada: string;
  derivadaIteracionLatex: string;
  moduloDerivadaInicial: number;
  moduloDerivadaFinal: number;
  maximoModuloDerivada: number;
  residuoPuntoFijoFinal: number;
  transformacionSatisfaceOriginal: boolean;
}

export class ErrorValidacionPuntoFijo extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionPuntoFijo';
  }
}
