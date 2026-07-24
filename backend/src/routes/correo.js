const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

function empId(req) {
  return req.user.tipo === 'master'
    ? (req.query.empresaId || req.body.empresaId)
    : req.user.empresaId;
}

// ── Configuración SMTP por empresa ──────────────────────────────
// GET /api/correo/config
router.get('/config', async (req, res) => {
  const r = await pool.query(
    `SELECT config FROM correo_config WHERE empresa_id = $1`, [empId(req)]
  );
  res.json(r.rows[0]?.config || {});
});

// PUT /api/correo/config  (no persiste contraseñas en texto plano si el
// front las omite; se guarda lo que llegue tal cual como documento JSON)
router.put('/config', async (req, res) => {
  const config = (req.body && Object.prototype.hasOwnProperty.call(req.body, 'config'))
    ? req.body.config : req.body;
  const r = await pool.query(
    `INSERT INTO correo_config (empresa_id, config, actualizado_el)
     VALUES ($1, $2, NOW())
     ON CONFLICT (empresa_id) DO UPDATE SET config = EXCLUDED.config, actualizado_el = NOW()
     RETURNING config`,
    [empId(req), JSON.stringify(config || {})]
  );
  res.json(r.rows[0].config);
});

// ── Bandeja de salida (outbox) ──────────────────────────────────
// GET /api/correo/outbox
router.get('/outbox', async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM correo_outbox WHERE empresa_id = $1 ORDER BY creado_el DESC LIMIT 500`,
    [empId(req)]
  );
  res.json(r.rows);
});

// POST /api/correo/outbox → encola un correo (estado 'pendiente').
// El envío SMTP real se implementará como worker aparte; aquí se persiste
// para que sea compartido y auditable entre usuarios.
router.post('/outbox', async (req, res) => {
  const b = req.body || {};
  const id = b.id || ('mail-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
  const r = await pool.query(
    `INSERT INTO correo_outbox (id, empresa_id, para, cc, asunto, cuerpo, adjuntos, estado, creado_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8,'pendiente'), $9)
     RETURNING *`,
    [id, empId(req), b.para || null, b.cc || null, b.asunto || null, b.cuerpo || null,
     JSON.stringify(b.adjuntos || []), b.estado || null, req.user.id]
  );
  res.status(201).json(r.rows[0]);
});

module.exports = router;
