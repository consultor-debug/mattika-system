// data-store.jsx — Capa de datos que UNIFICA el ciclo comercial.
// ════════════════════════════════════════════════════════════════
// Reserva (apartar/vender un lote) → Cliente → Cronograma de Pagos.
//
// Las reservas se guardan por alcance (empresa·proyecto·etapa) desde el Plano.
// Aquí las reunimos a nivel EMPRESA para alimentar las pantallas de Clientes y
// Pagos con datos reales, en lugar de listas de ejemplo desconectadas.

const RESERVAS_PREFIX = 'mattika.reservas.v1.';
const CLIENTES_PREFIX = 'mattika.clientes.v1.';
const PAGOESTADO_PREFIX = 'mattika.pagos-estado.v1.';
const VENTAS_PREFIX = 'mattika.ventas.v1.';

// ── VENTAS / PAQUETES DE DOCUMENTOS GENERADOS ────────────────────
// Cada venta generada en el asistente se persiste completa (compradores,
// inmueble, términos, cronograma) para que aparezca en Contratos/Pagos,
// pueda reabrirse y editarse, y no se pierda al refrescar.
function loadVentas(empresaId) {
  if (!empresaId) return [];
  try { return JSON.parse(localStorage.getItem(VENTAS_PREFIX + empresaId) || '[]'); }
  catch (e) { return []; }
}
function saveVentas(empresaId, arr) {
  try { localStorage.setItem(VENTAS_PREFIX + empresaId, JSON.stringify(arr)); } catch (e) {}
}

// Siguiente código correlativo MTK-AAAA-NNNN para el año en curso.
function nextVentaCode(empresaId) {
  const year = new Date().getFullYear();
  let max = 0;
  const scan = (code) => {
    const m = /MTK-(\d{4})-(\d+)/.exec(code || '');
    if (m && +m[1] === year) max = Math.max(max, +m[2]);
  };
  loadVentas(empresaId).forEach(v => scan(v.code));
  (window.CONTRATOS_RECIENTES || []).forEach(c => scan(c.code));
  return `MTK-${year}-${String(max + 1).padStart(4, '0')}`;
}

// Inserta o actualiza un cliente en el store, fusionando por DNI.
function upsertClienteFromComprador(empresaId, comp) {
  if (!empresaId || !comp) return;
  const dni = String(comp.dni || '').trim();
  if (!dni) return;
  const store = loadClientesStore(empresaId);
  const hoy = new Date().toISOString().slice(0, 10);
  const idx = store.findIndex(c => String(c.dni).trim() === dni);
  const base = {
    nombres: comp.nombres || '', apellidos: comp.apellidos || '', dni,
    estadoCivil: comp.estadoCivil || '—',
    telefono: comp.telefono || '', email: comp.email || '',
    ocupacion: comp.ocupacion || '',
    domicilio: comp.domicilio || '—',
    ult: hoy,
  };
  if (idx >= 0) {
    // Conserva lo existente; completa lo que venga con dato nuevo.
    const prev = store[idx];
    store[idx] = {
      ...prev,
      nombres: base.nombres || prev.nombres,
      apellidos: base.apellidos || prev.apellidos,
      estadoCivil: (base.estadoCivil && base.estadoCivil !== '—') ? base.estadoCivil : prev.estadoCivil,
      telefono: base.telefono || prev.telefono,
      email: base.email || prev.email,
      ocupacion: base.ocupacion || prev.ocupacion,
      domicilio: (base.domicilio && base.domicilio !== '—') ? base.domicilio : prev.domicilio,
      ult: hoy,
    };
  } else {
    store.unshift({ ...base, id: 'c-' + dni, contratos: 0 });
  }
  saveClientesStore(empresaId, store);
}

