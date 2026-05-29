// contract-template.jsx — Plantilla simplificada:
// Una sola venta genera 5 documentos.  Cada documento se edita como
// UN SOLO BLOQUE DE TEXTO con variables {variable}, no por párrafos.

// ═══════════════════════════════════════════════════════════════
// TIPOS DE DOCUMENTO — una venta genera los 5 automáticamente
// ═══════════════════════════════════════════════════════════════
const DOC_TYPES = [
  { id:'separacion',       label:'Separación',                            tag:'Reserva',   icon:'receipt' },
  { id:'compraventa',      label:'Contrato de Compraventa',               tag:'Principal', icon:'doc' },
  { id:'cronograma',       label:'Cronograma de Pagos',                   tag:'Anexo',     icon:'calendar' },
  { id:'actaSeparacion',   label:'Acta de Separación',                    tag:'Adicional', icon:'archive' },
  { id:'tratamientoDatos', label:'Tratamiento de Datos Personales',       tag:'Anexo',     icon:'shield' },
  { id:'ddjjDomicilio',    label:'Declaración Jurada de Domicilio y Estado Civil', tag:'Anexo', icon:'signature' },
];

const TEMPLATE_STORAGE_KEY = 'mattika.template.v3';

// ─── Mini-formato del cuerpo ───────────────────────────────────
// Sintaxis simple para que el admin no pelee con bloques:
//
//   Texto normal                  → párrafo justificado
//   ## TITULO                     → subtítulo / sección
//   > texto                       → párrafo con sangría (sub-puntos)
//   - item   /  A. item           → ítem de lista
//   [CRONOGRAMA]                  → tabla del cronograma de pagos
//   [FIRMA]                       → bloque de firmas Vendedor / Comprador
//   {variable}                    → se rellena con datos del cliente
//   <b>texto</b>                  → negrita inline (HTML permitido)
//
// Doble salto de línea = nuevo párrafo.

// ═══════════════════════════════════════════════════════════════
// TEXTOS POR DEFECTO — uno por documento
// ═══════════════════════════════════════════════════════════════

