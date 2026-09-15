import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, viewChild } from '@angular/core';
import JXG from 'jsxgraph';
import { AnalizadorExpresiones } from '../../core/matematicas/analizador-expresiones';
import { EvaluadorExpresiones } from '../../core/matematicas/evaluador-expresiones';
import type { IteracionPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';

@Component({ selector: 'app-grafica-punto-fijo', changeDetection: ChangeDetectionStrategy.OnPush, template: '<div class="grafica-toolbar"><span>Punto Fijo · Cobweb</span><span class="leyenda"><i class="g"></i>g(x) <i class="identidad"></i>y=x <i class="cobweb"></i>Iteraciones <i class="r"></i>Punto fijo</span><button type="button" (click)="reiniciar()">Reiniciar vista</button></div><div #contenedor class="jxgbox" aria-label="Gráfica de Punto Fijo con curva g de x, recta identidad y diagrama de telaraña"></div>', styleUrl: './grafica-punto-fijo.scss' })
export class GraficaPuntoFijo implements OnDestroy {
  readonly expresionIteracion = input.required<string>();
  readonly iteraciones = input.required<readonly IteracionPuntoFijo[]>();
  readonly indiceActivo = input.required<number>();
  readonly raiz = input.required<number>();
  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedor');
  private readonly analizador = new AnalizadorExpresiones();
  private readonly evaluador = new EvaluadorExpresiones();
  private tablero?: JXG.Board;
  private observador?: ResizeObserver;

  constructor() {
    effect(() => { const contenedor = this.contenedor(); this.expresionIteracion(); this.iteraciones(); this.indiceActivo(); this.raiz(); if (contenedor) this.dibujar(contenedor.nativeElement); });
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
    const funcion = this.evaluador.compilar(this.analizador.analizar(this.expresionIteracion()));
    const visibles = this.iteraciones().slice(0, this.indiceActivo() + 1);
    const valores = [visibles[0]?.xActual, ...visibles.flatMap((iteracion) => [iteracion.xActual, iteracion.siguienteX]), this.raiz()].filter((valor): valor is number => Number.isFinite(valor) && Math.abs(valor) <= 1e6);
    const minimo = Math.min(...valores); const maximo = Math.max(...valores);
    const amplitud = Math.min(1e4, Math.max(maximo - minimo, Math.abs((minimo + maximo) / 2) * .35, 1));
    const centro = (minimo + maximo) / 2;
    const limiteInferior = centro - amplitud * .8; const limiteSuperior = centro + amplitud * .8;
    this.tablero = JXG.JSXGraph.initBoard(elemento, { boundingbox: [limiteInferior, limiteSuperior, limiteSuperior, limiteInferior], axis: true, showCopyright: false, showNavigation: false, pan: { enabled: true }, zoom: { factorX: 1.25, factorY: 1.25, wheel: true } });
    const tablero = this.tablero;
    tablero.create('functiongraph', [(x: number) => { try { return funcion(x); } catch { return Number.NaN; } }, limiteInferior, limiteSuperior], { strokeColor: '#14201c', strokeWidth: 2.6, highlight: false });
    tablero.create('line', [[0, 0], [1, 1]], { strokeColor: '#759000', strokeWidth: 2, dash: 2, fixed: true, highlight: false });
    for (const iteracion of visibles) {
      tablero.create('segment', [[iteracion.xActual, iteracion.xActual], [iteracion.xActual, iteracion.siguienteX]], { strokeColor: '#e26a3f', strokeWidth: 2, fixed: true, highlight: false });
      tablero.create('segment', [[iteracion.xActual, iteracion.siguienteX], [iteracion.siguienteX, iteracion.siguienteX]], { strokeColor: '#e26a3f', strokeWidth: 2, fixed: true, highlight: false });
    }
    const activa = visibles.at(-1);
    if (activa) tablero.create('point', [activa.xActual, activa.siguienteX], { name: 'iteración activa', size: 4, fillColor: '#e26a3f', strokeColor: '#fff', strokeWidth: 2, fixed: true, highlight: false });
    if (visibles[0]) tablero.create('point', [visibles[0].xActual, visibles[0].xActual], { name: 'x₀', size: 3, fillColor: '#577169', strokeColor: '#fff', fixed: true, highlight: false });
    tablero.create('point', [this.raiz(), this.raiz()], { name: 'punto fijo', size: 4, face: 'diamond', fillColor: '#14201c', strokeColor: '#14201c', fixed: true, highlight: false });
  }
}
