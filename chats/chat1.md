# Sistema Generador Contratos

_Started 2026-05-24 22:00 UTC_

---

## User

quiero que me ayudes a crear un sistema que me permita tener control de la creación de documentos ejemplo normalmente yo lo que hago son contratos contratos Y separaciones entonces cuál es la idea que el asesor ingrese bajo esta plataforma ingrese datos como número de dni nombres completos dirección provincia valor del terreno metros cuadrados y todo lo demás y de eso puede coger una plantilla para generar un documento PDF que sea el contrato y además que cree el cronograma de pagos

## Assistant

_[tool: list_files]_

_[tool: questions_v2]_

## User

Questions answered:
- contexto_negocio: Bienes raíces (casas/departamentos)
- pais: Perú
- tipos_documento: Contrato de promesa de compraventa, Acta de separación / reserva, Cronograma de pagos, Carta de desistimiento
- flujo_principal: Decide por mí (yo te propongo el mejor)
- dashboard: Sí — lista de contratos recientes, métricas, accesos rápidos
- campos_terreno: Yo tengo un contrato ya modelo, habria que adaptar ese, lo que si es importante es que hay compra de 1 solo titular, con copropietarios, con conyugue, con separación de bienes y se incluye el nmro de partida. 
- plantillas: Una sola
- cronograma_logica: Sin intereses, Entrada/inicial + cuotas mensuales iguales
- asesores: Sí — cada asesor ve solo lo suyo + admin ve todo
- variaciones: Decide por mí
- estilo_visual: Profesional/corporativo (azul, blanco, formal)
- marca: Mattika System
- tweaks: Color de marca, Modo claro/oscuro
- salida_pdf: Estilo notarial clásico (Times, párrafos largos)
- extras: firma digital, envío por WhatsApp, exportar a Excel, etc.

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

Voy a construir el sistema. Empezaré por la estructura base, el design system de Mattika, y luego construyo pantalla por pantalla.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: list_files]_

_[tool: done]_

Files exist — likely a transient load issue. Let me retry.

_[tool: run_script]_

Babel-standalone is choking on too many parallel script fetches. Let me consolidate into fewer files.

_[tool: str_replace_edit]_

_[tool: delete_file]_

_[tool: done]_

_[tool: read_file]_

_[tool: run_script]_

Let me inline `app.jsx` directly into the HTML to bypass the fetch issue.

