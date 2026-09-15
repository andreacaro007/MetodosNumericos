import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import type { IteracionPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';

@Component({ selector: 'app-tabla-punto-fijo', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './tabla-punto-fijo.html', styleUrl: '../tabla-iteraciones/tabla-iteraciones.scss' })
export class TablaPuntoFijo {
  readonly iteraciones = input.required<readonly IteracionPuntoFijo[]>();
  readonly indiceActivo = input.required<number>();
  readonly seleccionar = output<number>();
}
