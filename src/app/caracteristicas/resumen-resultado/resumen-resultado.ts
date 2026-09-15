import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ResultadoBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ResultadoNewton } from '../../core/metodos-numericos/newton/modelos-newton';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';

export type ResultadoVisible = ResultadoBiseccion | ResultadoNewton;

@Component({ selector: 'app-resumen-resultado', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './resumen-resultado.html', styleUrl: './resumen-resultado.scss' })
export class ResumenResultado {
  readonly resultado = input.required<ResultadoVisible>();
  readonly resultadoBiseccion = computed(() => {
    const resultado = this.resultado();
    return resultado.metodo === 'BISECCION' ? resultado as ResultadoBiseccion : undefined;
  });
  esAdvertencia(): boolean { return !['CONVERGENCIA_ALCANZADA', 'RAIZ_EXACTA'].includes(this.resultado().estado); }
}