_[tool: delete_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. **Mattika System** está corriendo.

**Lo que construí:**

- **Dashboard** — métricas (contratos del mes, por firmar, monto contratado en S/, cuotas vencidas), accesos rápidos a los 4 tipos de documento, lista de contratos recientes, próximas cuotas y ranking de asesores.
- **Asistente "Nuevo documento"** — wizard de 6 pasos: tipo de documento → titularidad (titular único / copropietarios / sociedad conyugal / separación de bienes) → datos del comprador (dinámico, formularios adicionales para cónyuge o copropietario) → inmueble (con N° de partida SUNARP, linderos, distrito/provincia/departamento) → términos económicos + cronograma calculado en vivo → revisión.
- **Vista del documento generado** — render estilo notarial clásico (EB Garamond, párrafos justificados, valores en azul marcados como `<span class="fill">`), con anexo del cronograma. Panel lateral con **Descargar PDF, Firma digital, Enviar por WhatsApp** (con modal de mensaje pre-escrito), **Exportar Excel** e Imprimir.
- **Pantallas auxiliares** — Contratos (lista filtrable), Clientes, Inmuebles (cards de inventario), Plantillas, Asesores.

**Tweaks activos** (esquina inferior derecha al activar el toggle): color de marca (6 opciones) + modo oscuro.

**Notas:**
- Toda la moneda en S/ (PEN), DNI a 8 dígitos, departamentos del Perú, número en letras para "SETECIENTOS… CON 00/100 SOLES".
- El cronograma se recalcula automáticamente al cambiar precio/inicial/cuotas/fecha.

**Siguientes pasos sugeridos:**
1. Pásame tu contrato modelo real para reemplazar el texto del documento.
2. Si quieres, agrego registro de pagos (marcar cuotas como pagadas, generar recibos).
3. Agregar login/permisos diferenciados asesor vs. admin como pantallas reales.

## User

Este es el contrato para persona natural, solo 1 , lo unico que va a cambiar son los datos del comprador

## Assistant

_[tool: run_script]_

_[tool: read_file]_

_[tool: update_todos]_

Entiendo. Vamos a adaptar el sistema a tu contrato real (TERRENOPOLIS / Nápoles Condominio Club, persona natural, cuotas flexibles).

_[tool: read_file]_

Voy a actualizar todo el sistema para reflejar tu contrato real. Empezaré por la lógica de datos y la vista del documento.

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now update the Términos step to support custom cuotas:

_[tool: str_replace_edit]_

_[tool: write_file]_

Now the big change — rewrite the contract preview with the exact Terrenopolis text:

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. **Sistema adaptado a tu contrato real.**

**Cambios principales:**

1. **Vendedor configurado:** `TERRENOPOLIS S.A.C.` (RUC 20610745696, representante César Francisco Leyton Aponte) — datos fijos del contrato.

2. **Proyecto por defecto:** Nápoles Condominio Club, predio Valle Chicama Mocan, distrito Razuri, Ascope, La Libertad, Partida Electrónica 11550511.

3. **Contrato con texto exacto del modelo:**
   - Título: *"CONTRATO DE COMPRAVENTA DE BIEN FUTURO – PROYECTO NÁPOLES CONDOMINIO CLUB"*
   - Las 21 cláusulas (Primera → Vigésima Primera) tal como están en tu DOCX, en MAYÚSCULAS, párrafos justificados con tipografía notarial (EB Garamond).
   - Tabla de cronograma **inline dentro del contrato** (no como anexo separado), con el formato exacto: N° CUOTAS / MONTO A DEPOSITAR / FECHAS DE PAGO.
   - Variables rellenadas resaltadas en azul: nombre del comprador, DNI, domicilio, teléfono, correo, lote, manzana, área, precio, montos en letras, fechas y banco.

4. **Cronograma con dos modos:**
   - **Personalizadas** (default) — el asesor edita monto y fecha de cada cuota individualmente. Muestra un indicador "Cuadra con el saldo" / "Diferencia: S/ X" si los montos no suman.
   - **Iguales mensuales** — cálculo automático cuando aplica.
   - Defaults: 3 cuotas (S/2000, S/2000, saldo) como en tu modelo.

5. **Campos económicos actualizados:**
   - Penalidad por día (S/30 default, no porcentaje)
   - Lucro cesante en resolución (30%)
   - Fecha de entrega del lote ("12.2027")
   - N° operación / voucher
   - Cuenta BCP 570-7307941059 a nombre de Terrenopolis S.A.C.

6. **Cliente único** (persona natural) — toda la redacción en singular ("EL COMPRADOR"). Las opciones de copropietarios/cónyuge siguen disponibles para futuro.

**Para probar:** click "Nuevo" → llena el comprador (todo lo demás viene precargado) → "Generar documento" para ver el contrato listo.

**Siguiente:** ¿quieres que agregue una pantalla de **Ajustes** donde puedas editar los datos de la empresa vendedora (TERRENOPOLIS) y agregar más proyectos además de Nápoles? También puedo agregar el **registro de pagos** (marcar cuotas como pagadas) cuando estés listo.

## User

No me deja generar el contrato , no lo descarga incluyelo , a parte hay una parte para poder tener control del contenido, por ejemplo mi función admi me permite modicicar ?

## Assistant

_[tool: str_replace_edit]_

Voy a arreglar dos cosas: (1) la descarga real del PDF y (2) un editor de plantilla para admin.

_[tool: str_replace_edit]_

## Assistant

_[tool: str_replace_edit]_

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: write_file]_

