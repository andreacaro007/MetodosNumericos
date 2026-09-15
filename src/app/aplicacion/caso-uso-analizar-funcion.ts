import { Injectable } from '@angular/core';
import { AnalizadorFuncion } from '../core/analisis-funciones/analizador-funcion';
import type {
  AnalisisFuncion,
  EvaluacionPuntual,
  ResultadoExploracion,
} from '../core/analisis-funciones/modelos-analisis';
import type { ExpresionAnalizada } from '../core/matematicas/modelos-matematicos';

@Injectable({
  providedIn: 'root',
})
export class CasoUsoAnalizarFuncion {
  private readonly analizador = new AnalizadorFuncion();

  analizar(expresionTexto: string): AnalisisFuncion {
    return this.analizador.analizar(expresionTexto);
  }

  evaluarPuntual(expresion: ExpresionAnalizada, x: number): EvaluacionPuntual {
    return this.analizador.evaluarPuntual(expresion, x);
  }

  explorar(
    expresion: ExpresionAnalizada,
    derivada?: ExpresionAnalizada,
    opciones?: { desde?: number; hasta?: number; muestras?: number }
  ): ResultadoExploracion {
    return this.analizador.explorarIntervalo(expresion, derivada, opciones);
  }
}
