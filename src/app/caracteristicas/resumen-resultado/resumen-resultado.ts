import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ResultadoBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import { FormatearNumeroPipe } from '../../compartido/formatear-numero.pipe';

@Component({
  selector: 'app-resumen-resultado', imports: [FormatearNumeroPipe], changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-resultado.html', styleUrl: './resumen-resultado.scss',
})
export class ResumenResultado { readonly resultado = input.required<ResultadoBiseccion>(); }
