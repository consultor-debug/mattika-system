# MATTIKA SYSTEM — Handoff: centralización en Postgres

**Para el agente de código.** Objetivo del cliente: que el **código/UI se edite en el proyecto de diseño** (estos archivos `.jsx` + `index.html`, servidos sin build por nginx) y que **los datos sean centralizados en PostgreSQL**, compartidos entre todos los usuarios. Editar aquí → push al repo `consultor-debug/mattika-system` → Dokploy redeploya → sistema en vivo.

> ⚠️ **NO reescribir el frontend en otro framework.** El modelo "editar aquí = actualizar todo" depende de que el frontend siga siendo estos archivos servidos tal cual (Babel en navegador, sin compilación). Descartar consolidar en `sistema-comercial` (Next.js) por esto.

---

## Arquitectura objetivo (2 servicios — DECIDIDO)

```
[ mattika-app: Express sirve FRONTEND + API ]  --->  [ mattika-postgres ]
  (estos .jsx estáticos + rutas /api/)                 (base `mattika`)
```

**Decisión del cliente: fusionar frontend y backend en UN solo servicio.** Se descarta el servicio nginx separado. El servidor Express (`backend/`) debe:
1. Servir los archivos estáticos del frontend (`index.html` + `*.jsx` + `styles.css` + assets) con `express.static` — sin build, tal cual.
2. Exponer la API bajo `/api/…`.

Así se elimina el `nginx.conf`, el proxy `/api/` y la IP hardcodeada (fuente de errores menos). Sigue funcionando "editar aquí → deploy": Express entrega los `.jsx` sin compilar.

- **App (Express)**: `backend/` extendido para servir estáticos + API. Puerto 3001 (o 80). Servicio EasyPanel `mattika-app`.
- **DB**: Postgres ya creado — servicio `mattika-postgres`, base `mattika`. Host interno `mattika_mattika-postgres:5432`.

### Escalado de usuarios
Agregar/quitar vendedores = filas en la tabla `usuarios` (schema ya multi-tenant). NO requiere cambios de infra. Si sube la carga, escalar el servicio `mattika-app` (más CPU/RAM o réplicas) sin tocar la arquitectura.

---

## Estado actual (lo importante)

El frontend guarda **casi todo en `localStorage`**. El backend Express+Postgres **ya existe** y cubre el núcleo, pero **el frontend actual NO lo usa todavía** (salvo el scaffolding de `apiClient` en `data-store.jsx`, que está sin cablear). Además el frontend actual tiene módulos nuevos que el repo no tiene (Comercial, Reservas, Asesor, ubigeo, semillas de ventas).

### Inventario de datos por módulo

| Módulo / archivo | Claves localStorage | Tabla backend | Ruta API | Estado |
|---|---|---|---|---|
| Auth / empresas / usuarios (`auth.jsx`) | `mattika.empresas.v1`, `mattika.usuarios.v1`, `mattika.sesion.v1` | `empresas`, `usuarios` | `/api/auth`, `/api/usuarios`, `/api/empresas` | Backend listo → **cablear frontend** |
| Empresa/branding (`bundle-core`, `contract-template`) | `mattika.empresa.v1` | `empresas` | `/api/empresas` | Cablear |
| Proyectos/etapas (`screen-proyectos`) | contexto, `mattika.plano-img.*` | `proyectos`, `etapas` | `/api/proyectos` | Cablear (imagen de plano → `etapas.plano_imagen`) |
| Lotes (`screen-lotes-admin`, `screen-plano`) | `mattika.lotes-admin.v1.<scope>`, `...vertices`, `...transparentes`, `...lotesExtra` | `lotes` (tiene `vertices` JSONB) | `/api/lotes` | Cablear; mapear overrides visuales a columnas de `lotes`/`etapas` |
| Reservas / ventas rápidas (`screen-plano`, `data-store`) | `mattika.reservas.v1.<scope>` | `reservas` | `/api/reservas` | Cablear |
| Contratos (`screen-wizard`, `screen-preview`, `data-store`) | `mattika.ventas.<empresa>` | `contratos` (`datos` JSONB) | `/api/contratos` | Cablear |
| Plantillas de contrato (`contract-template`) | pack por empresa | `plantillas` | `/api/plantillas` | Cablear |
| Cuotas / pagos (`screen-pagos`, `data-store`) | `mattika.pagos-estado.v1.<empresa>` | `cuotas` | `/api/cuotas` | Cablear |
| Condiciones comerciales (`screen-condiciones`) | `mattika.condiciones-comerciales.v1.<empresa>` | `condiciones_comerciales` | `/api/condiciones` | Cablear |
| **Comercial (analítica)** (`comercial-engine`, `comercial-tabs-*`, `screen-comercial`) | `napoles_ventas`, `napoles_ejecutivos`, `napoles_escalas`, `napoles_captacion`, `napoles_metas`, `napoles_cierres`, `napoles_retencion`, `napoles_inicialmin`, `napoles_nomina`, `napoles_descpolicy`, `napoles_seedflags`, `napoles_leadshoy`, `napoles_lider` | **NINGUNA** | **NINGUNA** | ❌ **FALTA todo: tablas + rutas + cableado.** Es el mayor hueco. |
| Correo / SMTP (`screen-correo`) | config SMTP + outbox por empresa | **NINGUNA** | **NINGUNA** | ❌ Falta tabla + ruta (o integrar `lib/mail`) |

