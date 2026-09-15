import type {
  EstadoConvergencia,
  MetodoNumerico,
  RazonParada,
} from '../metodos-numericos/compartido/modelos-solucion';
import type { ResultadoBiseccion } from '../metodos-numericos/biseccion/modelos-biseccion';
import type { ResultadoNewton } from '../metodos-numericos/newton/modelos-newton';
import type { ResultadoPuntoFijo } from '../metodos-numericos/punto-fijo/modelos-punto-fijo';

export type ResultadoAplicacion = ResultadoBiseccion | ResultadoNewton | ResultadoPuntoFijo;
export type EstadoComparacion = EstadoConvergencia | 'NO_DISPONIBLE' | 'ERROR_VALIDACION';

export interface ConfiguracionComparacion {
  expresion: string;
  expresionIteracion: string;
  extremoIzquierdo: number | null;
  extremoDerecho: number | null;
  valorInicial: number | null;
  tolerancia: number;
  maximoIteraciones: number;
}

export interface DisponibilidadMetodo {
  metodo: MetodoNumerico;
  disponible: boolean;
  motivo?: string;
}

export interface ResultadoMetodoComparado {
  metodo: MetodoNumerico;
  ejecutado: boolean;
  estado: EstadoComparacion;
  raiz?: number;
  iteraciones?: number;
  errorAbsolutoFinal?: number;
  errorRelativoFinal?: number;
  residuoFuncion?: number;
  razonParada?: RazonParada;
  descripcion: string;
}

export interface ResultadoComparacion {
  expresion: string;
  tolerancia: number;
  maximoIteraciones: number;
  metodos: ResultadoMetodoComparado[];
  observaciones: string[];
}
