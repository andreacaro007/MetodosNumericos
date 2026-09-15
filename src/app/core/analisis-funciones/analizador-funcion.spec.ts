import { describe, it, expect } from 'vitest';
import { AnalizadorFuncion } from './analizador-funcion';

describe('AnalizadorFuncion', () => {
  const servicio = new AnalizadorFuncion();

  describe('Cálculo de derivadas', () => {
    it('calcula primera y segunda derivada para x^3 - x - 2', () => {
      const analisis = servicio.analizar('x^3 - x - 2');
      expect(analisis.derivada).toBeDefined();
      expect(analisis.segundaDerivada).toBeDefined();
      expect(analisis.derivada?.expresionNormalizada).toContain('3 * x ^ 2 - 1');
      expect(analisis.segundaDerivada?.expresionNormalizada).toContain('6 * x');
    });

    it('calcula derivadas sucesivas para funciones trigonométricas', () => {
      const analisis = servicio.analizar('sin(x)');
      expect(analisis.derivada?.expresionNormalizada).toBe('cos(x)');
      expect(analisis.segundaDerivada?.expresionNormalizada).toBe('-sin(x)');
    });
  });

  describe('Evaluación puntual', () => {
    it('evalúa f(2) para x^3 - x - 2 con sustitución en LaTeX', () => {
      const analisis = servicio.analizar('x^3 - x - 2');
      const resultado = servicio.evaluarPuntual(analisis.expresion, 2);
      expect(resultado.resultado).toBe(4);
      expect(resultado.sustitucionLatex).toBeDefined();
      expect(resultado.sustitucionLatex.length).toBeGreaterThan(0);
    });
  });

  describe('Clasificación determinista', () => {
    it('clasifica polinomios como POLINOMICA', () => {
      const analisis = servicio.analizar('x^3 - x - 2');
      expect(analisis.clasificacion.tipo).toBe('POLINOMICA');
    });

    it('clasifica funciones racionales y detecta restricción de división', () => {
      const analisis = servicio.analizar('1 / x');
      expect(analisis.clasificacion.tipo).toBe('RACIONAL');
      expect(analisis.restriccionesEstructurales.some((r) => r.tipo === 'division')).toBe(true);
    });

    it('clasifica funciones con logaritmo y detecta restricción real', () => {
      const analisis = servicio.analizar('ln(x)');
      expect(analisis.clasificacion.tipo).toBe('LOGARITMICA');
      expect(analisis.restriccionesEstructurales.some((r) => r.tipo === 'logaritmo')).toBe(true);
    });

    it('clasifica funciones con raíz cuadrada y detecta restricción radical', () => {
      const analisis = servicio.analizar('sqrt(x)');
      expect(analisis.clasificacion.tipo).toBe('RADICAL');
      expect(analisis.restriccionesEstructurales.some((r) => r.tipo === 'radical_par')).toBe(true);
    });

    it('clasifica funciones trigonométricas', () => {
      const analisis = servicio.analizar('sin(x)');
      expect(analisis.clasificacion.tipo).toBe('TRIGONOMETRICA');
    });

    it('clasifica funciones exponenciales', () => {
      const analisis = servicio.analizar('e^x');
      expect(analisis.clasificacion.tipo).toBe('EXPONENCIAL');
    });

    it('clasifica funciones mixtas correctamente', () => {
      const analisis = servicio.analizar('cos(x) - x');
      expect(analisis.clasificacion.tipo).toBe('MIXTA');
      expect(analisis.clasificacion.familiasDetectadas).toContain('trigonométrica');
      expect(analisis.clasificacion.familiasDetectadas).toContain('polinómica');
    });

    it('clasifica constantes', () => {
      const analisis = servicio.analizar('5');
      expect(analisis.clasificacion.tipo).toBe('CONSTANTE');
    });
  });

  describe('Exploración numérica e intervalos candidatos', () => {
    it('detecta intervalo candidato de cambio de signo para x^3 - x - 2 en [-2, 3]', () => {
      const analisis = servicio.analizar('x^3 - x - 2');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: -2,
        hasta: 3,
        muestras: 500,
      });

      expect(exploracion.intervalosCandidatos.length).toBeGreaterThanOrEqual(1);
      const candidato = exploracion.intervalosCandidatos[0];
      expect(candidato.a).toBeLessThanOrEqual(1.53);
      expect(candidato.b).toBeGreaterThanOrEqual(1.51);
      expect(candidato.fa * candidato.fb).toBeLessThanOrEqual(0);
    });

    it('filtra discontinuidades aparentes como 1/x sin reportarlas como raíces de Bolzano', () => {
      const analisis = servicio.analizar('1 / x');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: -2,
        hasta: 2,
        muestras: 400,
      });

      expect(exploracion.intervalosCandidatos.length).toBe(0);
    });

    it('detecta zonas cercanas a cero para raíces de multiplicidad par como (x-2)^2', () => {
      const analisis = servicio.analizar('(x - 2)^2');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: 0,
        hasta: 4,
        muestras: 400,
      });

      expect(exploracion.intervalosCandidatos.length).toBe(0);
      expect(exploracion.zonasCercanasCero.length).toBeGreaterThanOrEqual(1);
      expect(Math.abs(exploracion.zonasCercanasCero[0].x - 2)).toBeLessThan(0.05);
    });

    it('registra puntos no evaluables fuera del dominio real de sqrt(x)', () => {
      const analisis = servicio.analizar('sqrt(x)');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: -2,
        hasta: 2,
        muestras: 40,
      });

      const noEvaluables = exploracion.puntos.filter((punto) => !punto.evaluable);
      expect(noEvaluables.length).toBeGreaterThan(0);
      expect(noEvaluables.some((punto) => punto.x < 0)).toBe(true);
      expect(noEvaluables[0].motivoNoEvaluable).toMatch(/números reales|dominio real/i);
    });

    it('sugiere x0 para Newton con fundamento y derivada no nula', () => {
      const analisis = servicio.analizar('x^3 - x - 2');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: 0,
        hasta: 3,
      });

      expect(exploracion.sugerenciasNewton.length).toBeGreaterThanOrEqual(1);
      const sugerencia = exploracion.sugerenciasNewton[0];
      expect(sugerencia.esRecomendada).toBe(true);
      expect(sugerencia.razon).toContain('Derivada');
      expect(Math.abs(sugerencia.x0 - 1.52)).toBeLessThan(0.05);
    });

    it('registra mínimo y máximo observados en el intervalo explorado', () => {
      const analisis = servicio.analizar('x^2');
      const exploracion = servicio.explorarIntervalo(analisis.expresion, analisis.derivada, {
        desde: -3,
        hasta: 3,
        muestras: 100,
      });

      expect(exploracion.resumen.minimoObservado).toBeDefined();
      expect(exploracion.resumen.maximoObservado).toBeDefined();
      expect(exploracion.resumen.minimoObservado?.y).toBeCloseTo(0, 2);
      expect(exploracion.resumen.maximoObservado?.y).toBeCloseTo(9, 1);
    });
  });
});
