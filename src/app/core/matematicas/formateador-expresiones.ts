import { parse } from 'mathjs';

export class FormateadorExpresiones {
  numero(valor: number, cifras = 10): string {
    if (!Number.isFinite(valor)) return 'no definido';
    if (valor === 0) return '0';
    const absoluto = Math.abs(valor);
    if (absoluto >= 1e7 || absoluto < 1e-6) return valor.toExponential(Math.max(2, cifras - 1));
    return Number(valor.toPrecision(cifras)).toString();
  }

  numeroLatex(valor: number, cifras = 10): string {
    return this.numero(valor, cifras).replace(/e([+-]?\d+)/, '\\times 10^{$1}');
  }

  sustituirVariableLatex(expresionNormalizada: string, valor: number): string {
    const numero = this.numero(valor, 15);
    return parse(expresionNormalizada.replace(/\bx\b/g, '(' + numero + ')')).toTex({ parenthesis: 'keep', implicit: 'hide' });
  }
}
