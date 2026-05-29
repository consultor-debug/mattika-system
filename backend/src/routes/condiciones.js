const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const r = await pool.query(`SELECT config FROM condiciones_comerciales WHERE empresa_id = $1`, [empId]);
  res.json(r.rows[0]?.config || {});
});

router.put('/', requirePerm('editar_condiciones'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const r = await pool.query(
    `INSERT INTO condiciones_comerciales (empresa_id, config, actualizado_el)
     VALUES ($1, $2, NOW())
     ON CONFLICT (empresa_id) DO UPDATE SET config = EXCLUDED.config, actualizado_el = NOW()
     RETURNING config`,
    [empId, JSON.stringify(req.body.config || req.body)]
  );
  res.json(r.rows[0].config);
});

module.exports = router;
