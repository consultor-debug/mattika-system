// screen-lotes-admin.jsx — Administrador de Lotes con importación Excel/CSV y edición inline

// ═══════════════════════════════════════════════════════════════
// Datos: deriva del mismo plano (MANZANAS_DEF) pero con campos editables
// ═══════════════════════════════════════════════════════════════
const ETAPAS_DEF = ['1RA ETAPA', '2DA ETAPA', '3RA ETAPA'];
const TIPOLOGIAS_DEF = ['Lote Residencial', 'Esquina', 'Esquina + Av Principal', 'Frente a parque'];
const ESTADOS_LOTE = ['Disponible', 'Separado', 'Vendido'];

const ESTADO_TONE = {
  Disponible: { bg: '#e0f7ec', text: '#0a7d4a', stroke: '#1ea968' },
  Separado:   { bg: '#fff4d6', text: '#8a5a0a', stroke: '#d99b1e' },
  Vendido:    { bg: '#ffe1e3', text: '#c0334a', stroke: '#e84e63' },
};

// ── seed PRNG ──
function _rngL(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}

function buildLotesAdmin() {
  const rng = _rngL(0xA17);
  const out = [];
  // 264 lotes en total — recreo distribución plausible
  const manzanas = [
    { mz: 'A', cant: 11, etapa: '2DA ETAPA' },
    { mz: 'B', cant: 22, etapa: '2DA ETAPA' },
    { mz: 'C', cant: 4,  etapa: '2DA ETAPA' },
    { mz: 'D', cant: 20, etapa: '2DA ETAPA' },
    { mz: 'E', cant: 18, etapa: '2DA ETAPA' },
    { mz: 'F', cant: 16, etapa: '1RA ETAPA' },
    { mz: 'G', cant: 18, etapa: '1RA ETAPA' },
    { mz: 'H', cant: 33, etapa: '1RA ETAPA' },
    { mz: 'I', cant: 18, etapa: '1RA ETAPA' },
    { mz: 'J', cant: 16, etapa: '1RA ETAPA' },
    { mz: 'K', cant: 18, etapa: '3RA ETAPA' },
    { mz: 'L', cant: 9,  etapa: '3RA ETAPA' },
    { mz: 'M', cant: 18, etapa: '3RA ETAPA' },
    { mz: 'N', cant: 18, etapa: '3RA ETAPA' },
    { mz: 'O', cant: 25, etapa: '3RA ETAPA' },
  ];

  let total = 0;
  for (const m of manzanas) {
    for (let i = 1; i <= m.cant; i++) {
      const esquina = i === 1 || i === m.cant;
      const tipologia = (i === 1 && m.mz === 'A') ? 'Esquina + Av Principal'
                      : esquina ? 'Esquina'
                      : 'Lote Residencial';

      // Área base por manzana
      const baseArea = { A: 240, L: 240, D: 145, E: 145, K: 145, M: 145,
                         B: 145, O: 145, F: 145, J: 145, C: 145,
                         G: 145, I: 145, N: 145, H: 145 }[m.mz] || 150;
      const variacion = 1 + (rng() - 0.5) * 0.12;
      const m2 = Math.round(baseArea * variacion * 100) / 100;
      const frente = m.mz === 'A' || m.mz === 'L' ? 14 : Math.round((6 + rng() * 5) * 100) / 100;
      const fondo = Math.round((m2 / frente) * 100) / 100;
      const lder = m.mz === 'A' || m.mz === 'L' ? 17.14 : Math.round((15 + rng() * 5) * 100) / 100;
      const lizq = m.mz === 'A' || m.mz === 'L' ? 17.14 : Math.round((15 + rng() * 5) * 100) / 100;

      // Precio según tipología
      let precio;
      if (tipologia === 'Esquina + Av Principal') precio = 50000;
      else if (tipologia === 'Esquina') precio = 25400 + Math.round(rng() * 4000);
      else if (m.mz === 'A' || m.mz === 'L') precio = 47000;
      else precio = Math.round((20000 + rng() * 25000) / 100) * 100;

      // Estado: 80% disponible, 3% separado, 17% vendido para llegar a 212/6/46
      const r = rng();
      let estado = 'Disponible';
      if (r > 0.825) estado = 'Vendido';
      else if (r > 0.802) estado = 'Separado';

      out.push({
        id: `${m.mz}${i}`,
        codigo: `${m.mz}${i}`,
        manzana: m.mz,
        numero: i,
        etapa: m.etapa,
        tipologia,
        m2, frente, fondo, lder, lizq,
        precio,
        estado,
      });
      total++;
      if (total >= 264) break;
    }
    if (total >= 264) break;
  }
  return out;
}

