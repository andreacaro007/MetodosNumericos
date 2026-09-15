export type MetodoNumerico = 'BISECCION' | 'NEWTON_RAPHSON' | 'PUNTO_FIJO';
export type EstadoConvergencia = 'CONVERGENCIA_ALCANZADA' | 'RAIZ_EXACTA' | 'MAXIMO_ITERACIONES';
export type RazonParada = 'RAIZ_EXACTA' | 'ERROR_ABSOLUTO' | 'RESIDUO' | 'MAXIMO_ITERACIONES';

export interface ResultadoMetodoNumerico<TIteracion> {
  metodo: MetodoNumerico;
  estado: EstadoConvergencia;
  expresion: string;
  expresionNormalizada: string;
  expresionLatex: string;
  raiz: number;
  iteraciones: readonly TIteracion[];
  cantidadIteraciones: number;
  tolerancia: number;
  maximoIteraciones: number;
  errorAbsolutoFinal?: number;
  errorRelativoFinal?: number;
  errorPorcentualFinal?: number;
  residuoFinal: number;
  razonParada: RazonParada;
  descripcionParada: string;
  advertencias: readonly string[];
  errores: readonly string[];
  tiempoEjecucionMs: number;
}

export interface PasoMatematico {
  tipo: 'FORMULA' | 'SUSTITUCION' | 'EVALUACION' | 'DECISION' | 'ERROR' | 'CONVERGENCIA';
  titulo: string;
  explicacion?: string;
  formulaLatex?: string;
  sustitucionLatex?: string;
  resultadoLatex?: string;
}
