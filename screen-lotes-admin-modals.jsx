// screen-lotes-admin-modals.jsx — Modales del Administrador de Lotes

// ═══════════════════════════════════════════════════════════════
// IMPORTAR DESDE EXCEL/CSV
// Flujo: 1) drop/seleccionar archivo → 2) parsear → 3) mapear columnas
//        → 4) preview de cambios → 5) confirmar
// ═══════════════════════════════════════════════════════════════

const CAMPOS_LOTE = [
  { key: 'codigo',    label: 'Código',           req: true,  hint: 'A1, B12, ...' },
  { key: 'manzana',   label: 'Manzana',          req: true,  hint: 'A, B, C, ...' },
  { key: 'numero',    label: 'Número',           req: false, hint: '1, 2, 3, ...' },
  { key: 'etapa',     label: 'Etapa',            req: false, hint: '2DA ETAPA' },
  { key: 'tipologia', label: 'Tipología',        req: false, hint: 'Lote Residencial' },
  { key: 'm2',        label: 'Área (m²)',        req: false, num: true },
  { key: 'frente',    label: 'Frente',           req: false, num: true },
  { key: 'fondo',     label: 'Fondo',            req: false, num: true },
  { key: 'lder',      label: 'L. Derecho',       req: false, num: true },
  { key: 'lizq',      label: 'L. Izquierdo',     req: false, num: true },
  { key: 'precio',    label: 'Precio lista',     req: true,  num: true, hint: 'En soles, sin S/' },
  { key: 'estado',    label: 'Estado',           req: false, hint: 'Disponible / Separado / Vendido' },
];

// adivina el mapeo automático según el nombre de cabecera
function adivinarMapeo(headers) {
  const out = {};
  const norm = (s) => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  const reglas = {
    codigo:    ['codigo', 'lote', 'cod', 'id'],
    manzana:   ['manzana', 'mz', 'block'],
    numero:    ['numero', 'num', 'n'],
    etapa:     ['etapa', 'fase', 'stage'],
    tipologia: ['tipologia', 'tipo', 'categoria'],
    m2:        ['m2', 'area', 'areametros', 'metros', 'm'],
    frente:    ['frente', 'front'],
    fondo:     ['fondo', 'back'],
    lder:      ['lder', 'lateralderecho', 'lateralder', 'lateralder', 'lderecho'],
    lizq:      ['lizq', 'lateralizq', 'lateralizquierdo', 'lizquierdo'],
    precio:    ['preciolista', 'precio', 'price', 'monto', 'valor'],
    estado:    ['estado', 'status', 'condicion'],
  };

  headers.forEach((h, i) => {
    const n = norm(h);
    for (const [k, alts] of Object.entries(reglas)) {
      if (out[k] != null) continue;
      if (alts.includes(n) || alts.some(a => n.includes(a))) {
        out[k] = i;
        break;
      }
    }
  });
  return out;
}

