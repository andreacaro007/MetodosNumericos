import { FormateadorExpresiones } from '../../matematicas/formateador-expresiones';
import type { PasoMatematico } from '../compartido/modelos-solucion';
import type { IteracionBiseccion } from './modelos-biseccion';

export class ConstructorPasosBiseccion {
  constructor(private readonly formato = new FormateadorExpresiones()) {}

  construir(iteracion: IteracionBiseccion, expresionLatex: string): PasoMatematico[] {
    const n = (valor: number) => this.formato.numeroLatex(valor, 10);
    const pasos: PasoMatematico[] = [
      { tipo: 'EVALUACION', titulo: 'Intervalo actual', resultadoLatex: `[${n(iteracion.extremoIzquierdo)},\,${n(iteracion.extremoDerecho)}]` },
      { tipo: 'FORMULA', titulo: 'Fórmula del punto medio', formulaLatex: 'x_m=\\frac{a+b}{2}' },
      { tipo: 'SUSTITUCION', titulo: 'Sustitución', sustitucionLatex: `x_m=\\frac{${n(iteracion.extremoIzquierdo)}+${n(iteracion.extremoDerecho)}}{2}`, resultadoLatex: `x_m=${n(iteracion.puntoMedio)}` },
      { tipo: 'EVALUACION', titulo: 'Evaluación del extremo izquierdo', formulaLatex: `f(x)=${expresionLatex}`, sustitucionLatex: `f(${n(iteracion.extremoIzquierdo)})`, resultadoLatex: `f(a)=${n(iteracion.valorExtremoIzquierdo)}` },
      { tipo: 'EVALUACION', titulo: 'Evaluación del punto medio', sustitucionLatex: `f(${n(iteracion.puntoMedio)})`, resultadoLatex: `f(x_m)=${n(iteracion.valorPuntoMedio)}` },
      { tipo: 'DECISION', titulo: 'Comparación de signos', formulaLatex: 'f(a)\\cdot f(x_m)', sustitucionLatex: `(${n(iteracion.valorExtremoIzquierdo)})(${n(iteracion.valorPuntoMedio)})`, resultadoLatex: `${n(iteracion.productoSignos)}${iteracion.productoSignos < 0 ? '<' : iteracion.productoSignos > 0 ? '>' : '='}0` },
      this.crearDecision(iteracion, n),
    ];

    if (iteracion.errorAbsoluto !== undefined) {
      pasos.push({
        tipo: 'ERROR', titulo: 'Error de aproximación', formulaLatex: 'E_a=|x_n-x_{n-1}|',
        explicacion: 'El error compara el punto medio actual con el de la iteración anterior.',
        resultadoLatex: `E_a=${n(iteracion.errorAbsoluto)}`,
      });
    } else {
      pasos.push({ tipo: 'ERROR', titulo: 'Error de aproximación', explicacion: 'La primera iteración no tiene una aproximación anterior con la cual compararse.' });
    }

    if (iteracion.razonParada) {
      pasos.push({ tipo: 'CONVERGENCIA', titulo: 'Criterio de parada', explicacion: iteracion.razonParada });
    }
    return pasos;
  }

  private crearDecision(iteracion: IteracionBiseccion, n: (valor: number) => string): PasoMatematico {
    if (iteracion.decision === 'RAIZ_ENCONTRADA') {
      return { tipo: 'DECISION', titulo: 'Raíz exacta', explicacion: 'El punto medio anula la función, por lo que no es necesario reducir nuevamente el intervalo.', resultadoLatex: `x=${n(iteracion.puntoMedio)}` };
    }
    const izquierda = iteracion.decision === 'INTERVALO_IZQUIERDO';
    return {
      tipo: 'DECISION', titulo: 'Selección del nuevo intervalo',
      explicacion: izquierda
        ? 'f(a) y f(xₘ) tienen signos opuestos; el cambio de signo se conserva en el subintervalo izquierdo.'
        : 'f(a) y f(xₘ) tienen el mismo signo; el cambio de signo se conserva en el subintervalo derecho.',
      resultadoLatex: `[${n(iteracion.nuevoExtremoIzquierdo)},\,${n(iteracion.nuevoExtremoDerecho)}]`,
    };
  }
}
