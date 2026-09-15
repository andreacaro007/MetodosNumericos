import { FormateadorExpresiones } from '../../matematicas/formateador-expresiones';
import type { PasoMatematico } from '../compartido/modelos-solucion';
import type { IteracionPuntoFijo } from './modelos-punto-fijo';

export class ConstructorPasosPuntoFijo {
  constructor(private readonly formato = new FormateadorExpresiones()) {}

  construir(iteracion: IteracionPuntoFijo, expresionOriginalLatex: string, expresionIteracionLatex: string, derivadaIteracionLatex: string, expresionOriginalNormalizada: string, expresionIteracionNormalizada: string): readonly PasoMatematico[] {
    const numero = (valor: number) => this.formato.numeroLatex(valor, 11);
    const actual = iteracion.numero - 1;
    const siguiente = iteracion.numero;
    const condicion = iteracion.moduloDerivadaG < 1 ? 'Condición local favorable: |g\'(xₙ)| < 1. No constituye una garantía global.' : 'Condición local desfavorable: |g\'(xₙ)| ≥ 1. La sucesión puede alejarse u oscilar.';
    const pasos: PasoMatematico[] = [
      { tipo: 'EVALUACION', titulo: 'Aproximación actual', resultadoLatex: 'x_{' + actual + '}=' + numero(iteracion.xActual) },
      { tipo: 'FORMULA', titulo: 'Función de iteración', formulaLatex: 'g(x)=' + expresionIteracionLatex },
      { tipo: 'FORMULA', titulo: 'Fórmula de Punto Fijo', formulaLatex: 'x_{n+1}=g(x_n)' },
      { tipo: 'SUSTITUCION', titulo: 'Sustitución', sustitucionLatex: 'x_{' + siguiente + '}=' + this.formato.sustituirVariableLatex(expresionIteracionNormalizada, iteracion.xActual), resultadoLatex: 'x_{' + siguiente + '}=' + numero(iteracion.siguienteX) },
    ];
    if (iteracion.errorAbsoluto !== undefined) pasos.push({ tipo: 'ERROR', titulo: 'Error absoluto', formulaLatex: 'E_a=|x_{n+1}-x_n|', sustitucionLatex: 'E_a=|' + numero(iteracion.siguienteX) + '-' + numero(iteracion.xActual) + '|', resultadoLatex: 'E_a=' + numero(iteracion.errorAbsoluto) });
    if (iteracion.errorRelativo !== undefined && iteracion.errorPorcentual !== undefined) pasos.push(
      { tipo: 'ERROR', titulo: 'Error relativo', formulaLatex: 'E_r=\frac{E_a}{|x_{n+1}|}', resultadoLatex: 'E_r=' + numero(iteracion.errorRelativo) },
      { tipo: 'ERROR', titulo: 'Error porcentual', formulaLatex: 'E_\%=100E_r', resultadoLatex: 'E_\%=' + numero(iteracion.errorPorcentual) + '\%' },
    );
    pasos.push(
      { tipo: 'EVALUACION', titulo: 'Análisis local de la derivada', formulaLatex: "g'(x)=" + derivadaIteracionLatex, resultadoLatex: "|g'(x_{" + actual + '})|=' + numero(iteracion.moduloDerivadaG), explicacion: condicion },
      { tipo: 'EVALUACION', titulo: 'Residuo de Punto Fijo', formulaLatex: '|g(x_n)-x_n|', resultadoLatex: numero(iteracion.residuoPuntoFijo) },
      { tipo: iteracion.razonParada ? 'CONVERGENCIA' : 'EVALUACION', titulo: 'Comprobación de la ecuación original', formulaLatex: 'f(x)=' + expresionOriginalLatex, sustitucionLatex: '|f(' + numero(iteracion.siguienteX) + ')|=|' + this.formato.sustituirVariableLatex(expresionOriginalNormalizada, iteracion.siguienteX) + '|', resultadoLatex: '|f(x_{' + siguiente + '})|=' + numero(iteracion.residuoFuncionOriginal), explicacion: iteracion.razonParada },
    );
    return pasos;
  }
}
