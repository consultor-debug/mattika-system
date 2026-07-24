# PROMPT PARA CONSTRUIR "MATTIKA SYSTEM" CON CLAUDE

> Copia y pega todo lo que está debajo de la línea en Claude. Está escrito para que
> Claude construya el sistema completo de una sola vez, como una aplicación HTML/React
> funcional. Si Claude pide acortar por longitud, dile: "constrúyelo por módulos, empieza
> por el login y el shell, luego el plano, luego el resto — pero no omitas ninguna función".

---

## ROL Y OBJETIVO

Eres un ingeniero de producto y diseñador senior. Construye **MATTIKA SYSTEM**, el
**sistema operativo de una inmobiliaria peruana**: un solo lugar para **vender lotes,
cobrar cuotas, firmar contratos y llevar el orden comercial y contable**. Su lema es
*"Comercial y contable, en un solo plano."*

Es un producto **multi-empresa (SaaS)**: Mattika es la dueña del software y da acceso a
varias inmobiliarias, cada una con sus propios proyectos, usuarios, condiciones
comerciales y datos completamente aislados.

El flujo central que todo gira alrededor: **abrir el plano del proyecto → clic en un lote
disponible → cotizarlo → apartarlo/venderlo → generar automáticamente los documentos
legales → cobrar las cuotas**, todo con control de permisos por usuario.

Localización: **Perú** — moneda Soles (S/), DNI de 8 dígitos, RENIEC, SUNARP, partidas
registrales, bancos BCP/BBVA/Interbank/Scotiabank, Yape/Plin. Idioma: español.

## STACK Y ARQUITECTURA

- **Aplicación React de una sola página** servida desde `index.html`, con Babel en el
  navegador (sin build step). Sin backend: **todo persiste en `localStorage`**.
- Parte el código en módulos `.jsx` separados cargados por `<script type="text/babel">`.
  Cada módulo expone sus componentes con `Object.assign(window, { ... })` porque cada
  script Babel tiene su propio scope.
- **CRÍTICO**: nunca uses un objeto de estilos llamado `const styles = {}` global —
  nómbralos único por componente (ej. `cotizadorStyles`) o usa estilos inline.
- Tipografía: fuentes limpias tipo Geist / Open Sans para UI y una serif elegante para
  números/títulos destacados. Carga Google Fonts.
- Librerías externas por CDN: **Leaflet** (mapa satelital), **html2pdf** (exportar PDF),
  **SheetJS/XLSX** cargado de forma diferida solo cuando se importa un .xlsx.
- Estética: profesional, densa pero limpia, tipo dashboard SaaS moderno. Color de marca
  configurable (azul `#1E4FD4` por defecto). Soporta **modo claro y oscuro**. Define
  todos los colores como variables CSS (`--brand`, `--ink`, `--muted`, `--surface`,
  `--border`, `--danger`, etc.).

### Concepto clave: el "alcance" (scope)
Cada dato comercial se guarda bajo una llave única **`empresa · proyecto · etapa`**. El
plano, los lotes, las reservas y los precios de la Etapa 2 de un proyecto son
**totalmente independientes** de cualquier otra etapa o empresa. Al cambiar de contexto,
las pantallas dependientes (plano, lotes) se remontan y releen sus propios datos. Expón
un helper `getScopeKey()` que devuelve `empresaId.proyectoId.etapaId`.

---

## MODELO DE DATOS (localStorage)

- **Empresas**: `{ id, nombre, color, creadaEl, activa, proyectos: [...] }`.
  Cada proyecto: `{ id, nombre, ubicacion, descripcion, estado, fechaInicio,
  fechaEntrega, etapas: [...] }`. Cada etapa: `{ id, nombre, estado, lotes, fechaInicio,
  fechaEntrega }`. Estados de proyecto/etapa: `planificacion | preventa | en-obra |
  entregado | pausado`.
