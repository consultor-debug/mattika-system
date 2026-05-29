const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requireMaster } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Todas las rutas requieren master
router.use(requireAuth, requireMaster);

// GET /api/empresas
router.get('/', async (req, res) => {
  const r = await pool.query(`
    SELECT e.*,
      (SELECT COUNT(*) FROM proyectos p WHERE p.empresa_id = e.id) as proyectos_count,
      (SELECT COUNT(*) FROM usuarios u WHERE u.empresa_id = e.id AND u.activo) as usuarios_count
    FROM empresas e ORDER BY e.nombre
  `);
  res.json(r.rows);
});

// POST /api/empresas
router.post('/', async (req, res) => {
  const { nombre, color = '#1E4FD4' } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
  const id = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 30) + '-' + Date.now().toString(36);
  const r = await pool.query(
    `INSERT INTO empresas (id, nombre, color) VALUES ($1, $2, $3) RETURNING *`,
    [id, nombre, color]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/empresas/:id
router.put('/:id', async (req, res) => {
  const { nombre, color, activa } = req.body;
  const r = await pool.query(
    `UPDATE empresas SET
      nombre = COALESCE($1, nombre),
      color  = COALESCE($2, color),
      activa = COALESCE($3, activa)
     WHERE id = $4 RETURNING *`,
    [nombre, color, activa, req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.json(r.rows[0]);
});

// DELETE /api/empresas/:id
router.delete('/:id', async (req, res) => {
  await pool.query(`DELETE FROM empresas WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
