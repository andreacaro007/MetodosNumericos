import { ChangeDetectionStrategy, Component, ElementRef, effect, input, viewChild } from '@angular/core';
import JXG from 'jsxgraph';
import { AnalizadorExpresiones } from '../../core/matematicas/analizador-expresiones';
import { EvaluadorExpresiones } from '../../core/matematicas/evaluador-expresiones';
import type { IteracionBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';

@Component({
  selector: 'app-grafica-biseccion', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="grafica-toolbar"><span>y = f(x)</span><span class="leyenda"><i class="a"></i>a <i class="m"></i>xₘ <i class="b"></i>b</span><button type="button" (click)="reiniciar()">Reiniciar vista</button></div><div #contenedor class="jxgbox" aria-label="Gráfica interactiva de la función y el intervalo activo"></div>`,
  styleUrl: './grafica-biseccion.scss',
})
export class GraficaBiseccion {
  readonly expresion = input.required<string>();
  readonly iteracion = input.required<IteracionBiseccion>();
  readonly raiz = input.required<number>();
  private readonly contenedor = viewChild<ElementRef<HTMLDivElement>>('contenedor');
  private readonly analizador = new AnalizadorExpresiones();
  private readonly evaluador = new EvaluadorExpresiones();
  private tablero?: JXG.Board;

  constructor() {
    effect(() => {
      const contenedor = this.contenedor();
      this.expresion(); this.iteracion(); this.raiz();
      if (contenedor) this.dibujar(contenedor.nativeElement);
    });
  }

  reiniciar(): void {
    const contenedor = this.contenedor();
    if (contenedor) this.dibujar(contenedor.nativeElement);
  }

  private dibujar(elemento: HTMLDivElement): void {
    if (this.tablero) JXG.JSXGraph.freeBoard(this.tablero);
    const iteracion = this.iteracion();
    const funcion = this.evaluador.compilar(this.analizador.analizar(this.expresion()));
    const amplitud = Math.max(iteracion.extremoDerecho - iteracion.extremoIzquierdo, 1);
    const xMin = iteracion.extremoIzquierdo - amplitud * 0.45;
    const xMax = iteracion.extremoDerecho + amplitud * 0.45;
    const muestras = Array.from({ length: 160 }, (_, indice) => {
      const x = xMin + (indice / 159) * (xMax - xMin);
      try { return Math.abs(funcion(x)); } catch { return 0; }
    });
    const yMax = Math.max(1, Math.min(50, Math.max(...muestras.filter(Number.isFinite)) * 1.25));
    this.tablero = JXG.JSXGraph.initBoard(elemento, {
      boundingbox: [xMin, yMax, xMax, -yMax], axis: true, showCopyright: false,
      showNavigation: false, pan: { enabled: true }, zoom: { factorX: 1.25, factorY: 1.25, wheel: true },
    });
    const tablero = this.tablero;
    tablero.create('functiongraph', [(x: number) => { try { return funcion(x); } catch { return Number.NaN; } }, xMin, xMax], { strokeColor: '#14201c', strokeWidth: 2.5, highlight: false });
    tablero.create('segment', [[iteracion.extremoIzquierdo, 0], [iteracion.extremoDerecho, 0]], { strokeColor: '#a7c922', strokeWidth: 8, strokeOpacity: .28, fixed: true, highlight: false });
    this.punto(tablero, iteracion.extremoIzquierdo, funcion(iteracion.extremoIzquierdo), 'a', '#e26a3f');
    this.punto(tablero, iteracion.extremoDerecho, funcion(iteracion.extremoDerecho), 'b', '#27698c');
    this.punto(tablero, iteracion.puntoMedio, iteracion.valorPuntoMedio, 'xₘ', '#759000');
    tablero.create('point', [this.raiz(), 0], { name: 'raíz', size: 3, face: 'diamond', fillColor: '#14201c', strokeColor: '#14201c', fixed: true, highlight: false });
  }

  private punto(tablero: JXG.Board, x: number, y: number, nombre: string, color: string): void {
    tablero.create('point', [x, y], { name: nombre, size: 4, fillColor: color, strokeColor: '#ffffff', strokeWidth: 2, fixed: true, highlight: false });
    tablero.create('segment', [[x, 0], [x, y]], { strokeColor: color, dash: 2, strokeWidth: 1.2, fixed: true, highlight: false });
  }
}