const TXT_COMPRAVENTA = `CONSTE POR EL PRESENTE INSTRUMENTO, QUE SE SUSCRIBE EN DOS EJEMPLARES, EL CONTRATO DE COMPRAVENTA DE BIEN FUTURO QUE CELEBRAN:

<b>COMO EL VENDEDOR:</b> {empresa.razonSocial} CON R.U.C {empresa.ruc}, CON DOMICILIO EN {empresa.domicilio}; DEBIDAMENTE REPRESENTADA POR SU GERENTE GENERAL EL SEÑOR {empresa.representante}, IDENTIFICADO CON DNI N°{empresa.representanteDni}; SEGÚN PODERES Y NOMBRAMIENTOS INSCRITOS EN LA PARTIDA REGISTRAL N°{empresa.partidaJuridica} DEL REGISTRO DE PERSONAS JURÍDICAS DE LA {empresa.oficinaRegistral}.

<b>COMO EL COMPRADOR:</b> {comprador.nombre}, IDENTIFICADO CON DNI N°{comprador.dni}, CON DOMICILIO {comprador.domicilio}, CON TELÉFONO +51 {comprador.telefono} CON CORREO ELECTRÓNICO {comprador.email} Y CONDICIONES SIGUIENTES:

## ANTECEDENTES

<b>PRIMERA. —</b> EL VENDEDOR MANIFIESTA Y ACREDITA QUE OSTENTA LA TITULARIDAD SOBRE EL PREDIO URBANO, UBICADO EN VALLE CHICAMA PREDIO MOCAN SECTOR LA ARENITA U.C. 1900, DISTRITO {inmueble.distrito}, PROVINCIA {inmueble.provincia}, DEPARTAMENTO {inmueble.departamento}, EL MISMO QUE OBRA REGISTRADO EN LA PARTIDA ELECTRÓNICA {inmueble.partida}, DEL REGISTRO DE PREDIOS DE LA SUNARP - SEDE TRUJILLO – OFICINA REGISTRAL TRUJILLO.

<b>SEGUNDA. —</b> SOBRE EL BIEN REFERIDO EN LA CLÁUSULA ANTERIOR, EL VENDEDOR VIENE DESARROLLANDO EL PROYECTO INMOBILIARIO DENOMINADO "{inmueble.proyecto}", DONDE SE OBTENDRÁ LOTES DE TERRENO DEBIDAMENTE INDEPENDIZADOS; EN ADELANTE EL PROYECTO.

<b>TERCERA. —</b> EL COMPRADOR HA TENIDO POR BIEN, ELEGIR EL {inmueble.tipoInmueble} "{inmueble.unidad}" DE LA MANZANA "{inmueble.manzana}", DETALLADO CON UN ÁREA TOTAL DE {inmueble.area} M² DENTRO DE LOS PLANOS DE EL PROYECTO. ASIMISMO, EL COMPRADOR DECLARA SABER Y ACEPTAR QUE LA EXTENSIÓN SUPERFICIAL Y MEDIDAS PERIMÉTRICAS DE LAS ÁREAS COMUNES QUE PERTENECEN AL CONDOMINIO ESTÁN SUPEDITADAS A LOS REAJUSTES DEFINITIVOS QUE CONSTEN EN EL PLANO DE REPLANTEO, RESULTANTE LUEGO DE LA RECEPCIÓN DE LAS OBRAS DEL PROYECTO. ADEMÁS, RECONOCE QUE ES FACULTAD DE EL VENDEDOR REALIZAR CUALQUIER TIPO DE MODIFICACIÓN AL PROYECTO CON RESPECTO A LAS ÁREAS COMUNES, CON UNA FINALIDAD DE MEJORA, SIN LIMITACIÓN DE NINGUNA ESPECIE Y SIN NECESIDAD DE CONSULTA PREVIA AL COMPRADOR.

<b>CUARTA. —</b> EL VENDEDOR SE COMPROMETE Y RESPONSABILIZA SOBRE EL DESARROLLO DEL PROYECTO "{inmueble.proyecto}" EN CADA UNA DE SUS ETAPAS, CONTANDO CON LA ENTREGA FINAL DEL PROYECTO CON LAS SIGUIENTES CARACTERÍSTICAS:
A. ENTREGA DEL LOTE DE TERRENO CON TÍTULO INDEPENDIZADO (PREDIO URBANO).
B. PÓRTICO DE INGRESO, CERCO PERIMÉTRICO, VÍAS AFIRMADAS, CANCHA DE FÚTBOL, PARQUES RECREATIVOS, PISCINA, ZONA DE FOGATA, JUEGOS PARA NIÑOS Y GIMNASIO AL AIRE LIBRE.
C. PUNTO DE AGUA EN CADA LOTE, AGUA QUE SERÁ CAPTADA DE UN POZO TUBULAR DE 25 MTS DE PROFUNDIDAD Y ALMACENADA EN UN RESERVORIO ELEVADO PARA SER DISTRIBUIDO A TRAVÉS DE TUBERÍAS MATRICES Y DOMICILIARIAS.
D. ALUMBRADO PÚBLICO POR MEDIO DE PANELES SOLARES Y CERTIFICADO DE FACTIBILIDAD ELÉCTRICA PARA LA MATRIZ DE LUZ EN EL PÓRTICO DE INGRESO.

## PRECIO Y FORMA DE PAGO

<b>QUINTA. —</b> POR MEDIO DEL PRESENTE CONTRATO, EL VENDEDOR TRANSFIERE A FAVOR DEL COMPRADOR EL LOTE DESCRITO EN LA CLÁUSULA TERCERA DE ESTE PRESENTE DOCUMENTO POR EL PRECIO DE VENTA PACTADO, DE MUTUO Y COMÚN ACUERDO DE <b>S/ {precio}</b> ({precioLetras}). LOS CUALES SERÁN CANCELADOS, CONFORME AL SIGUIENTE DETALLE:

> UNA CANTIDAD DE <b>S/{inicial}</b> ({inicialLetras}) POR CONCEPTO DE INICIAL REALIZADO MEDIANTE EL DEPÓSITO A LA CUENTA CORRIENTE DEL BANCO {banco} N.º {cuenta} A NOMBRE DE {empresa.razonSocial}{operacionFrase}.

Y EL MONTO RESTANTE DE <b>S/{saldo}</b> ({saldoLetras}), EL COMPRADOR DECLARA Y ESTABLECE QUE SERÁ CANCELADO TENIENDO COMO FECHA DE PAGO CONSIDERANDO EL SIGUIENTE CRONOGRAMA:

[CRONOGRAMA]

> EN LA SITUACIÓN DESAFORTUNADA QUE EL COMPRADOR NO PUEDA REALIZAR EL PAGO EN LAS FECHAS ANTES MENCIONADAS, SE LE BRINDARÁ UN PLAZO DE 5 DÍAS HÁBILES PARA QUE REGULARICE EL PAGO SOBRE LA CUOTA ESTABLECIDA. DESPUÉS DEL PLAZO MENCIONADO TENDRÁ UN INTERÉS POR DÍA DE {penalidad} SOLES Y DE NO PONERSE AL DÍA EN 3 MESES CONSECUTIVOS, EL VENDEDOR PODRÁ DAR POR RESUELTO EL CONTRATO DE PLENO DERECHO, BASTANDO PARA TAL EFECTO LA COMUNICACIÓN DIRIGIDA AL COMPRADOR POR CONDUCTO NOTARIAL, DE ACUERDO A LO ESTABLECIDO POR EL ARTÍCULO 1430° DEL CÓDIGO CIVIL. SI EL VENDEDOR OPTASE POR LA RESOLUCIÓN AUTOMÁTICA DEL CONTRATO, ÉSTA PODRÁ RETENER PARA SÍ EL EQUIVALENTE AL {lucroCesante}% DEL PRECIO DE VENTA POR CONCEPTO DE LUCRO CESANTE, DEVOLVIENDO AL COMPRADOR EL REMANENTE DE LA SUMA QUE HUBIERA PAGADO HASTA LA FECHA, PREVIA DEDUCCIÓN DE LOS GASTOS ADMINISTRATIVOS Y COMISIONES ORIGINADOS POR LA VENTA.

> POR CADA PAGO MENSUAL CORRESPONDIENTE A LAS CUOTAS PACTADAS EN EL PRESENTE CONTRATO, SE LE ENVIARÁ AL COMPRADOR LA BOLETA DE SU PAGO RESPECTIVO, A TRAVÉS DEL MEDIO PREVIAMENTE ACORDADO ENTRE LAS PARTES.

LUEGO DE LA FIRMA DEL PRESENTE CONTRATO, EL ASESOR DESIGNADO POR LA PARTE VENDEDORA ESTARÁ A CARGO DE REALIZAR LA GESTIÓN DE POST VENTA, DEBIENDO INFORMAR AL COMPRADOR DE MANERA PERIÓDICA Y OPORTUNA SOBRE TODOS LOS AVANCES DE LA OBRA, HASTA LA FINALIZACIÓN DEL PROYECTO.

<b>SEXTA. —</b> EN CASO QUE EL BIEN SE ENCUENTRE DENTRO DE UN RÉGIMEN DE UNIDADES INMOBILIARIAS DE PROPIEDAD EXCLUSIVA Y PROPIEDAD COMÚN, LA VENTA COMPRENDE EL ÁREA SEÑALADA COMO PROPIEDAD EXCLUSIVA Y EL PORCENTAJE DE PARTICIPACIÓN QUE LE CORRESPONDE SOBRE LAS ÁREAS Y BIENES COMUNES SEGÚN SE ESTIPULA EN EL REGLAMENTO INTERNO. ADEMÁS, LA VENTA DEL BIEN SE EFECTÚA EN AD CORPUS Y COMPRENDE LA FÁBRICA CORRESPONDIENTE, SUS ÁREAS, AIRES, USOS, COSTUMBRES, SERVIDUMBRES, ENTRADAS, SALIDAS Y EN GENERAL, TODO AQUELLO QUE DE HECHO O POR DERECHO PUDIERE CORRESPONDER AL BIEN ENAJENADO, SIN RESERVA NI LIMITACIÓN ALGUNA.

<b>SÉPTIMA. —</b> LAS PARTES CONTRATANTES CONVIENEN EXPRESAMENTE QUE LA COMPRAVENTA MATERIA DEL PRESENTE, SE EFECTÚA DENTRO DE LOS ALCANCES DEL ARTÍCULO 1583° DEL CÓDIGO CIVIL. POR LO QUE, EL COMPRADOR ADQUIERE EL DERECHO DE PROPIEDAD DEL INMUEBLE SÓLO CUANDO HAYA PAGADO EL ÍNTEGRO DEL PRECIO PACTADO O EN EL MOMENTO EN EL CUAL EL VENDEDOR RENUNCIE POR ESCRITO Y EXPRESAMENTE AL PACTO DE RESERVA DE DOMINIO, LO QUE OCURRA PRIMERO.

<b>OCTAVA. —</b> EL COMPRADOR, EN TANTO EXISTA LA RESERVA DE DOMINIO ANTES DETALLADA, NO PODRÁ TRANSFERIR ESTE CONTRATO Y POR LO TANTO DISPONER O GRAVAR DERECHOS SOBRE EL INMUEBLE DESCRITO EN LA CLÁUSULA TERCERA, SIN AUTORIZACIÓN ESCRITA DE EL VENDEDOR.

<b>NOVENA. —</b> EL VENDEDOR DECLARA QUE, SOBRE EL INMUEBLE QUE SE ENAJENA, NO EXISTE MEDIDA JUDICIAL O EXTRAJUDICIAL ALGUNA QUE RESTRINJA O LIMITE SU LIBRE DISPOSICIÓN, OBLIGÁNDOSE NO OBSTANTE ESTA DECLARACIÓN AL SANEAMIENTO POR EVICCIÓN DE ACUERDO A LEY.

<b>DÉCIMA. —</b> QUEDA EXPRESAMENTE ENTENDIDO QUE ESTÁN EXCEPTUADAS DE ESTA VENTA LAS OBRAS PERTINENTES DE ELECTRIFICACIÓN, AGUA POTABLE Y ALCANTARILLADO, PISTAS Y VEREDAS POR LO QUE ESTÁN EXCLUIDAS DE ESTE CONTRATO. EN TAL SENTIDO EL COMPRADOR DEJA EXPRESA CONSTANCIA QUE NO LE CORRESPONDE NADA POR DICHOS CONCEPTOS, SIENDO CUALQUIER REEMBOLSO POR DICHOS CONCEPTOS DE PROPIEDAD EXCLUSIVA DE EL VENDEDOR. TAMBIÉN, EL COMPRADOR DECLARA CONOCER QUE EL VENDEDOR NO ESTÁ OBLIGADO A EJECUTAR LAS OBRAS DE REDES TELEFÓNICAS NI INTERNET.

<b>DÉCIMO PRIMERA. —</b> EL VENDEDOR ENTREGARÁ EL INMUEBLE MATERIA DE VENTA EN LA FECHA {plazoEntrega}, MÁXIMO PARA EL DESARROLLO DEL PROYECTO. ESTE PLAZO ES EL PRIMIGENIAMENTE ESTIPULADO, EL MISMO QUE PODRÁ VARIAR SI OCURRIESE SITUACIONES DE CASO FORTUITO O FUERZA MAYOR, LO QUE SE LE COMUNICARÁ OPORTUNAMENTE AL COMPRADOR.

<b>DÉCIMO SEGUNDA. —</b> EL PRESENTE CONTRATO QUEDA SUJETO A LA CONDICIÓN SUSPENSIVA DE QUE EL BIEN LLEGUE A TENER EXISTENCIA, EN APLICACIÓN DEL ARTÍCULO 1534 DEL CÓDIGO CIVIL. LAS PARTES ACUERDAN QUE LA CONDICIÓN SE ENTENDERÁ CUMPLIDA CUANDO SE ENCUENTRE INSCRITA LA DECLARATORIA DE FÁBRICA, LA INDEPENDIZACIÓN Y EL REGLAMENTO INTERNO, LO QUE OCURRA PRIMERO RESPECTO DEL BIEN OBJETO DE VENTA, EN EL REGISTRO CORRESPONDIENTE, FECHA EN LA CUAL EL PRESENTE CONTRATO SURTIRÁ PLENOS EFECTOS.

<b>DÉCIMO TERCERA. —</b> EN CASO DE INCUMPLIMIENTO DE CONTRATO POR PARTE DE EL VENDEDOR EN LA ENTREGA DEL PROYECTO TERMINADO Y DENTRO DEL PLAZO CORRESPONDIENTE, EL COMPRADOR PODRÁ A SU ELECCIÓN, EJERCER CUALESQUIERA DE LOS SIGUIENTES DERECHOS DE MANERA ALTERNATIVA:
A. RESOLVER EL CONTRATO CONFORME A LEY. EL VENDEDOR DEBERÁ DEVOLVER EN UN PLAZO NO MAYOR DE 30 DÍAS ÚTILES DE CURSADA LA COMUNICACIÓN DE FECHA CIERTA QUE DA POR RESUELTO EL CONTRATO, EL PRECIO QUE EL COMPRADOR HUBIERA PAGADO HASTA ESA FECHA.
B. EXIGIR A EL VENDEDOR LA ENTREGA DEL INMUEBLE, DE ACUERDO A LAS CONDICIONES PACTADAS.

<b>DÉCIMO CUARTA. —</b> A EFECTOS DE LA RELACIÓN INTERNA ENTRE CONTRATANTES, SON DE CARGO DE EL VENDEDOR LOS TRIBUTOS QUE SE HUBIERAN DEVENGADO Y ACOTADO HASTA LA FECHA DE LA ENTREGA FÍSICA DEL LOTE AL COMPRADOR, SIENDO DE CUENTA Y CARGO DEL COMPRADOR TODOS LOS TRIBUTOS QUE SE DEVENGUEN DESDE ESTA FECHA EN ADELANTE.

<b>DÉCIMO QUINTA. —</b> CORRESPONDE AL COMPRADOR EL PAGO DEL IMPUESTO DE ALCABALA SI ÉSTE FUERE APLICABLE A LA PRESENTE TRANSFERENCIA SEGÚN LO PREVISTO POR EL D. LEG. 776 Y SUS NORMAS MODIFICATORIAS. ADEMÁS DE LOS TRIBUTOS Y GASTOS POSTERIORES QUE ORIGINE EL PRESENTE CONTRATO COMO LA MINUTA Y ESCRITURA PÚBLICA.

<b>DÉCIMO SEXTA. —</b> AMBAS PARTES RENUNCIAN AL FUERO DE SUS DOMICILIOS Y SE SOMETEN EXPRESAMENTE A LA JURISDICCIÓN DE LOS JUECES Y TRIBUNALES DE TRUJILLO PARA TODO LO QUE SE RELACIONE CON LA INTERPRETACIÓN, CUMPLIMIENTO, EJECUCIÓN U CUALQUIER DIVERGENCIA O CONFLICTO DERIVADOS DEL PRESENTE CONTRATO.

{lugar}, {fechaLarga}

[FIRMA]`;

