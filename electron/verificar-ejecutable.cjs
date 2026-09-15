const { spawn } = require('node:child_process');
const path = require('node:path');
const CDP = require('chrome-remote-interface');

const puerto = 9333;
const ejecutable = path.join(__dirname, '..', 'release', 'MetodosNumericos.exe');
const entorno = { ...process.env };
delete entorno.ELECTRON_RUN_AS_NODE;
let clienteActivo;

const proceso = spawn(ejecutable, [`--remote-debugging-port=${puerto}`], {
  env: entorno,
  detached: false,
  stdio: 'ignore',
});

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function obtenerObjetivo() {
  for (let intento = 0; intento < 80; intento += 1) {
    try {
      const objetivos = await (await fetch(`http://127.0.0.1:${puerto}/json`)).json();
      if (objetivos[0]?.webSocketDebuggerUrl) return objetivos[0];
    } catch {}
    await esperar(200);
  }
  throw new Error('El ejecutable no abrió una ventana depurable.');
}

async function esperarValor(cdp, selector, intentos = 40) {
  for (let intento = 0; intento < intentos; intento += 1) {
    const valor = await cdp.evaluar(`document.querySelector(${JSON.stringify(selector)})?.textContent?.trim()`);
    if (valor) return valor;
    await esperar(100);
  }
  throw new Error(`No apareció el elemento ${selector}.`);
}

function validarCercania(actual, esperado, tolerancia = 0.000002) {
  if (Math.abs(Number(actual) - esperado) > tolerancia) {
    throw new Error(`Resultado ${actual}; se esperaba aproximadamente ${esperado}.`);
  }
}

