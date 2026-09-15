import { ChangeDetectionStrategy, Component, ElementRef, computed, output, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ParametrosBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ParametrosNewton } from '../../core/metodos-numericos/newton/modelos-newton';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import { CasoUsoResolverNewton } from '../../aplicacion/caso-uso-resolver-newton';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';

export type MetodoDisponible = 'BISECCION' | 'NEWTON_RAPHSON';
export type SolicitudResolucion =
  | { metodo: 'BISECCION'; parametros: ParametrosBiseccion }
  | { metodo: 'NEWTON_RAPHSON'; parametros: ParametrosNewton };

interface Ejemplo {
  nombre: string;
  tipo: string;
  expresion: string;
  metodo: MetodoDisponible;
  a?: number;
  b?: number;
  x0?: number;
}

@Component({
  selector: 'app-entrada-funcion',
  imports: [ReactiveFormsModule, VisualizadorMatematico],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entrada-funcion.html',
  styleUrl: './entrada-funcion.scss',
})
export class EntradaFuncion {
  readonly resolver = output<SolicitudResolucion>();
  readonly cambioMetodo = output<MetodoDisponible>();
  private readonly casoBiseccion = new CasoUsoResolverBiseccion();
  private readonly casoNewton = new CasoUsoResolverNewton();
  private readonly campoExpresion = viewChild<ElementRef<HTMLTextAreaElement>>('campoExpresion');
  readonly metodo = signal<MetodoDisponible>('BISECCION');
  readonly expresionActual = signal('');
  readonly vista = computed<{ funcion: string; derivada?: string } | undefined>(() => {
    const expresion = this.expresionActual();
    if (!expresion.trim()) return undefined;
    if (this.metodo() === 'NEWTON_RAPHSON') return this.casoNewton.vistaLatex(expresion);
    const funcion = this.casoBiseccion.vistaLatex(expresion);
    return funcion ? { funcion } : undefined;
  });

  readonly formulario = new FormGroup({
    expresion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    extremoIzquierdo: new FormControl<number | null>(null, [Validators.required]),
    extremoDerecho: new FormControl<number | null>(null, [Validators.required]),
    valorInicial: new FormControl<number | null>({ value: null, disabled: true }, [Validators.required]),
    tolerancia: new FormControl(0.000001, { nonNullable: true, validators: [Validators.required, Validators.min(Number.EPSILON)] }),
    maximoIteraciones: new FormControl(100, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(1000)] }),
  });

  readonly teclas = [
    { etiqueta: 'sin', texto: 'sin()', retroceso: 1 }, { etiqueta: 'cos', texto: 'cos()', retroceso: 1 },
    { etiqueta: 'tan', texto: 'tan()', retroceso: 1 }, { etiqueta: 'ln', texto: 'ln()', retroceso: 1 },
    { etiqueta: '√', texto: 'sqrt()', retroceso: 1 }, { etiqueta: 'π', texto: 'π', retroceso: 0 },
    { etiqueta: 'e', texto: 'e', retroceso: 0 }, { etiqueta: 'x²', texto: 'x^2', retroceso: 0 },
    { etiqueta: 'xⁿ', texto: '^()', retroceso: 1 },
  ];
  readonly ejemplos: readonly Ejemplo[] = [
    { nombre: 'x³ − x − 2', tipo: 'Polinómica', expresion: 'x^3 - x - 2', metodo: 'BISECCION', a: 1, b: 2 },
    { nombre: 'cos(x) − x', tipo: 'Trigonométrica', expresion: 'cos(x) - x', metodo: 'BISECCION', a: 0, b: 1 },
    { nombre: 'e⁻ˣ − x', tipo: 'Exponencial', expresion: 'exp(-x) - x', metodo: 'BISECCION', a: 0, b: 1 },
    { nombre: 'x³ − x − 2', tipo: 'Polinómica', expresion: 'x^3 - x - 2', metodo: 'NEWTON_RAPHSON', x0: 1.5 },
    { nombre: 'cos(x) − x', tipo: 'Trigonométrica', expresion: 'cos(x) - x', metodo: 'NEWTON_RAPHSON', x0: 0.5 },
    { nombre: 'e⁻ˣ − x', tipo: 'Exponencial', expresion: 'exp(-x) - x', metodo: 'NEWTON_RAPHSON', x0: 0.5 },
  ];
  readonly ejemplosActivos = computed(() => this.ejemplos.filter((ejemplo) => ejemplo.metodo === this.metodo()));

  constructor() {
    this.formulario.controls.expresion.valueChanges.subscribe((valor) => this.expresionActual.set(valor));
  }

  seleccionar(metodo: MetodoDisponible): void {
    if (this.metodo() === metodo) return;
    this.metodo.set(metodo);
    if (metodo === 'BISECCION') {
      this.formulario.controls.valorInicial.disable();
      this.formulario.controls.extremoIzquierdo.enable();
      this.formulario.controls.extremoDerecho.enable();
    } else {
      this.formulario.controls.extremoIzquierdo.disable();
      this.formulario.controls.extremoDerecho.disable();
      this.formulario.controls.valorInicial.enable();
    }
    this.formulario.markAsPristine();
    this.cambioMetodo.emit(metodo);
  }

  insertar(texto: string, retroceso: number): void {
    const control = this.formulario.controls.expresion;
    const elemento = this.campoExpresion()?.nativeElement;
    const inicio = elemento?.selectionStart ?? control.value.length;
    const fin = elemento?.selectionEnd ?? inicio;
    control.setValue(control.value.slice(0, inicio) + texto + control.value.slice(fin));
    const cursor = inicio + texto.length - retroceso;
    queueMicrotask(() => { elemento?.focus(); elemento?.setSelectionRange(cursor, cursor); });
  }

  cargar(ejemplo: Ejemplo): void {
    this.formulario.patchValue({
      expresion: ejemplo.expresion,
      extremoIzquierdo: ejemplo.a ?? null,
      extremoDerecho: ejemplo.b ?? null,
      valorInicial: ejemplo.x0 ?? null,
    });
  }

  enviar(): void {
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }
    const valores = this.formulario.getRawValue();
    if (this.metodo() === 'BISECCION') {
      this.resolver.emit({ metodo: 'BISECCION', parametros: { expresion: valores.expresion, extremoIzquierdo: valores.extremoIzquierdo!, extremoDerecho: valores.extremoDerecho!, tolerancia: valores.tolerancia, maximoIteraciones: valores.maximoIteraciones } });
    } else {
      this.resolver.emit({ metodo: 'NEWTON_RAPHSON', parametros: { expresion: valores.expresion, valorInicial: valores.valorInicial!, tolerancia: valores.tolerancia, maximoIteraciones: valores.maximoIteraciones } });
    }
  }
}
