import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CasoUsoCompararMetodos } from '../../aplicacion/caso-uso-comparar-metodos';
import { GeneradorReporteMarkdown } from '../../aplicacion/generador-reporte-markdown';
import { descargarMarkdown } from '../../compartido/descargar-markdown';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import type {
  ConfiguracionComparacion,
  EstadoComparacion,
  ResultadoComparacion,
} from '../../core/comparacion/modelos-comparacion';
import type { MetodoNumerico } from '../../core/metodos-numericos/compartido/modelos-solucion';

const CONFIGURACION_VACIA: ConfiguracionComparacion = {
  expresion: '',
  expresionIteracion: '',
  extremoIzquierdo: null,
  extremoDerecho: null,
  valorInicial: null,
  tolerancia: 0.000001,
  maximoIteraciones: 100,
};

@Component({
  selector: 'app-panel-comparacion',
  imports: [FormatearNumeroPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-comparacion.html',
  styleUrl: './panel-comparacion.scss',
})
export class PanelComparacion {
  readonly configuracion = input<ConfiguracionComparacion>(CONFIGURACION_VACIA);

  private readonly casoUso = new CasoUsoCompararMetodos();
  private readonly generador = new GeneradorReporteMarkdown();
  private readonly resultadoGuardado = signal<
    { firma: string; resultado: ResultadoComparacion } | undefined
  >(undefined);

  readonly disponibilidades = computed(() =>
    this.casoUso.evaluarDisponibilidad(this.configuracion())
  );
  readonly resultado = computed(() => {
    const guardado = this.resultadoGuardado();
    return guardado?.firma === this.firmaActual() ? guardado.resultado : undefined;
  });
  readonly hayMetodoDisponible = computed(() =>
    this.disponibilidades().some((metodo) => metodo.disponible)
  );

  comparar(): void {
    this.resultadoGuardado.set({
      firma: this.firmaActual(),
      resultado: this.casoUso.ejecutar(this.configuracion()),
    });
  }

  exportar(): void {
    const resultado = this.resultado();
    if (!resultado) return;
    descargarMarkdown(
      this.generador.generarComparacion(resultado),
      'comparacion-metodos.md'
    );
  }

  nombreMetodo(metodo: MetodoNumerico): string {
    const nombres: Record<MetodoNumerico, string> = {
      BISECCION: 'Bisección',
      NEWTON_RAPHSON: 'Newton-Raphson',
      PUNTO_FIJO: 'Punto Fijo',
    };
    return nombres[metodo];
  }

  estadoVisible(estado: EstadoComparacion): string {
    const estados: Record<EstadoComparacion, string> = {
      CONVERGENCIA_ALCANZADA: 'Convergió',
      RAIZ_EXACTA: 'Raíz exacta',
      MAXIMO_ITERACIONES: 'Máximo de iteraciones',
      DERIVADA_CERO: 'Derivada cero',
      DERIVADA_CASI_CERO: 'Derivada casi cero',
      VALOR_NO_FINITO: 'Valor no finito',
      POSIBLE_DIVERGENCIA: 'Posible divergencia',
      NO_DISPONIBLE: 'No disponible',
      ERROR_VALIDACION: 'No ejecutado',
    };
    return estados[estado];
  }

  estadoFavorable(estado: EstadoComparacion): boolean {
    return estado === 'CONVERGENCIA_ALCANZADA' || estado === 'RAIZ_EXACTA';
  }

  private firmaActual(): string {
    return JSON.stringify(this.configuracion());
  }
}
