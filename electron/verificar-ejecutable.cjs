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
  const establecerCampo = (selector, valor) => cdp.evaluar('(() => { const elemento = document.querySelector(' + JSON.stringify(selector) + '); elemento.value = ' + JSON.stringify(valor) + '; elemento.dispatchEvent(new Event(\'input\', { bubbles: true })); })()');

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

  await establecerCampo('#expresion', '10*(0.5*pi - asin(x) - x*sqrt(1-x^2)) - 12.4');
  await establecerCampo('[formcontrolname=extremoIzquierdo]', '0');
  await establecerCampo('[formcontrolname=extremoDerecho]', '1');
  await establecerCampo('[formcontrolname=tolerancia]', '0.0000001');
  await establecerCampo('[formcontrolname=maximoIteraciones]', '100');
  await cdp.evaluar('document.querySelector(\'button[type=submit]\').click()');
  await esperar(200);
  const raizParcial = await esperarValor(cdp, '.raiz > strong');
  validarCercania(raizParcial, 0.166166, 0.000002);
  const respuestaParcial = await cdp.evaluar('({ titulo: document.body.textContent.includes(\'Respuesta académica\'), cambioSigno: document.body.textContent.includes(\'Existe un cambio de signo\'), cota: document.querySelector(\'.resultado-cota\')?.textContent?.includes(\'N = 24\'), filas: document.querySelectorAll(\'.respuesta-academica table tr\').length, contenido: document.querySelector(\'.respuesta-academica\')?.textContent })');
  if (!respuestaParcial.titulo || !respuestaParcial.cambioSigno || !respuestaParcial.cota || respuestaParcial.filas < 5 || !respuestaParcial.contenido?.includes('0.1875')) {
    throw new Error('La respuesta académica del ejercicio real no coincide con la aceptación: ' + JSON.stringify(respuestaParcial));
  }

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

  await cdp.evaluar(`[...document.querySelectorAll('.metodo')].find(b => b.textContent.includes('Punto Fijo')).click()`);
  const estadoInicialPuntoFijo = await cdp.evaluar(`({
    f: document.querySelector('#expresion').value,
    g: document.querySelector('#expresionIteracion').value,
    x0: document.querySelector('[formcontrolname="valorInicial"]').value
  })`);
  if (estadoInicialPuntoFijo.f !== 'exp(-x) - x' || estadoInicialPuntoFijo.g || estadoInicialPuntoFijo.x0 !== '0.5') {
    throw new Error('Punto Fijo no conservó f(x) y x₀ o completó g(x) automáticamente: ' + JSON.stringify(estadoInicialPuntoFijo));
  }

  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[0].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const pfTrigonometrica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(pfTrigonometrica, 0.7390851332);

  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[1].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const pfExponencial = await esperarValor(cdp, '.raiz > strong');
  validarCercania(pfExponencial, 0.5671432904);

  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[2].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const pfPolinomica = await esperarValor(cdp, '.raiz > strong');
  validarCercania(pfPolinomica, 1.5213797068);

  const formulasPuntoFijo = await cdp.evaluar(`document.querySelectorAll('.formulas-newton .katex').length`);
  if (formulasPuntoFijo < 3) throw new Error('No se muestran f(x), g(x) y g\'(x) con KaTeX.');

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Gráfica')).click()`);
  await esperar(500);
  const graficaCobweb = await cdp.evaluar(`document.querySelector('.grafica-toolbar')?.textContent?.includes('Cobweb') && Boolean(document.querySelector('.jxgbox svg'))`);

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Iteraciones')).click()`);
  await esperarValor(cdp, 'tbody tr');
  const encabezadosTabla = await cdp.evaluar(`[...document.querySelectorAll('th')].map(t => t.textContent.trim()).join(' | ')`);
  if (!encabezadosTabla.includes("g'(xₙ)") || !encabezadosTabla.includes('|g(xₙ)−xₙ|') || !encabezadosTabla.includes('|f(xₙ₊₁)|')) {
    throw new Error('La tabla de Punto Fijo no contiene las columnas requeridas: ' + encabezadosTabla);
  }

  await cdp.evaluar(`document.querySelectorAll('tbody tr')[1].click()`);
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Paso a paso')).click()`);
  const pasoPuntoFijo = await esperarValor(cdp, '.procedimiento header strong');
  const contenidoPasos = await cdp.evaluar(`document.querySelector('.procedimiento')?.textContent`);
  if (!contenidoPasos.includes("g'(x)") || !contenidoPasos.includes('Punto Fijo')) {
    throw new Error('El paso a paso de Punto Fijo no muestra la derivada o la fórmula de iteración.');
  }

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Análisis')).click()`);
  const analisisPuntoFijo = await esperarValor(cdp, '.analisis-previo');
  if (!analisisPuntoFijo.includes("g'(x) obtenida") || !analisisPuntoFijo.includes('|g\'(x₀)|')) {
    throw new Error('La pestaña Análisis no contiene las validaciones de Punto Fijo.');
  }

  await cdp.evaluar(`(() => {
    const el = document.querySelector('#expresion');
    el.value = 'x^3 - x - 2';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await esperar(300);

  const formulasDerivadas = await cdp.evaluar(`document.querySelectorAll('.seccion-derivadas .katex').length`);
  if (formulasDerivadas < 3) {
    throw new Error('No se muestran la función y sus derivadas (primera y segunda) en KaTeX.');
  }

  await cdp.evaluar(`(() => {
    const inputX = document.querySelector('#input-punto-x');
    inputX.value = '2';
    inputX.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.btn-evaluar').click();
  })()`);
  await esperar(200);
  const resultadoEvaluacion = await esperarValor(cdp, '.valor-eval');
  if (!resultadoEvaluacion.includes('4')) {
    throw new Error('La evaluación de f(2) no arrojó 4: ' + resultadoEvaluacion);
  }

  const cantidadCandidatos = await cdp.evaluar(`document.querySelectorAll('.item-candidato').length`);
  if (cantidadCandidatos === 0) {
    throw new Error('No se detectaron intervalos candidatos para Bisección.');
  }

  const graficaGeneralSvg = await cdp.evaluar(`Boolean(document.querySelector('app-grafica-general .jxgbox svg'))`);
  if (!graficaGeneralSvg) {
    throw new Error('La gráfica general interactiva no se renderizó.');
  }

  const categoriasTeclado = await cdp.evaluar(`document.querySelectorAll('.categorias-teclado button').length`);
  if (categoriasTeclado < 4) {
    throw new Error('El teclado científico no tiene las categorías requeridas.');
  }

  await cdp.evaluar(`document.querySelector('.btn-accion').click()`);
  await esperar(200);
  const metodoTrasBiseccion = await cdp.evaluar(`document.querySelector('.metodo-activo').textContent`);
  if (!metodoTrasBiseccion.includes('Bisección')) {
    throw new Error('El método activo no cambió a Bisección al transferir el intervalo.');
  }
  const aTransferido = await cdp.evaluar(`document.querySelector('[formcontrolname="extremoIzquierdo"]').value`);
  const bTransferido = await cdp.evaluar(`document.querySelector('[formcontrolname="extremoDerecho"]').value`);
  if (!aTransferido || !bTransferido) {
    throw new Error('No se transfirieron los extremos a y b a Bisección.');
  }
  const raizAutoBiseccion = await cdp.evaluar(`Boolean(document.querySelector('.raiz > strong'))`);
  if (raizAutoBiseccion) {
    throw new Error('Bisección se resolvió automáticamente tras la transferencia.');
  }
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(200);
  validarCercania(await esperarValor(cdp, '.raiz > strong'), 1.5213797068);

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Análisis')).click()`);
  await esperar(200);
  await cdp.evaluar(`document.querySelector('.btn-accion-newton').click()`);
  await esperar(200);
  const metodoTrasNewton = await cdp.evaluar(`document.querySelector('.metodo-activo').textContent`);
  if (!metodoTrasNewton.includes('Newton-Raphson')) {
    throw new Error('El método activo no cambió a Newton-Raphson al transferir x₀.');
  }
  const x0Transferido = await cdp.evaluar(`document.querySelector('[formcontrolname="valorInicial"]').value`);
  if (!x0Transferido) {
    throw new Error('No se transfirió x₀ a Newton-Raphson.');
  }
  const raizAutoNewton = await cdp.evaluar(`Boolean(document.querySelector('.raiz > strong'))`);
  if (raizAutoNewton) {
    throw new Error('Newton-Raphson se resolvió automáticamente tras la transferencia.');
  }
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(200);
  validarCercania(await esperarValor(cdp, '.raiz > strong'), 1.5213797068);

  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Gráfica')).click()`);
  await esperar(200);
  const responsive = [];
  for (const [width, height] of [[1366, 768], [1280, 720], [1024, 768], [860, 640], [390, 700]]) {
    await cdp.evaluar(`window.resizeTo(${width}, ${height})`);
    await esperar(140);
    responsive.push(await cdp.evaluar(`({ width: innerWidth, height: innerHeight, sinScrollHorizontal: document.documentElement.scrollWidth <= document.documentElement.clientWidth, graficaVisible: Boolean(document.querySelector('.jxgbox svg')), resolverDisponible: Boolean(document.querySelector('button[type="submit"]')) })`));
  }

  await cliente.Network.enable();
  await cliente.Network.emulateNetworkConditions({ offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await cdp.evaluar(`[...document.querySelectorAll('.metodo')].find(b => b.textContent.includes('Newton-Raphson')).click()`);
  await cdp.evaluar(`document.querySelectorAll('.ejemplos button')[0].click(); document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Resumen'))?.click()`);
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

  await cdp.evaluar(`[...document.querySelectorAll('.metodo')].find(b => b.textContent.includes('Punto Fijo')).click()`);
  await cdp.evaluar(`[...document.querySelectorAll('.pestanas button')].find(b => b.textContent.includes('Resumen'))?.click()`);
  await establecer('#expresion', 'x - 2');
  await establecer('#expresionIteracion', '0.5*x');
  await establecer('[formcontrolname="valorInicial"]', '1');
  await cdp.evaluar(`document.querySelector('button[type="submit"]').click()`);
  await esperar(150);
  const advertenciaTransformacion = await cdp.evaluar(`document.body.textContent.includes('Revisa la transformación utilizada para g(x)')`);
  if (!advertenciaTransformacion) {
    throw new Error('No se mostró la advertencia de transformación inconsistente con f(x)=0.');
  }

  if (!respuestaParcial.titulo || !grafica || !derivada || !tangente || !derivadaCero || !entradaInvalida || !maximoIteraciones || responsive.some((vista) => !vista.sinScrollHorizontal || !vista.graficaVisible || !vista.resolverDisponible) || paso !== 'Iteración 1' || cantidadPasos < 7 || cdp.errores.length) {
    throw new Error(`Fallo de interfaz: ${JSON.stringify({ grafica, derivada, tangente, derivadaCero, entradaInvalida, maximoIteraciones, responsive, paso, cantidadPasos, errores: cdp.errores })}`);
  }

  console.log(JSON.stringify({
    ejecutable,
    seguridad,
    resultados: {
      biseccion: { polinomica, trigonometrica, exponencial },
      ejercicioParcial: { raiz: raizParcial, respuestaAcademica: respuestaParcial },
      newton: { polinomica: newtonPolinomica, trigonometrica: newtonTrigonometrica, exponencial: newtonExponencial },
      puntoFijo: { trigonometrica: pfTrigonometrica, exponencial: pfExponencial, polinomica: pfPolinomica }
    },
    grafica,
    graficaCobweb,
    derivada,
    tangente,
    pruebaOffline: true,
    casosControlados: { derivadaCero, entradaInvalida, maximoIteraciones, advertenciaTransformacion },
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


