import { AnalizadorExpresiones } from '../matematicas/analizador-expresiones';
import { DerivadorExpresiones } from '../matematicas/derivador-expresiones';
import { EvaluadorExpresiones } from '../matematicas/evaluador-expresiones';
import { FormateadorExpresiones } from '../matematicas/formateador-expresiones';
import type { ExpresionAnalizada } from '../matematicas/modelos-matematicos';
import { ClasificadorFuncion } from './clasificador-funcion';
import { ExploradorFuncion, type OpcionesExploracion } from './explorador-funcion';
import type { AnalisisFuncion, EvaluacionPuntual, ResultadoExploracion } from './modelos-analisis';

export class AnalizadorFuncion {
  constructor(
    private readonly analizador = new AnalizadorExpresiones(),
    private readonly derivador = new DerivadorExpresiones(),
    private readonly evaluador = new EvaluadorExpresiones(),
    private readonly formateador = new FormateadorExpresiones(),
    private readonly clasificador = new ClasificadorFuncion(),
    private readonly explorador = new ExploradorFuncion()
  ) {}

  analizar(entrada: string): AnalisisFuncion {
    const expresion = this.analizador.analizar(entrada);
    const advertencias: string[] = [];

    let derivada: ExpresionAnalizada | undefined;
    let segundaDerivada: ExpresionAnalizada | undefined;

    try {
      derivada = this.derivador.derivar(expresion);
    } catch {
      advertencias.push('No fue posible obtener la primera derivada simbólica de la función ingresada.');
    }

    if (derivada) {
      try {
        segundaDerivada = this.derivador.derivar(derivada);
      } catch {
        advertencias.push("No fue posible obtener la segunda derivada simbólica a partir de f'(x).");
      }
    }

    const { clasificacion, restricciones } = this.clasificador.clasificar(expresion);

    return {
      expresion,
      derivada,
      segundaDerivada,
      clasificacion,
      restriccionesEstructurales: restricciones,
      advertencias,
    };
  }

  evaluarPuntual(expresion: ExpresionAnalizada, x: number): EvaluacionPuntual {
    const resultado = this.evaluador.evaluar(expresion, x);
    const sustitucionLatex = this.formateador.sustituirVariableLatex(
      expresion.expresionNormalizada,
      x
    );

    return {
      x,
      resultado,
      sustitucionLatex,
    };
  }

  explorarIntervalo(
    expresion: ExpresionAnalizada,
    derivada?: ExpresionAnalizada,
    opciones?: OpcionesExploracion
  ): ResultadoExploracion {
    return this.explorador.explorar(expresion, derivada, opciones);
  }
}
