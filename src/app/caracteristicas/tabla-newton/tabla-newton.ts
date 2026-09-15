import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';
import type { IteracionNewton } from '../../core/metodos-numericos/newton/modelos-newton';

@Component({ selector: 'app-tabla-newton', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './tabla-newton.html', styleUrl: '../tabla-iteraciones/tabla-iteraciones.scss' })
export class TablaNewton {
  readonly iteraciones = input.required<readonly IteracionNewton[]>();
  readonly indiceActivo = input.required<number>();
  readonly seleccionar = output<number>();
}

