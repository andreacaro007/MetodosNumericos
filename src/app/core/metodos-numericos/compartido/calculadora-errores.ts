export interface ErroresNumericos {
  absoluto?: number;
  relativo?: number;
  porcentual?: number;
}

export class CalculadoraErrores {
  static calcular(actual: number, anterior?: number): ErroresNumericos {
    if (anterior === undefined || !Number.isFinite(actual) || !Number.isFinite(anterior)) return {};
    const absoluto = Math.abs(actual - anterior);
    if (actual === 0) return { absoluto };
    const relativo = absoluto / Math.abs(actual);
    return { absoluto, relativo, porcentual: relativo * 100 };
  }
}
