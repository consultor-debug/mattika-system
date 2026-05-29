const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

// GET /api/reservas
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const { proyectoId, etapaId, tipo } = req.query;
  const params = [empId];
  let where = 'WHERE r.empresa_id = $1';
  if (proyectoId) { params.push(proyectoId); where += ` AND r.proyecto_id = $${params.length}`; }
  if (etapaId)    { params.push(etapaId);    where += ` AND r.etapa_id = $${params.length}`; }
  if (tipo)       { params.push(tipo);       where += ` AND r.tipo = $${params.length}`; }
  const r = await pool.query(
    `SELECT r.*, l.manzana, l.numero, l.codigo as lote_codigo, l.precio as lote_precio,
            u.nombre as creado_por_nombre
     FROM reservas r
     LEFT JOIN lotes l ON l.id = r.lote_id
     LEFT JOIN usuarios u ON u.id = r.creada_por
     ${where} ORDER BY r.creada_el DESC`,
    params
  );
  res.json(r.rows);
});

// POST /api/reservas
router.post('/', requirePerm('vender_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { loteId, proyectoId, etapaId, tipo, compradorNombre, compradorApellidos, compradorDni,
          compradorTelefono, compradorCorreo, precio, inicial, cuotas, descuento, notas } = req.body;
  if (!loteId || !tipo) return res.status(400).json({ error: 'loteId y tipo requeridos' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = uuidv4();
    const r = await client.query(
      `INSERT INTO reservas (id, empresa_id, lote_id, proyecto_id, etapa_id, tipo,
         comprador_nombre, comprador_apellidos, comprador_dni, comprador_telefono, comprador_correo,
         precio, inicial, cuotas, descuento, notas, creada_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [id, empId, loteId, proyectoId||null, etapaId||null, tipo,
       compradorNombre, compradorApellidos, compradorDni, compradorTelefono, compradorCorreo,
       precio, inicial, cuotas||12, descuento||0, notas, req.user.id]
    );
    // Actualizar estado del lote
    const estadoLote = tipo === 'venta' ? 'vendido' : 'separado';
    await client.query(`UPDATE lotes SET estado = $1 WHERE id = $2`, [estadoLote, loteId]);
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/reservas/:id
router.put('/:id', requirePerm('vender_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { compradorNombre, compradorApellidos, compradorDni, compradorTelefono, compradorCorreo,
          precio, inicial, cuotas, descuento, notas, documentosGenerados } = req.body;
  const r = await pool.query(
    `UPDATE reservas SET
       comprador_nombre = COALESCE($1, comprador_nombre),
       comprador_apellidos = COALESCE($2, comprador_apellidos),
       comprador_dni = COALESCE($3, comprador_dni),
       comprador_telefono = COALESCE($4, comprador_telefono),
       comprador_correo = COALESCE($5, comprador_correo),
       precio = COALESCE($6, precio), inicial = COALESCE($7, inicial),
       cuotas = COALESCE($8, cuotas), descuento = COALESCE($9, descuento),
       notas = COALESCE($10, notas),
       documentos_generados = COALESCE($11, documentos_generados)
     WHERE id = $12 AND ($13::varchar IS NULL OR empresa_id = $13) RETURNING *`,
    [compradorNombre, compradorApellidos, compradorDni, compradorTelefono, compradorCorreo,
     precio, inicial, cuotas, descuento, notas, documentosGenerados, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Reserva no encontrada' });
  res.json(r.rows[0]);
});

// DELETE /api/reservas/:id — cancelar reserva y liberar lote
router.delete('/:id', requirePerm('vender_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `DELETE FROM reservas WHERE id = $1 AND ($2::varchar IS NULL OR empresa_id = $2) RETURNING lote_id`,
      [req.params.id, empId]
    );
    if (r.rows[0]?.lote_id) {
      await client.query(`UPDATE lotes SET estado = 'disponible' WHERE id = $1`, [r.rows[0].lote_id]);
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
