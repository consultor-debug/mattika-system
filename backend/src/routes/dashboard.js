const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/dashboard — métricas principales
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  if (!empId) return res.json({});
  try {
    const [contratos, cuotas, lotes, reservas] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'por_firmar') as por_firmar,
          COUNT(*) FILTER (WHERE DATE_TRUNC('month', creado_el) = DATE_TRUNC('month', NOW())) as este_mes,
          COALESCE(SUM((datos->>'precio')::numeric) FILTER (WHERE estado != 'anulado'), 0) as monto_total
        FROM contratos WHERE empresa_id = $1`, [empId]),
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE) as vencidas,
          COUNT(*) FILTER (WHERE estado = 'pendiente' AND fecha_vencimiento >= CURRENT_DATE AND fecha_vencimiento <= CURRENT_DATE + 30) as proximas
        FROM cuotas WHERE empresa_id = $1`, [empId]),
      pool.query(`
        SELECT COUNT(*) FILTER (WHERE estado = 'disponible') as disponibles,
               COUNT(*) FILTER (WHERE estado = 'separado') as separados,
               COUNT(*) FILTER (WHERE estado = 'vendido') as vendidos,
               COUNT(*) as total
        FROM lotes WHERE empresa_id = $1`, [empId]),
      pool.query(`
        SELECT COUNT(*) FILTER (WHERE tipo = 'separacion') as separaciones,
               COUNT(*) FILTER (WHERE tipo = 'venta') as ventas
        FROM reservas WHERE empresa_id = $1`, [empId]),
    ]);
    res.json({
      contratos: contratos.rows[0],
      cuotas: cuotas.rows[0],
      lotes: lotes.rows[0],
      reservas: reservas.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
