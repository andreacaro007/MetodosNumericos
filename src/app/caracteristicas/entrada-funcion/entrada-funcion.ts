import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { ParametrosBiseccion } from '../../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ParametrosNewton } from '../../core/metodos-numericos/newton/modelos-newton';
import type { ParametrosPuntoFijo } from '../../core/metodos-numericos/punto-fijo/modelos-punto-fijo';
import { CasoUsoResolverBiseccion } from '../../aplicacion/caso-uso-resolver-biseccion';
import { CasoUsoResolverNewton } from '../../aplicacion/caso-uso-resolver-newton';
import { CasoUsoResolverPuntoFijo } from '../../aplicacion/caso-uso-resolver-punto-fijo';
import { VisualizadorMatematico } from '../../compartido/visualizador-matematico';

export type MetodoDisponible = 'BISECCION' | 'NEWTON_RAPHSON' | 'PUNTO_FIJO';
export type CategoriaTeclado = 'basicas' | 'trigonometria' | 'especiales' | 'operadores';

export type SolicitudResolucion =
  | { metodo: 'BISECCION'; parametros: ParametrosBiseccion }
  | { metodo: 'NEWTON_RAPHSON'; parametros: ParametrosNewton }
  | { metodo: 'PUNTO_FIJO'; parametros: ParametrosPuntoFijo };

interface Ejemplo {
  nombre: string;
  tipo: string;
  expresion: string;
  metodo: MetodoDisponible;
  a?: number;
  b?: number;
  x0?: number;
  expresionIteracion?: string;
}

interface TeclaCientifica {
  etiqueta: string;
  texto: string;
  retroceso: number;
  esEspecial?: boolean;
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
  readonly cambioExpresion = output<string>();

  private readonly casoBiseccion = new CasoUsoResolverBiseccion();
  private readonly casoNewton = new CasoUsoResolverNewton();
  private readonly casoPuntoFijo = new CasoUsoResolverPuntoFijo();
  private readonly campoExpresion = viewChild<ElementRef<HTMLTextAreaElement>>('campoExpresion');
  private readonly campoIteracion = viewChild<ElementRef<HTMLTextAreaElement>>('campoIteracion');
  private readonly campoActivo = signal<'original' | 'iteracion'>('original');

  readonly metodo = signal<MetodoDisponible>('BISECCION');
  readonly expresionActual = signal('');
  readonly expresionIteracionActual = signal('');
  readonly categoriaTeclado = signal<CategoriaTeclado>('basicas');

  readonly vista = computed<{ funcion?: string; iteracion?: string; derivada?: string } | undefined>(() => {
    const expresion = this.expresionActual();
    const iteracion = this.expresionIteracionActual();
    if (!expresion.trim() && !iteracion.trim()) return undefined;
    if (this.metodo() === 'PUNTO_FIJO') return this.casoPuntoFijo.vistaLatex(expresion, iteracion);
    if (this.metodo() === 'NEWTON_RAPHSON') return this.casoNewton.vistaLatex(expresion);
    const funcion = this.casoBiseccion.vistaLatex(expresion);
    return funcion ? { funcion } : undefined;
  });

