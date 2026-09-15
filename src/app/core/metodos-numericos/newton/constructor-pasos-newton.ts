import { FormateadorExpresiones } from '../../matematicas/formateador-expresiones';
import type { PasoMatematico } from '../compartido/modelos-solucion';
import type { IteracionNewton } from './modelos-newton';

export class ConstructorPasosNewton {
  constructor(private readonly formato = new FormateadorExpresiones()) {}

  construir(iteracion: IteracionNewton, expresionLatex: string, derivadaLatex: string, expresionNormalizada: string, derivadaNormalizada: string): readonly PasoMatematico[] {
    const numero = (valor: number) => this.formato.numeroLatex(valor, 11);
    const actual = iteracion.numero - 1;
    const siguiente = iteracion.numero;
    const pasos: PasoMatematico[] = [
      { tipo: 'EVALUACION', titulo: 'Aproximación actual', resultadoLatex: 'x_{' + actual + '}=' + numero(iteracion.xActual) },
      { tipo: 'FORMULA', titulo: 'Función', formulaLatex: 'f(x)=' + expresionLatex },
      { tipo: 'FORMULA', titulo: 'Derivada calculada', formulaLatex: "f'(x)=" + derivadaLatex },
      { tipo: 'EVALUACION', titulo: 'Evaluación de la función', sustitucionLatex: 'f(' + numero(iteracion.xActual) + ')=' + this.formato.sustituirVariableLatex(expresionNormalizada, iteracion.xActual), resultadoLatex: 'f(x_{' + actual + '})=' + numero(iteracion.valorFuncion) },
      { tipo: 'EVALUACION', titulo: 'Evaluación de la derivada', sustitucionLatex: "f'(" + numero(iteracion.xActual) + ')=' + this.formato.sustituirVariableLatex(derivadaNormalizada, iteracion.xActual), resultadoLatex: "f'(x_{" + actual + '})=' + numero(iteracion.valorDerivada) },
    ];
    if (iteracion.siguienteX !== undefined && iteracion.cocienteNewton !== undefined) {
      pasos.push(
        { tipo: 'FORMULA', titulo: 'Fórmula de Newton-Raphson', formulaLatex: "x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}", explicacion: 'La nueva aproximación se obtiene donde la recta tangente trazada en xₙ intersecta el eje X.' },
        { tipo: 'SUSTITUCION', titulo: 'Sustitución', sustitucionLatex: 'x_{' + siguiente + '}=' + numero(iteracion.xActual) + '-\\frac{' + numero(iteracion.valorFuncion) + '}{' + numero(iteracion.valorDerivada) + '}', resultadoLatex: 'x_{' + siguiente + '}=' + numero(iteracion.siguienteX) },
      );
      if (iteracion.errorAbsoluto !== undefined) pasos.push({ tipo: 'ERROR', titulo: 'Error absoluto', formulaLatex: 'E_a=|x_{n+1}-x_n|', sustitucionLatex: 'E_a=|' + numero(iteracion.siguienteX) + '-' + numero(iteracion.xActual) + '|', resultadoLatex: 'E_a=' + numero(iteracion.errorAbsoluto) });
      if (iteracion.errorRelativo !== undefined && iteracion.errorPorcentual !== undefined) pasos.push(
        { tipo: 'ERROR', titulo: 'Error relativo', formulaLatex: 'E_r=\\frac{E_a}{|x_{n+1}|}', resultadoLatex: 'E_r=' + numero(iteracion.errorRelativo) },
        { tipo: 'ERROR', titulo: 'Error porcentual', formulaLatex: 'E_\\%=E_r\\cdot100', resultadoLatex: 'E_\\%=' + numero(iteracion.errorPorcentual) + '\\%' },
      );
      pasos.push({ tipo: iteracion.razonParada ? 'CONVERGENCIA' : 'EVALUACION', titulo: 'Comprobación del residuo', formulaLatex: '|f(x_{' + siguiente + '})|', resultadoLatex: '|f(' + numero(iteracion.siguienteX) + ')|=' + numero(iteracion.residuo), explicacion: iteracion.razonParada ?? 'El residuo todavía no cumple el criterio de parada.' });
    } else if (iteracion.razonParada) pasos.push({ tipo: 'CONVERGENCIA', titulo: 'Criterio de parada', explicacion: iteracion.razonParada });
    return pasos;
  }
}