## Assistant

_[tool: str_replace_edit]_

Now add a print stylesheet so the print button outputs just the document:

_[tool: write_file]_

Ahora el editor de plantilla. Voy a hacer el contrato data-driven para que el admin pueda editar el contenido.

_[tool: str_replace_edit]_

Now refactor DocCompraventa to render from the template:

_[tool: str_replace_edit]_

_[tool: write_file]_

Now the admin template editor screen:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. **Dos cambios grandes:**

### 1. Descarga real de PDF
- El botón **"Descargar PDF"** ahora genera un PDF de verdad (vía html2pdf). Nombre del archivo: `Contrato-{Apellidos}-{Lote}-Mz{Manzana}.pdf`. Mientras genera, muestra "Generando...".
- También agregué **"Imprimir"** con un stylesheet específico para impresión que oculta toda la interfaz y deja solo el documento — útil si prefieres Ctrl+P → "Guardar como PDF" del navegador.

### 2. Editor de plantilla (admin)
Nueva entrada **"Plantilla"** en el sidebar (sección Configuración). El contrato ya no es JSX hard-codeado — es **data editable**. El admin puede:

- **Tab "Encabezado":** editar título y subtítulo del contrato.
- **Tab "Cláusulas":** editar el texto de cada uno de los ~30 bloques (intro, antecedentes, las 21 cláusulas, listas A-D, cierre). Puede:
  - Modificar el texto en una textarea.
  - **Reordenar** bloques (subir/bajar).
  - **Insertar** nuevos bloques (párrafo / encabezado / lista) entre cualquier par.
  - **Eliminar** bloques que no aplican.
  - Marcar sangría para sub-puntos.
- **Tab "Variables":** lista de las ~30 variables disponibles (`{comprador.nombre}`, `{precio}`, `{precioLetras}`, `{inmueble.partida}`, etc.). Click sobre cualquiera la copia al portapapeles.
- **Tab "Empresa vendedora":** editar razón social, RUC, domicilio, representante, partida jurídica, banco — y se guarda permanentemente, aplicándose a todos los contratos futuros.
- **"Ver previa"** muestra un panel lateral con mini-preview del contrato usando datos de ejemplo, para validar los cambios antes de guardar.
- **"Restaurar"** vuelve a la plantilla original (texto exacto del DOCX).
- Todo se persiste en localStorage.

### Notas
- Bloques **"Cronograma (auto)"** y **"Firmas (auto)"** no son editables — se generan automáticamente con los datos de cada contrato.
- Soporta etiquetas simples HTML: `<b>...</b>`, `<br/>`.
- El indicador "Cambios sin guardar" aparece en cuanto editas algo.

¿Quieres que también agregue: registro de pagos (marcar cuotas como pagadas), o múltiples plantillas (ej. una para venta directa y otra para promesa)?

## User

Verifier agent check completed

## Assistant

_[tool: run_script]_

