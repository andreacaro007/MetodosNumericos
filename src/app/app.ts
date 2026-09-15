import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Calculadora } from './paginas/calculadora/calculadora';

@Component({
  selector: 'app-root',
  imports: [Calculadora],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-calculadora />',
  styleUrl: './app.scss',
})
export class App {}
