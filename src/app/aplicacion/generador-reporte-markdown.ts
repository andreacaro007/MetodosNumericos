import type {
  ResultadoAplicacion,
  ResultadoComparacion,
  ResultadoMetodoComparado,
} from '../core/comparacion/modelos-comparacion';
import type { MetodoNumerico } from '../core/metodos-numericos/compartido/modelos-solucion';
import type { ResultadoBiseccion } from '../core/metodos-numericos/biseccion/modelos-biseccion';
import type { ResultadoNewton } from '../core/metodos-numericos/newton/modelos-newton';
import type { ResultadoPuntoFijo } from '../core/metodos-numericos/punto-fijo/modelos-punto-fijo';

const NOMBRES_METODOS: Record<MetodoNumerico, string> = {
  BISECCION: 'Bisección',
  NEWTON_RAPHSON: 'Newton-Raphson',
  PUNTO_FIJO: 'Punto Fijo',
};

export class GeneradorReporteMarkdown {
  generarResultado(resultado: ResultadoAplicacion): string {
    const configuracion = [
      '- Tolerancia: ' + this.numero(resultado.tolerancia),
      '- Máximo de iteraciones: ' + resultado.maximoIteraciones,
      ...this.parametrosMetodo(resultado),
    ];
    const lineas = [
      '# Resolución — Métodos Numéricos',
      '',
      '## Función',
      '',
      'f(x) = ' + this.texto(resultado.expresionNormalizada),
      '',
      '## Configuración',
      '',
      ...configuracion,
      '',
      '## Resultado',
      '',
      '- Método: ' + NOMBRES_METODOS[resultado.metodo],
      '- Estado: ' + this.estado(resultado.estado),
      '- Raíz aproximada: ' + this.numero(resultado.raiz),
      '- Iteraciones: ' + resultado.cantidadIteraciones,
      '- Error absoluto final: ' + this.numero(resultado.errorAbsolutoFinal),
      '- Error relativo final: ' + this.numero(resultado.errorRelativoFinal),
      '- Residuo |f(x)|: ' + this.numero(resultado.residuoFinal),
      '- Razón de parada: ' + this.texto(resultado.descripcionParada),
      '',
      '## Iteraciones',
      '',
      ...this.tablaIteraciones(resultado),
      '',
      '## Conclusión',
      '',
      this.texto(resultado.descripcionParada),
      ...resultado.advertencias.map((advertencia) => '- Advertencia: ' + this.texto(advertencia)),
      '',
    ];
    return lineas.join('\n');
  }

  generarComparacion(comparacion: ResultadoComparacion): string {
    const lineas = [
      '# Comparación de métodos',
      '',
      '## Función',
      '',
      'f(x) = ' + this.texto(comparacion.expresion),
      '',
      'Tolerancia: ' + this.numero(comparacion.tolerancia),
      '',
      'Máximo de iteraciones: ' + comparacion.maximoIteraciones,
      '',
      '## Resultados',
      '',
      '| Método | Estado | Raíz | Iteraciones | Error absoluto | Residuo | Razón de parada |',
      '| --- | --- | ---: | ---: | ---: | ---: | --- |',
      ...comparacion.metodos.map((metodo) => this.filaComparacion(metodo)),
      '',
      '## Observaciones',
      '',
      ...comparacion.observaciones.map((observacion) => '- ' + this.texto(observacion)),
      '',
    ];
    return lineas.join('\n');
  }

  private parametrosMetodo(resultado: ResultadoAplicacion): string[] {
    if (resultado.metodo === 'BISECCION') {
      const primera = (resultado as ResultadoBiseccion).iteraciones[0];
      return primera
        ? [
            '- Extremo izquierdo a: ' + this.numero(primera.extremoIzquierdo),
            '- Extremo derecho b: ' + this.numero(primera.extremoDerecho),
          ]
        : [];
    }
    if (resultado.metodo === 'NEWTON_RAPHSON') {
      const primera = (resultado as ResultadoNewton).iteraciones[0];
      return primera ? ['- Valor inicial x₀: ' + this.numero(primera.xActual)] : [];
    }
    const puntoFijo = resultado as ResultadoPuntoFijo;
    const primera = puntoFijo.iteraciones[0];
    return [
      '- Transformación g(x): ' + this.texto(puntoFijo.expresionIteracionNormalizada),
      ...(primera ? ['- Valor inicial x₀: ' + this.numero(primera.xActual)] : []),
    ];
  }

