// contract-template.jsx — Plantilla simplificada:
// Una sola venta genera 5 documentos.  Cada documento se edita como
// UN SOLO BLOQUE DE TEXTO con variables {variable}, no por párrafos.

// ═══════════════════════════════════════════════════════════════
// TIPOS DE DOCUMENTO — una venta genera los 5 automáticamente
// ═══════════════════════════════════════════════════════════════
const DOC_TYPES = [
  { id:'ayudaMemoria',     label:'Ayuda Memoria',                         tag:'Resumen',   icon:'info' },
  { id:'separacion',       label:'Separación',                            tag:'Reserva',   icon:'receipt' },
  { id:'compraventa',      label:'Contrato de Compraventa',               tag:'Principal', icon:'doc' },
  { id:'cronograma',       label:'Cronograma de Pagos',                   tag:'Anexo',     icon:'calendar' },
  { id:'actaSeparacion',   label:'Acta de Separación',                    tag:'Adicional', icon:'archive' },
  { id:'tratamientoDatos', label:'Tratamiento de Datos Personales',       tag:'Anexo',     icon:'shield' },
  { id:'ddjjDomicilio',    label:'Declaración Jurada de Domicilio y Estado Civil', tag:'Anexo', icon:'signature' },
];

// Lista EFECTIVA de documentos de un pack: los base + los personalizados,
// menos los que la empresa haya ocultado/eliminado (tpl.hiddenDocs).
const docTypesForPack = (tpl) => {
  const hidden = (tpl && tpl.hiddenDocs) || [];
  return [...DOC_TYPES, ...((tpl && tpl.extraDocs) || [])].filter(d => !hidden.includes(d.id));
};

// Cada EMPRESA tiene su propio juego de plantillas (contratos/modelos distintos).
// La clave se construye con el empresaId de la sesión activa.
const TEMPLATE_STORAGE_PREFIX = 'mattika.template.v5';
const _tplEmpresaId = (empresaId) => empresaId || window.getSesion?.()?.empresaId || '_default';
const _tplKey = (empresaId) => `${TEMPLATE_STORAGE_PREFIX}.${_tplEmpresaId(empresaId)}`;

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

<b>COMO EL COMPRADOR:</b> {comprador.bloqueCompraventa} Y BAJO LAS CONDICIONES SIGUIENTES:

