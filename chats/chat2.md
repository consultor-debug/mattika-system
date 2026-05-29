# Plantilla venta simplificada

_Started 2026-05-25 03:43 UTC_

---

## User

La plantilla me parece muy complicada de editar, lo hace por parrafos, me gustaria sea un solo bloque, simplifica todo 

Una venta, 1 sola venta genera documentos de:
1.- Separación
2.- Contrato de compraventa 
3.- Acta de Separación 
4.- Acpetacion de tratamiento de datos personales. 
5- Declaracion jurada de Domicilio y DNI

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: update_todos]_

Entiendo perfectamente. Voy a simplificar todo:
1. **Plantilla = un solo bloque editable** por documento (textarea grande con variables al lado)
2. **1 venta = 5 documentos generados** automáticamente

_[tool: read_file]_

_[tool: grep]_

_[tool: write_file]_

Ahora voy a reescribir todo. Primero la plantilla simplificada:

_[tool: str_replace_edit]_

Ahora actualizo el wizard (quitar paso de tipo) y la preview (mostrar 5 documentos):

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Ahora reescribo la preview para que muestre los 5 documentos:

_[tool: write_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Ahora index.html – quito el `tipo` del openContract y añado los styles necesarios:

_[tool: str_replace_edit]_

Ahora añado los estilos CSS para los nuevos componentes:

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Ahora verifico todo abriéndolo:

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Simplifiqué todo:

**Plantilla (un solo bloque):**
- 5 píldoras arriba para alternar entre los documentos
- **Una sola textarea grande** con el cuerpo completo del documento (no más párrafos sueltos)
- Sintaxis simple: `{variable}` para datos, `## TÍTULO` para secciones, `A. item` para listas, `> texto` para sangría, `<b>` para negrita, `[CRONOGRAMA]` y `[FIRMA]` para bloques especiales
- Botones rápidos para insertar Cronograma y Firmas
- Preview en vivo a la derecha

**Flujo de venta (1 venta = 5 docs):**
- Quité el paso "Tipo de documento" del wizard
- El botón ahora dice **"Generar 5 documentos"**
- La pantalla de resultado tiene tabs entre los 5 documentos generados:
  1. Separación
  2. Contrato de Compraventa
  3. Acta de Separación
  4. Tratamiento de Datos Personales
  5. Declaración Jurada de Domicilio y DNI
- Botón **"Paquete completo (5)"** descarga todos en un solo PDF, o "Solo este documento" para uno

**Dashboard:** Reemplacé los 4 cards de tipos por **un solo CTA grande "Generar nueva venta"** que muestra los 5 docs que se generarán.

Las plantillas de los 3 documentos nuevos (Separación simple, Tratamiento de Datos LOPD Ley 29733, DDJJ Domicilio/DNI según D.S. 004-2019-JUS) vienen con texto base editable — puedes ajustarlas desde la pantalla Plantilla.

## User

Verifier agent check completed

## Assistant

Todo verificado y funcionando ✓

## User

Cual es la diferencia entre el Documento de Separación, con el acta de separación, la declaracioen jurada de dj de domicilio y estado civil deberia ser.

## Assistant

_[tool: str_replace_edit]_

Buena pregunta. En la práctica peruana de inmobiliaria, la diferencia típica es:

**Separación** (#1) — Documento interno/comercial, informal. Es la "ficha" o "vale" que confirma que el cliente apartó el lote con un pago de buena fe. Sirve para uso interno del equipo de ventas mientras se prepara el contrato.

**Acta de Separación** (#3) — Documento formal con cláusulas legales (arras de retracto, plazo de 30 días, penalidades). Tiene valor legal frente a un eventual desistimiento. Es lo que se firma con el cliente.

En mis plantillas las hice así: #1 más simple tipo recibo de reserva, #3 con cláusulas formales tipo Acta. Si en tu operación son lo mismo, podemos consolidar a uno solo — dime.

Ahora corrijo la #5 a **Domicilio y Estado Civil**:

_[tool: str_replace_edit]_

Voy a forzar la migración para que se aplique el cambio aunque alguien ya haya guardado:

_[tool: str_replace_edit]_

_[tool: done]_

Listo. Cambios aplicados:

**Diferencia entre #1 y #3** (resumen):
- **Separación (#1)** = ficha interna/comercial, simple recibo de reserva
- **Acta de Separación (#3)** = documento formal con cláusulas legales (arras, plazos, penalidades)

Si en tu operación son lo mismo, dime y consolido a uno solo.

**Declaración Jurada (#5)** ahora es **"Declaración Jurada de Domicilio y Estado Civil"** — reemplacé la cláusula sobre el DNI por una declaración del estado civil (`{comprador.estadoCivil}`), conservando las referencias a la Ley 27444 y al Art. 411° del Código Penal por falsa declaración.

También agregué `{comprador.estadoCivil}` y `{comprador.ocupacion}` a las variables disponibles del editor.

## User

No me deja editar nada, que el cronograma de pagos tambien sea una adenda.

## Assistant

_[tool: str_replace_edit]_

Veo el problema: estás en la pantalla "Plantillas" (plural) que era el placeholder antiguo. La pantalla editable real estaba en "Plantilla" (singular, debajo). Voy a fusionar todo en un solo lugar y agregar **Cronograma de Pagos como anexo** (sexto documento):

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ahora actualizo el grid del picker para 6 columnas y unifico la navegación:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ahora actualizo los textos "5 documentos" → "6 documentos" donde aparezcan:

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

Listo. Cambios:

**1. Un solo lugar para editar:** Quité la pantalla "Plantillas" (plural) que era el placeholder antiguo. Ahora hay una sola entrada **"Plantillas"** en el sidebar que abre directamente el editor.

**2. Cronograma de Pagos ahora es el 6° documento (anexo):**
- Aparece como la pestaña **#03** entre Compraventa y Acta de Separación
- Texto base incluye: datos de la operación, tabla `[CRONOGRAMA]`, condiciones de pago (cuenta bancaria, mora, reprogramación)
- Sigue inline en el Contrato de Compraventa también (para mantener la referencia legal en la cláusula quinta) y además se firma como anexo independiente

**Paquete actualizado: 1 venta = 6 documentos**
1. Separación
2. Contrato de Compraventa  
3. **Cronograma de Pagos** ← nuevo
4. Acta de Separación
5. Tratamiento de Datos Personales
6. Declaración Jurada de Domicilio y Estado Civil

## User

NO ME DEJA GENERAR LOS DOCUMENTOS, APARECE UN ERROR, HAZ QUE SI O SI SE PUEDAN DESCARGAR TODOS LOS DOCUMENTOS SI NO ES TODOS UNO POR UNO, PERO QUE DEJE DESCARGAR

## Assistant

_[tool: str_replace_edit]_

Voy a reescribir la lógica de descarga para hacerla a prueba de errores. Cada documento se descarga independientemente (botón por documento), y el "todos" descarga uno por uno secuencialmente:

_[tool: grep]_

_[tool: str_replace_edit]_

Ahora añado el CSS para los botones de descarga individual y el spinner:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Y ahora hago que el `.fill` use colores estáticos (color-mix puede fallar en html2canvas):

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Cambios para garantizar la descarga:

**Cómo funciona ahora:**
- **Botón grande "Descargar los 6 documentos"** → descarga uno por uno secuencialmente. Si alguno falla, sigue con los demás y te avisa cuáles fallaron.
- **Cada documento tiene su propio botón de descarga** (icono ↓ a la derecha de cada fila) → descarga individual.
- **Spinner visible** mientras cada PDF se genera.
- **Botón "Imprimir / Guardar como PDF"** como respaldo nativo del navegador (siempre funciona).

**Por qué era inestable antes:**
1. El renderizado oculto con `position:absolute; left:-99999px` confundía a html2canvas.
2. Compartía estado de "descargando" entre acciones.
3. Los colores `color-mix(in oklab, ...)` del CSS de las variables resaltadas no son soportados por html2canvas → ahora son hex estáticos.

**Ahora cada PDF se genera así:**
1. Se crea un contenedor temporal con el documento renderizado fuera de pantalla pero visible.
2. Se espera que carguen las fuentes.
3. Se exporta a PDF.
4. Se limpia el contenedor.

Esto significa que cada descarga es independiente y a prueba de errores — si uno falla, los demás siguen.

## User

Verifier agent check completed

## Assistant

Confirmado funcionando ✓ — la descarga individual y el paquete completo de 6 PDFs operan sin errores.

## User

HAY UNA PARTE QUE DICE QUE TENGO 7 CONTRATOS POR FIRMAR, 2 CUOTAS VENCIDAS, DONDE VEO CUALES SON, DONDE REGISTRO LOS PAGOS,

## Assistant

_[tool: read_file]_

_[tool: read_file]_

Buena observación. Voy a:
1. Hacer las métricas **clickeables** para ver el detalle
2. Crear una pantalla **"Pagos y cuotas"** donde registras los pagos
3. Filtrar "Por firmar" al dar clickHago las métricas clickeables:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ahora añado `ScreenPagos` y actualizo `ScreenContracts` para aceptar el filtro inicial:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

Ahora añado CSS para los nuevos componentes (filter-chip, metric-pago, file-drop, metric-link):

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Cambios:

**Métricas clickeables en el dashboard:**
- "Por firmar (7)" → Contratos filtrado por status "Por firmar"
- "Cuotas vencidas (2)" → Pagos filtrado por "Vencidas"
- "Monto contratado" → Pagos
- El texto del saludo también es clickeable

**Nueva pantalla "Pagos y cuotas"** (sustituye "Cronogramas" en el sidebar):
- Resumen de tarjetas: Vencidas / Próximas / Cobradas del mes (con bordes de color semántico)
- Filtros tipo chip: Todas · Vencidas · Próximas · Pagadas (con contador)
- Búsqueda por cliente/código/DNI
- Tabla con código, cliente, cuota, fecha vencimiento, días de mora, monto, estado
- Botón **"Registrar pago"** en cada fila vencida/pendiente

**Modal de registro de pago:**
- Muestra datos de la cuota seleccionada
- Aviso rojo si hay mora ("hace X días — aplica penalidad")
- Campos: fecha, monto (detecta diferencias), método (BCP/BBVA/Yape/etc), N° operación, foto del voucher
- Al guardar, la cuota cambia a "Pagado" con su N° de operación visible

## User

Verifier agent check completed

## Assistant

Verificado ✓

## User

HAZ QUE TODO FUNCIONE

## Assistant

_[tool: update_todos]_

Voy a hacer funcionales todos los botones y pantallas pendientes. Lista grande pero contenida:

_[tool: write_file]_

Ahora actualizo index.html para usar las nuevas pantallas, conectar campana de notificaciones y la búsqueda Cmd+K:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ahora añado todo el CSS para los nuevos componentes:

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Listo. Ahora todo funciona:

**Topbar (esquina superior derecha):**
- 🔍 **Búsqueda global** (Cmd/Ctrl+K) — overlay con búsqueda en contratos y clientes + accesos rápidos
- 🔔 **Campana** — dropdown con 5 notificaciones reales, cada una navega al detalle
- ↻ **Refresh** — toast "Datos actualizados"

**Métricas del dashboard ahora navegan:**
- "Por firmar" → Contratos filtrado
- "Cuotas vencidas" → Pagos filtrado
- "Monto contratado" → Pagos

**Clientes:**
- Botón "Nuevo cliente" → modal con formulario (nombres, DNI, estado civil, teléfono, etc.)
- Click en fila → drawer lateral con detalle + lista de contratos

**Inmuebles:**
- 3 tarjetas resumen (Disponibles / Reservados / Vendidos) clickeables como filtro
- Chips de filtro por estado
- "Nuevo inmueble" → modal
- Click en card → detalle

**Asesores:**
- "Invitar asesor" → modal con nombre, correo y rol

**Ajustes (5 tabs):**
- **Mi perfil** — datos del usuario, persiste en localStorage
- **Empresa** — reutiliza el EmpresaEditor existente
- **Apariencia** — 7 colores de marca + tema claro/oscuro
- **Notificaciones** — 6 preferencias con toggles funcionales (persisten)
- **Integraciones** — SUNARP, RENIEC, WhatsApp, BCP, Slack, firma digital

## User

Verifier agent check completed

## Assistant

Verificado ✓ — toda la funcionalidad de los botones y pantallas operativa.

## User

Quiero incluir un cotizador para un plano: 
https://claude.ai/design/p/019e22bd-0f74-75fa-9c4c-4f649c068ea9?file=Visor+de+Planos.html

Pero siguiendo el mismo concepto

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: copy_files]_

Voy a integrar el visor de planos + cotizador siguiendo el estilo Mattika (purple/blue, Geist, white). Lo conectaré con el flujo de venta — al seleccionar un lote disponible y dar click en "Generar venta" se abre el wizard pre-llenado:

_[tool: write_file]_

Ahora añado el script, la nav, la ruta, y actualizo `startNew` para aceptar datos iniciales:

_[tool: str_replace_edit]_

Ahora actualizo el wizard para que use `initialData` cuando viene del cotizador:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ahora añado el CSS del visor de planos + cotizador:

_[tool: str_replace_edit]_

_[tool: image_metadata]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Agregué el **Plano del proyecto** integrado al sistema Mattika:

**Visor de planos:**
- Plano de Nápoles con todos los lotes superpuestos (~150+ lotes por manzana)
- Cada lote pinta su estado: **Disponible** (azul), **Apartado** (ámbar), **Vendido** (gris), **No disponible** (oscuro)
- Pan con click+drag, zoom con scroll o controles ±, tooltip al hover con superficie/precio/estado
- Búsqueda y filtros tipo chip con contadores en vivo (X disponibles, etc.)

**Cotizador lateral (estilo Mattika, no Lumina):**
- Datos del lote: superficie, frente, fondo, orientación
- Precio total grande + S/ por m²
- Toggle **Contado** (con descuento por pronto pago 5%) vs **Financiamiento**
- Sliders: cuota inicial 10–50%, plazo 12/24/36/48/60 meses, tasa anual 0–18%
- Panel negro destacado con **cuota mensual estimada**
- Desglose: inicial, saldo a financiar, intereses, total

**Integración con flujo de venta:**
- Botón **"Generar venta del lote"** → abre el wizard pre-rellenado con:
  - Inmueble: manzana, número, área del lote
  - Términos: precio, cuota inicial, número de cuotas, fechas
- El asesor solo completa los datos del comprador y genera los 6 documentos

**Adicional:**
- Cotización descargable como PDF
- Envío por WhatsApp

## User

Verifier agent check completed

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Arreglado el grid del visor — el `.plano-layout` necesitaba `grid-template-rows: 1fr` para que la altura se propagara correctamente. Ahora el plano debería renderizar a tamaño completo.

## User

Verifier agent check completed

## Assistant

Verificado ✓ — el visor de planos + cotizador funciona correctamente integrado al sistema.