const TXT_SEPARACION = `Por el presente documento, se deja constancia de la <b>separación</b> del inmueble que se detalla, manifestada de manera libre y voluntaria por el comprador.

## DATOS DEL COMPRADOR

Nombre completo: <b>{comprador.nombre}</b>
DNI: <b>{comprador.dni}</b>
Domicilio: {comprador.domicilio}
Teléfono: +51 {comprador.telefono}
Correo: {comprador.email}

## INMUEBLE SEPARADO

Proyecto: <b>{inmueble.proyecto}</b>
Unidad: <b>{inmueble.tipoInmueble} {inmueble.unidad} · Manzana {inmueble.manzana}</b>
Área: {inmueble.area} m²
Partida registral: {inmueble.partida}

## CONDICIONES DE LA SEPARACIÓN

PRIMERA. — El comprador entrega en este acto la suma de <b>S/{inicial}</b> ({inicialLetras}) por concepto de separación, mediante depósito a la cuenta {banco} N.º {cuenta} a nombre de {empresa.razonSocial}.

SEGUNDA. — El precio total pactado para el inmueble es de <b>S/{precio}</b> ({precioLetras}), del cual queda un saldo de <b>S/{saldo}</b> a ser regularizado en el correspondiente Contrato de Compraventa.

TERCERA. — La presente separación tiene una vigencia de <b>treinta (30) días calendario</b> contados desde la fecha de firma, dentro de los cuales las partes suscribirán el Contrato de Compraventa de Bien Futuro.

CUARTA. — En caso el comprador desista dentro del plazo, el monto entregado quedará en favor del vendedor en calidad de penalidad por gastos administrativos.

{lugar}, {fechaLarga}

[FIRMA]`;

