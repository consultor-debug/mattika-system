const jwt = require('jsonwebtoken');

// Verifica el JWT y adjunta req.user
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.mattika_token;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Solo el master puede acceder
function requireMaster(req, res, next) {
  if (req.user?.tipo !== 'master') {
    return res.status(403).json({ error: 'Acceso restringido a Mattika master' });
  }
  next();
}

// Verifica un permiso granular del usuario
function requirePerm(perm) {
  return (req, res, next) => {
    if (req.user?.tipo === 'master') return next();
    if (req.user?.permisos?.[perm]) return next();
    return res.status(403).json({ error: `Sin permiso: ${perm}` });
  };
}

module.exports = { requireAuth, requireMaster, requirePerm };
