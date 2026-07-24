// screen-comercial.jsx — Módulo "Comercial" (tablero de ventas Nápoles) integrado en MATTIKA.
// Envuelve el motor portado (ComercialEngine) y lo conecta a React; la UI de cada
// sub-tab vive en comercial-tabs-a/b/c.jsx. Datos propios en localStorage (namespace napoles_*).

const S = window.__csS;

const TABS_COM = [
  ['tablero', 'Tablero'],
  ['ejecutivos', 'Ejecutivos'],
  ['descuentos', 'Descuentos'],
  ['captacion', 'Captación & Ads'],
  ['comisiones', 'Comisiones'],
  ['boletas', 'Boletas'],
];
const TAB_KEYS = TABS_COM.map((t) => t[0]);
const TAB_LOCKED = { comisiones: true, boletas: true };

function ScreenComercial() {
  const ref = React.useRef(null);
  const [, force] = React.useReducer((x) => x + 1, 0);
  if (!ref.current) {
    const e = new window.ComercialEngine();
    e.props = { accentColor: '#1E4FD4' };
    e._notify = () => force();
    ref.current = e;
  }
  const engine = ref.current;
  React.useEffect(() => {
    try { engine.componentDidMount && engine.componentDidMount(); } catch (err) { console.error('comercial mount', err); }
    // Comercial es solo analítica: si quedó guardada una pestaña operativa ya retirada
    // (operaciones/ubicaciones/cuotas), volvemos al Tablero.
    if (!TAB_KEYS.includes(engine.state.tab)) engine.selectTab('tablero');
  }, []);

  const V = engine.renderVals();
  const tab = engine.state.tab;

  const {
    CForm, CTablero, COperaciones, CUbicaciones, CCuotas,
    CEjecutivos, CDescuentos, CCaptacion, CComisiones, CBoletas, CInforme,
  } = window;

  return (
    <div className="page page-comercial" data-screen-label="Comercial">
      <div className="page-head">
        <div>
          <div className="eyebrow">Gestión comercial · Nápoles</div>
          <h1 className="page-title">{V.curSectionTitle}</h1>
          <div className="page-sub">Analítica y reportes de ventas · el detalle de operaciones, lotes y cuotas vive en el menú lateral.</div>
        </div>
        <div className="hstack gap-8" style={{flexWrap:'wrap'}}>
          <button className="btn" onClick={() => V.exportVentas()}><Icon name="download" size={14}/> Exportar</button>
          <button className="btn" onClick={() => engine.openReport()}><Icon name="doc" size={14}/> Generar informe</button>
          <button className="btn ghost" onClick={() => V.resetAll()}>{V.resetLabel}</button>
        </div>
      </div>

      <div className="cmx-tabs">
        {TABS_COM.map(([k, label]) => (
          <button key={k} className={'cmx-tab' + (tab === k ? ' active' : '')} onClick={() => engine.selectTab(k)}>
            {label}{TAB_LOCKED[k] && <span className="cmx-lock">🔒</span>}
          </button>
        ))}
      </div>

      <div className="card card-pad mb-16 cmx-filterbar">
        <div className="cmx-filter-row">
          <div className="hstack gap-6" style={{flexWrap:'wrap'}}>
            {(V.teamChips || []).map((c, i) => (
              <button key={i} className={`filter-chip ${c.active ? 'active' : ''}`} onClick={c.onClick}>{c.label}</button>
            ))}
          </div>
          <div style={{flex:1}}></div>
          <select className="select" style={{width:'auto'}} value={V.asesorFilter} onChange={V.onAsesorFilter}>
            <option value="Todos">Todos los asesores</option>
            {(V.asesorOpts || []).map((o, i) => (<option key={i} value={o.v}>{o.l}</option>))}
          </select>
        </div>
        <div className="hstack gap-6" style={{flexWrap:'wrap'}}>
          {(V.periodChips || []).map((c, i) => (
            <button key={i} className={`filter-chip ${c.active ? 'active' : ''}`} onClick={c.onClick}>{c.label}</button>
          ))}
        </div>
      </div>

      {CForm && <CForm V={V} />}
      {CTablero && <CTablero V={V} />}
      {COperaciones && <COperaciones V={V} />}
      {CUbicaciones && <CUbicaciones V={V} />}
      {CCuotas && <CCuotas V={V} />}
      {CEjecutivos && <CEjecutivos V={V} />}
      {CDescuentos && <CDescuentos V={V} />}
      {CCaptacion && <CCaptacion V={V} />}
      {CComisiones && <CComisiones V={V} />}
      {CBoletas && <CBoletas V={V} />}
      {CInforme && <CInforme V={V} />}

      {/* Importador CSV */}
      {V.importOpen && (
        <div className="cmx-modal-backdrop" onClick={() => V.closeImport()}>
          <div className="cmx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cmx-modal-head">
              <h2>Importar ventas (CSV)</h2>
              <button className="cmx-x" onClick={() => V.closeImport()}>✕</button>
            </div>
            <p className="cmx-modal-note">Columnas: periodo (M.AAAA), ejecutivo, equipo, cliente, lote (Mz-Lt), etapa, canal, tipo, lista, desc, pfinal, rec, fSep, fFirma.</p>
            <input type="file" accept=".csv,text/csv" onChange={V.onImportFile} style={{ marginBottom: 10 }} />
            <textarea className="cmx-import-text" value={V.importText} onChange={V.onImportText} placeholder="…o pega aquí el contenido CSV" />
            <div className="cmx-modal-actions">
              <button className="btn" onClick={() => V.parseImport()}>Validar</button>
              {V.importHasRes && (
                <span className="cmx-import-res">
                  {V.importValidCount} válidas · {V.importErrCount} errores · {V.importDupeCount} duplicadas
                </span>
              )}
              <div style={{ flex: 1 }} />
              <button className="btn primary" disabled={!V.importCanConfirm} onClick={() => V.confirmImport()}>
                Importar {V.importValidCount || ''}
              </button>
            </div>
            {V.importHasRes && V.importErrCount > 0 && (
              <div className="cmx-import-errors">
                {V.importErrors.map((e, i) => (<div key={i}>Fila {e.row}: {e.msg}</div>))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.ScreenComercial = ScreenComercial;
