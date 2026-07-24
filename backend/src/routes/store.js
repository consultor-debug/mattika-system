const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// Almacén clave/valor genérico por empresa. Es el respaldo de la "capa de
// sync" del frontend: guarda VERBATIM los blobs que antes vivían en
// localStorage (reservas, ventas, lotes-admin, condiciones, clientes,
// pagos-estado, plano, Comercial, …), scopeados por empresa vía el JWT.
router.use(requireAuth);

// Formato de clave seguro (permite puntos/guiones de las claves mattika.*.<scope>)
const CLAVE_OK = (k) => typeof k === 'string' && /^[a-zA-Z0-9._-]{1,200}$/.test(k);

function empId(req) {
  return req.user.tipo === 'master'
    ? (req.query.empresaId || req.body.empresaId)
    : req.user.empresaId;
}

// GET /api/store → { clave: datos } con TODAS las claves de la empresa (hidratación)
router.get('/', async (req, res) => {
  const r = await pool.query(
    `SELECT clave, datos FROM app_kv WHERE empresa_id = $1`, [empId(req)]
  );
  const out = {};
  for (const row of r.rows) out[row.clave] = row.datos;
  res.json(out);
});

// GET /api/store/:clave
router.get('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
  const r = await pool.query(
    `SELECT datos FROM app_kv WHERE empresa_id = $1 AND clave = $2`,
    [empId(req), clave]
  );
  res.json(r.rows[0] ? r.rows[0].datos : null);
});

// PUT /api/store/:clave → upsert (cuerpo = documento directo o { datos })
router.put('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
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

// POST /api/store/bulk → upsert de varias claves { claves: { clave: datos, ... } }
router.post('/bulk', async (req, res) => {
  const claves = (req.body && req.body.claves) || {};
  const eid = empId(req);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [clave, datos] of Object.entries(claves)) {
      if (!CLAVE_OK(clave)) continue;
      await client.query(
        `INSERT INTO app_kv (empresa_id, clave, datos, actualizado_el)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (empresa_id, clave)
           DO UPDATE SET datos = EXCLUDED.datos, actualizado_el = NOW()`,
        [eid, clave, JSON.stringify(datos ?? null)]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, count: Object.keys(claves).length });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// DELETE /api/store/:clave
router.delete('/:clave', async (req, res) => {
  const { clave } = req.params;
  if (!CLAVE_OK(clave)) return res.status(400).json({ error: 'Clave inválida' });
  await pool.query(
    `DELETE FROM app_kv WHERE empresa_id = $1 AND clave = $2`, [empId(req), clave]
  );
  res.json({ ok: true });
});

module.exports = router;