- **Usuarios**: `{ id, empresaId, usuario, clave, nombre, rol, activo, permisos }`.
- **Sesión**: `{ tipo: 'empresa'|'master', empresaId, usuarioId, nombre, rol, ... }`.
- **Contexto activo** por empresa: `{ proyectoId, etapaId }` (cada usuario de una empresa
  tiene su propia selección).
- **Reservas** (por scope): mapa `{ loteId: { tipo:'separacion'|'venta', dni, nombres,
  apellidos, telefono, email, fecha, reniecVerificado, documentos } }`.
- **Clientes**, **Estado de pagos**, **Lotes-admin**, **Vértices de polígonos**, **Lotes
  extra dibujados**, **Imágenes de plano**, **Esquinas satélite**, **Config SMTP**,
  **Outbox**, **Condiciones comerciales**, **Plantillas** — todos con sus propias claves.

### Datos demo de arranque
Crea **DOS empresas demo**:
1. **Lumina Grupo Inmobiliario** (azul `#1E4FD4`) → Proyecto **Nápoles** (Valle Chicama,
   Trujillo), 3 etapas: Etapa 1 (entregada), Etapa 2 (en obra), Etapa 3 (preventa).
   Es la **única** empresa que arranca con datos de ejemplo (lotes, contratos, pagos).
2. **Golden Inmobiliaria** (dorado `#B8862A`) → **Villa Club Malabrigo** (frente a playa,
   Rázuri), 2 etapas: Pacífico (preventa) y Marina (planificación). Arranca vacía.

Usuarios demo: Lumina → `admin/lumina2026` (Administrador), `asesor/lumina2026` (Asesor).
Golden → `admin/golden2026`, `gerente/golden2026`. Master interno → empresa "Mattika",
usuario `owner`, clave `mattika2026`.

---

## SISTEMA DE PERMISOS

Cada usuario tiene **capacidades activables por checkbox**. El **rol** solo define los
valores por defecto; cada usuario puede personalizarse (overrides sobre los defaults del
rol). Capacidades:

| key | habilita |
|---|---|
| `vender` | Apartar/vender lotes y generar contratos |
| `ver_pagos` | Consultar cuotas (solo lectura) |
| `registrar_pagos` | Marcar cuotas como pagadas |
| `editar_plano` | Subir planos y editar polígonos |
| `editar_lotes` | Administrar lotes y precios |
| `gestionar_proyectos` | Crear/editar proyectos y etapas |
| `editar_condiciones` | Topes de descuento y aprobadores |
| `gestionar_usuarios` | Crear/editar usuarios del equipo |
| `editar_plantillas` | Modificar minutas de contrato |
| `superusuario` | Panel de superusuario |

Roles: Administrador y Gerente (todo) · SubGerente Comercial / Jefe Comercial / Jefe de
Ventas / Coordinador de Ventas (venden, cobran, editan planos y lotes) · **Asesor**
(vende y consulta pagos, pero NO registra pagos ni edita planos) · **Cobranzas** y
**Contable** (solo ver y registrar pagos). Expón helpers `can(perm)`, `getPermisos()`,
`resolverPermisos(usuario)`. Los ítems del menú y los botones se ocultan/deshabilitan
según los permisos.

---

## PANTALLAS A CONSTRUIR