const TXT_ACTA_SEPARACION = `EN LA CIUDAD DE {lugar}, A LOS {fechaLarga}, LAS PARTES ABAJO IDENTIFICADAS CELEBRAN EL PRESENTE ACUERDO DE RESERVA DE INMUEBLE.

<b>EL VENDEDOR:</b> {empresa.razonSocial}, R.U.C. {empresa.ruc}, debidamente representada por {empresa.representante}, identificado con DNI N°{empresa.representanteDni}.

<b>EL COMPRADOR:</b> {comprador.nombre}, DNI N°{comprador.dni}, con domicilio en {comprador.domicilio}.

## CLÁUSULAS

<b>PRIMERA. —</b> El comprador ha tenido por bien reservar el {inmueble.tipoInmueble} {inmueble.unidad} de la Manzana {inmueble.manzana}, ubicado en el proyecto "{inmueble.proyecto}", con un área total de {inmueble.area} m².

<b>SEGUNDA. —</b> El comprador entrega en este acto la suma de <b>S/{inicial}</b> ({inicialLetras}) en calidad de <b>arras de retracto</b>, por concepto de separación del inmueble descrito en la cláusula anterior.

<b>TERCERA. —</b> El presente acuerdo tiene una vigencia de <b>treinta (30) días calendario</b>, plazo dentro del cual las partes suscribirán el correspondiente Contrato de Compraventa de Bien Futuro.

<b>CUARTA. —</b> En caso el comprador desista de la operación dentro del plazo señalado, perderá las arras entregadas a favor del vendedor en calidad de penalidad. Si fuera el vendedor quien desista, deberá devolver el doble de las arras recibidas.

<b>QUINTA. —</b> Cualquier controversia derivada del presente acuerdo será sometida a la jurisdicción de los jueces y tribunales de Trujillo, renunciando las partes a cualquier otro fuero.

{lugar}, {fechaLarga}

[FIRMA]`;

const TXT_TRATAMIENTO_DATOS = `## ACEPTACIÓN DE TRATAMIENTO DE DATOS PERSONALES

Yo, <b>{comprador.nombre}</b>, identificado(a) con D.N.I. N° <b>{comprador.dni}</b>, con domicilio en {comprador.domicilio}, en cumplimiento de la Ley N° 29733 — Ley de Protección de Datos Personales — y su Reglamento aprobado por D.S. N° 003-2013-JUS:

<b>DECLARO</b> haber sido informado(a) de manera previa, expresa, inequívoca, libre y gratuita por parte de {empresa.razonSocial}, con R.U.C. {empresa.ruc} (en adelante, EL TITULAR DEL BANCO DE DATOS), respecto al tratamiento de mis datos personales, conforme al siguiente detalle:

## 1. FINALIDADES DEL TRATAMIENTO
A. Gestionar la relación contractual derivada de la compraventa del inmueble.
B. Atender consultas, reclamos y solicitudes vinculadas al servicio.
C. Remitir información comercial, promocional y publicitaria del proyecto y futuros desarrollos.
D. Cumplir con las obligaciones legales, tributarias y regulatorias aplicables.
E. Realizar gestiones de cobranza y, de corresponder, ceder esta información a empresas de gestión de cobros.

## 2. DATOS TRATADOS
Nombres y apellidos, DNI, dirección domiciliaria, número telefónico, correo electrónico, estado civil, ocupación y datos de pago.

## 3. CONSERVACIÓN Y SEGURIDAD
Los datos serán almacenados en el banco de datos del titular durante el plazo necesario para cumplir las finalidades antes señaladas y por los plazos legales aplicables, adoptando las medidas técnicas y organizativas de seguridad razonables.

## 4. DERECHOS ARCO
Puedo ejercer en cualquier momento mis derechos de acceso, rectificación, cancelación y oposición ante el titular, escribiendo a su correo institucional o a su domicilio fiscal indicado en el contrato.

## 5. CONSENTIMIENTO

En señal de conformidad, <b>OTORGO MI CONSENTIMIENTO LIBRE, PREVIO, EXPRESO E INEQUÍVOCO</b> para el tratamiento de mis datos personales para todas las finalidades arriba indicadas.

{lugar}, {fechaLarga}

[FIRMA-COMPRADOR]`;

const TXT_DDJJ_DOMICILIO = `## DECLARACIÓN JURADA DE DOMICILIO Y ESTADO CIVIL

Yo, <b>{comprador.nombre}</b>, identificado(a) con Documento Nacional de Identidad N° <b>{comprador.dni}</b>, en pleno uso de mis facultades y bajo juramento, en cumplimiento de lo dispuesto por la Ley N° 27444 — Ley del Procedimiento Administrativo General — y el Artículo 41° del D.S. N° 004-2019-JUS,

## DECLARO BAJO JURAMENTO

<b>PRIMERO. —</b> Que mi domicilio real, actual y permanente — el mismo que señalo para todos los efectos legales derivados del Contrato de Compraventa que celebro con {empresa.razonSocial} — se encuentra ubicado en:

> {comprador.domicilio}

<b>SEGUNDO. —</b> Que mi estado civil actual es de <b>{comprador.estadoCivil}</b>, situación que declaro bajo juramento es la vigente a la fecha de suscripción del presente documento.

<b>TERCERO. —</b> Que los datos personales declarados — nombres, apellidos, DNI, domicilio y estado civil — son correctos, completos y verdaderos, y autorizo a {empresa.razonSocial} a verificarlos por los medios que considere pertinentes.

<b>CUARTO. —</b> Que conozco la responsabilidad penal a la que estoy sujeto(a) en caso la presente declaración resultara falsa, conforme al Artículo 411° del Código Penal — delito de falsa declaración en procedimiento administrativo — y demás normas concordantes.

<b>QUINTO. —</b> Que cualquier variación en mi domicilio o estado civil será comunicada por escrito a {empresa.razonSocial} dentro de los quince (15) días siguientes de producido el cambio, por conducto notarial de ser necesario.

Firmo la presente declaración para los fines que considere conveniente la parte interesada, en señal de plena conformidad con lo declarado.

{lugar}, {fechaLarga}

[FIRMA-COMPRADOR]`;

