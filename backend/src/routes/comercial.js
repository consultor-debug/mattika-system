const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Claves conocidas del módulo Comercial (analítica de ventas). Se aceptan
// éstas y cualquier otra con formato seguro (para no frenar nuevas del front).
const CLAVES = new Set([
  'napoles_ventas', 'napoles_ejecutivos', 'napoles_escalas', 'napoles_captacion',
  'napoles_metas', 'napoles_cierres', 'napoles_retencion', 'napoles_inicialmin',
  'napoles_nomina', 'napoles_descpolicy', 'napoles_seedflags', 'napoles_leadshoy',
  'napoles_lider',
]);
const CLAVE_OK = (k) => typeof k === 'string' && /^[a-z0-9_]{1,100}$/i.test(k);

// empresa activa: el master puede apuntar a otra vía ?empresaId / body.empresaId
function empId(req) {
  return req.user.tipo === 'master'
    ? (req.query.empresaId || req.body.empresaId)
    : req.user.empresaId;
}

// GET /api/comercial → claves del módulo Comercial como { clave: datos }
router.get('/', async (req, res) => {
  const r = await pool.query(
    `SELECT clave, datos FROM app_kv WHERE empresa_id = $1 AND clave LIKE 'napoles_%'`,
    [empId(req)]
  );
  const out = {};
  for (const row of r.rows) out[row.clave] = row.datos;
  res.json(out);
});

// GET /api/comercial/:clave → datos (o null si no existe)
router.get('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
  const r = await pool.query(
    `SELECT datos FROM app_kv WHERE empresa_id = $1 AND clave = $2`,
    [empId(req), clave]
  );
  res.json(r.rows[0] ? r.rows[0].datos : null);
});

// PUT /api/comercial/:clave → upsert del documento JSON
router.put('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
  // El cuerpo puede ser el documento directo o { datos: ... }
  const datos = (req.body && Object.prototype.hasOwnProperty.call(req.body, 'datos'))
    ? req.body.datos : req.body;
  const r = await pool.query(
    `INSERT INTO app_kv (empresa_id, clave, datos, actualizado_el)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (empresa_id, clave)
       DO UPDATE SET datos = EXCLUDED.datos, actualizado_el = NOW()
     RETURNING datos`,
    [empId(req), clave, JSON.stringify(datos ?? null)]
  );
  res.json(r.rows[0].datos);
});

// DELETE /api/comercial/:clave
router.delete('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
  await pool.query(
    `DELETE FROM app_kv WHERE empresa_id = $1 AND clave = $2`,
    [empId(req), clave]
  );
  res.json({ ok: true });
});

module.exports = router;