// Persiste (o actualiza) una venta generada y registra a TODOS sus
// compradores como clientes. Devuelve el registro guardado con su código.
function registrarVenta(empresaId, data) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  if (!empresaId) return data;
  const ventas = loadVentas(empresaId);
  const now = new Date().toISOString();
  let record;
  if (data.id) {
    const idx = ventas.findIndex(v => v.id === data.id);
    record = { ...data, code: data.code, id: data.id, actualizadoEl: now };
    if (idx >= 0) ventas[idx] = record; else ventas.unshift(record);
  } else {
    const code = nextVentaCode(empresaId);
    record = {
      ...data,
      id: 'v-' + Date.now(),
      code,
      status: 'por-firmar',
      fecha: (data.meta && data.meta.fechaContrato) || now.slice(0, 10),
      creadoEl: now,
    };
    ventas.unshift(record);
  }
  saveVentas(empresaId, ventas);
  // Registrar compradores como clientes
  upsertClienteFromComprador(empresaId, data.compradorA);
  if (data.compradorB) upsertClienteFromComprador(empresaId, data.compradorB);
  // ── Amarre bidireccional con Plano / Lotes ──
  // Si la venta está ligada a un lote del inventario, escribimos su reserva
  // (fuente de verdad del estado en el Plano) y marcamos el lote como vendido.
  vincularLoteConVenta(record, data);
  return record;
}

// Escribe/actualiza la reserva del lote ligado a una venta y marca el lote
// como vendido en el inventario, para que Plano, Lotes y Clientes lo reflejen.
function vincularLoteConVenta(record, data) {
  try {
    const inm = data.inmueble || {};
    const scope = inm.scope;
    const loteId = inm.loteId;
    if (!scope || !loteId) return;
    const A = data.compradorA || {};
    // 1) Reserva (el Plano deriva el estado del lote desde aquí)
    const rkey = RESERVAS_PREFIX + scope;
    let rmap = {};
    try { rmap = JSON.parse(localStorage.getItem(rkey) || '{}'); } catch (e) {}
    rmap[loteId] = {
      ...(rmap[loteId] || {}),
      loteId, tipo: 'venta',
      dni: String(A.dni || ''), nombres: A.nombres || '', apellidos: A.apellidos || '',
      telefono: A.telefono || '', email: A.email || '',
      ventaId: record.id, ventaCode: record.code, documentos: 'generados',
      fecha: (data.meta && data.meta.fechaContrato)
        ? new Date(data.meta.fechaContrato).toISOString()
        : new Date().toISOString(),
    };
    localStorage.setItem(rkey, JSON.stringify(rmap));
    // 2) Estado del lote en el inventario de Lotes
    const lkey = 'mattika.lotes-admin.v1.' + scope;
    let larr = [];
    try { larr = JSON.parse(localStorage.getItem(lkey) || '[]'); } catch (e) {}
    const norm = (s) => String(s == null ? '' : s).replace(/[^a-z0-9]/gi, '').toUpperCase();
    let changed = false;
    larr.forEach(l => { if (norm(l.codigo || l.id) === norm(loteId)) { l.estado = 'Vendido'; changed = true; } });
    if (changed) localStorage.setItem(lkey, JSON.stringify(larr));
  } catch (e) {}
}

// Marca el estado de firma de una venta (por-firmar | firmado).
function setVentaEstado(empresaId, id, status) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const ventas = loadVentas(empresaId);
  const idx = ventas.findIndex(v => v.id === id);
  if (idx >= 0) { ventas[idx] = { ...ventas[idx], status }; saveVentas(empresaId, ventas); }
}

// Elimina una venta y LIBERA el lote ligado: quita su reserva y lo regresa a
// 'Disponible' en el inventario (amarre bidireccional inverso).
function eliminarVenta(empresaId, id) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const ventas = loadVentas(empresaId);
  const v = ventas.find(x => x.id === id);
  const next = ventas.filter(x => x.id !== id);
  saveVentas(empresaId, next);
  try {
    const inm = (v && v.inmueble) || {};
    if (inm.scope && inm.loteId) {
      const rkey = RESERVAS_PREFIX + inm.scope;
      const rmap = JSON.parse(localStorage.getItem(rkey) || '{}');
      if (rmap[inm.loteId] && (rmap[inm.loteId].ventaId === id || !rmap[inm.loteId].ventaId)) {
        delete rmap[inm.loteId];
        localStorage.setItem(rkey, JSON.stringify(rmap));
      }
      const lkey = 'mattika.lotes-admin.v1.' + inm.scope;
      const larr = JSON.parse(localStorage.getItem(lkey) || '[]');
      const norm = (s) => String(s == null ? '' : s).replace(/[^a-z0-9]/gi, '').toUpperCase();
      let changed = false;
      larr.forEach(l => { if (norm(l.codigo || l.id) === norm(inm.loteId) && l.estado === 'Vendido') { l.estado = 'Disponible'; changed = true; } });
      if (changed) localStorage.setItem(lkey, JSON.stringify(larr));
    }
  } catch (e) {}
  return next;
}