const TXT_CRONOGRAMA = `## ANEXO · CRONOGRAMA DE PAGOS

El presente cronograma forma parte integrante del Contrato de Compraventa de Bien Futuro celebrado entre {empresa.razonSocial} y el comprador, respecto del inmueble a continuación detallado.

## DATOS DE LA OPERACIÓN

Comprador: <b>{comprador.nombre}</b> · DNI <b>{comprador.dni}</b>
Inmueble: <b>{inmueble.tipoInmueble} {inmueble.unidad} — Manzana {inmueble.manzana}</b>
Proyecto: <b>{inmueble.proyecto}</b>
Área: {inmueble.area} m² · Partida registral: {inmueble.partida}

Precio total: <b>S/ {precio}</b> ({precioLetras})
Cuota inicial: <b>S/ {inicial}</b> ({inicialLetras})
Saldo a financiar: <b>S/ {saldo}</b> ({saldoLetras})

## DETALLE DE CUOTAS

[CRONOGRAMA]

## CONDICIONES DE PAGO

> Los pagos se realizan mediante depósito en la cuenta corriente del {banco} N.º {cuenta} a nombre de {empresa.razonSocial}. El comprador deberá conservar el voucher de cada depósito y remitirlo al asesor responsable como sustento del pago.

> Tras 5 días hábiles de retraso sobre cualquier cuota, se devengará un interés moratorio de <b>S/ {penalidad}</b> por día calendario. La falta de pago durante 3 meses consecutivos faculta al vendedor a resolver el contrato de pleno derecho, conforme al Art. 1430° del Código Civil.

> Cualquier reprogramación de cuotas deberá ser solicitada por escrito y aprobada de común acuerdo, conservando esta adenda su vigencia hasta la cancelación total del saldo.

{lugar}, {fechaLarga}

[FIRMA]`;

const DEFAULT_TEMPLATES = {
  separacion: {
    titulo: 'FICHA DE SEPARACIÓN DE INMUEBLE',
    subtitulo: 'Proyecto "{inmueble.proyecto}"',
    texto: TXT_SEPARACION,
  },
  compraventa: {
    titulo: 'CONTRATO DE COMPRAVENTA DE BIEN FUTURO',
    subtitulo: 'Proyecto "{inmueble.proyecto}"',
    texto: TXT_COMPRAVENTA,
  },
  cronograma: {
    titulo: 'CRONOGRAMA DE PAGOS',
    subtitulo: 'Anexo del Contrato · Proyecto "{inmueble.proyecto}"',
    texto: TXT_CRONOGRAMA,
  },
  actaSeparacion: {
    titulo: 'ACTA DE SEPARACIÓN DE INMUEBLE',
    subtitulo: 'Proyecto "{inmueble.proyecto}"',
    texto: TXT_ACTA_SEPARACION,
  },
  tratamientoDatos: {
    titulo: 'ACEPTACIÓN DE TRATAMIENTO DE DATOS PERSONALES',
    subtitulo: 'Ley N° 29733 — Protección de Datos Personales',
    texto: TXT_TRATAMIENTO_DATOS,
  },
  ddjjDomicilio: {
    titulo: 'DECLARACIÓN JURADA DE DOMICILIO Y ESTADO CIVIL',
    subtitulo: 'Art. 41° D.S. N° 004-2019-JUS · Ley N° 27444',
    texto: TXT_DDJJ_DOMICILIO,
  },
};

const DEFAULT_TEMPLATE_PACK = {
  nombre: 'Paquete Estándar de Venta',
  version: '5.0',
  documentos: DEFAULT_TEMPLATES,
};

// ─── Storage ──────────────────────────────────────────────────
const loadTemplate = () => {
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migración desde v1 (bloques) si la encontramos
      if (parsed.bloques && !parsed.documentos) {
        return DEFAULT_TEMPLATE_PACK;
      }
      // Asegurar que todos los documentos estén presentes
      const documentos = { ...DEFAULT_TEMPLATES, ...(parsed.documentos || {}) };
      return { ...DEFAULT_TEMPLATE_PACK, ...parsed, documentos };
    }
  } catch (e) {}
  return DEFAULT_TEMPLATE_PACK;
};
const saveTemplate = (tpl) => localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(tpl));
const resetTemplate = () => localStorage.removeItem(TEMPLATE_STORAGE_KEY);

// ═══════════════════════════════════════════════════════════════
// VARIABLES — contexto de sustitución
// ═══════════════════════════════════════════════════════════════
const buildVars = (data) => {
  const { compradorA, inmueble, terminos, meta } = data;
  const saldo = terminos.precio - terminos.inicial;
  return {
    empresa: {
      razonSocial: EMPRESA.razonSocial,
      ruc: EMPRESA.ruc,
      domicilio: EMPRESA.domicilio,
      representante: EMPRESA.representante,
      representanteDni: EMPRESA.representanteDni,
      partidaJuridica: EMPRESA.partidaJuridica,
      oficinaRegistral: EMPRESA.oficinaRegistral,
    },
    comprador: {
      nombre: `${compradorA.nombres} ${compradorA.apellidos}`.toUpperCase(),
      dni: compradorA.dni,
      domicilio: compradorA.domicilio || '',
      telefono: compradorA.telefono || '',
      email: compradorA.email || '',
      estadoCivil: compradorA.estadoCivil || '',
      ocupacion: compradorA.ocupacion || '',
    },
    inmueble: {
      proyecto: inmueble.proyecto || '',
      tipoInmueble: (inmueble.tipoInmueble || 'Lote'),
      unidad: inmueble.unidad,
      manzana: inmueble.manzana,
      area: inmueble.area,
      partida: inmueble.partida,
      distrito: inmueble.distrito || '',
      provincia: inmueble.provincia || '',
      departamento: inmueble.departamento || '',
    },
    precio: fmtSoles(terminos.precio),
    precioLetras: numeroALetras(terminos.precio),
    inicial: fmtSoles(terminos.inicial),
    inicialLetras: numeroALetras(terminos.inicial),
    saldo: fmtSoles(saldo),
    saldoLetras: numeroALetras(saldo),
    banco: terminos.bancoNombre,
    cuenta: terminos.bancoCuenta,
    operacion: terminos.numOperacion || '',
    operacionFrase: terminos.numOperacion ? ` CON NÚMERO DE OPERACIÓN ${terminos.numOperacion}` : '',
    penalidad: terminos.penalidadDiaria,
    lucroCesante: terminos.porcLucroCesante,
    plazoEntrega: terminos.plazoEntrega,
    fechaLarga: fmtDateLong(meta.fechaContrato),
    lugar: meta.lugarFirma || 'Trujillo',
  };
};

