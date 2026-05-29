const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

const scope = (req) => req.user.tipo === 'master' ? null : req.user.empresaId;

// GET /api/proyectos
router.get('/', async (req, res) => {
  const empId = scope(req);
  const r = await pool.query(
    `SELECT p.*,
       json_agg(e.* ORDER BY e.nombre) FILTER (WHERE e.id IS NOT NULL) as etapas
     FROM proyectos p
     LEFT JOIN etapas e ON e.proyecto_id = p.id
     WHERE ($1::varchar IS NULL OR p.empresa_id = $1)
     GROUP BY p.id ORDER BY p.nombre`,
    [empId]
  );
  res.json(r.rows);
});

// POST /api/proyectos
router.post('/', requirePerm('gestionar_proyectos'), async (req, res) => {
  const { nombre, ubicacion, descripcion, estado, fechaInicio, fechaEntrega } = req.body;
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  if (!nombre || !empId) return res.status(400).json({ error: 'nombre y empresaId requeridos' });
  const id = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 30) + '-' + Date.now().toString(36);
  const r = await pool.query(
    `INSERT INTO proyectos (id, empresa_id, nombre, ubicacion, descripcion, estado, fecha_inicio, fecha_entrega)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, empId, nombre, ubicacion, descripcion, estado || 'preventa', fechaInicio || null, fechaEntrega || null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/proyectos/:id
router.put('/:id', requirePerm('gestionar_proyectos'), async (req, res) => {
  const empId = scope(req);
  const { nombre, ubicacion, descripcion, estado, fechaInicio, fechaEntrega } = req.body;
  const r = await pool.query(
    `UPDATE proyectos SET
       nombre = COALESCE($1, nombre), ubicacion = COALESCE($2, ubicacion),
       descripcion = COALESCE($3, descripcion), estado = COALESCE($4, estado),
       fecha_inicio = COALESCE($5, fecha_inicio), fecha_entrega = COALESCE($6, fecha_entrega)
     WHERE id = $7 AND ($8::varchar IS NULL OR empresa_id = $8) RETURNING *`,
    [nombre, ubicacion, descripcion, estado, fechaInicio, fechaEntrega, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(r.rows[0]);
});

// DELETE /api/proyectos/:id
router.delete('/:id', requirePerm('gestionar_proyectos'), async (req, res) => {
  const empId = scope(req);
  await pool.query(`DELETE FROM proyectos WHERE id = $1 AND ($2::varchar IS NULL OR empresa_id = $2)`, [req.params.id, empId]);
  res.json({ ok: true });
});

// ── Etapas ────────────────────────────────────────────────────

// POST /api/proyectos/:proyectoId/etapas
router.post('/:proyectoId/etapas', requirePerm('gestionar_proyectos'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { nombre, estado, lotes, fechaInicio, fechaEntrega } = req.body;
  const id = `${req.params.proyectoId}-${nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString(36)}`;
  const r = await pool.query(
    `INSERT INTO etapas (id, proyecto_id, empresa_id, nombre, estado, lotes, fecha_inicio, fecha_entrega)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, req.params.proyectoId, empId, nombre, estado || 'preventa', lotes || 0, fechaInicio || null, fechaEntrega || null]
  );
  res.status(201).json(r.rows[0]);
});

// PUT /api/proyectos/:proyectoId/etapas/:etapaId
router.put('/:proyectoId/etapas/:etapaId', requirePerm('gestionar_proyectos'), async (req, res) => {
  const { nombre, estado, lotes, fechaInicio, fechaEntrega, planoImagen, planoAlineacion } = req.body;
  const r = await pool.query(
    `UPDATE etapas SET
       nombre = COALESCE($1, nombre), estado = COALESCE($2, estado),
       lotes = COALESCE($3, lotes), fecha_inicio = COALESCE($4, fecha_inicio),
       fecha_entrega = COALESCE($5, fecha_entrega),
       plano_imagen = COALESCE($6, plano_imagen),
       plano_alineacion = COALESCE($7, plano_alineacion)
     WHERE id = $8 AND proyecto_id = $9 RETURNING *`,
    [nombre, estado, lotes, fechaInicio, fechaEntrega, planoImagen, planoAlineacion ? JSON.stringify(planoAlineacion) : null, req.params.etapaId, req.params.proyectoId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Etapa no encontrada' });
  res.json(r.rows[0]);
});

// DELETE /api/proyectos/:proyectoId/etapas/:etapaId
router.delete('/:proyectoId/etapas/:etapaId', requirePerm('gestionar_proyectos'), async (req, res) => {
  await pool.query(`DELETE FROM etapas WHERE id = $1 AND proyecto_id = $2`, [req.params.etapaId, req.params.proyectoId]);
  res.json({ ok: true });
});

module.exports = router;