const LOTES_INICIAL = buildLotesAdmin();

const PROYECTOS = [
  'Napoles Condominio Club',
  'Vista Mar — Etapa 4',
  'San Bartolo Beach',
];

// ═══════════════════════════════════════════════════════════════
// CSV parser / writer (sin libs externas, soporta comillas)
// ═══════════════════════════════════════════════════════════════
function parseCSV(text) {
  const rows = [];
  let cur = '', row = [], inQ = false;
  text = text.replace(/^\uFEFF/, ''); // BOM
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',' || c === ';' || c === '\t') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c === '\r') {/* skip */}
      else cur += c;
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

function toCSV(headers, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.map(esc).join(',');
  const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n');
  return head + '\n' + body;
}

function downloadFile(name, mime, data) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ═══════════════════════════════════════════════════════════════
// SheetJS loader (lazy) para .xlsx
// ═══════════════════════════════════════════════════════════════
function loadSheetJS() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
    s.onload = () => res(window.XLSX);
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

// Format de soles (estilo S/ 47.000)
const fmtSolesShort = (n) => {
  if (n == null || isNaN(n)) return '—';
  return 'S/ ' + new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(n);
};

// ═══════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════
const ScreenLotesAdmin = ({ onToast, onGoto }) => {
  // Lista de lotes aislada por alcance (empresa·proyecto·etapa). Solo el
  // proyecto semilla (Nápoles) arranca con datos de demostración.
  const STORAGE_KEY = `mattika.lotes-admin.v1.${window.getScopeKey?.() || '_default'}`;
  const seedScope = window.isSeedScope?.() ?? false;

  // Persistencia local de los datos
  const [lotes, setLotes] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seedScope ? LOTES_INICIAL : [];
  });
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lotes)); } catch (e) {}
  }, [lotes, STORAGE_KEY]);

  // Load lotes from API on mount
  React.useEffect(() => {
    if (!window.apiClient) return;
    const proy = window.getProyectoActual?.();
    const eta  = window.getEtapaActual?.();
    if (!proy?.id) return;
    const q = `proyectoId=${encodeURIComponent(proy.id)}` + (eta?.id ? `&etapaId=${encodeURIComponent(eta.id)}` : '');
    window.apiClient(`/api/lotes?${q}`).then(data => {
      if (!data?.length) return;
      const mapped = data.map(l => ({
        id: `${l.manzana}${parseInt(l.numero)||l.numero}`,
        codigo: l.codigo || `${l.manzana}${parseInt(l.numero)||l.numero}`,
        manzana: l.manzana,
        numero: parseInt(l.numero) || l.numero,
        etapa: l.etapa_id || '',
        tipologia: l.tipologia || 'Lote Residencial',
        m2: parseFloat(l.area) || 0,
        frente: parseFloat(l.frente) || 0,
        fondo: parseFloat(l.fondo) || 0,
        lder: parseFloat(l.l_der) || 0,
        lizq: parseFloat(l.l_izq) || 0,
        precio: parseFloat(l.precio) || 0,
        estado: l.estado ? (l.estado.charAt(0).toUpperCase() + l.estado.slice(1)) : 'Disponible',
        _apiId: l.id,
      }));
      setLotes(mapped);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped)); } catch (e) {}
    }).catch(() => {});
  }, []);

  const [proyecto, setProyecto] = React.useState(window.getProyectoActual?.()?.nombre || PROYECTOS[0]);
  const puedeEditar = window.can?.('editar_lotes') ?? false;
  const [busqueda, setBusqueda] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState('Todos');
  const [manzanaFilter, setManzanaFilter] = React.useState('todas');
  const [etapaFilter, setEtapaFilter] = React.useState('todas');
  const [tipoFilter, setTipoFilter] = React.useState('todas');
  const [selected, setSelected] = React.useState(new Set());
  const [editingCell, setEditingCell] = React.useState(null); // { id, field }
  const [importOpen, setImportOpen] = React.useState(false);
  const [nuevoOpen, setNuevoOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [bulkOpen, setBulkOpen] = React.useState(null); // 'manzana' | 'etapa' | null

  const manzanasUnicas = React.useMemo(
    () => Array.from(new Set(lotes.map(l => l.manzana))).sort(),
    [lotes]
  );
  const etapasUnicas = React.useMemo(
    () => Array.from(new Set(lotes.map(l => l.etapa))).sort(),
    [lotes]
  );
  const tipologiasUnicas = React.useMemo(
    () => Array.from(new Set(lotes.map(l => l.tipologia))).sort(),
    [lotes]
  );

  // Filtros + búsqueda
  const filtered = React.useMemo(() => {
    return lotes.filter(l => {
      if (estadoFilter !== 'Todos' && l.estado !== estadoFilter) return false;
      if (manzanaFilter !== 'todas' && l.manzana !== manzanaFilter) return false;
      if (etapaFilter !== 'todas' && l.etapa !== etapaFilter) return false;
      if (tipoFilter !== 'todas' && l.tipologia !== tipoFilter) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (!l.codigo.toLowerCase().includes(q) &&
            !l.manzana.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [lotes, estadoFilter, manzanaFilter, etapaFilter, tipoFilter, busqueda]);

  const stats = React.useMemo(() => {
    const s = { total: lotes.length, Disponible: 0, Separado: 0, Vendido: 0 };
    for (const l of lotes) s[l.estado]++;
    return s;
  }, [lotes]);

  // Edición inline
  const updateLote = (id, field, value) => {
    setLotes(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const deleteLote = (id) => {
    setLotes(prev => prev.filter(l => l.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    setConfirmDelete(null);
    onToast?.('Lote eliminado');
  };

  const deleteSelected = () => {
    setLotes(prev => prev.filter(l => !selected.has(l.id)));
    onToast?.(`${selected.size} lotes eliminados`);
    setSelected(new Set());
  };

  // Selección
  const toggleSel = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectPage = () => setSelected(new Set(filtered.map(l => l.id)));
  const selectAll = () => setSelected(new Set(lotes.map(l => l.id)));
  const selectByMz = (mz) => setSelected(new Set(lotes.filter(l => l.manzana === mz).map(l => l.id)));
  const selectByEtapa = (et) => setSelected(new Set(lotes.filter(l => l.etapa === et).map(l => l.id)));
  const clearSel = () => setSelected(new Set());

  // Exportar
  const exportarCSV = () => {
    const headers = ['codigo','manzana','numero','etapa','tipologia','m2','frente','fondo','lder','lizq','precio','estado'];
    const csv = toCSV(headers, lotes);
    downloadFile(`lotes-${proyecto.replace(/\s+/g,'-')}.csv`, 'text/csv;charset=utf-8;', '\uFEFF' + csv);
    onToast?.('CSV exportado');
  };

  const exportarXLSX = async () => {
    try {
      const XLSX = await loadSheetJS();
      const ws = XLSX.utils.json_to_sheet(lotes);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Lotes');
      XLSX.writeFile(wb, `lotes-${proyecto.replace(/\s+/g,'-')}.xlsx`);
      onToast?.('Excel exportado');
    } catch (e) {
      onToast?.('Error exportando Excel');
    }
  };

  const importarLotes = (imported) => {
    setLotes(imported);
    setImportOpen(false);
    onToast?.(`${imported.length} lotes importados`);
    // After setLotes in the import handler:
    if (window.apiClient) {
      const proy = window.getProyectoActual?.();
      const eta  = window.getEtapaActual?.();
      const payload = imported.map(l => ({
        manzana: l.manzana, numero: String(l.numero), codigo: l.codigo,
        area: l.m2, frente: l.frente, fondo: l.fondo,
        lDer: l.lder, lIzq: l.lizq, precio: l.precio,
        estado: (l.estado||'Disponible').toLowerCase(),
        tipologia: l.tipologia,
        proyectoId: proy?.id, etapaId: eta?.id,
      }));
      window.apiClient('/api/lotes/bulk', {
        method: 'POST',
        body: JSON.stringify({ lotes: payload, proyectoId: proy?.id, etapaId: eta?.id, modo: 'merge' }),
      }).catch(() => {});
    }
  };

  return (
    <div className="page page-lotes-admin" data-screen-label="Administrador de Lotes"
         style={{maxWidth:'none', padding:'24px 28px'}}>

      {/* Header */}
      <div className="lotes-head">
        <div className="hstack gap-12">
          <button className="lotes-back" onClick={() => onGoto?.('admin')}>
            <Icon name="chevronL" size={14}/> Admin
          </button>
          <div className="lotes-head-sep"/>
          <h1 className="lotes-title">Administrador de Lotes</h1>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={exportarCSV}>
            <Icon name="download" size={14}/> Exportar CSV
          </button>
          {puedeEditar && (
            <button className="btn" onClick={() => setImportOpen(true)}>
              <Icon name="upload" size={14}/> Importar Excel
            </button>
          )}
          {puedeEditar && (
            <button className="btn primary" onClick={() => setNuevoOpen(true)}>
              <Icon name="plus" size={14}/> Nuevo Lote
            </button>
          )}
        </div>
      </div>

      {/* Proyecto + stats */}
      <div className="lotes-stats">
        <div className="lotes-proyecto">
          <select className="select lotes-proyecto-sel"
                  value={proyecto}
                  onChange={(e) => setProyecto(e.target.value)}>
            {PROYECTOS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button className="lotes-stat" onClick={() => setEstadoFilter('Todos')}
                data-active={estadoFilter==='Todos'}>
          <div className="lotes-stat-num">{stats.total}</div>
          <div className="lotes-stat-label">Total</div>
        </button>
        <button className="lotes-stat" onClick={() => setEstadoFilter('Disponible')}
                data-active={estadoFilter==='Disponible'} data-tone="disponible">
          <div className="lotes-stat-num">{stats.Disponible}</div>
          <div className="lotes-stat-label">Disponibles</div>
        </button>
        <button className="lotes-stat" onClick={() => setEstadoFilter('Separado')}
                data-active={estadoFilter==='Separado'} data-tone="separado">
          <div className="lotes-stat-num">{stats.Separado}</div>
          <div className="lotes-stat-label">Separados</div>
        </button>
        <button className="lotes-stat" onClick={() => setEstadoFilter('Vendido')}
                data-active={estadoFilter==='Vendido'} data-tone="vendido">
          <div className="lotes-stat-num">{stats.Vendido}</div>
          <div className="lotes-stat-label">Vendidos</div>
        </button>
      </div>

      {/* Filtros */}
      <div className="lotes-filters">
        <div className="search" style={{flex:'0 1 260px', margin:0}}>
          <Icon name="search" size={14}/>
          <input placeholder="Buscar lote o manzana..." value={busqueda}
                 onChange={(e) => setBusqueda(e.target.value)}/>
        </div>
        <div className="lotes-segchips">
          {['Todos','Disponible','Separado','Vendido'].map(s => (
            <button key={s}
                    className={`lotes-segchip ${estadoFilter===s ? 'on':''}`}
                    onClick={() => setEstadoFilter(s)}>{s}</button>
          ))}
        </div>
        <select className="select select-pill" value={manzanaFilter}
                onChange={(e) => setManzanaFilter(e.target.value)}>
          <option value="todas">Todas las manzanas</option>
          {manzanasUnicas.map(m => <option key={m} value={m}>Manzana {m}</option>)}
        </select>
        <select className="select select-pill" value={etapaFilter}
                onChange={(e) => setEtapaFilter(e.target.value)}>
          <option value="todas">Todas las etapas</option>
          {etapasUnicas.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="lotes-filters" style={{marginTop:10}}>
        <select className="select select-pill" style={{flex:'0 0 280px'}}
                value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}>
          <option value="todas">Todas las tipologías</option>
          {tipologiasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex1"/>
        <div className="muted text-sm">{filtered.length} de {lotes.length} lotes</div>
      </div>

      {/* Barra de selección — solo para usuarios con permiso de edición */}
      {puedeEditar && (
      <div className="lotes-selbar">
        <button className={`lotes-selbtn ${selected.size > 0 && selected.size < filtered.length ? 'partial':''} ${selected.size >= filtered.length && filtered.length>0 ? 'on':''}`}
                onClick={selectPage}>
          <span className="lotes-selbox">
            {selected.size >= filtered.length && filtered.length>0
              ? <Icon name="check" size={12}/>
              : selected.size > 0 ? <span className="dash">−</span> : null}
          </span>
          Seleccionar página
        </button>

        <button className={`lotes-selbtn ${selected.size === lotes.length ? 'on':''}`}
                onClick={selectAll}>
          <span className="lotes-selbox">
            {selected.size === lotes.length && <Icon name="check" size={12}/>}
          </span>
          Seleccionar todos ({lotes.length})
        </button>

        <div style={{position:'relative'}}>
          <button className="lotes-selbtn" onClick={() => setBulkOpen(bulkOpen==='manzana' ? null : 'manzana')}>
            <Icon name="building" size={13}/> Por manzana <Icon name="chevronD" size={12}/>
          </button>
          {bulkOpen === 'manzana' && (
            <div className="lotes-bulk-pop">
              {manzanasUnicas.map(m => (
                <button key={m} onClick={() => { selectByMz(m); setBulkOpen(null); }}>
                  Manzana {m} <span className="muted">({lotes.filter(l=>l.manzana===m).length})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{position:'relative'}}>
          <button className="lotes-selbtn" onClick={() => setBulkOpen(bulkOpen==='etapa' ? null : 'etapa')}>
            <Icon name="layers" size={13}/> Por etapa <Icon name="chevronD" size={12}/>
          </button>
          {bulkOpen === 'etapa' && (
            <div className="lotes-bulk-pop">
              {etapasUnicas.map(e => (
                <button key={e} onClick={() => { selectByEtapa(e); setBulkOpen(null); }}>
                  {e} <span className="muted">({lotes.filter(l=>l.etapa===e).length})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected.size > 0 && (
          <div className="lotes-selactions">
            <span className="muted text-sm">{selected.size} seleccionados</span>
            <button className="btn xs" onClick={() => {
              setLotes(prev => prev.map(l => selected.has(l.id) ? {...l, estado:'Disponible'} : l));
              onToast?.(`${selected.size} marcados como disponibles`);
            }}>Marcar disponibles</button>
            <button className="btn xs danger" onClick={deleteSelected}>
              <Icon name="trash" size={12}/> Eliminar
            </button>
            <button className="btn xs ghost" onClick={clearSel}>Limpiar</button>
          </div>
        )}
      </div>
      )}

      {/* Tabla */}
      <div className="lotes-table-wrap">
        <table className="lotes-table">
          <thead>
            <tr>
              <th className="col-check"></th>
              <th>CÓDIGO</th>
              <th>ETAPA</th>
              <th>TIPOLOGÍA</th>
              <th className="num">ÁREA M²</th>
              <th className="num">FRENTE</th>
              <th className="num">FONDO</th>
              <th className="num">L.DER</th>
              <th className="num">L.IZQ</th>
              <th className="num">PRECIO LISTA</th>
              <th>ESTADO</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <LoteRow key={l.id} lote={l}
                       selected={selected.has(l.id)}
                       editing={editingCell?.id === l.id ? editingCell.field : null}
                       onToggleSel={() => toggleSel(l.id)}
                       onStartEdit={(field) => puedeEditar && setEditingCell({id:l.id, field})}
                       onCommit={(field, val) => { updateLote(l.id, field, val); setEditingCell(null); }}
                       onCancel={() => setEditingCell(null)}
                       onDelete={() => puedeEditar && setConfirmDelete(l)}/>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="12" className="lotes-empty">
                <Icon name="search" size={20} style={{color:'var(--muted-2)', marginBottom:6}}/>
                <div>Ningún lote coincide con los filtros.</div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modales */}
      {importOpen && <ImportarLotesModal onClose={() => setImportOpen(false)}
                                          onImport={importarLotes}
                                          lotesActuales={lotes}
                                          onToast={onToast}/>}
      {nuevoOpen && <NuevoLoteModal onClose={() => setNuevoOpen(false)}
                                     manzanas={manzanasUnicas}
                                     etapas={etapasUnicas}
                                     onSave={(d) => {
                                       setLotes(prev => [{...d, id: d.codigo}, ...prev]);
                                       onToast?.('Lote creado');
                                     }}/>}
      {confirmDelete && (
        <ConfirmDeleteModal lote={confirmDelete}
                            onCancel={() => setConfirmDelete(null)}
                            onConfirm={() => deleteLote(confirmDelete.id)}/>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Fila editable
// ═══════════════════════════════════════════════════════════════
const LoteRow = ({ lote, selected, editing, onToggleSel, onStartEdit, onCommit, onCancel, onDelete }) => {
  const tone = ESTADO_TONE[lote.estado] || ESTADO_TONE.Disponible;

  const cell = (field, value, opts = {}) => {
    const isEditing = editing === field;
    const display = opts.format ? opts.format(value) : value;
    const className = `lcell ${opts.num ? 'num' : ''} ${isEditing ? 'editing' : ''} ${opts.precio ? 'precio' : ''}`;

    if (isEditing) {
      return (
        <td className={className}>
          <EditCellInput
            value={value}
            type={opts.type || 'text'}
            options={opts.options}
            onCommit={(v) => onCommit(field, opts.parse ? opts.parse(v) : v)}
            onCancel={onCancel}
          />
        </td>
      );
    }
    return (
      <td className={className} onClick={() => onStartEdit(field)}>
        <span className="lcell-val">{display}</span>
      </td>
    );
  };

  return (
    <tr className={`lote-row ${selected ? 'sel' : ''}`}>
      <td className="col-check">
        <label className="lotes-check">
          <input type="checkbox" checked={selected} onChange={onToggleSel}/>
          <span/>
        </label>
      </td>

      {cell('codigo', lote.codigo)}
      {cell('etapa', lote.etapa, { type: 'select', options: ETAPAS_DEF })}
      {cell('tipologia', lote.tipologia, { type: 'select', options: TIPOLOGIAS_DEF })}
      {cell('m2', lote.m2, { num: true, type: 'number',
                              format: (v) => `${v} m²`,
                              parse: (v) => +v })}
      {cell('frente', lote.frente, { num: true, type: 'number', parse: (v) => +v })}
      {cell('fondo', lote.fondo, { num: true, type: 'number', parse: (v) => +v })}
      {cell('lder', lote.lder, { num: true, type: 'number', parse: (v) => +v })}
      {cell('lizq', lote.lizq, { num: true, type: 'number', parse: (v) => +v })}
      {cell('precio', lote.precio, {
        num: true, type: 'number', precio: true,
        format: (v) => fmtSolesShort(v),
        parse: (v) => +v
      })}

      <td className="col-estado">
        {editing === 'estado' ? (
          <EditCellInput value={lote.estado} type="select" options={ESTADOS_LOTE}
                         onCommit={(v) => onCommit('estado', v)} onCancel={onCancel}/>
        ) : (
          <button className="lestado-pill"
                  style={{background: tone.bg, color: tone.text}}
                  onClick={() => onStartEdit('estado')}>
            {lote.estado}
          </button>
        )}
      </td>

      <td className="col-actions">
        <div className="lote-rowactions">
          <button className="icon-btn xs" onClick={() => onStartEdit('codigo')} title="Editar">
            <Icon name="edit" size={13}/>
          </button>
          <button className="icon-btn xs danger" onClick={onDelete} title="Eliminar">
            <Icon name="trash" size={13}/>
          </button>
        </div>
      </td>
    </tr>
  );
};

// ═══════════════════════════════════════════════════════════════
// Input de celda en edición
// ═══════════════════════════════════════════════════════════════
const EditCellInput = ({ value, type, options, onCommit, onCancel }) => {
  const [v, setV] = React.useState(value);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      if (ref.current.select) ref.current.select();
    }
  }, []);

  if (type === 'select') {
    return (
      <select ref={ref} className="lcell-input lcell-select"
              value={v}
              onChange={(e) => { setV(e.target.value); onCommit(e.target.value); }}
              onBlur={() => onCommit(v)}
              onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input ref={ref}
           className="lcell-input"
           type={type}
           value={v}
           onChange={(e) => setV(e.target.value)}
           onBlur={() => onCommit(v)}
           onKeyDown={(e) => {
             if (e.key === 'Enter') onCommit(v);
             if (e.key === 'Escape') onCancel();
           }}/>
  );
};

Object.assign(window, { ScreenLotesAdmin, LOTES_INICIAL, ETAPAS_DEF, TIPOLOGIAS_DEF });