// ─── Sustituir {variable} en texto plano ─────────────────────
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const renderTextHtml = (text, vars) => {
  if (!text) return '';
  // Preserve our allowed inline HTML tags (b, br, i, u) — escape everything else
  // But since the user types these intentionally, we'll just substitute vars.
  return text.replace(/\{([\w.]+)\}/g, (_, path) => {
    let v = path.split('.').reduce((o, k) => o == null ? '' : o[k], vars);
    if (v === undefined || v === null || v === '') return '<span class="fill empty">—</span>';
    return `<span class="fill">${escapeHtml(v)}</span>`;
  });
};

// ═══════════════════════════════════════════════════════════════
// PARSER — convierte texto plano del editor a bloques
// ═══════════════════════════════════════════════════════════════
function parseDocumentText(text) {
  const blocks = [];
  if (!text) return blocks;

  // Paragraphs separated by 1+ blank line
  const paras = text.split(/\n\s*\n/);

  for (const raw of paras) {
    const para = raw.trim();
    if (!para) continue;

    // Special tokens
    if (/^\[CRONOGRAMA\]$/i.test(para))       { blocks.push({ tipo:'cronograma' }); continue; }
    if (/^\[FIRMA\]$/i.test(para))            { blocks.push({ tipo:'firma' }); continue; }
    if (/^\[FIRMA-COMPRADOR\]$/i.test(para))  { blocks.push({ tipo:'firma', soloComprador:true }); continue; }

    // Heading: ## TITLE
    const h = para.match(/^##\s+(.+)$/m);
    if (h && para.split('\n').length === 1) {
      blocks.push({ tipo:'heading', text: h[1].trim() });
      continue;
    }

    // List: every line starts with - * • or A./1./a.
    const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
    const isList = lines.length > 1 && lines.every(l => /^([A-Za-z0-9]{1,3}[.\)]|\-|\*|•)\s/.test(l));
    if (isList) {
      const tipoLista = /^[A-Z][.\)]/.test(lines[0]) ? 'A'
                      : /^[a-z][.\)]/.test(lines[0]) ? 'a'
                      : /^[0-9]/.test(lines[0])       ? '1'
                      : 'A';
      const items = lines.map(l => l.replace(/^([A-Za-z0-9]{1,3}[.\)]|\-|\*|•)\s+/, ''));
      blocks.push({ tipo:'lista', tipoLista, items });
      continue;
    }

    // Indented paragraph: lines beginning with >
    if (lines.every(l => l.startsWith('>'))) {
      blocks.push({
        tipo:'p',
        indent: true,
        text: lines.map(l => l.replace(/^>\s?/, '')).join(' '),
      });
      continue;
    }

    // Multi-line paragraph: join with <br/>
    blocks.push({
      tipo:'p',
      text: lines.join(' ').replace(/\s+/g, ' '),
    });
  }
  return blocks;
}

// ═══════════════════════════════════════════════════════════════
// VARIABLES DISPONIBLES — para el panel del editor
// ═══════════════════════════════════════════════════════════════
const TEMPLATE_VARS_GROUPS = [
  { label: 'Comprador', vars: [
    ['{comprador.nombre}',      'Nombre completo'],
    ['{comprador.dni}',         'DNI'],
    ['{comprador.domicilio}',   'Domicilio'],
    ['{comprador.estadoCivil}', 'Estado civil'],
    ['{comprador.ocupacion}',   'Ocupación'],
    ['{comprador.telefono}',    'Teléfono'],
    ['{comprador.email}',       'Correo'],
  ]},
  { label: 'Inmueble', vars: [
    ['{inmueble.proyecto}',     'Proyecto'],
    ['{inmueble.tipoInmueble}', 'Lote / Casa / Dpto.'],
    ['{inmueble.unidad}',       'N° de unidad'],
    ['{inmueble.manzana}',      'Manzana'],
    ['{inmueble.area}',         'Área m²'],
    ['{inmueble.partida}',      'Partida'],
    ['{inmueble.distrito}',     'Distrito'],
    ['{inmueble.provincia}',    'Provincia'],
    ['{inmueble.departamento}', 'Departamento'],
  ]},
  { label: 'Precio y pago', vars: [
    ['{precio}',        'Precio total'],
    ['{precioLetras}',  'Precio en letras'],
    ['{inicial}',       'Cuota inicial'],
    ['{inicialLetras}', 'Inicial en letras'],
    ['{saldo}',         'Saldo'],
    ['{saldoLetras}',   'Saldo en letras'],
    ['{banco}',         'Banco'],
    ['{cuenta}',        'N° cuenta'],
    ['{operacion}',     'N° operación'],
    ['{penalidad}',     'Penalidad diaria'],
    ['{lucroCesante}',  '% lucro cesante'],
    ['{plazoEntrega}',  'Plazo entrega'],
  ]},
  { label: 'Empresa', vars: [
    ['{empresa.razonSocial}',      'Razón social'],
    ['{empresa.ruc}',              'RUC'],
    ['{empresa.domicilio}',        'Domicilio fiscal'],
    ['{empresa.representante}',    'Representante'],
    ['{empresa.representanteDni}', 'DNI representante'],
    ['{empresa.partidaJuridica}',  'Partida (P.J.)'],
    ['{empresa.oficinaRegistral}', 'Oficina registral'],
  ]},
  { label: 'Otros', vars: [
    ['{lugar}',      'Lugar de firma'],
    ['{fechaLarga}', 'Fecha del contrato'],
  ]},
];

Object.assign(window, {
  DOC_TYPES, DEFAULT_TEMPLATE_PACK, TEMPLATE_VARS_GROUPS,
  loadTemplate, saveTemplate, resetTemplate,
  buildVars, renderTextHtml, parseDocumentText, escapeHtml,
});

// ═══════════════════════════════════════════════════════════════
// EDITOR — pantalla "Plantilla"
// ═══════════════════════════════════════════════════════════════

