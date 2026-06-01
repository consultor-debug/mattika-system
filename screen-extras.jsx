// screen-extras.jsx — Funcionalidad faltante: modales de nuevo
// cliente/inmueble/asesor, pantalla de Ajustes real, notificaciones,
// búsqueda global y panel mensual del dashboard.

// ═══════════════════════════════════════════════════════════════
// CLIENTES (replaces basic placeholder)
// ═══════════════════════════════════════════════════════════════
const CLIENTES_INICIAL = [
  { id:1, nombres:'Rosmery Rocío', apellidos:'Valderrama Trujillo', dni:'46049117', estadoCivil:'Soltera',  telefono:'923 585 590', email:'rosmery@correo.pe',  domicilio:'Jr. Indico 432, La Esperanza, Trujillo',     contratos: 1, ult:'2026-05-22' },
  { id:2, nombres:'Javier Eduardo',apellidos:'Cisneros Tello',     dni:'09887452', estadoCivil:'Casado',   telefono:'998 244 109', email:'jcisneros@correo.pe',domicilio:'Av. España 1245, Trujillo',                contratos: 1, ult:'2026-05-21' },
  { id:3, nombres:'Lucía',          apellidos:'Ramos Velarde',      dni:'47225910', estadoCivil:'Soltera',  telefono:'987 461 220', email:'lucia.r@correo.pe',  domicilio:'Calle Las Casuarinas 215, Lima',          contratos: 1, ult:'2026-05-19' },
  { id:4, nombres:'Andrea',         apellidos:'Jiménez Soto',       dni:'42118094', estadoCivil:'Casada',   telefono:'956 011 873', email:'andreajs@correo.pe', domicilio:'Mz. F Lt. 14, Urb. El Golf, Trujillo',     contratos: 2, ult:'2026-05-18' },
  { id:5, nombres:'Renzo',          apellidos:'Tapia Ferrer',       dni:'41005781', estadoCivil:'Soltero',  telefono:'944 902 376', email:'rtapia@correo.pe',   domicilio:'Av. Larco 1455, Trujillo',                  contratos: 1, ult:'2026-05-14' },
  { id:6, nombres:'Patricia',       apellidos:'Olarte Núñez',       dni:'09553127', estadoCivil:'Viuda',    telefono:'915 730 248', email:'polarte@correo.pe',  domicilio:'Av. Bolognesi 880, Trujillo',              contratos: 1, ult:'2026-05-16' },
];

