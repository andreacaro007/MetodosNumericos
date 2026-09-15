import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';
import { ConstructorPasosNewton } from '../../core/metodos-numericos/newton/constructor-pasos-newton';
import type { IteracionNewton } from '../../core/metodos-numericos/newton/modelos-newton';

@Component({ selector: 'app-paso-a-paso-newton', imports: [VisualizadorMatematico], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: '../paso-a-paso/paso-a-paso.html', styleUrl: '../paso-a-paso/paso-a-paso.scss' })
export class PasoAPasoNewton {
  readonly iteracion = input.required<IteracionNewton>();
  readonly expresionLatex = input.required<string>();
  readonly derivadaLatex = input.required<string>();
  readonly expresionNormalizada = input.required<string>();
  readonly derivadaNormalizada = input.required<string>();
  private readonly constructorPasos = new ConstructorPasosNewton();
  readonly pasos = computed(() => this.constructorPasos.construir(this.iteracion(), this.expresionLatex(), this.derivadaLatex(), this.expresionNormalizada(), this.derivadaNormalizada()));
}