  private tablaIteraciones(resultado: ResultadoAplicacion): string[] {
    if (resultado.iteraciones.length === 0) return ['No fue necesario realizar iteraciones.'];
    if (resultado.metodo === 'BISECCION') {
      const biseccion = resultado as ResultadoBiseccion;
      return [
        '| n | a | b | xₘ | f(xₘ) | Error absoluto |',
        '| ---: | ---: | ---: | ---: | ---: | ---: |',
        ...biseccion.iteraciones.map(
          (iteracion) =>
            '| ' +
            [
              iteracion.numero,
              this.numero(iteracion.extremoIzquierdo),
              this.numero(iteracion.extremoDerecho),
              this.numero(iteracion.puntoMedio),
              this.numero(iteracion.valorPuntoMedio),
              this.numero(iteracion.errorAbsoluto),
            ].join(' | ') +
            ' |'
        ),
      ];
    }
    if (resultado.metodo === 'NEWTON_RAPHSON') {
      const newton = resultado as ResultadoNewton;
      return [
        "| n | xₙ | f(xₙ) | f'(xₙ) | xₙ₊₁ | Error absoluto |",
        '| ---: | ---: | ---: | ---: | ---: | ---: |',
        ...newton.iteraciones.map(
          (iteracion) =>
            '| ' +
            [
              iteracion.numero,
              this.numero(iteracion.xActual),
              this.numero(iteracion.valorFuncion),
              this.numero(iteracion.valorDerivada),
              this.numero(iteracion.siguienteX),
              this.numero(iteracion.errorAbsoluto),
            ].join(' | ') +
            ' |'
        ),
      ];
    }
    const puntoFijo = resultado as ResultadoPuntoFijo;
    return [
      '| n | xₙ | g(xₙ) | xₙ₊₁ | Error absoluto | Residuo |f(x)| |',
      '| ---: | ---: | ---: | ---: | ---: | ---: |',
      ...puntoFijo.iteraciones.map(
        (iteracion) =>
          '| ' +
          [
            iteracion.numero,
            this.numero(iteracion.xActual),
            this.numero(iteracion.valorG),
            this.numero(iteracion.siguienteX),
            this.numero(iteracion.errorAbsoluto),
            this.numero(iteracion.residuoFuncionOriginal),
          ].join(' | ') +
          ' |'
      ),
    ];
  }

  private filaComparacion(metodo: ResultadoMetodoComparado): string {
    return (
      '| ' +
      [
        NOMBRES_METODOS[metodo.metodo],
        this.estado(metodo.estado),
        this.numero(metodo.raiz),
        this.numero(metodo.iteraciones),
        this.numero(metodo.errorAbsolutoFinal),
        this.numero(metodo.residuoFuncion),
        this.texto(metodo.descripcion),
      ].join(' | ') +
      ' |'
    );
  }

  private estado(estado: string): string {
    const estados: Record<string, string> = {
      CONVERGENCIA_ALCANZADA: 'Convergió',
      RAIZ_EXACTA: 'Raíz exacta',
      MAXIMO_ITERACIONES: 'Máximo de iteraciones',
      DERIVADA_CERO: 'Derivada cero',
      DERIVADA_CASI_CERO: 'Derivada casi cero',
      VALOR_NO_FINITO: 'Valor no finito',
      POSIBLE_DIVERGENCIA: 'Posible divergencia',
      NO_DISPONIBLE: 'No disponible',
      ERROR_VALIDACION: 'No ejecutado',
    };
    return estados[estado] ?? this.texto(estado);
  }

  private numero(valor: number | undefined): string {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'No disponible';
    if (valor === 0) return '0';
    const absoluto = Math.abs(valor);
    return absoluto >= 1e7 || absoluto < 1e-6
      ? valor.toExponential(8)
      : Number(valor.toPrecision(10)).toString();
  }

  private texto(valor: string): string {
    return valor.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim() || 'No disponible';
  }
}