_[tool: delete_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Arreglado. `screen-template-editor.jsx` ahora vive dentro de `contract-template.jsx` (mismo problema de fetch paralelo de babel-standalone — ya tenía el patrón resuelto).

Click "Plantilla" en el sidebar (sección Configuración) para abrir el editor — ya carga sin errores. La descarga de PDF y la generación de contratos siguen funcionando igual.

## User

La idea es importar el archivo y que tome ese de base, siempre es un archivo en word, la idea es declarar las variables.

## Assistant

_[tool: update_todos]_

Entiendo perfectamente. Voy a agregar la opción de **importar el .docx** y luego **declarar las variables** mapeando los valores del ejemplo.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now add the importer UI as a new tab. Let me find and update the editor:

_[tool: str_replace_edit]_

Now write the DocxImporter component:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Listo. **Importar contrato desde Word + declarar variables.**

### Flujo nuevo

**Sidebar → Plantilla → tab "Importar Word"**

**Paso 1 — Subir archivo**
- Drag-and-drop el `.docx` o click para buscar.
- El sistema extrae la estructura del Word: párrafos, encabezados, listas A/B/C, y detecta la tabla del cronograma.
- Detección automática de sangría para sub-puntos ("– ...").

**Paso 2 — Revisar texto extraído**
- Lista de los ~30 bloques leídos del Word, cada uno etiquetado por tipo (`párrafo`, `encabezado`, `lista`, `cronograma`).
- Verifica que se leyó bien antes de continuar.

**Paso 3 — Declarar variables**
Formulario agrupado en 5 secciones (Comprador / Inmueble / Empresa / Precio y pagos / Otros). Para cada campo escribes **el valor que aparece en el ejemplo**:

| Campo | Valor a escribir | Reemplazado por |
|---|---|---|
| Nombre completo | `ROSMERY ROCIO VALDERRAMA TRUJILLO` | `{comprador.nombre}` |
| DNI | `46049117` | `{comprador.dni}` |
| Domicilio | `JR. INDICO 432...` | `{comprador.domicilio}` |
| Precio total | `17,100.00` | `{precio}` |
| Precio en letras | `DIECISIETE MIL CIEN...` | `{precioLetras}` |
| ... | ... | ... |

**Validación visual en vivo:**
- ✅ verde si el texto **se encontró** en el documento
- ❌ rojo si el texto **no aparece** (probablemente con errata)
- Contador "X de 35 declarados" en el top

**Click "Aplicar mapeo y guardar"** → busca cada valor en todos los bloques y lo reemplaza con su placeholder. La nueva plantilla queda activa, lista para usar.

### Importante
- El reemplazo es case-insensitive y ordena por longitud (reemplaza primero los valores largos, evitando conflictos parciales).
- Cualquier valor que no se encuentre exactamente, te lo marca en rojo — debes ajustar la grafía (acentos, espacios) para que coincida con el Word.
- Después puedes ir al tab **"Cláusulas"** para revisar/editar manualmente cualquier bloque antes de usar la plantilla.

Pruébalo subiendo tu archivo `C-7 NAPOLES - MODELO CONTRATO 3 MESES.docx` — debería reconocer las 21 cláusulas + la tabla del cronograma + los 4 puntos A-D de la cláusula CUARTA.

## User

Verifier agent check completed

## Assistant

Listo. El verificador confirmó que el flujo de importación funciona. Pruébalo cuando quieras subiendo tu `.docx` desde **Plantilla → Importar Word**.

## User

Puedes incluir la parte de vista previa ?

## Assistant

_[tool: str_replace_edit]_

Voy a agregar una vista previa en vivo en el paso de mapeo, para que veas cómo va a quedar el contrato.

_[tool: done]_

Listo. **Vista previa en vivo agregada al paso de declarar variables.**

### Cómo se ve ahora

El paso 3 (declarar variables) está en **2 columnas**:

**Izquierda:** el formulario con los grupos (Comprador / Inmueble / Empresa / Precio / Otros).

**Derecha:** una **vista previa en vivo** del contrato — sticky para que la veas mientras llenas el formulario. Va resolviendo el mapeo en tiempo real:

- A medida que escribes un valor (ej. `ROSMERY ROCIO VALDERRAMA TRUJILLO`), ese texto se **resalta en azul** en la vista previa → eso significa "este texto fue identificado como variable".
- El texto sigue legible (usa datos de ejemplo) pero el azul te confirma visualmente qué se va a reemplazar.
- La tabla del cronograma aparece como un placeholder con borde punteado.
- El bloque de firmas también marcado como automático.

**Antes de empezar** se muestra un hint amarillo: *"Empieza declarando una variable arriba — verás el texto convertirse en placeholder y luego resolverse con datos de ejemplo"*.

**Después de aplicar el mapeo**, el editor también ofrece un toggle **"Ver previa"** (top-right del editor de cláusulas) que muestra el contrato completo con la plantilla guardada.

