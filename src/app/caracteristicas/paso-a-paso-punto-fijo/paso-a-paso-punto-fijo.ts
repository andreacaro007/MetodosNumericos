import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';
import { ConstructorPasosPuntoFijo } from '../../core/metodos-numericos/punto-fijo/constructor-pasos-punto-fijo';
import type { IteracionPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';

@Component({ selector: 'app-paso-a-paso-punto-fijo', imports: [VisualizadorMatematico], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: '../paso-a-paso/paso-a-paso.html', styleUrl: '../paso-a-paso/paso-a-paso.scss' })
export class PasoAPasoPuntoFijo {
  readonly iteracion = input.required<IteracionPuntoFijo>();
  readonly expresionOriginalLatex = input.required<string>();
  readonly expresionIteracionLatex = input.required<string>();
  readonly derivadaIteracionLatex = input.required<string>();
  readonly expresionOriginalNormalizada = input.required<string>();
  readonly expresionIteracionNormalizada = input.required<string>();
  private readonly constructorPasos = new ConstructorPasosPuntoFijo();
  readonly pasos = computed(() => this.constructorPasos.construir(this.iteracion(), this.expresionOriginalLatex(), this.expresionIteracionLatex(), this.derivadaIteracionLatex(), this.expresionOriginalNormalizada(), this.expresionIteracionNormalizada()));
}
