// screen-condiciones.jsx — Condiciones Comerciales (admin)
// Configuración centralizada de límites de descuento, plazos y aprobaciones.

// Las condiciones se guardan POR EMPRESA. Si no hay sesión, usa una clave
// genérica (para previews fuera de auth). Cada empresa tiene sus propios
// defaults — Lumina (Trujillo) y Golden (Malabrigo) operan distinto.

const CONDICIONES_KEY_BASE = 'mattika.condiciones-comerciales.v1';

function _empresaId() {
  try {
    const s = JSON.parse(localStorage.getItem('mattika.sesion.v1') || 'null');
    return s?.empresaId || '_default';
  } catch (e) { return '_default'; }
}
function _condicionesKey() {
  return `${CONDICIONES_KEY_BASE}.${_empresaId()}`;
}

// Defaults base (Lumina · Nápoles — financiamiento más agresivo)
const CONDICIONES_DEFAULTS = {
  plazoMaximo: 60,
  tasaPorDefecto: 8,
  dscMaxFinanciamiento: 1400,
  dscExcepcionFinanciamiento: 2000,
  dscMaxContado: 3400,
  dscExcepcionContado: 4000,
  tiempoExcepcion: 30,
  tiempoVB: 120,
  aprobadores: ['SubGerente Comercial', 'Gerente General'],
};

// Defaults personalizados por empresa
const CONDICIONES_POR_EMPRESA = {
  lumina: {
    plazoMaximo: 60,
    tasaPorDefecto: 8,
    dscMaxFinanciamiento: 1400,
    dscExcepcionFinanciamiento: 2000,
    dscMaxContado: 3400,
    dscExcepcionContado: 4000,
    tiempoExcepcion: 30,
    tiempoVB: 120,
    aprobadores: ['SubGerente Comercial', 'Gerente General'],
  },
  golden: {
    plazoMaximo: 48,
    tasaPorDefecto: 9.5,
    dscMaxFinanciamiento: 900,
    dscExcepcionFinanciamiento: 1500,
    dscMaxContado: 2800,
    dscExcepcionContado: 3500,
    tiempoExcepcion: 45,
    tiempoVB: 180,
    aprobadores: ['Jefe Comercial', 'Gerente General', 'Directorio'],
  },
};

// Clave legacy (sin empresa) — para migración
const CONDICIONES_LEGACY_KEY = 'mattika.condiciones-comerciales.v1';

