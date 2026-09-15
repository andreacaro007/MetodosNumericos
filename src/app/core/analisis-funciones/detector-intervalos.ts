import type { IntervaloCandidato, PuntoMuestreo, ZonaCercanaCero } from './modelos-analisis';

export class DetectorIntervalos {
  detectar(
    puntos: PuntoMuestreo[],
    evaluarPunto: (x: number) => number | null
  ): {
    intervalosCandidatos: IntervaloCandidato[];
    zonasCercanasCero: ZonaCercanaCero[];
    discontinuidadesEvitadas: number;
  } {
    const intervalosCandidatos: IntervaloCandidato[] = [];
    const zonasCercanasCero: ZonaCercanaCero[] = [];
    let discontinuidadesEvitadas = 0;

    if (puntos.length < 2) {
      return { intervalosCandidatos, zonasCercanasCero, discontinuidadesEvitadas };
    }

    for (let i = 0; i < puntos.length - 1; i++) {
      const p1 = puntos[i];
      const p2 = puntos[i + 1];

      if (!p1.evaluable || !p2.evaluable) {
        continue;
      }

      if (p1.y === 0) {
        intervalosCandidatos.push({
          a: p1.x,
          b: p1.x,
          fa: 0,
          fb: 0,
          puntoMedio: p1.x,
          estimacionRaiz: p1.x,
        });
        continue;
      }

      if ((p1.y < 0 && p2.y > 0) || (p1.y > 0 && p2.y < 0)) {
        if (Math.abs(p1.y) > 1e6 || Math.abs(p2.y) > 1e6) {
          discontinuidadesEvitadas++;
          continue;
        }

        const xm = (p1.x + p2.x) / 2;
        const ym = evaluarPunto(xm);

        if (ym === null || !Number.isFinite(ym) || Math.abs(ym) > 1e6) {
          discontinuidadesEvitadas++;
          continue;
        }

        const maxExtremos = Math.max(Math.abs(p1.y), Math.abs(p2.y));
        if (maxExtremos > 5 && Math.abs(ym) > maxExtremos * 10) {
          discontinuidadesEvitadas++;
          continue;
        }

        const denominador = p2.y - p1.y;
        let estimacion = xm;
        if (Math.abs(denominador) > 1e-12) {
          estimacion = p1.x - p1.y * ((p2.x - p1.x) / denominador);
          if (estimacion < p1.x || estimacion > p2.x) {
            estimacion = xm;
          }
        }

        intervalosCandidatos.push({
          a: p1.x,
          b: p2.x,
          fa: p1.y,
          fb: p2.y,
          puntoMedio: xm,
          estimacionRaiz: estimacion,
        });
      }
    }

    for (let i = 1; i < puntos.length - 1; i++) {
      const ant = puntos[i - 1];
      const act = puntos[i];
      const sig = puntos[i + 1];

      if (!ant.evaluable || !act.evaluable || !sig.evaluable) continue;

      const modAnt = Math.abs(ant.y);
      const modAct = Math.abs(act.y);
      const modSig = Math.abs(sig.y);

      if (modAct < modAnt && modAct < modSig && modAct < 0.05) {
        const yaIncluido = intervalosCandidatos.some(
          (c) => Math.abs(c.estimacionRaiz - act.x) < (sig.x - ant.x)
        );
        if (!yaIncluido) {
          zonasCercanasCero.push({
            x: act.x,
            fx: act.y,
            moduloFx: modAct,
            razon: `Mínimo local observado de |f(x)| = ${modAct.toPrecision(4)} sin cambio de signo (posible raíz par o contacto tangencial).`,
          });
        }
      }
    }

    return { intervalosCandidatos, zonasCercanasCero, discontinuidadesEvitadas };
  }
}
