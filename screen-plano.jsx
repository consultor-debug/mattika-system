// screen-plano.jsx — Visor de plano del proyecto + cotizador integrado.
// Click en un lote disponible → cotizador con simulador de financiamiento.
// Click en "Generar venta" → abre el wizard pre-rellenado con el lote.

// ═══════════════════════════════════════════════════════════════
// DATOS DEL PROYECTO — manzanas y lotes derivados del plano
// ═══════════════════════════════════════════════════════════════
const PLANO_VIEWBOX = { w: 2800, h: 2006 };

const MANZANAS_DEF = [
  { id:'A', x:144,  y:174,  w:1286, h:132,  cols:11, rows:1, m2:240, basePrecioM2:5400 },
  { id:'L', x:1554, y:174,  w:1072, h:132,  cols:9,  rows:1, m2:240, basePrecioM2:5400 },
  { id:'D', x:280,  y:384,  w:570,  h:484,  cols:4,  rows:5, m2:140, basePrecioM2:5200 },
  { id:'E', x:918,  y:384,  w:512,  h:320,  cols:9,  rows:2, m2:140, basePrecioM2:5200 },
  { id:'K', x:1554, y:384,  w:514,  h:320,  cols:9,  rows:2, m2:140, basePrecioM2:5200 },
  { id:'M', x:2120, y:384,  w:310,  h:484,  cols:2,  rows:9, m2:120, basePrecioM2:5100 },
  { id:'B', x:199,  y:400,  w:215,  h:1130, cols:2,  rows:11,m2:120, basePrecioM2:4800, rot:15 },
  { id:'O', x:2496, y:366,  w:138,  h:1268, cols:1,  rows:26,m2:120, basePrecioM2:4900 },
  { id:'F', x:918,  y:774,  w:322,  h:454,  cols:2,  rows:8, m2:140, basePrecioM2:5300 },
  { id:'J', x:1748, y:774,  w:324,  h:454,  cols:2,  rows:8, m2:140, basePrecioM2:5300 },
  { id:'C', x:632,  y:1192, w:208,  h:424,  cols:2,  rows:2, m2:130, basePrecioM2:5000 },
  { id:'G', x:918,  y:1296, w:512,  h:320,  cols:9,  rows:2, m2:140, basePrecioM2:5300 },
  { id:'I', x:1554, y:1296, w:520,  h:320,  cols:9,  rows:2, m2:140, basePrecioM2:5300 },
  { id:'N', x:2120, y:1180, w:320,  h:440,  cols:2,  rows:9, m2:120, basePrecioM2:5000 },
  { id:'H', x:546,  y:1694, w:2090, h:132,  cols:33, rows:1, m2:120, basePrecioM2:5000 },
];

// PRNG estable
function _rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
const _PESO = { disponible:.55, separado:.18, vendido:.23, bloqueado:.04 };
function _pickEstado(r) {
  const v = r(); let acc = 0;
  for (const e of Object.keys(_PESO)) { acc += _PESO[e]; if (v < acc) return e; }
  return 'disponible';
}
const _ORIENT = ['Norte','Sur','Oriente','Poniente','Nor-Oriente','Sur-Poniente'];

function buildLotes() {
  const rng = _rng(0x10C);
  const out = [];
  for (const m of MANZANAS_DEF) {
    const lotW = m.w / m.cols, lotH = m.h / m.rows;
    let n = 1;
    for (let row = 0; row < m.rows; row++) {
      for (let col = 0; col < m.cols; col++) {
        const variacion = 1 + (rng() - 0.5) * 0.10;
        const m2 = Math.round(m.m2 * variacion);
        const frente = 7;
        const fondo = Math.round((m2 / frente) * 10) / 10;
        const vp = 1 + (rng() - 0.5) * 0.08;
        const esquina = (row === 0 || row === m.rows-1) && (col === 0 || col === m.cols-1);
        const premio = esquina ? 1.06 : 1;
        const precioM2 = Math.round(m.basePrecioM2 * vp * premio / 50) * 50;
        const precio = Math.round((precioM2 * m2) / 1000) * 1000;
        out.push({
          id: `${m.id}-${String(n).padStart(2,'0')}`,
          manzana: m.id, numero: n,
          frente, fondo, m2, precioM2, precio,
          estado: _pickEstado(rng),
          esquina, orientacion: _ORIENT[Math.floor(rng() * _ORIENT.length)],
          local: { x: col*lotW, y: row*lotH, w: lotW, h: lotH },
          manzanaRect: { x:m.x, y:m.y, w:m.w, h:m.h, rot: m.rot || 0 },
        });
        n++;
      }
    }
  }
  return out;
}

const LOTES = buildLotes();

// ═══════════════════════════════════════════════════════════════
// RESERVAS — store local persistente para apartar / vender lotes
// con sólo 3 datos (DNI, teléfono, correo). Los documentos se
// pueden generar después.
// ═══════════════════════════════════════════════════════════════
// ── Alcance (scope) activo: empresa · proyecto · etapa ──────────
// Todo el dato comercial del plano se guarda bajo este sufijo para que
// cada proyecto/etapa de cada empresa sea independiente.
function _scope() { return window.getScopeKey?.() || '_default._default._default'; }

const RESERVAS_STORAGE_KEY = 'mattika.reservas.v1';

function loadReservas() {
  try {
    const raw = localStorage.getItem(`${RESERVAS_STORAGE_KEY}.${_scope()}`);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}
function saveReservas(map) {
  try { localStorage.setItem(`${RESERVAS_STORAGE_KEY}.${_scope()}`, JSON.stringify(map)); } catch (e) {}
}

// "Base de datos" demo de RENIEC. En producción se reemplaza por la
// integración real. Si el DNI no está en la base, devuelve "no
// encontrado" para que el usuario digite a mano sin que la API
// invente nombres equivocados.
const _RENIEC_DB = {
  '70123456': { nombres: 'Juan Carlos',  apellidos: 'Pérez López' },
  '45678912': { nombres: 'María Elena',  apellidos: 'Rodríguez Salas' },
  '78451236': { nombres: 'Andrea',        apellidos: 'Jiménez Castro' },
  '40123987': { nombres: 'Renzo',         apellidos: 'Tapia Vargas' },
  '12345678': { nombres: 'Carlos Alberto',apellidos: 'García Mendoza' },
};
function consultaReniec(dni) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!/^\d{8}$/.test(dni)) {
        reject(new Error('DNI inválido (debe tener 8 dígitos)'));
        return;
      }
      const hit = _RENIEC_DB[dni];
      if (hit) { resolve(hit); return; }
      // No hay coincidencia en la base demo. NO inventamos datos:
      // el usuario debe digitar nombres y apellidos manualmente.
      reject(new Error('Sin coincidencia en RENIEC · digite los datos manualmente'));
    }, 650);
  });
}

// ═══════════════════════════════════════════════════════════════
// VÉRTICES — polígonos editables
// Cada lote arranca como rectángulo; se guarda override en localStorage.
// ═══════════════════════════════════════════════════════════════
function computeVerticesFromRect(l) {
  const m = l.manzanaRect;
  const lx = m.x + l.local.x;
  const ly = m.y + l.local.y;
  const w = l.local.w, h = l.local.h;
  let pts = [[lx, ly], [lx+w, ly], [lx+w, ly+h], [lx, ly+h]];
  const rot = m.rot || 0;
  if (rot) {
    const rad = rot * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const cx = m.x, cy = m.y + m.h/2;
    pts = pts.map(([x,y]) => {
      const dx = x - cx, dy = y - cy;
      return [cx + dx*cos - dy*sin, cy + dx*sin + dy*cos];
    });
  }
  return pts.map(([x,y]) => ({ x, y }));
}
LOTES.forEach(l => { l.verticesBase = computeVerticesFromRect(l); });

const VERTS_KEY = 'mattika.plano.vertices.v1';
function loadVertOverrides() {
  try { return JSON.parse(localStorage.getItem(`${VERTS_KEY}.${_scope()}`) || '{}'); } catch (e) { return {}; }
}
function saveVertOverrides(o) {
  try { localStorage.setItem(`${VERTS_KEY}.${_scope()}`, JSON.stringify(o)); } catch (e) {}
}
function getLoteVerts(lote, overrides) {
  return overrides?.[lote.id] || lote.verticesBase;
}

// Lotes EXTRA (dibujados por el usuario) — persistidos aparte
const EXTRAS_KEY = 'mattika.plano.lotesExtra.v1';
function loadLotesExtra() {
  try { return JSON.parse(localStorage.getItem(`${EXTRAS_KEY}.${_scope()}`) || '[]'); } catch (e) { return []; }
}
function saveLotesExtra(arr) {
  try { localStorage.setItem(`${EXTRAS_KEY}.${_scope()}`, JSON.stringify(arr)); } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// ESTADOS — Mattika tokens
// ═══════════════════════════════════════════════════════════════
const ESTADO_TOKENS = {
  disponible: { fill:'#dfe7f9', stroke:'#3b67d0', text:'#0F2A6B', label:'Disponible' },
  separado:   { fill:'#fbedd5', stroke:'#A86A12', text:'#5C3A0E', label:'Separado' },
  vendido:    { fill:'#d4d8e0', stroke:'#7a8398', text:'#3a3f4d', label:'Vendido' },
  bloqueado:  { fill:'#1f2a44', stroke:'#0B1A33', text:'#E8EDF7', label:'No disponible' },
};

// Util de moneda en soles
const fmtPEN  = (n) => new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:0 }).format(n);
const fmtPENc = (n) => new Intl.NumberFormat('es-PE', { style:'currency', currency:'PEN', maximumFractionDigits:2 }).format(n);

function calcFinanciamiento({ precio, enganchePct, plazoMeses, tasaAnual }) {
  const enganche = precio * (enganchePct / 100);
  const montoFinanciado = precio - enganche;
  const i = tasaAnual / 12 / 100;
  let mensualidad = 0;
  if (i === 0) mensualidad = montoFinanciado / plazoMeses;
  else {
    const f = Math.pow(1 + i, plazoMeses);
    mensualidad = (montoFinanciado * i * f) / (f - 1);
  }
  const totalPagado = enganche + mensualidad * plazoMeses;
  const intereses = totalPagado - precio;
  return { enganche, montoFinanciado, mensualidad, totalPagado, intereses };
}

