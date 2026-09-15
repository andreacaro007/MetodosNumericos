import { TestBed } from '@angular/core/testing';
import { Calculadora } from './calculadora';

describe('Calculadora - Integración de Análisis Científico', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calculadora],
    }).compileComponents();
  });

  it('se crea correctamente con pestaña inicial y método de Bisección', () => {
    const fixture = TestBed.createComponent(Calculadora);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.metodo()).toBe('BISECCION');
    expect(comp.pestana()).toBe('resumen');
  });

  it('permite cambiar a la pestaña de análisis científico', () => {
    const fixture = TestBed.createComponent(Calculadora);
    const comp = fixture.componentInstance;
    comp.pestana.set('analisis');
    expect(comp.pestana()).toBe('analisis');
  });

  it('transfiere intervalo a Bisección sin resolver automáticamente', () => {
    const fixture = TestBed.createComponent(Calculadora);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.cargarEnBiseccion({ a: 1.25, b: 2.75 });
    fixture.detectChanges();

    expect(comp.metodo()).toBe('BISECCION');
    expect(comp.resultado()).toBeUndefined();

    const entrada = comp.entradaComponente();
    expect(entrada).toBeTruthy();
    expect(entrada?.formulario.controls.extremoIzquierdo.value).toBe(1.25);
    expect(entrada?.formulario.controls.extremoDerecho.value).toBe(2.75);
  });

  it('transfiere valor inicial x0 a Newton-Raphson sin resolver automáticamente', () => {
    const fixture = TestBed.createComponent(Calculadora);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.cargarEnNewton({ x0: 1.512 });
    fixture.detectChanges();

    expect(comp.metodo()).toBe('NEWTON_RAPHSON');
    expect(comp.resultado()).toBeUndefined();

    const entrada = comp.entradaComponente();
    expect(entrada).toBeTruthy();
    expect(entrada?.formulario.controls.valorInicial.value).toBe(1.512);
  });

  it('detiene la animación al presionar la tecla Escape', () => {
    const fixture = TestBed.createComponent(Calculadora);
    const comp = fixture.componentInstance;

    comp.reproduciendo.set(true);
    comp.manejarAtajos(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(comp.reproduciendo()).toBe(false);
  });
});
