import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import JXG from 'jsxgraph';
import { AnalizadorExpresiones } from '../../core/matematicas/analizador-expresiones';
import { EvaluadorExpresiones } from '../../core/matematicas/evaluador-expresiones';
import type { IntervaloCandidato } from '../../core/analisis-funciones/modelos-analisis';

@Component({
  selector: 'app-grafica-general',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grafica-toolbar">
      <span>Vista previa: <strong>y = f(x)</strong></span>
      <span class="leyenda">
        <span><i class="curva"></i> f(x)</span>
        @if (intervalosCandidatos().length > 0) {
          <span><i class="candidato"></i> Cambio de signo</span>
        }
      </span>
      <button type="button" (click)="reiniciar()">Reiniciar vista</button>
    </div>
    <div #contenedor class="jxgbox" aria-label="Gráfica general interactiva de la función"></div>
  `,
  styleUrl: './grafica-general.scss',
})
export class GraficaGeneral implements OnDestroy {
  readonly expresion = input.required<string>();
  readonly intervalosCandidatos = input<IntervaloCandidato[]>([]);
  readonly rango = input<{ desde: number; hasta: number }>({ desde: -10, hasta: 10 });

  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedor');
  private readonly analizador = new AnalizadorExpresiones();
  private readonly evaluador = new EvaluadorExpresiones();
  private tablero?: JXG.Board;
  private observador?: ResizeObserver;
  private cuadroRedimension?: number;
  private ultimoTamano = { ancho: 0, alto: 0 };
  private boundingBoxOriginal: [number, number, number, number] = [-10, 10, 10, -10];

  constructor() {
    effect(() => {
      const contenedor = this.contenedor();
      const exp = this.expresion();
      const candidatos = this.intervalosCandidatos();
      const rg = this.rango();
      if (contenedor && exp.trim()) {
        this.dibujar(contenedor.nativeElement, exp, candidatos, rg);
      }
    });

    effect(() => {
      const elemento = this.contenedor()?.nativeElement;
      if (!elemento || typeof ResizeObserver === 'undefined') return;
      this.observador?.disconnect();
      this.observador = new ResizeObserver(([entrada]) => {
        const ancho = Math.round(entrada.contentRect.width);
        const alto = Math.round(entrada.contentRect.height);
        if (!ancho || !alto || (ancho === this.ultimoTamano.ancho && alto === this.ultimoTamano.alto)) return;
        this.ultimoTamano = { ancho, alto };
        if (this.cuadroRedimension) cancelAnimationFrame(this.cuadroRedimension);
        this.cuadroRedimension = requestAnimationFrame(() => {
          this.tablero?.resizeContainer(ancho, alto);
        });
      });
      this.observador.observe(elemento);
    });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
    if (this.cuadroRedimension) cancelAnimationFrame(this.cuadroRedimension);
    if (this.tablero) {
      JXG.JSXGraph.freeBoard(this.tablero);
    }
  }

  reiniciar(): void {
    if (!this.tablero) return;
    this.tablero.setBoundingBox(this.boundingBoxOriginal, false);
  }

  private dibujar(
    elemento: HTMLDivElement,
    expresionTexto: string,
    candidatos: IntervaloCandidato[],
    rango: { desde: number; hasta: number }
  ): void {
    if (this.tablero) {
      JXG.JSXGraph.freeBoard(this.tablero);
      this.tablero = undefined;
    }

    let funcionEvaluable: (x: number) => number;
    try {
      const analizada = this.analizador.analizar(expresionTexto);
      funcionEvaluable = this.evaluador.compilar(analizada);
    } catch {
      return;
    }

    const xMin = rango.desde;
    const xMax = rango.hasta;

    let yMin = -5;
    let yMax = 5;
    const muestras = 50;
    const paso = (xMax - xMin) / muestras;
    const valoresY: number[] = [];

    for (let i = 0; i <= muestras; i++) {
      const x = xMin + i * paso;
      try {
        const y = funcionEvaluable(x);
        if (Number.isFinite(y)) {
          valoresY.push(y);
        }
      } catch {
      }
    }

    if (valoresY.length > 0) {
      const minCalculado = Math.min(...valoresY);
      const maxCalculado = Math.max(...valoresY);
      const margen = Math.max(1, (maxCalculado - minCalculado) * 0.15);
      yMin = Math.max(-100, minCalculado - margen);
      yMax = Math.min(100, maxCalculado + margen);
    }

    if (yMin >= yMax) {
      yMin = -10;
      yMax = 10;
    }

    this.boundingBoxOriginal = [xMin - 1, yMax, xMax + 1, yMin];

    const tableroId = `jxgbox-general-${Math.random().toString(36).substring(2, 9)}`;
    elemento.id = tableroId;

    this.tablero = JXG.JSXGraph.initBoard(tableroId, {
      boundingbox: this.boundingBoxOriginal,
      axis: true,
      showNavigation: false,
      showCopyright: false,
      pan: { enabled: true, needShift: false },
      zoom: { factorX: 1.25, factorY: 1.25, wheel: true, needShift: false },
    });

    const fnSegura = (x: number): number => {
      try {
        const y = funcionEvaluable(x);
        return Number.isFinite(y) ? y : NaN;
      } catch {
        return NaN;
      }
    };

    this.tablero.create('functiongraph', [fnSegura, xMin - 5, xMax + 5], {
      strokeColor: '#2563eb',
      strokeWidth: 2.5,
      highlight: false,
    });

    for (const [idx, c] of candidatos.entries()) {
      const xm = c.estimacionRaiz;
      this.tablero.create('point', [xm, 0], {
        name: `c${idx + 1} (${xm.toFixed(2)})`,
        size: 5,
        strokeColor: '#059669',
        fillColor: '#10b981',
        fixed: true,
        withLabel: true,
        label: { offset: [0, 14], color: '#047857', fontSize: 11 },
      });

      if (Math.abs(c.b - c.a) > 1e-4) {
        this.tablero.create(
          'segment',
          [
            [c.a, 0],
            [c.b, 0],
          ],
          {
            strokeColor: '#10b981',
            strokeWidth: 4,
            fixed: true,
            highlight: false,
          }
        );
      }
    }
  }
}
