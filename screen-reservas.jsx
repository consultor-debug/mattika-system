// screen-reservas.jsx — Separar lote (con plazo de vencimiento) + pantalla
// de gestión de Reservas con ciclo de vida (Activas / Vencidas / Convertidas
// / Liberadas). Las separaciones se liberan solas al vencer el plazo.
// ════════════════════════════════════════════════════════════════

const PLAZOS_RESERVA = [
  { dias: 3,  label: '3 días', sub: 'estándar' },
  { dias: 7,  label: '7 días' },
  { dias: 12, label: '12 días' },
  { dias: 15, label: '15 días' },
  { dias: 30, label: '30 días' },
];

function _fmtFechaLarga(d) {
  try {
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (e) { return ''; }
}
function _fmtSoles(n) {
  return 'S/ ' + (Math.round(+n || 0)).toLocaleString('es-PE');
}
// Cuenta regresiva legible: "6d 23h" · "5h 12m" · "Vencido"
function _restante(fechaVence) {
  if (!fechaVence) return { txt: '—', vencido: false, urgente: false };
  const ms = new Date(fechaVence).getTime() - Date.now();
  if (ms <= 0) return { txt: 'Vencido', vencido: true, urgente: true };
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const txt = d >= 1 ? `${d}d ${h}h` : (h >= 1 ? `${h}h ${m}m` : `${m}m`);
  return { txt, vencido: false, urgente: d < 1 };
}

// ─── Modal: SEPARAR LOTE (reserva con plazo) ────────────────────
const SepararLoteModal = ({ lote, initial, onClose, onSave, onToast }) => {
  const [dni, setDni] = React.useState(initial?.dni || '');
  const [nombres, setNombres] = React.useState(initial?.nombres || '');
  const [apellidos, setApellidos] = React.useState(initial?.apellidos || '');
  const [telefono, setTelefono] = React.useState(initial?.telefono || '');
  const [plazo, setPlazo] = React.useState(initial?.plazoDias || 7);
  const [reniecState, setReniecState] = React.useState(initial?.reniecVerificado ? 'ok' : 'idle');

  const vence = new Date(Date.now() + plazo * 86400000);
  const esExtendido = plazo > 7;

  const buscarReniec = async () => {
    if (!/^\d{8}$/.test(dni)) { setReniecState('error'); return; }
    setReniecState('loading');
    try {
      const r = await (window.consultaReniec?.(dni) || Promise.reject(new Error('RENIEC no disponible')));
      setNombres(r.nombres || ''); setApellidos(r.apellidos || '');
      setReniecState('ok');
    } catch (e) { setReniecState('error'); }
  };

  const guardar = () => {
    if (!/^\d{8}$/.test(dni)) { onToast?.('Ingresa un DNI válido (8 dígitos)'); return; }
    if (!telefono.trim()) { onToast?.('Ingresa un teléfono de contacto'); return; }
    const ses = window.getSesion?.() || {};
    const ahora = new Date();
    onSave({
      loteId: lote.id,
      tipo: 'separacion',
      estado: 'activa',
      dni: dni.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.trim(),
      email: initial?.email || '',
      precioLista: lote.precio,
      plazoDias: plazo,
      fechaInicio: ahora.toISOString(),
      fechaVence: vence.toISOString(),
      asesorId: ses.usuarioId || ses.asesorId || '',
      asesorNombre: ses.nombre || 'Asesor',
      reniecVerificado: reniecState === 'ok',
      documentos: 'pendientes',
      fecha: ahora.toISOString(),
      historial: [
        ...(initial?.historial || []),
        { accion: initial ? 'actualizada' : 'separada', fecha: ahora.toISOString(), detalle: `Plazo ${plazo} días`, por: ses.nombre || 'Asesor' },
      ],
    });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal modal-quick" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Separar lote</h2>
            <small>Reserva el lote <b>{lote.id}</b> (Mz {lote.manzana} · N° {lote.numero}). Vencido el plazo se libera automáticamente.</small>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        <div className="card-pad vstack gap-14">
          {/* Precio lista */}
          <div className="sep-precio">
            <span>Precio lista</span>
            <b>{_fmtSoles(lote.precio)}</b>
          </div>

          {/* Cliente (DNI) */}
          <div className="field">
            <label className="field-label">Cliente <span className="req">*</span></label>
            <div className="quick-dni-row">
              <input className="input" placeholder="DNI (8 dígitos)" maxLength={8} inputMode="numeric"
                     value={dni}
                     onChange={(e) => { setDni(e.target.value.replace(/\D/g,'').slice(0,8)); if (reniecState!=='idle') setReniecState('idle'); }}/>
              <button type="button" className="quick-reniec-btn" onClick={buscarReniec}
                      disabled={!/^\d{8}$/.test(dni) || reniecState === 'loading'}>
                {reniecState === 'loading' ? '...' : (reniecState === 'ok' ? '✓ RENIEC' : 'RENIEC')}
              </button>
            </div>
            {reniecState === 'ok' && (nombres || apellidos) && (
              <div className="field-hint" style={{color:'var(--success, #15795C)'}}>{`${nombres} ${apellidos}`.trim()}</div>
            )}
          </div>

          {/* Teléfono */}
          <div className="field">
            <label className="field-label">Teléfono / Contacto <span className="req">*</span></label>
            <div className="input-prefix">
              <span className="px"><Icon name="whatsapp" size={13}/></span>
              <input value={telefono} placeholder="999 999 999" inputMode="tel"
                     onChange={(e) => setTelefono(e.target.value)}/>
            </div>
          </div>

          {/* Plazo de vencimiento */}
          <div className="field">
            <label className="field-label">Plazo de vencimiento</label>
            <div className="sep-plazos">
              {PLAZOS_RESERVA.map(p => (
                <button key={p.dias} type="button"
                        className={`sep-plazo${plazo === p.dias ? ' on' : ''}`}
                        onClick={() => setPlazo(p.dias)}>
                  {p.label}{p.sub && <small> · {p.sub}</small>}
                </button>
              ))}
              <div className={`sep-plazo sep-plazo-custom${!PLAZOS_RESERVA.some(p=>p.dias===plazo) ? ' on' : ''}`}>
                <input type="number" min="1" max="180" value={plazo}
                       onChange={(e) => setPlazo(Math.max(1, Math.min(180, +e.target.value || 1)))}/>
                <span>días</span>
              </div>
            </div>
            <div className="field-hint">
              Vence el <b>{_fmtFechaLarga(vence)}</b>
              {esExtendido && <span> · plazo extendido (negociación especial)</span>}
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={guardar}>
            <Icon name="clock" size={13}/> Separar {plazo} días
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pantalla: RESERVAS ─────────────────────────────────────────
const ScreenReservas = ({ onToast, onConvertir }) => {
  const empresaId = window.getSesion?.()?.empresaId;
  const restringido = window.esAsesorRestringido?.();
  const miId = window.getUsuarioId?.();
  const [tab, setTab] = React.useState('activa');
  const [tick, setTick] = React.useState(0);
  const [histOpen, setHistOpen] = React.useState(null);

  // Refresco del contador cada minuto
  React.useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  const reservas = React.useMemo(() => {
    let arr = (window.gatherReservasConEstado?.(empresaId) || [])
      .filter(r => r.tipo !== 'bloqueado'); // los bloqueos no son reservas comerciales
    if (restringido) arr = arr.filter(r => (r.asesorId || '') === miId);
    // Orden: por vencimiento más próximo
    arr.sort((a, b) => new Date(a.fechaVence || a.fecha || 0) - new Date(b.fechaVence || b.fecha || 0));
    return arr;
    // eslint-disable-next-line
  }, [empresaId, tick, restringido, miId]);

  const counts = React.useMemo(() => {
    const c = { activa: 0, vencida: 0, convertida: 0, liberada: 0, todas: reservas.length };
    reservas.forEach(r => { c[r._estado] = (c[r._estado] || 0) + 1; });
    return c;
  }, [reservas]);

  const visibles = tab === 'todas' ? reservas : reservas.filter(r => r._estado === tab);

  const liberar = (r) => {
    if (!window.confirm(`¿Liberar la reserva del lote ${r.loteId}? El lote volverá a estar disponible.`)) return;
    window.liberarReserva?.(r.scope, r.loteId, window.getSesion?.()?.nombre);
    onToast?.(`Reserva del lote ${r.loteId} liberada`);
    setTick(t => t + 1);
  };

  const TABS = [
    ['activa', 'Activas', counts.activa],
    ['vencida', 'Vencidas', counts.vencida],
    ['convertida', 'Convertidas', counts.convertida],
    ['liberada', 'Liberadas', counts.liberada],
    ['todas', 'Todas', counts.todas],
  ];

  return (
    <div className="page" data-screen-label="Reservas" style={{maxWidth:1200}}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Comercial</div>
          <h1 className="page-title">Reservas</h1>
          <div className="page-sub">
            {counts.activa} activa{counts.activa === 1 ? '' : 's'}. Se liberan solas al vencer el plazo.
          </div>
          <div className="pill outline" style={{marginTop:10}}>
            <Icon name={restringido ? 'user' : 'users'} size={13}/>
            {restringido ? 'Ves y gestionas solo tus reservas' : 'Ves y gestionas las reservas de todo el equipo'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="res-tabs">
        {TABS.map(([id, label, n]) => (
          <button key={id} className={`res-tab${tab === id ? ' on' : ''}`} onClick={() => setTab(id)}>
            {label} <span className="res-tab-n">{n || 0}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="empty" style={{marginTop:16}}>No hay reservas {tab === 'todas' ? '' : tab + 's'} por ahora.</div>
      ) : (
        <div className="res-grid">
          {visibles.map(r => {
            const rem = _restante(r.fechaVence);
            const lote = window.loteFromScope?.(r.scope, r.loteId);
            const numero = lote?.numero != null ? lote.numero : (r.loteId.split('-')[1] || '');
            const manzana = lote?.manzana || (r.loteId.split('-')[0] || '');
            const estadoPill = {
              activa: ['Activa', 'res-pill-activa'],
              vencida: ['Vencida', 'res-pill-vencida'],
              convertida: ['Convertida', 'res-pill-convertida'],
              liberada: ['Liberada', 'res-pill-liberada'],
            }[r._estado] || ['—', ''];
            return (
              <div key={r.scope + ':' + r.loteId} className="res-card">
                <div className="res-card-head">
                  <span className="res-lote">Lote {r.loteId}</span>
                  <span className={`res-pill ${estadoPill[1]}`}>{estadoPill[0]}</span>
                </div>
                <div className="res-mz">Mz {manzana} · N° {numero}</div>

                {/* Contador (solo activas / vencidas) */}
                {(r._estado === 'activa' || r._estado === 'vencida') && (
                  <div className={`res-vence${rem.vencido ? ' vencido' : (rem.urgente ? ' urgente' : '')}`}>
                    <span><Icon name="clock" size={14}/> {rem.vencido ? 'Venció' : 'Vence en'}</span>
                    <b>{rem.txt}</b>
                  </div>
                )}
                {r._estado === 'convertida' && (
                  <div className="res-vence convertida-row">
                    <span><Icon name="check" size={14}/> Convertida en venta</span>
                    {r.ventaCode && <b className="mono">{r.ventaCode}</b>}
                  </div>
                )}

                <div className="res-kv"><span>Cliente</span><div style={{textAlign:'right'}}><b>{r.dni || '—'}</b><div className="muted text-xs">{r.telefono || ''}</div></div></div>
                <div className="res-kv"><span>Asesor</span><b>{r.asesorNombre || '—'}</b></div>
                <div className="res-kv"><span>Precio lista</span><b className="mono">{_fmtSoles(r.precioLista || lote?.precio || 0)}</b></div>

                <button className="res-hist-link" onClick={() => setHistOpen(r)}>
                  <Icon name="clock" size={12}/> Ver historial ({(r.historial || []).length})
                </button>

                {/* Acciones según estado */}
                <div className="res-actions">
                  {r._estado === 'activa' && (<>
                    <button className="btn primary block" onClick={() => onConvertir?.(r)}>
                      <Icon name="tag" size={14}/> Convertir
                    </button>
                    <button className="icon-btn" title="Ver historial" onClick={() => setHistOpen(r)}><Icon name="clock" size={14}/></button>
                    <button className="icon-btn" title="Liberar reserva" onClick={() => liberar(r)}><Icon name="refresh" size={14}/></button>
                  </>)}
                  {r._estado === 'vencida' && (<>
                    <button className="btn block" onClick={() => onConvertir?.(r)}>
                      <Icon name="refresh" size={14}/> Re-separar / Convertir
                    </button>
                    <button className="icon-btn" title="Liberar definitivamente" onClick={() => liberar(r)}><Icon name="x" size={14}/></button>
                  </>)}
                  {(r._estado === 'convertida' || r._estado === 'liberada') && (
                    <button className="btn ghost block" onClick={() => setHistOpen(r)}>
                      <Icon name="clock" size={14}/> Ver historial
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal historial */}
      {histOpen && (
        <div className="modal-bg" onClick={() => setHistOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:460}}>
            <div className="card-head">
              <div className="card-title hstack gap-8"><Icon name="clock" size={16}/> Historial · Lote {histOpen.loteId}</div>
              <button className="icon-btn" onClick={() => setHistOpen(null)}><Icon name="x" size={14}/></button>
            </div>
            <div className="card-pad vstack gap-10">
              {(histOpen.historial || []).length === 0 && <div className="muted text-sm">Sin movimientos registrados.</div>}
              {(histOpen.historial || []).slice().reverse().map((h, i) => (
                <div key={i} className="res-hist-row">
                  <div className="res-hist-dot"/>
                  <div className="flex1">
                    <div className="strong text-sm" style={{textTransform:'capitalize'}}>{h.accion}</div>
                    {h.detalle && <div className="muted text-xs">{h.detalle}</div>}
                    <div className="muted text-xs">{new Date(h.fecha).toLocaleString('es-PE', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})} · {h.por || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { SepararLoteModal, ScreenReservas, PLAZOS_RESERVA });
