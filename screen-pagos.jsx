// screen-pagos.jsx — Pantalla de pagos y cuotas
// Muestra TODAS las cuotas (vencidas, próximas, pagadas) de TODOS los
// contratos del sistema.  Permite registrar pagos desde aquí.

// ─── Mock data: cuotas de los contratos ──────────────────────────
const CUOTAS_MOCK = [
  // VENCIDAS — están en rojo en el dashboard
  { id:'q1',  code:'MTK-2026-0182', cliente:'Lucía Ramos Velarde',     dni:'47225910', n:1, vence:'2026-05-20', monto:2426.67, estado:'vencida',  diasMora:4 },
  { id:'q2',  code:'MTK-2026-0179', cliente:'Renzo Tapia Ferrer',      dni:'41005781', n:2, vence:'2026-05-15', monto:4533.33, estado:'vencida',  diasMora:9 },

  // PRÓXIMAS — vencen en los próximos días
  { id:'q3',  code:'MTK-2026-0182', cliente:'Lucía Ramos Velarde',     dni:'47225910', n:2, vence:'2026-05-27', monto:2426.67, estado:'pendiente', diasMora:0 },
  { id:'q4',  code:'MTK-2026-0181', cliente:'Andrea Jiménez Soto',     dni:'42118094', n:1, vence:'2026-05-29', monto:1500.00, estado:'pendiente', diasMora:0 },
  { id:'q5',  code:'MTK-2026-0184', cliente:'Rosmery Valderrama T.',   dni:'46049117', n:1, vence:'2026-05-31', monto:2000.00, estado:'pendiente', diasMora:0 },
  { id:'q6',  code:'MTK-2026-0184', cliente:'Rosmery Valderrama T.',   dni:'46049117', n:2, vence:'2026-06-30', monto:2000.00, estado:'pendiente', diasMora:0 },
  { id:'q7',  code:'MTK-2026-0184', cliente:'Rosmery Valderrama T.',   dni:'46049117', n:3, vence:'2026-07-31', monto:9600.00, estado:'pendiente', diasMora:0 },
  { id:'q8',  code:'MTK-2026-0179', cliente:'Renzo Tapia Ferrer',      dni:'41005781', n:3, vence:'2026-06-15', monto:4533.34, estado:'pendiente', diasMora:0 },
  { id:'q9',  code:'MTK-2026-0181', cliente:'Andrea Jiménez Soto',     dni:'42118094', n:2, vence:'2026-06-29', monto:1500.00, estado:'pendiente', diasMora:0 },

  // PAGADAS — historial reciente
  { id:'q10', code:'MTK-2026-0179', cliente:'Renzo Tapia Ferrer',      dni:'41005781', n:1, vence:'2026-04-15', monto:4533.33, estado:'pagada',   pagadoEl:'2026-04-14', operacion:'31715926', metodo:'Depósito BCP' },
  { id:'q11', code:'MTK-2026-0182', cliente:'Lucía Ramos Velarde',     dni:'47225910', n:0, vence:'2026-04-22', monto:3640.00, estado:'pagada',   pagadoEl:'2026-04-22', operacion:'05976617', metodo:'Depósito BCP' },
  { id:'q12', code:'MTK-2026-0181', cliente:'Andrea Jiménez Soto',     dni:'42118094', n:0, vence:'2026-04-30', monto:4500.00, estado:'pagada',   pagadoEl:'2026-05-02', operacion:'77103342', metodo:'Transferencia' },
];

const FILTER_OPTS = [
  { id:'todas',     label:'Todas',     icon:'doc' },
  { id:'vencida',   label:'Vencidas',  icon:'alert',  count:(c) => c.estado==='vencida' },
  { id:'pendiente', label:'Próximas',  icon:'clock',  count:(c) => c.estado==='pendiente' },
  { id:'pagada',    label:'Pagadas',   icon:'check',  count:(c) => c.estado==='pagada' },
];

