import { isFunctionNode, isOperatorNode, isSymbolNode, type MathNode } from 'mathjs';
import type { ClasificacionFuncion, RestriccionEstructural, TipoFuncion } from './modelos-analisis';
import type { ExpresionAnalizada } from '../matematicas/modelos-matematicos';

const TRIGONOMETRICAS = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sec', 'csc', 'cot']);
const HIPERBOLICAS = new Set(['sinh', 'cosh', 'tanh']);
const LOGARITMICAS = new Set(['log']);
const RADICALES = new Set(['sqrt']);

export class ClasificadorFuncion {
  clasificar(expresion: ExpresionAnalizada): { clasificacion: ClasificacionFuncion; restricciones: RestriccionEstructural[] } {
    const raiz = expresion.nodo;
    const familias = new Set<string>();
    const restricciones: RestriccionEstructural[] = [];
    let tieneVariableX = false;
    let tieneDivisionConX = false;
    let tienePotenciaConXEnExponente = false;
    let tienePotenciaNoEntera = false;
    let soloPolinomica = true;

    const contieneX = (nodo: MathNode): boolean => {
      let encontrado = false;
      nodo.traverse((n) => {
        if (isSymbolNode(n) && n.name === 'x') encontrado = true;
      });
      return encontrado;
    };

    raiz.traverse((nodo) => {
      if (isSymbolNode(nodo) && nodo.name === 'x') {
        tieneVariableX = true;
      }

      if (isFunctionNode(nodo)) {
        const nombre = (nodo as unknown as { name: string }).name;
        if (TRIGONOMETRICAS.has(nombre)) {
          familias.add('trigonométrica');
          soloPolinomica = false;
        } else if (HIPERBOLICAS.has(nombre)) {
          familias.add('hiperbólica');
          soloPolinomica = false;
        } else if (LOGARITMICAS.has(nombre)) {
          familias.add('logarítmica');
          soloPolinomica = false;
          if (nodo.args && nodo.args[0] && contieneX(nodo.args[0])) {
            restricciones.push({
              tipo: 'logaritmo',
              descripcion: 'Logaritmo en números reales',
              detalle: 'El argumento del logaritmo debe ser estrictamente positivo (> 0).',
            });
          }
        } else if (RADICALES.has(nombre)) {
          familias.add('radical');
          soloPolinomica = false;
          if (nodo.args && nodo.args[0] && contieneX(nodo.args[0])) {
            restricciones.push({
              tipo: 'radical_par',
              descripcion: 'Raíz de índice par en números reales',
              detalle: 'El radicando debe ser mayor o igual a cero (≥ 0).',
            });
          }
        } else if (nombre === 'exp') {
          familias.add('exponencial');
          soloPolinomica = false;
        } else {
          soloPolinomica = false;
        }
      }

      if (isOperatorNode(nodo)) {
        if (nodo.op === '/') {
          const denominador = nodo.args?.[1];
          if (denominador && contieneX(denominador)) {
            tieneDivisionConX = true;
            familias.add('racional');
            soloPolinomica = false;
            restricciones.push({
              tipo: 'division',
              descripcion: 'Posible división por cero',
              detalle: 'El denominador no puede anularse en puntos donde x lo haga cero.',
            });
          }
        }

        if (nodo.op === '^') {
          const base = nodo.args?.[0];
          const exponente = nodo.args?.[1];
          if (exponente && contieneX(exponente)) {
            tienePotenciaConXEnExponente = true;
            familias.add('exponencial');
            soloPolinomica = false;
          } else if (exponente && !contieneX(exponente)) {
            try {
              const valorExp = exponente.compile().evaluate();
              if (typeof valorExp === 'number') {
                if (!Number.isInteger(valorExp)) {
                  tienePotenciaNoEntera = true;
                  familias.add('radical');
                  soloPolinomica = false;
                  if (base && contieneX(base) && valorExp < 1 && valorExp > 0) {
                    restricciones.push({
                      tipo: 'radical_par',
                      descripcion: 'Exponente fraccionario',
                      detalle: 'Puede requerir que la base sea no negativa para permanecer en reales.',
                    });
                  }
                } else if (valorExp < 0 && base && contieneX(base)) {
                  tieneDivisionConX = true;
                  familias.add('racional');
                  soloPolinomica = false;
                }
              }
            } catch {
            }
          }
        }
      }
    });

    if (!tieneVariableX) {
      return {
        clasificacion: {
          tipo: 'CONSTANTE',
          nombre: 'Constante',
          descripcion: 'La función no depende de la variable x.',
          familiasDetectadas: ['constante'],
        },
        restricciones,
      };
    }

    if (soloPolinomica && !tieneDivisionConX && !tienePotenciaConXEnExponente && !tienePotenciaNoEntera) {
      familias.add('polinómica');
    } else if (tieneVariableX && familias.size > 0 && !familias.has('polinómica')) {
      if (this.tieneTerminoPolinomicoExterno(raiz)) {
        familias.add('polinómica');
      }
    }

    const listaFamilias = Array.from(familias);
    let tipo: TipoFuncion;
    let nombre: string;
    let descripcion: string;

    if (listaFamilias.length > 1) {
      tipo = 'MIXTA';
      nombre = `Mixta (${listaFamilias.join(' + ')})`;
      descripcion = `Combina características de funciones ${listaFamilias.join(' y ')}.`;
    } else if (listaFamilias.length === 1) {
      const unica = listaFamilias[0];
      switch (unica) {
        case 'polinómica':
          tipo = 'POLINOMICA';
          nombre = 'Polinómica';
          descripcion = 'Compuesta por potencias enteras no negativas de x.';
          break;
        case 'racional':
          tipo = 'RACIONAL';
          nombre = 'Racional';
          descripcion = 'Cociente de expresiones con presencia de x en el denominador.';
          break;
        case 'trigonométrica':
          tipo = 'TRIGONOMETRICA';
          nombre = 'Trigonométrica';
          descripcion = 'Involucra razones trigonométricas periódicas (seno, coseno, etc.).';
          break;
        case 'exponencial':
          tipo = 'EXPONENCIAL';
          nombre = 'Exponencial';
          descripcion = 'Involucra la variable x en exponentes o exp(x).';
          break;
        case 'logarítmica':
          tipo = 'LOGARITMICA';
          nombre = 'Logarítmica';
          descripcion = 'Involucra el logaritmo natural de expresiones con x.';
          break;
        case 'radical':
          tipo = 'RADICAL';
          nombre = 'Radical / Irracional';
          descripcion = 'Involucra raíces o potencias con exponentes fraccionarios sobre x.';
          break;
        default:
          tipo = 'OTRA';
          nombre = 'General / Trascendente';
          descripcion = 'Función matemática estructurada.';
      }
    } else {
      tipo = 'OTRA';
      nombre = 'General';
      descripcion = 'Expresión algebraica evaluable.';
    }

    const restriccionesUnicas = restricciones.filter((r, index, self) =>
      index === self.findIndex((o) => o.tipo === r.tipo)
    );

    return {
      clasificacion: {
        tipo,
        nombre,
        descripcion,
        familiasDetectadas: listaFamilias,
      },
      restricciones: restriccionesUnicas,
    };
  }

  private tieneTerminoPolinomicoExterno(nodo: MathNode): boolean {
    if (isSymbolNode(nodo) && nodo.name === 'x') {
      return true;
    }

    if (isOperatorNode(nodo) && (nodo.op === '+' || nodo.op === '-')) {
      return nodo.args?.some((arg) => this.esRamaPolinomicaPura(arg)) ?? false;
    }

    return false;
  }

  private esRamaPolinomicaPura(nodo: MathNode): boolean {
    let tieneX = false;
    let tieneNoPolinomico = false;

    nodo.traverse((n) => {
      if (isSymbolNode(n) && n.name === 'x') {
        tieneX = true;
      }
      if (isFunctionNode(n)) {
        tieneNoPolinomico = true;
      }
      if (isOperatorNode(n) && n.op === '/') {
        tieneNoPolinomico = true;
      }
      if (isOperatorNode(n) && n.op === '^') {
        const exp = n.args?.[1];
        if (exp) {
          try {
            const v = exp.compile().evaluate();
            if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
              tieneNoPolinomico = true;
            }
          } catch {
            tieneNoPolinomico = true;
          }
        }
      }
    });

    return tieneX && !tieneNoPolinomico;
  }
}