// Convierte una venta persistida a la forma de fila que consume la tabla
// de Contratos / Dashboard.
function ventaToRow(v) {
  const A = v.compradorA || {};
  const B = v.compradorB || null;
  const nombre = `${A.nombres || ''} ${A.apellidos || ''}`.trim();
  const nombreB = B ? `${B.nombres || ''} ${B.apellidos || ''}`.trim() : null;
  const inm = v.inmueble || {};
  const ter = v.terminos || {};
  const asesores = (window.getAsesoresEmpresa && window.getAsesoresEmpresa()) || (window.ASESORES || []);
  const asesor = asesores.find(a => a.id === (v.meta && v.meta.asesorId));
  return {
    id: v.id, code: v.code,
    tipo: 'compraventa', titularidad: v.titularidad || 'unico',
    cliente: nombre || 'Sin nombre', dni: A.dni || '',
    coClientes: nombreB ? [nombreB] : null,
    proyecto: inm.proyecto || '',
    unidad: `${inm.tipoInmueble || 'Lote'} ${inm.unidad || ''}${inm.manzana ? ` · Manzana ${inm.manzana}` : ''}`,
    partida: inm.partida ? `P-${inm.partida}` : '',
    precio: ter.precio || 0, inicial: ter.inicial || 0,
    cuotasN: (ter.cuotasPersonalizadas && ter.cuotasPersonalizadas.length) || ter.cuotas || 0,
    saldo: (ter.precio || 0) - (ter.inicial || 0),
    primeraCuota: ter.primeraCuota || null,
    asesor: asesor ? asesor.name : ((v.meta && v.meta.asesorNombre) || 'Equipo comercial'),
    equipo: (v.meta && v.meta.equipo) || '',
    canal: (v.meta && v.meta.canal) || '',
    periodo: (v.meta && v.meta.periodo) || '',
    fecha: v.fecha || (v.creadoEl || '').slice(0, 10),
    status: v.status || 'por-firmar',
    _venta: v, // referencia completa para reabrir en la vista previa
  };
}

// Filas de contratos = ventas persistidas (arriba) + demo (solo empresa Lumina).
// Un Asesor restringido solo ve SUS ventas (meta.asesorId === su usuario) y nada de demo.
function getContratosRows(empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const restringido = window.esAsesorRestringido?.();
  const myId = window.getUsuarioId?.();
  let ventas = loadVentas(empresaId);
  if (restringido) ventas = ventas.filter(v => (v.meta && v.meta.asesorId) === myId);
  const persistidas = ventas.map(ventaToRow);
  // Datos demo solo si la empresa aún no tiene ventas reales importadas.
  const demo = (!restringido && empresaId === 'lumina' && persistidas.length === 0)
    ? (window.CONTRATOS_RECIENTES || []) : [];
  return [...persistidas, ...demo];
}


// Reúne TODAS las reservas de una empresa (todos sus proyectos/etapas).
function gatherReservas(empresaId) {
  const out = [];
  if (!empresaId) return out;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || k.indexOf(RESERVAS_PREFIX) !== 0) continue;
    const scope = k.slice(RESERVAS_PREFIX.length); // empresaId.proyecto.etapa
    if (scope.indexOf(empresaId + '.') !== 0) continue;
    try {
      const map = JSON.parse(localStorage.getItem(k) || '{}');
      Object.values(map).forEach(r => out.push({ ...r, scope }));
    } catch (e) {}
  }
  return out;
}

