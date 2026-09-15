import { AnalizadorExpresiones } from './analizador-expresiones';
import { EvaluadorExpresiones } from './evaluador-expresiones';

describe('Motor matemático', () => {
  const analizador = new AnalizadorExpresiones();
  const evaluador = new EvaluadorExpresiones();

  it('acepta multiplicación implícita y funciones científicas', () => {
    const expresion = analizador.analizar('2x^2 + cos(x)');
    expect(evaluador.evaluar(expresion, 2)).toBeCloseTo(8 + Math.cos(2), 12);
    expect(expresion.latex).toContain('x');
  });

  it('normaliza ln y la constante π', () => {
    const expresion = analizador.analizar('ln(e) + π');
    expect(evaluador.evaluar(expresion, 0)).toBeCloseTo(1 + Math.PI, 12);
  });

  it('rechaza expresiones inválidas o símbolos no permitidos', () => {
    expect(() => analizador.analizar('x +')).toThrow(/no es válida/i);
    expect(() => analizador.analizar('x + secreto')).toThrow(/no está permitido/i);
  });

  it('rechaza resultados infinitos', () => {
    const expresion = analizador.analizar('1 / (x - 1)');
    expect(() => evaluador.evaluar(expresion, 1)).toThrow(/no finito/i);
  });
});
