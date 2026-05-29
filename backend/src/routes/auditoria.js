const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');

router.use(requireAuth, requirePerm('superusuario'));

router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const { tabla, limit = 100 } = req.query;
  const params = [empId, parseInt(limit)];
  let where = 'WHERE empresa_id = $1';
  if (tabla) { params.splice(1, 0, tabla); where += ` AND tabla = $2`; params[params.length - 1] = parseInt(limit); }
  const r = await pool.query(
    `SELECT * FROM auditoria ${where} ORDER BY creado_el DESC LIMIT $${params.length}`,
    params
  );
  res.json(r.rows);
});

module.exports = router;
