import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CasoUsoAnalizarFuncion } from '../../aplicacion/caso-uso-analizar-funcion';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import { GraficaGeneral } from '../grafica/grafica-general';
import type {
  AnalisisFuncion,
  EvaluacionPuntual,
  IntervaloCandidato,
  ResultadoExploracion,
  SugerenciaNewton,
} from '../../core/analisis-funciones/modelos-analisis';
import type { MetodoDisponible } from '../entrada-funcion/entrada-funcion';

@Component({
  selector: 'app-panel-analisis',
  imports: [VisualizadorMatematico, FormatearNumeroPipe, GraficaGeneral],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-analisis.html',
  styleUrl: './panel-analisis.scss',
})
export class PanelAnalisis {
  readonly expresion = input<string>('');
  readonly cambioMetodo = output<MetodoDisponible>();
  readonly cargarParametrosBiseccion = output<{ a: number; b: number }>();
  readonly cargarParametrosNewton = output<{ x0: number }>();

  private readonly casoAnalizar = new CasoUsoAnalizarFuncion();

  readonly analisis = signal<AnalisisFuncion | undefined>(undefined);
  readonly exploracion = signal<ResultadoExploracion | undefined>(undefined);
  readonly evaluacionPuntual = signal<EvaluacionPuntual | undefined>(undefined);
  readonly errorAnalisis = signal<string | undefined>(undefined);
  readonly errorEvaluacion = signal<string | undefined>(undefined);
  readonly mensajeTransferencia = signal<string | undefined>(undefined);

  readonly puntoX = signal<number>(2);
  readonly rangoDesde = signal<number>(-10);
  readonly rangoHasta = signal<number>(10);
  readonly muestras = signal<number>(1000);
  readonly puntosNoEvaluables = computed(() =>
    (this.exploracion()?.puntos ?? []).filter((punto) => !punto.evaluable).slice(0, 5)
  );

  constructor() {
    effect(() => {
      const exp = this.expresion().trim();
      if (!exp) {
        this.analisis.set(undefined);
        this.exploracion.set(undefined);
        this.evaluacionPuntual.set(undefined);
        this.errorAnalisis.set(undefined);
        this.errorEvaluacion.set(undefined);
        return;
      }
      this.ejecutarAnalisis(exp);
    });
  }

  ejecutarAnalisis(expTexto: string): void {
    try {
      this.errorAnalisis.set(undefined);
      const resultado = this.casoAnalizar.analizar(expTexto);
      this.analisis.set(resultado);

      this.evaluarPunto();
      this.ejecutarExploracion();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar la función';
      this.errorAnalisis.set(msg);
      this.analisis.set(undefined);
      this.exploracion.set(undefined);
    }
  }

  evaluarPunto(): void {
    const an = this.analisis();
    if (!an) return;
    const x = this.puntoX();
    try {
      this.errorEvaluacion.set(undefined);
      const res = this.casoAnalizar.evaluarPuntual(an.expresion, x);
      this.evaluacionPuntual.set(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo evaluar en el punto indicado';
      this.errorEvaluacion.set(msg);
      this.evaluacionPuntual.set(undefined);
    }
  }

  ejecutarExploracion(): void {
    const an = this.analisis();
    if (!an) return;
    try {
      const res = this.casoAnalizar.explorar(an.expresion, an.derivada, {
        desde: this.rangoDesde(),
        hasta: this.rangoHasta(),
        muestras: this.muestras(),
      });
      this.exploracion.set(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al explorar el intervalo';
      this.errorAnalisis.set(msg);
    }
  }

  actualizarPuntoX(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    if (Number.isFinite(valor)) {
      this.puntoX.set(valor);
    }
  }

  actualizarRangoDesde(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    if (Number.isFinite(valor)) {
      this.rangoDesde.set(valor);
    }
  }

  actualizarRangoHasta(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    if (Number.isFinite(valor)) {
      this.rangoHasta.set(valor);
    }
  }

  actualizarMuestras(evento: Event): void {
    const valor = Number((evento.target as HTMLInputElement).value);
    if (Number.isFinite(valor)) {
      this.muestras.set(valor);
    }
  }

  usarEnBiseccion(candidato: IntervaloCandidato): void {
    this.cambioMetodo.emit('BISECCION');
    this.cargarParametrosBiseccion.emit({ a: candidato.a, b: candidato.b });
    this.mensajeTransferencia.set(
      `Intervalo [${candidato.a.toFixed(4)}, ${candidato.b.toFixed(4)}] transferido a Bisección. Pulsa 'Resolver' en el panel de configuración cuando desees ejecutar el método.`
    );
    setTimeout(() => this.mensajeTransferencia.set(undefined), 6000);
  }

  usarEnNewton(sugerencia: SugerenciaNewton): void {
    this.cambioMetodo.emit('NEWTON_RAPHSON');
    this.cargarParametrosNewton.emit({ x0: sugerencia.x0 });
    this.mensajeTransferencia.set(
      `Valor inicial x₀ = ${sugerencia.x0} transferido a Newton-Raphson. Pulsa 'Resolver' en el panel de configuración cuando desees ejecutar el método.`
    );
    setTimeout(() => this.mensajeTransferencia.set(undefined), 6000);
  }
}
