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

  if (!grafica || paso !== 'Iteración 1' || cantidadPasos < 7 || cdp.errores.length) {
    throw new Error(`Fallo de interfaz: ${JSON.stringify({ grafica, paso, cantidadPasos, errores: cdp.errores })}`);
  }

  console.log(JSON.stringify({
    ejecutable,
    seguridad,
    resultados: { polinomica, trigonometrica, exponencial },
    grafica,
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