const ImportarLotesModal = ({ onClose, onImport, lotesActuales, onToast }) => {
  const [step, setStep] = React.useState('upload'); // upload | map | preview
  const [fileName, setFileName] = React.useState('');
  const [rawRows, setRawRows] = React.useState([]); // [[headers], [row], [row]...]
  const [mapeo, setMapeo] = React.useState({});
  const [mode, setMode] = React.useState('reemplazar'); // reemplazar | combinar | actualizarPrecios
  const [drag, setDrag] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Procesar archivo (CSV o XLSX)
  const procesarArchivo = async (file) => {
    setError(null);
    setFileName(file.name);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let rows = [];

      if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await loadSheetJS();
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      } else {
        setError('Formato no soportado. Usa .csv, .xlsx o .xls');
        return;
      }

      if (!rows.length || !rows[0].length) {
        setError('Archivo vacío o sin columnas detectables.');
        return;
      }

      setRawRows(rows);
      const m = adivinarMapeo(rows[0]);
      setMapeo(m);
      setStep('map');
    } catch (e) {
      console.error(e);
      setError('No se pudo leer el archivo. ' + (e.message || ''));
    }
  };

  // descargar plantilla
  const descargarPlantilla = () => {
    const headers = CAMPOS_LOTE.map(c => c.label);
    const ej1 = ['A1', 'A', 1, '2DA ETAPA', 'Esquina + Av Principal', 240, 14, 17.14, 17.14, 14, 50000, 'Disponible'];
    const ej2 = ['A2', 'A', 2, '2DA ETAPA', 'Lote Residencial', 240, 14, 17.14, 17.14, 14, 47000, 'Disponible'];
    const csv = [headers.join(','), ej1.join(','), ej2.join(',')].join('\n');
    downloadFile('plantilla-lotes.csv', 'text/csv;charset=utf-8;', '\uFEFF' + csv);
    onToast?.('Plantilla descargada');
  };

  // Datos parseados según mapeo actual
  const parsedRows = React.useMemo(() => {
    if (step === 'upload') return [];
    const dataRows = rawRows.slice(1);
    return dataRows.map((r) => {
      const obj = {};
      CAMPOS_LOTE.forEach((c) => {
        const idx = mapeo[c.key];
        if (idx != null) {
          let v = r[idx];
          if (c.num && v !== '' && v != null) {
            // soporta "S/ 47.000" o "47,000.00"
            const cleaned = String(v).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{3}(?:[,.]|$))/g, '').replace(',', '.');
            const num = parseFloat(cleaned);
            v = isNaN(num) ? null : num;
          }
          obj[c.key] = v;
        }
      });
      // valores por defecto
      if (!obj.estado) obj.estado = 'Disponible';
      if (!obj.manzana && obj.codigo) obj.manzana = String(obj.codigo).match(/^([A-Z]+)/)?.[1] || '';
      if (!obj.numero && obj.codigo) obj.numero = +(String(obj.codigo).match(/(\d+)/)?.[1] || 0);
      return obj;
    }).filter((o) => o.codigo);
  }, [rawRows, mapeo, step]);

  // Validación
  const validacion = React.useMemo(() => {
    const errores = [];
    const codigosVistos = new Set();
    parsedRows.forEach((r, i) => {
      if (!r.codigo) errores.push({ fila: i + 2, msg: 'Falta código' });
      else if (codigosVistos.has(r.codigo)) errores.push({ fila: i + 2, msg: `Código duplicado: ${r.codigo}` });
      else codigosVistos.add(r.codigo);
      if (r.precio == null || isNaN(r.precio)) errores.push({ fila: i + 2, msg: `Precio inválido en ${r.codigo}` });
      if (r.estado && !['Disponible', 'Separado', 'Vendido'].includes(r.estado))
        errores.push({ fila: i + 2, msg: `Estado "${r.estado}" desconocido en ${r.codigo}` });
    });
    return { errores, validas: parsedRows.length - errores.length };
  }, [parsedRows]);

  const confirmar = () => {
    if (mode === 'reemplazar') {
      onImport(parsedRows);
    } else if (mode === 'combinar') {
      const map = new Map(lotesActuales.map(l => [l.codigo, l]));
      for (const r of parsedRows) map.set(r.codigo, { ...map.get(r.codigo), ...r });
      onImport(Array.from(map.values()));
    } else if (mode === 'actualizarPrecios') {
      const map = new Map(parsedRows.map(r => [r.codigo, r.precio]));
      onImport(lotesActuales.map(l => map.has(l.codigo) ? { ...l, precio: map.get(l.codigo) } : l));
    }
  };

  // ──── UI ────
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal lotes-import" onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8">
            <Icon name="upload" size={16}/> Importar lotes desde Excel
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Progreso */}
        <div className="import-steps">
          {['Subir archivo', 'Mapear columnas', 'Confirmar'].map((s, i) => {
            const stepIdx = step === 'upload' ? 0 : step === 'map' ? 1 : 2;
            return (
              <div key={s} className={`import-step ${i === stepIdx ? 'on' : ''} ${i < stepIdx ? 'done' : ''}`}>
                <span className="import-step-num">{i < stepIdx ? '✓' : i + 1}</span>
                <span>{s}</span>
              </div>
            );
          })}
        </div>

        {step === 'upload' && (
          <div className="card-pad">
            <label
              className={`import-drop ${drag ? 'on' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault(); setDrag(false);
                const f = e.dataTransfer.files[0];
                if (f) procesarArchivo(f);
              }}>
              <input type="file" accept=".csv,.xlsx,.xls,.txt"
                     onChange={(e) => e.target.files[0] && procesarArchivo(e.target.files[0])}
                     style={{display:'none'}}/>
              <div className="import-drop-ic">
                <Icon name="upload" size={26}/>
              </div>
              <div className="import-drop-title">Arrastra tu Excel aquí o haz clic para elegir</div>
              <div className="import-drop-hint">Acepta .xlsx, .xls y .csv — máximo 5 MB</div>
            </label>

            {error && <div className="import-error"><Icon name="alert" size={14}/> {error}</div>}

            <div className="import-templates">
              <div className="hstack between mb-8">
                <div className="strong text-sm">¿No tienes una plantilla?</div>
                <button className="btn xs" onClick={descargarPlantilla}>
                  <Icon name="download" size={12}/> Descargar plantilla
                </button>
              </div>
              <div className="muted text-sm">
                El archivo debe tener una fila de cabeceras y al menos las columnas
                <b> Código</b>, <b>Precio lista</b> y <b>Manzana</b>. El resto se autocompleta.
              </div>
            </div>

            <div className="import-columns">
              <div className="strong text-sm mb-6">Columnas reconocidas</div>
              <div className="import-cols-grid">
                {CAMPOS_LOTE.map(c => (
                  <div key={c.key} className="import-col-chip">
                    <span className={`import-col-dot ${c.req ? 'req' : ''}`}/>
                    <span>{c.label}</span>
                    {c.req && <span className="muted text-xs">obligatoria</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'map' && (
          <div className="card-pad">
            <div className="hstack between mb-12">
              <div>
                <div className="text-sm strong">{fileName}</div>
                <div className="muted text-xs">
                  {rawRows.length - 1} filas detectadas · {rawRows[0]?.length || 0} columnas
                </div>
              </div>
              <button className="btn xs" onClick={() => setStep('upload')}>
                <Icon name="refresh" size={12}/> Cambiar archivo
              </button>
            </div>

            <div className="import-mapping">
              <div className="import-mapping-head">
                <div>Campo en Mattika</div>
                <div>Columna del Excel</div>
                <div>Vista previa</div>
              </div>
              {CAMPOS_LOTE.map(c => {
                const idx = mapeo[c.key];
                const sample = idx != null ? (rawRows[1]?.[idx] ?? '') : '';
                return (
                  <div key={c.key} className="import-mapping-row">
                    <div className="import-field">
                      <span>{c.label}</span>
                      {c.req && <span className="import-req">requerida</span>}
                    </div>
                    <select className="select" value={idx ?? ''}
                            onChange={(e) => setMapeo({...mapeo, [c.key]: e.target.value === '' ? null : +e.target.value})}>
                      <option value="">— Sin asignar —</option>
                      {rawRows[0].map((h, i) => (
                        <option key={i} value={i}>{h || `Columna ${i+1}`}</option>
                      ))}
                    </select>
                    <div className="import-sample">{sample !== '' ? String(sample) : <span className="muted">—</span>}</div>
                  </div>
                );
              })}
            </div>

            <div className="hstack gap-8 mt-16" style={{justifyContent:'flex-end'}}>
              <button className="btn" onClick={() => setStep('upload')}>Atrás</button>
              <button className="btn primary" onClick={() => setStep('preview')}
                      disabled={mapeo.codigo == null || mapeo.precio == null}>
                Continuar <Icon name="chevronR" size={13}/>
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="card-pad">
            <div className="import-summary">
              <div className="import-summary-stat">
                <div className="import-summary-num">{parsedRows.length}</div>
                <div className="import-summary-label">Filas a importar</div>
              </div>
              <div className="import-summary-stat" data-tone="success">
                <div className="import-summary-num">{validacion.validas}</div>
                <div className="import-summary-label">Válidas</div>
              </div>
              <div className="import-summary-stat" data-tone={validacion.errores.length ? 'danger' : 'muted'}>
                <div className="import-summary-num">{validacion.errores.length}</div>
                <div className="import-summary-label">Con errores</div>
              </div>
            </div>

            <div className="import-mode strong text-sm mb-8">¿Cómo aplicar la importación?</div>
            <div className="import-mode-grid">
              {[
                { id:'reemplazar',        label:'Reemplazar todo',        hint:`Borra los ${lotesActuales.length} lotes actuales y deja solo los del archivo.` },
                { id:'combinar',          label:'Combinar (recomendado)', hint:'Agrega lotes nuevos; los existentes se actualizan campo por campo.' },
                { id:'actualizarPrecios', label:'Solo actualizar precios',hint:'Mantiene todo igual; solo cambia el precio lista de los lotes coincidentes.' },
              ].map(o => (
                <label key={o.id} className={`import-mode-card ${mode === o.id ? 'on' : ''}`}>
                  <input type="radio" name="impmode" checked={mode === o.id} onChange={() => setMode(o.id)}/>
                  <div>
                    <div className="strong">{o.label}</div>
                    <div className="muted text-xs">{o.hint}</div>
                  </div>
                </label>
              ))}
            </div>

            {validacion.errores.length > 0 && (
              <div className="import-errores">
                <div className="strong text-sm mb-6">
                  <Icon name="alert" size={13}/> {validacion.errores.length} errores detectados
                </div>
                <ul>
                  {validacion.errores.slice(0, 5).map((e, i) => (
                    <li key={i}>Fila {e.fila}: {e.msg}</li>
                  ))}
                  {validacion.errores.length > 5 && <li className="muted">…y {validacion.errores.length - 5} más</li>}
                </ul>
              </div>
            )}

            <div className="strong text-sm mb-6 mt-12">Vista previa (primeras 5 filas)</div>
            <div className="import-preview-wrap">
              <table className="import-preview">
                <thead>
                  <tr>
                    {CAMPOS_LOTE.filter(c => mapeo[c.key] != null).map(c => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 5).map((r, i) => (
                    <tr key={i}>
                      {CAMPOS_LOTE.filter(c => mapeo[c.key] != null).map(c => (
                        <td key={c.key} className={c.num ? 'num' : ''}>
                          {c.key === 'precio' ? fmtSolesShort(r[c.key]) : (r[c.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hstack gap-8 mt-16" style={{justifyContent:'flex-end'}}>
              <button className="btn" onClick={() => setStep('map')}>Atrás</button>
              <button className="btn primary" onClick={confirmar}
                      disabled={validacion.validas === 0}>
                <Icon name="check" size={13}/> Importar {validacion.validas} lotes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NUEVO LOTE
// ═══════════════════════════════════════════════════════════════
const NuevoLoteModal = ({ onClose, onSave, manzanas, etapas }) => {
  const [f, setF] = React.useState({
    codigo: '', manzana: manzanas[0] || 'A', numero: 1,
    etapa: etapas[0] || '2DA ETAPA',
    tipologia: 'Lote Residencial',
    m2: 240, frente: 14, fondo: 17.14, lder: 17.14, lizq: 17.14,
    precio: 47000, estado: 'Disponible',
  });
  const set = (k, v) => setF({ ...f, [k]: v });

  const save = () => {
    if (!f.codigo) return alert('Ingresa el código del lote');
    if (!f.precio) return alert('Ingresa el precio');
    onSave(f);
    onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:'min(640px, calc(100vw - 32px))'}}
           onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8">
            <Icon name="plus" size={16}/> Nuevo Lote
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="card-pad">
          <div className="field-group cols-3">
            <div className="field">
              <label className="field-label">Código</label>
              <input className="input mono" placeholder="A1" value={f.codigo}
                     onChange={(e) => set('codigo', e.target.value.toUpperCase())}/>
            </div>
            <div className="field">
              <label className="field-label">Manzana</label>
              <input className="input mono" value={f.manzana}
                     onChange={(e) => set('manzana', e.target.value.toUpperCase())}/>
            </div>
            <div className="field">
              <label className="field-label">N°</label>
              <input className="input mono" type="number" value={f.numero}
                     onChange={(e) => set('numero', +e.target.value)}/>
            </div>

            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field-label">Etapa</label>
              <select className="select" value={f.etapa} onChange={(e) => set('etapa', e.target.value)}>
                {ETAPAS_DEF.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Estado</label>
              <select className="select" value={f.estado} onChange={(e) => set('estado', e.target.value)}>
                {['Disponible','Separado','Vendido'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="field" style={{gridColumn:'span 3'}}>
              <label className="field-label">Tipología</label>
              <select className="select" value={f.tipologia} onChange={(e) => set('tipologia', e.target.value)}>
                {TIPOLOGIAS_DEF.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="field">
              <label className="field-label">Área (m²)</label>
              <input className="input mono" type="number" value={f.m2} onChange={(e) => set('m2', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Frente</label>
              <input className="input mono" type="number" step="0.01" value={f.frente} onChange={(e) => set('frente', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Fondo</label>
              <input className="input mono" type="number" step="0.01" value={f.fondo} onChange={(e) => set('fondo', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">L. derecho</label>
              <input className="input mono" type="number" step="0.01" value={f.lder} onChange={(e) => set('lder', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">L. izquierdo</label>
              <input className="input mono" type="number" step="0.01" value={f.lizq} onChange={(e) => set('lizq', +e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Precio lista</label>
              <div className="input-prefix">
                <span className="px">S/</span>
                <input type="number" value={f.precio} onChange={(e) => set('precio', +e.target.value)}/>
              </div>
            </div>
          </div>
        </div>
        <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={save}>
            <Icon name="check" size={13}/> Guardar lote
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONFIRMAR ELIMINAR
// ═══════════════════════════════════════════════════════════════
const ConfirmDeleteModal = ({ lote, onCancel, onConfirm }) => (
  <div className="modal-bg" onClick={onCancel}>
    <div className="modal" style={{width:'min(420px, calc(100vw - 32px))'}}
         onClick={(e) => e.stopPropagation()}>
      <div className="card-pad" style={{textAlign:'center', padding:'28px 24px 16px'}}>
        <div className="confirm-icon">
          <Icon name="trash" size={24}/>
        </div>
        <h3 style={{margin:'12px 0 4px', fontWeight:600}}>¿Eliminar lote {lote.codigo}?</h3>
        <p className="muted text-sm" style={{margin:0}}>
          Esta acción no se puede deshacer. El lote será removido del proyecto.
        </p>
      </div>
      <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn danger" onClick={onConfirm}>
          <Icon name="trash" size={13}/> Eliminar
        </button>
      </div>
    </div>
  </div>
);

Object.assign(window, { ImportarLotesModal, NuevoLoteModal, ConfirmDeleteModal });
