require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');

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

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Mattika API corriendo en puerto ${PORT}`);
  console.log(`   DB: ${process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@')}`);
});
