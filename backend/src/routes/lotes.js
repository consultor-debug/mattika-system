const router = require('express').Router();
const pool = require('../db/connection');
const { requireAuth, requirePerm } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.use(requireAuth);

// GET /api/lotes
router.get('/', async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.query.empresaId : req.user.empresaId;
  const { proyectoId, etapaId, estado, manzana } = req.query;
  const params = [empId];
  let where = 'WHERE l.empresa_id = $1';
  if (proyectoId) { params.push(proyectoId); where += ` AND l.proyecto_id = $${params.length}`; }
  if (etapaId)    { params.push(etapaId);    where += ` AND l.etapa_id = $${params.length}`; }
  if (estado)     { params.push(estado);     where += ` AND l.estado = $${params.length}`; }
  if (manzana)    { params.push(manzana);    where += ` AND l.manzana = $${params.length}`; }
  const r = await pool.query(
    `SELECT l.*,
       (SELECT row_to_json(res) FROM reservas res WHERE res.lote_id = l.id ORDER BY res.creada_el DESC LIMIT 1) as reserva_activa
     FROM lotes l ${where} ORDER BY l.manzana, l.numero::int NULLS LAST, l.numero`,
    params
  );
  res.json(r.rows);
});

// GET /api/lotes/:id
router.get('/:id', async (req, res) => {
  const empId = req.user.tipo === 'master' ? undefined : req.user.empresaId;
  const r = await pool.query(
    `SELECT * FROM lotes WHERE id = $1 AND ($2::varchar IS NULL OR empresa_id = $2)`,
    [req.params.id, empId || null]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Lote no encontrado' });
  res.json(r.rows[0]);
});

// POST /api/lotes
router.post('/', requirePerm('editar_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { proyectoId, etapaId, codigo, manzana, numero, area, frente, fondo, lDer, lIzq, precio, estado, tipologia, orientacion, vertices } = req.body;
  const id = uuidv4();
  try {
    const r = await pool.query(
      `INSERT INTO lotes (id, empresa_id, proyecto_id, etapa_id, codigo, manzana, numero, area, frente, fondo, l_der, l_izq, precio, estado, tipologia, orientacion, vertices)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [id, empId, proyectoId||null, etapaId||null, codigo||`${manzana}${numero}`, manzana, numero, area, frente, fondo, lDer, lIzq, precio, estado||'disponible', tipologia, orientacion, vertices ? JSON.stringify(vertices) : null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: `El lote ${manzana}${numero} ya existe` });
    throw err;
  }
});

// POST /api/lotes/bulk — importación masiva desde Excel
router.post('/bulk', requirePerm('editar_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? req.body.empresaId : req.user.empresaId;
  const { lotes, proyectoId, etapaId, modo = 'merge' } = req.body;
  if (!Array.isArray(lotes)) return res.status(400).json({ error: 'lotes debe ser un array' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (modo === 'replace') {
      await client.query(`DELETE FROM lotes WHERE empresa_id = $1 AND proyecto_id = $2`, [empId, proyectoId]);
    }
    let inserted = 0, updated = 0, errors = [];
    for (const l of lotes) {
      const id = l.id || uuidv4();
      const codigo = l.codigo || `${l.manzana}${l.numero}`;
      try {
        if (modo === 'precios') {
          await client.query(
            `UPDATE lotes SET precio = $1 WHERE empresa_id = $2 AND manzana = $3 AND numero = $4`,
            [l.precio, empId, l.manzana, l.numero]
          );
          updated++;
        } else {
          await client.query(
            `INSERT INTO lotes (id, empresa_id, proyecto_id, etapa_id, codigo, manzana, numero, area, frente, fondo, precio, estado, tipologia)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
             ON CONFLICT (empresa_id, proyecto_id, manzana, numero) DO UPDATE SET
               area = EXCLUDED.area, frente = EXCLUDED.frente, fondo = EXCLUDED.fondo,
               precio = EXCLUDED.precio, estado = EXCLUDED.estado, tipologia = EXCLUDED.tipologia`,
            [id, empId, proyectoId||null, etapaId||null, codigo, l.manzana, l.numero, l.area, l.frente, l.fondo, l.precio, l.estado||'disponible', l.tipologia||null]
          );
          inserted++;
        }
      } catch (e) {
        errors.push({ lote: codigo, error: e.message });
      }
    }
    await client.query('COMMIT');
    res.json({ ok: true, inserted, updated, errors });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/lotes/:id
router.put('/:id', requirePerm('editar_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { manzana, numero, area, frente, fondo, lDer, lIzq, precio, estado, tipologia, orientacion, vertices, codigo } = req.body;
  const r = await pool.query(
    `UPDATE lotes SET
       manzana = COALESCE($1, manzana), numero = COALESCE($2, numero),
       area = COALESCE($3, area), frente = COALESCE($4, frente),
       fondo = COALESCE($5, fondo), l_der = COALESCE($6, l_der),
       l_izq = COALESCE($7, l_izq), precio = COALESCE($8, precio),
       estado = COALESCE($9, estado), tipologia = COALESCE($10, tipologia),
       orientacion = COALESCE($11, orientacion),
       vertices = COALESCE($12, vertices),
       codigo = COALESCE($13, codigo)
     WHERE id = $14 AND ($15::varchar IS NULL OR empresa_id = $15) RETURNING *`,
    [manzana, numero, area, frente, fondo, lDer, lIzq, precio, estado, tipologia, orientacion,
     vertices ? JSON.stringify(vertices) : null, codigo, req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Lote no encontrado' });
  res.json(r.rows[0]);
});

// PUT /api/lotes/:id/vertices — actualizar solo polígono
router.put('/:id/vertices', async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  const { vertices } = req.body;
  const r = await pool.query(
    `UPDATE lotes SET vertices = $1 WHERE id = $2 AND ($3::varchar IS NULL OR empresa_id = $3) RETURNING id, vertices`,
    [JSON.stringify(vertices), req.params.id, empId]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Lote no encontrado' });
  res.json(r.rows[0]);
});

// DELETE /api/lotes/:id
router.delete('/:id', requirePerm('editar_lotes'), async (req, res) => {
  const empId = req.user.tipo === 'master' ? null : req.user.empresaId;
  await pool.query(`DELETE FROM lotes WHERE id = $1 AND ($2::varchar IS NULL OR empresa_id = $2)`, [req.params.id, empId]);
  res.json({ ok: true });
});

module.exports = router;