const ScreenClients = ({ onToast }) => {
  const empresaId = window.getSesion?.()?.empresaId;
  const [clients, setClients] = React.useState(() => window.deriveClientes?.(empresaId) || []);
  const [q, setQ] = React.useState('');
  const [nuevoOpen, setNuevoOpen] = React.useState(false);
  const [detalleId, setDetalleId] = React.useState(null);

  const refresh = () => setClients(window.deriveClientes?.(empresaId) || []);
  React.useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [empresaId]);

  const filtered = clients.filter(c =>
    !q || `${c.nombres} ${c.apellidos} ${c.dni}`.toLowerCase().includes(q.toLowerCase())
  );

  const addCliente = (data) => {
    const store = window.loadClientesStore?.(empresaId) || [];
    if (store.some(c => String(c.dni) === String(data.dni))) {
      onToast?.('Ya existe un cliente con ese DNI');
      return;
    }
    const rec = { ...data, id: 'c-' + Date.now(), contratos: 0, ult: new Date().toISOString().slice(0,10) };
    window.saveClientesStore?.(empresaId, [rec, ...store]);
    refresh();
    onToast?.(`✓ Cliente ${data.nombres} ${data.apellidos} registrado`);
  };

  const detalle = clients.find(c => c.id === detalleId);
  const conOperaciones = clients.filter(c => (c.operaciones || []).length > 0).length;

  return (
    <div className="page" data-screen-label="Clientes">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-sub">
            {clients.length} personas registradas
            {conOperaciones > 0 && <> · <b>{conOperaciones}</b> con lotes apartados o vendidos</>}
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn"><Icon name="download" size={14}/> Exportar</button>
          <button className="btn primary" onClick={() => setNuevoOpen(true)}>
            <Icon name="plus" size={15}/> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="card card-pad mb-16" style={{padding:'12px 16px'}}>
        <div className="search" style={{margin:0}}>
          <Icon name="search" size={14}/>
          <input placeholder="Buscar por nombre o DNI..." value={q} onChange={(e)=>setQ(e.target.value)}/>
        </div>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Lotes / operaciones</th><th className="right">Ventas</th><th>Última actividad</th><th></th></tr></thead>
          <tbody>
            {filtered.map(c => {
              const ops = c.operaciones || [];
              return (
              <tr key={c.id} onClick={() => setDetalleId(c.id)}>
                <td className="hstack gap-10">
                  <div className="avatar sm">{`${c.nombres} ${c.apellidos}`.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                  <div>
                    <span className="strong">{c.nombres} {c.apellidos}</span>
                    {c.derivado && <span className="pill outline" style={{marginLeft:8, fontSize:10}}>desde reserva</span>}
                  </div>
                </td>
                <td className="num">{c.dni}</td>
                <td className="muted text-sm">{c.telefono ? `+51 ${c.telefono}` : '—'}</td>
                <td>
                  {ops.length === 0
                    ? <span className="muted text-sm">—</span>
                    : <div className="hstack gap-6" style={{flexWrap:'wrap'}}>
                        {ops.slice(0,4).map((o,i) => (
                          <span key={i} className={`pill ${o.tipo === 'venta' ? 'success' : 'warn'}`} style={{fontSize:11}}>
                            {o.loteId}
                          </span>
                        ))}
                        {ops.length > 4 && <span className="muted text-xs">+{ops.length-4}</span>}
                      </div>}
                </td>
                <td className="right strong">{c.contratos}</td>
                <td className="muted text-sm">{c.ult ? fmtDate(c.ult) : '—'}</td>
                <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{padding:36, textAlign:'center', color:'var(--muted)'}}>Sin clientes. Registra uno o crea una reserva en el Plano.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {nuevoOpen && <ClienteNuevoModal onClose={() => setNuevoOpen(false)} onSave={addCliente}/>}
      {detalle && <ClienteDetailDrawer cliente={detalle} onClose={() => setDetalleId(null)}/>}
    </div>
  );
};

const ClienteNuevoModal = ({ onClose, onSave }) => {
  const [f, setF] = React.useState({ nombres:'', apellidos:'', dni:'', estadoCivil:'Soltero', telefono:'', email:'', domicilio:'' });
  const set = (k, v) => setF({ ...f, [k]: v });
  const submit = () => {
    if (!f.nombres.trim() || !f.apellidos.trim() || f.dni.length !== 8) {
      alert('Completa nombres, apellidos y un DNI válido de 8 dígitos.');
      return;
    }
    onSave(f);
    onClose();
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{width:'min(620px, calc(100vw - 32px))'}} onClick={(e)=>e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8"><Icon name="users" size={16}/> Nuevo cliente</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="card-pad">
          <div className="field-group cols-2">
            <div className="field"><label className="field-label">Nombres <span className="req">*</span></label><input className="input" value={f.nombres} onChange={(e)=>set('nombres', e.target.value)}/></div>
            <div className="field"><label className="field-label">Apellidos <span className="req">*</span></label><input className="input" value={f.apellidos} onChange={(e)=>set('apellidos', e.target.value)}/></div>
            <div className="field"><label className="field-label">DNI <span className="req">*</span></label><input className="input mono" maxLength="8" value={f.dni} onChange={(e)=>set('dni', e.target.value.replace(/\D/g,'').slice(0,8))}/></div>
            <div className="field"><label className="field-label">Estado civil</label><select className="select" value={f.estadoCivil} onChange={(e)=>set('estadoCivil', e.target.value)}><option>Soltero</option><option>Soltera</option><option>Casado</option><option>Casada</option><option>Conviviente</option><option>Divorciado(a)</option><option>Viudo(a)</option></select></div>
            <div className="field"><label className="field-label">Teléfono</label><div className="input-prefix"><span className="px">+51</span><input value={f.telefono} onChange={(e)=>set('telefono', e.target.value)}/></div></div>
            <div className="field"><label className="field-label">Correo</label><input className="input" type="email" value={f.email} onChange={(e)=>set('email', e.target.value)}/></div>
            <div className="field" style={{gridColumn:'1 / -1'}}><label className="field-label">Domicilio</label><input className="input" value={f.domicilio} onChange={(e)=>set('domicilio', e.target.value)}/></div>
          </div>
        </div>
        <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit}><Icon name="check" size={13}/> Guardar cliente</button>
        </div>
      </div>
    </div>
  );
};

const ClienteDetailDrawer = ({ cliente, onClose }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="drawer" onClick={(e)=>e.stopPropagation()}>
      <div className="drawer-head">
        <div className="hstack gap-10">
          <div className="avatar lg">{`${cliente.nombres} ${cliente.apellidos}`.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
          <div>
            <div className="serif" style={{fontSize:20, fontWeight:500, color:'var(--ink)'}}>{cliente.nombres} {cliente.apellidos}</div>
            <div className="muted text-sm">DNI {cliente.dni} · {cliente.estadoCivil}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="drawer-body">
        <div className="card card-pad mb-12">
          <div className="card-title mb-12">Datos de contacto</div>
          <div className="vstack gap-10">
            <KVDrawer k="Teléfono" v={`+51 ${cliente.telefono}`}/>
            <KVDrawer k="Correo" v={cliente.email}/>
            <KVDrawer k="Domicilio" v={cliente.domicilio}/>
            <KVDrawer k="Última actividad" v={fmtDate(cliente.ult)}/>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Lotes y operaciones</div>
            <span className="pill brand">{(cliente.operaciones || []).length}</span>
          </div>
          <div style={{padding:'8px 16px 16px'}}>
            {(cliente.operaciones || []).length === 0 ? (
              <div className="empty" style={{padding:20}}>Sin lotes apartados ni vendidos aún.</div>
            ) : (
              (cliente.operaciones || []).map((o, i) => (
                <div key={i} className="hstack gap-10" style={{padding:'10px 0', borderBottom:'1px solid var(--hairline)'}}>
                  <div className="qa-ic" style={{width:32, height:32}}><Icon name="mapPin" size={14}/></div>
                  <div className="flex1">
                    <div className="strong text-sm mono">Lote {o.loteId}</div>
                    <div className="muted text-xs">{o.proyecto || '—'}{o.precio ? ` · S/ ${fmtSoles(o.precio)}` : ''}{o.fecha ? ` · ${fmtDate(o.fecha)}` : ''}</div>
                  </div>
                  <StatusPill status={o.tipo === 'venta' ? 'pagado' : 'pendiente'}/>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="drawer-foot">
        <button className="btn" onClick={onClose}>Cerrar</button>
        <button className="btn primary"><Icon name="edit" size={13}/> Editar</button>
      </div>
    </div>
  </div>
);

const KVDrawer = ({ k, v }) => (
  <div className="hstack between gap-10">
    <span className="muted text-sm">{k}</span>
    <span className="text-sm strong" style={{textAlign:'right'}}>{v || '—'}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// INMUEBLES
// ═══════════════════════════════════════════════════════════════
const INMUEBLES_INICIAL = [
  { id:1, code:'Lote 14',  mz:'C', proy:'Nápoles Condominio Club',  area:180, precio:248500, st:'Reservado',  partida:'11550511' },
  { id:2, code:'Lote 07',  mz:'A', proy:'Nápoles Condominio Club',  area:160, precio:198000, st:'Vendido',    partida:'11550511' },
  { id:3, code:'Lote 12',  mz:'B', proy:'Nápoles Condominio Club',  area:175, precio:212000, st:'Reservado',  partida:'11550511' },
  { id:4, code:'Lote 05',  mz:'D', proy:'Nápoles Condominio Club',  area:140, precio:172800, st:'Vendido',    partida:'11550511' },
  { id:5, code:'Lote 22',  mz:'A', proy:'Nápoles Condominio Club',  area:155, precio:188000, st:'Disponible', partida:'11550511' },
  { id:6, code:'Lote 03',  mz:'D', proy:'Nápoles Condominio Club',  area:165, precio:198000, st:'Disponible', partida:'11550511' },
  { id:7, code:'Lote 11',  mz:'B', proy:'Nápoles Condominio Club',  area:140, precio:170500, st:'Disponible', partida:'11550511' },
  { id:8, code:'Lote 18',  mz:'C', proy:'Nápoles Condominio Club',  area:172, precio:206400, st:'Disponible', partida:'11550511' },
];

const ScreenInmuebles = () => {
  const [items, setItems] = React.useState(INMUEBLES_INICIAL);
  const [nuevoOpen, setNuevoOpen] = React.useState(false);
  const [detalleId, setDetalleId] = React.useState(null);
  const [filtroSt, setFiltroSt] = React.useState('all');

  const filtered = items.filter(i => filtroSt === 'all' || i.st === filtroSt);
  const detalle = items.find(i => i.id === detalleId);
  const stMap = { 'Disponible':'success', 'Reservado':'warn', 'Vendido':'outline' };

  const counts = {
    Disponible: items.filter(i=>i.st==='Disponible').length,
    Reservado:  items.filter(i=>i.st==='Reservado').length,
    Vendido:    items.filter(i=>i.st==='Vendido').length,
  };

  return (
    <div className="page" data-screen-label="Inmuebles">
      <div className="page-head">
        <div>
          <h1 className="page-title">Inmuebles</h1>
          <div className="page-sub">{items.length} unidades · Proyecto {window.getProyectoActual?.()?.nombre || 'Principal'}{window.getEtapaActual?.()?.nombre ? ` · ${window.getEtapaActual().nombre}` : ''}</div>
        </div>
        <button className="btn primary" onClick={() => setNuevoOpen(true)}>
          <Icon name="plus" size={15}/> Nuevo inmueble
        </button>
      </div>

      {/* Resumen */}
      <div className="field-group cols-3 mb-16">
        <div className="metric metric-pago" data-tone="success" onClick={() => setFiltroSt('Disponible')} style={{cursor:'pointer'}}>
          <div className="metric-label"><Icon name="checkCircle" size={13}/> Disponibles</div>
          <div className="metric-value">{counts.Disponible}</div>
        </div>
        <div className="metric metric-pago" data-tone="warn" onClick={() => setFiltroSt('Reservado')} style={{cursor:'pointer'}}>
          <div className="metric-label"><Icon name="clock" size={13}/> Reservados</div>
          <div className="metric-value">{counts.Reservado}</div>
        </div>
        <div className="metric metric-pago" onClick={() => setFiltroSt('Vendido')} style={{cursor:'pointer'}}>
          <div className="metric-label"><Icon name="receipt" size={13}/> Vendidos</div>
          <div className="metric-value">{counts.Vendido}</div>
        </div>
      </div>

      <div className="hstack gap-8 mb-12">
        {['all','Disponible','Reservado','Vendido'].map(s => (
          <button key={s} className={`filter-chip ${filtroSt===s ? 'active' : ''}`} onClick={() => setFiltroSt(s)}>
            <span>{s === 'all' ? 'Todos' : s}</span>
          </button>
        ))}
      </div>

      <div className="field-group cols-4">
        {filtered.map(i => (
          <div key={i.id} className="card card-pad" style={{cursor:'pointer'}} onClick={() => setDetalleId(i.id)}>
            <div className="hstack between mb-8">
              <div className="qa-ic" style={{width:32, height:32}}><Icon name="building" size={16}/></div>
              <span className={`pill ${stMap[i.st]}`}><span className="dot"/>{i.st}</span>
            </div>
            <div className="serif" style={{fontSize:18, fontWeight:500, color:'var(--ink)', letterSpacing:'-.01em'}}>{i.code} · Mz. {i.mz}</div>
            <div className="muted text-sm">{i.proy}</div>
            <div className="divider"/>
            <div className="hstack between">
              <div>
                <div className="muted text-xs">Área</div>
                <div className="mono fw-600">{i.area} m²</div>
              </div>
              <div className="right">
                <div className="muted text-xs">Precio</div>
                <div className="mono fw-600">S/ {fmtInt(i.precio)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {nuevoOpen && <InmuebleNuevoModal onClose={() => setNuevoOpen(false)} onSave={(d) => {
        setItems([{ ...d, id: Date.now(), st:'Disponible', partida:'11550511', proy:'Nápoles Condominio Club' }, ...items]);
      }}/>}
      {detalle && <InmuebleDetailModal inmueble={detalle} onClose={() => setDetalleId(null)} stMap={stMap}/>}
    </div>
  );
};

const InmuebleNuevoModal = ({ onClose, onSave }) => {
  const [f, setF] = React.useState({ code:'', mz:'', area:'', precio:'' });
  const set = (k, v) => setF({ ...f, [k]: v });
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="card-head">
          <div className="card-title hstack gap-8"><Icon name="building" size={16}/> Nuevo inmueble</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>
        <div className="card-pad">
          <div className="field-group cols-2">
            <div className="field"><label className="field-label">Unidad</label><input className="input" placeholder="Lote 25" value={f.code} onChange={(e)=>set('code', e.target.value)}/></div>
            <div className="field"><label className="field-label">Manzana</label><input className="input" placeholder="C" value={f.mz} onChange={(e)=>set('mz', e.target.value)}/></div>
            <div className="field"><label className="field-label">Área (m²)</label><input className="input mono" type="number" value={f.area} onChange={(e)=>set('area', +e.target.value)}/></div>
            <div className="field"><label className="field-label">Precio</label><div className="input-prefix"><span className="px">S/</span><input type="number" value={f.precio} onChange={(e)=>set('precio', +e.target.value)}/></div></div>
          </div>
        </div>
        <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={() => { if (!f.code) return alert('Ingresa el código'); onSave(f); onClose(); }}>
            <Icon name="check" size={13}/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

const InmuebleDetailModal = ({ inmueble, onClose, stMap }) => (
  <div className="modal-bg" onClick={onClose}>
    <div className="modal" style={{width:'min(560px, calc(100vw - 32px))'}} onClick={(e)=>e.stopPropagation()}>
      <div className="card-head">
        <div className="card-title hstack gap-8">
          <Icon name="building" size={16}/> {inmueble.code} · Mz. {inmueble.mz}
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div className="card-pad vstack gap-10">
        <div className="hstack between">
          <span className="muted text-sm">Estado</span>
          <span className={`pill ${stMap[inmueble.st]}`}><span className="dot"/>{inmueble.st}</span>
        </div>
        <KVDrawer k="Proyecto" v={inmueble.proy}/>
        <KVDrawer k="Área" v={`${inmueble.area} m²`}/>
        <KVDrawer k="Precio" v={`S/ ${fmtInt(inmueble.precio)}`}/>
        <KVDrawer k="Partida registral" v={`P-${inmueble.partida}`}/>
      </div>
      <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
        <button className="btn" onClick={onClose}>Cerrar</button>
        <button className="btn primary"><Icon name="edit" size={13}/> Editar</button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// ASESORES — equipo de usuarios de la empresa (datos reales de auth.jsx)
// ═══════════════════════════════════════════════════════════════
const ROLES_EMPRESA = ['Administrador', 'Gerente', 'SubGerente Comercial', 'Jefe Comercial', 'Jefe de Ventas', 'Coordinador de Ventas', 'Asesor', 'Cobranzas', 'Contable'];

const ScreenAsesores = ({ onToast }) => {
  const empresa = window.getEmpresaActual?.();
  const sesion  = window.getSesion?.();
  const puedeGestionar = window.can?.('gestionar_usuarios') ?? false;

  const [usuarios, setUsuarios] = React.useState(() => window.loadUsuarios?.() || []);
  const [modal, setModal] = React.useState(null);
  const [verClaves, setVerClaves] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!window.apiClient) return;
    setLoading(true);
    window.apiClient('/api/usuarios').then(data => {
      if (!Array.isArray(data)) return;
      const normalized = data.map(u => ({
        id: u.id, empresaId: u.empresa_id, nombre: u.nombre,
        usuario: u.username, rol: u.rol || 'Asesor',
        activo: u.activo !== false, permisos: u.permisos || {},
        _fromApi: true,
      }));
      setUsuarios(normalized);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const equipo = usuarios.filter(u => !u.empresaId || u.empresaId === empresa?.id);
  const activos = equipo.filter(u => u.activo).length;

  const guardar = async (data) => {
    const isNew = !data.id;
    if (window.apiClient) {
      try {
        let result;
        if (isNew) {
          result = await window.apiClient('/api/usuarios', {
            method: 'POST',
            body: JSON.stringify({ nombre: data.nombre, username: data.usuario, password: data.clave, rol: data.rol, permisos: data.permisos }),
          });
        } else {
          result = await window.apiClient(`/api/usuarios/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify({ nombre: data.nombre, rol: data.rol, activo: data.activo, permisos: data.permisos }),
          });
          if (data.clave && data.clave !== '••••••••••') {
            await window.apiClient(`/api/usuarios/${data.id}/password`, {
              method: 'PUT',
              body: JSON.stringify({ password: data.clave }),
            }).catch(() => {});
          }
        }
        if (result?.id) {
          const reg = { id: result.id, empresaId: result.empresa_id, nombre: result.nombre, usuario: result.username, rol: result.rol, activo: result.activo !== false, permisos: result.permisos || {}, _fromApi: true };
          setUsuarios(prev => isNew ? [...prev, reg] : prev.map(u => u.id === reg.id ? { ...u, ...reg } : u));
          setModal(null);
          window.dispatchEvent(new CustomEvent('mattika:permisos-cambiado'));
          onToast?.(isNew ? `✓ Usuario "${data.usuario}" creado` : '✓ Usuario actualizado');
          return;
        }
      } catch (err) {
        onToast?.('Error: ' + (err.message || 'No se pudo guardar'));
        return;
      }
    }
    const id = data.id || 'u-' + Math.random().toString(36).slice(2, 10);
    const reg = { ...data, id, empresaId: empresa.id, activo: data.activo !== false };
    setUsuarios(prev => isNew ? [...prev, reg] : prev.map(u => u.id === id ? { ...u, ...reg } : u));
    setModal(null);
    window.dispatchEvent(new CustomEvent('mattika:permisos-cambiado'));
    onToast?.(isNew ? `✓ Usuario "${data.usuario}" creado` : '✓ Usuario actualizado');
  };

  const toggle = async (u) => {
    if (window.apiClient && u._fromApi) {
      try {
        await window.apiClient(`/api/usuarios/${u.id}`, { method: 'PUT', body: JSON.stringify({ activo: !u.activo }) });
        setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
        onToast?.(u.activo ? 'Usuario desactivado' : 'Usuario reactivado');
        return;
      } catch (err) { onToast?.('Error al cambiar estado'); return; }
    }
    setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
    onToast?.(u.activo ? 'Usuario desactivado' : 'Usuario reactivado');
  };

  const eliminar = async (u) => {
    if (u.id === sesion?.usuarioId) { onToast?.('No puedes eliminar tu propio usuario'); return; }
    if (!window.confirm(`¿Eliminar al usuario "${u.usuario}" (${u.nombre})?`)) return;
    if (window.apiClient && u._fromApi) {
      try {
        await window.apiClient(`/api/usuarios/${u.id}`, { method: 'DELETE' });
        setUsuarios(prev => prev.filter(x => x.id !== u.id));
        onToast?.('Usuario eliminado');
        return;
      } catch (err) { onToast?.('Error al eliminar: ' + err.message); return; }
    }
    setUsuarios(prev => prev.filter(x => x.id !== u.id));
    onToast?.('Usuario eliminado');
  };

  const inicialesDe = (n) => (n || '?').split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();

  return (
    <div className="page" data-screen-label="Asesores" style={{maxWidth: 1100}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Usuarios y equipo</h1>
          <div className="page-sub">
            {equipo.length} usuario{equipo.length === 1 ? '' : 's'} · {activos} activo{activos === 1 ? '' : 's'}
            {empresa && <> · <b>{empresa.nombre}</b></>}
          </div>
        </div>
        <div className="hstack gap-8">
          {loading && <span className="muted text-xs">Cargando…</span>}
          {puedeGestionar && (
            <button className="btn primary" onClick={() => setModal('new')}>
              <Icon name="plus" size={15}/> Nuevo usuario
            </button>
          )}
        </div>
      </div>

      {!puedeGestionar && (
        <div className="proy-info-banner" style={{marginBottom:16}}>
          <div className="proy-info-ic"><Icon name="info" size={14}/></div>
          <div className="flex1">
            <b>Vista de solo lectura</b>
            <p>Necesitas el permiso <b>“Gestionar usuarios del equipo”</b> para crear o editar usuarios. Pídelo a un administrador.</p>
          </div>
        </div>
      )}

      <div className="card">
        <table className="tbl">
          <thead><tr>
            <th>Usuario</th><th>Acceso</th><th>Rol</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>
            {equipo.map((u) => (
              <tr key={u.id}>
                <td className="hstack gap-10">
                  <div className="avatar sm" style={{background: empresa?.color || 'var(--brand)'}}>{inicialesDe(u.nombre)}</div>
                  <div>
                    <div className="strong">{u.nombre || '—'}</div>
                    {u.id === sesion?.usuarioId && <div className="muted text-xs">Tú</div>}
                  </div>
                </td>
                <td className="mono"><b>{u.usuario}</b></td>
                <td><span className="pill outline">{u.rol}</span></td>
                <td>{u.activo
                  ? <span className="pill success"><span className="dot"/>Activo</span>
                  : <span className="pill"><span className="dot"/>Inactivo</span>}</td>
                <td className="right">
                  {puedeGestionar && (
                    <div className="hstack gap-6" style={{justifyContent:'flex-end'}}>
                      <button className="btn" onClick={() => setModal(u)}><Icon name="edit" size={12}/></button>
                      <button className="btn" onClick={() => toggle(u)}>{u.activo ? 'Desactivar' : 'Reactivar'}</button>
                      <button className="btn danger" onClick={() => eliminar(u)}><Icon name="x" size={12}/></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {equipo.length === 0 && (
              <tr><td colSpan={6} className="muted center" style={{padding:'28px'}}>
                Aún no hay usuarios en esta empresa. {puedeGestionar && 'Crea el primero con “Nuevo usuario”.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <AsesorUserModal
          initial={modal === 'new' ? null : modal}
          empresaNombre={empresa?.nombre || ''}
          onClose={() => setModal(null)}
          onSave={guardar}/>
      )}
    </div>
  );
};

const AsesorUserModal = ({ initial, empresaNombre, onClose, onSave }) => {
  const rolDefaults = window.permisosPorRol || ((r) => ({}));
  const [f, setF] = React.useState(() => {
    const base = initial || { usuario:'', clave:'', nombre:'', rol:'Asesor', activo:true };
    return { ...base, permisos: base.permisos ? { ...rolDefaults(base.rol), ...base.permisos } : rolDefaults(base.rol) };
  });
  const [showPass, setShowPass] = React.useState(!initial);
  const generarClave = () => {
    const cs = 'abcdefghkmnopqrstuvwxyz23456789';
    let p = '';
    for (let i = 0; i < 10; i++) p += cs[Math.floor(Math.random()*cs.length)];
    setF({...f, clave: p}); setShowPass(true);
  };
  const submit = (ev) => {
    ev.preventDefault();
    if (!f.usuario.trim() || !f.clave.trim()) return;
    onSave({ ...f, ...(initial ? { id: initial.id } : {}) });
  };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" onSubmit={submit}>
        <header>
          <h3>{initial ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <div className="proy-modal-context">
            <span className="muted text-xs">Empresa</span>
            <b>{empresaNombre}</b>
          </div>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Usuario</span>
              <input type="text" value={f.usuario} onChange={(e) => setF({...f, usuario: e.target.value.toLowerCase().replace(/\s/g,'')})} required placeholder="usuario"/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Nombre completo</span>
              <input type="text" value={f.nombre} onChange={(e) => setF({...f, nombre: e.target.value})} placeholder="Camila Reátegui"/>
            </label>
          </div>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Rol</span>
              <select value={f.rol} onChange={(e) => setF({...f, rol: e.target.value, permisos: rolDefaults(e.target.value)})}>
                {ROLES_EMPRESA.map(r => <option key={r}>{r}</option>)}
              </select>
            </label>
            <label className="auth-field">
              <span className="auth-label">Estado</span>
              <label className="auth-remember" style={{marginTop:8}}>
                <input type="checkbox" checked={f.activo !== false} onChange={(e) => setF({...f, activo: e.target.checked})}/>
                <span>Usuario activo</span>
              </label>
            </label>
          </div>
          <label className="auth-field">
            <div className="auth-label-row">
              <span className="auth-label">Clave</span>
              <button type="button" className="auth-link" onClick={generarClave}>Generar clave segura</button>
            </div>
            <div className="auth-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round"/>
              </svg>
              <input type={showPass ? 'text' : 'password'} value={f.clave} onChange={(e) => setF({...f, clave: e.target.value})} required placeholder="••••••••"/>
              <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} aria-label="Mostrar clave">
                {showPass ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </label>
          {window.PermisosEditor && (
            <window.PermisosEditor rol={f.rol} value={f.permisos} onChange={(p) => setF({...f, permisos: p})}/>
          )}
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{initial ? 'Guardar cambios' : 'Crear usuario'}</button>
        </footer>
      </form>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// AJUSTES — pantalla real con tabs
// ═══════════════════════════════════════════════════════════════
const ScreenSettings = ({ onToast, t, setTweak }) => {
  const [tab, setTab] = React.useState('perfil');
  return (
    <div className="page" data-screen-label="Ajustes" style={{maxWidth:1100}}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <div className="page-sub">Configuración general de la cuenta y la empresa.</div>
        </div>
      </div>

      <div className="hstack gap-8 mb-16">
        <Tabs value={tab} onChange={setTab} options={[
          {id:'perfil',         label:'Mi perfil'},
          {id:'empresa',        label:'Empresa'},
          {id:'apariencia',     label:'Apariencia'},
          {id:'notificaciones', label:'Notificaciones'},
          {id:'integraciones',  label:'Integraciones'},
        ]}/>
      </div>

      {tab === 'perfil' && <SettingsPerfil onToast={onToast}/>}
      {tab === 'empresa' && <EmpresaEditor onToast={onToast}/>}
      {tab === 'apariencia' && <SettingsApariencia t={t} setTweak={setTweak} onToast={onToast}/>}
      {tab === 'notificaciones' && <SettingsNotificaciones onToast={onToast}/>}
      {tab === 'integraciones' && <SettingsIntegraciones onToast={onToast}/>}
    </div>
  );
};

const SettingsPerfil = ({ onToast }) => {
  const STORAGE_KEY = 'mattika.perfil.v1';
  const [p, setP] = React.useState(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch(e) {}
    return { nombre:'Mateo Vargas', email:'mateo@mattika.pe', telefono:'987 654 321', rol:'Administrador' };
  });
  const [dirty, setDirty] = React.useState(false);
  const upd = (k, v) => { setP({...p, [k]: v}); setDirty(true); };
  const save = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); setDirty(false); onToast('Perfil guardado'); };

  return (
    <div className="card card-pad">
      <div className="hstack gap-16 mb-16" style={{alignItems:'center'}}>
        <div className="avatar lg" style={{width:64, height:64, fontSize:22}}>{p.nombre.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
        <div className="flex1">
          <div className="card-title">{p.nombre}</div>
          <div className="muted text-sm">{p.rol} · {p.email}</div>
        </div>
        <button className="btn"><Icon name="upload" size={13}/> Cambiar foto</button>
      </div>
      <div className="field-group cols-2">
        <div className="field"><label className="field-label">Nombre completo</label><input className="input" value={p.nombre} onChange={(e)=>upd('nombre', e.target.value)}/></div>
        <div className="field"><label className="field-label">Correo</label><input className="input" type="email" value={p.email} onChange={(e)=>upd('email', e.target.value)}/></div>
        <div className="field"><label className="field-label">Teléfono</label><div className="input-prefix"><span className="px">+51</span><input value={p.telefono} onChange={(e)=>upd('telefono', e.target.value)}/></div></div>
        <div className="field"><label className="field-label">Rol</label><input className="input" value={p.rol} readOnly style={{background:'var(--bg-sunken)'}}/></div>
      </div>
      <div className="hstack gap-8 mt-16" style={{justifyContent:'flex-end'}}>
        <button className="btn primary" onClick={save} disabled={!dirty}><Icon name="check" size={13}/> Guardar perfil</button>
      </div>
    </div>
  );
};

const SettingsApariencia = ({ t, setTweak, onToast }) => {
  const colores = ['#1E4FD4', '#0F3D8A', '#1F6FEB', '#0C7A6B', '#7A4DB5', '#B33049', '#0B1A33'];
  return (
    <div className="card card-pad">
      <div className="card-title mb-12">Color de marca</div>
      <div className="page-sub mb-16">Define el color principal de la interfaz, botones primarios y los resaltados en los documentos.</div>
      <div className="hstack gap-10 mb-24" style={{flexWrap:'wrap'}}>
        {colores.map(c => (
          <button key={c}
                  onClick={() => { setTweak('brandColor', c); onToast('Color actualizado'); }}
                  className="color-swatch"
                  style={{background: c, outline: t.brandColor === c ? '3px solid var(--ink)' : 'none', outlineOffset: 2}}/>
        ))}
        <label className="hstack gap-6" style={{cursor:'pointer'}}>
          <input type="color" value={t.brandColor} onChange={(e) => setTweak('brandColor', e.target.value)} style={{width:36, height:36, border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', background:'none'}}/>
          <span className="muted text-sm">Personalizado</span>
        </label>
      </div>

      <div className="divider"/>

      <div className="card-title mb-12 mt-16">Tema</div>
      <div className="hstack gap-10">
        <button onClick={() => setTweak('dark', false)} className={`theme-card ${!t.dark ? 'active' : ''}`}>
          <div className="theme-card-pv light"><div></div><div></div></div>
          <div className="strong text-sm">Claro</div>
        </button>
        <button onClick={() => setTweak('dark', true)} className={`theme-card ${t.dark ? 'active' : ''}`}>
          <div className="theme-card-pv dark"><div></div><div></div></div>
          <div className="strong text-sm">Oscuro</div>
        </button>
      </div>
    </div>
  );
};

const SettingsNotificaciones = ({ onToast }) => {
  const STORAGE_KEY = 'mattika.notif.v1';
  const [n, setN] = React.useState(() => {
    try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch(e) {}
    return {
      cuotasVencer: true, cuotasMora: true, nuevoContrato: true,
      firmaPendiente: true, semanalCorreo: false, alertasSlack: false,
    };
  });
  const upd = (k, v) => { const next = {...n, [k]: v}; setN(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); onToast('Preferencia actualizada'); };

  const items = [
    ['cuotasVencer',  'Cuotas próximas a vencer', 'Avisar 3 días antes del vencimiento de cada cuota.'],
    ['cuotasMora',    'Cuotas en mora',           'Notificación diaria mientras la cuota esté vencida.'],
    ['nuevoContrato', 'Nuevo contrato generado',  'Email al equipo cada vez que un asesor genera un paquete.'],
    ['firmaPendiente','Firma pendiente',          'Avisar al asesor si el cliente no firmó tras 48h.'],
    ['semanalCorreo', 'Resumen semanal',          'Reporte de ventas, cobros y pendientes cada lunes.'],
    ['alertasSlack',  'Alertas en Slack',         'Enviar alertas críticas al canal #ventas-mattika.'],
  ];

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Preferencias de notificación</div>
      </div>
      <div>
        {items.map(([k, label, desc], i) => (
          <div key={k} className="hstack gap-12" style={{padding:'14px 18px', borderBottom: i<items.length-1 ? '1px solid var(--hairline)':'none'}}>
            <div className="flex1">
              <div className="strong text-sm">{label}</div>
              <div className="muted text-xs">{desc}</div>
            </div>
            <ToggleBtn checked={n[k]} onChange={(v) => upd(k, v)}/>
          </div>
        ))}
      </div>
    </div>
  );
};

const ToggleBtn = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className={`toggle-btn ${checked ? 'on' : ''}`}>
    <span className="toggle-dot"/>
  </button>
);

const SettingsIntegraciones = ({ onToast }) => {
  const integ = [
    {
      id:'sunarp', name:'SUNARP',
      desc:'Consulta de partidas registrales en tiempo real.',
      status:'Conectado', icon:'shield',
      usadoEn: [
        { label:'Wizard · Paso "Inmueble"',  icon:'building' },
        { label:'Lotes · alta / edición',    icon:'layers' },
      ],
    },
    {
      id:'reniec', name:'RENIEC',
      desc:'Verificación automática de DNI al registrar clientes.',
      status:'Conectado', icon:'user',
      usadoEn: [
        { label:'Wizard · Paso "Comprador"', icon:'users' },
        { label:'Clientes · nuevo cliente', icon:'user' },
      ],
    },
    {
      id:'whatsapp', name:'WhatsApp Business',
      desc:'Envío de documentos y notificaciones por WhatsApp.',
      status:'Conectado', icon:'whatsapp',
      usadoEn: [
        { label:'Preview · botón "Enviar por WhatsApp"', icon:'whatsapp' },
        { label:'Pagos · recordatorios de cuota', icon:'money' },
      ],
    },
    {
      id:'bcp', name:'BCP — Webhook de pagos',
      desc:'Conciliación automática de cuotas con vouchers.',
      status:'Pendiente', icon:'money',
      usadoEn: [
        { label:'Pagos · marcar cuota pagada', icon:'money' },
        { label:'Dashboard · ingresos del mes', icon:'dashboard' },
      ],
    },
    {
      id:'slack', name:'Slack',
      desc:'Alertas en canales internos del equipo.',
      status:'Desconectado', icon:'send',
      usadoEn: [
        { label:'Notificaciones del sistema', icon:'bell' },
        { label:'Excepciones y VB gerencial', icon:'shield' },
      ],
    },
    {
      id:'firma', name:'Llama.pe (firma digital)',
      desc:'Firmas electrónicas con valor legal.',
      status:'Conectado', icon:'signature',
      usadoEn: [
        { label:'Preview · "Solicitar firma digital"', icon:'signature' },
      ],
    },
  ];
  return (
    <div className="vstack gap-8">
      <div className="integ-banner">
        <div className="integ-banner-ic"><Icon name="send" size={18}/></div>
        <div className="flex1">
          <div className="integ-banner-title">¿Dónde se usan las integraciones?</div>
          <div className="integ-banner-desc">
            Cada integración aparece automáticamente en los lugares del sistema donde puede ayudarte.
            Por ejemplo, <b>RENIEC</b> se invoca al escribir un DNI en el wizard; <b>WhatsApp</b> habilita el botón de
            envío en la pantalla del paquete; <b>BCP</b> concilia cuotas en la sección de Pagos. Conecta una sola vez
            y el sistema la usa en todos los flujos relevantes.
          </div>
        </div>
      </div>

      {integ.map(it => (
        <div key={it.id} className="card card-pad hstack gap-14" style={{alignItems:'flex-start'}}>
          <div className="qa-ic" style={{width:42, height:42, marginTop:2}}><Icon name={it.icon} size={18}/></div>
          <div className="flex1">
            <div className="hstack gap-8" style={{marginBottom:2}}>
              <span className="strong">{it.name}</span>
              <span className={`pill ${it.status==='Conectado'?'success':it.status==='Pendiente'?'warn':'outline'}`} style={{marginLeft:0}}>
                <span className="dot"/>{it.status}
              </span>
            </div>
            <div className="muted text-sm">{it.desc}</div>
            {it.usadoEn && it.usadoEn.length > 0 && (
              <div className="integ-used">
                <span className="integ-used-label">Usado en</span>
                {it.usadoEn.map((u, i) => (
                  <span key={i} className="integ-used-chip">
                    <Icon name={u.icon} size={11}/> {u.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button className="btn sm" onClick={() => onToast(it.status === 'Conectado' ? `Configurando ${it.name}...` : `Iniciando conexión con ${it.name}...`)}>
            {it.status === 'Conectado' ? 'Configurar' : 'Conectar'}
          </button>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICACIONES DROPDOWN (campana del topbar)
// ═══════════════════════════════════════════════════════════════
const NotificacionesDropdown = ({ onClose, onGoto }) => {
  const items = [
    { tipo:'mora',    icon:'alert', tone:'danger',  txt:<><b>Renzo Tapia</b> tiene cuota vencida hace 9 días.</>, t:'hace 5 min', goto:() => onGoto('pagos', {filter:'vencida'}) },
    { tipo:'firma',   icon:'signature', tone:'warn', txt:<><b>Andrea Jiménez</b> aún no firma el contrato MTK-2026-0181.</>, t:'hace 2 h', goto:() => onGoto('contracts', {status:'por-firmar'}) },
    { tipo:'pago',    icon:'checkCircle', tone:'success', txt:<>Pago recibido: <b>S/ 4,533.33</b> de Renzo Tapia (cuota 01).</>, t:'hace 4 h', goto:() => onGoto('pagos') },
    { tipo:'nuevo',   icon:'plus',  tone:'brand',   txt:<>Camila generó nuevo paquete <b className="mono">MTK-2026-0184</b>.</>, t:'ayer', goto:() => onGoto('contracts') },
    { tipo:'mora',    icon:'alert', tone:'danger',  txt:<><b>Lucía Ramos</b> tiene cuota vencida hace 4 días.</>, t:'hace 1 día', goto:() => onGoto('pagos', {filter:'vencida'}) },
  ];
  return (
    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="dropdown-head">
        <div className="card-title">Notificaciones</div>
        <button className="btn sm ghost" onClick={onClose}>Marcar todas leídas</button>
      </div>
      <div className="dropdown-body">
        {items.map((it, i) => (
          <button key={i} className={`notif-item tone-${it.tone}`} onClick={() => { it.goto(); onClose(); }}>
            <div className="notif-ic"><Icon name={it.icon} size={14}/></div>
            <div className="flex1">
              <div className="text-sm">{it.txt}</div>
              <div className="muted text-xs">{it.t}</div>
            </div>
            <Icon name="chevronR" size={12} style={{color:'var(--muted-2)'}}/>
          </button>
        ))}
      </div>
      <div className="dropdown-foot">
        <button className="btn sm ghost block" onClick={() => { onGoto('settings'); onClose(); }}>Configurar notificaciones</button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// BUSQUEDA GLOBAL (Cmd+K)
// ═══════════════════════════════════════════════════════════════
const GlobalSearch = ({ onClose, onGoto, onOpenContract }) => {
  const [q, setQ] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => { inputRef.current?.focus(); }, []);
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const results = React.useMemo(() => {
    if (!q.trim()) return null;
    const term = q.toLowerCase();
    const contratos = CONTRATOS_RECIENTES.filter(c => `${c.cliente} ${c.code} ${c.proyecto}`.toLowerCase().includes(term)).slice(0,4);
    const clientes  = CLIENTES_INICIAL.filter(c => `${c.nombres} ${c.apellidos} ${c.dni}`.toLowerCase().includes(term)).slice(0,4);
    return { contratos, clientes };
  }, [q]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="search-overlay" onClick={(e)=>e.stopPropagation()}>
        <div className="search-input">
          <Icon name="search" size={16}/>
          <input ref={inputRef} value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar contratos, clientes, inmuebles..."/>
          <span className="kbd">ESC</span>
        </div>
        <div className="search-results">
          {!results ? (
            <div style={{padding:'30px 18px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
              <div className="hstack gap-12 mb-12" style={{justifyContent:'center', flexWrap:'wrap'}}>
                {[
                  ['Dashboard','dashboard','dashboard'],
                  ['Contratos','contracts','doc'],
                  ['Clientes','clients','users'],
                  ['Inmuebles','inmuebles','building'],
                  ['Pagos','pagos','money'],
                  ['Plantillas','templates','template'],
                ].map(([lbl, r, ic]) => (
                  <button key={r} className="search-quick" onClick={() => { onGoto(r); onClose(); }}>
                    <Icon name={ic} size={13}/> {lbl}
                  </button>
                ))}
              </div>
              <div className="muted text-xs">Escribe para buscar en todo el sistema</div>
            </div>
          ) : (
            <>
              {results.contratos.length > 0 && (
                <div className="search-section">
                  <div className="search-section-label">Contratos</div>
                  {results.contratos.map(c => (
                    <button key={c.id} className="search-row" onClick={() => { onOpenContract(c); onClose(); }}>
                      <Icon name="doc" size={14}/>
                      <div className="flex1">
                        <div className="text-sm strong">{c.cliente}</div>
                        <div className="muted text-xs mono">{c.code} · {c.unidad}</div>
                      </div>
                      <StatusPill status={c.status}/>
                    </button>
                  ))}
                </div>
              )}
              {results.clientes.length > 0 && (
                <div className="search-section">
                  <div className="search-section-label">Clientes</div>
                  {results.clientes.map(c => (
                    <button key={c.id} className="search-row" onClick={() => { onGoto('clients'); onClose(); }}>
                      <Icon name="user" size={14}/>
                      <div className="flex1">
                        <div className="text-sm strong">{c.nombres} {c.apellidos}</div>
                        <div className="muted text-xs">DNI {c.dni} · {c.telefono}</div>
                      </div>
                      <Icon name="chevronR" size={12} style={{color:'var(--muted-2)'}}/>
                    </button>
                  ))}
                </div>
              )}
              {results.contratos.length === 0 && results.clientes.length === 0 && (
                <div style={{padding:'40px 18px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
                  Sin resultados para "<b>{q}</b>".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  CLIENTES_INICIAL, INMUEBLES_INICIAL,
  ScreenClients, ScreenInmuebles, ScreenAsesores, ScreenSettings,
  NotificacionesDropdown, GlobalSearch,
});