  readonly formulario = new FormGroup({
    expresion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    expresionIteracion: new FormControl(
      { value: '', disabled: true },
      { nonNullable: true, validators: [Validators.required] }
    ),
    extremoIzquierdo: new FormControl<number | null>(null, [Validators.required]),
    extremoDerecho: new FormControl<number | null>(null, [Validators.required]),
    valorInicial: new FormControl<number | null>(
      { value: null, disabled: true },
      [Validators.required]
    ),
    tolerancia: new FormControl(0.000001, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(Number.EPSILON)],
    }),
    maximoIteraciones: new FormControl(100, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(1000)],
    }),
  });

  readonly bancosTeclas: Record<CategoriaTeclado, readonly TeclaCientifica[]> = {
    basicas: [
      { etiqueta: 'sin', texto: 'sin()', retroceso: 1 },
      { etiqueta: 'cos', texto: 'cos()', retroceso: 1 },
      { etiqueta: 'tan', texto: 'tan()', retroceso: 1 },
      { etiqueta: 'ln', texto: 'ln()', retroceso: 1 },
      { etiqueta: '√', texto: 'sqrt()', retroceso: 1 },
      { etiqueta: 'x²', texto: '^2', retroceso: 0, esEspecial: true },
      { etiqueta: 'xⁿ', texto: '^()', retroceso: 1 },
      { etiqueta: 'π', texto: 'π', retroceso: 0 },
      { etiqueta: 'e', texto: 'e', retroceso: 0 },
      { etiqueta: '(', texto: '(', retroceso: 0 },
      { etiqueta: ')', texto: ')', retroceso: 0 },
    ],
    trigonometria: [
      { etiqueta: 'sin', texto: 'sin()', retroceso: 1 },
      { etiqueta: 'cos', texto: 'cos()', retroceso: 1 },
      { etiqueta: 'tan', texto: 'tan()', retroceso: 1 },
      { etiqueta: 'asin', texto: 'asin()', retroceso: 1 },
      { etiqueta: 'acos', texto: 'acos()', retroceso: 1 },
      { etiqueta: 'atan', texto: 'atan()', retroceso: 1 },
      { etiqueta: 'sec', texto: 'sec()', retroceso: 1 },
      { etiqueta: 'csc', texto: 'csc()', retroceso: 1 },
      { etiqueta: 'cot', texto: 'cot()', retroceso: 1 },
    ],
    especiales: [
      { etiqueta: 'sinh', texto: 'sinh()', retroceso: 1 },
      { etiqueta: 'cosh', texto: 'cosh()', retroceso: 1 },
      { etiqueta: 'tanh', texto: 'tanh()', retroceso: 1 },
      { etiqueta: 'exp', texto: 'exp()', retroceso: 1 },
      { etiqueta: 'abs', texto: 'abs()', retroceso: 1 },
      { etiqueta: 'floor', texto: 'floor()', retroceso: 1 },
      { etiqueta: 'ceil', texto: 'ceil()', retroceso: 1 },
      { etiqueta: '√', texto: 'sqrt()', retroceso: 1 },
      { etiqueta: 'ln', texto: 'ln()', retroceso: 1 },
    ],
    operadores: [
      { etiqueta: '+', texto: ' + ', retroceso: 0 },
      { etiqueta: '−', texto: ' - ', retroceso: 0 },
      { etiqueta: '×', texto: ' * ', retroceso: 0 },
      { etiqueta: '÷', texto: ' / ', retroceso: 0 },
      { etiqueta: '^', texto: '^', retroceso: 0 },
      { etiqueta: 'x', texto: 'x', retroceso: 0 },
      { etiqueta: '(', texto: '(', retroceso: 0 },
      { etiqueta: ')', texto: ')', retroceso: 0 },
      { etiqueta: 'π', texto: 'π', retroceso: 0 },
      { etiqueta: 'e', texto: 'e', retroceso: 0 },
    ],
  };

  readonly teclasActivas = computed(() => this.bancosTeclas[this.categoriaTeclado()]);

  readonly ejemplos: readonly Ejemplo[] = [
    { nombre: 'x³ − x − 2', tipo: 'Polinómica', expresion: 'x^3 - x - 2', metodo: 'BISECCION', a: 1, b: 2 },
    { nombre: 'cos(x) − x', tipo: 'Trigonométrica', expresion: 'cos(x) - x', metodo: 'BISECCION', a: 0, b: 1 },
    { nombre: 'e⁻ˣ − x', tipo: 'Exponencial', expresion: 'exp(-x) - x', metodo: 'BISECCION', a: 0, b: 1 },
    { nombre: 'x³ − x − 2', tipo: 'Polinómica', expresion: 'x^3 - x - 2', metodo: 'NEWTON_RAPHSON', x0: 1.5 },
    { nombre: 'cos(x) − x', tipo: 'Trigonométrica', expresion: 'cos(x) - x', metodo: 'NEWTON_RAPHSON', x0: 0.5 },
    { nombre: 'e⁻ˣ − x', tipo: 'Exponencial', expresion: 'exp(-x) - x', metodo: 'NEWTON_RAPHSON', x0: 0.5 },
    { nombre: 'x = cos(x)', tipo: 'Trigonométrica', expresion: 'cos(x) - x', expresionIteracion: 'cos(x)', metodo: 'PUNTO_FIJO', x0: 0.5 },
    { nombre: 'x = e⁻ˣ', tipo: 'Exponencial', expresion: 'exp(-x) - x', expresionIteracion: 'exp(-x)', metodo: 'PUNTO_FIJO', x0: 0.5 },
    { nombre: 'x = ∛(x + 2)', tipo: 'Polinómica', expresion: 'x^3 - x - 2', expresionIteracion: '(x + 2)^(1/3)', metodo: 'PUNTO_FIJO', x0: 1.5 },
  ];
  readonly ejemplosActivos = computed(() => this.ejemplos.filter((ejemplo) => ejemplo.metodo === this.metodo()));

  constructor() {
    this.formulario.controls.expresion.valueChanges.subscribe((valor) => {
      this.expresionActual.set(valor);
      this.cambioExpresion.emit(valor);
    });
    this.formulario.controls.expresionIteracion.valueChanges.subscribe((valor) =>
      this.expresionIteracionActual.set(valor)
    );
  }

  seleccionar(metodo: MetodoDisponible): void {
    if (this.metodo() === metodo) return;
    this.metodo.set(metodo);
    this.formulario.reset({
      expresion: '',
      expresionIteracion: '',
      extremoIzquierdo: null,
      extremoDerecho: null,
      valorInicial: null,
      tolerancia: 0.000001,
      maximoIteraciones: 100,
    });
    this.ajustarCamposPorMetodo(metodo);
    this.formulario.markAsPristine();
    this.cambioMetodo.emit(metodo);
  }

  establecerMetodo(metodo: MetodoDisponible, preservarValores = true): void {
    if (this.metodo() !== metodo) {
      this.metodo.set(metodo);
      this.ajustarCamposPorMetodo(metodo);
      if (!preservarValores) {
        this.formulario.reset({
          expresion: this.formulario.controls.expresion.value,
          expresionIteracion: '',
          extremoIzquierdo: null,
          extremoDerecho: null,
          valorInicial: null,
          tolerancia: 0.000001,
          maximoIteraciones: 100,
        });
      }
      this.cambioMetodo.emit(metodo);
    }
  }

  private ajustarCamposPorMetodo(metodo: MetodoDisponible): void {
    if (metodo === 'BISECCION') {
      this.formulario.controls.expresionIteracion.disable();
      this.formulario.controls.valorInicial.disable();
      this.formulario.controls.extremoIzquierdo.enable();
      this.formulario.controls.extremoDerecho.enable();
    } else if (metodo === 'NEWTON_RAPHSON') {
      this.formulario.controls.expresionIteracion.disable();
      this.formulario.controls.extremoIzquierdo.disable();
      this.formulario.controls.extremoDerecho.disable();
      this.formulario.controls.valorInicial.enable();
    } else {
      this.formulario.controls.expresionIteracion.enable();
      this.formulario.controls.extremoIzquierdo.disable();
      this.formulario.controls.extremoDerecho.disable();
      this.formulario.controls.valorInicial.enable();
    }
  }

  cambiarCategoriaTeclado(categoria: CategoriaTeclado): void {
    this.categoriaTeclado.set(categoria);
  }

  insertar(tecla: TeclaCientifica): void {
    const esIteracion = this.metodo() === 'PUNTO_FIJO' && this.campoActivo() === 'iteracion';
    const control = esIteracion ? this.formulario.controls.expresionIteracion : this.formulario.controls.expresion;
    const elemento = esIteracion ? this.campoIteracion()?.nativeElement : this.campoExpresion()?.nativeElement;
    const inicio = elemento?.selectionStart ?? control.value.length;
    const fin = elemento?.selectionEnd ?? inicio;

    let textoInsertar = tecla.texto;
    let retroceso = tecla.retroceso;

    if (tecla.esEspecial && tecla.etiqueta === 'x²') {
      const caracterPrevio = inicio > 0 ? control.value[inicio - 1] : '';
      if (caracterPrevio !== 'x') {
        textoInsertar = 'x^2';
      } else {
        textoInsertar = '^2';
      }
    }

    const nuevoValor = control.value.slice(0, inicio) + textoInsertar + control.value.slice(fin);
    control.setValue(nuevoValor);
    const cursor = inicio + textoInsertar.length - retroceso;
    queueMicrotask(() => {
      elemento?.focus();
      elemento?.setSelectionRange(cursor, cursor);
    });
  }

  activarCampo(campo: 'original' | 'iteracion'): void {
    this.campoActivo.set(campo);
  }

  cargarIntervalo(a: number, b: number): void {
    this.formulario.patchValue({
      extremoIzquierdo: a,
      extremoDerecho: b,
    });
    this.formulario.controls.extremoIzquierdo.markAsDirty();
    this.formulario.controls.extremoDerecho.markAsDirty();
  }

  cargarValorInicial(x0: number): void {
    this.formulario.patchValue({
      valorInicial: x0,
    });
    this.formulario.controls.valorInicial.markAsDirty();
  }

  cargar(ejemplo: Ejemplo): void {
    this.formulario.patchValue({
      expresion: ejemplo.expresion,
      expresionIteracion: ejemplo.expresionIteracion ?? '',
      extremoIzquierdo: ejemplo.a ?? null,
      extremoDerecho: ejemplo.b ?? null,
      valorInicial: ejemplo.x0 ?? null,
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    if (this.metodo() === 'BISECCION') {
      this.resolver.emit({
        metodo: 'BISECCION',
        parametros: {
          expresion: valores.expresion,
          extremoIzquierdo: valores.extremoIzquierdo!,
          extremoDerecho: valores.extremoDerecho!,
          tolerancia: valores.tolerancia,
          maximoIteraciones: valores.maximoIteraciones,
        },
      });
    } else if (this.metodo() === 'NEWTON_RAPHSON') {
      this.resolver.emit({
        metodo: 'NEWTON_RAPHSON',
        parametros: {
          expresion: valores.expresion,
          valorInicial: valores.valorInicial!,
          tolerancia: valores.tolerancia,
          maximoIteraciones: valores.maximoIteraciones,
        },
      });
    } else {
      this.resolver.emit({
        metodo: 'PUNTO_FIJO',
        parametros: {
          expresionOriginal: valores.expresion,
          expresionIteracion: valores.expresionIteracion,
          valorInicial: valores.valorInicial!,
          tolerancia: valores.tolerancia,
          maximoIteraciones: valores.maximoIteraciones,
        },
      });
    }
  }
}

