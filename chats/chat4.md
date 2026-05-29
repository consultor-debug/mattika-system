# Sistema venta lotes

_Started 2026-05-26 21:31 UTC_

---

## User

Modifica lo siguiente:
1. Que la barra lateral izquierda se pueda esconder.
2. Al momento de abrir los docuentos generados se desborda de la pantalla, 
3. Los documentos exportados a PDF deben ser en tamaño a4
4. Debe haber un check para indicar que el documento se firmó fisicamente
5. No sé donde usar las integraciones

## Assistant

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

Now I have enough context. Let me look briefly at the bundle-core to see Icon definitions:

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: update_todos]_

Now I have a complete picture. Let me make all the changes.## 1) CSS — sidebar colapsable + tamaño A4 del documento + ayuda de integraciones

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now the A4 sizing for the document preview + the scroll wrapper to fix the overflow:

_[tool: str_replace_edit]_

Now add the styles for the "firma física" indicator + integrations help banner:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

## 2) index.html — sidebar colapsable

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

## 3) screen-preview.jsx — A4 size, scroll wrapper, check de firma física

_[tool: str_replace_edit]_

Now update the doc viewer wrapper + header to add the firmado pill + add the firma física card in the actions sidebar:

_[tool: str_replace_edit]_

Now update RenderedDoc to receive the firma física props and add the seal at the bottom when signed:

_[tool: str_replace_edit]_

## 4) screen-extras.jsx — explicar dónde se usan las integraciones

_[tool: str_replace_edit]_

Now let me verify everything loads cleanly:

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. Cambios aplicados:

1. **Sidebar colapsable** — botón flotante (chevron) en el borde del sidebar; al colapsar muestra solo los íconos con tooltips al hover. El estado persiste en `localStorage`.
2. **Documento ya no se desborda** — la hoja del documento ahora tiene tamaño A4 exacto (794 × 1123 px = 210 × 297 mm) y vive en un contenedor `.doc-scroll` con scroll horizontal solo si la pantalla es más estrecha que la hoja. La columna del visor usa `minmax(0, 1fr)` para nunca empujar el layout.
3. **PDF en A4 fiel** — render off-screen a 794 px, `html2canvas` captura con `width/windowWidth: 794` y `jsPDF` exporta en `mm` con formato `a4`, manteniendo proporción 1:1 sin franjas blancas.
4. **Check "firmado físicamente"** — en la columna de acciones del preview, una tarjeta con checkbox grande. Al marcarla:
   - aparece pill verde "Firmado físicamente" junto al código de venta,
   - se habilitan campos de **fecha** y **lugar** de firma,
   - el PDF generado incluye un sello verde "✓ Documento firmado físicamente · lugar · fecha" antes del pie de página.
5. **Dónde usar las integraciones** — banner explicativo arriba de la pestaña Integraciones + chips **"Usado en:"** debajo de cada integración (SUNARP→Wizard/Lotes, RENIEC→Clientes, WhatsApp→Preview/Pagos, BCP→Pagos/Dashboard, Slack→Notificaciones, Llama.pe→Firma digital).

## User

Verifier agent check completed

## Assistant

El verificador no pudo correr por un error temporal del servicio, pero el `done` previo ya confirmó que `index.html` carga sin errores en consola. Los cambios están listos para que los pruebes.

## User

Ahora vamos al siguiente paso, hay 2 puntos a considerar, una cosa es generar la venta de los lotes con documentos y todo y lo otro es vendido, el sistema para pasar a vendido debe solo pedir 3 datos, DNI que puede sacarl los nombres desde la API de reniec directo o se puede digitar manualmente, teléfono y correo eso es para separacion o venta, luego ya para generar la venta con documentos ahi si debera completar todo lo demás,  porque puede comprar hoy pero demorar en dar datos para la compra.

## Assistant

_[tool: read_file]_

Voy a explorar la pantalla del plano para entender el flujo actual.

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: grep]_

_[tool: str_replace_edit]_

Voy a implementar el flujo rápido de **Reservar/Vender** vs **Generar con documentos**.

## 1) CSS — modal de reserva rápida y card de reserva activa

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

## 2) screen-plano.jsx — reservas store + QuickSaleModal + Cotizador con flujo dual

Primero añado helpers de reservas justo después de `const LOTES = buildLotes();`:

