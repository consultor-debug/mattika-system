const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

function nextCodigo(prefix, count) {
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/contratos
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const { estado, search } = req.query;
  const params = [empId];
  let where = 'WHERE c.empresa_id = $1';
  if (estado)  { params.push(estado);  where += ` AND c.estado = $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (c.codigo ILIKE $${params.length} OR c.datos->>'compradorA' ILIKE $${params.length})`;
  }
  const r = await pool.query(
    `SELECT c.*, u.nombre as creado_por_nombre
     FROM contratos c LEFT JOIN usuarios u ON u.id = c.creado_por
     ${where} ORDER BY c.creado_el DESC`,
    params
  );
  res.json(r.rows);
});

// GET /api/contratos/:id
router.get('/:id', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const r = await pool.query(
    `SELECT c.*, u.nombre as creado_por_nombre,
            json_agg(cu.* ORDER BY cu.numero) FILTER (WHERE cu.id IS NOT NULL) as cuotas
     FROM contratos c
     LEFT JOIN usuarios u ON u.id = c.creado_por
     LEFT JOIN cuotas cu ON cu.contrato_id = c.id
     WHERE c.id = $1 AND ($2::varchar IS NULL OR c.empresa_id = $2)
     GROUP BY c.id, u.nombre`,
    [req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.json(r.rows[0]);
});

// POST /api/contratos
router.post('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { reservaId, datos } = req.body;
  if (!datos) return res.status(400).json({ error: 'datos requeridos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Generar código correlativo por empresa
    const countR = await client.query(`SELECT COUNT(*) FROM contratos WHERE empresa_id = $1`, [empId]);
    const count = parseInt(countR.rows[0].count);
    const codigo = nextCodigo('MAT', count);
    const id = uuidv4();
    const r = await client.query(
      `INSERT INTO contratos (id, empresa_id, reserva_id, codigo, estado, datos, creado_por)
       VALUES ($1,$2,$3,$4,'borrador',$5,$6) RETURNING *`,
      [id, empId, reservaId||null, codigo, JSON.stringify(datos), req.user.id]
    );
    // Auto-generar cuotas si hay terminos
    if (datos.terminos && datos.cronograma) {
      const cuotasData = datos.cronograma;
      for (let i = 0; i < cuotasData.length; i++) {
        const cq = cuotasData[i];
        await client.query(
          `INSERT INTO cuotas (id, empresa_id, contrato_id, numero, descripcion, monto, fecha_vencimiento, estado)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'pendiente')`,
          [uuidv4(), empId, id, i + 1, cq.label || `Cuota ${i+1}`, cq.monto, cq.fecha || new Date()]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/contratos/:id/estado
router.put('/:id/estado', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { estado } = req.body;
  const valid = ['borrador', 'por_firmar', 'firmado', 'anulado'];
  if (!valid.includes(estado)) return res.status(400).json({ error: 'estado inválido' });
  const r = await pool.query(
    `UPDATE contratos SET estado = $1 WHERE id = $2 AND ($3::varchar IS NULL OR empresa_id = $3) RETURNING *`,
    [estado, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.json(r.rows[0]);
});

// PUT /api/contratos/:id/firma-fisica
router.put('/:id/firma-fisica', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { firmadoFisicamente, fechaFirma, lugarFirma } = req.body;
  const r = await pool.query(
    `UPDATE contratos SET firmado_fisicamente = $1, fecha_firma = $2, lugar_firma = $3
     WHERE id = $4 AND ($5::varchar IS NULL OR empresa_id = $5) RETURNING *`,
    [firmadoFisicamente, fechaFirma||null, lugarFirma||null, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.json(r.rows[0]);
});

// PUT /api/contratos/:id — actualizar datos completos
router.put('/:id', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { datos, estado } = req.body;
  const r = await pool.query(
    `UPDATE contratos SET
       datos = COALESCE($1, datos), estado = COALESCE($2, estado)
     WHERE id = $3 AND ($4::varchar IS NULL OR empresa_id = $4) RETURNING *`,
    [datos ? JSON.stringify(datos) : null, estado, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Contrato no encontrado' });
  res.json(r.rows[0]);
});

module.exports = router;
