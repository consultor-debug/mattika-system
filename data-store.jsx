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
  // Semilla solo para la empresa demo (Lumina / Nápoles)
  if (empresaId === 'lumina' && Array.isArray(window.CLIENTES_INICIAL)) {
    return window.CLIENTES_INICIAL.slice();
  }
  return [];
}
function saveClientesStore(empresaId, arr) {
  try { localStorage.setItem(CLIENTES_PREFIX + empresaId, JSON.stringify(arr)); } catch (e) {}
}

// Lista de clientes = registrados manualmente + compradores de reservas reales,
// fusionados por DNI. Cada cliente lleva sus operaciones (lotes apartados/vendidos).
function deriveClientes(empresaId) {
  const stored = loadClientesStore(empresaId);
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

  return Array.from(byDni.values()).map(c => ({
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
  const ventas = gatherReservas(empresaId).filter(r => r.tipo === 'venta');
  const pagado = loadPagoEstado(empresaId);
  const hoy = new Date();
  const out = [];

  // Tasa desde condiciones comerciales si existe
  let tasa = 8;
  try {
    const cond = JSON.parse(localStorage.getItem('mattika.condiciones-comerciales.v1.' + empresaId) || 'null');
    if (cond?.tasaPorDefecto) tasa = cond.tasaPorDefecto;
  } catch (e) {}

  ventas.forEach(r => {
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

Object.assign(window, {
  gatherReservas, loteFromScope, proyectoNombreFromScope,
  loadClientesStore, saveClientesStore, deriveClientes,
  loadPagoEstado, savePagoEstado, deriveCuotasFromReservas,
  getAsesoresEmpresa,
});

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