{{#gananciales}}> LAS PARTES DEJAN CONSTANCIA QUE EL COMPRADOR ESTÁ CONFORMADO POR LOS CÓNYUGES {comprador.nombreA} Y {comprador.nombreB}, CASADOS ENTRE SÍ BAJO EL RÉGIMEN DE SOCIEDAD DE GANANCIALES{{#tieneFechaMat}}, SEGÚN MATRIMONIO CELEBRADO EL {matrimonio.fecha}{{/tieneFechaMat}}{{#tieneLugarMat}} EN {matrimonio.lugar}{{/tieneLugarMat}}. EN CONSECUENCIA, EL BIEN ADQUIRIDO INGRESARÁ AL PATRIMONIO DE LA SOCIEDAD CONYUGAL, CONFORME AL ARTÍCULO 310° DEL CÓDIGO CIVIL.{{/gananciales}}{{#separacionBienes}}> LAS PARTES DEJAN CONSTANCIA QUE EL COMPRADOR ESTÁ CONFORMADO POR LOS CÓNYUGES {comprador.nombreA} Y {comprador.nombreB}, CASADOS BAJO EL RÉGIMEN DE SEPARACIÓN DE PATRIMONIOS{{#tieneEscritura}}, SEGÚN ESCRITURA PÚBLICA {matrimonio.escritura}{{/tieneEscritura}}. EN CONSECUENCIA, CADA CÓNYUGE CONSERVA LA TITULARIDAD DE LA CUOTA QUE ADQUIERE, CONFORME AL ARTÍCULO 327° DEL CÓDIGO CIVIL.{{/separacionBienes}}{{#copropietarios}}> EL COMPRADOR ADQUIERE EL INMUEBLE EN COPROPIEDAD Y POR CUOTAS IDEALES, CONFORME AL SIGUIENTE DETALLE: {cuotas.linea}; DE ACUERDO A LO PREVISTO EN EL ARTÍCULO 969° Y SIGUIENTES DEL CÓDIGO CIVIL.{{/copropietarios}}

## ANTECEDENTES

<b>PRIMERA. —</b> EL VENDEDOR MANIFIESTA Y ACREDITA QUE OSTENTA LA TITULARIDAD SOBRE EL PREDIO URBANO, UBICADO EN VALLE CHICAMA PREDIO MOCAN SECTOR LA ARENITA U.C. 1900, DISTRITO {inmueble.distrito}, PROVINCIA {inmueble.provincia}, DEPARTAMENTO {inmueble.departamento}, EL MISMO QUE OBRA REGISTRADO EN LA PARTIDA ELECTRÓNICA {inmueble.partidaMatriz}, DEL REGISTRO DE PREDIOS DE LA SUNARP - SEDE TRUJILLO – OFICINA REGISTRAL TRUJILLO.

{{#independizado}}> EL {inmueble.tipoInmueble} MATERIA DEL PRESENTE CONTRATO SE ENCUENTRA DEBIDAMENTE INDEPENDIZADO, REGISTRADO EN LA PARTIDA ELECTRÓNICA {inmueble.partidaIndependizada}, DEL REGISTRO DE PREDIOS DE LA SUNARP - SEDE TRUJILLO.{{/independizado}}

<b>SEGUNDA. —</b> SOBRE EL BIEN REFERIDO EN LA CLÁUSULA ANTERIOR, EL VENDEDOR VIENE DESARROLLANDO EL PROYECTO INMOBILIARIO DENOMINADO "{inmueble.proyecto}", DONDE SE OBTENDRÁN LOTES DE TERRENO DEBIDAMENTE INDEPENDIZADOS; EN ADELANTE EL PROYECTO.

<b>TERCERA. —</b> {comprador.termino} {{#uno}}HA{{/uno}}{{#dos}}HAN{{/dos}} TENIDO POR BIEN, ELEGIR EL {inmueble.tipoInmueble} "{inmueble.unidad}" DE LA MANZANA "{inmueble.manzana}", DETALLADO CON UN ÁREA TOTAL DE {inmueble.area} M² DENTRO DE LOS PLANOS DE EL PROYECTO. ASIMISMO, {comprador.termino} {{#uno}}DECLARA{{/uno}}{{#dos}}DECLARAN{{/dos}} SABER Y ACEPTAR QUE LA EXTENSIÓN SUPERFICIAL Y MEDIDAS PERIMÉTRICAS DE LAS ÁREAS COMUNES QUE PERTENECEN AL CONDOMINIO ESTÁN SUPEDITADAS A LOS REAJUSTES DEFINITIVOS QUE CONSTEN EN EL PLANO DE REPLANTEO, RESULTANTE LUEGO DE LA RECEPCIÓN DE LAS OBRAS DEL PROYECTO. ADEMÁS, {{#uno}}RECONOCE{{/uno}}{{#dos}}RECONOCEN{{/dos}} QUE ES FACULTAD DE EL VENDEDOR REALIZAR CUALQUIER TIPO DE MODIFICACIÓN AL PROYECTO CON RESPECTO A LAS ÁREAS COMUNES, CON UNA FINALIDAD DE MEJORA, SIN LIMITACIÓN DE NINGUNA ESPECIE Y SIN NECESIDAD DE CONSULTA PREVIA {comprador.terminoAl}.

<b>CUARTA. —</b> EL VENDEDOR SE COMPROMETE Y RESPONSABILIZA SOBRE EL DESARROLLO DEL PROYECTO "{inmueble.proyecto}" EN CADA UNA DE SUS ETAPAS, CONTANDO CON LA ENTREGA FINAL DEL PROYECTO CON LAS SIGUIENTES CARACTERÍSTICAS:
A. ENTREGA DEL {inmueble.tipoInmueble} CON TÍTULO INDEPENDIZADO (PREDIO URBANO).
B. PÓRTICO DE INGRESO, CERCO PERIMÉTRICO, VÍAS AFIRMADAS, CANCHA DE FÚTBOL, PARQUES RECREATIVOS, PISCINA, ZONA DE FOGATA, JUEGOS PARA NIÑOS Y GIMNASIO AL AIRE LIBRE.
C. PUNTO DE AGUA EN CADA LOTE, AGUA QUE SERÁ CAPTADA DE UN POZO TUBULAR DE 25 MTS DE PROFUNDIDAD Y ALMACENADA EN UN RESERVORIO ELEVADO PARA SER DISTRIBUIDO A TRAVÉS DE TUBERÍAS MATRICES Y DOMICILIARIAS.
D. ALUMBRADO PÚBLICO POR MEDIO DE PANELES SOLARES Y CERTIFICADO DE FACTIBILIDAD ELÉCTRICA PARA LA MATRIZ DE LUZ EN EL PÓRTICO DE INGRESO.

## PRECIO Y FORMA DE PAGO

<b>QUINTA. —</b> POR MEDIO DEL PRESENTE CONTRATO, EL VENDEDOR TRANSFIERE A FAVOR {comprador.terminoDe} EL {inmueble.tipoInmueble} DESCRITO EN LA CLÁUSULA TERCERA DE ESTE PRESENTE DOCUMENTO POR EL PRECIO DE VENTA PACTADO, DE MUTUO Y COMÚN ACUERDO DE <b>S/ {precio}</b> ({precioLetras}). LOS CUALES SERÁN CANCELADOS, CONFORME AL SIGUIENTE DETALLE:

{{^inicialFraccionada}}> UNA CANTIDAD DE <b>S/{inicial}</b> ({inicialLetras}) POR CONCEPTO DE {conceptoPago}, REALIZADO MEDIANTE EL DEPÓSITO A LA CUENTA CORRIENTE DEL {banco} N.º {cuenta}{{#tieneCci}} (CCI {cci}){{/tieneCci}} A NOMBRE DE {empresa.razonSocial}{{#tieneOperacion}} CON NÚMERO DE OPERACIÓN {operacion}{{/tieneOperacion}}.{{/inicialFraccionada}}

{{#inicialFraccionada}}> LA CUOTA {conceptoPago} DE <b>S/{inicial}</b> ({inicialLetras}) SE CANCELA DE FORMA FRACCIONADA MEDIANTE DEPÓSITOS A LAS CUENTAS A NOMBRE DE {empresa.razonSocial}, CONFORME AL SIGUIENTE DETALLE:

[INICIALES]{{/inicialFraccionada}}

{{^financiado}}> {comprador.termino} {{#uno}}CANCELA{{/uno}}{{#dos}}CANCELAN{{/dos}} EN ESTE ACTO EL ÍNTEGRO DEL PRECIO DE VENTA PACTADO, DEJANDO EL VENDEDOR EXPRESA CONSTANCIA DE LA CANCELACIÓN TOTAL DEL MISMO, NO QUEDANDO SALDO NI IMPORTE ALGUNO PENDIENTE DE PAGO A SU FAVOR POR CONCEPTO DE ESTA COMPRAVENTA, OTORGANDO {comprador.terminoAl} LA MÁS AMPLIA Y TOTAL CANCELACIÓN QUE POR LEY CORRESPONDA.{{/financiado}}

{{#financiado}}Y EL MONTO RESTANTE DE <b>S/{saldo}</b> ({saldoLetras}), {comprador.termino} {{#uno}}DECLARA Y ESTABLECE{{/uno}}{{#dos}}DECLARAN Y ESTABLECEN{{/dos}} QUE SERÁ CANCELADO TENIENDO COMO FECHA DE PAGO CONSIDERANDO EL SIGUIENTE CRONOGRAMA:

[CRONOGRAMA]

> EN LA SITUACIÓN DESAFORTUNADA QUE {comprador.termino} NO {{#uno}}PUEDA{{/uno}}{{#dos}}PUEDAN{{/dos}} REALIZAR EL PAGO EN LAS FECHAS ANTES MENCIONADAS, SE {{#uno}}LE{{/uno}}{{#dos}}LES{{/dos}} BRINDARÁ UN PLAZO DE 5 DÍAS HÁBILES PARA QUE {{#uno}}REGULARICE{{/uno}}{{#dos}}REGULARICEN{{/dos}} EL PAGO SOBRE LA CUOTA ESTABLECIDA. DESPUÉS DEL PLAZO MENCIONADO TENDRÁ UN INTERÉS POR DÍA DE {penalidad} SOLES Y DE NO PONERSE AL DÍA EN 3 MESES CONSECUTIVOS, EL VENDEDOR PODRÁ DAR POR RESUELTO EL CONTRATO DE PLENO DERECHO, BASTANDO PARA TAL EFECTO LA COMUNICACIÓN DIRIGIDA {comprador.terminoAl} POR CONDUCTO NOTARIAL, DE ACUERDO A LO ESTABLECIDO POR EL ARTÍCULO 1430° DEL CÓDIGO CIVIL. ADEMÁS, QUEDA ENTENDIDO QUE ESTA OPCIÓN PODRÁ SER EJERCITADA POR EL VENDEDOR SIN IMPORTAR EL MONTO DEL PRECIO QUE SE HUBIERA CANCELADO, QUEDANDO EL CONTRATO RESUELTO DE PLENO DERECHO SIN NECESIDAD DE PRONUNCIAMIENTO JUDICIAL O ARBITRAL DE NINGUNA ESPECIE. TAMBIÉN, HA DE MENCIONARSE QUE, SI EL VENDEDOR OPTASE POR LA RESOLUCIÓN AUTOMÁTICA DEL CONTRATO, ÉSTE PODRÁ RETENER PARA SÍ EL EQUIVALENTE AL {lucroCesante}% DEL PRECIO DE VENTA POR CONCEPTO DE LUCRO CESANTE, DEVOLVIENDO {comprador.terminoAl} EL REMANENTE DE LA SUMA QUE HUBIERA PAGADO HASTA LA FECHA, PREVIA DEDUCCIÓN DE LOS GASTOS ADMINISTRATIVOS Y COMISIONES ORIGINADOS POR LA VENTA.{{/financiado}}

<b>SEXTA. —</b> EN CASO QUE EL BIEN SE ENCUENTRE DENTRO DE UN RÉGIMEN DE UNIDADES INMOBILIARIAS DE PROPIEDAD EXCLUSIVA Y PROPIEDAD COMÚN, LA VENTA COMPRENDE EL ÁREA SEÑALADA COMO PROPIEDAD EXCLUSIVA Y EL PORCENTAJE DE PARTICIPACIÓN QUE LE CORRESPONDE SOBRE LAS ÁREAS Y BIENES COMUNES SEGÚN SE ESTIPULA EN EL REGLAMENTO INTERNO. ADEMÁS, LA VENTA DEL BIEN SE EFECTÚA EN AD CORPUS Y COMPRENDE LA FÁBRICA CORRESPONDIENTE, SUS ÁREAS, AIRES, USOS, COSTUMBRES, SERVIDUMBRES, ENTRADAS, SALIDAS Y EN GENERAL, TODO AQUELLO QUE DE HECHO O POR DERECHO PUDIERE CORRESPONDER AL BIEN ENAJENADO, SIN RESERVA NI LIMITACIÓN ALGUNA.

<b>SÉPTIMA. —</b> LAS PARTES CONTRATANTES CONVIENEN EXPRESAMENTE QUE LA COMPRAVENTA MATERIA DEL PRESENTE, SE EFECTÚA DENTRO DE LOS ALCANCES DEL ARTÍCULO 1583° DEL CÓDIGO CIVIL. POR LO QUE, {comprador.termino} {{#uno}}ADQUIERE{{/uno}}{{#dos}}ADQUIEREN{{/dos}} EL DERECHO DE PROPIEDAD DEL INMUEBLE SÓLO CUANDO {{#uno}}HAYA{{/uno}}{{#dos}}HAYAN{{/dos}} PAGADO EL ÍNTEGRO DEL PRECIO PACTADO O EN EL MOMENTO EN EL CUAL EL VENDEDOR RENUNCIE POR ESCRITO Y EXPRESAMENTE AL PACTO DE RESERVA DE DOMINIO, LO QUE OCURRA PRIMERO.

<b>OCTAVA. —</b> {comprador.termino}, EN TANTO EXISTA LA RESERVA DE DOMINIO ANTES DETALLADA, NO {{#uno}}PODRÁ{{/uno}}{{#dos}}PODRÁN{{/dos}} TRANSFERIR ESTE CONTRATO Y POR LO TANTO DISPONER O GRAVAR DERECHOS SOBRE EL INMUEBLE DESCRITO EN LA CLÁUSULA TERCERA, SIN AUTORIZACIÓN ESCRITA DE EL VENDEDOR.

<b>NOVENA. —</b> EL VENDEDOR DECLARA QUE, SOBRE EL INMUEBLE QUE SE ENAJENA, NO EXISTE MEDIDA JUDICIAL O EXTRAJUDICIAL ALGUNA QUE RESTRINJA O LIMITE SU LIBRE DISPOSICIÓN, OBLIGÁNDOSE NO OBSTANTE ESTA DECLARACIÓN AL SANEAMIENTO POR EVICCIÓN DE ACUERDO A LEY.

<b>DÉCIMA. —</b> QUEDA EXPRESAMENTE ENTENDIDO QUE ESTÁN EXCEPTUADAS DE ESTA VENTA LAS OBRAS PERTINENTES DE ELECTRIFICACIÓN, AGUA POTABLE Y ALCANTARILLADO, PISTAS Y VEREDAS POR LO QUE ESTÁN EXCLUIDAS DE ESTE CONTRATO. EN TAL SENTIDO {comprador.termino} {{#uno}}DEJA{{/uno}}{{#dos}}DEJAN{{/dos}} EXPRESA CONSTANCIA QUE NO {{#uno}}LE{{/uno}}{{#dos}}LES{{/dos}} CORRESPONDE NADA POR DICHOS CONCEPTOS, SIENDO CUALQUIER REEMBOLSO POR DICHOS CONCEPTOS DE PROPIEDAD EXCLUSIVA DE EL VENDEDOR. TAMBIÉN, {comprador.termino} {{#uno}}DECLARA{{/uno}}{{#dos}}DECLARAN{{/dos}} CONOCER QUE EL VENDEDOR NO ESTÁ OBLIGADO A EJECUTAR LAS OBRAS DE REDES TELEFÓNICAS NI INTERNET.

<b>DÉCIMO PRIMERA. —</b> EL VENDEDOR ENTREGARÁ EL INMUEBLE MATERIA DE VENTA EN LA FECHA {plazoEntrega}, MÁXIMO PARA EL DESARROLLO DEL PROYECTO. ESTE PLAZO ES EL PRIMIGENIAMENTE ESTIPULADO, EL MISMO QUE PODRÁ VARIAR SI OCURRIESEN SITUACIONES DE CASO FORTUITO O FUERZA MAYOR, LO QUE SE {{#uno}}LE{{/uno}}{{#dos}}LES{{/dos}} COMUNICARÁ OPORTUNAMENTE {comprador.terminoAl}, ESTO SEGÚN LO ESTABLECIDO EN EL ARTÍCULO 1315 DEL CÓDIGO CIVIL QUE SEÑALA "CASO FORTUITO O FUERZA MAYOR ES LA CAUSA NO IMPUTABLE, CONSISTENTE EN UN EVENTO EXTRAORDINARIO, IMPREVISIBLE E IRRESISTIBLE, QUE IMPIDE LA EJECUCIÓN DE LA OBLIGACIÓN O DETERMINA SU CUMPLIMIENTO PARCIAL, TARDÍO O DEFECTUOSO".

<b>DÉCIMO SEGUNDA. —</b> EL PRESENTE CONTRATO QUEDA SUJETO A LA CONDICIÓN SUSPENSIVA DE QUE EL BIEN LLEGUE A TENER EXISTENCIA, EN APLICACIÓN DEL ARTÍCULO 1534 DEL CÓDIGO CIVIL. NO OBSTANTE, LAS PARTES ACUERDAN QUE LA CONDICIÓN SE ENTENDERÁ CUMPLIDA CUANDO SE ENCUENTRE INSCRITA LA DECLARATORIA DE FÁBRICA, LA INDEPENDIZACIÓN Y EL REGLAMENTO INTERNO, LO QUE OCURRA PRIMERO RESPECTO DEL BIEN OBJETO DE VENTA, EN LA PARTIDA {inmueble.partidaVigente} DEL REGISTRO CORRESPONDIENTE, FECHA EN LA CUAL EL PRESENTE CONTRATO SURTIRÁ PLENOS EFECTOS.

<b>DÉCIMO TERCERA. —</b> EN CASO DE INCUMPLIMIENTO DE CONTRATO POR PARTE DE EL VENDEDOR EN LA ENTREGA DEL PROYECTO TERMINADO Y DENTRO DEL PLAZO CORRESPONDIENTE, {comprador.termino} {{#uno}}PODRÁ{{/uno}}{{#dos}}PODRÁN{{/dos}} A SU ELECCIÓN, EJERCER CUALESQUIERA DE LOS SIGUIENTES DERECHOS DE MANERA ALTERNATIVA:
A. RESOLVER EL CONTRATO CONFORME A LEY. ASIMISMO, EL VENDEDOR DEBERÁ DEVOLVER EN UN PLAZO NO MAYOR DE 30 (TREINTA) DÍAS ÚTILES DE CURSADA LA COMUNICACIÓN DE FECHA CIERTA QUE DA POR RESUELTO EL CONTRATO, EL PRECIO QUE {comprador.termino} {{#uno}}HUBIERA{{/uno}}{{#dos}}HUBIERAN{{/dos}} PAGADO HASTA ESA FECHA. ASÍ COMO, REEMBOLSAR EL COSTO DE TODOS LOS GASTOS EN QUE {{#uno}}HUBIERA{{/uno}}{{#dos}}HUBIERAN{{/dos}} INCURRIDO {comprador.termino} POR LA TRANSFERENCIA DEL BIEN OBJETO DE VENTA Y/O POR LA NO ENTREGA OPORTUNA DEL BIEN.
B. EXIGIR A EL VENDEDOR LA ENTREGA DEL INMUEBLE, DE ACUERDO A LAS CONDICIONES PACTADAS.

<b>DÉCIMO CUARTA. —</b> A EFECTOS DE LA RELACIÓN INTERNA ENTRE CONTRATANTES, SON DE CARGO DE EL VENDEDOR LOS TRIBUTOS QUE SE HUBIERAN DEVENGADO Y ACOTADO HASTA LA FECHA DE LA ENTREGA FÍSICA DEL {inmueble.tipoInmueble} {comprador.terminoAl}, SIENDO DE CUENTA Y CARGO {comprador.terminoDe} TODOS LOS TRIBUTOS QUE SE DEVENGUEN DESDE ESTA FECHA EN ADELANTE.

<b>DÉCIMO QUINTA. —</b> CORRESPONDE {comprador.terminoAl} EL PAGO DEL IMPUESTO DE ALCABALA SI ÉSTE FUERE APLICABLE A LA PRESENTE TRANSFERENCIA SEGÚN LO PREVISTO POR EL D. LEG. 776 Y SUS NORMAS MODIFICATORIAS. ADEMÁS DE LOS TRIBUTOS Y GASTOS POSTERIORES QUE ORIGINE EL PRESENTE CONTRATO COMO LA MINUTA Y ESCRITURA PÚBLICA, INCLUYENDO UNA COPIA SIMPLE DE LA ESCRITURA DE COMPRAVENTA.

<b>DÉCIMO SEXTA. —</b> {comprador.termino} {{#uno}}ES CONSCIENTE{{/uno}}{{#dos}}SON CONSCIENTES{{/dos}} Y ES DE SU RESPONSABILIDAD EL COSTO DE INSTALACIÓN DE LAS CONEXIONES DOMICILIARIAS DE SERVICIOS DE AGUA Y ENERGÍA ELÉCTRICA, ASÍ COMO LAS INSTALACIONES DE LOS MEDIDORES CORRESPONDIENTES.

<b>DÉCIMO SÉPTIMA. —</b> LAS PARTES CONTRATANTES DECLARAN QUE CUALQUIER MODIFICACIÓN FUTURA DE LA OBRA DE URBANIZACIÓN, DESPUÉS DE QUE HAYA SIDO RECIBIDA POR LA AUTORIDAD COMPETENTE, SERÁ DE CARGO {comprador.terminoDe}.

<b>DÉCIMO OCTAVA. —</b> AMBAS PARTES RENUNCIAN AL FUERO DE SUS DOMICILIOS Y SE SOMETEN EXPRESAMENTE A LA JURISDICCIÓN DE LOS JUECES Y TRIBUNALES DE TRUJILLO PARA TODO LO QUE SE RELACIONE CON LA INTERPRETACIÓN, CUMPLIMIENTO, EJECUCIÓN O CUALQUIER DIVERGENCIA O CONFLICTO DERIVADOS DEL PRESENTE CONTRATO, SEÑALANDO COMO SUS DOMICILIOS LOS QUE APARECEN EN LA INTRODUCCIÓN DEL PRESENTE DOCUMENTO, POR LO QUE SE TENDRÁN POR BIEN HECHAS LAS NOTIFICACIONES Y/O COMUNICACIONES QUE SE EFECTÚEN EN DICHO DOMICILIO SI NO FUERA COMUNICADO POR ESCRITO EL CAMBIO DEL MISMO.

<b>DÉCIMO NOVENA. —</b> SI EN CASO {comprador.termino} {{#uno}}DECIDA{{/uno}}{{#dos}}DECIDAN{{/dos}} CAMBIAR DE DIRECCIÓN DE DOMICILIO, {{#uno}}DEBERÁ{{/uno}}{{#dos}}DEBERÁN{{/dos}} HABERLO COMUNICADO POR ESCRITO CURSADO POR CONDUCTO NOTARIAL A EL VENDEDOR.

<b>VIGÉSIMA. —</b> {comprador.termino} EN ESTE ACTO Y CON ARREGLO A LA LEGISLACIÓN PERUANA DE PREVENCIÓN DE LAVADO DE ACTIVOS Y FINANCIAMIENTO DEL TERRORISMO {{#uno}}DECLARA{{/uno}}{{#dos}}DECLARAN{{/dos}} BAJO JURAMENTO:
A. QUE {{#uno}}ADQUIERE{{/uno}}{{#dos}}ADQUIEREN{{/dos}} PARA SÍ Y {{#uno}}ES EL BENEFICIARIO FINAL{{/uno}}{{#dos}}SON LOS BENEFICIARIOS FINALES{{/dos}} DEL BIEN INMUEBLE QUE {{#uno}}ADQUIERE{{/uno}}{{#dos}}ADQUIEREN{{/dos}} EN VIRTUD DEL PRESENTE INSTRUMENTO.
B. QUE LAS SUMAS DE DINERO QUE {{#uno}}UTILIZA{{/uno}}{{#dos}}UTILIZAN{{/dos}} PARA LA ADQUISICIÓN DEL INMUEBLE QUE MEDIANTE ESTE CONTRATO {{#uno}}COMPRA{{/uno}}{{#dos}}COMPRAN{{/dos}} TIENEN ORIGEN LEGÍTIMO Y NO ESTÁN VINCULADAS O SON DERIVADAS DE ACTIVIDADES ILÍCITAS DE NINGUNA ESPECIE.
C. LA PRESENTE COMPRAVENTA TIENE SU FUNDAMENTO ECONÓMICO EN ACTIVIDADES LÍCITAS Y NO ESTÁ VINCULADA AL LAVADO DE ACTIVOS O CUALQUIER OTRA ACTIVIDAD ILÍCITA.

<b>VIGÉSIMO PRIMERA. —</b> {comprador.termino} {{#uno}}DECLARA{{/uno}}{{#dos}}DECLARAN{{/dos}} SABER Y CONOCER QUE:
A. CONSTITUYE SU OBLIGACIÓN PRACTICAR LA DECLARACIÓN JURADA DE ADQUISICIÓN DEL INMUEBLE (CARGO) MEDIANTE EL PRESENTE INSTRUMENTO DE COMPRA ANTE LA MUNICIPALIDAD DISTRITAL DE LA JURISDICCIÓN DONDE SE ENCUENTRA UBICADO ÉSTE, DENTRO DEL MES SIGUIENTE DE HABER ADQUIRIDO LA TITULARIDAD DEL BIEN.
B. ES DE SU CUENTA, CARGO Y RESPONSABILIDAD EL PAGO DEL IMPUESTO DE ALCABALA, DEBIENDO PRACTICAR LA DECLARACIÓN Y PAGO DE DICHO TRIBUTO DENTRO DEL MES SIGUIENTE DE HABER ADQUIRIDO LA TITULARIDAD DEL BIEN.

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

{comprador.yo}, <b>{comprador.nombre}</b>, {comprador.identificado} con D.N.I. N° <b>{comprador.dni}</b>, con domicilio en {comprador.domicilio}, en cumplimiento de la Ley N° 29733 — Ley de Protección de Datos Personales — y su Reglamento aprobado por D.S. N° 003-2013-JUS:

<b>{comprador.declaro}</b> haber sido informado(a) de manera previa, expresa, inequívoca, libre y gratuita por parte de {empresa.razonSocial}, con R.U.C. {empresa.ruc} (en adelante, EL TITULAR DEL BANCO DE DATOS), respecto al tratamiento de mis datos personales, conforme al siguiente detalle:

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

{comprador.yo}, <b>{comprador.nombre}</b>, {comprador.identificado} con Documento Nacional de Identidad N° <b>{comprador.dni}</b>, en pleno uso de las facultades que la ley reconoce y bajo juramento, en cumplimiento de lo dispuesto por la Ley N° 27444 — Ley del Procedimiento Administrativo General — y el Artículo 41° del D.S. N° 004-2019-JUS,

## DECLARO BAJO JURAMENTO

<b>PRIMERO. —</b> Que {comprador.mi} domicilio real, actual y permanente — el mismo que se señala para todos los efectos legales derivados del Contrato de Compraventa que se celebra con {empresa.razonSocial} — se encuentra ubicado en:

> {comprador.domicilio}

<b>SEGUNDO. —</b> Que {comprador.mi} estado civil actual es de <b>{comprador.estadoCivil}</b>, situación que se declara bajo juramento es la vigente a la fecha de suscripción del presente documento.

<b>TERCERO. —</b> Que los datos personales declarados — nombres, apellidos, DNI, domicilio y estado civil — son correctos, completos y verdaderos, y se autoriza a {empresa.razonSocial} a verificarlos por los medios que considere pertinentes.

<b>CUARTO. —</b> Que se conoce la responsabilidad penal a la que {comprador.sujeto} en caso la presente declaración resultara falsa, conforme al Artículo 411° del Código Penal — delito de falsa declaración en procedimiento administrativo — y demás normas concordantes.

<b>QUINTO. —</b> Que cualquier variación en {comprador.mi} domicilio o estado civil será comunicada por escrito a {empresa.razonSocial} dentro de los quince (15) días siguientes de producido el cambio, por conducto notarial de ser necesario.

Se suscribe la presente declaración para los fines que considere conveniente la parte interesada, en señal de plena conformidad con lo declarado.

{lugar}, {fechaLarga}

[FIRMA-COMPRADOR]`;

const TXT_AYUDA_MEMORIA = `## AYUDA MEMORIA

Resumen del contrato a firmar. Documento guía interno; no reemplaza las cláusulas del contrato.

## PARTES

<b>Vendedor:</b> {empresa.razonSocial} · R.U.C. {empresa.ruc}
<b>Comprador:</b> {comprador.nombre} · DNI {comprador.dni}
<b>Asesor encargado de la venta:</b> {asesor}

## INMUEBLE

{inmueble.tipoInmueble} {inmueble.unidad} · Manzana {inmueble.manzana} · {inmueble.area} m²
Proyecto "{inmueble.proyecto}" · Partida {inmueble.partidaVigente}
{inmueble.distrito}, {inmueble.provincia}, {inmueble.departamento}

## CONDICIONES ECONÓMICAS

Precio total: <b>S/ {precio}</b> ({precioLetras})
Cuota inicial: <b>S/ {inicial}</b> ({inicialLetras})
Saldo a financiar: <b>S/ {saldo}</b> ({saldoLetras})

## PLAN DE PAGOS

[CRONOGRAMA]

{lugar}, {fechaLarga}`;

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
  ayudaMemoria: {
    titulo: 'AYUDA MEMORIA DEL CONTRATO',
    subtitulo: 'Resumen · Proyecto "{inmueble.proyecto}"',
    texto: TXT_AYUDA_MEMORIA,
  },
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

// Formato de página al IMPRIMIR / exportar — EDITABLE por empresa.
// Hoja A4 vertical. Márgenes en centímetros (default 2 cm en los 4 lados,
// como una hoja Word estándar). `reservaMembrete` añade espacio en blanco
// arriba para no pisar el membrete de un papel pre-impreso, y los toggles
// permiten ocultar el encabezado/pie digital cuando se imprime en membrete.
const DEFAULT_PAGINA = {
  margenSup: 2.54,
  margenInf: 2.54,
  margenIzq: 2.54,
  margenDer: 2.54,
  reservaMembrete: 0,
  mostrarEncabezado: false,
  mostrarPie: true,
  tablaFontSize: 8.5,
  tablaDensidad: 'compacta',
  tablaBorde: 'completo',
};

// Formato del bloque de identificación del comprador — EDITABLE por empresa.
// Controla cómo se arma {comprador.bloqueCompraventa}. Se adapta solo a 1 o 2
// compradores combinando `ident` (por persona) con `unionDos` y los cierres.
const DEFAULT_BLOQUE_COMPRADOR = {
  ident: '{nombre}, IDENTIFICADO(A) CON DNI N°{dni}, CON DOMICILIO EN {domicilio}, CON TELÉFONO +51 {telefono}, CON CORREO ELECTRÓNICO {email}',
  cierreUno: ',',
  unionDos: '; Y ',
  cierreDos: '; A QUIENES, CONJUNTAMENTE, SE LES DENOMINARÁ "EL COMPRADOR",',
};

// Configuración del bloque de firmas [FIRMA] — EDITABLE por empresa.
const DEFAULT_FIRMAS = {
  mostrarVendedor: true,
  etiquetaVendedor: 'EL VENDEDOR',
  etiquetaComprador: 'EL COMPRADOR',
  // Cuando hay 2 compradores, ambos firman (columnas separadas).
};

const DEFAULT_TEMPLATE_PACK = {
  nombre: 'Paquete Estándar de Venta',
  version: '5.0',
  documentos: DEFAULT_TEMPLATES,
  bloqueComprador: DEFAULT_BLOQUE_COMPRADOR,
  pagina: DEFAULT_PAGINA,
  firmas: DEFAULT_FIRMAS,
  hiddenDocs: [],
};

// ─── Storage (por empresa) ────────────────────────────────────
const _normalizePack = (parsed) => {
  // Migración desde v1 (bloques) si la encontramos
  if (parsed.bloques && !parsed.documentos) return DEFAULT_TEMPLATE_PACK;
  // Asegurar que todos los documentos estén presentes
  const documentos = { ...DEFAULT_TEMPLATES, ...(parsed.documentos || {}) };
  const bloqueComprador = { ...DEFAULT_BLOQUE_COMPRADOR, ...(parsed.bloqueComprador || {}) };
  const pagina = { ...DEFAULT_PAGINA, ...(parsed.pagina || {}) };
  const firmas = { ...DEFAULT_FIRMAS, ...(parsed.firmas || {}) };
  const hiddenDocs = Array.isArray(parsed.hiddenDocs) ? parsed.hiddenDocs : [];
  return { ...DEFAULT_TEMPLATE_PACK, ...parsed, documentos, bloqueComprador, pagina, firmas, hiddenDocs };
};
const loadTemplate = (empresaId) => {
  const KEY = _tplKey(empresaId);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return _normalizePack(JSON.parse(raw));
    // Migración: si existía la clave global antigua, adoptarla para esta empresa.
    const legacy = localStorage.getItem(TEMPLATE_STORAGE_PREFIX);
    if (legacy) {
      const pack = _normalizePack(JSON.parse(legacy));
      localStorage.setItem(KEY, JSON.stringify(pack));
      return pack;
    }
  } catch (e) {}
  return DEFAULT_TEMPLATE_PACK;
};
const saveTemplate = (tpl, empresaId) => localStorage.setItem(_tplKey(empresaId), JSON.stringify(tpl));
const resetTemplate = (empresaId) => localStorage.removeItem(_tplKey(empresaId));

// ═══════════════════════════════════════════════════════════════
// VARIABLES — contexto de sustitución
// ═══════════════════════════════════════════════════════════════
const buildVars = (data, bloqueCfg) => {
  const { compradorA, inmueble, terminos, meta } = data;
  const saldo = terminos.precio - terminos.inicial;

  // ── Compradores: 1 (titular único) o 2 (copropietarios / cónyuges) ──
  const A = compradorA || {};
  const B = data.compradorB || null;
  const tit = data.titularidad || 'unico';
  const dos = !!B && ['copropietarios', 'conyuge', 'separacion-bienes'].includes(tit);
  const mat = data.matrimonio || {};
  const cuo = data.cuotasIdeales || {};

  const up = (s) => String(s || '').toUpperCase();
  // Asesor encargado de la venta (nombre para mostrar en documentos)
  const _asesores = [...((window.getAsesoresEmpresa && window.getAsesoresEmpresa()) || []), ...((window.ASESORES) || [])];
  const _asesorMeta = _asesores.find(a => a.id === (meta && meta.asesorId));
  const asesorNombre = _asesorMeta ? _asesorMeta.name : ((meta && meta.asesorNombre) || '');
  const nombreA = `${A.nombres || ''} ${A.apellidos || ''}`.trim();
  const nombreB = B ? `${B.nombres || ''} ${B.apellidos || ''}`.trim() : '';

  // Identificación del comprador — formato CONFIGURABLE por empresa.
  // Tokens disponibles por persona; los valores se ponen en MAYÚSCULA.
  const bc = { ...DEFAULT_BLOQUE_COMPRADOR, ...(bloqueCfg || {}) };
  const ident = (p) => {
    const m = {
      nombre: `${p.nombres || ''} ${p.apellidos || ''}`.trim(),
      dni: p.dni || '',
      domicilio: p.domicilio || '',
      telefono: p.telefono || '',
      email: p.email || '',
      estadoCivil: p.estadoCivil || '',
      ocupacion: p.ocupacion || '',
    };
    return String(bc.ident || '').replace(/\{(\w+)\}/g, (_, k) => up(m[k] !== undefined ? m[k] : ''));
  };
  const bloqueCompraventa = dos
    ? `${ident(A)}${bc.unionDos}${ident(B)}${bc.cierreDos}`
    : `${ident(A)}${bc.cierreUno}`;

  // Valores combinados (para los documentos donde solo se nombra al comprador)
  const join = (a, b, sep = ' Y ') => dos ? `${a || ''}${sep}${b || ''}` : (a || '');
  const nombreCombi = dos ? `${up(nombreA)} Y ${up(nombreB)}` : up(nombreA);
  const dniCombi = join(A.dni, B && B.dni);
  const domCombi = dos
    ? ((A.domicilio || '') === (B.domicilio || '')
        ? (A.domicilio || '')
        : `${A.domicilio || ''} (${up(nombreA)}); y ${B.domicilio || ''} (${up(nombreB)})`)
    : (A.domicilio || '');
  const cuotaA = (cuo.a !== undefined && cuo.a !== '') ? cuo.a : 50;
  const cuotaB = (cuo.b !== undefined && cuo.b !== '') ? cuo.b : 50;

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
      nombre: nombreCombi,
      dni: dniCombi,
      domicilio: domCombi,
      telefono: join(A.telefono, B && B.telefono, ' / '),
      email: join(A.email, B && B.email, ' / '),
      estadoCivil: join(A.estadoCivil, B && B.estadoCivil),
      ocupacion: join(A.ocupacion, B && B.ocupacion, ' / '),
      nacionalidad: join(A.nacionalidad || 'Peruana', B && (B.nacionalidad || 'Peruana')),
      distrito: join(A.distrito, B && B.distrito),
      provincia: join(A.provincia, B && B.provincia),
      departamento: join(A.departamento, B && B.departamento),
      // Auxiliares para gramática singular/plural
      nombreA: up(nombreA),
      nombreB: up(nombreB),
      termino: dos ? 'LOS COMPRADORES' : 'EL COMPRADOR',
      terminoDe: dos ? 'DE LOS COMPRADORES' : 'DEL COMPRADOR',
      terminoAl: dos ? 'A LOS COMPRADORES' : 'AL COMPRADOR',
      bloqueCompraventa,
      yo: dos ? 'Nosotros' : 'Yo',
      identificado: dos ? 'identificados(as)' : 'identificado(a)',
      declaro: dos ? 'DECLARAMOS' : 'DECLARO',
      mi: dos ? 'nuestro' : 'mi',
      sujeto: dos ? 'estamos sujetos(as)' : 'estoy sujeto(a)',
    },
    matrimonio: {
      fecha: mat.fecha ? fmtDateLong(mat.fecha) : '',
      lugar: mat.lugar || '',
      escritura: mat.escritura || '',
    },
    cuotas: {
      a: cuotaA,
      b: cuotaB,
      linea: `${up(nombreA)} CON UNA CUOTA IDEAL DEL ${cuotaA}% Y ${up(nombreB)} CON UNA CUOTA IDEAL DEL ${cuotaB}%`,
    },
    inmueble: {
      proyecto: inmueble.proyecto || '',
      tipoInmueble: (inmueble.tipoInmueble || 'Lote'),
      unidad: inmueble.unidad,
      manzana: inmueble.manzana,
      area: inmueble.area,
      partida: inmueble.partida,
      partidaMatriz: inmueble.partida || '',
      partidaIndependizada: inmueble.partidaIndependizada || '',
      partidaVigente: (inmueble.estadoRegistral === 'independizada' && inmueble.partidaIndependizada)
        ? inmueble.partidaIndependizada : (inmueble.partida || ''),
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
    conceptoPago: (terminos.contado === true || saldo <= 0.5) ? 'PAGO TOTAL' : 'INICIAL',
    banco: terminos.bancoNombre,
    cuenta: terminos.bancoCuenta,
    cci: terminos.cci || '',
    cciFrase: terminos.cci ? ` (CCI ${terminos.cci})` : '',
    operacion: terminos.numOperacion || '',
    operacionFrase: terminos.numOperacion ? ` CON NÚMERO DE OPERACIÓN ${terminos.numOperacion}` : '',
    penalidad: terminos.penalidadDiaria,
    lucroCesante: terminos.porcLucroCesante,
    plazoEntrega: terminos.plazoEntrega,
    fechaLarga: fmtDateLong(meta.fechaContrato),
    lugar: meta.lugarFirma || 'Trujillo',
    asesor: asesorNombre,
    // Banderas para bloques condicionales {{#flag}}…{{/flag}}
    _flags: {
      uno: !dos,
      dos,
      copropietarios: dos && tit === 'copropietarios',
      conyuge: dos && (tit === 'conyuge' || tit === 'separacion-bienes'),
      gananciales: dos && tit === 'conyuge',
      separacionBienes: dos && tit === 'separacion-bienes',
      independizado: inmueble.estadoRegistral === 'independizada',
      financiado: !(terminos.contado === true || saldo <= 0.5),
      tieneCci: !!terminos.cci,
      tieneOperacion: !!terminos.numOperacion,
      inicialFraccionada: !!terminos.inicialFraccionada,
      tieneFechaMat: !!mat.fecha,
      tieneLugarMat: !!mat.lugar,
      tieneEscritura: !!mat.escritura,
    },
  };
};

// ─── Bloques condicionales: {{#flag}}…{{/flag}} y {{^flag}}…{{/flag}} ──
// Se resuelven ANTES de partir el texto en párrafos, para que cláusulas
// completas aparezcan o desaparezcan según el régimen de titularidad.
const resolveConditionals = (text, flags = {}) => {
  if (!text) return '';
  const re = /\{\{([#^])(\w+)\}\}([\s\S]*?)\{\{\/\2\}\}/g;
  let out = text, prev, guard = 0;
  do {
    prev = out;
    out = out.replace(re, (m, kind, flag, body) => {
      const on = !!flags[flag];
      return (kind === '#' ? on : !on) ? body : '';
    });
  } while (out !== prev && ++guard < 25);
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
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
    if (/^\[INICIALES\]$/i.test(para))        { blocks.push({ tipo:'iniciales' }); continue; }
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
    ['{comprador.nombre}',      'Nombre(s) — 1 o 2 compradores'],
    ['{comprador.dni}',         'DNI(s)'],
    ['{comprador.nacionalidad}', 'Nacionalidad'],
    ['{comprador.domicilio}',   'Domicilio(s)'],
    ['{comprador.distrito}',    'Distrito'],
    ['{comprador.provincia}',   'Provincia'],
    ['{comprador.departamento}','Departamento'],
    ['{comprador.estadoCivil}', 'Estado civil'],
    ['{comprador.ocupacion}',   'Ocupación'],
    ['{comprador.telefono}',    'Teléfono'],
    ['{comprador.email}',       'Correo'],
    ['{comprador.termino}',     '"EL COMPRADOR" / "LOS COMPRADORES"'],
    ['{comprador.terminoDe}',   '"DEL COMPRADOR" / "DE LOS COMPRADORES"'],
    ['{comprador.terminoAl}',   '"AL COMPRADOR" / "A LOS COMPRADORES"'],
    ['{comprador.bloqueCompraventa}', 'Bloque de identificación (configurable abajo)'],
    ['{comprador.nombreA}',     'Solo Comprador 1'],
    ['{comprador.nombreB}',     'Solo Comprador 2'],
  ]},
  { label: 'Régimen y copropiedad', vars: [
    ['{matrimonio.fecha}',   'Fecha de matrimonio'],
    ['{matrimonio.lugar}',   'Lugar de matrimonio'],
    ['{matrimonio.escritura}', 'Escritura sep. de bienes'],
    ['{cuotas.linea}',       'Detalle de cuotas ideales'],
    ['{{#dos}}…{{/dos}}',    'Solo si hay 2 compradores'],
    ['{{#uno}}…{{/uno}}',    'Solo si hay 1 comprador'],
    ['{{#gananciales}}…{{/gananciales}}', 'Solo sociedad de gananciales'],
    ['{{#separacionBienes}}…{{/separacionBienes}}', 'Solo separación de bienes'],
    ['{{#copropietarios}}…{{/copropietarios}}', 'Solo copropietarios'],
  ]},
  { label: 'Inmueble', vars: [
    ['{inmueble.proyecto}',     'Proyecto'],
    ['{inmueble.tipoInmueble}', 'Lote / Casa / Dpto.'],
    ['{inmueble.unidad}',       'N° de unidad'],
    ['{inmueble.manzana}',      'Manzana'],
    ['{inmueble.area}',         'Área m²'],
    ['{inmueble.partidaMatriz}','Partida matriz (predio madre)'],
    ['{inmueble.partidaIndependizada}', 'Partida del lote independizado'],
    ['{inmueble.partidaVigente}', 'Partida vigente (auto: indep. o matriz)'],
    ['{inmueble.partida}',      'Partida (= matriz)'],
    ['{inmueble.distrito}',     'Distrito'],
    ['{inmueble.provincia}',    'Provincia'],
    ['{inmueble.departamento}', 'Departamento'],
    ['{{#independizado}}…{{/independizado}}', 'Solo si el lote está independizado'],
    ['{inmueble.partidaVigente}', 'Partida vigente (independizada o matriz)'],
  ]},
  { label: 'Precio y pago', vars: [
    ['{precio}',        'Precio total'],
    ['{precioLetras}',  'Precio en letras'],
    ['{cci}',           'CCI de la cuenta de destino'],
    ['{operacion}',     'N° de operación / voucher'],
    ['{inicial}',       'Cuota inicial'],
    ['{inicialLetras}', 'Inicial en letras'],
    ['{saldo}',         'Saldo'],
    ['{saldoLetras}',   'Saldo en letras'],
    ['{banco}',         'Banco'],
    ['{cuenta}',        'N° cuenta'],
    ['{cci}',           'CCI de la cuenta'],
    ['{operacion}',     'N° operación'],
    ['{penalidad}',     'Penalidad diaria'],
    ['{lucroCesante}',  '% lucro cesante'],
    ['{plazoEntrega}',  'Plazo entrega'],
    ['[INICIALES]',     'Tabla de pagos de la inicial fraccionada'],
    ['{{#inicialFraccionada}}…{{/inicialFraccionada}}', 'Solo si la inicial es fraccionada'],
    ['{{#financiado}}…{{/financiado}}', 'Solo venta financiada (saldo + cronograma + mora)'],
    ['{{^financiado}}…{{/financiado}}', 'Solo venta al contado (constancia de cancelación)'],
    ['{conceptoPago}', 'INICIAL (financiado) / PAGO TOTAL (contado)'],
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
  DOC_TYPES, docTypesForPack, DEFAULT_TEMPLATE_PACK, TEMPLATE_VARS_GROUPS,
  loadTemplate, saveTemplate, resetTemplate,
  buildVars, renderTextHtml, parseDocumentText, escapeHtml, resolveConditionals,
});

// ═══════════════════════════════════════════════════════════════
// EDITOR — pantalla "Plantilla"
// ═══════════════════════════════════════════════════════════════

// Campo numérico compacto en cm
const CmField = ({ label, value, onChange }) => (
  <div className="field">
    <label className="field-label">{label}</label>
    <input className="input" type="number" min="0" step="0.5"
           value={value}
           onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}/>
  </div>
);

// Vista en miniatura de la hoja A4 con sus márgenes y la reserva de membrete
const PageMarginPreview = ({ pg }) => {
  const W = 152;
  const cm = W / 21;            // 21 cm de ancho A4
  const H = 29.7 * cm;          // 29.7 cm de alto A4
  const num = (v, d) => (v === '' || v == null || isNaN(+v)) ? d : +v;
  const t = num(pg.margenSup, 2), b = num(pg.margenInf, 2);
  const l = num(pg.margenIzq, 2), r = num(pg.margenDer, 2);
  const res = num(pg.reservaMembrete, 0);
  return (
    <div style={{ width: W, height: H, background: '#fff', border: '1px solid var(--border-strong)',
                  borderRadius: 2, position: 'relative', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
      {res > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: res * cm,
                      background: 'repeating-linear-gradient(45deg,#e8def7 0 5px,#f6f0fe 5px 10px)',
                      borderBottom: '1px dashed #b9a4e0' }} title="Reserva para membrete"/>
      )}
      <div style={{ position: 'absolute', top: (t + res) * cm, bottom: b * cm, left: l * cm, right: r * cm,
                    border: '1px dashed #c4b2e8', background: '#faf7ff' }}/>
    </div>
  );
};

const ScreenTemplateEditor = ({ onToast, isAdmin }) => {
  const [tpl, setTpl] = React.useState(() => loadTemplate());
  const [dirty, setDirty] = React.useState(false);
  const [docId, setDocId] = React.useState('compraventa');
  const [preview, setPreview] = React.useState(true);
  const textareaRef = React.useRef(null);

  // Formato del bloque de identificación del comprador (configurable)
  const bc = { ...DEFAULT_BLOQUE_COMPRADOR, ...(tpl.bloqueComprador || {}) };
  const bcDeps = [bc.ident, bc.cierreUno, bc.unionDos, bc.cierreDos];

  // Datos de ejemplo para vista previa
  const SAMPLE_UNO = {
    compradorA: { nombres: 'Rosmery Rocío', apellidos: 'Valderrama Trujillo', dni: '46049117',
                  telefono:'923 585 590', email:'rosmery@correo.pe', estadoCivil:'Soltera', ocupacion:'Comerciante',
                  domicilio:'Jr. Indico 432, La Esperanza, Trujillo, La Libertad' },
    inmueble: { proyecto:'Nápoles Condominio Club', tipoInmueble:'Lote', unidad:'7', manzana:'C',
                area:'140', partida:'11550511', distrito:'Razuri', provincia:'Ascope', departamento:'La Libertad' },
    terminos: { precio:17100, inicial:3500, bancoNombre:'BCP', bancoCuenta:'570-7307941059',
                numOperacion:'', penalidadDiaria:30, porcLucroCesante:30, plazoEntrega:'12.2027' },
    meta: { fechaContrato: new Date().toISOString().slice(0,10), lugarFirma:'Trujillo' },
  };
  const SAMPLE_DOS = {
    ...SAMPLE_UNO,
    titularidad: 'conyuge',
    compradorB: { nombres: 'Carlos Alberto', apellidos: 'Mendoza Ríos', dni: '40218876',
                  telefono:'987 112 334', email:'carlos@correo.pe', estadoCivil:'Casado', ocupacion:'Ingeniero',
                  domicilio:'Jr. Indico 432, La Esperanza, Trujillo, La Libertad' },
  };
  const sampleVars = React.useMemo(() => buildVars(SAMPLE_UNO, bc), bcDeps);
  const sampleVarsDos = React.useMemo(() => buildVars(SAMPLE_DOS, bc), bcDeps);

  const [fmtOpen, setFmtOpen] = React.useState(false);
  const docTypes = React.useMemo(() => docTypesForPack(tpl), [tpl.extraDocs]);
  const doc = tpl.documentos[docId] || DEFAULT_TEMPLATES[docId] || { titulo:'', subtitulo:'', texto:'' };
  const docMeta = docTypes.find(d => d.id === docId) || DOC_TYPES[0];
  const isCustom = !!(tpl.extraDocs || []).find(d => d.id === docId);
  const sesion = (window.getSesion?.() || {});
  const empresaNombre = sesion.empresaNombre || sesion.empresaId || 'tu empresa';

  const updPack = (patch) => { setTpl({ ...tpl, ...patch }); setDirty(true); };

  // Formato de página (márgenes A4 / membrete) — nivel paquete
  const pg = { ...DEFAULT_PAGINA, ...(tpl.pagina || {}) };
  const updPagina = (patch) => updPack({ pagina: { ...pg, ...patch } });
  // Configuración del bloque de firmas
  const fz = { ...DEFAULT_FIRMAS, ...(tpl.firmas || {}) };
  const updFirmas = (patch) => updPack({ firmas: { ...fz, ...patch } });

  // Editar metadatos (nombre / etiqueta) de un documento personalizado
  const updDocMeta = (patch) => {
    const extraDocs = (tpl.extraDocs || []).map(d => d.id === docId ? { ...d, ...patch } : d);
    setTpl({ ...tpl, extraDocs });
    setDirty(true);
  };

  // Agregar un documento nuevo propio de la empresa
  const addDoc = () => {
    const id = 'extra-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const n = (tpl.extraDocs || []).length + 1;
    const meta = { id, label: `Documento adicional ${n}`, tag: 'Anexo', icon: 'doc' };
    const documentos = {
      ...tpl.documentos,
      [id]: {
        titulo: 'NUEVO DOCUMENTO',
        subtitulo: 'Proyecto "{inmueble.proyecto}"',
        texto: '## TÍTULO DE LA SECCIÓN\n\nEscribe aquí el contenido del documento. Usa variables como {comprador.nombre}, {inmueble.unidad} o {terminos.precio} para rellenar con los datos de la venta.\n\n[FIRMA]',
      },
    };
    setTpl({ ...tpl, extraDocs: [...(tpl.extraDocs || []), meta], documentos });
    setDirty(true);
    setDocId(id);
  };

  // Eliminar un documento personalizado (los 6 base no se pueden eliminar)
  const deleteDoc = () => {
    if (isCustom) {
      if (!confirm(`¿Eliminar el documento "${docMeta.label}" del modelo? Se quitará del paquete de venta.`)) return;
      const extraDocs = (tpl.extraDocs || []).filter(d => d.id !== docId);
      const documentos = { ...tpl.documentos };
      delete documentos[docId];
      setTpl({ ...tpl, extraDocs, documentos });
      setDirty(true);
      setDocId('compraventa');
      return;
    }
    // Documento base: se oculta del paquete (se puede restaurar con "Restaurar todo").
    if (!confirm(`¿Quitar el documento "${docMeta.label}" del paquete de venta? Podrás restaurarlo luego con "Restaurar todo".`)) return;
    const hiddenDocs = Array.from(new Set([...((tpl.hiddenDocs) || []), docId]));
    const restantes = docTypes.filter(d => d.id !== docId);
    setTpl({ ...tpl, hiddenDocs });
    setDirty(true);
    setDocId((restantes[0] && restantes[0].id) || 'compraventa');
  };

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

  // ── Formato intuitivo: envuelve la selección (negrita) ──
  const wrapSelection = (before, after) => {
    const ta = textareaRef.current; if (!ta) return;
    const cur = doc.texto;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (s === e) {  // sin selección: insertar marcas con texto guía
      const guide = 'texto';
      const next = cur.slice(0, s) + before + guide + after + cur.slice(e);
      updDoc({ texto: next });
      requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + guide.length); });
      return;
    }
    const inner = cur.slice(s, e);
    let next, ns, ne;
    if (inner.startsWith(before) && inner.endsWith(after) && inner.length >= before.length + after.length) {
      const stripped = inner.slice(before.length, inner.length - after.length);  // quitar negrita
      next = cur.slice(0, s) + stripped + cur.slice(e);
      ns = s; ne = s + stripped.length;
    } else {
      next = cur.slice(0, s) + before + inner + after + cur.slice(e);
      ns = s + before.length; ne = ns + inner.length;
    }
    updDoc({ texto: next });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(ns, ne); });
  };

  // ── Formato por líneas: título, viñetas, numeración, sangría, normal ──
  const formatLines = (mode) => {
    const ta = textareaRef.current; if (!ta) return;
    const cur = doc.texto;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const lineStart = cur.lastIndexOf('\n', s - 1) + 1;
    let lineEnd = cur.indexOf('\n', e);
    if (lineEnd === -1) lineEnd = cur.length;
    const lines = cur.slice(lineStart, lineEnd).split('\n');

    // Quitar cualquier marcador existente para poder cambiar de un formato a otro
    const reMarker = /^(\s*)(##\s+|>\s?|[-*•]\s+|[A-Za-z]{1,2}[.\)]\s+|\d{1,3}[.\)]\s+)?([\s\S]*)$/;
    const bodies = lines.map(l => { const m = l.match(reMarker); return (m && m[3] != null) ? m[3] : l; });

    let out;
    if (mode === 'heading')      out = bodies.map(b => `## ${b}`);
    else if (mode === 'bullet')  out = bodies.map(b => `- ${b}`);
    else if (mode === 'number')  out = bodies.map((b, i) => `${i + 1}. ${b}`);
    else if (mode === 'letter')  out = bodies.map((b, i) => `${String.fromCharCode(65 + (i % 26))}. ${b}`);
    else if (mode === 'indent')  out = bodies.map(b => `> ${b}`);
    else                          out = bodies;  // 'normal' — solo limpia marcadores

    const replaced = out.join('\n');
    const next = cur.slice(0, lineStart) + replaced + cur.slice(lineEnd);
    updDoc({ texto: next });
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(lineStart, lineStart + replaced.length); });
  };

  const save = () => { saveTemplate(tpl); setDirty(false); onToast('Plantilla guardada'); };
  const resetActual = () => {
    if (isCustom) {
      if (!confirm(`¿Vaciar el contenido del documento "${docMeta.label}"?`)) return;
      updDoc({ titulo: 'NUEVO DOCUMENTO', subtitulo: '', texto: '## TÍTULO\n\nContenido…\n\n[FIRMA]' });
      return;
    }
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
            <span className="pill accent" style={{marginRight:8}}><span className="dot"/>{empresaNombre}</span>
            Modelo propio de esta empresa · {docTypes.length} documentos por venta
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

      {/* Modelo de contrato — cada empresa nombra el suyo */}
      <div className="card card-pad mb-12" style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, alignItems:'end'}}>
        <div className="field">
          <label className="field-label">Nombre del modelo de contrato</label>
          <input className="input" value={tpl.nombre || ''}
                 placeholder="p. ej. Paquete Estándar de Venta"
                 onChange={(e) => updPack({ nombre: e.target.value })}/>
        </div>
        <div className="field">
          <label className="field-label">Versión</label>
          <input className="input" value={tpl.version || ''}
                 placeholder="5.0"
                 onChange={(e) => updPack({ version: e.target.value })}/>
        </div>
      </div>

      {/* Formato de página — A4, márgenes y hoja membretada */}
      <div className="card card-pad mb-12">
        <div className="hstack between" style={{flexWrap:'wrap', gap:8, cursor:'pointer'}} onClick={() => setFmtOpen(o => !o)}>
          <div>
            <div className="card-title">Formato de página · impresión y PDF</div>
            <div className="muted text-sm" style={{marginTop:2}}>
              Hoja <b>A4 vertical</b> · márgenes {pg.margenSup} cm · tablas {pg.tablaDensidad}. {fmtOpen ? 'Toca para ocultar.' : 'Toca para ajustar márgenes, membrete y tablas.'}
            </div>
          </div>
          <button className="btn sm ghost" onClick={(e) => { e.stopPropagation(); setFmtOpen(o => !o); }}>
            <Icon name={fmtOpen ? 'chevron-up' : 'chevron-down'} size={12}/> {fmtOpen ? 'Ocultar' : 'Ajustar'}
          </button>
        </div>

        {fmtOpen && (<>
        <div className="hstack" style={{justifyContent:'flex-end', margin:'12px 0'}}>
          <button className="btn sm" onClick={() => updPack({ pagina: { ...DEFAULT_PAGINA } })} title="Restaurar a 2.54 cm en los 4 lados">
            <Icon name="refresh" size={11}/> Restaurar
          </button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.1fr) minmax(0,1.1fr) auto', gap:20, alignItems:'start'}}>
          <div>
            <div className="muted text-xs" style={{textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:8}}>Márgenes (cm)</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <CmField label="Superior"  value={pg.margenSup} onChange={(v) => updPagina({ margenSup: v })}/>
              <CmField label="Inferior"  value={pg.margenInf} onChange={(v) => updPagina({ margenInf: v })}/>
              <CmField label="Izquierdo" value={pg.margenIzq} onChange={(v) => updPagina({ margenIzq: v })}/>
              <CmField label="Derecho"   value={pg.margenDer} onChange={(v) => updPagina({ margenDer: v })}/>
            </div>
          </div>

          <div>
            <div className="muted text-xs" style={{textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:8}}>Hoja membretada</div>
            <CmField label="Reserva en blanco arriba (cm)" value={pg.reservaMembrete} onChange={(v) => updPagina({ reservaMembrete: v })}/>
            <label className="hstack gap-8" style={{marginTop:12, cursor:'pointer'}}>
              <input type="checkbox" checked={pg.mostrarEncabezado !== false}
                     onChange={(e) => updPagina({ mostrarEncabezado: e.target.checked })}/>
              <span className="text-sm">Mostrar encabezado de la empresa</span>
            </label>
            <label className="hstack gap-8" style={{marginTop:8, cursor:'pointer'}}>
              <input type="checkbox" checked={pg.mostrarPie !== false}
                     onChange={(e) => updPagina({ mostrarPie: e.target.checked })}/>
              <span className="text-sm">Mostrar pie de página</span>
            </label>
          </div>

          <div className="vstack" style={{gap:6, alignItems:'center'}}>
            <PageMarginPreview pg={pg}/>
            <span className="muted text-xs">Vista de la hoja A4</span>
          </div>
        </div>

        {/* Ajustes de tabla (cronograma / pagos) */}
        <div style={{marginTop:18, paddingTop:16, borderTop:'1px solid var(--border)'}}>
          <div className="muted text-xs" style={{textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:10}}>Tablas (cronograma y pagos)</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(190px, 1fr))', gap:14, alignItems:'end'}}>
            <div className="field">
              <label className="field-label">Tamaño de letra · {(pg.tablaFontSize ?? 8.5)} pt</label>
              <input type="range" min="6" max="11" step="0.5"
                     value={pg.tablaFontSize ?? 8.5}
                     onChange={(e) => updPagina({ tablaFontSize: +e.target.value })}/>
            </div>
            <div className="field">
              <label className="field-label">Densidad de celda</label>
              <div className="seg-toggle">
                {[['compacta','Compacta'],['normal','Normal'],['amplia','Amplia']].map(([id,lbl]) => (
                  <button key={id} className={`seg-opt${(pg.tablaDensidad||'normal')===id?' active':''}`}
                          onClick={() => updPagina({ tablaDensidad: id })}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="field-label">Bordes</label>
              <div className="seg-toggle">
                {[['completo','Marcados'],['sutil','Sutiles']].map(([id,lbl]) => (
                  <button key={id} className={`seg-opt${(pg.tablaBorde||'completo')===id?' active':''}`}
                          onClick={() => updPagina({ tablaBorde: id })}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="muted text-xs" style={{marginTop:8}}>Aplica al cronograma de pagos y a la tabla de la cuota inicial, en pantalla, PDF y Word.</div>
        </div>
        </>)}
      </div>

      {/* Selector de documento — pills horizontales */}
      <div className="doc-picker">
        {docTypes.map((d, i) => (
          <button key={d.id} className={`doc-pill ${docId===d.id?'active':''}`} onClick={() => setDocId(d.id)}>
            <span className="seq">{String(i+1).padStart(2,'0')}</span>
            <span className="pill-body">
              <span className="pill-title">{d.label}</span>
              <span className="pill-tag">{d.tag}</span>
            </span>
          </button>
        ))}
        <button className="doc-pill doc-pill-add" onClick={addDoc} title="Agregar un documento propio de la empresa">
          <span className="seq"><Icon name="plus" size={14}/></span>
          <span className="pill-body">
            <span className="pill-title">Nuevo documento</span>
            <span className="pill-tag">Personalizado</span>
          </span>
        </button>
      </div>

      {/* Metadatos de documento personalizado — nombre / etiqueta / eliminar */}
      {isCustom && (
        <div className="card card-pad mb-12" style={{display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:12, alignItems:'end'}}>
          <div className="field">
            <label className="field-label">Nombre del documento</label>
            <input className="input" value={docMeta.label}
                   onChange={(e) => updDocMeta({ label: e.target.value })}/>
          </div>
          <div className="field">
            <label className="field-label">Etiqueta</label>
            <select className="select" value={docMeta.tag}
                    onChange={(e) => updDocMeta({ tag: e.target.value })}>
              <option value="Reserva">Reserva</option>
              <option value="Principal">Principal</option>
              <option value="Anexo">Anexo</option>
              <option value="Adicional">Adicional</option>
            </select>
          </div>
          <button className="btn danger" onClick={deleteDoc} title="Eliminar este documento del modelo">
            <Icon name="trash" size={14}/> Eliminar
          </button>
        </div>
      )}

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

      {/* Bloque de identificación del comprador — configurable por empresa.
          Solo aparece cuando el documento usa {comprador.bloqueCompraventa}. */}
      {doc.texto.includes('{comprador.bloqueCompraventa}') && (
        <div className="card card-pad mb-12">
          <div className="hstack between" style={{marginBottom:10, flexWrap:'wrap', gap:8}}>
            <div>
              <div className="card-title">Bloque de identificación del comprador</div>
              <div className="muted text-sm" style={{marginTop:2}}>
                Define cómo se redacta <code className="code-tag">{'{comprador.bloqueCompraventa}'}</code>. No todos los negocios lo escriben igual — aquí lo controlas. Se adapta solo a 1 o 2 compradores.
              </div>
            </div>
            <button className="btn sm" onClick={() => updPack({ bloqueComprador: { ...DEFAULT_BLOQUE_COMPRADOR } })} title="Restaurar el formato original del bloque">
              <Icon name="refresh" size={11}/> Restaurar bloque
            </button>
          </div>

          <div className="field" style={{marginBottom:12}}>
            <label className="field-label">Formato por persona</label>
            <textarea className="input" spellCheck="false"
              style={{minHeight:64, fontFamily:'var(--font-doc)', resize:'vertical', lineHeight:1.5}}
              value={bc.ident}
              onChange={(e) => updPack({ bloqueComprador: { ...bc, ident: e.target.value } })}/>
            <div className="hstack gap-6 muted text-xs" style={{marginTop:6, flexWrap:'wrap'}}>
              <span>Tokens:</span>
              {['{nombre}','{dni}','{domicilio}','{telefono}','{email}','{estadoCivil}','{ocupacion}'].map(t => (
                <code key={t} className="code-tag">{t}</code>
              ))}
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
            <div className="field">
              <label className="field-label">Cierre · 1 comprador</label>
              <input className="input" style={{fontFamily:'var(--font-doc)'}}
                     value={bc.cierreUno}
                     onChange={(e) => updPack({ bloqueComprador: { ...bc, cierreUno: e.target.value } })}/>
            </div>
            <div className="field">
              <label className="field-label">Unión entre 2 compradores</label>
              <input className="input" style={{fontFamily:'var(--font-doc)'}}
                     value={bc.unionDos}
                     onChange={(e) => updPack({ bloqueComprador: { ...bc, unionDos: e.target.value } })}/>
            </div>
            <div className="field">
              <label className="field-label">Cierre · 2 compradores</label>
              <input className="input" style={{fontFamily:'var(--font-doc)'}}
                     value={bc.cierreDos}
                     onChange={(e) => updPack({ bloqueComprador: { ...bc, cierreDos: e.target.value } })}/>
            </div>
          </div>

          <div className="vstack gap-8" style={{marginTop:14}}>
            <div style={{padding:'10px 12px', background:'#f4f5f7', borderRadius:8}}>
              <div className="muted text-xs" style={{marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600}}>Vista previa · 1 comprador</div>
              <div style={{fontFamily:'var(--font-doc)', fontSize:13, lineHeight:1.55}}>{sampleVars.comprador.bloqueCompraventa}</div>
            </div>
            <div style={{padding:'10px 12px', background:'#f4f5f7', borderRadius:8}}>
              <div className="muted text-xs" style={{marginBottom:4, textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600}}>Vista previa · 2 compradores</div>
              <div style={{fontFamily:'var(--font-doc)', fontSize:13, lineHeight:1.55}}>{sampleVarsDos.comprador.bloqueCompraventa}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bloque de firmas [FIRMA] — configurable. Aparece cuando el documento lo usa. */}
      {(doc.texto.includes('[FIRMA]') || doc.texto.includes('[FIRMA-COMPRADOR]')) && (
        <div className="card card-pad mb-12">
          <div className="hstack between" style={{marginBottom:10, flexWrap:'wrap', gap:8}}>
            <div>
              <div className="card-title">Bloque de firmas <code className="code-tag">[FIRMA]</code></div>
              <div className="muted text-sm" style={{marginTop:2}}>Controla quién firma y las etiquetas. Si la venta tiene <b>2 compradores</b>, ambos firman automáticamente (una columna por cada uno).</div>
            </div>
            <button className="btn sm" onClick={() => updPack({ firmas: { ...DEFAULT_FIRMAS } })} title="Restaurar firmas">
              <Icon name="refresh" size={11}/> Restaurar
            </button>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="field">
              <label className="field-label">Etiqueta del vendedor</label>
              <input className="input" value={fz.etiquetaVendedor} onChange={(e)=>updFirmas({ etiquetaVendedor: e.target.value })}/>
            </div>
            <div className="field">
              <label className="field-label">Etiqueta del comprador</label>
              <input className="input" value={fz.etiquetaComprador} onChange={(e)=>updFirmas({ etiquetaComprador: e.target.value })}/>
            </div>
          </div>
          <label className="hstack gap-8" style={{marginTop:10, cursor:'pointer'}}>
            <input type="checkbox" checked={fz.mostrarVendedor !== false} onChange={(e)=>updFirmas({ mostrarVendedor: e.target.checked })}/>
            <span className="text-sm">Incluir la firma del vendedor (empresa) en este bloque</span>
          </label>
        </div>
      )}

      {/* Cuerpo del documento — UN SOLO BLOQUE */}
      <div style={{display:'grid', gridTemplateColumns: preview ? '1fr 1fr' : '1fr 280px', gap:16, alignItems:'flex-start'}}>
        {/* Editor */}
        <div className="vstack gap-8">
          {/* Barra de formato — sin códigos, solo botones */}
          <div className="fmt-toolbar">
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => wrapSelection('<b>','</b>')} title="Negrita — resalta el texto seleccionado">
              <span style={{fontWeight:800, fontSize:14}}>N</span> Negrita
            </button>
            <span className="fmt-sep"/>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('heading')} title="Convertir la línea en un título de sección">
              <span style={{fontWeight:700}}>T</span> Título
            </button>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('bullet')} title="Lista con viñetas">
              <span style={{fontSize:15, lineHeight:1}}>•</span> Viñetas
            </button>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('number')} title="Lista numerada (1, 2, 3…)">
              <span style={{fontWeight:600}}>1.</span> Numeración
            </button>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('letter')} title="Lista con letras (A, B, C…)">
              <span style={{fontWeight:600}}>A.</span> Letras
            </button>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('indent')} title="Sangría — desplaza el párrafo hacia la derecha">
              <span style={{fontWeight:700}}>⇥</span> Sangría
            </button>
            <button className="fmt-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => formatLines('normal')} title="Quitar el formato de las líneas seleccionadas">
              Texto normal
            </button>
            <span className="fmt-sep"/>
            <button className="fmt-btn" onClick={() => insertToken('[CRONOGRAMA]')} title="Insertar la tabla del cronograma de pagos">
              <Icon name="calendar" size={12}/> Cronograma
            </button>
            <button className="fmt-btn" onClick={() => insertToken('[INICIALES]')} title="Insertar la tabla de pagos de la inicial fraccionada">
              <Icon name="money" size={12}/> Pagos iniciales
            </button>
            <button className="fmt-btn" onClick={() => insertToken('[FIRMA]')} title="Insertar el bloque de firmas">
              <Icon name="signature" size={12}/> Firmas
            </button>
            <span className="fmt-spacer"/>
            <button className="fmt-btn" onClick={resetActual} title="Restaurar este documento a su versión original">
              <Icon name="refresh" size={12}/> Restaurar
            </button>
            {!isCustom && (
              <button className="fmt-btn" onClick={deleteDoc} title="Quitar este documento del paquete de venta (se puede restaurar)" style={{color:'#c0334a'}}>
                <Icon name="trash" size={12}/> Quitar del paquete
              </button>
            )}
          </div>

          <textarea
            ref={textareaRef}
            className="doc-editor"
            value={doc.texto}
            onChange={(e) => updDoc({ texto: e.target.value })}
            spellCheck="false"
          />

          <div className="fmt-hint">
            <Icon name="info" size={13}/>
            <span>Selecciona el texto y pulsa un botón de la barra — no necesitas escribir códigos. A la derecha verás la <b>vista previa</b> de cómo quedará impreso. Para los datos del comprador, inserta <b>tokens</b> como <code className="code-tag">{'{comprador.nombre}'}</code> desde el panel de variables.</span>
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
  const blocks = React.useMemo(() => parseDocumentText(resolveConditionals(doc.texto, vars._flags || {})), [doc.texto, vars._flags]);
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
const RenderBlock = ({ b, vars, cronograma, pagosIniciales, inicialPagos, firmas, compradorA, compradorB, preview }) => {
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
    {
      const hoy = new Date(); const hoyNum = hoy.getFullYear()*10000 + (hoy.getMonth()+1)*100 + hoy.getDate();
      const fNum = (f) => { if(!f) return null; const [y,m,d]=String(f).split('-').map(Number); return y*10000+m*100+d; };
      const esPagado = (x) => { const p = (x && typeof x==='object') ? x : null; if (p && p.pagado === true) { const n=fNum(p.fecha); return n===null || n < hoyNum; } if (p && p.pagado === false) return false; const n=fNum(p ? p.fecha : x); return n!==null && n < hoyNum; };
      const fmtF = (f) => f ? new Date(f).toLocaleDateString('es-PE', {day:'2-digit', month:'2-digit', year:'numeric'}) : '—';
      const ini = (inicialPagos || []).filter(p => (+p.monto||0) > 0 || p.fecha);
      const totalIni = ini.reduce((s,p)=>s+(+p.monto||0),0);
      const totalSaldo = cronograma.reduce((s,c)=>s+(+c.monto||0),0);
      const total = totalIni + totalSaldo;
      const pagado = ini.reduce((s,p)=> esPagado(p) ? s+(+p.monto||0) : s, 0)
                   + cronograma.reduce((s,c)=> esPagado(c) ? s+(+c.monto||0) : s, 0);
      const badge = (ok) => (
        <span style={{display:'inline-block', padding:'1px 7px', borderRadius:10, fontSize:'8.5pt', fontWeight:700, letterSpacing:'.04em', color: ok?'#0E5B43':'#8A5A00', background: ok?'#E7F6EF':'#FBF0DA'}}>{ok?'PAGADO':'PENDIENTE'}</span>
      );
      const sect = (txt) => <tr><td colSpan={4} style={{background:'#efece4', fontWeight:700, textAlign:'left', letterSpacing:'.05em', fontSize:'10pt'}}>{txt}</td></tr>;
      return (
        <table className="crono-inline">
          <thead><tr>
            <th style={{width:140}}>CONCEPTO</th>
            <th>MONTO A DEPOSITAR</th>
            <th>FECHA DE PAGO</th>
            <th style={{width:96}}>ESTADO</th>
          </tr></thead>
          <tbody>
            {ini.length > 0 && sect('CUOTA INICIAL')}
            {ini.map((p, j) => {
              const ok = esPagado(p);
              return (
                <tr key={'i'+j}>
                  <td>{[String(p.etiqueta || 'Inicial').toUpperCase(), (p.banco || '')].filter(Boolean).join(' · ')}</td>
                  <td><span className="fill">S/{fmtSoles(+p.monto||0)}</span></td>
                  <td><span className="fill">{fmtF(p.fecha)}</span></td>
                  <td className="center">{badge(ok)}</td>
                </tr>
              );
            })}
            {sect('SALDO FINANCIADO EN CUOTAS')}
            {cronograma.map((c) => {
              const ok = esPagado(c);
              return (
                <tr key={'c'+c.n}>
                  <td className="center">Cuota {c.n}</td>
                  <td><span className="fill">S/{fmtSoles(c.monto)}</span></td>
                  <td><span className="fill">{fmtF(c.fecha)}</span></td>
                  <td className="center">{badge(ok)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{textAlign:'right', fontWeight:700, background:'#f5f3ee'}}>PRECIO TOTAL</td>
              <td colSpan={2} style={{textAlign:'center', fontWeight:700, background:'#f5f3ee'}}>S/{fmtSoles(total)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{textAlign:'right', fontWeight:600}}>PAGADO A LA FECHA</td>
              <td colSpan={2} style={{textAlign:'center', fontWeight:600, color:'#0E5B43'}}>S/{fmtSoles(pagado)}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{textAlign:'right', fontWeight:600}}>SALDO POR PAGAR</td>
              <td colSpan={2} style={{textAlign:'center', fontWeight:600, color:'#8A5A00'}}>S/{fmtSoles(total - pagado)}</td>
            </tr>
          </tfoot>
        </table>
      );
    }
  }
  if (b.tipo === 'iniciales') {
    if (preview) {
      return (
        <div className="muted text-xs" style={{padding:8, background:'#f0eee6', borderRadius:4, margin:'8px 0', textAlign:'center'}}>
          [ Tabla de pagos de la inicial — se rellena con la venta ]
        </div>
      );
    }
    if (!pagosIniciales || !pagosIniciales.length) return null;
    {
      const hoy = new Date(); const hoyNum = hoy.getFullYear()*10000 + (hoy.getMonth()+1)*100 + hoy.getDate();
      const fNum = (f) => { if(!f) return null; const [y,m,d]=String(f).split('-').map(Number); return y*10000+m*100+d; };
      const esPagado = (x) => { const p = (x && typeof x==='object') ? x : null; if (p && p.pagado === true) { const n=fNum(p.fecha); return n===null || n < hoyNum; } if (p && p.pagado === false) return false; const n=fNum(p ? p.fecha : x); return n!==null && n < hoyNum; };
      const totalI = pagosIniciales.reduce((s,p)=>s+(+p.monto||0),0);
      const pagadoI = pagosIniciales.reduce((s,p)=> esPagado(p) ? s+(+p.monto||0) : s, 0);
      const badge = (ok) => (
        <span style={{display:'inline-block', padding:'1px 7px', borderRadius:10, fontSize:'8.5pt', fontWeight:700, letterSpacing:'.04em', color: ok?'#0E5B43':'#8A5A00', background: ok?'#E7F6EF':'#FBF0DA'}}>{ok?'PAGADO':'PENDIENTE'}</span>
      );
      return (
        <table className="crono-inline">
          <thead><tr>
            <th>CONCEPTO</th>
            <th>MEDIO DE PAGO / CUENTA</th>
            <th>MONTO</th>
            <th>FECHA</th>
            <th>N° OPERACIÓN</th>
            <th style={{width:92}}>ESTADO</th>
          </tr></thead>
          <tbody>
            {pagosIniciales.map((p, j) => {
              const ok = esPagado(p);
              const medio = [p.banco, p.cuenta].filter(Boolean).join(' · ');
              return (
                <tr key={j}>
                  <td><span className="fill">{String(p.etiqueta||'').toUpperCase()}</span></td>
                  <td className="center"><span className="fill">{medio || '—'}</span></td>
                  <td className="center"><span className="fill">S/{fmtSoles(+p.monto||0)}</span></td>
                  <td className="center"><span className="fill">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—'}</span></td>
                  <td className="center"><span className="fill">{p.voucher || '—'}</span></td>
                  <td className="center">{badge(ok)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{textAlign:'right', fontWeight:700, background:'#f5f3ee'}}>TOTAL INICIAL</td>
              <td className="center" style={{fontWeight:700, background:'#f5f3ee'}}>S/{fmtSoles(totalI)}</td>
              <td colSpan={4} style={{background:'#f5f3ee'}}></td>
            </tr>
            <tr>
              <td style={{textAlign:'right', fontWeight:600}}>PAGADO A LA FECHA</td>
              <td className="center" style={{fontWeight:600, color:'#0E5B43'}}>S/{fmtSoles(pagadoI)}</td>
              <td colSpan={4}></td>
            </tr>
            <tr>
              <td style={{textAlign:'right', fontWeight:600}}>POR PAGAR</td>
              <td className="center" style={{fontWeight:600, color:'#8A5A00'}}>S/{fmtSoles(totalI - pagadoI)}</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      );
    }
  }
  if (b.tipo === 'firma') {
    if (preview) {
      return (
        <div className="muted text-xs" style={{padding:8, background:'#f0eee6', borderRadius:4, margin:'24px 0 0', textAlign:'center'}}>
          [ Bloque de firmas ]
        </div>
      );
    }
    const fz = { mostrarVendedor:true, etiquetaVendedor:'EL VENDEDOR', etiquetaComprador:'EL COMPRADOR', ...(firmas || {}) };
    const cname = compradorA ? `${compradorA.nombres} ${compradorA.apellidos}`.toUpperCase() : '(EL COMPRADOR)';
    const cdni = compradorA?.dni || '';
    const hasB = compradorB && (compradorB.nombres || compradorB.apellidos || compradorB.dni);
    const cnameB = hasB ? `${compradorB.nombres} ${compradorB.apellidos}`.toUpperCase() : '';
    const cdniB = hasB ? (compradorB.dni || '') : '';
    const etiqueta = `(${fz.etiquetaComprador})`;
    if (b.soloComprador) {
      return (
        <div className="doc-sign-row" style={{gridTemplateColumns: hasB ? '1fr 1fr' : '1fr'}}>
          <div className="doc-sign">
            <b>{cname}</b><br/>
            DNI N°{cdni}<br/>
            {etiqueta}
          </div>
          {hasB && (
            <div className="doc-sign">
              <b>{cnameB}</b><br/>
              DNI N°{cdniB}<br/>
              {etiqueta}
            </div>
          )}
        </div>
      );
    }
    const cols = (fz.mostrarVendedor ? 1 : 0) + 1 + (hasB ? 1 : 0);
    return (
      <div className="doc-sign-row" style={{gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: cols > 2 ? '28px' : undefined}}>
        {fz.mostrarVendedor && (
          <div className="doc-sign">
            <b>{EMPRESA.razonSocial}</b><br/>
            GERENTE<br/>
            DNI N°{EMPRESA.representanteDni}<br/>
            {EMPRESA.representante}<br/>
            ({fz.etiquetaVendedor})
          </div>
        )}
        <div className="doc-sign">
          <b>{cname}</b><br/>
          DNI N°{cdni}<br/>
          {etiqueta}
        </div>
        {hasB && (
          <div className="doc-sign">
            <b>{cnameB}</b><br/>
            DNI N°{cdniB}<br/>
            {etiqueta}
          </div>
        )}
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
