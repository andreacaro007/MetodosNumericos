import type { ExpresionAnalizada } from '../matematicas/modelos-matematicos';
import type {
  PuntoMuestreo,
  ResultadoExploracion,
  ResumenExploracion,
  SugerenciaNewton,
} from './modelos-analisis';
import { DetectorIntervalos } from './detector-intervalos';

export interface OpcionesExploracion {
  desde?: number;
  hasta?: number;
  muestras?: number;
}

export class ExploradorFuncion {
  constructor(private readonly detector = new DetectorIntervalos()) {}

  explorar(
    expresion: ExpresionAnalizada,
    derivada?: ExpresionAnalizada,
    opciones: OpcionesExploracion = {}
  ): ResultadoExploracion {
    const desde = opciones.desde ?? -10;
    const hasta = opciones.hasta ?? 10;
    const numMuestras = Math.max(10, Math.min(2000, Math.round(opciones.muestras ?? 1000)));

    if (desde >= hasta) {
      throw new Error('El límite inferior (desde) debe ser menor que el límite superior (hasta).');
    }

    const compilada = expresion.nodo.compile();
    const compiladaDerivada = derivada ? derivada.nodo.compile() : undefined;

    const evaluarPunto = (x: number): number | null => {
      try {
        const r = compilada.evaluate({ x });
        if (typeof r === 'number' && Number.isFinite(r)) return r;
        return null;
      } catch {
        return null;
      }
    };

    const evaluarDerivada = (x: number): number | null => {
      if (!compiladaDerivada) return null;
      try {
        const r = compiladaDerivada.evaluate({ x });
        if (typeof r === 'number' && Number.isFinite(r)) return r;
        return null;
      } catch {
        return null;
      }
    };

    const puntos: PuntoMuestreo[] = [];
    let evaluables = 0;
    let noEvaluables = 0;
    let minObs: { x: number; y: number } | undefined;
    let maxObs: { x: number; y: number } | undefined;

    const paso = (hasta - desde) / (numMuestras - 1);

    for (let i = 0; i < numMuestras; i++) {
      const x = desde + i * paso;
      const y = evaluarPunto(x);

      if (y !== null) {
        evaluables++;
        puntos.push({ x, y, evaluable: true });
        if (!minObs || y < minObs.y) minObs = { x, y };
        if (!maxObs || y > maxObs.y) maxObs = { x, y };
      } else {
        noEvaluables++;
        puntos.push({ x, y: 0, evaluable: false, motivoNoEvaluable: 'No evaluable en números reales' });
      }
    }

    const { intervalosCandidatos, zonasCercanasCero, discontinuidadesEvitadas } =
      this.detector.detectar(puntos, evaluarPunto);

    const sugerenciasNewton: SugerenciaNewton[] = [];

    for (const inter of intervalosCandidatos) {
      const x0 = Number(inter.estimacionRaiz.toPrecision(8));
      const fx0 = evaluarPunto(x0) ?? 0;
      const dfx0 = evaluarDerivada(x0);

      if (dfx0 !== null && Math.abs(dfx0) > 1e-4) {
        sugerenciasNewton.push({
          x0,
          fx0,
          dfx0,
          esRecomendada: true,
          razon: `Ubicado en el cambio de signo [${inter.a.toFixed(3)}, ${inter.b.toFixed(3)}]. Derivada f'(${x0}) ≈ ${dfx0.toPrecision(4)} (no nula).`,
        });
      } else if (dfx0 !== null) {
        sugerenciasNewton.push({
          x0,
          fx0,
          dfx0,
          esRecomendada: false,
          razon: `En [${inter.a.toFixed(3)}, ${inter.b.toFixed(3)}], pero f'(${x0}) ≈ ${dfx0.toPrecision(4)} es casi horizontal (riesgo de divergencia en Newton).`,
        });
      } else {
        sugerenciasNewton.push({
          x0,
          fx0,
          dfx0: 0,
          esRecomendada: true,
          razon: `Punto estimado dentro del cambio de signo [${inter.a.toFixed(3)}, ${inter.b.toFixed(3)}].`,
        });
      }
    }

    if (sugerenciasNewton.length === 0 && zonasCercanasCero.length > 0) {
      for (const zona of zonasCercanasCero) {
        const df = evaluarDerivada(zona.x);
        sugerenciasNewton.push({
          x0: Number(zona.x.toPrecision(8)),
          fx0: zona.fx,
          dfx0: df ?? 0,
          esRecomendada: df !== null && Math.abs(df) > 1e-4,
          razon: `Mínimo observado de |f(x)| ≈ ${zona.moduloFx.toPrecision(4)}. Posible contacto tangencial o raíz par.`,
        });
      }
    }

    const resumen: ResumenExploracion = {
      xMin: desde,
      xMax: hasta,
      totalMuestras: numMuestras,
      evaluables,
      noEvaluables,
      cambiosSignoDetectados: intervalosCandidatos.length,
      minimoObservado: minObs,
      maximoObservado: maxObs,
    };

    const advertencias: string[] = [
      'La exploración numérica detecta cambios de signo en puntos muestreados. Puede no detectar raíces de multiplicidad par y un cambio de signo alrededor de una discontinuidad no garantiza por sí solo la existencia de una raíz.',
    ];

    if (noEvaluables > 0) {
      advertencias.push(
        `Se detectaron ${noEvaluables} punto(s) no evaluable(s) en el intervalo [${desde}, ${hasta}]. La función puede tener asíntotas o valores fuera del dominio real.`
      );
    }

    if (discontinuidadesEvitadas > 0) {
      advertencias.push(
        `Se descartaron ${discontinuidadesEvitadas} posible(s) falso(s) cambio(s) de signo atribuidos a discontinuidades o saltos asintóticos.`
      );
    }

    return {
      rango: { desde, hasta, muestras: numMuestras },
      resumen,
      intervalosCandidatos,
      zonasCercanasCero,
      sugerenciasNewton,
      puntos,
      advertencias,
    };
  }
}
