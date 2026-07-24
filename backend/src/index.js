require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');
const { applySchema, seedData } = require('./db/seed');

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET no está definido — el login fallará. Configúralo en el entorno (EasyPanel).');
}

// ── Express 4 async error fix ─────────────────────────────────
// Express 4 doesn't catch thrown errors from async route handlers.
// This patch makes all async handlers forward errors to next() automatically.
{
  const Layer = require('express/lib/router/layer');
  const orig = Layer.prototype.handle_request;
  Layer.prototype.handle_request = function(req, res, next) {
    const fn = this.handle;
    if (fn && fn.constructor.name === 'AsyncFunction' && fn.length < 4) {
      return fn(req, res, next).catch(next);
    }
    return orig.call(this, req, res, next);
  };
}

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' })); // 20mb para plano images en base64

// Audit middleware — registra todas las escrituras
app.use(async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.user) {
    res.on('finish', async () => {
      if (res.statusCode < 400) {
        const tabla = req.path.split('/')[2] || 'api';
        try {
          await pool.query(
            `INSERT INTO auditoria (empresa_id, usuario_id, usuario_nombre, accion, tabla, ip)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.user.empresaId, req.user.id, req.user.nombre,
             `${req.method} ${req.path}`, tabla, req.ip]
          );
        } catch {} // audit no debe romper la app
      }
    });
  }
  next();
});

// ── Health check ─────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/empresas',   require('./routes/empresas'));
app.use('/api/proyectos',  require('./routes/proyectos'));
app.use('/api/lotes',      require('./routes/lotes'));
app.use('/api/reservas',   require('./routes/reservas'));
app.use('/api/contratos',  require('./routes/contratos'));
app.use('/api/cuotas',     require('./routes/cuotas'));
app.use('/api/usuarios',   require('./routes/usuarios'));
app.use('/api/condiciones',require('./routes/condiciones'));
app.use('/api/plantillas', require('./routes/plantillas'));
app.use('/api/auditoria',  require('./routes/auditoria'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/comercial',  require('./routes/comercial'));
app.use('/api/correo',     require('./routes/correo'));
app.use('/api/store',      require('./routes/store'));

// ── Frontend estático (servido tal cual, sin build) ───────────
// El frontend vive en la raíz del repo (index.html + *.jsx + styles.css +
// assets), transpilado por Babel en el navegador. Un solo servidor entrega
// web + API, así que no hay nginx ni proxy ni IP hardcodeada.
const FRONTEND_DIR = path.join(__dirname, '..', '..');

// No exponer código de servidor ni control de versiones vía estáticos.
app.use((req, res, next) => {
  if (/^\/(backend|\.git|project|node_modules)(\/|$)/.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

app.use(express.static(FRONTEND_DIR, { index: 'index.html', extensions: ['html'] }));

// Fallback SPA: cualquier ruta que no sea /api/ ni /health devuelve index.html.
app.get(/^\/(?!api\/|health).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err.stack);
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;

// Aplica el schema (idempotente) y siembra datos demo SOLO la primera vez
// (si no hay empresas). No re-siembra en cada deploy para no pisar cambios.
async function initDb() {
  await applySchema(pool);
  console.log('✅ Schema aplicado');
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM empresas');
  if (rows[0].n === 0) {
    console.log('   Base vacía → sembrando datos demo…');
    await seedData(pool);
    console.log('✅ Datos demo sembrados');
  }
}

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Mattika App (web + API) corriendo en puerto ${PORT}`);
      console.log(`   DB: ${process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Fallo al inicializar la base de datos:', err.message);
    process.exit(1);
  });