function loadCondiciones() {
  const eid = _empresaId();
  const defaults = CONDICIONES_POR_EMPRESA[eid] || CONDICIONES_DEFAULTS;
  try {
    const raw = localStorage.getItem(_condicionesKey());
    if (raw) return { ...defaults, ...JSON.parse(raw) };
    // Si no hay configuración aún, persistir defaults de la empresa para que
    // el resto del sistema (cotizador, etc.) lea valores estables.
    return defaults;
  } catch (e) { return defaults; }
}
function saveCondiciones(c) {
  try { localStorage.setItem(_condicionesKey(), JSON.stringify(c)); } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// Pantalla
// ═══════════════════════════════════════════════════════════════
const ScreenCondiciones = ({ onGoto, onToast }) => {
  const [c, setC] = React.useState(() => loadCondiciones());
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (!window.apiClient) return;
    window.apiClient('/api/condiciones').then(data => {
      if (data && Object.keys(data).length > 0) {
        const eid = _empresaId();
        const defaults = CONDICIONES_POR_EMPRESA[eid] || CONDICIONES_DEFAULTS;
        setC({ ...defaults, ...data });
        saveCondiciones({ ...defaults, ...data });
      }
    }).catch(() => {});
  }, []);

  const upd = (k, v) => { setC({ ...c, [k]: v }); setDirty(true); };

  const save = () => {
    saveCondiciones(c);
    setDirty(false);
    onToast?.('Condiciones comerciales guardadas');
    if (window.apiClient) {
      window.apiClient('/api/condiciones', { method: 'PUT', body: JSON.stringify(c) }).catch(() => {});
    }
  };

  const restablecer = () => {
    if (confirm('¿Restablecer a los valores por defecto?')) {
      setC(CONDICIONES_DEFAULTS);
      setDirty(true);
    }
  };

  return (
    <div className="page page-condiciones" data-screen-label="Condiciones Comerciales"
         style={{maxWidth: 980}}>
      <div className="lotes-head">
        <div className="hstack gap-12">
          <button className="lotes-back" onClick={() => onGoto?.('admin')}>
            <Icon name="chevronL" size={14}/> Admin
          </button>
          <div className="lotes-head-sep"/>
          <h1 className="lotes-title">Condiciones Comerciales</h1>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={restablecer}>
            <Icon name="refresh" size={13}/> Restablecer
          </button>
          <button className="btn primary" onClick={save} disabled={!dirty}>
            <Icon name="check" size={13}/> Guardar cambios
          </button>
        </div>
      </div>

      <div className="cond-intro">
        <Icon name="shield" size={14}/>
        <div>
          <b>Política de descuentos del proyecto.</b> Estos límites se aplican automáticamente en
          el Cotizador del Plano. Cambios aquí afectan a todo el equipo comercial.
        </div>
      </div>

      {/* ── Plazos de financiamiento ── */}
      <div className="cond-section">
        <div className="cond-section-head">
          <Icon name="clock" size={14}/>
          <h3>Financiamiento</h3>
        </div>
        <div className="cond-grid">
          <div className="cond-field">
            <label>Plazo máximo</label>
            <div className="input-prefix">
              <input type="number" min="12" max="120" step="6"
                     value={c.plazoMaximo}
                     onChange={(e) => upd('plazoMaximo', +e.target.value)}/>
              <span className="px-r">meses</span>
            </div>
            <div className="cond-hint">Los asesores no podrán ofrecer plazos mayores a este.</div>
          </div>
          <div className="cond-field">
            <label>Tasa anual sugerida</label>
            <div className="input-prefix">
              <input type="number" min="0" max="30" step="0.5"
                     value={c.tasaPorDefecto}
                     onChange={(e) => upd('tasaPorDefecto', +e.target.value)}/>
              <span className="px-r">%</span>
            </div>
            <div className="cond-hint">Valor por defecto del slider de tasa en el cotizador.</div>
          </div>
        </div>
      </div>

      {/* ── Descuentos ── */}
      <div className="cond-section">
        <div className="cond-section-head">
          <Icon name="money" size={14}/>
          <h3>Topes de descuento</h3>
        </div>
        <div className="cond-tier-table">
          <div className="cond-tier-row cond-tier-head">
            <div>Nivel</div>
            <div>Contado</div>
            <div>Financiamiento</div>
            <div>Aprobación</div>
          </div>

          <div className="cond-tier-row">
            <div className="cond-tier-label">
              <span className="cond-tier-dot" style={{background:'#1ea968'}}/>
              <div>
                <div className="strong">Descuento estándar</div>
                <div className="muted text-xs">Cualquier asesor puede aplicar</div>
              </div>
            </div>
            <div className="input-prefix">
              <span className="px">S/</span>
              <input type="number" min="0" step="100"
                     value={c.dscMaxContado}
                     onChange={(e) => upd('dscMaxContado', +e.target.value)}/>
            </div>
            <div className="input-prefix">
              <span className="px">S/</span>
              <input type="number" min="0" step="100"
                     value={c.dscMaxFinanciamiento}
                     onChange={(e) => upd('dscMaxFinanciamiento', +e.target.value)}/>
            </div>
            <div className="cond-tier-aprob">
              <span className="pill success"><span className="dot"/>Automática</span>
            </div>
          </div>

          <div className="cond-tier-row">
            <div className="cond-tier-label">
              <span className="cond-tier-dot" style={{background:'#d99b1e'}}/>
              <div>
                <div className="strong">Excepción</div>
                <div className="muted text-xs">Espera de aprobación automática</div>
              </div>
            </div>
            <div className="input-prefix">
              <span className="px">S/</span>
              <input type="number" min="0" step="100"
                     value={c.dscExcepcionContado}
                     onChange={(e) => upd('dscExcepcionContado', +e.target.value)}/>
            </div>
            <div className="input-prefix">
              <span className="px">S/</span>
              <input type="number" min="0" step="100"
                     value={c.dscExcepcionFinanciamiento}
                     onChange={(e) => upd('dscExcepcionFinanciamiento', +e.target.value)}/>
            </div>
            <div className="cond-tier-aprob">
              <div className="input-prefix" style={{maxWidth: 140}}>
                <input type="number" min="5" max="600" step="5"
                       value={c.tiempoExcepcion}
                       onChange={(e) => upd('tiempoExcepcion', +e.target.value)}/>
                <span className="px-r">seg</span>
              </div>
            </div>
          </div>

          <div className="cond-tier-row">
            <div className="cond-tier-label">
              <span className="cond-tier-dot" style={{background:'#B33049'}}/>
              <div>
                <div className="strong">Visto Bueno (VB)</div>
                <div className="muted text-xs">Cualquier monto, requiere firma de gerencia</div>
              </div>
            </div>
            <div className="muted text-sm" style={{display:'flex',alignItems:'center'}}>
              Sin tope · requiere VB
            </div>
            <div className="muted text-sm" style={{display:'flex',alignItems:'center'}}>
              Sin tope · requiere VB
            </div>
            <div className="cond-tier-aprob">
              <div className="input-prefix" style={{maxWidth: 140}}>
                <input type="number" min="30" max="1800" step="30"
                       value={c.tiempoVB}
                       onChange={(e) => upd('tiempoVB', +e.target.value)}/>
                <span className="px-r">seg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Aprobadores autorizados ── */}
      <div className="cond-section">
        <div className="cond-section-head">
          <Icon name="users" size={14}/>
          <h3>Aprobadores autorizados para VB Gerencial</h3>
        </div>
        <p className="cond-section-sub">
          Solo estos roles pueden firmar el visto bueno para descuentos sin tope. El sistema
          registra automáticamente quién aprobó cada operación.
        </p>
        <div className="cond-aprobadores">
          {c.aprobadores.map((a, i) => (
            <div key={i} className="cond-aprobador-row">
              <Icon name="shield" size={14} style={{color:'var(--brand)'}}/>
              <input className="input"
                     value={a}
                     onChange={(e) => {
                       const next = [...c.aprobadores];
                       next[i] = e.target.value;
                       upd('aprobadores', next);
                     }}/>
              <button className="icon-btn xs danger"
                      onClick={() => upd('aprobadores', c.aprobadores.filter((_, j) => j !== i))}
                      disabled={c.aprobadores.length <= 1}
                      title="Quitar">
                <Icon name="trash" size={13}/>
              </button>
            </div>
          ))}
          <button className="btn xs" style={{alignSelf:'flex-start'}}
                  onClick={() => upd('aprobadores', [...c.aprobadores, ''])}>
            <Icon name="plus" size={12}/> Agregar aprobador
          </button>
        </div>
      </div>

      {/* Resumen visible al final */}
      <div className="cond-summary">
        <div className="strong text-sm mb-8">
          <Icon name="eye" size={13}/> Vista previa de las reglas
        </div>
        <div className="cond-summary-grid">
          <div className="cond-summary-item">
            <div className="cond-summary-label">Asesor puede dar hasta</div>
            <div className="cond-summary-val">
              <b className="mono">S/ {c.dscMaxContado.toLocaleString('es-PE')}</b> contado
              <span className="muted"> · </span>
              <b className="mono">S/ {c.dscMaxFinanciamiento.toLocaleString('es-PE')}</b> financ.
            </div>
          </div>
          <div className="cond-summary-item">
            <div className="cond-summary-label">Con excepción (en {c.tiempoExcepcion}s)</div>
            <div className="cond-summary-val">
              <b className="mono">S/ {c.dscExcepcionContado.toLocaleString('es-PE')}</b> contado
              <span className="muted"> · </span>
              <b className="mono">S/ {c.dscExcepcionFinanciamiento.toLocaleString('es-PE')}</b> financ.
            </div>
          </div>
          <div className="cond-summary-item">
            <div className="cond-summary-label">VB Gerencial (en {Math.round(c.tiempoVB/60)} min)</div>
            <div className="cond-summary-val">
              Sin tope · {c.aprobadores.length} aprobador{c.aprobadores.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenCondiciones, loadCondiciones, saveCondiciones, CONDICIONES_DEFAULTS, CONDICIONES_POR_EMPRESA });
