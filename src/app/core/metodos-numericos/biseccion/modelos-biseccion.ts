import type { ResultadoMetodoNumerico } from '../compartido/modelos-solucion';

export interface ParametrosBiseccion {
  expresion: string;
  extremoIzquierdo: number;
  extremoDerecho: number;
  tolerancia: number;
  maximoIteraciones: number;
}

export type DecisionBiseccion = 'INTERVALO_IZQUIERDO' | 'INTERVALO_DERECHO' | 'RAIZ_ENCONTRADA';

export interface IteracionBiseccion {
  numero: number;
  extremoIzquierdo: number;
  extremoDerecho: number;
  valorExtremoIzquierdo: number;
  valorExtremoDerecho: number;
  puntoMedio: number;
  valorPuntoMedio: number;
  productoSignos: number;
  nuevoExtremoIzquierdo: number;
  nuevoExtremoDerecho: number;
  errorAbsoluto?: number;
  errorRelativo?: number;
  errorPorcentual?: number;
  decision: DecisionBiseccion;
  razonParada?: string;
}

export type ResultadoBiseccion = ResultadoMetodoNumerico<IteracionBiseccion>;

export interface AnalisisIntervalo {
  funcionValida: boolean;
  valorA?: number;
  valorB?: number;
  cambioSigno: boolean;
  metodoAplicable: boolean;
  mensaje: string;
}

export class ErrorValidacionBiseccion extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorValidacionBiseccion';
  }
}
