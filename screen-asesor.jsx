// screen-asesor.jsx — Vista de inicio para el rol Asesor.
// Se muestra en lugar del Dashboard corporativo cuando el usuario en sesión
// es un Asesor restringido: solo SU cartera + su posición en el ranking del
// equipo (comparativa), el resto de la operación corporativa queda oculto.

const COMISION_RATE = 0.03; // 3% estimado sobre precio de venta

const ScreenAsesorHome = ({ onNew, onOpenContract, onGoto }) => {
  const ses = window.getSesion?.() || {};
  const empresaId = ses.empresaId;
  const myId = window.getUsuarioId?.();
  const nombre = ses.nombre || 'Asesor';
  const primerNombre = nombre.split(' ')[0];

  // Mis filas de contrato (getContratosRows ya viene acotado a MIS ventas).
  const misRows = (window.getContratosRows && window.getContratosRows()) || [];
  const misCuotas = (window.deriveCuotasFromReservas && window.deriveCuotasFromReservas()) || [];

  // Periodo más reciente con datos → "este mes".
  const _mesDe = (f) => (f || '').slice(0, 7); // YYYY-MM
  const meses = Array.from(new Set(misRows.map(r => _mesDe(r.fecha)).filter(Boolean))).sort();
  const mesActual = meses[meses.length - 1] || '';
  const _mesLabel = (ym) => {
    if (!ym) return '—';
    const [y, m] = ym.split('-');
    const nm = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][(+m) - 1] || '';
    return `${nm} ${y}`;
  };

  const rowsMes = misRows.filter(r => _mesDe(r.fecha) === mesActual);
  const ventasMesN = rowsMes.length;
  const montoMes = rowsMes.reduce((s, r) => s + (+r.precio || 0), 0);

  // Cartera acumulada (todas mis ventas).
  const carteraN = misRows.length;
  const carteraMonto = misRows.reduce((s, r) => s + (+r.precio || 0), 0);
  const porFirmar = misRows.filter(r => r.status === 'por-firmar');
  const comisionEst = misRows.reduce((s, r) => s + (+r.precio || 0), 0) * COMISION_RATE;

  // Meta personal (editable, por usuario). Guardada en localStorage.
  const METAKEY = `mattika.asesor.meta.${myId || 'me'}`;
  const [metaMonto, setMetaMonto] = React.useState(() => {
    try { const v = +localStorage.getItem(METAKEY); if (v > 0) return v; } catch (e) {}
    return 300000;
  });
  const [editMeta, setEditMeta] = React.useState(false);
  const guardarMeta = (v) => {
    const n = Math.max(0, parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0);
    setMetaMonto(n);
    try { localStorage.setItem(METAKEY, String(n)); } catch (e) {}
  };
  const metaPct = metaMonto > 0 ? Math.min(100, Math.round((montoMes / metaMonto) * 100)) : 0;
  const metaFalta = Math.max(0, metaMonto - montoMes);

  // Ranking del equipo (todas las ventas de la empresa, sin acotar) por monto.
  const todas = (window.loadVentas && window.loadVentas(empresaId)) || [];
  const byAsesor = {};
  todas.forEach(v => {
    const id = (v.meta && v.meta.asesorId) || ('n:' + ((v.meta && v.meta.asesorNombre) || 'Equipo'));
    const nom = (v.meta && v.meta.asesorNombre) || 'Equipo comercial';
    if (!byAsesor[id]) byAsesor[id] = { id, nom, n: 0, monto: 0 };
    byAsesor[id].n += 1;
    byAsesor[id].monto += (+(v.terminos && v.terminos.precio) || 0);
  });
  const ranking = Object.values(byAsesor).sort((a, b) => b.monto - a.monto);
  const miIdx = ranking.findIndex(r => r.id === myId);
  const miPos = miIdx >= 0 ? miIdx + 1 : null;
  const totalEquipo = ranking.length;
  const lider = ranking[0];
  const rankMax = Math.max(1, ...ranking.map(r => r.monto));
  // Vecindario del ranking (yo ± 1) para no listar a todo el equipo.
  const vecinos = miIdx >= 0
    ? ranking.slice(Math.max(0, miIdx - 1), miIdx + 2)
    : ranking.slice(0, 3);

  const fmtK = (n) => n >= 1000 ? Math.round(n / 1000) + 'K' : String(Math.round(n || 0));
  const iniciales = (s) => (s || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="page" data-screen-label="Inicio asesor">
      <div className="page-head">
        <div>
          <div className="eyebrow">Mi panel · {ses.rol || 'Asesor'}</div>
          <h1 className="page-title">Hola, {primerNombre}</h1>
          <div className="page-sub">
            Tu cartera tiene <b style={{color:'var(--ink)'}}>{carteraN} ventas</b>
            {porFirmar.length > 0 && <> y <b style={{color:'var(--warning)', cursor:'pointer'}} onClick={() => onGoto('contracts', {status:'por-firmar'})}>{porFirmar.length} por firmar</b></>}.
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={() => onGoto('plano')}>
            <Icon name="mapPin" size={14}/> Ver plano
          </button>
          <button className="btn primary" onClick={onNew}>
            <Icon name="plus" size={15}/> Registrar venta
          </button>
        </div>
      </div>

      {/* Mis métricas */}
      <div className="field-group cols-4 mb-24">
        <div className="metric">
          <div className="metric-label"><Icon name="chart" size={13}/> Mis ventas · {_mesLabel(mesActual)}</div>
          <div className="metric-value">{ventasMesN}</div>
          <div className="metric-delta"><Icon name="money" size={12}/> S/ {fmtK(montoMes)} vendido</div>
        </div>
        <div className="metric">
          <div className="metric-label"><Icon name="layers" size={13}/> Cartera acumulada</div>
          <div className="metric-value">{carteraN}</div>
          <div className="metric-delta">S/ {fmtK(carteraMonto)} en total</div>
        </div>
        <div className="metric" style={{cursor:'default'}}>
          <div className="metric-label"><Icon name="money" size={13}/> Comisión estimada</div>
          <div className="metric-value"><span className="cur">S/</span>{fmtK(comisionEst)}</div>
          <div className="metric-delta">≈ {Math.round(COMISION_RATE*100)}% sobre lo vendido</div>
        </div>
        <div className="metric" onClick={() => onGoto('contracts', {status:'por-firmar'})} style={{cursor:'pointer'}}>
          <div className="metric-label"><Icon name="clock" size={13}/> Por firmar
            <span className="metric-link">Ver lista <Icon name="arrowR" size={10}/></span>
          </div>
          <div className="metric-value">{porFirmar.length}</div>
          <div className="metric-delta">contratos pendientes de firma</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20, alignItems:'start'}}>
        {/* Mi meta del mes */}
        <div className="card card-pad">
          <div className="hstack between" style={{marginBottom:14}}>
            <div>
              <div className="card-title">Mi meta de {_mesLabel(mesActual)}</div>
              <div className="card-sub">Avance de lo vendido este mes vs. tu objetivo</div>
            </div>
            {!editMeta ? (
              <button className="btn sm ghost" onClick={() => setEditMeta(true)}>
                <Icon name="edit" size={12}/> Ajustar meta
              </button>
            ) : (
              <button className="btn sm" onClick={() => setEditMeta(false)}>Listo</button>
            )}
          </div>

          <div className="hstack between" style={{alignItems:'baseline', marginBottom:8}}>
            <div className="num" style={{fontSize:26, fontWeight:700, letterSpacing:'-.02em'}}>
              <span className="cur">S/</span> {fmtInt(montoMes)}
            </div>
            <div className="hstack gap-6" style={{alignItems:'baseline'}}>
              <span className="muted text-sm">meta</span>
              {editMeta ? (
                <div className="input-prefix" style={{width:150}}>
                  <span className="px">S/</span>
                  <input type="text" inputMode="numeric" defaultValue={metaMonto}
                         onChange={(e) => guardarMeta(e.target.value)} autoFocus/>
                </div>
              ) : (
                <span className="num strong" style={{fontSize:16}}>S/ {fmtInt(metaMonto)}</span>
              )}
            </div>
          </div>

          <div style={{height:12, borderRadius:999, background:'var(--bg-sunken)', overflow:'hidden'}}>
            <div style={{width:`${metaPct}%`, height:'100%', borderRadius:999,
                         background: metaPct >= 100 ? 'var(--success)' : 'var(--brand)', transition:'width .3s'}}/>
          </div>
          <div className="hstack between mt-8">
            <span className="text-sm" style={{fontWeight:600, color: metaPct >= 100 ? 'var(--success)' : 'var(--muted)'}}>
              {metaPct >= 100 ? '¡Meta cumplida! 🎉' : `Te faltan S/ ${fmtInt(metaFalta)}`}
            </span>
            <span className="num strong" style={{color: metaPct >= 100 ? 'var(--success)' : 'var(--brand)'}}>{metaPct}%</span>
          </div>

          {/* Accesos rápidos */}
          <div className="asesor-quick mt-24">
            <button className="asesor-quick-btn" onClick={onNew}>
              <span className="asesor-quick-ic"><Icon name="doc" size={18}/></span>
              <span><b>Registrar venta</b><em>Generar contrato nuevo</em></span>
            </button>
            <button className="asesor-quick-btn" onClick={() => onGoto('plano')}>
              <span className="asesor-quick-ic"><Icon name="mapPin" size={18}/></span>
              <span><b>Apartar un lote</b><em>Separar desde el plano</em></span>
            </button>
            <button className="asesor-quick-btn" onClick={() => onGoto('clients')}>
              <span className="asesor-quick-ic"><Icon name="users" size={18}/></span>
              <span><b>Nuevo cliente</b><em>Registrar un prospecto</em></span>
            </button>
            <button className="asesor-quick-btn" onClick={() => onGoto('pagos')}>
              <span className="asesor-quick-ic"><Icon name="money" size={18}/></span>
              <span><b>Cuotas de mis clientes</b><em>Ver estado de pagos</em></span>
            </button>
          </div>
        </div>

        {/* Mi posición en el equipo */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Mi posición en el equipo</div>
          </div>
          <div className="asesor-rankbanner">
            <div className="asesor-rankpos">
              <span className="asesor-rankpos-n">{miPos ? `#${miPos}` : '—'}</span>
              <span className="asesor-rankpos-of">de {totalEquipo}</span>
            </div>
            <div className="flex1">
              <div className="text-sm" style={{fontWeight:600, color:'var(--ink)'}}>
                {miPos === 1 ? 'Lideras el ranking del equipo 🏆'
                  : lider ? `${lider.nom} lidera con S/ ${fmtK(lider.monto)}` : 'Sin datos de equipo'}
              </div>
              <div className="muted text-xs mt-4">Ordenado por monto vendido</div>
            </div>
          </div>
          <div style={{padding:'4px 0 8px'}}>
            {vecinos.map((r) => {
              const pos = ranking.indexOf(r) + 1;
              const mine = r.id === myId;
              const pct = Math.round((r.monto / rankMax) * 100);
              return (
                <div key={r.id} style={{padding:'10px 20px', background: mine ? 'var(--brand-50)' : 'transparent',
                                         borderLeft: mine ? '3px solid var(--brand)' : '3px solid transparent'}}>
                  <div className="hstack between">
                    <div className="hstack gap-8">
                      <span className="num muted" style={{width:22, fontWeight:700}}>#{pos}</span>
                      <div className="avatar sm">{iniciales(r.nom)}</div>
                      <div style={{fontSize:13, fontWeight: mine ? 700 : 500}}>{mine ? 'Tú' : r.nom}</div>
                    </div>
                    <div className="num strong" style={{fontSize:12.5}}>S/ {fmtK(r.monto)}</div>
                  </div>
                  <div style={{marginTop:6, height:4, borderRadius:999, background:'var(--bg-sunken)', overflow:'hidden'}}>
                    <div style={{width:`${pct}%`, height:'100%', background: mine ? 'var(--brand)' : 'var(--muted-2)'}}/>
                  </div>
                  <div className="hstack between mt-4">
                    <span className="muted text-xs">{r.n} ventas</span>
                    <span className="muted text-xs mono">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mis contratos por firmar */}
      {porFirmar.length > 0 && (
        <div className="card mt-24">
          <div className="card-head">
            <div>
              <div className="card-title">Mis contratos por firmar</div>
              <div className="card-sub">Cierra estas operaciones para sumar a tu meta</div>
            </div>
            <button className="btn sm ghost" onClick={() => onGoto('contracts', {status:'por-firmar'})}>
              Ver todos <Icon name="arrowR" size={12}/>
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Código</th><th>Cliente</th><th className="right">Precio S/</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {porFirmar.slice(0, 6).map((c) => (
                <tr key={c.id} onClick={() => onOpenContract(c)}>
                  <td className="num">{c.code}</td>
                  <td>
                    <div className="strong" style={{fontSize:13.5}}>{c.cliente}</div>
                    <div className="muted text-xs">{c.proyecto} · {c.unidad}</div>
                  </td>
                  <td className="num right strong">{fmtSoles(c.precio)}</td>
                  <td><StatusPill status={c.status}/></td>
                  <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ScreenAsesorHome });
