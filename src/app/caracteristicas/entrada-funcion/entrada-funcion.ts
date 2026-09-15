import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ParametrosBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';

interface Ejemplo { nombre: string; tipo: string; expresion: string; a: number; b: number }

@Component({
  selector: 'app-entrada-funcion',
  imports: [ReactiveFormsModule, VisualizadorMatematico],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entrada-funcion.html',
  styleUrl: './entrada-funcion.scss',
})
export class EntradaFuncion {
  readonly resolver = output<ParametrosBiseccion>();
  private readonly casoUso = new CasoUsoResolverBiseccion();
  readonly expresionActual = signal('x^3 - x - 2');
  readonly latex = computed(() => this.casoUso.vistaLatex(this.expresionActual()));

  readonly formulario = new FormGroup({
    expresion: new FormControl('x^3 - x - 2', { nonNullable: true, validators: [Validators.required] }),
    extremoIzquierdo: new FormControl(1, { nonNullable: true, validators: [Validators.required] }),
    extremoDerecho: new FormControl(2, { nonNullable: true, validators: [Validators.required] }),
    tolerancia: new FormControl(0.000001, { nonNullable: true, validators: [Validators.required, Validators.min(Number.EPSILON)] }),
    maximoIteraciones: new FormControl(100, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(1000)] }),
  });

  readonly teclas = ['sin(', 'cos(', 'tan(', 'ln(', 'sqrt(', 'π', 'e', 'x^2', '^'];
  readonly ejemplos: Ejemplo[] = [
    { nombre: 'x³ − x − 2', tipo: 'Polinómica', expresion: 'x^3 - x - 2', a: 1, b: 2 },
    { nombre: 'cos(x) − x', tipo: 'Trigonométrica', expresion: 'cos(x) - x', a: 0, b: 1 },
    { nombre: 'e⁻ˣ − x', tipo: 'Exponencial', expresion: 'exp(-x) - x', a: 0, b: 1 },
  ];

  constructor() {
    this.formulario.controls.expresion.valueChanges.subscribe((valor) => this.expresionActual.set(valor));
  }

  insertar(fragmento: string): void {
    const control = this.formulario.controls.expresion;
    const valor = `${control.value}${control.value.endsWith(' ') ? '' : ' '}${fragmento}`;
    control.setValue(valor);
  }

  cargar(ejemplo: Ejemplo): void {
    this.formulario.patchValue({ expresion: ejemplo.expresion, extremoIzquierdo: ejemplo.a, extremoDerecho: ejemplo.b });
  }

  enviar(): void {
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }
    this.resolver.emit(this.formulario.getRawValue());
  }
}
