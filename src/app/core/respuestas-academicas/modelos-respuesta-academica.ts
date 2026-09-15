import type { IteracionBiseccion } from '../metodos-numericos/biseccion/modelos-biseccion';
import type { EstadoConvergencia, RazonParada } from '../metodos-numericos/compartido/modelos-solucion';

export interface ResultadoAcademicoComun {
  raiz: number;
  cantidadIteraciones: number;
  errorFinal?: number;
  residuoFinal: number;
  razonParada: RazonParada;
  descripcionParada: string;
  estado: EstadoConvergencia;
}

export interface CotaIteracionesBiseccion {
  formula: string;
  sustitucion: string;
  valorLogaritmo: number;
  iteraciones: number;
}

export interface RespuestaAcademicaBiseccion {
  metodo: 'BISECCION';
  valorA?: number;
  valorB?: number;
  productoExtremos?: number;
  hayCambioSigno: boolean;
  aplicabilidad: string;
  advertenciaContinuidad: string;
  cotaIteraciones?: CotaIteracionesBiseccion;
  primerasIteraciones: readonly IteracionBiseccion[];
  notaPrimerasIteraciones?: string;
  resultado: ResultadoAcademicoComun;
  conclusion: string;
}

export interface RespuestaAcademicaNewton {
  metodo: 'NEWTON_RAPHSON';
  valorInicial?: number;
  valorFuncionInicial?: number;
  valorDerivadaInicial?: number;
  interpretacion: string;
  resultado: ResultadoAcademicoComun;
  conclusion: string;
}

export interface RespuestaAcademicaPuntoFijo {
  metodo: 'PUNTO_FIJO';
  expresionOriginal: string;
  expresionIteracion: string;
  valorInicial?: number;
  valorDerivadaInicial?: number;
  moduloDerivadaInicial: number;
  interpretacion: string;
  residuoPuntoFijo: number;
  residuoOriginal: number;
  transformacionSatisfaceOriginal: boolean;
  resultado: ResultadoAcademicoComun;
  conclusion: string;
}

export type RespuestaAcademica =
  | RespuestaAcademicaBiseccion
  | RespuestaAcademicaNewton
  | RespuestaAcademicaPuntoFijo;
