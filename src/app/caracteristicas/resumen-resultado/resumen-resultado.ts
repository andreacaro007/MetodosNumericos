import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ResultadoBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ResultadoNewton } from '../../core/metodos-numericos/newton/modelos-newton';
import type { ResultadoPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';

export type ResultadoVisible = ResultadoBiseccion | ResultadoNewton | ResultadoPuntoFijo;

@Component({ selector: 'app-resumen-resultado', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './resumen-resultado.html', styleUrl: './resumen-resultado.scss' })
export class ResumenResultado {
  readonly resultado = input.required<ResultadoVisible>();
  readonly resultadoBiseccion = computed(() => {
    const resultado = this.resultado();
    return resultado.metodo === 'BISECCION' ? resultado as ResultadoBiseccion : undefined;
  });
  readonly resultadoPuntoFijo = computed(() => {
    const resultado = this.resultado();
    return resultado.metodo === 'PUNTO_FIJO' ? resultado as ResultadoPuntoFijo : undefined;
  });
  esAdvertencia(): boolean { return !['CONVERGENCIA_ALCANZADA', 'RAIZ_EXACTA'].includes(this.resultado().estado); }
}