### Debe quedarse en localStorage (preferencias de UI, NO datos)
`mattika.sidebar.collapsed`, `mattika.nav.sections`, `mattika.descarga.formato`, `mattika.last-login.v1`. No migrar.

---

## Trabajo requerido (en orden)

1. **Sincronizar frontend**: reemplazar el frontend del repo por el estado ACTUAL de este proyecto (incluye módulos nuevos), **conservando** `backend/`. Ya NO se usa el `Dockerfile` raíz (nginx) ni `project/nginx.conf` — se eliminan al fusionar (ver paso 6).
2. **Extender el backend para Comercial**: crear tablas para ventas-analítica, ejecutivos, escalas de comisión, metas, captación/ads, nómina y políticas (descuento/retención/líder); agregar sus rutas REST. Este módulo hoy no tiene backend.
3. **Tabla + ruta de Correo** (SMTP config + outbox), o integrar con `src/lib/mail`.
4. **Cablear localStorage → API** en todos los módulos de la tabla marcados "Cablear", usando el `apiClient`/`MATTIKA_API` ya presente en `data-store.jsx`. Mantener las preferencias de UI en localStorage.
5. **Migración de scope**: el frontend usa un `scope` string `empresa.proyecto.etapa` como clave. Mapear a los FKs `empresa_id/proyecto_id/etapa_id` del schema.
6. **Fusionar en 1 servidor**: hacer que Express (`backend/src/index.js`) sirva también los archivos estáticos del frontend con `express.static` (apuntando a la carpeta con `index.html` + `*.jsx` + `styles.css`), además de la API `/api/`. Eliminar el servicio nginx, el `Dockerfile` raíz y `project/nginx.conf` (ya no hay proxy ni IP hardcodeada). El `backend/Dockerfile` pasa a construir el único servicio `mattika-app`.
   - Env: `DATABASE_URL=postgresql://postgres:<pass>@mattika_mattika-postgres:5432/mattika`, `JWT_SECRET`, `PORT` (80 o 3001).
   - Correr `schema.sql` (y `seed.js` una vez) al desplegar.
7. **Auto-deploy**: conectar el repo `mattika-system` en EasyPanel con redeploy automático en cada push a `main`.

---

## Pipeline final (lo que el cliente hará a diario)

```
Edita .jsx aquí  →  push a mattika-system  →  EasyPanel redeploya mattika-app  →  live
```
La DB no se toca en cambios de UI. El código servidor solo se toca cuando se agregan campos/tablas nuevas (pasos 2–5). Agregar usuarios = filas en `usuarios`, sin tocar nada.

---

## Notas
- **Modo de actualización (CONFIRMADO por el cliente):** centralizado + **al recargar/entrar se ve lo último**. NO se requiere push en vivo (nada de SSE/websockets/Realtime). Basta con que cada pantalla lea de la API al montar y vuelva a leer tras guardar. Esto simplifica mucho el paso 4.
- El `schema.sql` existente es multi-tenant y está bien indexado — es una buena base; solo faltan las tablas del módulo Comercial y Correo.
- Los fixes de UI/lógica hechos en el proyecto de diseño (concordancia `{{#uno}}/{{#dos}}` del contrato, crash de Comercial por periodo vacío) ya están en estos `.jsx`; llegan solos al sincronizar el frontend (paso 1).