const ScreenTemplateEditor = ({ onToast, isAdmin }) => {
  const [tpl, setTpl] = React.useState(() => loadTemplate());
  const [dirty, setDirty] = React.useState(false);
  const [docId, setDocId] = React.useState('compraventa');
  const [preview, setPreview] = React.useState(true);
  const textareaRef = React.useRef(null);

  // Datos de ejemplo para vista previa
  const sampleVars = React.useMemo(() => buildVars({
    compradorA: { nombres: 'Rosmery Rocío', apellidos: 'Valderrama Trujillo', dni: '46049117',
                  telefono:'923 585 590', email:'rosmery@correo.pe',
                  domicilio:'Jr. Indico 432, La Esperanza, Trujillo, La Libertad' },
    inmueble: { proyecto:'Nápoles Condominio Club', tipoInmueble:'Lote', unidad:'7', manzana:'C',
                area:'140', partida:'11550511', distrito:'Razuri', provincia:'Ascope', departamento:'La Libertad' },
    terminos: { precio:17100, inicial:3500, bancoNombre:'BCP', bancoCuenta:'570-7307941059',
                numOperacion:'', penalidadDiaria:30, porcLucroCesante:30, plazoEntrega:'12.2027' },
    meta: { fechaContrato: new Date().toISOString().slice(0,10), lugarFirma:'Trujillo' },
  }), []);

  const doc = tpl.documentos[docId] || DEFAULT_TEMPLATES[docId];
  const docMeta = DOC_TYPES.find(d => d.id === docId);

  const updDoc = (patch) => {
    const documentos = { ...tpl.documentos, [docId]: { ...doc, ...patch } };
    setTpl({ ...tpl, documentos });
    setDirty(true);
  };

  const insertVar = (v) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const cur = doc.texto;
    const next = cur.slice(0, start) + v + cur.slice(end);
    updDoc({ texto: next });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + v.length, start + v.length);
    });
  };

  const insertToken = (token) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const cur = doc.texto;
    const inject = `\n\n${token}\n\n`;
    const next = cur.slice(0, start) + inject + cur.slice(start);
    updDoc({ texto: next });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + inject.length, start + inject.length);
    });
  };

  const save = () => { saveTemplate(tpl); setDirty(false); onToast('Plantilla guardada'); };
  const resetActual = () => {
    if (!confirm(`¿Restaurar el documento "${docMeta.label}" a su versión original?`)) return;
    const documentos = { ...tpl.documentos, [docId]: { ...DEFAULT_TEMPLATES[docId] } };
    setTpl({ ...tpl, documentos });
    setDirty(true);
  };
  const resetTodo = () => {
    if (!confirm('¿Restaurar TODAS las plantillas a su versión original? Se perderán todos los cambios.')) return;
    resetTemplate();
    setTpl(DEFAULT_TEMPLATE_PACK);
    setDirty(false);
    onToast('Plantillas restauradas');
  };

  if (!isAdmin) {
    return (
      <div className="page" data-screen-label="Plantilla">
        <div className="page-head"><div>
          <h1 className="page-title">Plantillas</h1>
          <div className="page-sub">Solo administradores pueden editar.</div>
        </div></div>
        <div className="empty">
          <Icon name="shield" size={28} style={{color:'var(--muted-2)', marginBottom:8}}/>
          <div>Necesitas permisos de administrador.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" data-screen-label="Plantilla" style={{maxWidth:1500}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Plantillas de documentos</h1>
          <div className="page-sub">
            <b>{tpl.nombre}</b> · v{tpl.version} · {DOC_TYPES.length} documentos por venta
            {dirty && <span className="pill warn" style={{marginLeft:10}}><span className="dot"/>Sin guardar</span>}
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn ghost" onClick={() => setPreview(!preview)}>
            <Icon name="eye" size={14}/> {preview ? 'Ocultar' : 'Ver'} previa
          </button>
          <button className="btn" onClick={resetTodo}>
            <Icon name="refresh" size={14}/> Restaurar todo
          </button>
          <button className="btn primary" onClick={save} disabled={!dirty}>
            <Icon name="check" size={14}/> Guardar
          </button>
        </div>
      </div>

      {/* Selector de documento — pills horizontales */}
      <div className="doc-picker">
        {DOC_TYPES.map((d, i) => (
          <button key={d.id} className={`doc-pill ${docId===d.id?'active':''}`} onClick={() => setDocId(d.id)}>
            <span className="seq">{String(i+1).padStart(2,'0')}</span>
            <span className="pill-body">
              <span className="pill-title">{d.label}</span>
              <span className="pill-tag">{d.tag}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Encabezado del documento */}
      <div className="card card-pad mb-12" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <div className="field">
          <label className="field-label">Título del documento</label>
          <input className="input" style={{fontFamily:'var(--font-doc)', fontWeight:500}}
                 value={doc.titulo} onChange={(e) => updDoc({ titulo: e.target.value })}/>
        </div>
        <div className="field">
          <label className="field-label">Subtítulo</label>
          <input className="input" style={{fontFamily:'var(--font-doc)'}}
                 value={doc.subtitulo || ''} onChange={(e) => updDoc({ subtitulo: e.target.value })}/>
        </div>
      </div>

      {/* Cuerpo del documento — UN SOLO BLOQUE */}
      <div style={{display:'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr 280px', gap:16, alignItems:'flex-start'}}>
        {/* Editor */}
        <div className="vstack gap-8">
          <div className="hstack between" style={{flexWrap:'wrap', gap:8}}>
            <div className="hstack gap-8 muted text-sm">
              <Icon name="edit" size={13}/>
              <span>Cuerpo del documento — edita libremente. Usa <code className="code-tag">{'{variable}'}</code> para datos del comprador.</span>
            </div>
            <div className="hstack gap-6">
              <button className="btn sm ghost" onClick={() => insertToken('[CRONOGRAMA]')} title="Insertar tabla del cronograma">
                <Icon name="calendar" size={11}/> Cronograma
              </button>
              <button className="btn sm ghost" onClick={() => insertToken('[FIRMA]')} title="Insertar bloque de firmas">
                <Icon name="signature" size={11}/> Firmas
              </button>
              <button className="btn sm" onClick={resetActual} title="Restaurar este documento">
                <Icon name="refresh" size={11}/> Restaurar
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="doc-editor"
            value={doc.texto}
            onChange={(e) => updDoc({ texto: e.target.value })}
            spellCheck="false"
          />

          <div className="legend">
            <div className="hstack gap-12" style={{flexWrap:'wrap'}}>
              <span><code className="code-tag">## Título</code> sección</span>
              <span><code className="code-tag">A. ítem</code> lista</span>
              <span><code className="code-tag">{'> texto'}</code> sangría</span>
              <span><code className="code-tag">{'<b>X</b>'}</code> negrita</span>
              <span><code className="code-tag">[CRONOGRAMA]</code> tabla</span>
              <span><code className="code-tag">[FIRMA]</code> firmas</span>
            </div>
          </div>
        </div>

        {/* Sidebar: variables o preview */}
        {preview ? (
          <div className="card" style={{position:'sticky', top:'calc(var(--topbar-h) + 24px)', maxHeight:'calc(100vh - 110px)', overflow:'auto'}}>
            <div className="card-head">
              <div className="card-title">Vista previa</div>
              <span className="muted text-xs">datos de ejemplo</span>
            </div>
            <div style={{padding:20, background:'#f4f5f7'}}>
              <DocPreview doc={doc} vars={sampleVars}/>
            </div>
          </div>
        ) : (
          <VariablesPanel onInsert={insertVar}/>
        )}
      </div>
    </div>
  );
};

// ─── Panel de variables (cuando se oculta la previa) ────────
const VariablesPanel = ({ onInsert }) => (
  <div className="card" style={{position:'sticky', top:'calc(var(--topbar-h) + 24px)'}}>
    <div className="card-head">
      <div className="card-title">Variables</div>
      <span className="muted text-xs">click para insertar</span>
    </div>
    <div style={{padding:'8px 14px 14px', maxHeight:'calc(100vh - 160px)', overflow:'auto'}}>
      {TEMPLATE_VARS_GROUPS.map(g => (
        <div key={g.label} style={{marginBottom:14}}>
          <div className="muted text-xs" style={{textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, margin:'10px 0 6px'}}>{g.label}</div>
          <div className="vstack" style={{gap:2}}>
            {g.vars.map(([v, d]) => (
              <button key={v} className="var-btn" onClick={() => onInsert(v)}>
                <code className="mono">{v}</code>
                <span className="muted text-xs">{d}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Vista previa del documento ─────────────────────────────
const DocPreview = ({ doc, vars }) => {
  const blocks = React.useMemo(() => parseDocumentText(doc.texto), [doc.texto]);
  return (
    <div className="doc-page contract" style={{minHeight:'auto', padding:'40px 50px', boxShadow:'var(--shadow-sm)'}}>
      <h1 dangerouslySetInnerHTML={{__html:
        renderTextHtml(doc.titulo, vars) + (doc.subtitulo ? '<br/>' + renderTextHtml(doc.subtitulo, vars) : '')
      }}/>
      {blocks.map((b, i) => <RenderBlock key={i} b={b} vars={vars} preview={true}/>)}
    </div>
  );
};

// ─── Renderiza un bloque parseado ───────────────────────────
const RenderBlock = ({ b, vars, cronograma, compradorA, preview }) => {
  if (b.tipo === 'heading') return <h2>{b.text}</h2>;
  if (b.tipo === 'p') {
    return <p style={b.indent ? {paddingLeft: 22} : null}
              dangerouslySetInnerHTML={{__html: renderTextHtml(b.text, vars)}}/>;
  }
  if (b.tipo === 'lista') {
    return (
      <ol type={b.tipoLista || 'A'} style={{margin:'0 0 12px 28px', padding:0}}>
        {b.items.map((it, j) => (
          <li key={j} dangerouslySetInnerHTML={{__html: renderTextHtml(it, vars)}}/>
        ))}
      </ol>
    );
  }
  if (b.tipo === 'cronograma') {
    if (preview) {
      return (
        <div className="muted text-xs" style={{padding:8, background:'#f0eee6', borderRadius:4, margin:'8px 0', textAlign:'center'}}>
          [ Tabla de cronograma — se rellena con las cuotas de la venta ]
        </div>
      );
    }
    if (!cronograma) return null;
    return (
      <table className="crono-inline">
        <thead><tr>
          <th style={{width:80}}>N° CUOTAS</th>
          <th>MONTO A DEPOSITAR</th>
          <th>FECHAS DE PAGO</th>
        </tr></thead>
        <tbody>
          {cronograma.map((c) => (
            <tr key={c.n}>
              <td className="center">{c.n}</td>
              <td><span className="fill">S/{fmtSoles(c.monto)}</span></td>
              <td><span className="fill">{new Date(c.fecha).toLocaleDateString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'})}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (b.tipo === 'firma') {
    if (preview) {
      return (
        <div className="muted text-xs" style={{padding:8, background:'#f0eee6', borderRadius:4, margin:'24px 0 0', textAlign:'center'}}>
          [ Bloque de firmas ]
        </div>
      );
    }
    const cname = compradorA ? `${compradorA.nombres} ${compradorA.apellidos}`.toUpperCase() : '(EL COMPRADOR)';
    const cdni = compradorA?.dni || '';
    if (b.soloComprador) {
      return (
        <div className="doc-sign-row" style={{gridTemplateColumns:'1fr'}}>
          <div className="doc-sign">
            <b>{cname}</b><br/>
            DNI N°{cdni}<br/>
            (EL COMPRADOR)
          </div>
        </div>
      );
    }
    return (
      <div className="doc-sign-row">
        <div className="doc-sign">
          <b>{EMPRESA.razonSocial}</b><br/>
          GERENTE<br/>
          DNI N°{EMPRESA.representanteDni}<br/>
          {EMPRESA.representante}<br/>
          (EL VENDEDOR)
        </div>
        <div className="doc-sign">
          <b>{cname}</b><br/>
          DNI N°{cdni}<br/>
          (EL COMPRADOR)
        </div>
      </div>
    );
  }
  return null;
};

// ─── Editor de empresa (reutilizado) ─────────────────────────
const EmpresaEditor = ({ onToast }) => {
  const STORAGE_KEY = 'mattika.empresa.v1';
  const [emp, setEmp] = React.useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw); } catch(e) {}
    return EMPRESA;
  });
  const [dirty, setDirty] = React.useState(false);
  const upd = (k, v) => { setEmp({...emp, [k]: v}); setDirty(true); };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emp));
    Object.assign(EMPRESA, emp);
    setDirty(false);
    onToast('Datos de la empresa guardados');
  };

  return (
    <div className="page" data-screen-label="Empresa" style={{maxWidth:900}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Empresa vendedora</h1>
          <div className="page-sub">Estos datos aparecen en todos los documentos generados.</div>
        </div>
      </div>
      <div className="card card-pad">
        <div className="field-group cols-2">
          <div className="field">
            <label className="field-label">Razón social</label>
            <input className="input" value={emp.razonSocial} onChange={(e)=>upd('razonSocial', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">R.U.C.</label>
            <input className="input mono" value={emp.ruc} onChange={(e)=>upd('ruc', e.target.value)}/>
          </div>
          <div className="field" style={{gridColumn:'1 / -1'}}>
            <label className="field-label">Domicilio fiscal</label>
            <textarea className="textarea" rows={2} value={emp.domicilio} onChange={(e)=>upd('domicilio', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">Representante legal</label>
            <input className="input" value={emp.representante} onChange={(e)=>upd('representante', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">DNI del representante</label>
            <input className="input mono" value={emp.representanteDni} onChange={(e)=>upd('representanteDni', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">Partida (P.J.)</label>
            <input className="input mono" value={emp.partidaJuridica} onChange={(e)=>upd('partidaJuridica', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">Oficina registral</label>
            <input className="input" value={emp.oficinaRegistral} onChange={(e)=>upd('oficinaRegistral', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label">Banco por defecto</label>
            <select className="select" value={emp.bancoNombre} onChange={(e)=>upd('bancoNombre', e.target.value)}>
              <option>BCP</option><option>BBVA</option><option>Interbank</option><option>Scotiabank</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">N° de cuenta por defecto</label>
            <input className="input mono" value={emp.bancoCuenta} onChange={(e)=>upd('bancoCuenta', e.target.value)}/>
          </div>
        </div>
        <div className="hstack gap-8 mt-16" style={{justifyContent:'flex-end'}}>
          <button className="btn primary" onClick={save} disabled={!dirty}>
            <Icon name="check" size={14}/> Guardar datos
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenTemplateEditor, EmpresaEditor, RenderBlock, DocPreview });