const ScreenPagos = ({ initialFilter, onToast }) => {
  const puedeRegistrar = window.can?.('registrar_pagos') ?? false;
  const empresaId = window.getSesion?.()?.empresaId;

  // Cuotas = cronograma derivado de las VENTAS reales + (para la empresa demo)
  // el set de ejemplo de Nápoles. El estado de pago se persiste por empresa.
  const build = React.useCallback(() => {
    const pe = window.loadPagoEstado?.(empresaId) || {};
    const real = window.deriveCuotasFromReservas?.(empresaId) || [];
    const demo = (empresaId === 'lumina' && !window.esAsesorRestringido?.() ? CUOTAS_MOCK : []).map(c =>
      pe[c.id]
        ? { ...c, estado: 'pagada', pagadoEl: pe[c.id].fecha, operacion: pe[c.id].operacion, metodo: pe[c.id].metodo }
        : c
    );
    return [...real, ...demo];
  }, [empresaId]);

  const [cuotas, setCuotas] = React.useState(build);
  const [filter, setFilter] = React.useState(initialFilter || 'todas');
  const [q, setQ] = React.useState('');
  const [regCuota, setRegCuota] = React.useState(null); // cuota a registrar pago

  React.useEffect(() => {
    const refresh = () => setCuotas(build());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [build]);

  const filtered = cuotas.filter(c => {
    if (filter !== 'todas' && c.estado !== filter) return false;
    if (q && !`${c.cliente} ${c.code} ${c.dni}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  // Totales por estado
  const totals = {
    vencida:   cuotas.filter(c => c.estado === 'vencida').reduce((s,c) => s + c.monto, 0),
    pendiente: cuotas.filter(c => c.estado === 'pendiente').reduce((s,c) => s + c.monto, 0),
    pagada:    cuotas.filter(c => c.estado === 'pagada').reduce((s,c) => s + c.monto, 0),
  };

  const countOf = (id) => {
    const opt = FILTER_OPTS.find(o => o.id === id);
    if (!opt || !opt.count) return null;
    return cuotas.filter(opt.count).length;
  };

  const registrarPago = (cuota, datos) => {
    const pe = window.loadPagoEstado?.(empresaId) || {};
    pe[cuota.id] = { fecha: datos.fecha, operacion: datos.operacion, metodo: datos.metodo, monto: datos.monto };
    window.savePagoEstado?.(empresaId, pe);
    setCuotas(build());
    setRegCuota(null);
    onToast(`✓ Pago registrado: ${cuota.cliente} · S/ ${fmtSoles(cuota.monto)}`);
  };

  return (
    <div className="page" data-screen-label="Pagos y cuotas">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pagos y cuotas</h1>
          <div className="page-sub">
            Cronograma consolidado de todos los contratos.
            <span style={{marginLeft:8, color:'var(--danger)', fontWeight:500}}>
              {cuotas.filter(c=>c.estado==='vencida').length} vencidas — S/ {fmtSoles(totals.vencida)} pendiente
            </span>
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={() => window.descargarCSV?.(
            `pagos-${new Date().toISOString().slice(0,10)}`,
            ['Código','Cliente','DNI','Cuota N°','Vence','Monto S/','Estado','Días mora','Lote','Proyecto'],
            cuotas.map(c => [c.code, c.cliente, c.dni, c.n, c.vence, c.monto, c.estado, c.diasMora || 0, c.loteId, c.proyecto])
          )}><Icon name="download" size={14}/> Exportar</button>
          {puedeRegistrar && (
            <button className="btn primary" onClick={() => { 
              const venc = cuotas.find(c => c.estado === 'vencida');
              if (venc) setRegCuota(venc);
              else onToast('No hay cuotas vencidas por registrar');
            }}>
              <Icon name="plus" size={14}/> Registrar pago
            </button>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="field-group cols-3 mb-16">
        <div className="metric metric-pago" data-tone="danger">
          <div className="metric-label"><Icon name="alert" size={13}/> Vencidas</div>
          <div className="metric-value">{cuotas.filter(c=>c.estado==='vencida').length}</div>
          <div className="metric-delta neg">S/ {fmtSoles(totals.vencida)}</div>
        </div>
        <div className="metric metric-pago" data-tone="warn">
          <div className="metric-label"><Icon name="clock" size={13}/> Próximas</div>
          <div className="metric-value">{cuotas.filter(c=>c.estado==='pendiente').length}</div>
          <div className="metric-delta">S/ {fmtSoles(totals.pendiente)} por cobrar</div>
        </div>
        <div className="metric metric-pago" data-tone="success">
          <div className="metric-label"><Icon name="checkCircle" size={13}/> Cobradas (mes)</div>
          <div className="metric-value">{cuotas.filter(c=>c.estado==='pagada').length}</div>
          <div className="metric-delta">S/ {fmtSoles(totals.pagada)} ingresados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card card-pad mb-16" style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', padding:'12px 16px'}}>
        <div className="search" style={{margin:0, flex:'1 1 280px'}}>
          <Icon name="search" size={14}/>
          <input placeholder="Buscar por cliente, código o DNI..." value={q} onChange={(e)=>setQ(e.target.value)}/>
        </div>
        <div className="hstack gap-6">
          {FILTER_OPTS.map(o => {
            const c = countOf(o.id);
            return (
              <button key={o.id}
                      className={`filter-chip ${filter===o.id ? 'active' : ''}`}
                      onClick={() => setFilter(o.id)}>
                <Icon name={o.icon} size={12}/>
                <span>{o.label}</span>
                {c !== null && <span className="filter-chip-count">{c}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:140}}>Contrato</th>
              <th>Cliente</th>
              <th className="center" style={{width:80}}>Cuota</th>
              <th style={{width:130}}>Vence</th>
              <th className="right" style={{width:140}}>Monto S/</th>
              <th>Estado</th>
              <th style={{width:170}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="num">{c.code}</td>
                <td>
                  <div className="strong">{c.cliente}</div>
                  <div className="muted text-xs mono">DNI {c.dni}</div>
                </td>
                <td className="center mono strong">{c.n === 0 ? 'INI' : String(c.n).padStart(2,'0')}</td>
                <td>
                  <div className="text-sm">{fmtDate(c.vence)}</div>
                  {c.estado === 'vencida' && (
                    <div className="text-xs" style={{color:'var(--danger)', fontWeight:600}}>
                      hace {c.diasMora} días
                    </div>
                  )}
                  {c.estado === 'pagada' && c.pagadoEl && (
                    <div className="muted text-xs">pagada {fmtDate(c.pagadoEl)}</div>
                  )}
                </td>
                <td className="num right strong">{fmtSoles(c.monto)}</td>
                <td><StatusPill status={
                  c.estado === 'vencida' ? 'vencido' :
                  c.estado === 'pagada' ? 'pagado' : 'pendiente'
                }/></td>
                <td>
                  {c.estado !== 'pagada' ? (
                    puedeRegistrar ? (
                      <button className="btn sm primary" onClick={() => setRegCuota(c)}>
                        <Icon name="check" size={12}/> Registrar pago
                      </button>
                    ) : (
                      <span className="muted text-xs hstack gap-6" title="No tienes permiso para registrar pagos">
                        <Icon name="eye" size={12}/> Solo lectura
                      </span>
                    )
                  ) : (
                    <div className="hstack gap-6">
                      <Icon name="receipt" size={13} style={{color:'var(--success)'}}/>
                      <span className="muted text-xs mono">{c.operacion}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{padding:36, textAlign:'center', color:'var(--muted)'}}>
                Sin cuotas para el filtro aplicado.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: registrar pago */}
      {regCuota && (
        <RegistrarPagoModal cuota={regCuota}
                             onClose={() => setRegCuota(null)}
                             onSave={(datos) => registrarPago(regCuota, datos)}/>
      )}
    </div>
  );
};

// ─── Modal: Registrar pago ───────────────────────────────────────
const RegistrarPagoModal = ({ cuota, onClose, onSave }) => {
  const [fecha, setFecha] = React.useState(new Date().toISOString().slice(0,10));
  const [monto, setMonto] = React.useState(cuota.monto);
  const [metodo, setMetodo] = React.useState('Depósito BCP');
  const [operacion, setOperacion] = React.useState('');
  const [voucher, setVoucher] = React.useState(null);

  const handleSubmit = () => {
    if (!operacion.trim()) {
      alert('Ingresa el N° de operación o voucher.');
      return;
    }
    onSave({ fecha, monto, metodo, operacion, voucher });
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:'min(560px, calc(100vw - 32px))'}} onClick={(e)=>e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8">
            <Icon name="check" size={16}/> Registrar pago
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Resumen de la cuota */}
        <div style={{padding:'14px 18px', background:'var(--bg-sunken)', borderBottom:'1px solid var(--border)'}}>
          <div className="hstack between">
            <div>
              <div className="strong">{cuota.cliente}</div>
              <div className="muted text-xs mono">{cuota.code} · Cuota {cuota.n === 0 ? 'inicial' : String(cuota.n).padStart(2,'0')}</div>
            </div>
            <div className="right">
              <div className="muted text-xs">Monto a registrar</div>
              <div className="serif" style={{fontSize:22, fontWeight:500, color:'var(--ink)'}}>S/ {fmtSoles(cuota.monto)}</div>
            </div>
          </div>
          {cuota.estado === 'vencida' && (
            <div className="mt-8" style={{padding:'8px 12px', background:'var(--danger-bg)', borderRadius:6, fontSize:12.5, color:'var(--danger)'}}>
              <Icon name="alert" size={12} style={{verticalAlign:-1, marginRight:4}}/>
              Cuota vencida hace <b>{cuota.diasMora} días</b> — corresponde aplicar penalidad de mora.
            </div>
          )}
        </div>

        <div className="card-pad vstack gap-12">
          <div className="field-group cols-2">
            <div className="field">
              <label className="field-label">Fecha de pago</label>
              <input className="input" type="date" value={fecha} onChange={(e)=>setFecha(e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label">Monto pagado</label>
              <div className="input-prefix">
                <span className="px">S/</span>
                <input type="number" value={monto} onChange={(e)=>setMonto(+e.target.value)} step="0.01"/>
              </div>
              {Math.abs(monto - cuota.monto) > 0.01 && (
                <div className="field-hint" style={{color: monto > cuota.monto ? 'var(--success)' : 'var(--warning)'}}>
                  {monto > cuota.monto
                    ? `+S/ ${fmtSoles(monto - cuota.monto)} a favor (saldo)`
                    : `Diferencia: S/ ${fmtSoles(cuota.monto - monto)} pendiente`}
                </div>
              )}
            </div>
            <div className="field">
              <label className="field-label">Método de pago</label>
              <select className="select" value={metodo} onChange={(e)=>setMetodo(e.target.value)}>
                <option>Depósito BCP</option>
                <option>Depósito BBVA</option>
                <option>Depósito Interbank</option>
                <option>Transferencia</option>
                <option>Yape / Plin</option>
                <option>Efectivo</option>
                <option>Otro</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">N° de operación / voucher <span className="req">*</span></label>
              <input className="input mono" placeholder="Ej. 31715926" value={operacion} onChange={(e)=>setOperacion(e.target.value)}/>
            </div>
            <div className="field" style={{gridColumn:'1 / -1'}}>
              <label className="field-label">Comprobante (opcional)</label>
              <div className="file-drop" onClick={() => alert('Subida de archivos — demo')}>
                <Icon name="upload" size={16}/>
                <span>{voucher ? voucher : 'Adjuntar foto del voucher o transferencia'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={handleSubmit}>
            <Icon name="check" size={13}/> Registrar pago
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenPagos, RegistrarPagoModal });
