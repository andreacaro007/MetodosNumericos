import { Pipe, PipeTransform } from '@angular/core';
import { FormateadorExpresiones } from '../core/matematicas/formateador-expresiones';

@Pipe({ name: 'numero', standalone: true })
export class FormatearNumeroPipe implements PipeTransform {
  private readonly formato = new FormateadorExpresiones();
  transform(valor: number | undefined, cifras = 9): string {
    return valor === undefined ? '—' : this.formato.numero(valor, cifras);
  }
}