// ═══════════════════════════════════════════════════════════════
// VISOR DEL PLANO
// ═══════════════════════════════════════════════════════════════
const PlanoViewer = ({ lotes, selectedId, onSelect, filter, editMode, vertOverrides, onMoveVertex, onAddVertex, onRemoveVertex, onSetVertices, drawing, onDrawClick, onDrawFinish, bgImage, showEmptyHint, canUpload, onUploadPlano }) => {
  const [hover, setHover] = React.useState(null);
  const [tip, setTip] = React.useState(null);
  const [transform, setTransform] = React.useState({ scale:1, x:0, y:0 });
  const wrapRef = React.useRef(null);
  const panRef = React.useRef({ active:false, moved:false });

  const VB = PLANO_VIEWBOX;

  const clampScale = (s) => Math.min(8, Math.max(0.5, s));
  const zoomAt = (cx, cy, factor) => {
    setTransform((cur) => {
      const ns = clampScale(cur.scale * factor);
      const k = ns / cur.scale;
      return { scale: ns, x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k };
    });
  };
  const zoomIn = () => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) zoomAt(r.width/2, r.height/2, 1.3);
  };
  const zoomOut = () => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) zoomAt(r.width/2, r.height/2, 1/1.3);
  };
  const resetZoom = () => setTransform({ scale:1, x:0, y:0 });

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.18 : 1/1.18;
      zoomAt(cx, cy, factor);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDownPan = (e) => {
    const isLot = e.target.closest('[data-lote]') || e.target.closest('[data-vertex]');
    if (isLot) return;
    if (e.button !== 0 && e.button !== 1) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = transform.x, origY = transform.y;
    panRef.current = { active:true, moved:false };
    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) panRef.current.moved = true;
      setTransform((cur) => ({ ...cur, x: origX + dx, y: origY + dy }));
    };
    const up = () => {
      panRef.current.active = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  const swallowIfPanned = (e) => {
    if (panRef.current.moved) {
      e.stopPropagation(); e.preventDefault();
      panRef.current.moved = false;
    }
  };

  const matches = React.useCallback((l) => {
    if (filter.estado !== 'todos' && l.estado !== filter.estado) return false;
    if (l.m2 < filter.m2Min || l.m2 > filter.m2Max) return false;
    if (l.precio < filter.precioMin || l.precio > filter.precioMax) return false;
    if (filter.busqueda) {
      const q = filter.busqueda.toLowerCase().replace(/[\s-]/g, '');
      const hay = `${l.id} ${l.manzana}${l.numero} m-${l.manzana} manzana${l.manzana}`.toLowerCase().replace(/[\s-]/g, '');
      if (!hay.includes(q)) return false;
    }
    return true;
  }, [filter]);

  const porManzana = React.useMemo(() => {
    const map = {};
    for (const l of lotes) (map[l.manzana] = map[l.manzana] || []).push(l);
    return map;
  }, [lotes]);

  const handleMove = (l, e) => {
    setHover(l.id);
    const rect = wrapRef.current.getBoundingClientRect();
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top, lote: l });
  };

  const renderLote = (l) => {
    const t = ESTADO_TOKENS[l.estado];
    const isHover = hover === l.id;
    const isSel = selectedId === l.id;
    const dim = !matches(l);
    const verts = getLoteVerts(l, vertOverrides);
    const cx = (verts[0].x + verts[1].x + verts[2].x + verts[3].x) / 4;
    const cy = (verts[0].y + verts[1].y + verts[2].y + verts[3].y) / 4;
    const bbW = Math.max(...verts.map(v=>v.x)) - Math.min(...verts.map(v=>v.x));
    const bbH = Math.max(...verts.map(v=>v.y)) - Math.min(...verts.map(v=>v.y));
    const points = verts.map(v => `${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');
    const cursor = editMode
      ? (isSel ? 'move' : 'pointer')
      : (l.estado === 'bloqueado' ? 'not-allowed' : 'pointer');

    return (
      <g key={l.id}
         style={{ cursor }}
         onMouseEnter={(e) => handleMove(l, e)}
         onMouseMove={(e) => handleMove(l, e)}
         onClick={() => {
           if (editMode) onSelect(l.id);
           else if (l.estado !== 'bloqueado') onSelect(l.id);
         }}
         opacity={dim ? 0.10 : 0.72}>
        <polygon
          data-lote={l.id}
          points={points}
          fill={t.fill}
          stroke={isSel ? (editMode ? 'var(--brand)' : '#0B1A33') : t.stroke}
          strokeWidth={isSel ? 4 : isHover ? 2.5 : 1}
        />
        {bbW > 22 && bbH > 16 && (() => {
          const label = `${l.manzana}${l.numero}`;
          const fs = 20; // tamaño uniforme para TODAS las etiquetas
          return (
          <text x={cx} y={cy + fs * 0.34}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fontSize={fs}
                fill={t.text}
                style={{ pointerEvents:'none', fontWeight: isSel ? 700 : 600 }}>
            {label}
          </text>
          );
        })()}
      </g>
    );
  };

  // Handles de edición — se dibujan encima de TODO, solo para el lote seleccionado
  const renderEditHandles = () => {
    if (!editMode || !selectedId) return null;
    const l = lotes.find(x => x.id === selectedId);
    if (!l) return null;
    const verts = getLoteVerts(l, vertOverrides);
    // Escalar tamaño del handle inversamente al zoom para que se vea constante en pantalla
    const k = Math.max(transform.scale, 0.6);
    const r = 32 / k;
    const rInner = 10 / k;
    const rMid = 18 / k;
    const sw = 4 / k;
    return (
      <g className="plano-handles">
        {/* halo del polígono seleccionado */}
        <polygon points={verts.map(v=>`${v.x},${v.y}`).join(' ')}
                 fill="none" stroke="var(--brand)" strokeWidth={sw} strokeDasharray={`${10/k} ${6/k}`}
                 pointerEvents="none"/>

        {/* Handles fantasma en cada arista para AGREGAR vértice */}
        {verts.map((v, i) => {
          const next = verts[(i+1) % verts.length];
          const mx = (v.x + next.x) / 2;
          const my = (v.y + next.y) / 2;
          return (
            <g key={`mid-${i}`} data-midedge={i} data-lote-id={l.id} style={{ cursor: 'copy' }}>
              <circle cx={mx} cy={my} r={rMid} fill="white" stroke="var(--brand)" strokeWidth={sw * 0.7}
                      strokeDasharray={`${3/k} ${2/k}`} opacity="0.7"/>
              <text x={mx} y={my + 5/k} textAnchor="middle"
                    fontSize={16/k} fontWeight="700" fill="var(--brand)"
                    pointerEvents="none">+</text>
            </g>
          );
        })}

        {/* Handles principales — vértices reales */}
        {verts.map((v, i) => (
          <g key={i} data-vertex={i} data-lote-id={l.id} style={{ cursor: 'grab' }}>
            <circle cx={v.x} cy={v.y} r={r * 1.4} fill="rgba(122, 77, 181, 0.08)"/>
            <circle cx={v.x} cy={v.y} r={r} fill="white" stroke="var(--brand)" strokeWidth={sw}/>
            <circle cx={v.x} cy={v.y} r={rInner} fill="var(--brand)" pointerEvents="none"/>
          </g>
        ))}
      </g>
    );
  };

  // Drag de vértice
  const onSvgMouseDown = (e) => {
    if (!editMode) return;

    // 1) Drag de vértice individual
    const handle = e.target.closest('[data-vertex]');
    if (handle) {
      e.stopPropagation();
      e.preventDefault();
      const idx = +handle.getAttribute('data-vertex');
      const loteId = handle.getAttribute('data-lote-id');
      const svg = handle.closest('svg');
      const ctm = svg.getScreenCTM().inverse();
      const screenToSvg = (clientX, clientY) => {
        const pt = svg.createSVGPoint();
        pt.x = clientX; pt.y = clientY;
        return pt.matrixTransform(ctm);
      };
      const move = (ev) => {
        const p = screenToSvg(ev.clientX, ev.clientY);
        onMoveVertex?.(loteId, idx, p.x, p.y);
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      return;
    }

    // 2) Drag del POLÍGONO entero — cuerpo de un lote
    const lotePoly = e.target.closest('[data-lote]');
    if (lotePoly && !drawing?.active) {
      const loteId = lotePoly.getAttribute('data-lote');
      const lote = lotes.find(l => l.id === loteId);
      if (!lote) return;
      e.stopPropagation();
      e.preventDefault();
      // Seleccionar si no estaba seleccionado
      if (selectedId !== loteId) onSelect?.(loteId);
      const svg = lotePoly.closest('svg');
      const ctm = svg.getScreenCTM().inverse();
      const screenToSvg = (clientX, clientY) => {
        const pt = svg.createSVGPoint();
        pt.x = clientX; pt.y = clientY;
        return pt.matrixTransform(ctm);
      };
      const start = screenToSvg(e.clientX, e.clientY);
      const origVerts = getLoteVerts(lote, vertOverrides).map(v => ({...v}));
      let didMove = false;
      const move = (ev) => {
        const p = screenToSvg(ev.clientX, ev.clientY);
        const dx = p.x - start.x;
        const dy = p.y - start.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) didMove = true;
        if (didMove) {
          onSetVertices?.(loteId, origVerts.map(v => ({ x: v.x + dx, y: v.y + dy })));
        }
      };
      const up = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      return;
    }
  };

  // Click en handle "+" en el medio de una arista → AGREGA vértice ahí
  const onSvgClick = (e) => {
    if (!editMode) return;
    // Modo dibujo: cualquier click sobre el SVG (no sobre un lote existente) agrega punto
    if (drawing?.active) {
      // Ignorar clicks sobre lotes existentes o handles
      if (e.target.closest('[data-lote]') || e.target.closest('[data-vertex]') || e.target.closest('[data-midedge]')) return;
      const svg = e.currentTarget;
      const ctm = svg.getScreenCTM().inverse();
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(ctm);
      onDrawClick?.({ x: Math.round(p.x), y: Math.round(p.y) });
      return;
    }
    const mid = e.target.closest('[data-midedge]');
    if (!mid) return;
    e.stopPropagation();
    const edgeIdx = +mid.getAttribute('data-midedge');
    const loteId = mid.getAttribute('data-lote-id');
    onAddVertex?.(loteId, edgeIdx);
  };

  // Tracker del cursor para mostrar previa de la siguiente arista mientras dibuja
  const [drawHover, setDrawHover] = React.useState(null);
  const onSvgMouseMove = (e) => {
    if (!drawing?.active) return;
    const svg = e.currentTarget;
    const ctm = svg.getScreenCTM().inverse();
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(ctm);
    setDrawHover({ x: p.x, y: p.y });
  };

  // Preview en vivo del polígono que está dibujando el usuario
  const renderDrawingPreview = () => {
    if (!drawing?.active) return null;
    const k = Math.max(transform.scale, 0.6);
    const sw = 4 / k;
    const r = 18 / k;
    const rInner = 6 / k;
    const pts = drawing.points;
    if (!pts.length) return null;
    const polyPts = pts.map(p => `${p.x},${p.y}`).join(' ');
    const closable = pts.length >= 3;
    return (
      <g className="plano-drawing" pointerEvents="none">
        {/* Polígono en curso — con relleno semi cuando hay 3+ puntos */}
        {closable && (
          <polygon points={polyPts}
                   fill="color-mix(in oklab, var(--brand) 25%, transparent)"
                   stroke="var(--brand)" strokeWidth={sw} strokeDasharray={`${10/k} ${5/k}`}/>
        )}
        {!closable && (
          <polyline points={polyPts} fill="none"
                    stroke="var(--brand)" strokeWidth={sw} strokeDasharray={`${10/k} ${5/k}`}/>
        )}
        {/* Línea de previa al cursor */}
        {drawHover && (
          <line x1={pts[pts.length - 1].x} y1={pts[pts.length - 1].y}
                x2={drawHover.x} y2={drawHover.y}
                stroke="var(--brand)" strokeWidth={sw}
                strokeDasharray={`${4/k} ${4/k}`} opacity="0.5"/>
        )}
        {/* Línea de cierre punteada hacia el primer punto */}
        {closable && drawHover && (
          <line x1={drawHover.x} y1={drawHover.y}
                x2={pts[0].x} y2={pts[0].y}
                stroke="var(--brand)" strokeWidth={sw * 0.6}
                strokeDasharray={`${3/k} ${5/k}`} opacity="0.35"/>
        )}
        {/* Puntos */}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={r} fill="white"
                    stroke={i === 0 ? '#1ea968' : 'var(--brand)'} strokeWidth={sw}/>
            <circle cx={p.x} cy={p.y} r={rInner}
                    fill={i === 0 ? '#1ea968' : 'var(--brand)'}/>
          </g>
        ))}
      </g>
    );
  };

  // Doble-click en handle de vértice → ELIMINA (mínimo 3)
  // Doble-click cualquier otro lugar mientras dibuja → cierra el polígono
  const onSvgDoubleClick = (e) => {
    if (!editMode) return;
    if (drawing?.active) {
      e.stopPropagation();
      onDrawFinish?.();
      return;
    }
    const handle = e.target.closest('[data-vertex]');
    if (!handle) return;
    e.stopPropagation();
    const idx = +handle.getAttribute('data-vertex');
    const loteId = handle.getAttribute('data-lote-id');
    onRemoveVertex?.(loteId, idx);
  };

  return (
    <div className="plano-wrap" ref={wrapRef}
         onMouseDown={onMouseDownPan}
         onClickCapture={swallowIfPanned}>
      <div className="plano-inner" style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: '0 0',
        transition: panRef.current.active ? 'none' : 'transform 0.08s ease-out',
        aspectRatio: `${VB.w} / ${VB.h}`,
      }}>
        {bgImage
          ? <img className="plano-bg" src={bgImage} alt="" draggable="false"/>
          : <div className="plano-bg plano-bg-empty"/>}
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="xMidYMid meet" className="plano-svg"
             style={{ cursor: drawing?.active ? 'crosshair' : undefined }}
             onMouseDown={onSvgMouseDown}
             onClick={onSvgClick}
             onDoubleClick={onSvgDoubleClick}
             onMouseMove={onSvgMouseMove}
             onMouseLeave={() => { setHover(null); setTip(null); }}>
          <rect x="0" y="0" width={VB.w} height={VB.h} fill="#FFFFFF" opacity="0.12"/>
          {lotes.map(renderLote)}
          {renderEditHandles()}
          {drawing?.active && renderDrawingPreview()}
        </svg>
      </div>

      {showEmptyHint && (
        <div className="plano-empty-hint">
          <div className="plano-empty-card">
            <div className="plano-empty-ic"><Icon name="layers" size={30}/></div>
            <h3>Este proyecto aún no tiene plano</h3>
            <p>{canUpload
              ? 'Sube la imagen del plano de la etapa y luego dibuja los polígonos comerciales de cada lote directamente sobre él.'
              : 'Aún no se ha cargado el plano de esta etapa. Pide a un jefe comercial o administrador que lo suba.'}</p>
            {canUpload && (
              <button className="btn primary" onClick={onUploadPlano}>
                <Icon name="upload" size={14}/> Subir plano de la etapa
              </button>
            )}
          </div>
        </div>
      )}

      {tip && (
        <div className="plano-tip" style={{
          left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth || 600) - 240),
          top: tip.y + 14,
        }}>
          <div className="plano-tip-id">Lote {tip.lote.id}</div>
          <div className="plano-tip-row"><span>Superficie</span><b>{tip.lote.m2} m²</b></div>
          <div className="plano-tip-row"><span>Precio</span><b>{fmtPEN(tip.lote.precio)}</b></div>
          <div className="plano-tip-row">
            <span>Estado</span>
            <b><span className="dot" style={{ background: ESTADO_TOKENS[tip.lote.estado].fill, borderColor: ESTADO_TOKENS[tip.lote.estado].stroke }}/>{ESTADO_TOKENS[tip.lote.estado].label}</b>
          </div>
        </div>
      )}

      <div className="zoom-ctl" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={zoomIn} title="Acercar">+</button>
        <button onClick={zoomOut} title="Alejar">−</button>
        <button onClick={resetZoom} title="Reiniciar" className="reset"
                disabled={transform.scale === 1 && transform.x === 0 && transform.y === 0}>
          {Math.round(transform.scale * 100)}%
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COTIZADOR — panel lateral con simulador
// ═══════════════════════════════════════════════════════════════
const Cotizador = ({ lote, reserva, puedeVender = true, onGenerarVenta, onApartar, onCancelarReserva, onToast }) => {
  // Cargar condiciones comerciales (configurables desde Admin → Condiciones Comerciales)
  const [cond] = React.useState(() => loadCondiciones());

  const [modo, setModo] = React.useState('financiado');
  const [enganche, setEnganche] = React.useState(() => lote?.precio ? Math.round(lote.precio * 0.20) : 0);
  const [plazo, setPlazo] = React.useState(36);
  const [tasa, setTasa] = React.useState(cond.tasaPorDefecto || 8);
  const [descuento, setDescuento] = React.useState(0);
  const [excepcionEstado, setExcepcionEstado] = React.useState('none'); // none | pending | approved
  const [excepcionRest, setExcepcionRest] = React.useState(cond.tiempoExcepcion);
  const [vbEstado, setVbEstado] = React.useState('none'); // none | pending | approved
  const [vbRest, setVbRest] = React.useState(cond.tiempoVB);
  const [vbAprobador, setVbAprobador] = React.useState(null); // {rol, nombre, fecha}
  const [vbPickerOpen, setVbPickerOpen] = React.useState(false);
  const prontoPagoPct = 5;

  // Límites de descuento según modo (vienen de las condiciones comerciales)
  const descMaxBase = modo === 'contado' ? cond.dscMaxContado : cond.dscMaxFinanciamiento;
  const descMaxExcepcion = modo === 'contado' ? cond.dscExcepcionContado : cond.dscExcepcionFinanciamiento;
  // El tope efectivo depende del nivel de aprobación
  const descMaxActual = vbEstado === 'approved' ? Infinity
                      : excepcionEstado === 'approved' ? descMaxExcepcion
                      : descMaxBase;
  const descTopeMostrar = vbEstado === 'approved' ? descuento || descMaxExcepcion
                        : descMaxActual;

  // Reset al cambiar de lote
  React.useEffect(() => {
    if (lote?.precio) setEnganche(Math.round(lote.precio * 0.20));
    setDescuento(0);
    setExcepcionEstado('none');
    setExcepcionRest(cond.tiempoExcepcion);
    setVbEstado('none');
    setVbRest(cond.tiempoVB);
    setVbAprobador(null);
    setVbPickerOpen(false);
  }, [lote?.id]);

  // Al cambiar modo, clamp el descuento al nuevo máximo (excepto si tiene VB)
  React.useEffect(() => {
    if (vbEstado !== 'approved') {
      setDescuento(d => Math.min(d, descMaxActual));
    }
  }, [modo, descMaxActual, vbEstado]);

  // Cuenta regresiva de la excepción
  React.useEffect(() => {
    if (excepcionEstado !== 'pending') return;
    const interval = setInterval(() => {
      setExcepcionRest(r => {
        if (r <= 0.1) {
          setExcepcionEstado('approved');
          clearInterval(interval);
          onToast?.('✓ Excepción aprobada — nuevo máximo S/ ' + descMaxExcepcion.toLocaleString('es-PE'));
          return 0;
        }
        return r - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [excepcionEstado, descMaxExcepcion, onToast]);

  // Cuenta regresiva del VB
  React.useEffect(() => {
    if (vbEstado !== 'pending') return;
    const interval = setInterval(() => {
      setVbRest(r => {
        if (r <= 0.1) {
          // Auto-aprobado al terminar el tiempo (lo registra el aprobador que el usuario eligió)
          clearInterval(interval);
          setVbEstado('approved');
          onToast?.(`✓ VB Gerencial aprobado por ${vbAprobador?.rol || 'Gerencia'}`);
          return 0;
        }
        return r - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [vbEstado, vbAprobador, onToast]);

  const solicitarExcepcion = () => {
    setExcepcionEstado('pending');
    setExcepcionRest(cond.tiempoExcepcion);
    onToast?.('Solicitando aprobación al supervisor…');
  };

  const solicitarVB = (rol) => {
    const ahora = new Date();
    setVbAprobador({
      rol,
      nombre: rol === 'Gerente General' ? 'Lucía Mendoza' : 'Pedro Cárdenas',
      fecha: ahora.toISOString(),
    });
    setVbEstado('pending');
    setVbRest(cond.tiempoVB);
    setVbPickerOpen(false);
    onToast?.(`Solicitando VB a ${rol}…`);
  };

  const enganchePct = lote?.precio ? (enganche / lote.precio) * 100 : 0;

  if (!lote) {
    return (
      <div className="cot-empty">
        <div className="cot-empty-icon">
          <Icon name="building" size={36}/>
        </div>
        <h3>Selecciona un lote en el plano</h3>
        <p>Toca cualquier lote disponible para ver el detalle y cotizar el precio en contado o con financiamiento.</p>
      </div>
    );
  }

  const t = ESTADO_TOKENS[lote.estado];
  const disponible = lote.estado === 'disponible';
  const separado = lote.estado === 'separado';
  // Aplicar descuento al precio antes de los cálculos
  const precioNeto = Math.max(0, lote.precio - descuento);
  const fin = calcFinanciamiento({ precio: precioNeto, enganchePct: precioNeto ? (enganche / precioNeto) * 100 : 0, plazoMeses: plazo, tasaAnual: tasa });
  const descContado = precioNeto * (prontoPagoPct / 100);
  const precioContado = precioNeto - descContado;
  const descPct = lote.precio ? (descuento / lote.precio) * 100 : 0;

  return (
    <div className="cot">
      <header className="cot-head">
        <div className="hstack between">
          <div>
            <div className="cot-eyebrow">Lote {lote.id}</div>
            <div className="cot-title">Manzana {lote.manzana} · N° {lote.numero}</div>
          </div>
          <span className="cot-pill" style={{
            background: t.fill, color: t.text, borderColor: t.stroke,
          }}>
            <span className="cot-pill-dot" style={{ background: t.stroke }}/>
            {t.label}
          </span>
        </div>

        <dl className="cot-specs">
          <div><dt>Superficie</dt><dd>{lote.m2} <small>m²</small></dd></div>
          <div><dt>Frente</dt><dd>{lote.frente} <small>m</small></dd></div>
          <div><dt>Fondo</dt><dd>{lote.fondo} <small>m</small></dd></div>
          <div><dt>Orientación</dt><dd className="small-dd">{lote.orientacion}</dd></div>
        </dl>
      </header>

      <div className="cot-precio">
        <div className="cot-precio-label">Precio total</div>
        <div className="cot-precio-num">{fmtPEN(lote.precio)}</div>
        <div className="cot-precio-sub">{fmtPEN(lote.precioM2)} / m²</div>
      </div>

      {!disponible && (
        <div className="cot-aviso">
          {separado && 'Este lote está separado. Puedes ponerte en lista de espera o consultar con el asesor.'}
          {lote.estado === 'vendido' && 'Este lote ya fue vendido.'}
          {lote.estado === 'bloqueado' && 'Este lote no está disponible para la venta.'}
        </div>
      )}

      {(disponible || separado) && (
        <>
          <div className="cot-modo">
            <button className={modo === 'contado' ? 'on' : ''} onClick={() => setModo('contado')}>Contado</button>
            <button className={modo === 'financiado' ? 'on' : ''} onClick={() => setModo('financiado')}>Financiamiento</button>
          </div>

          {/* ── Descuento (común a ambos modos) ── */}
          <div className="cot-body">
            <div className="cot-control">
              <div className="cot-control-row">
                <label>Descuento</label>
                <span className="cot-control-val">
                  {descuento > 0 ? `${descPct.toFixed(2)}% off` : 'sin descuento'}
                </span>
              </div>
              <div className="input-prefix cot-enganche-input">
                <span className="px">S/</span>
                <input type="number"
                       min="0"
                       max={descMaxActual === Infinity ? undefined : descMaxActual}
                       step="50"
                       value={descuento}
                       onChange={(e) => {
                         const cap = descMaxActual === Infinity ? lote.precio : descMaxActual;
                         setDescuento(Math.min(cap, Math.max(0, +e.target.value || 0)));
                       }}/>
              </div>
              <div className="cot-discount-meter">
                <div className="cot-discount-bar">
                  <div className="cot-discount-fill"
                       data-over={descuento > descMaxBase ? 'true' : 'false'}
                       data-vb={vbEstado === 'approved' ? 'true' : 'false'}
                       style={{width: descMaxActual === Infinity
                         ? `${Math.min(100, (descuento / Math.max(descuento, descMaxExcepcion)) * 100)}%`
                         : `${Math.min(100, (descuento/descMaxActual)*100)}%`}}/>
                  {excepcionEstado === 'approved' && vbEstado !== 'approved' && (
                    <div className="cot-discount-tick"
                         style={{left: `${(descMaxBase/descMaxExcepcion)*100}%`}}
                         title={`Tope estándar S/ ${descMaxBase.toLocaleString('es-PE')}`}/>
                  )}
                </div>
                <div className="cot-discount-legend">
                  <span>S/ 0</span>
                  <span>
                    {vbEstado === 'approved' ? (
                      <><b style={{color:'#B33049'}}>Sin tope</b> · firmado por {vbAprobador?.rol}</>
                    ) : (
                      <>Máx {modo === 'contado' ? 'contado' : 'financiamiento'}:{' '}
                        <b>S/ {descMaxActual.toLocaleString('es-PE')}</b></>
                    )}
                  </span>
                </div>
              </div>

              {/* Tier 2: Solicitar excepción */}
              {excepcionEstado === 'none' && descuento >= descMaxBase && (
                <button className="cot-exception-btn" onClick={solicitarExcepcion}>
                  <Icon name="alert" size={13}/>
                  <span>¿Necesitas más descuento? <b>Solicitar excepción</b></span>
                </button>
              )}
              {excepcionEstado === 'pending' && (
                <div className="cot-exception-pending">
                  <div className="cot-exception-row">
                    <Icon name="clock" size={13}/>
                    <span className="flex1">Validando aprobación del supervisor…</span>
                    <span className="mono">{Math.ceil(excepcionRest)}s</span>
                  </div>
                  <div className="cot-exception-bar">
                    <div className="cot-exception-fill"
                         style={{width: `${((cond.tiempoExcepcion-excepcionRest)/cond.tiempoExcepcion)*100}%`}}/>
                  </div>
                </div>
              )}
              {excepcionEstado === 'approved' && vbEstado === 'none' && (
                <div className="cot-exception-approved">
                  <Icon name="checkCircle" size={14}/>
                  <span>Excepción aprobada · Máx S/ {descMaxExcepcion.toLocaleString('es-PE')}</span>
                </div>
              )}

              {/* Tier 3: Visto Bueno Gerencial */}
              {excepcionEstado === 'approved' && vbEstado === 'none' && descuento >= descMaxExcepcion && (
                <button className="cot-vb-btn" onClick={() => setVbPickerOpen(true)}>
                  <Icon name="shield" size={13}/>
                  <span>Solicitar <b>VB Gerencial</b> para superar el tope</span>
                </button>
              )}
              {vbPickerOpen && (
                <div className="cot-vb-picker">
                  <div className="cot-vb-picker-title">Selecciona el aprobador</div>
                  <div className="cot-vb-picker-list">
                    {cond.aprobadores.map((rol) => (
                      <button key={rol}
                              className="cot-vb-picker-item"
                              onClick={() => solicitarVB(rol)}>
                        <Icon name="shield" size={14}/>
                        <span>{rol}</span>
                        <Icon name="chevronR" size={12}/>
                      </button>
                    ))}
                  </div>
                  <button className="cot-vb-picker-cancel" onClick={() => setVbPickerOpen(false)}>
                    Cancelar
                  </button>
                </div>
              )}
              {vbEstado === 'pending' && (
                <div className="cot-vb-pending">
                  <div className="cot-exception-row">
                    <Icon name="clock" size={13}/>
                    <span className="flex1">Esperando firma de <b>{vbAprobador?.rol}</b>…</span>
                    <span className="mono">
                      {Math.floor(vbRest/60)}:{String(Math.floor(vbRest%60)).padStart(2,'0')}
                    </span>
                  </div>
                  <div className="cot-exception-bar">
                    <div className="cot-vb-fill"
                         style={{width: `${((cond.tiempoVB-vbRest)/cond.tiempoVB)*100}%`}}/>
                  </div>
                </div>
              )}
              {vbEstado === 'approved' && (
                <div className="cot-vb-approved">
                  <div className="cot-vb-approved-head">
                    <Icon name="shield" size={14}/>
                    <span>VB Gerencial aprobado</span>
                  </div>
                  <div className="cot-vb-approved-row">
                    <span className="muted text-xs">Firmado por</span>
                    <b>{vbAprobador?.nombre}</b>
                  </div>
                  <div className="cot-vb-approved-row">
                    <span className="muted text-xs">Cargo</span>
                    <b>{vbAprobador?.rol}</b>
                  </div>
                  <div className="cot-vb-approved-row">
                    <span className="muted text-xs">Fecha</span>
                    <b className="mono">
                      {new Date(vbAprobador?.fecha).toLocaleString('es-PE', {
                        day:'2-digit', month:'2-digit', year:'numeric',
                        hour:'2-digit', minute:'2-digit',
                      })}
                    </b>
                  </div>
                </div>
              )}
            </div>
          </div>

          {modo === 'contado' ? (
            <div className="cot-body">
              <div className="cot-bigrow">
                <span>Precio de lista</span>
                <span className="num">{fmtPEN(lote.precio)}</span>
              </div>
              {descuento > 0 && (
                <div className="cot-bigrow descuento">
                  <span>Descuento adicional</span>
                  <span className="num">−{fmtPEN(descuento)}</span>
                </div>
              )}
              <div className="cot-bigrow descuento">
                <span>Pronto pago ({prontoPagoPct}%)</span>
                <span className="num">−{fmtPEN(descContado)}</span>
              </div>
              <div className="cot-divider"/>
              <div className="cot-total">
                <span>Pagas hoy</span>
                <span className="num">{fmtPEN(precioContado)}</span>
              </div>
              <p className="cot-fineprint">
                Pago único contra contrato. Incluye gestión notarial.
              </p>
            </div>
          ) : (
            <div className="cot-body">
              <div className="cot-control">
                <div className="cot-control-row">
                  <label>Cuota inicial</label>
                  <span className="cot-control-val">{enganchePct.toFixed(1)}% del precio</span>
                </div>
                <div className="input-prefix cot-enganche-input">
                  <span className="px">S/</span>
                  <input type="number"
                         min="0"
                         max={lote.precio}
                         step="100"
                         value={enganche}
                         onChange={(e) => setEnganche(Math.min(lote.precio, Math.max(0, +e.target.value || 0)))}/>
                </div>
                <div className="cot-chips" style={{marginTop:8}}>
                  {[10, 20, 30, 50].map(p => (
                    <button key={p}
                            className={Math.round(enganchePct) === p ? 'on' : ''}
                            onClick={() => setEnganche(Math.round(lote.precio * p / 100))}>
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="cot-control">
                <div className="cot-control-row">
                  <label>Plazo</label>
                  <span className="cot-control-val">{plazo} meses (máx {cond.plazoMaximo})</span>
                </div>
                <div className="cot-chips">
                  {[12, 24, 36, 48, 60, 72].filter(p => p <= cond.plazoMaximo).map((p) => (
                    <button key={p} className={plazo === p ? 'on' : ''} onClick={() => setPlazo(p)}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="cot-control">
                <div className="cot-control-row">
                  <label>Tasa anual</label>
                  <span className="cot-control-val">{tasa.toFixed(1)}%</span>
                </div>
                <input type="range" min={0} max={18} step={0.5}
                       value={tasa} onChange={(e) => setTasa(+e.target.value)}/>
                <div className="cot-track-labels"><span>0%</span><span>9%</span><span>18%</span></div>
              </div>

              <div className="cot-mensualidad">
                <div className="cot-mensualidad-label">Cuota mensual estimada</div>
                <div className="cot-mensualidad-num">{fmtPENc(fin.mensualidad)}</div>
                <div className="cot-mensualidad-sub">por {plazo} meses</div>
              </div>

              <div className="cot-bigrow"><span>Precio de lista</span><span className="num">{fmtPEN(lote.precio)}</span></div>
              {descuento > 0 && (
                <div className="cot-bigrow descuento">
                  <span>Descuento adicional</span>
                  <span className="num">−{fmtPEN(descuento)}</span>
                </div>
              )}
              <div className="cot-bigrow"><span>Inicial</span><span className="num">{fmtPEN(fin.enganche)}</span></div>
              <div className="cot-bigrow"><span>Saldo a financiar</span><span className="num">{fmtPEN(fin.montoFinanciado)}</span></div>
              <div className="cot-bigrow muted"><span>Intereses</span><span className="num">{fmtPEN(fin.intereses)}</span></div>
              <div className="cot-divider"/>
              <div className="cot-total"><span>Total a pagar</span><span className="num">{fmtPEN(fin.totalPagado)}</span></div>
              <p className="cot-fineprint">
                Cálculo referencial sujeto a evaluación crediticia.
              </p>
            </div>
          )}

          <div className="cot-actions">
            {reserva ? (
              <>
                <div className="cot-reserva" data-tipo={reserva.tipo}>
                  <div className="cot-reserva-head">
                    <div className="flex1">
                      <span className="cot-reserva-tipo" data-tipo={reserva.tipo}>
                        <Icon name={reserva.tipo === 'venta' ? 'check' : 'clock'} size={11}/>
                        {reserva.tipo === 'venta' ? 'Vendido' : 'Separado'}
                      </span>
                      <div className="cot-reserva-name" style={{marginTop:6}}>
                        {reserva.nombres} {reserva.apellidos}
                      </div>
                      <div className="cot-reserva-meta">
                        <div className="row mono">DNI {reserva.dni} {reserva.reniecVerificado && <Icon name="check" size={11} style={{color:'var(--success)'}}/>}</div>
                        <div className="row">+51 {reserva.telefono}</div>
                        <div className="row">{reserva.email}</div>
                      </div>
                    </div>
                  </div>
                  <span className="cot-reserva-status" data-state={reserva.documentos}>
                    <Icon name={reserva.documentos === 'completos' ? 'check' : 'clock'} size={11}/>
                    {reserva.documentos === 'completos' ? 'Documentos generados' : 'Documentos pendientes'}
                  </span>
                  <div className="cot-reserva-actions">
                    {puedeVender ? (<>
                    <button className="btn primary" onClick={() => onGenerarVenta(lote, { modo, enganchePct, plazo, tasa, fin, precioContado, descuento, excepcion: excepcionEstado === 'approved' })}>
                      <Icon name="doc" size={12}/> Generar documentos
                    </button>
                    <button className="btn" onClick={onApartar}>
                      <Icon name="edit" size={12}/> Editar
                    </button>
                    <button className="btn danger" onClick={() => {
                      if (window.confirm(`¿Cancelar reserva del Lote ${lote.id}?`)) onCancelarReserva();
                    }}>
                      <Icon name="x" size={12}/>
                    </button>
                    </>) : (
                      <span className="muted text-xs hstack gap-6"><Icon name="eye" size={12}/> Solo lectura · sin permiso de venta</span>
                    )}
                  </div>
                </div>
                <button className="btn block" onClick={() => onToast('Cotización descargada')}>
                  <Icon name="download" size={14}/> Descargar cotización (PDF)
                </button>
              </>
            ) : (
              <>
                {puedeVender ? (<>
                {/* CTA principal: flujo rápido — solo 3 datos */}
                <button className="btn primary block lg" onClick={onApartar}>
                  <Icon name="sparkle" size={14}/> Apartar / Vender lote
                </button>
                <div className="muted text-xs center" style={{padding:'2px 0', lineHeight:1.4}}>
                  Solo pide DNI, teléfono y correo · documentos luego
                </div>

                {/* CTA secundario: ir directo al wizard completo */}
                <button className="cot-cta-secondary" onClick={() => onGenerarVenta(lote, { modo, enganchePct, plazo, tasa, fin, precioContado, descuento, excepcion: excepcionEstado === 'approved' })}>
                  <Icon name="doc" size={13}/>
                  <span>
                    Generar venta con documentos
                    <small>Cliente con todos los datos · 6 documentos</small>
                  </span>
                </button>
                <div className="divider"/>
                </>) : (
                  <div className="cot-aviso" style={{marginBottom:10}}>
                    No tienes permiso para apartar o vender lotes. Puedes consultar el precio y enviar la cotización al cliente.
                  </div>
                )}
                <button className="btn block" onClick={() => onToast('Cotización descargada')}>
                  <Icon name="download" size={14}/> Descargar cotización (PDF)
                </button>
                <button className="btn ghost block" onClick={() => {
                  const dest = window.prompt('Correo del cliente para enviar la cotización:', '');
                  if (!dest) return;
                  window.enviarCorreo?.({
                    tipo: 'cotizacion',
                    destinatario: dest,
                    destinatarioNombre: 'Cliente',
                    asunto: `Cotización Lote ${lote.id} · ${(window.getProyectoActual?.()?.nombre) || 'Proyecto'}`,
                    cuerpo: `Estimado/a,\n\nAdjuntamos la cotización del Lote ${lote.id} (Manzana ${lote.manzana}, ${lote.m2} m²) con ${modo === 'contado' ? 'pago al contado' : `financiamiento a ${plazo} meses`}.\n\nPrecio: ${fmtPEN(lote.precio)}\n\nQuedamos atentos.\n\nSaludos.`,
                    adjuntos: [`Cotizacion_${lote.id}.pdf`],
                  });
                  onToast(`Cotización enviada a ${dest}`);
                }}>
                  <Icon name="mail" size={14}/> Enviar cotización por correo
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANEL DE EDICIÓN DE POLÍGONOS
// ═══════════════════════════════════════════════════════════════
const PlanoEditPanel = ({ lote, vertOverrides, drawing, onStartDrawing, onCancelDrawing, onDrawFinish, onRemoveCustomLote, onReset, onResetAll, onExit, onToast }) => {
  const overridenCount = Object.keys(vertOverrides).length;

  // Estado de DIBUJO en progreso
  if (drawing?.active) {
    return (
      <div className="cot edit-panel">
        <header className="cot-head">
          <div className="hstack between">
            <div>
              <div className="cot-eyebrow" style={{color:'var(--brand)'}}>Dibujando polígono</div>
              <div className="cot-title">Nuevo lote</div>
            </div>
            <span className="cot-pill" style={{background:'color-mix(in oklab, var(--brand) 12%, white)', color:'var(--brand)', borderColor:'var(--brand)'}}>
              <span className="cot-pill-dot" style={{background:'var(--brand)'}}/>
              {drawing.points.length} {drawing.points.length === 1 ? 'punto' : 'puntos'}
            </span>
          </div>
        </header>

        <div className="edit-vertices">
          <div className="strong text-sm mb-8">Cómo dibujar</div>
          <div className="edit-hints">
            <div className="edit-hint"><kbd>1</kbd> Click en el plano para colocar el primer vértice (verde)</div>
            <div className="edit-hint"><kbd>+</kbd> Sigue haciendo click para agregar más puntos</div>
            <div className="edit-hint"><kbd>2×</kbd> Doble-click cuando termines para cerrar el polígono</div>
            <div className="edit-hint"><kbd>Esc</kbd> Cancelar y descartar lo dibujado</div>
          </div>
          {drawing.points.length >= 3 && (
            <div className="edit-meta" style={{marginTop:12, borderTop:0, borderBottom:0, borderRadius:8}}>
              <div className="edit-meta-row">
                <span>Vértices colocados</span>
                <b className="mono">{drawing.points.length}</b>
              </div>
              <div className="edit-meta-row">
                <span>Listo para cerrar</span>
                <b style={{color:'#1ea968'}}>Sí ✓</b>
              </div>
            </div>
          )}
        </div>

        <div className="edit-actions">
          <button className="btn primary block"
                  onClick={onDrawFinish}
                  disabled={drawing.points.length < 3}>
            <Icon name="check" size={13}/> Cerrar polígono ({drawing.points.length}/3+)
          </button>
          <button className="btn block" onClick={onCancelDrawing}>
            <Icon name="x" size={13}/> Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (!lote) {
    return (
      <div className="cot edit-panel">
        <header className="cot-head">
          <div className="hstack between">
            <div>
              <div className="cot-eyebrow" style={{color:'var(--brand)'}}>Modo edición</div>
              <div className="cot-title">Editar polígonos</div>
            </div>
            <span className="cot-pill" style={{background:'color-mix(in oklab, var(--brand) 12%, white)', color:'var(--brand)', borderColor:'var(--brand)'}}>
              <span className="cot-pill-dot" style={{background:'var(--brand)'}}/>
              {overridenCount} editados
            </span>
          </div>
        </header>

        <div className="edit-empty">
          <div className="edit-empty-ic"><Icon name="edit" size={28}/></div>
          <h3>Selecciona un lote para editar</h3>
          <p>O dibuja un nuevo polígono si cambió el plano y se agregaron lotes. Soporta cualquier número de lados — agrega o quita vértices para formas no rectangulares.</p>
        </div>

        <div className="edit-actions">
          <button className="btn primary block" onClick={onStartDrawing}>
            <Icon name="plus" size={13}/> Dibujar nuevo polígono
          </button>
          <button className="btn block" onClick={onResetAll} disabled={overridenCount === 0}>
            <Icon name="refresh" size={13}/> Restablecer ediciones ({overridenCount})
          </button>
          <button className="btn ghost block" onClick={onExit}>
            <Icon name="check" size={13}/> Terminar edición
          </button>
        </div>
      </div>
    );
  }

  const verts = getLoteVerts(lote, vertOverrides);
  const isEdited = !!vertOverrides[lote.id];
  const isCustom = lote.__custom;
  const area = Math.abs(verts.reduce((sum, v, i) => {
    const next = verts[(i+1) % verts.length];
    return sum + (v.x * next.y - next.x * v.y);
  }, 0)) / 2;
  const m2Est = Math.round(area * 0.0089);

  return (
    <div className="cot edit-panel">
      <header className="cot-head">
        <div className="hstack between">
          <div>
            <div className="cot-eyebrow" style={{color:'var(--brand)'}}>Editando</div>
            <div className="cot-title">Lote {lote.id}</div>
          </div>
          {isCustom ? (
            <span className="cot-pill" style={{background:'#e0f7ec', color:'#0a7d4a', borderColor:'#1ea968'}}>
              <span className="cot-pill-dot" style={{background:'#1ea968'}}/>
              Nuevo
            </span>
          ) : isEdited && (
            <span className="cot-pill" style={{background:'#fff4d6', color:'#8a5a0a', borderColor:'#d99b1e'}}>
              <span className="cot-pill-dot" style={{background:'#d99b1e'}}/>
              Modificado
            </span>
          )}
        </div>
      </header>

      <div className="edit-vertices">
        <div className="hstack between mb-8">
          <div className="strong text-sm">Vértices ({verts.length})</div>
          <div className="muted text-xs">A–{String.fromCharCode(64 + Math.min(verts.length, 26))}</div>
        </div>
        <div className="edit-verts-list">
          {verts.map((v, i) => {
            const label = verts.length <= 26
              ? String.fromCharCode(65 + i)
              : `V${i+1}`;
            return (
              <div key={i} className="edit-vert-row">
                <div className="edit-vert-num">{label}</div>
                <div className="edit-vert-coords">
                  <span className="muted text-xs">x</span>
                  <input className="input mono" type="number"
                         value={Math.round(v.x)} readOnly/>
                  <span className="muted text-xs">y</span>
                  <input className="input mono" type="number"
                         value={Math.round(v.y)} readOnly/>
                </div>
              </div>
            );
          })}
        </div>
        <div className="edit-hints">
          <div className="edit-hint"><kbd>↔</kbd> Arrastra cualquier vértice para reformar</div>
          <div className="edit-hint"><kbd>⤧</kbd> Arrastra el <b>centro del polígono</b> para reposicionarlo entero</div>
          <div className="edit-hint"><kbd>+</kbd> Click el punto blanco en una arista para <b>agregar</b> un vértice</div>
          <div className="edit-hint"><kbd>2×</kbd> Doble-click un vértice para <b>quitarlo</b> (mínimo 3)</div>
        </div>
      </div>

      <div className="edit-meta">
        <div className="edit-meta-row">
          <span>Área aprox</span>
          <b className="mono">{m2Est} m²</b>
        </div>
        <div className="edit-meta-row">
          <span>Área del catastro</span>
          <b className="mono">{lote.m2} m²</b>
        </div>
        <div className="edit-meta-row">
          <span>Diferencia</span>
          <b className="mono" style={{color: Math.abs(m2Est - lote.m2) > 5 ? '#d99b1e' : '#1ea968'}}>
            {m2Est >= lote.m2 ? '+' : ''}{m2Est - lote.m2} m²
          </b>
        </div>
      </div>

      <div className="edit-actions">
        {isCustom ? (
          <button className="btn danger block" onClick={() => onRemoveCustomLote(lote.id)}>
            <Icon name="trash" size={13}/> Eliminar este lote
          </button>
        ) : (
          <button className="btn block" onClick={() => onReset(lote.id)} disabled={!isEdited}>
            <Icon name="refresh" size={13}/> Restablecer al original
          </button>
        )}
        <button className="btn primary block" onClick={onStartDrawing}>
          <Icon name="plus" size={13}/> Dibujar otro polígono
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL — Finalizar el polígono dibujado con datos del lote
// ═══════════════════════════════════════════════════════════════
const NewLoteFromPolygonModal = ({ points, onCancel, onSave, existingKeys }) => {
  const ETAPAS_OPC = (window.ETAPAS_DEF) || ['1RA ETAPA', '2DA ETAPA', '3RA ETAPA'];
  const TIPOLOGIAS_OPC = (window.TIPOLOGIAS_DEF) || ['Lote Residencial', 'Esquina', 'Esquina + Av Principal', 'Frente a parque'];

  // Área estimada
  const areaPx = Math.abs(points.reduce((s, v, i) => {
    const n = points[(i+1) % points.length];
    return s + (v.x * n.y - n.x * v.y);
  }, 0)) / 2;
  const m2Est = Math.round(areaPx * 0.0089);

  const etapaActual = window.getEtapaActual?.()?.nombre;
  const [f, setF] = React.useState({
    manzana: 'A',
    numero: 1,
    etapa: ETAPAS_OPC.includes(etapaActual) ? etapaActual : ETAPAS_OPC[0],
    tipologia: TIPOLOGIAS_OPC[0],
    m2: m2Est,
    frente: 0,
    fondo: 0,
    lder: 0,
    lizq: 0,
    precio: m2Est * 5000,
  });
  const set = (k, v) => setF({...f, [k]: v});
  const codigo = `${f.manzana}${f.numero}`;

  const submit = () => {
    if (!f.manzana || !f.numero) return alert('Indica manzana y número');
    if (existingKeys.includes(codigo)) return alert(`Ya existe el lote ${codigo}. Edítalo desde el plano o la sección Lotes.`);
    onSave({ ...f, id: codigo });
  };

  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal" style={{width:'min(560px, calc(100vw - 32px))'}}
           onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8">
            <Icon name="plus" size={16}/> Crear lote desde polígono
          </div>
          <button className="icon-btn" onClick={onCancel}><Icon name="x" size={14}/></button>
        </div>

        <div className="card-pad">
          <div className="newpoly-preview">
            <svg viewBox={`${Math.min(...points.map(p=>p.x))-20} ${Math.min(...points.map(p=>p.y))-20} ${Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))+40} ${Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))+40}`}>
              <polygon points={points.map(p=>`${p.x},${p.y}`).join(' ')}
                       fill="color-mix(in oklab, var(--brand) 25%, transparent)"
                       stroke="var(--brand)" strokeWidth="3"/>
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="8" fill="white" stroke="var(--brand)" strokeWidth="3"/>
              ))}
            </svg>
            <div className="newpoly-preview-stats">
              <div><b>{points.length}</b> vértices</div>
              <div><b>~{m2Est}</b> m²</div>
              <div className="newpoly-code">Código: <b className="mono">{codigo}</b></div>
            </div>
          </div>

          <div className="field-group cols-3 mt-12">
            <div className="field">
              <label className="field-label">Manzana</label>
              <input className="input mono" value={f.manzana}
                     onChange={(e) => set('manzana', e.target.value.toUpperCase().replace(/[^A-Z]/g,''))}/>
            </div>
            <div className="field">
              <label className="field-label">N°</label>
              <input className="input mono" type="number" value={f.numero}
                     onChange={(e) => set('numero', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Etapa</label>
              <select className="select" value={f.etapa} onChange={(e) => set('etapa', e.target.value)}>
                {ETAPAS_OPC.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field" style={{gridColumn:'span 3'}}>
              <label className="field-label">Tipología</label>
              <select className="select" value={f.tipologia} onChange={(e) => set('tipologia', e.target.value)}>
                {TIPOLOGIAS_OPC.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Área (m²)</label>
              <input className="input mono" type="number" value={f.m2}
                     onChange={(e) => set('m2', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Frente (m)</label>
              <input className="input mono" type="number" value={f.frente}
                     onChange={(e) => set('frente', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Fondo (m)</label>
              <input className="input mono" type="number" value={f.fondo}
                     onChange={(e) => set('fondo', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">L. Der (m)</label>
              <input className="input mono" type="number" value={f.lder}
                     onChange={(e) => set('lder', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">L. Izq (m)</label>
              <input className="input mono" type="number" value={f.lizq}
                     onChange={(e) => set('lizq', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Precio</label>
              <div className="input-prefix">
                <span className="px">S/</span>
                <input type="number" value={f.precio}
                       onChange={(e) => set('precio', +e.target.value)}/>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button className="btn primary" onClick={submit}>
            <Icon name="check" size={13}/> Crear lote
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MODAL DE RESERVA RÁPIDA · Apartar / Vender un lote pidiendo
// solo 3 datos (DNI + RENIEC, teléfono, correo).
// Los documentos del paquete se pueden generar después.
// ═══════════════════════════════════════════════════════════════
const QuickSaleModal = ({ lote, initial, onClose, onSave, onToast }) => {
  const [tipo, setTipo] = React.useState(initial?.tipo || 'separacion');
  const [dni, setDni] = React.useState(initial?.dni || '');
  const [nombres, setNombres] = React.useState(initial?.nombres || '');
  const [apellidos, setApellidos] = React.useState(initial?.apellidos || '');
  const [telefono, setTelefono] = React.useState(initial?.telefono || '');
  const [email, setEmail] = React.useState(initial?.email || '');
  const [notas, setNotas] = React.useState(initial?.notas || '');
  const [reniecState, setReniecState] = React.useState(
    initial?.reniecVerificado ? 'ok' : 'idle'
  ); // idle | loading | ok | error
  const [reniecMsg, setReniecMsg] = React.useState('');

  const dniValido = /^\d{8}$/.test(dni);

  const handleReniec = async () => {
    if (!dniValido) {
      setReniecState('error');
      setReniecMsg('El DNI debe tener 8 dígitos');
      return;
    }
    setReniecState('loading');
    setReniecMsg('Consultando RENIEC...');
    try {
      const r = await consultaReniec(dni);
      setNombres(r.nombres);
      setApellidos(r.apellidos);
      setReniecState('ok');
      setReniecMsg('Verificado en RENIEC');
    } catch (e) {
      setReniecState('error');
      setReniecMsg(e.message || 'Error consultando RENIEC');
    }
  };

  const onChangeDni = (v) => {
    const clean = v.replace(/\D/g, '').slice(0, 8);
    setDni(clean);
    if (reniecState === 'ok' || reniecState === 'error') {
      setReniecState('idle');
      setReniecMsg('');
    }
  };

  const puedeGuardar = dniValido && nombres.trim() && apellidos.trim() && telefono.trim() && email.trim();

  const guardar = () => {
    if (!puedeGuardar) {
      onToast?.('Faltan datos: DNI, nombres, apellidos, teléfono y correo son obligatorios');
      return;
    }
    onSave({
      loteId: lote.id,
      tipo,
      dni, nombres: nombres.trim(), apellidos: apellidos.trim(),
      telefono: telefono.trim(), email: email.trim(),
      notas: notas.trim(),
      reniecVerificado: reniecState === 'ok',
      documentos: 'pendientes',
      fecha: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-quick" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{initial ? 'Editar reserva' : 'Apartar / Vender lote'}</h2>
            <small>Lote <b>{lote.id}</b> · Manzana {lote.manzana} · {fmtPEN(lote.precio)}</small>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div className="card-pad vstack gap-14">
          {/* Tipo */}
          <div className="field">
            <label className="field-label">Tipo de operación</label>
            <div className="quick-tipo">
              <button type="button" className="quick-tipo-btn"
                      data-tipo="separacion"
                      data-on={tipo === 'separacion'}
                      onClick={() => setTipo('separacion')}>
                <span className="quick-tipo-title">
                  <span className="dot"/> Separación
                </span>
                <span className="quick-tipo-desc">Reserva el lote. Cliente confirma intención de compra.</span>
              </button>
              <button type="button" className="quick-tipo-btn"
                      data-tipo="venta"
                      data-on={tipo === 'venta'}
                      onClick={() => setTipo('venta')}>
                <span className="quick-tipo-title">
                  <span className="dot"/> Venta
                </span>
                <span className="quick-tipo-desc">Compra confirmada. Documentos se generan luego.</span>
              </button>
            </div>
          </div>

          {/* DNI + RENIEC */}
          <div className="field">
            <label className="field-label">DNI <span className="req">*</span></label>
            <div className="quick-dni-row">
              <input className="input" placeholder="12345678" maxLength={8}
                     value={dni} onChange={(e) => onChangeDni(e.target.value)}
                     inputMode="numeric"/>
              <button type="button" className="quick-reniec-btn"
                      onClick={handleReniec}
                      disabled={!dniValido || reniecState === 'loading'}>
                {reniecState === 'loading'
                  ? <><span className="spinner"/> Consultando...</>
                  : <><Icon name="shield" size={13}/> Buscar en RENIEC</>}
              </button>
            </div>
            {reniecMsg && (
              <span className="quick-reniec-status"
                    data-state={reniecState === 'ok' ? 'ok' : reniecState === 'error' ? 'error' : 'loading'}>
                {reniecState === 'ok' && <Icon name="check" size={11}/>}
                {reniecState === 'error' && <Icon name="alert" size={11}/>}
                {reniecMsg}
              </span>
            )}
            <span className="field-hint">Pulsa <b>Buscar en RENIEC</b> para traer nombres y apellidos. Si no hay coincidencia, dígitalos a mano.</span>
          </div>

          {/* Nombres + Apellidos */}
          <div className="field-group cols-2">
            <div className="field">
              <label className="field-label">Nombres <span className="req">*</span></label>
              <input className="input" value={nombres}
                     onChange={(e) => setNombres(e.target.value)}
                     placeholder="Nombres completos"/>
            </div>
            <div className="field">
              <label className="field-label">Apellidos <span className="req">*</span></label>
              <input className="input" value={apellidos}
                     onChange={(e) => setApellidos(e.target.value)}
                     placeholder="Apellido paterno y materno"/>
            </div>
          </div>

          {/* Tel + Email */}
          <div className="field-group cols-2">
            <div className="field">
              <label className="field-label">Teléfono <span className="req">*</span></label>
              <div className="input-prefix">
                <span className="px">+51</span>
                <input value={telefono}
                       onChange={(e) => setTelefono(e.target.value.replace(/[^\d\s]/g, '').slice(0, 11))}
                       placeholder="987 654 321"
                       inputMode="tel"/>
              </div>
            </div>
            <div className="field">
              <label className="field-label">Correo electrónico <span className="req">*</span></label>
              <input className="input" type="email"
                     value={email} onChange={(e) => setEmail(e.target.value)}
                     placeholder="cliente@correo.pe"/>
            </div>
          </div>

          {/* Notas */}
          <div className="field">
            <label className="field-label">Notas internas <span className="muted text-xs" style={{fontWeight:400}}>(opcional)</span></label>
            <textarea className="textarea" rows={2}
                      value={notas} onChange={(e) => setNotas(e.target.value)}
                      placeholder="Observaciones para el equipo (ej: cliente referido, prefiere contacto por WhatsApp...)"/>
          </div>

          <div className="quick-hint">
            <Icon name="sparkle" size={14}/>
            <div>
              <b>El cliente puede demorar en dar datos para los documentos.</b><br/>
              Con estos 3 datos ya marcamos el lote como {tipo === 'venta' ? 'vendido' : 'separado'}.
              Después podrás generar el paquete completo de documentos cuando el cliente envíe el resto de su información.
            </div>
          </div>
        </div>

        <div style={{padding:'14px 18px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, background:'var(--surface-2)'}}>
          <span className="muted text-xs">
            {puedeGuardar ? '✓ Listos los 3 datos mínimos' : 'Completa los 4 campos obligatorios'}
          </span>
          <div className="hstack gap-8">
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn primary" onClick={guardar} disabled={!puedeGuardar}>
              <Icon name="check" size={13}/> {tipo === 'venta' ? 'Marcar como vendido' : 'Apartar lote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PANTALLA PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const ScreenPlano = ({ onNew, onToast }) => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [editMode, setEditMode] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('plano'); // 'plano' | 'satelite'
  const [vertOverrides, setVertOverrides] = React.useState(() => loadVertOverrides());
  const [lotesExtra, setLotesExtra] = React.useState(() => loadLotesExtra());
  const [drawing, setDrawing] = React.useState({ active: false, points: [] });
  const [pendingPolygon, setPendingPolygon] = React.useState(null); // {points: [...]}
  const [reservas, setReservas] = React.useState(() => loadReservas());
  const [quickSaleOpen, setQuickSaleOpen] = React.useState(false); // lote a apartar/vender
  const [filter, setFilter] = React.useState({
    estado:'todos', m2Min:0, m2Max:9999, precioMin:0, precioMax:9999999, busqueda:'',
  });

  // Lotes base + lotes dibujados por el usuario + datos del Administrador de Lotes
  const seedScope = window.isSeedScope?.() ?? false;
  const adminKey = `mattika.lotes-admin.v1.${window.getScopeKey?.() || '_default'}`;
  const [adminLotesMap, setAdminLotesMap] = React.useState(() => {
    try {
      const raw = localStorage.getItem(adminKey);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      const m = new Map();
      arr.forEach(l => m.set(`${l.manzana}-${l.numero}`, l));
      return m;
    } catch (e) {
      return null;
    }
  });

  // Refrescar el map cuando la ventana recibe foco (por si el admin cambió en otra pestaña)
  React.useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem(adminKey);
        if (!raw) return;
        const arr = JSON.parse(raw);
        const m = new Map();
        arr.forEach(l => m.set(`${l.manzana}-${l.numero}`, l));
        setAdminLotesMap(m);
      } catch (e) {}
    };
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [adminKey]);

  // Load lotes from API (overrides localStorage on mount)
  React.useEffect(() => {
    if (!window.apiClient) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id) return;
    const q = `proyectoId=${encodeURIComponent(proy.id)}` + (eta?.id ? `&etapaId=${encodeURIComponent(eta.id)}` : '');
    window.apiClient(`/api/lotes?${q}`).then(data => {
      if (!data?.length) return;
      const m = new Map();
      data.forEach(l => {
        const num = parseInt(l.numero) || l.numero;
        m.set(`${l.manzana}-${num}`, {
          codigo: l.codigo, manzana: l.manzana, numero: num,
          m2: parseFloat(l.area)||undefined, frente: parseFloat(l.frente)||undefined,
          fondo: parseFloat(l.fondo)||undefined, lder: parseFloat(l.l_der)||undefined,
          lizq: parseFloat(l.l_izq)||undefined, precio: parseFloat(l.precio)||undefined,
          estado: l.estado ? (l.estado.charAt(0).toUpperCase()+l.estado.slice(1)) : 'Disponible',
          tipologia: l.tipologia, etapa: l.etapa_id||'', _apiId: l.id,
        });
      });
      setAdminLotesMap(m);
    }).catch(() => {});
  }, []);

  // Load reservas from API (merges with localStorage)
  React.useEffect(() => {
    if (!window.apiClient) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id) return;
    const q = `proyectoId=${encodeURIComponent(proy.id)}` + (eta?.id ? `&etapaId=${encodeURIComponent(eta.id)}` : '');
    window.apiClient(`/api/reservas?${q}`).then(data => {
      if (!data?.length) return;
      const map = {};
      data.forEach(r => {
        if (!r.manzana || r.numero == null) return;
        const planoId = `${r.manzana}-${String(parseInt(r.numero)).padStart(2,'0')}`;
        map[planoId] = {
          loteId: planoId, tipo: r.tipo,
          nombres: r.comprador_nombre, apellidos: r.comprador_apellidos,
          dni: r.comprador_dni, telefono: r.comprador_telefono, email: r.comprador_correo,
          fecha: r.creada_el, _apiId: r.id,
        };
      });
      if (Object.keys(map).length) {
        setReservas(prev => ({ ...map, ...prev }));
      }
    }).catch(() => {});
  }, []);

  // Load plano alignment (polygon overrides + custom lots) from API on mount
  React.useEffect(() => {
    if (!window.apiClient) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id || !eta?.id) return;
    window.apiClient(`/api/proyectos/${proy.id}/etapas/${eta.id}/alineacion`).then(data => {
      if (!data) return;
      if (data.vertOverrides && Object.keys(data.vertOverrides).length) {
        setVertOverrides(data.vertOverrides);
        saveVertOverrides(data.vertOverrides);
      }
      if (data.lotesExtra && data.lotesExtra.length) {
        setLotesExtra(data.lotesExtra);
        saveLotesExtra(data.lotesExtra);
      }
    }).catch(() => {});
  }, []);

  // Debounced save of plano alignment to API (2s after last change)
  const _alineacionTimer = React.useRef(null);
  React.useEffect(() => {
    if (!window.apiClient) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id || !eta?.id) return;
    clearTimeout(_alineacionTimer.current);
    _alineacionTimer.current = setTimeout(() => {
      window.apiClient(`/api/proyectos/${proy.id}/etapas/${eta.id}/alineacion`, {
        method: 'PATCH',
        body: JSON.stringify({ vertOverrides, lotesExtra }),
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(_alineacionTimer.current);
  }, [vertOverrides, lotesExtra]);

  // Migrate localStorage reservas (without _apiId) to the API
  React.useEffect(() => {
    if (!window.apiClient || !adminLotesMap || !adminLotesMap.size) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id) return;
    Object.values(reservas).forEach(r => {
      if (r._apiId) return;
      const parts = r.loteId?.split('-');
      if (!parts || parts.length < 2) return;
      const manzana = parts[0];
      const numero  = parseInt(parts[1]);
      const entry   = adminLotesMap.get(`${manzana}-${numero}`);
      if (!entry?._apiId) return;
      window.apiClient('/api/reservas', {
        method: 'POST',
        body: JSON.stringify({
          loteId: entry._apiId, proyectoId: proy.id, etapaId: eta?.id,
          tipo: r.tipo, compradorNombre: r.nombres, compradorApellidos: r.apellidos,
          compradorDni: r.dni, compradorTelefono: r.telefono, compradorCorreo: r.email,
        }),
      }).then(res => {
        if (res?.id) setReservas(prev => {
          const upd = { ...prev, [r.loteId]: { ...prev[r.loteId], _apiId: res.id } };
          saveReservas(upd);
          return upd;
        });
      }).catch(() => {});
    });
  }, [adminLotesMap]);

  const allLotes = React.useMemo(() => {
    const estadoMap = { 'Disponible':'disponible', 'Separado':'separado', 'Vendido':'vendido' };
    // Mezcla los datos del Administrador de Lotes (fuente única) sobre la geometría.
    const applyAdmin = (p) => {
      const a = adminLotesMap?.get(`${p.manzana}-${p.numero}`);
      if (!a) return p;
      const precio = a.precio ?? p.precio;
      const m2 = a.m2 ?? p.m2;
      return {
        ...p,
        precio,
        m2,
        frente: a.frente ?? p.frente,
        fondo:  a.fondo  ?? p.fondo,
        lder:   a.lder   ?? p.lder,
        lizq:   a.lizq   ?? p.lizq,
        etapa:  a.etapa  ?? p.etapa,
        tipologia: a.tipologia ?? p.tipologia,
        precioM2: m2 ? Math.round(precio / m2) : p.precioM2,
        estado: estadoMap[a.estado] || p.estado,
      };
    };
    // El proyecto semilla (Nápoles) trae los 264 lotes de demostración.
    // Cualquier otro proyecto arranca SIN lotes base: solo los polígonos
    // que el equipo dibuje sobre su propio plano.
    const base  = (seedScope ? LOTES : []).map(applyAdmin);
    const extra = lotesExtra.map(applyAdmin);
    // Aplicar reservas: separación → estado "separado", venta → "vendido"
    const conReservas = [...base, ...extra].map(l => {
      const r = reservas[l.id];
      if (!r) return l;
      return {
        ...l,
        estado: r.tipo === 'venta' ? 'vendido' : 'separado',
        reserva: r,
      };
    });
    return conReservas;
  }, [adminLotesMap, lotesExtra, reservas, seedScope]);

  const moveVertex = React.useCallback((loteId, idx, x, y) => {
    setVertOverrides(prev => {
      const lote = allLotes.find(l => l.id === loteId);
      if (!lote) return prev;
      const base = prev[loteId] ? prev[loteId] : lote.verticesBase;
      const cur = base.map(v => ({...v}));
      cur[idx] = { x: Math.round(x), y: Math.round(y) };
      const next = { ...prev, [loteId]: cur };
      saveVertOverrides(next);
      return next;
    });
  }, [allLotes]);

  // Reemplazar TODOS los vértices (usado para arrastrar el polígono entero)
  const setVerticesFull = React.useCallback((loteId, verts) => {
    setVertOverrides(prev => {
      const next = { ...prev, [loteId]: verts.map(v => ({ x: Math.round(v.x), y: Math.round(v.y) })) };
      saveVertOverrides(next);
      return next;
    });
  }, []);

  const addVertex = React.useCallback((loteId, edgeIdx) => {
    setVertOverrides(prev => {
      const lote = allLotes.find(l => l.id === loteId);
      if (!lote) return prev;
      const base = prev[loteId] ? prev[loteId] : lote.verticesBase;
      const cur = base.map(v => ({...v}));
      const a = cur[edgeIdx];
      const b = cur[(edgeIdx + 1) % cur.length];
      const mid = { x: Math.round((a.x + b.x) / 2), y: Math.round((a.y + b.y) / 2) };
      cur.splice(edgeIdx + 1, 0, mid);
      const next = { ...prev, [loteId]: cur };
      saveVertOverrides(next);
      return next;
    });
    onToast?.('Vértice agregado');
  }, [onToast, allLotes]);

  const removeVertex = React.useCallback((loteId, idx) => {
    setVertOverrides(prev => {
      const lote = allLotes.find(l => l.id === loteId);
      if (!lote) return prev;
      const base = prev[loteId] ? prev[loteId] : lote.verticesBase;
      if (base.length <= 3) {
        onToast?.('Un polígono necesita al menos 3 vértices');
        return prev;
      }
      const cur = base.filter((_, i) => i !== idx);
      const next = { ...prev, [loteId]: cur };
      saveVertOverrides(next);
      return next;
    });
    onToast?.('Vértice eliminado');
  }, [onToast, allLotes]);

  const resetLote = (loteId) => {
    setVertOverrides(prev => {
      const next = { ...prev };
      delete next[loteId];
      saveVertOverrides(next);
      return next;
    });
    onToast?.('Lote restablecido al original');
  };

  const resetAll = () => {
    setVertOverrides({});
    saveVertOverrides({});
    onToast?.('Todos los polígonos restablecidos');
  };

  const selected = allLotes.find((l) => l.id === selectedId);

  // Stats globales
  const stats = React.useMemo(() => {
    const counts = { disponible:0, separado:0, vendido:0, bloqueado:0 };
    for (const l of allLotes) counts[l.estado]++;
    return counts;
  }, [allLotes]);

  // ── DIBUJO de un nuevo polígono ──
  const startDrawing = () => {
    setDrawing({ active: true, points: [] });
    setSelectedId(null);
    onToast?.('Click en el plano para agregar puntos. Doble-click para cerrar.');
  };
  const cancelDrawing = () => setDrawing({ active: false, points: [] });

  // Esc para cancelar dibujo
  React.useEffect(() => {
    if (!drawing.active) return;
    const onKey = (e) => { if (e.key === 'Escape') cancelDrawing(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawing.active]);
  const drawClick = (pt) => {
    setDrawing(prev => ({ ...prev, points: [...prev.points, pt] }));
  };
  const drawFinish = () => {
    if (drawing.points.length < 3) {
      onToast?.('Necesitas al menos 3 puntos para cerrar el polígono');
      return;
    }
    setPendingPolygon({ points: drawing.points });
    setDrawing({ active: false, points: [] });
  };

  const saveNewLote = (data) => {
    // Calcular bounding box para asignar manzanaRect/local consistente
    const xs = pendingPolygon.points.map(p => p.x);
    const ys = pendingPolygon.points.map(p => p.y);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY;
    // Área por shoelace (px² → m² con factor ~ 0.0089)
    const areaPx = Math.abs(pendingPolygon.points.reduce((s, v, i) => {
      const n = pendingPolygon.points[(i+1) % pendingPolygon.points.length];
      return s + (v.x * n.y - n.x * v.y);
    }, 0)) / 2;
    const m2 = Math.round(areaPx * 0.0089);

    const tone = ESTADO_TOKENS.disponible;
    const newLote = {
      id: data.id,
      manzana: data.manzana,
      numero: data.numero,
      frente: data.frente || 0,
      fondo: data.fondo || 0,
      m2: data.m2 || m2,
      precioM2: data.precio && (data.m2 || m2) ? Math.round(data.precio / (data.m2 || m2)) : 5000,
      precio: data.precio || (m2 * 5000),
      estado: 'disponible',
      esquina: /esquina/i.test(data.tipologia || ''),
      orientacion: 'Norte',
      local: { x: 0, y: 0, w, h },
      manzanaRect: { x: minX, y: minY, w, h, rot: 0 },
      verticesBase: pendingPolygon.points,
      __custom: true,
    };
    const next = [...lotesExtra, newLote];
    setLotesExtra(next);
    saveLotesExtra(next);

    // ── Sincroniza con la sección "Lotes" (misma fuente de datos) ──
    // El lote creado en el plano queda registrado en el Administrador de Lotes
    // con los mismos datos, y viceversa: editar en Lotes se refleja en el plano.
    syncLoteToAdmin({
      id: data.id,
      codigo: data.id,
      manzana: data.manzana,
      numero: data.numero,
      etapa: data.etapa || (window.getEtapaActual?.()?.nombre) || '1RA ETAPA',
      tipologia: data.tipologia || 'Lote Residencial',
      m2: data.m2 || m2,
      frente: data.frente || 0,
      fondo: data.fondo || 0,
      lder: data.lder || 0,
      lizq: data.lizq || 0,
      precio: data.precio || (m2 * 5000),
      estado: 'Disponible',
    });

    setPendingPolygon(null);
    setSelectedId(newLote.id);
    onToast?.(`Lote ${newLote.id} agregado · también visible en Lotes`);
  };

  // Inserta/actualiza un lote en el Administrador de Lotes (store compartido por alcance).
  const syncLoteToAdmin = (rec) => {
    try {
      let arr = JSON.parse(localStorage.getItem(adminKey) || 'null');
      if (!Array.isArray(arr)) {
        // Si el store aún no existe, sémbralo con el listado base para no perderlo.
        arr = (seedScope && window.LOTES_INICIAL) ? window.LOTES_INICIAL.slice() : [];
      }
      const k = `${rec.manzana}-${rec.numero}`;
      const idx = arr.findIndex(l => `${l.manzana}-${l.numero}` === k);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...rec };
      else arr.push(rec);
      localStorage.setItem(adminKey, JSON.stringify(arr));
      // Refresca el mapa en memoria para que el plano lo tome al instante.
      const m = new Map();
      arr.forEach(l => m.set(`${l.manzana}-${l.numero}`, l));
      setAdminLotesMap(m);
    } catch (e) {}
  };

  const removeExtraLote = (loteId) => {
    const next = lotesExtra.filter(l => l.id !== loteId);
    setLotesExtra(next);
    saveLotesExtra(next);
    if (selectedId === loteId) setSelectedId(null);
    onToast?.('Lote eliminado del plano');
  };

  const generarVenta = (lote, cot) => {
    // Si el lote ya tiene una reserva, traemos los datos del comprador
    const r = reservas[lote.id];
    const proy = window.getProyectoActual?.();
    // Convertir el lote en datos iniciales del wizard
    const initial = {
      inmueble: {
        proyecto: proy?.nombre || 'Proyecto',
        tipoInmueble: 'Lote',
        unidad: String(lote.numero),
        manzana: lote.manzana,
        partida: '',
        area: String(lote.m2),
        direccion: proy?.ubicacion || '',
        distrito: '', provincia: '', departamento: '',
      },
      terminos: {
        precio: cot.modo === 'contado' ? cot.precioContado : lote.precio,
        inicial: cot.modo === 'contado' ? cot.precioContado : Math.round(cot.fin.enganche),
        modoCuotas: 'iguales',
        cuotas: cot.modo === 'contado' ? 1 : cot.plazo,
        primeraCuota: new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
        bancoNombre: 'BCP', bancoCuenta: '570-7307941059',
        numOperacion:'', plazoEntrega:'12.2027',
        penalidadDiaria: 30, porcLucroCesante: 30,
        formaPago: cot.modo === 'contado' ? 'Pago al contado' : 'Depósito bancario',
      },
    };
    if (r) {
      initial.compradorA = {
        nombres: r.nombres, apellidos: r.apellidos,
        dni: r.dni, telefono: r.telefono.replace(/\s/g,''),
        email: r.email,
      };
    }
    onNew(initial);
    onToast(`Iniciando venta del Lote ${lote.id}...`);
  };

  // ── RESERVAS RÁPIDAS ──────────────────────────────────────────
  const saveReserva = (data) => {
    const next = { ...reservas, [data.loteId]: data };
    setReservas(next);
    saveReservas(next);
    setQuickSaleOpen(false);
    // Sync to API
    if (window.apiClient) {
      const lote = allLotes.find(l => l.id === data.loteId);
      const apiLoteId = lote ? adminLotesMap?.get(`${lote.manzana}-${lote.numero}`)?._apiId : null;
      if (apiLoteId) {
        const proy = window.getProyectoActual?.();
        const eta  = window.getEtapaActual?.();
        window.apiClient('/api/reservas', {
          method: 'POST',
          body: JSON.stringify({
            loteId: apiLoteId, proyectoId: proy?.id, etapaId: eta?.id,
            tipo: data.tipo, compradorNombre: data.nombres, compradorApellidos: data.apellidos,
            compradorDni: data.dni, compradorTelefono: data.telefono,
            compradorCorreo: data.email, precio: lote?.precio,
          }),
        }).then(r => {
          if (r?.id) setReservas(prev => {
            const upd = { ...prev, [data.loteId]: { ...prev[data.loteId], _apiId: r.id } };
            saveReservas(upd);
            return upd;
          });
        }).catch(() => {});
      }
    }
    onToast?.(data.tipo === 'venta'
      ? `✓ Lote ${data.loteId} marcado como VENDIDO a ${data.nombres}`
      : `✓ Lote ${data.loteId} apartado para ${data.nombres}`
    );
  };
  const cancelarReserva = (loteId) => {
    const apiId = reservas[loteId]?._apiId;
    const next = { ...reservas };
    delete next[loteId];
    setReservas(next);
    saveReservas(next);
    if (window.apiClient && apiId) {
      window.apiClient(`/api/reservas/${apiId}`, { method: 'DELETE' }).catch(() => {});
    }
    onToast?.(`Reserva del Lote ${loteId} cancelada`);
  };

  const exportarPlano = () => {
    const svgEl = document.querySelector('.plano-svg');
    if (!svgEl) { onToast?.('Sin plano para exportar'); return; }
    onToast?.('Generando imagen…');
    const W = PLANO_VIEWBOX.w, H = PLANO_VIEWBOX.h;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f3ee';
    ctx.fillRect(0, 0, W, H);

    const doDownload = () => {
      try {
        const proy = (window.getProyectoActual?.()?.nombre || 'proyecto').replace(/\s+/g, '-');
        const eta  = (window.getEtapaActual?.()?.nombre  || 'etapa').replace(/\s+/g, '-');
        const a = document.createElement('a');
        a.download = `Plano_${proy}_${eta}_${new Date().toISOString().slice(0,10)}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onToast?.('Plano exportado como PNG');
      } catch(e) { onToast?.('Error al exportar: ' + e.message); }
    };

    const drawSvg = () => {
      try {
        const clone = svgEl.cloneNode(true);
        clone.setAttribute('width', W);
        clone.setAttribute('height', H);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // Reemplazar variables CSS que no resuelven en SVG standalone
        const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#1E4FD4';
        clone.querySelectorAll('[stroke]').forEach(el => {
          if (el.getAttribute('stroke')?.includes('var(--brand)')) el.setAttribute('stroke', brand);
        });
        const svgStr = new XMLSerializer().serializeToString(clone);
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); doDownload(); };
        img.onerror = doDownload;
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
      } catch(e) { doDownload(); }
    };

    if (planoImg) {
      const bg = new Image();
      bg.crossOrigin = 'anonymous';
      bg.onload = () => { ctx.drawImage(bg, 0, 0, W, H); drawSvg(); };
      bg.onerror = drawSvg;
      bg.src = planoImg;
    } else {
      drawSvg();
    }
  };

  // Imagen de fondo del plano para el alcance activo (empresa·proyecto·etapa).
  // Si el proyecto no es la semilla y no tiene plano subido, queda en blanco
  // y se muestra una invitación a subirlo.
  const planoImg = (() => {
    const s = window.getSesion?.();
    const proy = window.getProyectoActual?.();
    const eta = window.getEtapaActual?.();
    if (s?.empresaId && proy && eta) {
      try {
        const img = localStorage.getItem(`mattika.plano-img.${s.empresaId}.${proy.id}.${eta.id}`);
        if (img) return img;
      } catch (e) {}
    }
    return seedScope ? 'plano-napoles.png' : '';
  })();
  const showEmptyHint = !planoImg && allLotes.length === 0;
  const puedeEditarPlano = window.can?.('editar_plano') ?? false;
  const puedeVender = window.can?.('vender') ?? false;

  return (
    <div className="page page-plano" data-screen-label="Plano del proyecto" style={{maxWidth:'none', padding:'24px 28px'}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Plano del proyecto</h1>
          <div className="page-sub">
            <b>{window.getProyectoActual?.()?.nombre || 'Proyecto'}</b>
            {window.getEtapaActual?.() && (
              <> · <span style={{color:'var(--brand)', fontWeight:500}}>{window.getEtapaActual()?.nombre}</span></>
            )}
            {' · '}{allLotes.length} lotes · {stats.disponible} disponibles
          </div>
        </div>
        <div className="hstack gap-8">
          {/* Conmutador de vista: Plano 2D ↔ Satélite */}
          <div className="seg-toggle" role="tablist">
            <button className={`seg-opt ${viewMode === 'plano' ? 'active' : ''}`}
                    onClick={() => setViewMode('plano')}>
              <Icon name="layers" size={13}/> Plano
            </button>
            <button className={`seg-opt ${viewMode === 'satelite' ? 'active' : ''}`}
                    onClick={() => { setViewMode('satelite'); setEditMode(false); cancelDrawing(); }}>
              <Icon name="mapPin" size={13}/> Satélite
            </button>
          </div>
          {viewMode === 'plano' && editMode && (
            <button className={`btn ${drawing.active ? 'primary' : ''}`}
                    onClick={drawing.active ? cancelDrawing : startDrawing}>
              <Icon name="plus" size={14}/> {drawing.active ? `Cancelar (${drawing.points.length} pts)` : 'Nuevo polígono'}
            </button>
          )}
          {viewMode === 'plano' && puedeEditarPlano && (
            <button className={`btn ${editMode ? 'primary' : ''}`}
                    onClick={() => { setEditMode(!editMode); setSelectedId(null); cancelDrawing(); }}>
              <Icon name="edit" size={14}/> {editMode ? 'Salir de edición' : 'Editar polígonos'}
            </button>
          )}
          <button className="btn" onClick={exportarPlano}><Icon name="download" size={14}/> Exportar plano</button>
        </div>
      </div>

      {/* Filtros + leyenda */}
      <div className="plano-toolbar mb-12">
        <div className="search" style={{flex:'0 1 240px', margin:0}}>
          <Icon name="search" size={14}/>
          <input placeholder="Lote A-03, manzana C..." value={filter.busqueda}
                 onChange={(e) => setFilter({...filter, busqueda:e.target.value})}/>
        </div>
        <div className="hstack gap-6">
          {[
            ['todos','Todos', null],
            ['disponible','Disponibles', stats.disponible],
            ['separado','Separados',     stats.separado],
            ['vendido','Vendidos',       stats.vendido],
          ].map(([id, label, count]) => (
            <button key={id} className={`filter-chip ${filter.estado===id ? 'active' : ''}`}
                    onClick={() => setFilter({...filter, estado:id})}>
              {id !== 'todos' && <span className="legend-sw" style={{background: ESTADO_TOKENS[id]?.fill, borderColor: ESTADO_TOKENS[id]?.stroke}}/>}
              <span>{label}</span>
              {count !== null && <span className="filter-chip-count">{count}</span>}
            </button>
          ))}
        </div>
        <div className="flex1"/>
        <div className="muted text-xs">
          {editMode
            ? <span><b style={{color:'var(--brand)'}}>Modo edición</b> · Click en un lote, arrastra los puntos para reformar el polígono</span>
            : 'Click + arrastra para mover · scroll para zoom'
          }
        </div>
      </div>

      {/* Layout: plano + cotizador o panel de edición */}
      <div className="plano-layout">
        <div className="plano-pane">
          {viewMode === 'satelite' ? (
            <window.PlanoSatelite
              lotes={allLotes}
              vertOverrides={vertOverrides}
              bgImage={planoImg}
              selectedId={selectedId}
              onSelect={setSelectedId}
              filter={{ estado: filter.estado, q: filter.busqueda }}
              canEdit={puedeEditarPlano}
              scopeKey={window.getScopeKey?.() || '_default'}
              onToast={onToast}/>
          ) : (
          <PlanoViewer lotes={allLotes}
                       selectedId={selectedId} onSelect={setSelectedId} filter={filter}
                       editMode={editMode}
                       vertOverrides={vertOverrides}
                       onMoveVertex={moveVertex}
                       onAddVertex={addVertex}
                       onRemoveVertex={removeVertex}
                       onSetVertices={setVerticesFull}
                       drawing={drawing}
                       onDrawClick={drawClick}
                       onDrawFinish={drawFinish}
                       bgImage={planoImg}
                       showEmptyHint={showEmptyHint}
                       canUpload={puedeEditarPlano}
                       onUploadPlano={() => window.__appGoto?.('proyectos')}/>
          )}
        </div>
        <aside className="cotizador-pane">
          {editMode
            ? <PlanoEditPanel
                lote={selected}
                vertOverrides={vertOverrides}
                drawing={drawing}
                onStartDrawing={startDrawing}
                onCancelDrawing={cancelDrawing}
                onDrawFinish={drawFinish}
                onRemoveCustomLote={removeExtraLote}
                onReset={resetLote}
                onResetAll={resetAll}
                onExit={() => { setEditMode(false); setSelectedId(null); cancelDrawing(); }}
                onToast={onToast}/>
            : <Cotizador key={selected?.id}
                          lote={selected}
                          reserva={selected ? reservas[selected.id] : null}
                          puedeVender={puedeVender}
                          onGenerarVenta={generarVenta}
                          onApartar={() => setQuickSaleOpen(selected)}
                          onCancelarReserva={() => cancelarReserva(selected.id)}
                          onToast={onToast}/>
          }
        </aside>
      </div>

      {/* Modal: finalizar nuevo polígono dibujado */}
      {pendingPolygon && (
        <NewLoteFromPolygonModal
          points={pendingPolygon.points}
          onCancel={() => setPendingPolygon(null)}
          onSave={saveNewLote}
          existingKeys={allLotes.map(l => `${l.manzana}${l.numero}`)}/>
      )}

      {/* Modal de reserva rápida (apartar / vender) */}
      {quickSaleOpen && (
        <QuickSaleModal
          lote={quickSaleOpen}
          initial={reservas[quickSaleOpen.id] || null}
          onClose={() => setQuickSaleOpen(false)}
          onSave={saveReserva}
          onToast={onToast}/>
      )}
    </div>
  );
};

Object.assign(window, { ScreenPlano, LOTES, calcFinanciamiento, fmtPEN, fmtPENc, getLoteVerts, ESTADO_TOKENS, PLANO_VIEWBOX });
