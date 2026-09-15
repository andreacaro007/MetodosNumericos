import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { IteracionBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import { ConstructorPasosBiseccion } from '../../core/metodos-numericos/biseccion/constructor-pasos-biseccion';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';

@Component({ selector: 'app-paso-a-paso', imports: [VisualizadorMatematico], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './paso-a-paso.html', styleUrl: './paso-a-paso.scss' })
export class PasoAPaso {
  readonly iteracion = input.required<IteracionBiseccion>();
  readonly expresionLatex = input.required<string>();
  private readonly constructorPasos = new ConstructorPasosBiseccion();
  readonly pasos = computed(() => this.constructorPasos.construir(this.iteracion(), this.expresionLatex()));
}
