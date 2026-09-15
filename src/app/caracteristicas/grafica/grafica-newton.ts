import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import JXG from 'jsxgraph';
import { AnalizadorExpresiones } from '../../core/matematicas/analizador-expresiones';
import { EvaluadorExpresiones } from '../../core/matematicas/evaluador-expresiones';
import type { IteracionNewton } from '../../core/metodos-numericos/newton/modelos-newton';

@Component({ selector: 'app-grafica-newton', changeDetection: ChangeDetectionStrategy.OnPush, template: '<div class="grafica-toolbar"><span>Newton-Raphson</span><span class="leyenda"><i class="p"></i>Pₙ <i class="t"></i>Tangente <i class="r"></i>Raíz</span><button type="button" (click)="reiniciar()">Reiniciar vista</button></div><div #contenedor class="jxgbox" aria-label="Gráfica de Newton-Raphson con la tangente de la iteración activa"></div>', styleUrl: './grafica-newton.scss' })
export class GraficaNewton implements OnDestroy {
  readonly expresion = input.required<string>();
  readonly iteracion = input.required<IteracionNewton>();
  readonly raiz = input.required<number>();
  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedor');
  private readonly analizador = new AnalizadorExpresiones();
  private readonly evaluador = new EvaluadorExpresiones();
  private tablero?: JXG.Board;
  private observador?: ResizeObserver;

  constructor() {
    effect(() => { const contenedor = this.contenedor(); this.expresion(); this.iteracion(); this.raiz(); if (contenedor) this.dibujar(contenedor.nativeElement); });
    effect(() => {
      const elemento = this.contenedor()?.nativeElement;
      if (!elemento || typeof ResizeObserver === 'undefined') return;
      this.observador?.disconnect();
      this.observador = new ResizeObserver(() => { if (this.tablero && elemento.clientWidth && elemento.clientHeight) { this.tablero.resizeContainer(elemento.clientWidth, elemento.clientHeight); this.tablero.fullUpdate(); } });
      this.observador.observe(elemento);
    });
  }

  reiniciar(): void { const elemento = this.contenedor()?.nativeElement; if (elemento) this.dibujar(elemento); }
  ngOnDestroy(): void { this.observador?.disconnect(); if (this.tablero) JXG.JSXGraph.freeBoard(this.tablero); }

  private dibujar(elemento: HTMLDivElement): void {
    if (this.tablero) JXG.JSXGraph.freeBoard(this.tablero);
    const iteracion = this.iteracion();
    const funcion = this.evaluador.compilar(this.analizador.analizar(this.expresion()));
    const siguiente = iteracion.siguienteX ?? iteracion.xActual;
    const puntos = [iteracion.xActual, siguiente, this.raiz()].filter(Number.isFinite);
    const minimo = Math.min(...puntos); const maximo = Math.max(...puntos);
    const amplitudBase = Math.max(maximo - minimo, Math.abs(iteracion.xActual) * .35, 1);
    const amplitud = Math.min(Math.max(amplitudBase, 1), 1e4);
    const centro = (minimo + maximo) / 2;
    const xMin = centro - amplitud * .85; const xMax = centro + amplitud * .85;
    const muestras = Array.from({ length: 180 }, (_, indice) => { const x = xMin + indice / 179 * (xMax - xMin); try { return Math.abs(funcion(x)); } catch { return 0; } });
    const valoresRelevantes = [Math.abs(iteracion.valorFuncion), ...muestras.filter(Number.isFinite).sort((a, b) => a - b).slice(0, 162)];
    const yMax = Math.max(1, Math.min(1e4, Math.max(...valoresRelevantes) * 1.2));
    this.tablero = JXG.JSXGraph.initBoard(elemento, { boundingbox: [xMin, yMax, xMax, -yMax], axis: true, showCopyright: false, showNavigation: false, pan: { enabled: true }, zoom: { factorX: 1.25, factorY: 1.25, wheel: true } });
    const tablero = this.tablero;
    tablero.create('functiongraph', [(x: number) => { try { return funcion(x); } catch { return Number.NaN; } }, xMin, xMax], { strokeColor: '#14201c', strokeWidth: 2.5, highlight: false });
    tablero.create('line', [[0, 0], [1, 0]], { strokeColor: '#84908a', strokeWidth: 1, fixed: true, highlight: false });
    tablero.create('point', [iteracion.xActual, iteracion.valorFuncion], { name: 'Pₙ', size: 4, fillColor: '#e26a3f', strokeColor: '#fff', strokeWidth: 2, fixed: true, highlight: false });
    tablero.create('segment', [[iteracion.xActual, 0], [iteracion.xActual, iteracion.valorFuncion]], { strokeColor: '#e26a3f', dash: 2, fixed: true, highlight: false });
    if (iteracion.siguienteX !== undefined) {
      tablero.create('line', [[iteracion.xActual, iteracion.valorFuncion], [iteracion.siguienteX, 0]], { strokeColor: '#759000', strokeWidth: 2.2, fixed: true, highlight: false });
      tablero.create('point', [iteracion.siguienteX, 0], { name: 'xₙ₊₁', size: 4, fillColor: '#759000', strokeColor: '#fff', strokeWidth: 2, fixed: true, highlight: false });
    }
    tablero.create('point', [this.raiz(), 0], { name: 'raíz', size: 3, face: 'diamond', fillColor: '#14201c', strokeColor: '#14201c', fixed: true, highlight: false });
  }
}

