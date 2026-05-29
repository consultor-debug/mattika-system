const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

// GET /api/cuotas
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const { filter, contratoId } = req.query;
  const params = [empId];
  let where = 'WHERE c.empresa_id = $1';
  if (contratoId) { params.push(contratoId); where += ` AND c.contrato_id = $${params.length}`; }
  if (filter === 'vencidas') where += ` AND c.estado = 'pendiente' AND c.fecha_vencimiento < CURRENT_DATE`;
  if (filter === 'proximas') where += ` AND c.estado = 'pendiente' AND c.fecha_vencimiento >= CURRENT_DATE AND c.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days'`;
  if (filter === 'pagadas')  where += ` AND c.estado = 'pagado'`;

  const r = await pool.query(
    `SELECT c.*,
       ct.codigo as contrato_codigo, ct.datos as contrato_datos,
       u.nombre as registrado_por_nombre,
       CASE WHEN c.estado = 'pendiente' AND c.fecha_vencimiento < CURRENT_DATE
            THEN (CURRENT_DATE - c.fecha_vencimiento)
            ELSE 0 END as dias_mora
     FROM cuotas c
     LEFT JOIN contratos ct ON ct.id = c.contrato_id
     LEFT JOIN usuarios u ON u.id = c.registrado_por
     ${where} ORDER BY c.fecha_vencimiento ASC`,
    params
  );
  res.json(r.rows);
});

// POST /api/cuotas/:id/pago — registrar pago
router.post('/:id/pago', requirePerm('registrar_pagos'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { fecha, monto, metodoPago, numOperacion } = req.body;
  if (!monto || !metodoPago) return res.status(400).json({ error: 'monto y metodoPago requeridos' });
  const r = await pool.query(
    `UPDATE cuotas SET
       estado = 'pagado', fecha_pago = $1, monto_pagado = $2,
       metodo_pago = $3, num_operacion = $4,
       registrado_por = $5, registrado_el = NOW()
     WHERE id = $6 AND ($7::varchar IS NULL OR empresa_id = $7) RETURNING *`,
    [fecha || new Date(), monto, metodoPago, numOperacion || null, req.user.id, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Cuota no encontrada' });
  res.json(r.rows[0]);
});

// GET /api/cuotas/resumen — métricas para dashboard
router.get('/resumen', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const r = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE) as vencidas,
       COUNT(*) FILTER (WHERE estado = 'pendiente' AND fecha_vencimiento >= CURRENT_DATE AND fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days') as proximas,
       COUNT(*) FILTER (WHERE estado = 'pagado' AND DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)) as cobradas_mes,
       COALESCE(SUM(monto_pagado) FILTER (WHERE estado = 'pagado' AND DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)), 0) as monto_cobrado_mes
     FROM cuotas WHERE empresa_id = $1`,
    [empId]
  );
  res.json(r.rows[0]);
});

module.exports = router;
