const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { empresaId, username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'usuario y contraseña requeridos' });
  }
  try {
    let user;
    if (empresaId === 'mattika' || !empresaId) {
      // Master login
      const r = await pool.query(
        `SELECT * FROM usuarios WHERE username = $1 AND tipo = 'master'`, [username]
      );
      user = r.rows[0];
    } else {
      const r = await pool.query(
        `SELECT u.*, e.nombre as empresa_nombre, e.color as empresa_color
         FROM usuarios u JOIN empresas e ON e.id = u.empresa_id
         WHERE u.empresa_id = $1 AND u.username = $2 AND u.activo = true`,
        [empresaId, username]
      );
      user = r.rows[0];
    }

    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const payload = {
      id: user.id,
      empresaId: user.empresa_id,
      nombre: user.nombre,
      username: user.username,
      rol: user.rol,
      tipo: user.tipo,
      permisos: user.permisos || {},
      empresaNombre: user.empresa_nombre,
      empresaColor: user.empresa_color,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT u.id, u.nombre, u.username, u.rol, u.tipo, u.permisos,
              e.nombre as empresa_nombre, e.color as empresa_color
       FROM usuarios u LEFT JOIN empresas e ON e.id = u.empresa_id
       WHERE u.id = $1`, [req.user.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

// GET /api/auth/empresas — lista de empresas activas para el login dropdown
router.get('/empresas', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, nombre, color FROM empresas WHERE activa = true ORDER BY nombre`
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
