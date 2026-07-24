const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

// GET /api/usuarios
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const params = empId ? [empId] : [];
  const where = empId ? 'WHERE empresa_id = $1' : '';
  const r = await pool.query(
    `SELECT id, empresa_id, nombre, username, rol, activo, permisos, tipo, creado_el
     FROM usuarios ${where} ORDER BY nombre`,
    params
  );
  res.json(r.rows);
});

// POST /api/usuarios
router.post('/', requirePerm('gestionar_usuarios'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { nombre, username, password, rol, permisos } = req.body;
  if (!nombre || !username || !password) return res.status(400).json({ error: 'nombre, username y password requeridos' });
  const hash = await bcrypt.hash(password, 10);
  // Acepta el id del cliente (para que el id local del frontend == id en DB y
  // el mirror no tenga que reconciliar ids). Fallback a uuid si no viene o es inválido.
  const id = (typeof req.body.id === 'string' && /^[a-zA-Z0-9._-]{1,50}$/.test(req.body.id))
    ? req.body.id : uuidv4();
  const r = await pool.query(
    `INSERT INTO usuarios (id, empresa_id, nombre, username, password_hash, rol, permisos)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, empresa_id, nombre, username, rol, activo, permisos`,
    [id, empId||null, nombre, username, hash, rol||'Asesor', JSON.stringify(permisos||{})]
  ).catch(err => {
    if (err.code === '23505') {
      const e = new Error('El username ya existe en esta empresa'); e.status = 409; throw e;
    }
    throw err;
  });
  res.status(201).json(r.rows[0]);
});

// PUT /api/usuarios/:id
router.put('/:id', requirePerm('gestionar_usuarios'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { nombre, rol, activo, permisos } = req.body;
  const r = await pool.query(
    `UPDATE usuarios SET
       nombre = COALESCE($1, nombre), rol = COALESCE($2, rol),
       activo = COALESCE($3, activo), permisos = COALESCE($4, permisos)
     WHERE id = $5 AND ($6::varchar IS NULL OR empresa_id = $6)
     RETURNING id, empresa_id, nombre, username, rol, activo, permisos`,
    [nombre, rol, activo, permisos ? JSON.stringify(permisos) : null, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(r.rows[0]);
});

// PUT /api/usuarios/:id/password
router.put('/:id/password', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  // Solo el propio usuario o un admin puede cambiar la clave
  if (req.params.id !== req.user.id && !req.user.permisos?.gestionar_usuarios && req.user.tipo !== 'master') {
    return res.status(403).json({ error: 'Sin permiso para cambiar esta contraseña' });
  }
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Mínimo 6 caracteres' });
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `UPDATE usuarios SET password_hash = $1 WHERE id = $2 AND ($3::varchar IS NULL OR empresa_id = $3)`,
    [hash, req.params.id, empId]
  );
  res.json({ ok: true });
});

// DELETE /api/usuarios/:id
router.delete('/:id', requirePerm('gestionar_usuarios'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  await pool.query(`DELETE FROM usuarios WHERE id = $1 AND ($2::varchar IS NULL OR empresa_id = $2)`, [req.params.id, empId]);
  res.json({ ok: true });
});

module.exports = router;
