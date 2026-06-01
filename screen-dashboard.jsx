// screen-dashboard.jsx — Vista principal con métricas y atajos

const ScreenDashboard = ({ onNew, onOpenContract, onGoto, onToast }) => {
  const sesion = window.getSesion?.() || {};
  const nombre = sesion.nombre || 'Usuario';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const [metrics, setMetrics] = React.useState(null);
  const [contratos, setContratos] = React.useState([]);
  const sparkA = [12,15,11,18,22,17,24,28,26,32,30,34];
  const sparkB = [8,10,9,11,12,11,14,13,15,14,16,18];
  const sparkC = [4,3,5,4,2,3,2,1,3,2,1,2];
  const sparkD = [22,28,24,30,34,32,36,38,42,40,44,48];

  React.useEffect(() => {
    if (!window.apiClient) return;
    window.apiClient('/api/dashboard').then(d => { if (d) setMetrics(d); }).catch(() => {});
    window.apiClient('/api/contratos?limit=6').then(d => { if (d) setContratos(d.slice ? d.slice(0,6) : []); }).catch(() => {});
  }, []);

  const m = metrics || {};
  const esteMes   = parseInt(m.contratos?.este_mes)  || 0;
  const porFirmar = parseInt(m.contratos?.por_firmar) || 0;
  const montoTotal= parseFloat(m.contratos?.monto_total) || 0;
  const vencidas  = parseInt(m.cuotas?.vencidas)      || 0;

  return (
    <div className="page" data-screen-label="Dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">{saludo}, {nombre.split(' ')[0]}</h1>
          <div className="page-sub">
            {porFirmar > 0 && <><b style={{color:'var(--ink)', cursor:'pointer'}} onClick={() => onGoto('contracts', {status:'por-firmar'})}>{porFirmar} contrato{porFirmar !== 1 ? 's' : ''} por firmar</b>{vencidas > 0 ? ' y ' : '.'}</>}
            {vencidas > 0 && <><b style={{color:'var(--warning)', cursor:'pointer'}} onClick={() => onGoto('pagos', {filter:'vencida'})}>{vencidas} cuota{vencidas !== 1 ? 's' : ''} vencida{vencidas !== 1 ? 's' : ''}</b>.</>}
            {porFirmar === 0 && vencidas === 0 && <span>Todo al día — sin pendientes urgentes.</span>}
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={() => onToast?.('Filtro por período · Próximamente')}>
            <Icon name="filter" size={14}/> {new Date().toLocaleDateString('es-PE', {month:'long', year:'numeric'})}
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
          <div className="metric-value">{metrics ? esteMes : '—'}</div>
          <div className="metric-delta"><Icon name="trendUp" size={12}/> {metrics ? `Total: ${m.contratos?.total || 0}` : 'Cargando…'}</div>
          <div className="metric-spark"><Sparkline data={sparkA} color="var(--brand)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('contracts', {status:'por-firmar'})} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="clock" size={13}/> Por firmar
            <span className="metric-link">Ver lista <Icon name="arrowR" size={10}/></span>
          </div>
          <div className="metric-value">{metrics ? porFirmar : '—'}</div>
          <div className="metric-delta neg"><Icon name="trendUp" size={12}/> Pendientes de firma</div>
          <div className="metric-spark"><Sparkline data={sparkB} color="var(--warning)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('pagos')} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="money" size={13}/> Monto contratado
          </div>
          <div className="metric-value"><span className="cur">S/</span>{metrics ? fmtSoles(montoTotal) : '—'}</div>
          <div className="metric-delta"><Icon name="trendUp" size={12}/> Total activo</div>
          <div className="metric-spark"><Sparkline data={sparkD} color="var(--success)"/></div>
        </div>
        <div className="metric" onClick={() => onGoto('pagos', {filter:'vencida'})} style={{cursor:'pointer'}}>
          <div className="metric-label">
            <Icon name="alert" size={13}/> Cuotas vencidas
            <span className="metric-link">Registrar pago <Icon name="arrowR" size={10}/></span>
          </div>
          <div className="metric-value">{metrics ? vencidas : '—'}</div>
          <div className="metric-delta neg"><Icon name="trendDown" size={12}/> {metrics ? `${m.cuotas?.proximas || 0} próximas a vencer` : 'Cargando…'}</div>
          <div className="metric-spark"><Sparkline data={sparkC} color="var(--danger)"/></div>
        </div>
      </div>

      {/* Quick action — una sola venta = 5 documentos */}
      <div className="cta-venta" onClick={() => onNew()}>
        <div className="cta-ic"><Icon name="layers" size={26}/></div>
        <div className="flex1">
          <div className="cta-title">Generar nueva venta</div>
          <div className="cta-desc">Una sola venta genera automáticamente los <b>6 documentos</b>: Separación, Contrato de Compraventa, Cronograma de Pagos, Acta de Separación, Tratamiento de Datos y Declaración Jurada.</div>
          <div className="cta-docs">
            {DOC_TYPES.map((d, i) => (
              <span key={d.id} className="cta-doc">
                <span className="cta-doc-n">{String(i+1).padStart(2,'0')}</span>
                {d.label}
              </span>
            ))}
          </div>
        </div>
        <button className="btn primary lg">
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
              {(contratos.length ? contratos : CONTRATOS_RECIENTES).slice(0,6).map((c) => {
                const datos = c.datos || {};
                const row = contratos.length ? {
                  id: c.id,
                  code: c.codigo,
                  cliente: `${datos.nombres || ''} ${datos.apellidos || ''}`.trim() || c.codigo,
                  proyecto: datos.proyecto || '',
                  unidad: datos.loteId || '',
                  tipo: c.tipo || 'venta',
                  precio: parseFloat(datos.precio) || 0,
                  status: c.estado,
                } : c;
                return (
                  <tr key={row.id} onClick={() => onOpenContract(row)}>
                    <td className="num">{row.code}</td>
                    <td>
                      <div className="strong" style={{fontSize:13.5}}>{row.cliente}</div>
                      <div className="muted text-xs">{row.proyecto} · {row.unidad}</div>
                    </td>
                    <td><DocTypeBadge type={row.tipo}/></td>
                    <td className="num right strong">{fmtSoles(row.precio)}</td>
                    <td><StatusPill status={row.status}/></td>
                    <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
                  </tr>
                );
              })}
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
              {[
                {nom: 'R. Ramos Velarde', code: 'MTK-2026-0182', monto: 12166, dias: 2, urg: true},
                {nom: 'A. Jiménez Soto',  code: 'MTK-2026-0181', monto: 8250,  dias: 5},
                {nom: 'R. Tapia Ferrer',  code: 'MTK-2026-0179', monto: 5280,  dias: 6},
                {nom: 'C. Mendieta',      code: 'MTK-2026-0184', monto: 5522,  dias: 8},
              ].map((c, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap: 10,
                  padding:'10px 20px',
                  borderBottom: i<3 ? '1px solid var(--hairline)' : 'none',
                }}>
                  <div className="avatar sm">{c.nom.split(' ').slice(-1)[0][0]}</div>
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
              <div className="card-title">Asesores · mayo</div>
            </div>
            <div style={{padding:'4px 0'}}>
              {[
                {n:'Camila Reátegui', ini:'CR', m:12, v:780000},
                {n:'Diego Saldaña',   ini:'DS', m:9,  v:410000},
                {n:'Lorena Quispe',   ini:'LQ', m:6,  v:365000},
                {n:'Andrés Castañeda',ini:'AC', m:5,  v:282500},
              ].map((a, i) => {
                const pct = Math.round((a.v / 800000) * 100);
                return (
                  <div key={i} style={{padding:'10px 20px', borderBottom: i<3 ? '1px solid var(--hairline)' : 'none'}}>
                    <div className="hstack between">
                      <div className="hstack gap-8">
                        <div className="avatar sm">{a.ini}</div>
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
                      <span className="muted text-xs mono">{pct}% meta</span>
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