async function ejecutar() {
  const objetivo = await obtenerObjetivo();
  const cliente = await CDP({ target: objetivo.id, port: puerto });
  clienteActivo = cliente;
  const errores = [];
  cliente.Runtime.exceptionThrown(({ exceptionDetails }) => errores.push(exceptionDetails.text));
  await cliente.Runtime.enable();
  const cdp = {
    errores,
    async evaluar(expression) {
      const respuesta = await cliente.Runtime.evaluate({ expression, returnByValue: true, awaitPromise: true });
      if (respuesta.exceptionDetails) throw new Error(respuesta.exceptionDetails.text);
      return respuesta.result.value;
    },
  };

  const seguridad = await cdp.evaluar(`({ titulo: document.title, require: typeof require, protocolo: location.protocol })`);
  if (seguridad.titulo !== 'Métodos Numéricos' || seguridad.require !== 'undefined' || seguridad.protocolo !== 'file:') {
    throw new Error(`Configuración insegura o título incorrecto: ${JSON.stringify(seguridad)}`);
  }

  await esperarValor(cdp, 'button[type="submit"]');
  const estadoInicial = await cdp.evaluar('({ expresion: document.querySelector("#expresion").value, a: document.querySelector("[formcontrolname=extremoIzquierdo]").value, b: document.querySelector("[formcontrolname=extremoDerecho]").value, modoLocal: document.body.textContent.includes("Modo local") })');
  if (estadoInicial.expresion || estadoInicial.a || estadoInicial.b || estadoInicial.modoLocal) {
    throw new Error('El formulario no inicia vacío o conserva el mensaje eliminado: ' + JSON.stringify(estadoInicial));
  }
  await cdp.evaluar('document.querySelectorAll(".ejemplos button")[0].click()');
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  const polinomica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(polinomica, 1.5213797068);

  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[1].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const trigonometrica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(trigonometrica, 0.7390851332);

  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[2].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const exponencial = await esperarValor(cdp, '.raiz > strong');
  validarCercania(exponencial, 0.5671432904);

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Gráfica')).click()`);
  await esperar(500);
  const grafica = await cdp.evaluar(`Boolean(document.querySelector('.jxgbox svg'))`);

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Iteraciones')).click()`);
  await esperarValor(cdp, 'tbody tr');
  await cdp.evaluar(`document.querySelector('tbody tr').click()`);
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Paso a paso')).click()`);
  const paso = await esperarValor(cdp, '.procedimiento header strong');
  const cantidadPasos = await cdp.evaluar(`document.querySelectorAll('.procedimiento li').length`);

  await cdp.evaluar(`[...document.querySelectorAll('.metodo')].find(b => b.textContent.includes('Newton-Raphson')).click()`);
  const x0Vacio = await cdp.evaluar(`document.querySelector('[formcontrolname="valorInicial"]').value`);
  if (x0Vacio) throw new Error('El valor inicial x₀ no inicia vacío.');
  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[0].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const newtonPolinomica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(newtonPolinomica, 1.5213797068);
  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[1].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const newtonTrigonometrica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(newtonTrigonometrica, 0.7390851332);
  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[2].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const newtonExponencial = await esperarValor(cdp, '.raiz > strong');
  validarCercania(newtonExponencial, 0.5671432904);
  const derivada = await cdp.evaluar(`Boolean(document.querySelector('.formulas-newton .katex'))`);
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Gráfica')).click()`);
  await esperar(500);
  const tangente = await cdp.evaluar(`document.querySelector('.jxgbox').textContent.includes('xₙ₊₁')`);

  const responsive = [];
  for (const [width, height] of [[1366, 768], [1280, 720], [1024, 768], [860, 640], [390, 700]]) {
    await cdp.evaluar(`window.resizeTo(${width}, ${height})`);
    await esperar(140);
    responsive.push(await cdp.evaluar(`({ width: innerWidth, height: innerHeight, sinScrollHorizontal: document.documentElement.scrollWidth <= document.documentElement.clientWidth, graficaVisible: Boolean(document.querySelector('.jxgbox svg')), resolverDisponible: Boolean(document.querySelector('button[type="submit"]')) })`));
  }

  await cliente.Network.enable();
  await cliente.Network.emulateNetworkConditions({ offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Resumen')).click(); document.querySelectorAll('.ejemplos button')[0].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  validarCercania(await esperarValor(cdp, '.raiz > strong'), 1.5213797068);
  const establecer = (selector, valor) => cdp.evaluar(`(() => { const elemento = document.querySelector(${JSON.stringify(selector)}); elemento.value = ${JSON.stringify(valor)}; elemento.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await establecer('#expresion', 'x^2 + 1');
  await establecer('[formcontrolname="valorInicial"]', '0');
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(120);
  const derivadaCero = await cdp.evaluar(`document.querySelector('.raiz p').textContent.includes('derivada es cero')`);
  await establecer('#expresion', 'x +');
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(120);
  const entradaInvalida = await cdp.evaluar(`Boolean(document.querySelector('.mensaje-error'))`);
  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[0].click()`);
  await establecer('[formcontrolname="maximoIteraciones"]', '1');
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(120);
  const maximoIteraciones = await cdp.evaluar(`Boolean(document.querySelector('.raiz p')?.textContent.includes('máximo de iteraciones'))`);

  if (!grafica || !derivada || !tangente || !derivadaCero || !entradaInvalida || !maximoIteraciones || responsive.some((vista) => !vista.sinScrollHorizontal || !vista.graficaVisible || !vista.resolverDisponible) || paso !== 'Iteración 1' || cantidadPasos < 7 || cdp.errores.length) {
    throw new Error(`Fallo de interfaz: ${JSON.stringify({ grafica, derivada, tangente, derivadaCero, entradaInvalida, maximoIteraciones, responsive, paso, cantidadPasos, errores: cdp.errores })}`);
  }

  console.log(JSON.stringify({
    ejecutable,
    seguridad,
    resultados: { biseccion: { polinomica, trigonometrica, exponencial }, newton: { polinomica: newtonPolinomica, trigonometrica: newtonTrigonometrica, exponencial: newtonExponencial } },
    grafica,
    derivada,
    tangente,
    pruebaOffline: true,
    casosControlados: { derivadaCero, entradaInvalida, maximoIteraciones },
    responsive,
    sincronizacion: paso,
    cantidadPasos,
    erroresCriticos: cdp.errores.length,
  }, null, 2));
  await cliente.Browser.close().catch(() => undefined);
  await cliente.close();
  proceso.kill();
}

ejecutar().catch(async (error) => {
  if (clienteActivo) {
    await clienteActivo.Browser.close().catch(() => undefined);
    await clienteActivo.close().catch(() => undefined);
  }
  proceso.kill();
  console.error(error);
  process.exit(1);
});
