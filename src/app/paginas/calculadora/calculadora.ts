import { ChangeDetectionStrategy, Component, computed, OnDestroy, signal } from '@angular/core';
import { EntradaFuncion } from '../../caracteristicas/entrada-funcion/entrada-funcion';
import { ResumenResultado } from '../../caracteristicas/resumen-resultado/resumen-resultado';
import { TablaIteraciones } from '../../caracteristicas/tabla-iteraciones/tabla-iteraciones';
import { PasoAPaso } from '../../caracteristicas/paso-a-paso/paso-a-paso';
import { GraficaBiseccion } from '../../caracteristicas/grafica/grafica-biseccion';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import type { ParametrosBiseccion, ResultadoBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';

type Pestana = 'resumen' | 'grafica' | 'iteraciones' | 'pasos' | 'analisis';

@Component({
  selector: 'app-calculadora',
  imports: [EntradaFuncion, ResumenResultado, TablaIteraciones, PasoAPaso, GraficaBiseccion, VisualizadorMatematico, FormatearNumeroPipe],
  changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './calculadora.html', styleUrl: './calculadora.scss',
})
export class Calculadora implements OnDestroy {
  private readonly casoUso = new CasoUsoResolverBiseccion();
  readonly resultado = signal<ResultadoBiseccion | undefined>(undefined);
  readonly error = signal<string | undefined>(undefined);
  readonly indiceActivo = signal(0);
  readonly pestana = signal<Pestana>('resumen');
  readonly reproduciendo = signal(false);
  private temporizador?: ReturnType<typeof setInterval>;
  readonly iteracionActiva = computed(() => this.resultado()?.iteraciones[this.indiceActivo()]);
  readonly pestanas: readonly { id: Pestana; nombre: string }[] = [
    { id: 'resumen', nombre: 'Resumen' }, { id: 'grafica', nombre: 'Gráfica' },
    { id: 'iteraciones', nombre: 'Iteraciones' }, { id: 'pasos', nombre: 'Paso a paso' }, { id: 'analisis', nombre: 'Análisis' },
  ];

  resolver(parametros: ParametrosBiseccion): void {
    this.detener(); this.error.set(undefined);
    try {
      const resultado = this.casoUso.ejecutar(parametros);
      this.resultado.set(resultado);
      this.indiceActivo.set(Math.max(0, resultado.iteraciones.length - 1));
      this.pestana.set('resumen');
    } catch (error) {
      this.resultado.set(undefined); this.error.set(this.casoUso.mensaje(error));
    }
  }

  anterior(): void { this.indiceActivo.update((i) => Math.max(0, i - 1)); }
  siguiente(): void {
    const ultimo = (this.resultado()?.iteraciones.length ?? 1) - 1;
    this.indiceActivo.update((i) => Math.min(ultimo, i + 1));
  }
  inicio(): void { this.indiceActivo.set(0); }
  final(): void { this.indiceActivo.set(Math.max(0, (this.resultado()?.iteraciones.length ?? 1) - 1)); }
  reproducir(): void {
    if (this.reproduciendo()) { this.detener(); return; }
    if (this.indiceActivo() >= (this.resultado()?.iteraciones.length ?? 1) - 1) this.inicio();
    this.reproduciendo.set(true);
    this.temporizador = setInterval(() => {
      const ultimo = (this.resultado()?.iteraciones.length ?? 1) - 1;
      if (this.indiceActivo() >= ultimo) this.detener(); else this.siguiente();
    }, 850);
  }
  detener(): void { if (this.temporizador) clearInterval(this.temporizador); this.temporizador = undefined; this.reproduciendo.set(false); }
  ngOnDestroy(): void { this.detener(); }
}
