const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const r = await pool.query(`SELECT nombre, contenido FROM plantillas WHERE empresa_id = $1 ORDER BY nombre`, [empId]);
  res.json(r.rows);
});

router.put('/:nombre', requirePerm('editar_plantillas'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const r = await pool.query(
    `INSERT INTO plantillas (empresa_id, nombre, contenido, actualizado_el)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (empresa_id, nombre) DO UPDATE SET contenido = EXCLUDED.contenido, actualizado_el = NOW()
     RETURNING *`,
    [empId, req.params.nombre, req.body.contenido]
  );
  res.json(r.rows[0]);
});

module.exports = router;