// ── CICLO DE VIDA DE RESERVAS ───────────────────────────────────
// Estado efectivo de una reserva considerando el vencimiento del plazo.
//   activa | vencida | convertida | liberada | bloqueado
function reservaEstado(r, now) {
  const t = now || Date.now();
  if (!r) return 'activa';
  if (r.tipo === 'bloqueado') return 'bloqueado';
  if (r.tipo === 'venta' || r.estado === 'convertida' || r.ventaId) return 'convertida';
  if (r.estado === 'liberada') return 'liberada';
  if (r.tipo === 'separacion') {
    if (r.fechaVence && new Date(r.fechaVence).getTime() < t) return 'vencida';
    return 'activa';
  }
  return r.estado || 'activa';
}

// Modifica una reserva concreta dentro de su alcance (scope) y persiste.
function actualizarReserva(scope, loteId, patch) {
  const key = RESERVAS_PREFIX + scope;
  let map = {};
  try { map = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
  if (!map[loteId]) return null;
  const prev = map[loteId];
  const hist = Array.isArray(prev.historial) ? prev.historial.slice() : [];
  if (patch.__hist) { hist.push(patch.__hist); delete patch.__hist; }
  map[loteId] = { ...prev, ...patch, historial: hist };
  localStorage.setItem(key, JSON.stringify(map));
  return map[loteId];
}

// Libera una reserva (vuelve el lote a disponible) dejando rastro en el historial.
function liberarReserva(scope, loteId, por) {
  return actualizarReserva(scope, loteId, {
    estado: 'liberada',
    fechaLiberada: new Date().toISOString(),
    __hist: { accion: 'liberada', fecha: new Date().toISOString(), por: por || 'Sistema' },
  });
}

// Reúne las reservas de la empresa con su estado efectivo ya calculado.
function gatherReservasConEstado(empresaId) {
  const now = Date.now();
  return gatherReservas(empresaId).map(r => ({ ...r, _estado: reservaEstado(r, now) }));
}

// Busca un lote (precio, m2, etc.) en el store de Lotes de un alcance.
function loteFromScope(scope, loteId) {
  const norm = (s) => String(s == null ? '' : s).replace(/[^a-z0-9]/gi, '').toUpperCase();
  try {
    const arr = JSON.parse(localStorage.getItem('mattika.lotes-admin.v1.' + scope) || '[]');
    const target = norm(loteId);
    return arr.find(l => norm(l.codigo || l.id) === target) || null;
  } catch (e) { return null; }
}

// Nombre legible del proyecto desde el id en el alcance.
function proyectoNombreFromScope(scope) {
  try {
    const empId = scope.split('.')[0];
    const proyId = scope.split('.')[1];
    const emps = JSON.parse(localStorage.getItem('mattika.empresas.v1') || '[]');
    const emp = emps.find(e => e.id === empId);
    const p = emp?.proyectos?.find(x => x.id === proyId);
    return p?.nombre || proyId || '';
  } catch (e) { return ''; }
}

// ── CLIENTES ────────────────────────────────────────────────────
function loadClientesStore(empresaId) {
  try {
    const raw = localStorage.getItem(CLIENTES_PREFIX + empresaId);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Los clientes reales se derivan de las reservas importadas (deriveClientes).
  // Ya no se siembran clientes demo para no mezclar datos ficticios con reales.
  return [];
}
function saveClientesStore(empresaId, arr) {
  try { localStorage.setItem(CLIENTES_PREFIX + empresaId, JSON.stringify(arr)); } catch (e) {}
}

// Lista de clientes = registrados manualmente + compradores de reservas reales,
// fusionados por DNI. Cada cliente lleva sus operaciones (lotes apartados/vendidos).
function deriveClientes(empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const stored = loadClientesStore(empresaId);
  // Scoping de asesor: solo clientes ligados a SUS ventas (por DNI).
  const restringido = window.esAsesorRestringido?.();
  const myId = window.getUsuarioId?.();
  let misDnis = null;
  if (restringido) {
    misDnis = new Set();
    loadVentas(empresaId).filter(v => (v.meta && v.meta.asesorId) === myId).forEach(v => {
      if (v.compradorA?.dni) misDnis.add(String(v.compradorA.dni));
      if (v.compradorB?.dni) misDnis.add(String(v.compradorB.dni));
    });
  }
  const byDni = new Map();
  stored.forEach(c => byDni.set(String(c.dni), { ...c, operaciones: [] }));

  gatherReservas(empresaId).forEach(r => {
    const dni = String(r.dni || '').trim();
    if (!dni) return;
    let c = byDni.get(dni);
    if (!c) {
      c = {
        id: 'r-' + dni,
        nombres: r.nombres || '', apellidos: r.apellidos || '',
        dni, estadoCivil: '—',
        telefono: r.telefono || '', email: r.email || '',
        domicilio: '—', contratos: 0, ult: r.fecha ? r.fecha.slice(0,10) : '',
        operaciones: [],
        derivado: true,
      };
      byDni.set(dni, c);
    }
    const lote = loteFromScope(r.scope, r.loteId);
    c.operaciones.push({
      loteId: r.loteId,
      tipo: r.tipo, // separacion | venta
      proyecto: proyectoNombreFromScope(r.scope),
      precio: lote?.precio || null,
      fecha: r.fecha ? r.fecha.slice(0,10) : '',
    });
    if (r.fecha && (!c.ult || r.fecha.slice(0,10) > c.ult)) c.ult = r.fecha.slice(0,10);
  });

  return Array.from(byDni.values())
    .filter(c => !misDnis || misDnis.has(String(c.dni)))
    .map(c => ({
      ...c,
      contratos: c.operaciones ? c.operaciones.filter(o => o.tipo === 'venta').length : (c.contratos || 0),
    }));
}

// ── PAGOS ───────────────────────────────────────────────────────
function loadPagoEstado(empresaId) {
  try { return JSON.parse(localStorage.getItem(PAGOESTADO_PREFIX + empresaId) || '{}'); }
  catch (e) { return {}; }
}
function savePagoEstado(empresaId, map) {
  try { localStorage.setItem(PAGOESTADO_PREFIX + empresaId, JSON.stringify(map)); } catch (e) {}
}

// Genera el cronograma de cuotas a partir de las VENTAS reales de la empresa.
// Términos por defecto (inicial 20%, 36 meses, tasa de las condiciones / 8%).
// Devuelve cuotas con la misma forma que consume ScreenPagos.
function deriveCuotasFromReservas(empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const ventas = gatherReservas(empresaId).filter(r => r.tipo === 'venta');
  const ventasReales = loadVentas(empresaId);
  const pagado = loadPagoEstado(empresaId);
  const hoy = new Date();
  const out = [];
  // Scoping de asesor: solo las cuotas de SUS ventas.
  const restringido = window.esAsesorRestringido?.();
  const myId = window.getUsuarioId?.();
  const misVentaIds = restringido
    ? new Set(ventasReales.filter(v => (v.meta && v.meta.asesorId) === myId).map(v => v.id))
    : null;

  // Tasa desde condiciones comerciales si existe
  let tasa = 8;
  try {
    const cond = JSON.parse(localStorage.getItem('mattika.condiciones-comerciales.v1.' + empresaId) || 'null');
    if (cond?.tasaPorDefecto) tasa = cond.tasaPorDefecto;
  } catch (e) {}

  ventas.forEach(r => {
    // Asesor restringido: omitir reservas que no correspondan a SUS ventas.
    if (misVentaIds && !(r.ventaId && misVentaIds.has(r.ventaId))) return;
    // Si la reserva proviene de una venta del asistente, usamos su cronograma
    // REAL (inicial + cuotas exactas), no un cálculo genérico.
    const v = r.ventaId ? ventasReales.find(x => x.id === r.ventaId) : null;
    if (v) {
      const ter = v.terminos || {};
      const A = v.compradorA || {};
      const cliente = `${A.nombres||''} ${A.apellidos||''}`.trim() || 'Cliente';
      const code = v.code || `MTK-${r.loteId}`;
      const proyecto = (v.inmueble && v.inmueble.proyecto) || proyectoNombreFromScope(r.scope);
      const mk = (n, fecha, monto) => {
        const id = `${r.scope}:${r.loteId}:${n}`;
        const pe = pagado[id];
        const venceDate = fecha ? new Date(fecha) : new Date();
        let estado = 'pendiente', diasMora = 0;
        if (pe) estado = 'pagada';
        else if (venceDate < hoy) { estado = 'vencida'; diasMora = Math.floor((hoy - venceDate) / 86400000); }
        out.push({
          id, code, cliente, dni: A.dni || '',
          n, vence: venceDate.toISOString().slice(0, 10),
          monto: Math.round((+monto || 0) * 100) / 100,
          estado, diasMora, pagadoEl: pe?.fecha, operacion: pe?.operacion, metodo: pe?.metodo,
          loteId: r.loteId, proyecto,
        });
      };
      if ((+ter.inicial || 0) > 0) mk(0, (v.meta && v.meta.fechaContrato) || v.fecha, ter.inicial);
      const crono = (v.cronograma && v.cronograma.length)
        ? v.cronograma
        : ((window.generarCronograma && window.generarCronograma(ter)) || []);
      crono.forEach(c => mk(c.n, c.fecha, c.monto));
      return;
    }
    const lote = loteFromScope(r.scope, r.loteId);
    const precio = lote?.precio || 0;
    if (!precio) return;
    const plazo = 36, engPct = 20;
    const fin = (window.calcFinanciamiento && window.calcFinanciamiento({ precio, enganchePct: engPct, plazoMeses: plazo, tasaAnual: tasa }))
      || { enganche: precio * 0.2, mensualidad: (precio * 0.8) / plazo };
    const cliente = `${r.nombres || ''} ${r.apellidos || ''}`.trim() || 'Cliente';
    const code = `MTK-${r.loteId}`;
    const start = r.fecha ? new Date(r.fecha) : new Date();

    const push = (n, venceDate, monto) => {
      const id = `${r.scope}:${r.loteId}:${n}`;
      const pe = pagado[id];
      let estado, diasMora = 0;
      if (pe) estado = 'pagada';
      else if (venceDate < hoy) { estado = 'vencida'; diasMora = Math.floor((hoy - venceDate) / 86400000); }
      else estado = 'pendiente';
      out.push({
        id, code, cliente, dni: r.dni || '',
        n, vence: venceDate.toISOString().slice(0,10),
        monto: Math.round(monto * 100) / 100,
        estado, diasMora,
        pagadoEl: pe?.fecha, operacion: pe?.operacion, metodo: pe?.metodo,
        loteId: r.loteId, proyecto: proyectoNombreFromScope(r.scope),
      });
    };

    push(0, new Date(start), fin.enganche);
    for (let n = 1; n <= plazo; n++) {
      const d = new Date(start); d.setMonth(d.getMonth() + n);
      push(n, d, fin.mensualidad);
    }
  });
  return out;
}

// ── PUENTE CON EL MÓDULO COMERCIAL ──────────────────────────────
// El tablero Comercial y el CRM (barra lateral) comparten UNA sola
// fuente: mattika.ventas.v1.<empresa>. Estas funciones traducen entre
// el registro rico del CRM y la fila plana que consume el motor Comercial,
// para que lo que se registre en cualquier lado se replique en todo.
function _cSplitName(full) {
  const t = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (!t.length) return { nombres: '', apellidos: '' };
  if (t.length <= 2) return { nombres: t.slice(0, 1).join(' '), apellidos: t.slice(1).join(' ') };
  return { nombres: t.slice(0, t.length - 2).join(' '), apellidos: t.slice(t.length - 2).join(' ') };
}
function _cSynthDni(seed) {
  let h = 5381; const s = String(seed || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return String(10000000 + (h % 90000000));
}
function _cPeriodo(v) {
  if (v.meta && v.meta.periodo) return v.meta.periodo;
  const f = (v.fecha || (v.creadoEl || '')).slice(0, 10);
  const p = f.split('-'); // YYYY-MM-DD
  if (p.length >= 2 && p[0] && p[1]) return parseInt(p[1], 10) + '.' + p[0];
  // Sin fecha registrada: atribuir al mes actual para no dejar la venta huérfana.
  const now = new Date();
  return (now.getMonth() + 1) + '.' + now.getFullYear();
}
function _cLoteParts(v) {
  const inm = v.inmueble || {};
  const id = String(inm.loteId || '').toUpperCase();
  const mz = inm.manzana || (id.match(/^[A-Z]+/) || [''])[0];
  const lt = (id.match(/\d+/) || [''])[0];
  return { mz, lt };
}
// CRM (venta rica) → fila del motor Comercial.
function ventaToComercialRow(v) {
  const A = v.compradorA || {};
  const ex = v.extra || {};
  const { mz, lt } = _cLoteParts(v);
  const firmado = !!(ex.fFirma || v.status === 'firmado');
  const ter = v.terminos || {};
  const pagoTipo = ex.tipo || (((ter.cuotas || 0) > 0) ? 'Fraccionado' : 'Contado');
  return {
    id: v.id, _mkId: v.id, user: true,
    p: _cPeriodo(v),
    ej: (v.meta && v.meta.asesorNombre) || 'Equipo comercial',
    eq: (v.meta && v.meta.equipo) || 'E. Interno',
    cli: `${A.nombres || ''} ${A.apellidos || ''}`.trim(),
    et: ex.etapa || 'I',
    mz, lt,
    lista: +(ex.pLista) || +(ter.precio) || 0,
    desc: +(ex.descuento) || 0,
    fin: +(ter.precio) || 0,
    rec: +(ter.inicial) || 0,
    tipo: firmado ? pagoTipo : 'Separación',
    canal: (v.meta && v.meta.canal) || ex.canal || '—',
    fSep: ex.fSeparacion || '',
    fFirma: ex.fFirma || (firmado ? (v.fecha || '') : ''),
    visito: !!ex.visito,
    liderPart: !!ex.participoLider,
  };
}
// Fila del motor Comercial → venta rica del CRM (fusiona con la existente).
function comercialRowToVenta(row, existing) {
  const scope = (existing && existing.inmueble && existing.inmueble.scope)
    || (window.getScopeKey && window.getScopeKey()) || 'lumina.napoles.e1';
  const loteId = ((row.mz || '') + (row.lt || '')).toUpperCase();
  const firmado = !!row.fFirma;
  const np = _cSplitName(row.cli || '');
  const A = existing && existing.compradorA
    ? { ...existing.compradorA }
    : { nombres: '', apellidos: '', dni: '', estadoCivil: '—', telefono: '', email: '', ocupacion: '', domicilio: '—' };
  if ((row.cli || '').trim()) {
    A.nombres = np.nombres; A.apellidos = np.apellidos;
    if (!A.dni) A.dni = _cSynthDni(np.nombres + np.apellidos);
  }
  const precio = +row.fin || 0, inicial = +row.rec || 0;
  const cuotas = /Fraccionado/i.test(row.tipo || '')
    ? ((precio - inicial > 0) ? ((existing && existing.terminos && existing.terminos.cuotas) || 24) : 0)
    : 0;
  const proyecto = (existing && existing.inmueble && existing.inmueble.proyecto)
    || (window.getProyectoActual && window.getProyectoActual()?.nombre) || 'Nápoles';
  return {
    ...(existing || {}),
    id: (existing && existing.id) || row._mkId || undefined,
    titularidad: (existing && existing.titularidad) || 'unico',
    fecha: row.fFirma || row.fSep || (existing && existing.fecha),
    compradorA: A,
    inmueble: {
      ...(existing && existing.inmueble),
      scope, loteId, proyecto, tipoInmueble: 'Lote',
      unidad: (row.mz || '') + '-' + (row.lt || ''), manzana: row.mz || '',
      partida: (existing && existing.inmueble && existing.inmueble.partida) || '11550511',
    },
    terminos: { ...(existing && existing.terminos), precio, inicial, cuotas },
    meta: {
      ...(existing && existing.meta),
      asesorNombre: row.ej, equipo: row.eq, canal: row.canal,
      periodo: row.p, fechaContrato: row.fFirma || row.fSep || (existing && existing.fecha),
    },
    extra: {
      ...(existing && existing.extra),
      etapa: row.et, tipo: row.tipo === 'Separación' ? ((existing && existing.extra && existing.extra.tipo) || 'Fraccionado') : row.tipo,
      canal: row.canal, pLista: +row.lista || 0, descuento: +row.desc || 0,
      recaudo: inicial, visito: !!row.visito, participoLider: !!row.liderPart,
      fSeparacion: row.fSep || '', fFirma: row.fFirma || '',
    },
    _firmadoHint: firmado,
  };
}
// Carga TODAS las ventas de la empresa como filas del motor Comercial.
function loadComercialRows(empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  return loadVentas(empresaId).map(ventaToComercialRow);
}
// Firma de los campos mutables de una fila (para detectar cambios reales).
function _cRowSig(r) {
  return [r.p, r.ej, r.eq, r.cli, r.et, r.mz, r.lt, r.lista, r.desc, r.fin, r.rec,
    r.tipo, r.canal, r.fSep, r.fFirma, r.visito ? 1 : 0, r.liderPart ? 1 : 0].join('|');
}
// Reconciliación NO destructiva y EFICIENTE: solo escribe en el CRM las filas
// nuevas o realmente modificadas (evita reescribir las 60+ ventas en cada
// toggle → O(n²)). NUNCA elimina; la baja se hace con removeComercialRow().
function saveComercialRows(rows, empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  if (!empresaId) return rows;
  const prev = loadVentas(empresaId);
  const prevById = new Map(prev.map(v => [v.id, v]));
  rows.forEach(row => {
    const existing = row._mkId ? prevById.get(row._mkId) : null;
    if (existing && _cRowSig(row) === _cRowSig(ventaToComercialRow(existing))) return; // sin cambios
    const data = comercialRowToVenta(row, existing);
    const rec = registrarVenta(empresaId, data);
    row._mkId = rec.id; row.id = rec.id;
    const firmado = !!data._firmadoHint;
    if (firmado && rec.status !== 'firmado') setVentaEstado(empresaId, rec.id, 'firmado');
    if (!firmado && rec.status === 'firmado') setVentaEstado(empresaId, rec.id, 'por-firmar');
  });
  return rows;
}
// Baja explícita de una venta desde el tablero Comercial (libera su lote).
function removeComercialRow(mkId, empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  if (empresaId && mkId) eliminarVenta(empresaId, mkId);
}

Object.assign(window, {
  gatherReservas, loteFromScope, proyectoNombreFromScope,
  reservaEstado, actualizarReserva, liberarReserva, gatherReservasConEstado,
  loadClientesStore, saveClientesStore, deriveClientes,
  loadPagoEstado, savePagoEstado, deriveCuotasFromReservas,
  loadVentas, saveVentas, nextVentaCode, registrarVenta, setVentaEstado, eliminarVenta,
  upsertClienteFromComprador, ventaToRow, getContratosRows, vincularLoteConVenta,
  getAsesoresEmpresa, descargarCSV,
  ventaToComercialRow, comercialRowToVenta, loadComercialRows, saveComercialRows, removeComercialRow,
});

// Genera y descarga un archivo CSV (UTF-8 con BOM para Excel).
function descargarCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = (v == null ? '' : String(v));
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(';'), ...rows.map(r => r.map(esc).join(';'))];
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : filename + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Equipo comercial real de la empresa (usuarios activos), para selects de
// "Asesor responsable" en contratos. Si no hay usuarios, cae a la demo.
function getAsesoresEmpresa(empresaId) {
  empresaId = empresaId || window.getSesion?.()?.empresaId;
  const us = (window.loadUsuarios?.() || []).filter(u => u.empresaId === empresaId && u.activo !== false);
  if (!us.length) return (window.ASESORES || []);
  return us.map(u => ({
    id: u.id,
    name: u.nombre || u.usuario,
    role: u.rol,
    initials: (u.nombre || u.usuario || '?').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase(),
  }));
}
