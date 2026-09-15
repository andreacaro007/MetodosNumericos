import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import {
  EntradaFuncion,
  type MetodoDisponible,
  type SolicitudResolucion,
} from '../../caracteristicas/entrada-funcion/entrada-funcion';
import { ResumenResultado } from '../../caracteristicas/resumen-resultado/resumen-resultado';
import { TablaIteraciones } from '../../caracteristicas/tabla-iteraciones/tabla-iteraciones';
import { TablaNewton } from '../../caracteristicas/tabla-newton/tabla-newton';
import { TablaPuntoFijo } from '../../caracteristicas/tabla-punto-fijo/tabla-punto-fijo';
import { PasoAPaso } from '../../caracteristicas/paso-a-paso/paso-a-paso';
import { PasoAPasoNewton } from '../../caracteristicas/paso-a-paso-newton/paso-a-paso-newton';
import { PasoAPasoPuntoFijo } from '../../caracteristicas/paso-a-paso-punto-fijo/paso-a-paso-punto-fijo';
import { GraficaBiseccion } from '../../caracteristicas/grafica/grafica-biseccion';
import { GraficaNewton } from '../../caracteristicas/grafica/grafica-newton';
import { GraficaPuntoFijo } from '../../caracteristicas/grafica/grafica-punto-fijo';
import { PanelAnalisis } from '../../caracteristicas/panel-analisis/panel-analisis';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import { CasoUsoResolverNewton } from '../../aplicacion/caso-uso-resolver-newton';
import { CasoUsoResolverPuntoFijo } from '../../aplicacion/caso-uso-resolver-punto-fijo';
import type { ResultadoBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ResultadoNewton } from '../../core/metodos-numericos/newton/modelos-newton';
import type { ResultadoPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';

export type Pestana = 'resumen' | 'grafica' | 'iteraciones' | 'pasos' | 'analisis';
type ResultadoAplicacion = ResultadoBiseccion | ResultadoNewton | ResultadoPuntoFijo;

const CONFIGURACION_METODO: Record<
  MetodoDisponible,
  { titulo: string; descripcion: string; instruccion: string; simbolo: string }
> = {
  BISECCION: {
    titulo: 'Método de Bisección',
    descripcion: 'Divide el intervalo y conserva la mitad que mantiene el cambio de signo.',
    instruccion: 'Ingresa una función y un intervalo para comenzar.',
    simbolo: '½',
  },
  NEWTON_RAPHSON: {
    titulo: 'Método de Newton-Raphson',
    descripcion: 'Sigue la tangente desde xₙ hasta su intersección con el eje X.',
    instruccion: 'Ingresa una función y un valor inicial x₀ para comenzar.',
    simbolo: "f'",
  },
  PUNTO_FIJO: {
    titulo: 'Método de Punto Fijo',
    descripcion: 'Busca una solución mediante la iteración xₙ₊₁ = g(xₙ).',
    instruccion: 'Ingresa f(x), una transformación g(x) y un valor inicial x₀ para comenzar.',
    simbolo: '↗',
  },
};

@Component({
  selector: 'app-calculadora',
  imports: [
    EntradaFuncion,
    ResumenResultado,
    TablaIteraciones,
    TablaNewton,
    TablaPuntoFijo,
    PasoAPaso,
    PasoAPasoNewton,
    PasoAPasoPuntoFijo,
    GraficaBiseccion,
    GraficaNewton,
    GraficaPuntoFijo,
    PanelAnalisis,
    VisualizadorMatematico,
    FormatearNumeroPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.scss',
})
export class Calculadora implements OnDestroy {
  readonly entradaComponente = viewChild<EntradaFuncion>('entradaComponente');

  private readonly casoBiseccion = new CasoUsoResolverBiseccion();
  private readonly casoNewton = new CasoUsoResolverNewton();
  private readonly casoPuntoFijo = new CasoUsoResolverPuntoFijo();

  readonly metodo = signal<MetodoDisponible>('BISECCION');
  readonly configuracion = computed(() => CONFIGURACION_METODO[this.metodo()]);

  readonly expresionActual = signal<string>('');
  readonly resultado = signal<ResultadoAplicacion | undefined>(undefined);

  readonly resultadoBiseccion = computed<ResultadoBiseccion | undefined>(() => {
    const resultado = this.resultado();
    return resultado?.metodo === 'BISECCION' ? (resultado as ResultadoBiseccion) : undefined;
  });

  readonly resultadoNewton = computed<ResultadoNewton | undefined>(() => {
    const resultado = this.resultado();
    return resultado?.metodo === 'NEWTON_RAPHSON' ? (resultado as ResultadoNewton) : undefined;
  });

  readonly resultadoPuntoFijo = computed<ResultadoPuntoFijo | undefined>(() => {
    const resultado = this.resultado();
    return resultado?.metodo === 'PUNTO_FIJO' ? (resultado as ResultadoPuntoFijo) : undefined;
  });

  readonly error = signal<string | undefined>(undefined);
  readonly indiceActivo = signal(0);
  readonly pestana = signal<Pestana>('resumen');
  readonly reproduciendo = signal(false);
  private temporizador?: ReturnType<typeof setInterval>;

  readonly iteracionBiseccion = computed(
    () => this.resultadoBiseccion()?.iteraciones[this.indiceActivo()]
  );
  readonly iteracionNewton = computed(
    () => this.resultadoNewton()?.iteraciones[this.indiceActivo()]
  );
  readonly iteracionPuntoFijo = computed(
    () => this.resultadoPuntoFijo()?.iteraciones[this.indiceActivo()]
  );

  readonly pestanas: readonly { id: Pestana; nombre: string }[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'grafica', nombre: 'Gráfica' },
    { id: 'iteraciones', nombre: 'Iteraciones' },
    { id: 'pasos', nombre: 'Paso a paso' },
    { id: 'analisis', nombre: 'Análisis científico' },
  ];

  @HostListener('window:keydown', ['$event'])
  manejarAtajos(evento: KeyboardEvent): void {
    if (evento.ctrlKey && evento.key === 'Enter') {
      evento.preventDefault();
      this.entradaComponente()?.enviar();
    } else if (evento.key === 'Escape') {
      if (this.reproduciendo()) {
        evento.preventDefault();
        this.detener();
      }
    }
  }

  resolver(solicitud: SolicitudResolucion): void {
    this.detener();
    this.error.set(undefined);
    this.metodo.set(solicitud.metodo);
    try {
      const resultado = this.ejecutarSolicitud(solicitud);
      this.resultado.set(resultado);
      this.indiceActivo.set(Math.max(0, resultado.iteraciones.length - 1));
      this.pestana.set('resumen');
    } catch (error) {
      this.resultado.set(undefined);
      const mensajes = {
        BISECCION: this.casoBiseccion,
        NEWTON_RAPHSON: this.casoNewton,
        PUNTO_FIJO: this.casoPuntoFijo,
      };
      this.error.set(mensajes[solicitud.metodo].mensaje(error));
    }
  }

  cambiarMetodo(metodo: MetodoDisponible): void {
    this.detener();
    this.metodo.set(metodo);
    this.resultado.set(undefined);
    this.error.set(undefined);
    this.indiceActivo.set(0);
    this.pestana.set('resumen');
  }

  actualizarExpresion(expresion: string): void {
    this.expresionActual.set(expresion);
  }

  cargarEnBiseccion(params: { a: number; b: number }): void {
    this.detener();
    this.metodo.set('BISECCION');
    this.resultado.set(undefined);
    this.error.set(undefined);
    this.indiceActivo.set(0);
    this.pestana.set('resumen');
    this.entradaComponente()?.establecerMetodo('BISECCION', true);
    this.entradaComponente()?.cargarIntervalo(params.a, params.b);
  }

  cargarEnNewton(params: { x0: number }): void {
    this.detener();
    this.metodo.set('NEWTON_RAPHSON');
    this.resultado.set(undefined);
    this.error.set(undefined);
    this.indiceActivo.set(0);
    this.pestana.set('resumen');
    this.entradaComponente()?.establecerMetodo('NEWTON_RAPHSON', true);
    this.entradaComponente()?.cargarValorInicial(params.x0);
  }

  anterior(): void {
    this.indiceActivo.update((indice) => Math.max(0, indice - 1));
  }

  siguiente(): void {
    const ultimo = (this.resultado()?.iteraciones.length ?? 1) - 1;
    this.indiceActivo.update((indice) => Math.min(ultimo, indice + 1));
  }

  inicio(): void {
    this.indiceActivo.set(0);
  }

  final(): void {
    this.indiceActivo.set(Math.max(0, (this.resultado()?.iteraciones.length ?? 1) - 1));
  }

  reproducir(): void {
    if (this.reproduciendo()) {
      this.detener();
      return;
    }
    if (this.indiceActivo() >= (this.resultado()?.iteraciones.length ?? 1) - 1) this.inicio();
    this.reproduciendo.set(true);
    this.temporizador = setInterval(() => {
      const ultimo = (this.resultado()?.iteraciones.length ?? 1) - 1;
      if (this.indiceActivo() >= ultimo) this.detener();
      else this.siguiente();
    }, 850);
  }

  detener(): void {
    if (this.temporizador) clearInterval(this.temporizador);
    this.temporizador = undefined;
    this.reproduciendo.set(false);
  }

  ngOnDestroy(): void {
    this.detener();
  }

  private ejecutarSolicitud(solicitud: SolicitudResolucion): ResultadoAplicacion {
    switch (solicitud.metodo) {
      case 'BISECCION':
        return this.casoBiseccion.ejecutar(solicitud.parametros);
      case 'NEWTON_RAPHSON':
        return this.casoNewton.ejecutar(solicitud.parametros);
      case 'PUNTO_FIJO':
        return this.casoPuntoFijo.ejecutar(solicitud.parametros);
    }
  }
}

