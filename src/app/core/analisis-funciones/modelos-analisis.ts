import type { ExpresionAnalizada } from '../matematicas/modelos-matematicos';

export type TipoFuncion =
  | 'POLINOMICA'
  | 'RACIONAL'
  | 'TRIGONOMETRICA'
  | 'EXPONENCIAL'
  | 'LOGARITMICA'
  | 'RADICAL'
  | 'MIXTA'
  | 'CONSTANTE'
  | 'OTRA';

export interface ClasificacionFuncion {
  tipo: TipoFuncion;
  nombre: string;
  descripcion: string;
  familiasDetectadas: string[];
}

export interface RestriccionEstructural {
  tipo: 'division' | 'logaritmo' | 'radical_par' | 'otra';
  descripcion: string;
  detalle: string;
}

export interface EvaluacionPuntual {
  x: number;
  resultado: number;
  sustitucionLatex: string;
}

export interface PuntoMuestreo {
  x: number;
  y: number;
  evaluable: boolean;
  motivoNoEvaluable?: string;
}

export interface IntervaloCandidato {
  a: number;
  b: number;
  fa: number;
  fb: number;
  puntoMedio: number;
  estimacionRaiz: number;
}

export interface ZonaCercanaCero {
  x: number;
  fx: number;
  moduloFx: number;
  razon: string;
}

export interface SugerenciaNewton {
  x0: number;
  razon: string;
  fx0: number;
  dfx0: number;
  esRecomendada: boolean;
}

export interface ResumenExploracion {
  xMin: number;
  xMax: number;
  totalMuestras: number;
  evaluables: number;
  noEvaluables: number;
  cambiosSignoDetectados: number;
  minimoObservado?: { x: number; y: number };
  maximoObservado?: { x: number; y: number };
}

export interface ResultadoExploracion {
  rango: { desde: number; hasta: number; muestras: number };
  resumen: ResumenExploracion;
  intervalosCandidatos: IntervaloCandidato[];
  zonasCercanasCero: ZonaCercanaCero[];
  sugerenciasNewton: SugerenciaNewton[];
  puntos: PuntoMuestreo[];
  advertencias: string[];
}

export interface AnalisisFuncion {
  expresion: ExpresionAnalizada;
  derivada?: ExpresionAnalizada;
  segundaDerivada?: ExpresionAnalizada;
  clasificacion: ClasificacionFuncion;
  restriccionesEstructurales: RestriccionEstructural[];
  advertencias: string[];
}
