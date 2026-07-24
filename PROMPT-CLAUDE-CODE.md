# PROMPT PARA CLAUDE CODE — MATTIKA SYSTEM (centralización + auto-deploy)

Copia y pega TODO este archivo como primer mensaje en Claude Code, con el repo `consultor-debug/mattika-system` abierto.

---

## CONTEXTO

Eres un agente de código trabajando sobre el repo `consultor-debug/mattika-system`. Este es un CRM inmobiliario (proyecto "Nápoles"). El **frontend** son archivos servidos SIN build (HTML + JSX transpilado por Babel en el navegador): `index.html` + `*.jsx` + `styles.css`. NO lo reescribas en otro framework ni le agregues bundler — su gracia es que se edita en una herramienta de diseño y se despliega tal cual.

El **objetivo del dueño**: datos centralizados en PostgreSQL, que TODOS los usuarios ven igual **al recargar** (no se requiere tiempo real / push en vivo). El dueño edita el frontend en otra herramienta y hace push aquí; tú te encargas de backend, base de datos y deploy.

Lee `HANDOFF-CENTRALIZACION.md` en la raíz del repo: tiene el inventario completo de datos por módulo, tablas existentes vs. faltantes, y el orden de trabajo. Este prompt lo resume y te da las órdenes concretas.

## ARQUITECTURA OBJETIVO (2 servicios, DECIDIDO)

```
[ mattika-app: Express sirve FRONTEND estático + API /api/ ]  --->  [ mattika-postgres ]
```

Fusiona frontend y backend en UN SOLO servidor Express. Elimina el servicio nginx separado, el `Dockerfile` de la raíz y `project/nginx.conf` (ya no hay proxy ni IP hardcodeada).

## TAREAS (en orden)

### 1. Fusionar en un solo servidor Express
- En `backend/` haz que Express sirva los archivos estáticos del frontend (`index.html`, `*.jsx`, `styles.css`, `*.png`) con `express.static`, además de la API bajo `/api/`.
- Cualquier ruta que no empiece con `/api/` devuelve `index.html`.
- `backend/Dockerfile` pasa a ser el ÚNICO Dockerfile del servicio `mattika-app`. Debe copiar tanto `backend/` como los archivos del frontend.
- Borra `Dockerfile` de la raíz y `project/nginx.conf`.

### 2. Variables de entorno (leer de `process.env`)
```
DATABASE_URL=postgresql://postgres:1grjdkvutc5xcr8ohmc1@mattika_mattika-postgres:5432/mattika
JWT_SECRET=<generar con: openssl rand -base64 32>
PORT=3001
```

### 3. Base de datos
- Corre `backend/src/db/schema.sql` al arrancar (idempotente, `CREATE TABLE IF NOT EXISTS`).
- Corre `seed.js` UNA sola vez para el tenant/usuarios demo.
- Verifica que el schema multi-tenant existente cubra: empresas, usuarios, proyectos, etapas, lotes, reservas, contratos, cuotas, condiciones_comerciales, plantillas.

### 4. Extender backend para módulos que HOY NO tienen backend
El frontend guarda estos módulos SOLO en localStorage — hay que crear tablas + rutas REST:
- **Módulo Comercial (analítica de ventas)** — claves localStorage: `napoles_ventas`, `napoles_ejecutivos`, `napoles_escalas`, `napoles_captacion`, `napoles_metas`, `napoles_cierres`, `napoles_retencion`, `napoles_inicialmin`, `napoles_nomina`, `napoles_descpolicy`, `napoles_seedflags`, `napoles_leadshoy`, `napoles_lider`. Crea tablas y rutas `/api/comercial/*` para cada uno (multi-tenant, con `empresa_id`).
- **Correo/SMTP** — config SMTP + outbox por empresa. Tabla + ruta `/api/correo`, o integra un servicio de mail.

### 5. Cablear localStorage → API en el frontend
Reemplaza lectura/escritura de localStorage por llamadas a la API usando el `apiClient`/`MATTIKA_API` que ya existe en `data-store.jsx` (hoy sin usar). Módulos a cablear:
- auth/empresas/usuarios, empresa/branding, proyectos/etapas, lotes, reservas, contratos, plantillas, cuotas/pagos, condiciones, **Comercial**, correo.
- Patrón: cada pantalla LEE de la API al montar y vuelve a LEER tras guardar (así se ve el cambio al recargar).
- **MANTÉN en localStorage** (son preferencias de UI, NO datos): `mattika.sidebar.collapsed`, `mattika.nav.sections`, `mattika.descarga.formato`, `mattika.last-login.v1`.
- El frontend usa un `scope` string `empresa.proyecto.etapa`; mapea a los FK `empresa_id/proyecto_id/etapa_id` del schema.

### 6. Deploy en EasyPanel
- El servicio `mattika-app` ya está creado en EasyPanel apuntando a este repo (rama `main`, Dockerfile). Al fusionar, debe construir con `backend/Dockerfile`.
- `mattika-postgres` ya existe (base `mattika`).
- Activa **auto-deploy**: cada push a `main` redeploya `mattika-app` automáticamente (webhook de GitHub → EasyPanel).

### 7. Commit y push
Haz commits atómicos y push a `main`. Verifica que el deploy quede verde.

## CRITERIOS DE ACEPTACIÓN
- [ ] Un solo servicio Express sirve web + API; nginx eliminado.
- [ ] Login funciona contra Postgres (JWT + bcrypt).
- [ ] Crear una venta/contrato en un navegador y verla en otro tras recargar.
- [ ] Módulo Comercial persiste en Postgres (no localStorage).
- [ ] Agregar un usuario nuevo = fila en `usuarios`, sin tocar infra.
- [ ] Push a `main` dispara redeploy automático.

## REGLAS
- NO reescribir el frontend en React/Next compilado. Sigue siendo JSX vía Babel en navegador.
- NO romper el flujo "editar frontend en otra herramienta → push → deploy".
- Preferencias de UI se quedan en localStorage; TODO lo demás va a Postgres.
- Preguntar antes de borrar datos o cambiar el schema de forma destructiva.
