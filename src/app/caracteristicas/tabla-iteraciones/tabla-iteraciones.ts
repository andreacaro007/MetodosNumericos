import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { IteracionBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';

@Component({ selector: 'app-tabla-iteraciones', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './tabla-iteraciones.html', styleUrl: './tabla-iteraciones.scss' })
export class TablaIteraciones {
  readonly iteraciones = input.required<readonly IteracionBiseccion[]>();
  readonly indiceActivo = input.required<number>();
  readonly seleccionar = output<number>();
}