### 0. LOGIN (`auth.jsx`)
Pantalla a dos columnas: formulario a la izquierda, showcase de marca a la derecha (logo,
lema, 3 features: "Plano interactivo", "Contratos en minutos", "Cobranzas al día").
Formulario: **Empresa** (desplegable de empresas activas + opción "Mattika · Acceso
interno"), **Usuario**, **Clave** (con botón ojo mostrar/ocultar). Botón "Iniciar sesión"
con spinner y delay de ~450ms para simular validación real. Mensajes de error exactos
("No encontramos esa empresa", "Usuario o clave incorrectos", "Esa empresa está
desactivada", etc.). Link "¿No la recuerdas?" → aviso de soporte. Checkbox "Recordar
empresa y usuario" (guarda todo menos la clave). **Tarjetas de credenciales demo** que
autollenan los campos al hacer clic (una por empresa + el acceso Master).

Tres resultados de login: sin sesión → login; sesión empresa → shell normal; sesión
master → **consola Master** (UI distinta, sin el menú normal).

### 1. SHELL (`index.html` / app)
- **Sidebar** con dos grupos ("Principal" y "Configuración"), marca de la empresa arriba
  (con el proyecto activo), botón de colapsar (recordado en localStorage), y tarjeta de
  usuario abajo con dropdown de "Cerrar sesión". Ítems: Dashboard, Plano, Lotes,
  Contratos (con badge), Clientes, Pagos y cuotas | Proyectos y planos, Condiciones
  comerciales, Plantillas, Correo, Usuarios y equipo, Superusuario, Ajustes. Cada ítem
  respeta su permiso.
- **Topbar**: hamburguesa (móvil), migas de pan, buscador que abre **búsqueda global
  (Cmd/Ctrl+K)**, **selector de contexto** (chip para cambiar proyecto/etapa), botón
  refresh, campana de **notificaciones** (dropdown), y botón **"+ Nuevo"** que abre el
  asistente de venta.
- Responsive: en móvil el sidebar es un cajón con backdrop.
- Aplica el color de marca y el tema (claro/oscuro) a las variables CSS.

### 2. DASHBOARD (`screen-dashboard.jsx`)
Saludo por hora ("Buenas tardes, [nombre]"). Resumen con enlaces accionables ("7
contratos por firmar", "cuotas vencidas"). Métricas con **mini-gráficos sparkline**,
accesos rápidos y tabla de **contratos recientes** (clic abre el documento).

### 3. ⭐ PLANO INTERACTIVO + COTIZADOR (`screen-plano.jsx` + `plano-satelite.jsx`)
**La pantalla estrella.** Dos vistas conmutables: **Plano (SVG)** y **Satélite**.

**Vista Plano (SVG):**
- Dibuja todas las manzanas y lotes como **polígonos de colores** según estado:
  Disponible (azul claro), Separado (naranja), Vendido (gris), No disponible/bloqueado
  (azul oscuro). Genera los lotes proceduralmente a partir de definiciones de manzanas
  (posición, columnas, filas, m², precio base/m²) con un PRNG estable para que precios,
  áreas y estados sean consistentes entre recargas.
- **Hover** → tooltip con superficie, precio y estado. **Clic en lote disponible** →
  abre el cotizador. **Rueda** → zoom; **arrastrar** → pan. Controles +/−/% abajo.
- **Filtros**: por estado, rango de m², rango de precio y búsqueda por código.
- Si la etapa no tiene plano → tarjeta "Este proyecto aún no tiene plano" con botón
  "Subir plano" (solo con permiso).
- **Modo edición de polígonos** (permiso `editar_plano`): arrastrar vértices, arrastrar
  el polígono entero, botones "+" en aristas para agregar vértices, doble-clic en vértice
  para eliminar (mínimo 3), y **modo dibujo** para trazar lotes nuevos punto por punto
  (doble-clic cierra el polígono). Persiste overrides de vértices y lotes extra por scope.

**Vista Satélite (`plano-satelite.jsx`):**
- **Mapa satelital real** con **Leaflet + Esri World Imagery** (sin API key) como fondo.
- El plano de ventas se **superpone** y los lotes siguen siendo clicables encima.
- Se **ancla por sus 4 esquinas** a coordenadas geográficas reales mediante una
  **transformación proyectiva (homografía / matrix3d)** — plano y lotes comparten la
  misma transformación así que siempre calzan.
- **Modo alineación**: arrastrar cada esquina sobre el terreno, afinar con lat/lng
  exactos, **rotar y escalar** todo el plano. Guarda las esquinas por scope.
- **Recorta el fondo blanco** del PNG del plano a transparente para que sobre el satélite
  solo se vea el dibujo. Centro por defecto: Valle Chicama, Razuri.

**Cotizador (panel lateral):**
- Ficha del lote: manzana, número, m², frente, fondo, orientación. **Precio total** y
  precio por m².
- Dos modos: **Contado** (descuento pronto pago 5% → "Pagas hoy") y **Financiamiento**
  (simulador: cuota inicial con chips 10/20/30/50%, plazo en meses limitado por
  condiciones, tasa anual con slider → calcula cuota mensual, intereses y total).
- **Sistema de descuentos con 3 niveles de aprobación** (¡importante!):
  1. Tope estándar (según condiciones comerciales por modo).
  2. **Solicitar excepción** → cuenta regresiva → aprueba un tope mayor.
  3. **VB Gerencial** → elige aprobador (Gerente General, etc.), cuenta regresiva, y
     registra quién firmó, su cargo y fecha. Supera cualquier tope.
- Botones: **"Apartar / Vender lote"** (flujo rápido: solo DNI, teléfono, correo — con
  **consulta RENIEC simulada** que autollena el nombre si el DNI está en la base; si no,
  obliga a digitar a mano sin inventar). **"Generar venta con documentos"** → wizard
  completo. **"Descargar cotización (PDF)"** y **"Enviar por correo"**. Si ya está
  reservado: muestra al cliente con opciones generar documentos / editar / cancelar.
- Sin permiso de venta → todo en **solo lectura**.

### 4. ASISTENTE DE VENTA / WIZARD (`screen-wizard.jsx`)
Genera **6 documentos** por venta. 5 pasos con stepper visual:
1. **Titularidad**: titular único / copropietarios / sociedad conyugal / separación de
   bienes (define cuántos compradores y qué cláusulas). Elige **asesor responsable**
   (de los usuarios reales activos de la empresa).
2. **Comprador(es)**: nombres, apellidos, DNI (validado a 8 dígitos), estado civil,
   ocupación, teléfono (+51), email, domicilio. Si copropietarios/cónyuges → 2.º
   comprador + datos del matrimonio o cuotas ideales (%).
3. **Inmueble**: proyecto, tipo, unidad, manzana, **partida registral SUNARP**, área,
   dirección, distrito/provincia/departamento, y **linderos** (norte/sur/este/oeste).
4. **Términos y cronograma**: precio (muestra el % de inicial y la **cifra en letras**),
   inicial, saldo automático, banco/cuenta/N° operación, penalidad diaria por mora, %
   lucro cesante, fecha de entrega. **Cronograma** en dos modos: cuotas iguales mensuales
   o **personalizadas** (tabla editable que valida que la suma cuadre con el saldo;
   muestra "Cuadra" o "Diferencia").
5. **Revisión**: tarjetas-resumen de todo + notas internas. Botón **"Generar 6
   documentos"**.

Implementa `generarCronograma()`, `numeroALetras()` (números a letras en español para
soles) y `calcFinanciamiento()` (cuota francesa).

### 5. VISTA PREVIA DE DOCUMENTOS (`screen-preview.jsx` + `contract-template.jsx`)
- Renderiza el **paquete de documentos** generados, con sidebar de tabs para alternar
  entre ellos.
- **Plantillas POR EMPRESA**: cada empresa tiene su propio modelo de contrato, guardado en
  `mattika.template.v4.<empresaId>` (migra la clave global antigua la primera vez). El
  editor de Plantillas muestra el nombre de la empresa, permite nombrar/versionar el
  modelo, editar los 6 documentos base y **agregar/eliminar documentos propios**
  (`tpl.extraDocs`). La lista efectiva la da `docTypesForPack(tpl)` y se usa en todo el
  sistema (tabs, descargas, conteos).
- Las plantillas son **documentos legales reales** de compraventa de bien futuro peruana,
  con todas las cláusulas (reserva de dominio Art. 1583° CC, bien futuro Art. 1534° CC,
  penalidad de mora, lucro cesante, saneamiento por evicción, entrega, condición
  suspensiva, etc.). Escribe el texto completo y serio, no relleno.
- **Mini-lenguaje de marcado** para las plantillas: `{variable}` se rellena con datos del
  cliente/inmueble/empresa, `## TÍTULO` = sección, `> texto` = sangría, `- item` = lista,
  `[CRONOGRAMA]` = inserta la tabla de pagos, `[FIRMA]` = bloque de firmas, `<b>` =
  negrita. Doble salto de línea = nuevo párrafo.
- **Generación de PDF real con html2pdf**: descarga individual o **"todos en PDF"**
  (proceso por lotes con barra de progreso).
- **Registro de firma física**: marca lugar y fecha, estampa un sello verde "✓ Documento
  firmado físicamente" en el documento.
- Envío por **WhatsApp** y por correo.
- Documentos base: Separación, Contrato de Compraventa, Cronograma de Pagos, Acta de
  Separación, Tratamiento de Datos Personales, Declaración Jurada de Domicilio y Estado
  Civil. Son **6 base**, pero cada empresa puede agregar documentos propios desde
  Plantillas (ver §5), así que el conteo es **dinámico** (`docTypesForPack`): la lista de
  tabs, descargas y los textos "N documentos" leen el modelo de la empresa activa.

### 6. CONTRATOS (lista)
Tabla de todos los documentos generados, con filtros por tipo y estado, y buscador. Clic
en fila abre el documento. Estados con pills de color: Firmado, Por firmar, Borrador,
Separación, Vencido, Desistido.

### 7. PAGOS Y CUOTAS (`screen-pagos.jsx`)
Cronograma **consolidado de todos los contratos**. Tres métricas arriba: Vencidas (rojo),
Próximas (ámbar), Cobradas del mes (verde), con montos. Filtros (Todas/Vencidas/
Próximas/Pagadas con contador) + buscador. Tabla con cada cuota (contrato, cliente, N°,
vencimiento con "hace X días" si vencida, monto, estado). Botón **"Registrar pago"** (solo
permiso `registrar_pagos`) → modal con fecha, monto, método (Depósito BCP/BBVA/Interbank,
Transferencia, Yape/Plin, Efectivo), **N° de operación obligatorio**, adjuntar
comprobante. Avisa penalidad de mora si está vencida. Sin permiso → "Solo lectura".

### 8. ADMINISTRADOR DE LOTES (`screen-lotes-admin.jsx` + modales)
Inventario en tabla con **edición inline** celda por celda (precio, estado, tipología) y
**importación Excel/CSV** con wizard de 5 pasos: subir archivo → parsear (parser CSV
propio sin libs; SheetJS diferido para .xlsx) → **mapeo automático de columnas** (adivina
por nombre de cabecera) → preview de cambios → confirmar. Modales de nuevo lote y
confirmar eliminación. Selección múltiple.

### 9. PROYECTOS Y ETAPAS (`screen-proyectos.jsx`)
Gestiona proyectos y etapas de la empresa (estado, N° de lotes, fechas). **Sube la imagen
del plano de cada etapa** (reescala/comprime con canvas para que quepa en localStorage).
Incluye el **ContextoSwitcher** del topbar que decide el proyecto/etapa activo.

### 10. CONDICIONES COMERCIALES (`screen-condiciones.jsx`)
Panel admin (permiso `editar_condiciones`) que define el **motor de descuentos** del
cotizador: topes de descuento (contado y financiamiento), tope de excepción, plazo
máximo, tasa por defecto, tiempos de las cuentas regresivas de aprobación, y **lista de
aprobadores** para el VB gerencial.

### 11. CORREO (`screen-correo.jsx`)
Doble función: (1) **config SMTP** (servidor, puerto, credenciales, TLS) con prueba de
conexión simulada; (2) **bandeja de enviados** — cada cotización/contrato/recordatorio
que el sistema "envía" se registra aquí. Expón `window.enviarCorreo({...})` como único
punto a reemplazar cuando exista backend. Modal de componer correo. NO hace SMTP real.

### 12. USUARIOS Y EQUIPO + CLIENTES + INMUEBLES + AJUSTES (`screen-extras.jsx`)
- **Usuarios y equipo**: lista del equipo real de la empresa con roles y estado.
- **Clientes**: CRUD que se **deriva automáticamente de las reservas** (ver data-store).
- **Inmuebles**: inventario por proyecto/etapa.
- **Ajustes**: tabs de perfil, empresa y apariencia (modo oscuro, color de marca).
- **Notificaciones** (dropdown de la campana) y **búsqueda global (Cmd+K)**.

### 13. SUPERUSUARIO (`screen-admin-hub.jsx`)
Hub con hero de estadísticas y tarjetas de herramientas: Administrador de Lotes,
Condiciones Comerciales, Usuarios y Roles, Plantillas de Contrato, Proyectos y Etapas,
**Auditoría** (historial de cambios de precio), **Integraciones** (BCP, WhatsApp Business,
SUNAT, notarías), **Respaldos** (backup/restore). **"Zona crítica"** con restablecer datos
a valores de fábrica.

### 14. CONSOLA MASTER (`auth.jsx` → ScreenMattikaAdmin)
Solo para el login `owner`. UI propia (sin el menú normal). Estadísticas globales
(empresas, activas, usuarios). Dos tabs: **Empresas** (crear/editar/desactivar/eliminar,
con color de marca y su primer proyecto + Etapa 1) y **Usuarios** (crear/editar, generador
de claves seguras, editor de permisos por checkboxes, filtro por empresa).

---

## CAPA QUE UNIFICA TODO (`data-store.jsx`)
Conecta el ciclo comercial: **Reserva → Cliente → Cronograma de pagos**.
- `deriveClientes(empresaId)`: la lista de clientes = registrados manualmente + compradores
  de **reservas reales**, fusionados por DNI, con sus operaciones (lotes apartados/vendidos).
- `deriveCuotasFromReservas(empresaId)`: genera el cronograma de cuotas de las **ventas
  reales** (inicial 20%, 36 meses, tasa de las condiciones comerciales). Cada cuota marca
  estado vencida/pendiente/pagada según la fecha y el estado de pago guardado.
- `getAsesoresEmpresa(empresaId)`: equipo comercial real (usuarios activos) para los
  selects de "asesor responsable".

---

## TWEAKS / PERSONALIZACIÓN
Panel de tweaks con: **color de marca** (6 opciones) y **modo oscuro** (toggle). Aplica a
las variables CSS en vivo.

---

## CALIDAD Y DETALLES
- Toda la data demo debe sentirse real: nombres peruanos, DNIs, direcciones de Trujillo,
  partidas registrales, montos en soles coherentes.
- Formato de soles con `Intl.NumberFormat('es-PE')`. Fechas en español.
- Persiste todo en localStorage; al cambiar de proyecto/etapa, remonta las pantallas
  dependientes (usa una `key` derivada del scope).
- Maneja con cuidado la regla de hooks de React (hooks antes de cualquier return temprano).
- Iconografía: set propio de iconos SVG inline de un solo estilo de trazo (no emojis).
- Accesible y responsive. Hit targets ≥ 44px. Texto legible.
- No uses placeholders de "lorem ipsum": escribe copy real en español de negocio
  inmobiliario.

## ENTREGA
Construye TODO el sistema funcional. Empieza por login + shell + plano + cotizador
(el flujo estrella), luego wizard + preview + pagos, luego el resto de pantallas de
configuración y la consola Master. No omitas la vista satélite ni la generación de PDF.
Al terminar, deja las credenciales demo visibles en el login para poder probar de
inmediato.
