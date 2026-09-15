import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import katex from 'katex';

@Component({
  selector: 'app-visualizador-matematico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="formula" [innerHTML]="html()"></span>`,
  styles: [`.formula { display: inline-block; max-width: 100%; overflow-x: auto; overflow-y: hidden; }`],
})
export class VisualizadorMatematico {
  readonly latex = input.required<string>();
  readonly modoBloque = input(false);
  private readonly sanitizador = inject(DomSanitizer);

  readonly html = computed(() => this.sanitizador.bypassSecurityTrustHtml(katex.renderToString(this.latex(), {
    displayMode: this.modoBloque(), throwOnError: false, strict: 'warn', output: 'htmlAndMathml',
  })));
}