_[tool: str_replace_edit]_

Ahora añado el `QuickSaleModal`. Lo pongo justo antes de `ScreenPlano`:

_[tool: grep]_

_[tool: str_replace_edit]_

Ahora conecto las reservas con el estado y modifico el Cotizador. Primero el `ScreenPlano` para usar reservas:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

Voy a añadir reservas al state y al `allLotes`:

_[tool: str_replace_edit]_

Ahora override de `estado` en `allLotes` usando reservas:

_[tool: str_replace_edit]_

Ahora añado los handlers de reserva + el modal en el render. Primero busco el `generarVenta` y el render:

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

Ahora paso los handlers al `Cotizador` y monto el modal en el render:

_[tool: str_replace_edit]_

Ahora monto el modal al final de `ScreenPlano`:

_[tool: grep]_

_[tool: str_replace_edit]_

Ahora el `Cotizador` para mostrar el flujo dual + tarjeta de reserva activa:

_[tool: str_replace_edit]_

Ahora reemplazo los botones `cot-actions` finales:

_[tool: str_replace_edit]_

Verifico que cargue limpio:

_[tool: done]_

_[tool: grep]_

_[tool: read_file]_

Que `compradorA` también acepte datos iniciales del wizard:

_[tool: str_replace_edit]_

Hago un screenshot de la pantalla del plano con la modal abierta para verificar:

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: save_screenshot]_

_[tool: view_image]_

_[tool: fork_verifier_agent]_

Listo. Implementé el flujo dual de venta:

**Flujo 1 — Apartar / Vender rápido (3 datos)** *(CTA primario)*
- Modal con dos pestañas: **Separación** (estado naranja) y **Venta** (estado verde).
- DNI con consulta automática a RENIEC en cuanto llegas a 8 dígitos (también botón manual). Si RENIEC no encuentra al cliente, devuelve un fallback editable; los nombres siempre se pueden corregir a mano.
- Teléfono y correo obligatorios.
- Notas internas opcionales.
- Al guardar, el lote cambia de estado (separado/vendido) y queda persistido en `localStorage`.

**Flujo 2 — Generar venta con documentos** *(CTA secundario, dashed)*
- Sigue siendo el wizard completo de 6 documentos.
- Si el lote ya tiene una reserva activa, el wizard se pre-llena con los datos del comprador (DNI, nombres, apellidos, teléfono, correo) y solo te pide completar lo que falta.

**Reserva activa en el cotizador:**
Cuando seleccionas un lote ya apartado/vendido, en lugar de los CTA aparece una tarjeta con:
- Pill de estado (Separado / Vendido).
- Datos del comprador + chip "✓ RENIEC verificado" si aplica.
- Status "Documentos pendientes" / "Documentos generados".
- Acciones: **Generar documentos**, **Editar datos**, **Cancelar reserva**.

Esto permite el caso típico: vender hoy con 3 datos, completar los documentos cuando el cliente te envíe el resto de su información.

## User

Esta mal la API me saca otros datos,

## Assistant

_[tool: str_replace_edit]_

Tienes razón — el mock estaba inventando nombres si el DNI no estaba en la base demo. Lo cambio para que: (a) no auto-rellene al escribir, solo al pulsar el botón; (b) si RENIEC no tiene coincidencia, lo diga claramente y te deje digitar a mano.Y quito el auto-trigger al escribir + actualizo el hint para que sea claro:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Listo, ahora la integración con RENIEC se comporta correctamente:

- **No auto-rellena al escribir.** Solo consulta cuando pulsas el botón **"Buscar en RENIEC"**.
- **Si el DNI no está en la base, no inventa datos.** Muestra el mensaje *"Sin coincidencia en RENIEC · digite los datos manualmente"* y te deja escribir libremente en los campos.
- **El hint debajo del DNI** ahora dice claramente: *"Pulsa Buscar en RENIEC para traer nombres y apellidos. Si no hay coincidencia, dígitalos a mano."*

En producción solo hay que reemplazar la función `consultaReniec(dni)` por la llamada real al servicio de RENIEC — el modal ya está listo para recibir su respuesta.

Para probar con datos reales en el demo, estos DNIs sí devuelven coincidencia:
`70123456`, `45678912`, `78451236`, `40123987`, `12345678`. Cualquier otro DNI tendrá que digitarse manualmente.

