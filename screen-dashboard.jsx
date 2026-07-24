// screen-dashboard.jsx — Vista principal con métricas y atajos

const ScreenDashboard = ({ onNew, onOpenContract, onGoto }) => {
  // Todas las cifras derivan de las VENTAS reales importadas.
  const _rows = (window.getContratosRows && window.getContratosRows()) || [];
  const _cuotas = (window.deriveCuotasFromReservas && window.deriveCuotasFromReservas()) || [];
  const nombreSesion = ((window.getSesion?.()?.nombre || '').split(' ')[0]) || 'equipo';
  const mContratos = _rows.length;
  const mPorFirmar = _rows.filter(c => c.status === 'por-firmar').length;
  const mMonto = _rows.reduce((s, c) => s + (+c.precio || 0), 0);
  const _vencidas = _cuotas.filter(c => c.estado === 'vencida');
  const mVencidas = _vencidas.length;
  const mVencidoMonto = _vencidas.reduce((s, c) => s + (+c.monto || 0), 0);
  // Recaudo total (iniciales de todas las ventas)
  const mRecaudo = _rows.reduce((s, c) => s + (+(c._venta?.terminos?.inicial) || 0), 0);
  // Próximas cuotas reales (pendientes, más cercanas a vencer).
  const _hoy = Date.now();
  const _proximas = _cuotas
    .filter(c => c.estado === 'pendiente')
    .sort((a, b) => new Date(a.vence) - new Date(b.vence))
    .slice(0, 4)
    .map(c => ({ nom: c.cliente, code: c.code, monto: c.monto,
      dias: Math.max(0, Math.round((new Date(c.vence) - _hoy) / 86400000)) }));
  // Ranking real de ejecutivos por monto contratado.
  const _byAsesor = {};
  _rows.forEach(r => {
    const n = r.asesor || 'Equipo comercial';
    if (!_byAsesor[n]) _byAsesor[n] = { n, m: 0, v: 0 };
    _byAsesor[n].m += 1; _byAsesor[n].v += (+r.precio || 0);
  });
  const _asesores = Object.values(_byAsesor).sort((a, b) => b.v - a.v).slice(0, 5);
  const _asesorMax = Math.max(1, ..._asesores.map(a => a.v));
  // Formato compacto en miles (S/ 514K) para no desbordar las tarjetas.
  const fmtIntK = (n) => n >= 1000 ? Math.round(n/1000) + 'K' : String(Math.round(n||0));
  const docTypes = (window.docTypesForPack?.(window.loadTemplate?.()) || window.DOC_TYPES || []);
  const sparkA = [12,15,11,18,22,17,24,28,26,32,30,34];
  const sparkB = [8,10,9,11,12,11,14,13,15,14,16,18];
  const sparkC = [4,3,5,4,2,3,2,1,3,2,1,2];
  const sparkD = [22,28,24,30,34,32,36,38,42,40,44,48];

  return (
    <div className="page" data-screen-label="Dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">Buenas tardes, {nombreSesion}</h1>
          <div className="page-sub">Tienes <b style={{color:'var(--ink)', cursor:'pointer'}} onClick={() => onGoto('contracts', {status:'por-firmar'})}>{mPorFirmar} contratos por firmar</b> y <b style={{color:'var(--warning)', cursor:'pointer'}} onClick={() => onGoto('pagos', {filter:'vencida'})}>{mVencidas} cuotas vencidas</b>.</div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={() => onGoto('comercial')}>
            <Icon name="chart" size={14}/> Análisis comercial
          </button>
          <button className="btn primary" onClick={onNew}>
            <Icon name="plus" size={15}/> Nuevo documento
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="field-group cols-4 mb-24">
        <div className="metric" onClick={() => onGoto('contracts')} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="doc" size={13}/> Contratos del mes
          </div>
          <div className="metric-value">{mContratos}</div>
          <div className="metric-delta"><Icon name="trendUp" size={12}/> Histórico total</div>
          <div className="metric-spark"><Sparkline data={sparkA} color="var(--brand)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('contracts', {status:'por-firmar'})} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="clock" size={13}/> Por firmar
            <span className="metric-link">Ver lista <Icon name="arrowR" size={10}/></span>
          </div>
          <div className="metric-value">{mPorFirmar}</div>
          <div className="metric-delta neg"><Icon name="clock" size={12}/> Pendientes de firma</div>
          <div className="metric-spark"><Sparkline data={sparkB} color="var(--warning)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('pagos')} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="money" size={13}/> Monto contratado
          </div>
          <div className="metric-value"><span className="cur">S/</span>{fmtIntK(mMonto)}</div>
          <div className="metric-delta"><Icon name="trendUp" size={12}/> Recaudo S/ {fmtIntK(mRecaudo)}</div>
          <div className="metric-spark"><Sparkline data={sparkD} color="var(--success)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('pagos', {filter:'vencida'})} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="alert" size={13}/> Cuotas vencidas
            <span className="metric-link">Registrar pago <Icon name="arrowR" size={10}/></span>
          </div>
          <div className="metric-value">{mVencidas}</div>
          <div className="metric-delta neg"><Icon name="trendDown" size={12}/> S/ {fmtIntK(mVencidoMonto)} vencido</div>
          <div className="metric-spark"><Sparkline data={sparkC} color="var(--danger)"/></div>
        </div>
      </div>

      {/* Quick action — una sola venta = 5 documentos */}
      <div className="cta-venta" onClick={() => onNew()}>
        <div className="cta-ic"><Icon name="layers" size={26}/></div>
        <div className="flex1">
          <div className="cta-title">Generar nueva venta</div>
          <div className="cta-desc">Una sola venta genera automáticamente los <b>{docTypes.length} documentos</b> del modelo de tu empresa, listos para firma.</div>
          <div className="cta-docs">
            {docTypes.map((d, i) => (
              <span key={d.id} className="cta-doc">
                <span className="cta-doc-n">{String(i+1).padStart(2,'0')}</span>
                {d.label}
              </span>
            ))}
          </div>
        </div>
        <button className="btn primary lg" onClick={onNew}>
          <Icon name="plus" size={15}/> Iniciar venta
        </button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap: 20}}>
        {/* Recent contracts */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Contratos recientes</div>
              <div className="card-sub">Actividad de los últimos 7 días</div>
            </div>
            <button className="btn sm ghost" onClick={() => onGoto('contracts')}>
              Ver todos <Icon name="arrowR" size={12}/>
            </button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th className="right">Precio S/</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {((window.getContratosRows && window.getContratosRows()) || CONTRATOS_RECIENTES).slice(0,6).map((c) => (
                <tr key={c.id} onClick={() => onOpenContract(c)}>
                  <td className="num">{c.code}</td>
                  <td>
                    <div className="strong" style={{fontSize:13.5}}>{c.cliente}</div>
                    <div className="muted text-xs">{c.proyecto} · {c.unidad}</div>
                  </td>
                  <td><DocTypeBadge type={c.tipo}/></td>
                  <td className="num right strong">{fmtSoles(c.precio)}</td>
                  <td><StatusPill status={c.status}/></td>
                  <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel: cuotas próximas + asesores top */}
        <div className="vstack gap-16">
          <div className="card">
            <div className="card-head">
              <div className="card-title">Próximas cuotas</div>
            </div>
            <div style={{padding: '4px 0'}}>
              {_proximas.length === 0 && (
                <div className="muted text-sm" style={{padding:'16px 20px'}}>Sin cuotas próximas.</div>
              )}
              {_proximas.map((c, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap: 10,
                  padding:'10px 20px',
                  borderBottom: i < _proximas.length-1 ? '1px solid var(--hairline)' : 'none',
                }}>
                  <div className="avatar sm">{(c.nom || '?').split(' ').slice(-1)[0][0]}</div>
                  <div className="flex1">
                    <div style={{fontSize:13, fontWeight:500, color:'var(--ink)'}}>{c.nom}</div>
                    <div className="muted text-xs mono">{c.code} · en {c.dias} días</div>
                  </div>
                  <div className="num strong" style={{fontSize:13}}>S/ {fmtSoles(c.monto)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Ejecutivos · ranking</div>
              <button className="btn sm ghost" onClick={() => onGoto('comercial')}>
                Análisis <Icon name="arrowR" size={12}/>
              </button>
            </div>
            <div style={{padding:'4px 0'}}>
              {_asesores.map((a, i) => {
                const pct = Math.round((a.v / _asesorMax) * 100);
                const ini = (a.n || '?').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
                return (
                  <div key={i} style={{padding:'10px 20px', borderBottom: i < _asesores.length-1 ? '1px solid var(--hairline)' : 'none'}}>
                    <div className="hstack between">
                      <div className="hstack gap-8">
                        <div className="avatar sm">{ini}</div>
                        <div style={{fontSize:13, fontWeight:500}}>{a.n}</div>
                      </div>
                      <div className="num strong" style={{fontSize:12.5}}>S/ {fmtInt(a.v)}</div>
                    </div>
                    <div style={{
                      marginTop:6, height: 4, borderRadius: 999,
                      background:'var(--bg-sunken)', overflow:'hidden'
                    }}>
                      <div style={{width: `${pct}%`, height:'100%', background:'var(--brand)'}}/>
                    </div>
                    <div className="hstack between mt-4">
                      <span className="muted text-xs">{a.m} contratos</span>
                      <span className="muted text-xs mono">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenDashboard });
