import json
import math
import sys


def iteraciones_biseccion(datos):
    a = datos.get("a")
    b = datos.get("b")
    tolerancia = datos.get("tolerancia")
    valores = (a, b, tolerancia)

    if not all(isinstance(valor, (int, float)) and math.isfinite(valor) for valor in valores):
        raise ValueError("a, b y tolerancia deben ser números finitos")
    if a == b:
        raise ValueError("a y b deben ser diferentes")
    if tolerancia <= 0:
        raise ValueError("la tolerancia debe ser mayor que cero")

    valor_logaritmo = math.log2(abs(b - a) / tolerancia)
    return {
        "ok": True,
        "motor": "python",
        "valorLogaritmo": valor_logaritmo,
        "iteracionesTeoricas": max(0, math.ceil(valor_logaritmo)),
    }


OPERACIONES = {"iteraciones_biseccion": iteraciones_biseccion}


def responder():
    try:
        datos = json.loads(sys.stdin.read())
        if not isinstance(datos, dict):
            raise ValueError("la entrada debe ser un objeto JSON")
        funcion = OPERACIONES.get(datos.get("operacion"))
        if funcion is None:
            raise ValueError("operación no permitida")
        respuesta = funcion(datos)
    except (ValueError, TypeError, json.JSONDecodeError) as error:
        respuesta = {"ok": False, "motor": "python", "error": str(error)}

    sys.stdout.write(json.dumps(respuesta, ensure_ascii=False, allow_nan=False))


if __name__ == "__main__":
    responder()
