export interface SolicitudIteracionesBiseccion {
  operacion: "iteraciones_biseccion";
  a: number;
  b: number;
  tolerancia: number;
}

export interface RespuestaIteracionesBiseccion {
  ok: boolean;
  motor: "python";
  valorLogaritmo?: number;
  iteracionesTeoricas?: number;
  error?: string;
}

interface PuenteMotorNumerico {
  ejecutar(solicitud: SolicitudIteracionesBiseccion): RespuestaIteracionesBiseccion;
}

declare global {
  interface Window {
    motorNumerico?: PuenteMotorNumerico;
  }
}

export function calcularIteracionesBiseccionConPython(
  a: number,
  b: number,
  tolerancia: number,
): RespuestaIteracionesBiseccion | undefined {
  if (typeof window === "undefined" || !window.motorNumerico) return undefined;

  try {
    const respuesta = window.motorNumerico.ejecutar({ operacion: "iteraciones_biseccion", a, b, tolerancia });
    if (
      respuesta.ok
      && respuesta.motor === "python"
      && Number.isFinite(respuesta.valorLogaritmo)
      && Number.isInteger(respuesta.iteracionesTeoricas)
    ) {
      return respuesta;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
