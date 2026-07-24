// screen-wizard.jsx — Asistente paso a paso para generar documentos
// Pasos: Tipo → Titularidad → Comprador(es) → Inmueble → Términos → Revisión

const WIZARD_STEPS = [
  { key:'titular',   label:'Titularidad' },
  { key:'comprador', label:'Comprador' },
  { key:'inmueble',  label:'Inmueble' },
  { key:'terminos',  label:'Términos y cronograma' },
  { key:'revision',  label:'Revisión y generación' },
];

// Mapea un cliente registrado a los campos del formulario de comprador,
// conservando lo que ya tenga la persona cuando el cliente no trae el dato.
function fillPersonaFromCliente(persona, c) {
  return {
    ...persona,
    nombres: c.nombres || '',
    apellidos: c.apellidos || '',
    dni: String(c.dni || ''),
    estadoCivil: c.estadoCivil && c.estadoCivil !== '—' ? c.estadoCivil : persona.estadoCivil,
    ocupacion: c.ocupacion || persona.ocupacion || '',
    telefono: c.telefono || persona.telefono || '',
    email: c.email || persona.email || '',
    domicilio: c.domicilio && c.domicilio !== '—' ? c.domicilio : persona.domicilio || '',
    nacionalidad: c.nacionalidad || persona.nacionalidad || 'Peruana',
    distrito: c.distrito || persona.distrito || '',
    provincia: c.provincia || persona.provincia || '',
    departamento: c.departamento || persona.departamento || '',
  };
}

// Buscador de clientes existentes — por apellido o DNI.
// Al elegir uno, pre-llena el formulario del comprador.
const ClienteBuscador = ({ onPick, label = 'Buscar cliente existente', hint = 'Selecciona un cliente para autocompletar sus datos, o ingrésalos abajo.' }) => {
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const empresaId = window.getSesion?.()?.empresaId;

  // Lista de clientes registrados (manuales + derivados de reservas), fusionados por DNI.
  const clientes = React.useMemo(() => {
    try { return window.deriveClientes?.(empresaId) || []; } catch (e) { return []; }
  }, [empresaId, open]);

  React.useEffect(() => {
    if (!open) return;
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);

  const term = q.trim().toLowerCase();
  const results = term
    ? clientes.filter((c) => {
        const ape = (c.apellidos || '').toLowerCase();
        const nom = (c.nombres || '').toLowerCase();
        const dni = String(c.dni || '');
        return ape.includes(term) || dni.includes(term) || nom.includes(term);
      }).slice(0, 7)
    : clientes.slice(0, 7);

  const pick = (c) => {
    onPick(c);
    setQ(`${c.apellidos || ''}${c.apellidos ? ', ' : ''}${c.nombres || ''}`.trim());
    setOpen(false);
  };

  return (
    <div ref={ref} className="field" style={{ position: 'relative', marginBottom: 16 }}>
      <label className="field-label">{label}</label>
      <div className="search" style={{ width: '100%' }}>
        <Icon name="search" size={14} />
        <input
          placeholder="Buscar por apellido o DNI…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} />
        {q && (
          <button className="icon-btn" style={{ width: 24, height: 24 }} title="Limpiar"
            onClick={() => { setQ(''); setOpen(true); }}>
            <Icon name="x" size={12} />
          </button>
        )}
      </div>
      <div className="field-hint">{hint}</div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% - 14px)', left: 0, right: 0, zIndex: 40,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: 'var(--shadow-md)', overflow: 'hidden', maxHeight: 280, overflowY: 'auto',
        }}>
          {clientes.length === 0 ? (
            <div style={{ padding: '14px 18px', fontSize: 13, color: 'var(--muted)' }}>
              Aún no hay clientes registrados.
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '14px 18px', fontSize: 13, color: 'var(--muted)' }}>
              Sin coincidencias para “{q}”.
            </div>
          ) : (
            results.map((c) => (
              <button key={c.id || c.dni} className="search-row" onClick={() => pick(c)}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                  {`${(c.nombres || ' ')[0]}${(c.apellidos || ' ')[0]}`.toUpperCase()}
                </div>
                <div className="flex1" style={{ minWidth: 0 }}>
                  <div className="strong text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {`${c.apellidos || ''} ${c.nombres || ''}`.trim() || 'Sin nombre'}
                  </div>
                  <div className="muted text-xs">
                    DNI {c.dni || '—'}{c.telefono ? ` · ${c.telefono}` : ''}
                  </div>
                </div>
                {c.derivado && <span className="pill outline" style={{ flexShrink: 0 }}>De reserva</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// One person field-set
const PersonaForm = ({ persona, onChange, label, showBuscador = true }) => {
  const set = (k, v) => onChange({ ...persona, [k]: v });
  const pickCliente = (c) => onChange(fillPersonaFromCliente(persona, c));
  return (
    <div className="card card-pad" style={{background:'var(--surface-2)'}}>
      <div className="hstack between mb-12">
        <div className="card-title">{label}</div>
        <span className="pill outline">Persona natural</span>
      </div>
      {showBuscador && <ClienteBuscador onPick={pickCliente} />}
      <div className="field-group cols-2">
        <div className="field">
          <label className="field-label">Nombres <span className="req">*</span></label>
          <input className="input" placeholder="Ej. Rosa Mercedes" value={persona.nombres||''} onChange={(e)=>set('nombres', e.target.value)}/>
        </div>
        <div className="field">
          <label className="field-label">Apellidos <span className="req">*</span></label>
          <input className="input" placeholder="Ej. Pacheco Arias" value={persona.apellidos||''} onChange={(e)=>set('apellidos', e.target.value)}/>
        </div>
        <div className="field">
          <label className="field-label">DNI <span className="req">*</span></label>
          <input className="input mono" placeholder="00000000" maxLength="8" value={persona.dni||''} onChange={(e)=>set('dni', e.target.value.replace(/\D/g,'').slice(0,8))}/>
        </div>
        <div className="field">
          <label className="field-label">Estado civil</label>
          <select className="select" value={persona.estadoCivil||''} onChange={(e)=>set('estadoCivil', e.target.value)}>
            <option value="">Seleccionar...</option>
            <option>Soltero(a)</option><option>Casado(a)</option>
            <option>Conviviente</option><option>Divorciado(a)</option><option>Viudo(a)</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Ocupación</label>
          <input className="input" placeholder="Ej. Ingeniero civil" value={persona.ocupacion||''} onChange={(e)=>set('ocupacion', e.target.value)}/>
        </div>
        <div className="field">
          <label className="field-label">Teléfono</label>
          <div className="input-prefix">
            <span className="px">+51</span>
            <input placeholder="987 654 321" value={persona.telefono||''} onChange={(e)=>set('telefono', e.target.value)}/>
          </div>
        </div>
        <div className="field">
          <label className="field-label">Correo electrónico</label>
          <input className="input" placeholder="ejemplo@correo.com" value={persona.email||''} onChange={(e)=>set('email', e.target.value)}/>
        </div>
        <div className="field">
          <label className="field-label">Nacionalidad</label>
          <input className="input" placeholder="Peruana" value={persona.nacionalidad||''} onChange={(e)=>set('nacionalidad', e.target.value)}/>
        </div>
        <div className="field" style={{gridColumn:'1 / -1'}}>
          <label className="field-label">Domicilio <span className="req">*</span></label>
          <input className="input" placeholder="Av./Jr./Calle y número" value={persona.domicilio||''} onChange={(e)=>set('domicilio', e.target.value)}/>
        </div>
      </div>
      <div style={{marginTop:12}}>
        <UbigeoFields value={{departamento: persona.departamento, provincia: persona.provincia, distrito: persona.distrito}}
                      onChange={(patch) => onChange({ ...persona, ...patch })}/>
      </div>
    </div>
  );
};

const ScreenWizard = ({ initialData, onCancel, onGenerate, asesores }) => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [titularidad, setTitularidad] = React.useState(initialData?.titularidad || 'unico');
  const [compradorA, setCompradorA] = React.useState({
    nombres:'', apellidos:'', dni:'',
    estadoCivil:'Soltero(a)', telefono:'', ocupacion:'',
    email:'', domicilio:'',
    nacionalidad:'Peruana', distrito:'', provincia:'', departamento:'',
    ...(initialData?.compradorA || {}),
  });
  const [compradorB, setCompradorB] = React.useState({
    nombres:'', apellidos:'', dni:'',
    estadoCivil:'Casado(a)', telefono:'', ocupacion:'',
    email:'', domicilio:'',
    nacionalidad:'Peruana', distrito:'', provincia:'', departamento:'',
    ...(initialData?.compradorB || {}),
  });
  // Datos del matrimonio (cónyuge / separación de bienes) y cuotas ideales (copropietarios)
  const [matrimonio, setMatrimonio] = React.useState({
    fecha:'2018-04-21', lugar:'Municipalidad de San Isidro, Lima', escritura:'',
    ...(initialData?.matrimonio || {}),
  });
  const [cuotasIdeales, setCuotasIdeales] = React.useState({
    a:50, b:50,
    ...(initialData?.cuotasIdeales || {}),
  });
  const [inmueble, setInmueble] = React.useState({
    proyecto: (window.getProyectoActual?.()?.nombre) || 'Nápoles Condominio Club',
    tipoInmueble:'Lote',
    unidad:'7',
    manzana:'C',
    direccion:'Valle Chicama, Predio Mocan, Sector La Arenita U.C. 1900',
    distrito:'Rázuri', provincia:'Ascope', departamento:'La Libertad',
    estadoRegistral:'matriz',
    partida:'11550511',
    partidaIndependizada:'',
    area:'140',
    linderoNorte:'', linderoSur:'', linderoEste:'', linderoOeste:'',
    ...(initialData?.inmueble || {}),
  });
  const [terminos, setTerminos] = React.useState({
    precio: 17100,
    inicial: 3500,
    inicialFraccionada: false,
    pagosIniciales: [
      { etiqueta:'Separación', monto: 500, fecha: '2026-05-15', voucher: '', banco:'BCP', cuenta:'570-7307941059', cci:'00257000730794105917' },
      { etiqueta:'Inicial 1',  monto: 1500, fecha: '2026-06-15', voucher: '', banco:'BCP', cuenta:'570-7307941059', cci:'00257000730794105917' },
      { etiqueta:'Inicial 2',  monto: 1500, fecha: '2026-07-15', voucher: '', banco:'BCP', cuenta:'570-7307941059', cci:'00257000730794105917' },
    ],
    modoCuotas: 'personalizadas',
    contado: false,
    cuotas: 3,
    primeraCuota: '2026-05-31',
    cuotasPersonalizadas: [
      { monto: 2000, fecha: '2026-05-31' },
      { monto: 2000, fecha: '2026-06-30' },
      { monto: 9600, fecha: '2026-07-31' },
    ],
    formaPago: 'Depósito bancario',
    bancoNombre: 'BCP',
    bancoCuenta: '570-7307941059',
    cci: '',
    numOperacion: '',
    plazoEntrega: '12.2027',
    penalidadDiaria: 30,
    porcLucroCesante: 30,
    ...(initialData?.terminos || {}),
  });
  const asesoresEmpresa = (window.getAsesoresEmpresa && window.getAsesoresEmpresa()) || ASESORES;
  // El rol Asesor queda fijado como responsable de su propia venta (no elige a otros).
  const _asesorRestringido = window.esAsesorRestringido?.();
  const _miUsuarioId = window.getUsuarioId?.();
  const [meta, setMeta] = React.useState({
    asesorId: (initialData?.meta?.asesorId)
      || (_asesorRestringido ? _miUsuarioId : (asesoresEmpresa[0] && asesoresEmpresa[0].id))
      || 'me',
    plantilla: 'tpl-1',
    fechaContrato: new Date().toISOString().slice(0,10),
    lugarFirma: 'Trujillo',
    notas: '',
    ...(initialData?.meta || {}),
  });

  const cronograma = React.useMemo(() => generarCronograma(terminos), [terminos]);
  // Proyectos reales de la empresa (no la lista de lotes-admin). Fallback al catálogo base.
  const proyectosEmpresa = React.useMemo(() => {
    const ps = window.getEmpresaActual?.()?.proyectos || [];
    const names = ps.map(p => p.nombre || p.name).filter(Boolean);
    if (names.length) return names;
    return (window.PROYECTOS || []).map(p => typeof p === 'string' ? p : (p.name || p.nombre)).filter(Boolean);
  }, []);
  // Lotes del inventario del proyecto/etapa activos, para vincular la venta.
  const lotesInventario = React.useMemo(() => {
    try {
      const scope = window.getScopeKey?.() || '';
      const arr = JSON.parse(localStorage.getItem('mattika.lotes-admin.v1.' + scope) || '[]');
      return { scope, lotes: Array.isArray(arr) ? arr : [] };
    } catch (e) { return { scope: '', lotes: [] }; }
  }, []);
  // Filtro de la zona de vinculación de lotes
  const [loteFiltro, setLoteFiltro] = React.useState('');
  const [loteSoloDisp, setLoteSoloDisp] = React.useState(true);
  const lotesFiltrados = React.useMemo(() => {
    const q = loteFiltro.trim().toLowerCase();
    return lotesInventario.lotes.filter(l => {
      if (loteSoloDisp && l.estado === 'Vendido') return false;
      if (!q) return true;
      const id = String(l.id || l.codigo || '').toLowerCase();
      const mz = String(l.manzana || '').toLowerCase();
      const num = String(l.numero != null ? l.numero : (l.unidad != null ? l.unidad : '')).toLowerCase();
      return id.includes(q) || mz.includes(q) || num.includes(q) || `${mz}${num}`.includes(q) || `mz ${mz}`.includes(q);
    });
  }, [lotesInventario, loteFiltro, loteSoloDisp]);
  const nDocs = React.useMemo(() => {
    try { return (window.docTypesForPack?.(window.loadTemplate?.()) || []).length || 6; }
    catch (e) { return 6; }
  }, []);

  // Mantener saldo consistente: si cambia precio o inicial, regenerar última cuota
  React.useEffect(() => {
    if (terminos.modoCuotas !== 'personalizadas') return;
    const saldo = terminos.precio - terminos.inicial;
    const otras = terminos.cuotasPersonalizadas.slice(0, -1).reduce((s, c) => s + (+c.monto || 0), 0);
    const ultima = +(saldo - otras).toFixed(2);
    const last = terminos.cuotasPersonalizadas[terminos.cuotasPersonalizadas.length - 1];
    if (last && Math.abs((+last.monto || 0) - ultima) > 0.01) {
      const updated = [...terminos.cuotasPersonalizadas];
      updated[updated.length - 1] = { ...updated[updated.length - 1], monto: ultima };
      setTerminos({ ...terminos, cuotasPersonalizadas: updated });
    }
    // eslint-disable-next-line
  }, [terminos.precio, terminos.inicial]);

  // Si la inicial es fraccionada, el total inicial = suma de los pagos parciales
  React.useEffect(() => {
    if (!terminos.inicialFraccionada) return;
    const sum = +((terminos.pagosIniciales || []).reduce((s, p) => s + (+p.monto || 0), 0)).toFixed(2);
    if (Math.abs(sum - (+terminos.inicial || 0)) > 0.001) {
      setTerminos(t => ({ ...t, inicial: sum }));
    }
    // eslint-disable-next-line
  }, [terminos.inicialFraccionada, terminos.pagosIniciales]);

  // Autocompletar cuenta bancaria y CCI del proyecto (medio de pago del depósito).
  React.useEffect(() => {
    const datos = window.getProyectoDatos?.(inmueble.proyecto);
    const cuentas = (datos && datos.cuentas) || [];
    if (!cuentas.length) return;
    const match = cuentas.find(c => c.cuenta === terminos.bancoCuenta);
    if (match) {
      if ((terminos.cci || '') !== (match.cci || '') || terminos.bancoNombre !== match.banco) {
        setTerminos(t => ({ ...t, bancoNombre: match.banco, cci: match.cci || '' }));
      }
    } else {
      const c0 = cuentas[0];
      setTerminos(t => ({ ...t, bancoNombre: c0.banco, bancoCuenta: c0.cuenta, cci: c0.cci || '' }));
    }
    // eslint-disable-next-line
  }, [inmueble.proyecto]);

  const next = () => setStepIdx((i) => Math.min(WIZARD_STEPS.length - 1, i + 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const isCopropietarios = ['copropietarios','conyuge','separacion-bienes'].includes(titularidad);
  const cur = WIZARD_STEPS[stepIdx];

  // ── Validación de campos obligatorios por paso ──
  const [showErrors, setShowErrors] = React.useState(false);
  const dni8 = (s) => /^\d{8}$/.test(String(s || '').trim());
  const stepErrors = (key) => {
    const e = [];
    if (key === 'comprador') {
      if (!compradorA.nombres.trim()) e.push('Nombres del comprador');
      if (!compradorA.apellidos.trim()) e.push('Apellidos del comprador');
      if (!dni8(compradorA.dni)) e.push('DNI del comprador (8 dígitos)');
      if (isCopropietarios) {
        const lbl = titularidad === 'copropietarios' ? 'Comprador 2' : 'cónyuge';
        if (!compradorB.nombres.trim()) e.push(`Nombres del ${lbl}`);
        if (!compradorB.apellidos.trim()) e.push(`Apellidos del ${lbl}`);
        if (!dni8(compradorB.dni)) e.push(`DNI del ${lbl} (8 dígitos)`);
        if (titularidad === 'copropietarios' && (Number(cuotasIdeales.a) + Number(cuotasIdeales.b) !== 100))
          e.push('Las cuotas ideales deben sumar 100%');
      }
    }
    if (key === 'inmueble') {
      if (!String(inmueble.proyecto || '').trim()) e.push('Proyecto');
      if (!String(inmueble.unidad || '').trim()) e.push('Unidad / lote');
      if (!String(inmueble.partida || '').trim()) e.push('Partida matriz');
      if (inmueble.estadoRegistral === 'independizada' && !String(inmueble.partidaIndependizada || '').trim())
        e.push('Partida independizada del lote');
    }
    if (key === 'terminos') {
      if (!(Number(terminos.precio) > 0)) e.push('Precio mayor a 0');
      if (Number(terminos.inicial) < 0 || Number(terminos.inicial) > Number(terminos.precio))
        e.push('Cuota inicial válida (entre 0 y el precio)');
    }
    return e;
  };
  const curErrors = stepErrors(cur.key);
  const allValid = ['comprador', 'inmueble', 'terminos'].every(k => stepErrors(k).length === 0);
  const firstBadStep = ['comprador', 'inmueble', 'terminos'].find(k => stepErrors(k).length > 0);

  const tryNext = () => {
    if (curErrors.length) { setShowErrors(true); return; }
    setShowErrors(false);
    next();
  };
  const goBack = () => { setShowErrors(false); back(); };
  const tryGenerate = () => {
    if (!allValid) {
      setShowErrors(true);
      const idx = WIZARD_STEPS.findIndex(s => s.key === firstBadStep);
      if (idx >= 0) setStepIdx(idx);
      return;
    }
    onGenerate({
      titularidad, compradorA, compradorB: isCopropietarios ? compradorB : null,
      matrimonio: (titularidad === 'conyuge' || titularidad === 'separacion-bienes') ? matrimonio : null,
      cuotasIdeales: titularidad === 'copropietarios' ? cuotasIdeales : null,
      inmueble, terminos, meta, cronograma,
      id: initialData?.id, code: initialData?.code, status: initialData?.status,
    });
  };

  return (
    <div className="page" data-screen-label="Wizard nuevo contrato" style={{maxWidth:1180}}>
      <div className="page-head">
        <div>
          <div className="hstack gap-8" style={{color:'var(--muted)', fontSize:12.5, marginBottom:4}}>
            <Icon name={initialData?.id ? 'edit' : 'plus'} size={12}/> {initialData?.id ? `Editar venta ${initialData.code || ''}` : 'Nueva venta'}
          </div>
          <h1 className="page-title">{initialData?.id ? 'Editar venta' : 'Nueva venta'} · {nDocs} documentos</h1>
          <div className="page-sub">Paso {stepIdx+1} de {WIZARD_STEPS.length} · {cur.label}</div>
        </div>
        <button className="btn ghost" onClick={onCancel}>
          <Icon name="x" size={14}/> Cancelar
        </button>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.key} className={`step ${i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}`}>
            <div className="step-num">{i < stepIdx ? <Icon name="check" size={12}/> : i+1}</div>
            <div className="step-label">
              <small>Paso {String(i+1).padStart(2,'0')}</small>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="card card-pad" style={{padding:'24px 28px'}}>
        {/* STEP 1 — TITULARIDAD */}
        {cur.key === 'titular' && (
          <>
            <div className="docs-banner mb-16">
              <div className="hstack gap-10" style={{alignItems:'center'}}>
                <div className="qa-ic" style={{width:38, height:38}}><Icon name="layers" size={18}/></div>
                <div className="flex1">
                  <div style={{fontWeight:600, color:'var(--ink)'}}>Cada venta genera {nDocs} documentos</div>
                  <div className="muted text-sm">Separación · Compraventa · Cronograma de Pagos · Acta de Separación · Tratamiento de Datos · Declaración Jurada</div>
                </div>
                <span className="pill accent">1 venta = 6 docs</span>
              </div>
            </div>
            <div className="card-title mb-8">Régimen de titularidad</div>
            <div className="page-sub mb-16">Determina cuántos compradores y qué cláusulas se incluyen en el contrato.</div>
            <div className="tcard-grid">
              {TITULARIDAD_OPTS.map((o) => (
                <div key={o.id} className={`tcard ${titularidad===o.id?'selected':''}`} onClick={()=>setTitularidad(o.id)}>
                  <div className="tcard-top">
                    <div className="tcard-ic"><Icon name={o.icon} size={20}/></div>
                    <div className="flex1">
                      <div className="tcard-title">{o.label}</div>
                      <div className="tcard-desc">{o.desc}</div>
                    </div>
                    <div className="tcard-check">
                      {titularidad===o.id && <Icon name="check" size={12}/>}
                    </div>
                  </div>
                  <div className="tcard-foot">
                    <span className="tcard-meta"><Icon name={o.compradores>1?'users':'user'} size={13}/> {o.tag}</span>
                    <span className="tcard-meta"><Icon name="doc" size={13}/> {nDocs} documentos</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-24" style={{padding:14, background:'var(--brand-50)', borderRadius:10, fontSize:13, color:'var(--brand-ink)', display:'flex', gap:10, alignItems:'flex-start'}}>
              <Icon name="alert" size={16} style={{marginTop:2}}/>
              <div>
                {titularidad==='unico' && <span>Se ingresarán los datos de <b>un (1) comprador</b>.</span>}
                {titularidad==='copropietarios' && <span>Se ingresarán los datos de <b>dos (2) copropietarios</b>. Podrás indicar el porcentaje de cuota ideal de cada uno.</span>}
                {titularidad==='conyuge' && <span>Se ingresarán los datos de <b>ambos cónyuges bajo sociedad de gananciales</b>. La cláusula incluirá la mención del matrimonio.</span>}
                {titularidad==='separacion-bienes' && <span>Se ingresarán los datos de <b>ambos cónyuges con separación de patrimonios</b>. Se hará referencia a la escritura pública correspondiente.</span>}
              </div>
            </div>
            <div className="mt-24 vstack gap-8" style={{maxWidth:520}}>
              <div className="card-title">Asesor responsable</div>
              <select className="select" value={meta.asesorId} disabled={_asesorRestringido}
                      onChange={(e)=>setMeta({...meta, asesorId: e.target.value})}>
                {asesoresEmpresa.map(a => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
              </select>
              {_asesorRestringido && (
                <div className="muted text-sm">Como asesor, esta venta queda registrada a tu nombre.</div>
              )}
            </div>
          </>
        )}

        {/* STEP 3 — COMPRADOR(ES) */}
        {cur.key === 'comprador' && (
          <>
            <div className="card-title mb-12">{isCopropietarios ? 'Datos de los compradores' : 'Datos del comprador'}</div>
            <div className="vstack gap-16">
              {isCopropietarios && (
                <div className="card card-pad" style={{background:'var(--brand-50)', border:'1px solid var(--brand)'}}>
                  <div className="hstack gap-10" style={{alignItems:'center', marginBottom:4}}>
                    <Icon name="users" size={16} style={{color:'var(--brand-ink)'}}/>
                    <div className="card-title" style={{color:'var(--brand-ink)'}}>Vincular 2 clientes existentes</div>
                  </div>
                  <div className="page-sub mb-12">Elige dos clientes ya registrados para autocompletar ambos compradores de una vez. También puedes editarlos abajo.</div>
                  <div className="field-group cols-2">
                    <ClienteBuscador label="Comprador 1" hint="Apellido o DNI"
                      onPick={(c)=>setCompradorA(fillPersonaFromCliente(compradorA, c))}/>
                    <ClienteBuscador label="Comprador 2" hint="Apellido o DNI"
                      onPick={(c)=>setCompradorB(fillPersonaFromCliente(compradorB, c))}/>
                  </div>
                </div>
              )}
              <PersonaForm persona={compradorA} onChange={setCompradorA} showBuscador={!isCopropietarios} label={isCopropietarios ? 'Comprador 1' : 'Comprador'}/>
              {isCopropietarios && (
                <PersonaForm persona={compradorB} onChange={setCompradorB} showBuscador={false} label="Comprador 2"/>
              )}
              {titularidad==='copropietarios' && (
                <div className="card card-pad" style={{background:'var(--surface-2)'}}>
                  <div className="card-title mb-12">Cuotas ideales</div>
                  <div className="field-group cols-2">
                    <div className="field">
                      <label className="field-label">% Comprador 1</label>
                      <div className="input-prefix">
                        <input type="number" min="0" max="100" value={cuotasIdeales.a}
                          onChange={(e)=>{ const a=Math.max(0,Math.min(100,+e.target.value||0)); setCuotasIdeales({a, b:100-a}); }}/>
                        <span className="px">%</span>
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">% Comprador 2</label>
                      <div className="input-prefix">
                        <input type="number" min="0" max="100" value={cuotasIdeales.b}
                          onChange={(e)=>{ const b=Math.max(0,Math.min(100,+e.target.value||0)); setCuotasIdeales({a:100-b, b}); }}/>
                        <span className="px">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="field-hint mt-4">Las cuotas ideales deben sumar 100%. Aparecen como cláusula en el contrato.</div>
                </div>
              )}
              {(titularidad==='conyuge' || titularidad==='separacion-bienes') && (
                <div className="card card-pad" style={{background:'var(--surface-2)'}}>
                  <div className="card-title mb-12">Datos del matrimonio</div>
                  <div className="field-group cols-2">
                    <div className="field">
                      <label className="field-label">Fecha de matrimonio</label>
                      <input className="input" type="date" value={matrimonio.fecha} onChange={(e)=>setMatrimonio({...matrimonio, fecha:e.target.value})}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Lugar de matrimonio</label>
                      <input className="input" value={matrimonio.lugar} onChange={(e)=>setMatrimonio({...matrimonio, lugar:e.target.value})}/>
                    </div>
                    {titularidad==='separacion-bienes' && (
                      <div className="field" style={{gridColumn:'1 / -1'}}>
                        <label className="field-label">Escritura pública de separación de bienes</label>
                        <input className="input" placeholder="Notaría, fecha, kárdex" value={matrimonio.escritura} onChange={(e)=>setMatrimonio({...matrimonio, escritura:e.target.value})}/>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* STEP 4 — INMUEBLE */}
        {cur.key === 'inmueble' && (
          <>
            <div className="card-title mb-12">Datos del inmueble</div>
            {lotesInventario.lotes.length > 0 && (
              <div className="card card-pad mb-16" style={{background:'var(--brand-50)', border:'1px solid var(--brand-100)'}}>
                <div className="hstack gap-10" style={{alignItems:'center', marginBottom:6}}>
                  <Icon name="layers" size={16} style={{color:'var(--brand-ink)'}}/>
                  <div className="card-title" style={{color:'var(--brand-ink)'}}>Vincular lote del inventario</div>
                </div>
                <div className="page-sub mb-8">Elige un lote del proyecto para autocompletar manzana, unidad, área y precio. Al generar, la venta queda amarrada al Plano y el lote se marca como vendido.</div>
                {/* Zona de filtro de lotes */}
                <div className="hstack gap-8 mb-8" style={{flexWrap:'wrap'}}>
                  <div className="input-prefix" style={{flex:'1 1 220px', background:'white'}}>
                    <span className="px"><Icon name="search" size={13}/></span>
                    <input placeholder="Filtrar por manzana o número (ej. H15, C, 7)" value={loteFiltro}
                           onChange={(e)=>setLoteFiltro(e.target.value)}/>
                  </div>
                  <label className="hstack gap-6" style={{cursor:'pointer', whiteSpace:'nowrap', fontSize:13, color:'var(--brand-ink)'}}>
                    <input type="checkbox" checked={loteSoloDisp} onChange={(e)=>setLoteSoloDisp(e.target.checked)}/>
                    <span>Solo disponibles</span>
                  </label>
                  <span className="pill outline" style={{alignSelf:'center'}}>{lotesFiltrados.length} lote{lotesFiltrados.length===1?'':'s'}</span>
                </div>
                <select className="select" value={inmueble.loteId || ''} onChange={(e) => {
                  const id = e.target.value;
                  const l = lotesInventario.lotes.find(x => String(x.id || x.codigo) === id);
                  if (!l) { setInmueble({...inmueble, loteId:'', scope:''}); return; }
                  setInmueble({
                    ...inmueble,
                    loteId: String(l.id || l.codigo), scope: lotesInventario.scope,
                    manzana: l.manzana || inmueble.manzana,
                    unidad: String(l.numero != null ? l.numero : (l.unidad != null ? l.unidad : inmueble.unidad)),
                    area: String(l.m2 != null ? l.m2 : (l.area != null ? l.area : inmueble.area)),
                  });
                  if (l.precio) setTerminos(t => ({ ...t, precio: l.precio, inicial: Math.min(+t.inicial || 0, l.precio) }));
                }}>
                  <option value="">— Sin vincular (ingresar manual) —</option>
                  {lotesFiltrados.map(l => {
                    const id = String(l.id || l.codigo);
                    return <option key={id} value={id} disabled={l.estado === 'Vendido'}>
                      Mz {l.manzana} · Lote {l.numero != null ? l.numero : l.unidad} · {l.m2 != null ? l.m2 : l.area} m² · S/{fmtSoles(l.precio || 0)}{l.estado === 'Vendido' ? ' (vendido)' : ''}
                    </option>;
                  })}
                </select>
                {inmueble.loteId && <div className="field-hint mt-4" style={{color:'var(--brand-ink)'}}>Lote {inmueble.loteId} vinculado — al generar se marcará como vendido en Plano y Lotes.</div>}
              </div>
            )}
            <div className="hstack between mb-16" style={{flexWrap:'wrap', gap:12, alignItems:'flex-start'}}>
              <div className="muted text-sm" style={{maxWidth:600, display:'flex', gap:7, alignItems:'flex-start'}}>
                <Icon name="info" size={14} style={{marginTop:1, flexShrink:0}}/>
                <span>Mientras el lote aún <b>no esté independizado</b>, el contrato usa los datos de la <b>partida matriz</b> (el predio madre). Cuando SUNARP independice el lote, cambia a <b>Lote independizado</b> e ingresa su partida propia.</span>
              </div>
              <Tabs value={inmueble.estadoRegistral || 'matriz'}
                onChange={(v) => setInmueble({...inmueble, estadoRegistral: v})}
                options={[
                  {id:'matriz', label:'Partida matriz'},
                  {id:'independizada', label:'Lote independizado'},
                ]}/>
            </div>
            <div className="field-group cols-3">
              <div className="field">
                <label className="field-label">Proyecto</label>
                <select className="select" value={inmueble.proyecto} onChange={(e)=>{
                  const nm = e.target.value;
                  const d = window.getProyectoDatos?.(nm);
                  setInmueble(prev => ({
                    ...prev, proyecto: nm,
                    ...(d ? {
                      partida: d.partida ?? prev.partida,
                      direccion: d.direccion ?? prev.direccion,
                      distrito: d.distrito ?? prev.distrito,
                      provincia: d.provincia ?? prev.provincia,
                      departamento: d.departamento ?? prev.departamento,
                      tipoInmueble: d.tipoInmueble || prev.tipoInmueble,
                    } : {}),
                  }));
                  // Autocompletar cuenta bancaria del proyecto (primera)
                  if (d && d.cuentas && d.cuentas[0]) {
                    const c = d.cuentas[0];
                    setTerminos(t => ({ ...t, bancoNombre: c.banco, bancoCuenta: c.cuenta, cci: c.cci || '' }));
                  }
                }}>
                  {(proyectosEmpresa.includes(inmueble.proyecto) || !inmueble.proyecto ? proyectosEmpresa : [inmueble.proyecto, ...proyectosEmpresa]).map((nm, i) => <option key={i} value={nm}>{nm}</option>)}
                </select>
                {window.getProyectoDatos?.(inmueble.proyecto) && (
                  <div className="field-hint">Partida, dirección y ubicación cargadas del proyecto · cambia solo unidad, manzana y área</div>
                )}
              </div>
              <div className="field">
                <label className="field-label">Tipo</label>
                <select className="select" value={inmueble.tipoInmueble} onChange={(e)=>setInmueble({...inmueble, tipoInmueble:e.target.value})}>
                  <option>Lote</option><option>Casa</option><option>Departamento</option><option>Local comercial</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Unidad / Nº</label>
                <input className="input" value={inmueble.unidad} onChange={(e)=>setInmueble({...inmueble, unidad:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">Manzana</label>
                <input className="input" value={inmueble.manzana} onChange={(e)=>setInmueble({...inmueble, manzana:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">N° de partida matriz <span className="req">*</span></label>
                <div className="input-prefix">
                  <span className="px">P-</span>
                  <input value={inmueble.partida} onChange={(e)=>setInmueble({...inmueble, partida:e.target.value})}/>
                </div>
                <div className="field-hint">Partida madre del predio · SUNARP</div>
              </div>
              {inmueble.estadoRegistral === 'independizada' && (
                <div className="field">
                  <label className="field-label">N° de partida independizada <span className="req">*</span></label>
                  <div className="input-prefix">
                    <span className="px">P-</span>
                    <input value={inmueble.partidaIndependizada||''} onChange={(e)=>setInmueble({...inmueble, partidaIndependizada:e.target.value})}/>
                  </div>
                  <div className="field-hint">Partida propia del lote independizado</div>
                </div>
              )}
              <div className="field">
                <label className="field-label">Área total (m²)</label>
                <div className="input-prefix"><input value={inmueble.area} onChange={(e)=>setInmueble({...inmueble, area:e.target.value})}/><span className="px">m²</span></div>
              </div>
              <div className="field" style={{gridColumn:'1 / -1'}}>
                <label className="field-label">Dirección completa <span className="req">*</span></label>
                <input className="input" value={inmueble.direccion} onChange={(e)=>setInmueble({...inmueble, direccion:e.target.value})}/>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <UbigeoFields value={{departamento: inmueble.departamento, provincia: inmueble.provincia, distrito: inmueble.distrito}}
                            onChange={(patch)=>setInmueble({...inmueble, ...patch})}/>
            </div>

            {inmueble.estadoRegistral === 'independizada' && (
              <>
                <div className="mt-24 card-title mb-12">Linderos y medidas perimétricas</div>
                <div className="field-group cols-2">
                  {[
                    ['Norte','linderoNorte'],['Sur','linderoSur'],
                    ['Este','linderoEste'],['Oeste','linderoOeste'],
                  ].map(([lbl, key]) => (
                    <div key={key} className="field">
                      <label className="field-label">Por el {lbl.toLowerCase()}</label>
                      <input className="input" value={inmueble[key]} onChange={(e)=>setInmueble({...inmueble, [key]:e.target.value})}/>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* STEP 5 — TERMINOS */}
        {cur.key === 'terminos' && (
          <>
            <div className="card-title mb-12">Términos económicos</div>
            <div className="card card-pad mb-12" style={{background:'var(--surface-2)'}}>
              <label className="field-label" style={{marginBottom:8, display:'block'}}>Tipo de compra</label>
              <Tabs value={terminos.contado ? 'contado' : 'financiado'}
                onChange={(v) => setTerminos({...terminos, contado: v === 'contado'})}
                options={[
                  {id:'financiado', label:'Con financiamiento'},
                  {id:'contado', label:'Al contado'},
                ]}/>
              <div className="field-hint mt-4">
                {terminos.contado
                  ? 'Pago total al firmar. El contrato no incluye saldo, cronograma ni cláusula de mora; se agrega la constancia de cancelación íntegra.'
                  : 'Inicial + saldo financiado en cuotas, con cronograma y cláusula de mora.'}
              </div>
            </div>
            <div className="field-group cols-3">
              <div className="field">
                <label className="field-label">Precio total</label>
                <div className="input-prefix">
                  <span className="px">S/</span>
                  <input type="number" value={terminos.precio} onChange={(e)=>setTerminos({...terminos, precio:+e.target.value})}/>
                </div>
                <div className="field-hint">{numeroALetras(terminos.precio).toLowerCase()}</div>
              </div>
              <div className="field">
                <label className="field-label">Cuota inicial{terminos.inicialFraccionada ? ' (total)' : ''}</label>
                <div className="input-prefix" style={terminos.inicialFraccionada ? {background:'var(--surface-2)'} : null}>
                  <span className="px">S/</span>
                  <input type="number" value={terminos.inicial} readOnly={terminos.inicialFraccionada}
                    style={terminos.inicialFraccionada ? {background:'transparent', color:'var(--muted)'} : null}
                    onChange={(e)=>setTerminos({...terminos, inicial:+e.target.value})}/>
                </div>
                <div className="field-hint">
                  {terminos.inicialFraccionada
                    ? `Suma de ${(terminos.pagosIniciales||[]).length} pagos fraccionados`
                    : `${Math.round((terminos.inicial / terminos.precio) * 100)}% del precio — pagado al firmar`}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Saldo a financiar</label>
                <div className="input-prefix" style={{background:'var(--surface-2)'}}>
                  <span className="px">S/</span>
                  <input readOnly value={fmtSoles(terminos.precio - terminos.inicial)} style={{background:'transparent', color:'var(--muted)'}}/>
                </div>
              </div>
            </div>

            {/* Forma de pago de la cuota inicial */}
            <div className="mt-24 hstack between mb-12" style={{flexWrap:'wrap', gap:10}}>
              <div>
                <div className="card-title">Pago de la cuota inicial</div>
                <div className="muted text-sm">¿La inicial se paga de una vez o fraccionada en varios depósitos (separación + inicial 1 + inicial 2…)?</div>
              </div>
              <Tabs value={terminos.inicialFraccionada ? 'fraccionada' : 'unico'}
                onChange={(v) => {
                  const frac = v === 'fraccionada';
                  setTerminos(t => {
                    if (frac && (!t.pagosIniciales || t.pagosIniciales.length === 0)) {
                      const tot = +t.inicial || 0;
                      const sep = Math.round(tot * 0.2);
                      return { ...t, inicialFraccionada:true, pagosIniciales: [
                        { etiqueta:'Separación', monto: sep, fecha: t.primeraCuota || new Date().toISOString().slice(0,10), voucher:'' },
                        { etiqueta:'Inicial 1', monto: tot - sep, fecha: '', voucher:'' },
                      ]};
                    }
                    return { ...t, inicialFraccionada: frac };
                  });
                }}
                options={[
                  {id:'unico', label:'Un solo pago'},
                  {id:'fraccionada', label:'Inicial fraccionada'},
                ]}/>
            </div>

            {/* Cuenta de destino / medio de pago — solo para pago único (auto N° cuenta y CCI) */}
            {!terminos.inicialFraccionada && (() => {
              const datos = window.getProyectoDatos?.(inmueble.proyecto);
              const cuentas = (datos && datos.cuentas) || [];
              const activa = cuentas.findIndex(c => c.cuenta === terminos.bancoCuenta);
              const esYape = /yape|plin/i.test(terminos.bancoNombre || '');
              return (
                <div className="card card-pad mb-12" style={{background:'var(--surface-2)'}}>
                  <div className="card-title">Cuenta de destino{cuentas.length ? ` · ${inmueble.proyecto}` : ''}</div>
                  <div className="muted text-sm mb-12">Elige a qué cuenta o medio de pago del proyecto se depositó la inicial. El N° de cuenta y el CCI se completan solos.</div>
                  {cuentas.length > 0 && (
                    <div className="hstack gap-8 mb-12" style={{flexWrap:'wrap'}}>
                      {cuentas.map((c, i) => (
                        <button key={i} type="button"
                          className={`acct-chip${activa === i ? ' on' : ''}`}
                          onClick={() => setTerminos(t => ({ ...t, bancoNombre: c.banco, bancoCuenta: c.cuenta, cci: c.cci || '' }))}>
                          <span className="acct-bank">{c.banco}{c.moneda ? ` · ${c.moneda}` : ''}</span>
                          <span className="acct-num">{c.cuenta}</span>
                          <span className="acct-cci">{c.cci ? `CCI ${c.cci}` : (/yape|plin/i.test(c.banco) ? 'Billetera móvil' : '—')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="field-group cols-3">
                    <div className="field">
                      <label className="field-label">Medio de pago / banco</label>
                      <input className="input" readOnly value={terminos.bancoNombre} style={{background:'var(--surface)', color:'var(--muted)'}}/>
                    </div>
                    <div className="field">
                      <label className="field-label">{esYape ? 'N° de celular' : 'N° de cuenta'}</label>
                      <input className="input mono" readOnly value={terminos.bancoCuenta} style={{background:'var(--surface)', color:'var(--muted)'}}/>
                    </div>
                    <div className="field">
                      <label className="field-label">CCI</label>
                      <input className="input mono" readOnly value={terminos.cci || '—'} style={{background:'var(--surface)', color:'var(--muted)'}}/>
                    </div>
                    {!terminos.inicialFraccionada && (
                      <div className="field">
                        <label className="field-label">N° operación / voucher</label>
                        <input className="input mono" placeholder="Ej. 01771739" value={terminos.numOperacion} onChange={(e)=>setTerminos({...terminos, numOperacion:e.target.value})}/>
                        <div className="field-hint">Del depósito de la cuota inicial</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {terminos.inicialFraccionada && (() => {
              const cuentasProy = (window.getProyectoDatos?.(inmueble.proyecto)?.cuentas) || [];
              const setRow = (i, patch) => { const arr=[...terminos.pagosIniciales]; arr[i]={...arr[i], ...patch}; setTerminos({...terminos, pagosIniciales:arr}); };
              return (
              <div className="card mb-12" style={{background:'var(--surface-2)', overflow:'hidden'}}>
                <div style={{padding:'10px 14px 0'}}>
                  <div className="muted text-sm">Cada pago puede depositarse a una cuenta distinta (p. ej. separación por Yape, inicial 1 por BCP, inicial 2 por Interbank).</div>
                </div>
                <table className="crono-tbl" style={{tableLayout:'fixed', width:'100%'}}>
                  <thead><tr>
                    <th style={{width:'15%'}}>Concepto</th>
                    <th style={{width:'18%'}}>Medio de pago / cuenta</th>
                    <th style={{width:'15%'}}>Fecha</th>
                    <th className="num" style={{width:'13%'}}>Monto S/</th>
                    <th>N° operación / voucher</th>
                    <th style={{width:'11%'}}>Pagado</th>
                    <th style={{width:36}}></th>
                  </tr></thead>
                  <tbody>
                    {terminos.pagosIniciales.map((p, i) => {
                      const CONCEPTOS = ['Separación','Inicial 1','Inicial 2','Inicial 3','Inicial 4','Inicial 5','Inicial 6'];
                      const hoyStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
                      const futura = !p.fecha || p.fecha > hoyStr;
                      return (
                      <tr key={i}>
                        <td>
                          <select className="select" value={CONCEPTOS.includes(p.etiqueta) ? p.etiqueta : ''}
                            style={{padding:'5px 9px', fontSize:12.5, width:'100%', minWidth:0}}
                            onChange={(e)=>setRow(i, {etiqueta:e.target.value})}>
                            {!CONCEPTOS.includes(p.etiqueta) && <option value="">{p.etiqueta||'— Elegir —'}</option>}
                            {CONCEPTOS.map(c=>(<option key={c} value={c}>{c}</option>))}
                          </select>
                        </td>
                        <td>
                          <select className="select" value={p.cuenta || ''}
                            style={{padding:'5px 9px', fontSize:12.5, width:'100%', minWidth:0}}
                            onChange={(e)=>{ const c=cuentasProy.find(x=>x.cuenta===e.target.value); setRow(i, c ? {banco:c.banco, cuenta:c.cuenta, cci:c.cci||''} : {banco:'', cuenta:'', cci:''}); }}>
                            <option value="">— Elegir —</option>
                            {cuentasProy.map((c,j)=>(<option key={j} value={c.cuenta}>{c.banco} · {c.cuenta}</option>))}
                          </select>
                        </td>
                        <td>
                          <input className="input" type="date" value={p.fecha||''}
                            style={{padding:'5px 9px', fontSize:12.5, width:'100%', minWidth:0}}
                            onChange={(e)=>setRow(i, {fecha:e.target.value})}/>
                        </td>
                        <td className="num">
                          <div className="input-prefix" style={{width:'100%'}}>
                            <span className="px" style={{padding:'0 6px', fontSize:11}}>S/</span>
                            <input type="number" value={p.monto} style={{padding:'5px 9px', fontSize:12.5, textAlign:'right', width:'100%', minWidth:0}}
                              onChange={(e)=>setRow(i, {monto:+e.target.value})}/>
                          </div>
                        </td>
                        <td>
                          <input className="input mono" value={p.voucher||''} placeholder="Opcional"
                            style={{padding:'5px 9px', fontSize:12.5, width:'100%', minWidth:0}}
                            onChange={(e)=>setRow(i, {voucher:e.target.value})}/>
                        </td>
                        <td style={{textAlign:'center'}}>
                          <label className="hstack" style={{gap:6, justifyContent:'center', cursor: futura ? 'not-allowed' : 'pointer', opacity: futura ? .45 : 1}}
                            title={futura ? 'La fecha del pago aún no llega — no se puede marcar como pagado' : 'Marcar como pagado'}>
                            <input type="checkbox" checked={!futura && p.pagado === true} disabled={futura}
                              onChange={(e)=>setRow(i, {pagado: e.target.checked})}/>
                            <span className="text-sm">{futura ? 'Pend.' : (p.pagado ? 'Sí' : 'No')}</span>
                          </label>
                        </td>
                        <td>
                          {terminos.pagosIniciales.length > 1 && (
                            <button className="icon-btn" style={{width:26,height:26}} onClick={()=>{ const arr=terminos.pagosIniciales.filter((_,j)=>j!==i); setTerminos({...terminos, pagosIniciales:arr}); }}><Icon name="trash" size={12}/></button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{padding:'10px 14px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <button className="btn sm" onClick={()=>{ const c0=cuentasProy[0]; const arr=[...terminos.pagosIniciales, { etiqueta:`Inicial ${terminos.pagosIniciales.length}`, monto:0, fecha:'', voucher:'', banco:c0?.banco||'', cuenta:c0?.cuenta||'', cci:c0?.cci||'' }]; setTerminos({...terminos, pagosIniciales:arr}); }}>
                    <Icon name="plus" size={12}/> Añadir pago
                  </button>
                  <span className="muted text-sm">Total inicial: <b className="mono" style={{color:'var(--ink)'}}>S/ {fmtSoles((terminos.pagosIniciales||[]).reduce((s,p)=>s+(+p.monto||0),0))}</b></span>
                </div>
              </div>
              );
            })()}

            {/* Cronograma editor */}
            {!terminos.contado && (<>
            <div className="mt-24 hstack between mb-12">
              <div>
                <div className="card-title">Cronograma de pagos del saldo</div>
                <div className="muted text-sm">Saldo de S/ {fmtSoles(terminos.precio - terminos.inicial)} a cancelar en cuotas.</div>
              </div>
              <Tabs value={terminos.modoCuotas}
                onChange={(v) => {
                  if (v === 'personalizadas' && (!terminos.cuotasPersonalizadas || terminos.cuotasPersonalizadas.length < 1)) {
                    setTerminos({...terminos, modoCuotas:v, cuotasPersonalizadas: cuotasPorDefecto(terminos.precio - terminos.inicial)});
                  } else {
                    setTerminos({...terminos, modoCuotas:v});
                  }
                }}
                options={[
                  {id:'personalizadas', label:'Cuotas personalizadas'},
                  {id:'iguales', label:'Cuotas iguales mensuales'},
                ]}/>
            </div>

            {terminos.modoCuotas === 'iguales' && (
              <div className="field-group cols-2 mb-12">
                <div className="field">
                  <label className="field-label">N° de cuotas mensuales</label>
                  <input className="input mono" type="number" value={terminos.cuotas} onChange={(e)=>setTerminos({...terminos, cuotas:+e.target.value})}/>
                </div>
                <div className="field">
                  <label className="field-label">Fecha de la 1ra cuota</label>
                  <input className="input" type="date" value={terminos.primeraCuota} onChange={(e)=>setTerminos({...terminos, primeraCuota:e.target.value})}/>
                </div>
              </div>
            )}

            {terminos.modoCuotas === 'personalizadas' && (
              <div className="card" style={{background:'var(--surface-2)', overflow:'hidden'}}>
                <table className="crono-tbl">
                  <thead><tr>
                    <th style={{width:50}}>N°</th>
                    <th>Fecha de pago</th>
                    <th className="num">Monto S/</th>
                    <th className="num">Saldo restante S/</th>
                    <th style={{width:40}}></th>
                  </tr></thead>
                  <tbody>
                    {terminos.cuotasPersonalizadas.map((c, i) => {
                      const saldo = terminos.precio - terminos.inicial;
                      const acum = terminos.cuotasPersonalizadas.slice(0, i+1).reduce((s, x) => s + (+x.monto||0), 0);
                      return (
                        <tr key={i}>
                          <td className="seq">{String(i+1).padStart(2,'0')}</td>
                          <td>
                            <input className="input" type="date" value={c.fecha} style={{padding:'5px 9px', fontSize:12.5, maxWidth:170}}
                              onChange={(e) => {
                                const arr = [...terminos.cuotasPersonalizadas];
                                arr[i] = { ...arr[i], fecha: e.target.value };
                                setTerminos({...terminos, cuotasPersonalizadas: arr});
                              }}/>
                          </td>
                          <td className="num" style={{textAlign:'right'}}>
                            <div className="input-prefix" style={{maxWidth:140, marginLeft:'auto'}}>
                              <span className="px" style={{padding:'0 6px', fontSize:11}}>S/</span>
                              <input type="number" value={c.monto} style={{padding:'5px 9px', fontSize:12.5, textAlign:'right'}}
                                onChange={(e) => {
                                  const arr = [...terminos.cuotasPersonalizadas];
                                  arr[i] = { ...arr[i], monto: +e.target.value };
                                  setTerminos({...terminos, cuotasPersonalizadas: arr});
                                }}/>
                            </div>
                          </td>
                          <td className="num">{fmtSoles(saldo - acum)}</td>
                          <td>
                            {terminos.cuotasPersonalizadas.length > 1 && (
                              <button className="icon-btn" style={{width:26, height:26}} onClick={() => {
                                const arr = terminos.cuotasPersonalizadas.filter((_, j) => j !== i);
                                setTerminos({...terminos, cuotasPersonalizadas: arr});
                              }}><Icon name="trash" size={12}/></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div style={{padding:'10px 14px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <button className="btn sm" onClick={() => {
                    const last = terminos.cuotasPersonalizadas[terminos.cuotasPersonalizadas.length-1];
                    const lastDate = new Date(last?.fecha || new Date());
                    const newDate = new Date(lastDate.getFullYear(), lastDate.getMonth()+1, 0).toISOString().slice(0,10);
                    const arr = [...terminos.cuotasPersonalizadas, { monto: 0, fecha: newDate }];
                    setTerminos({...terminos, cuotasPersonalizadas: arr});
                  }}>
                    <Icon name="plus" size={12}/> Añadir cuota
                  </button>
                  <div className="hstack gap-16">
                    {(() => {
                      const total = terminos.cuotasPersonalizadas.reduce((s, c) => s + (+c.monto||0), 0);
                      const saldo = terminos.precio - terminos.inicial;
                      const diff = +(total - saldo).toFixed(2);
                      return (
                        <>
                          <span className="muted text-sm">Total cuotas: <b className="mono" style={{color:'var(--ink)'}}>S/ {fmtSoles(total)}</b></span>
                          {Math.abs(diff) > 0.01
                            ? <span className="pill danger">Diferencia: S/ {fmtSoles(diff)}</span>
                            : <span className="pill success"><span className="dot"/>Cuadra con el saldo</span>}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
            </>)}

            {/* Resumen */}
            <div className="mt-24 card card-pad" style={{background:'var(--surface-2)'}}>
              <div className="card-title mb-12">Resumen financiero</div>
              <div className="field-group cols-4">
                <ResumenItem label="Precio total" value={`S/ ${fmtSoles(terminos.precio)}`}/>
                <ResumenItem label={terminos.contado ? 'Pago total' : 'Inicial'} value={`S/ ${fmtSoles(terminos.inicial)}`}/>
                <ResumenItem label="Saldo financiado" value={terminos.contado ? '—' : `S/ ${fmtSoles(terminos.precio - terminos.inicial)}`}/>
                <ResumenItem label="N° cuotas" value={terminos.contado ? '—' : (cronograma.length || '—')}/>
              </div>
            </div>
          </>
        )}

        {/* STEP 6 — REVISION */}
        {cur.key === 'revision' && (
          <>
            <div className="card-title mb-12">Revisa antes de generar</div>
            <div className="page-sub mb-16">Verifica los datos. Una vez generado, podrás descargar el PDF, enviarlo por WhatsApp o solicitar la firma digital.</div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              <ReviewCard title="Documentos a generar" items={[
                ['1. Separación', 'Ficha de reserva'],
                ['2. Compraventa', 'Contrato principal'],
                ['3. Cronograma', 'Anexo de pagos'],
                ['4. Acta de Separación', 'Reserva formal'],
                ['5. Tratamiento de Datos', 'Consentimiento LOPD'],
                ['6. Declaración Jurada', 'Domicilio y estado civil'],
                ['Titularidad', TITULARIDAD_OPTS.find(t=>t.id===titularidad)?.label],
                ['Fecha del contrato', fmtDateLong(meta.fechaContrato)],
                ['Asesor', asesoresEmpresa.find(a=>a.id===meta.asesorId)?.name],
              ]}/>
              <ReviewCard title="Comprador" items={[
                ['Nombre', `${compradorA.nombres} ${compradorA.apellidos}`],
                ['DNI', compradorA.dni],
                ['Nacionalidad', compradorA.nacionalidad],
                ['Estado civil', compradorA.estadoCivil],
                ['Domicilio', `${compradorA.domicilio}${compradorA.distrito?`, ${compradorA.distrito}`:''}${compradorA.provincia?`, ${compradorA.provincia}`:''}${compradorA.departamento?`, ${compradorA.departamento}`:''}`],
                ...(isCopropietarios ? [
                  ['Comprador 2', `${compradorB.nombres} ${compradorB.apellidos}`],
                  ['DNI', compradorB.dni],
                ] : []),
              ]}/>
              <ReviewCard title="Inmueble" items={[
                ['Proyecto', inmueble.proyecto],
                ['Unidad', `${inmueble.tipoInmueble} ${inmueble.unidad}${inmueble.manzana?` · Mz. ${inmueble.manzana}`:''}`],
                ['Dirección', inmueble.direccion],
                ['Distrito', `${inmueble.distrito}, ${inmueble.provincia}, ${inmueble.departamento}`],
                ['Partida matriz', `P-${inmueble.partida}`],
                ...(inmueble.estadoRegistral === 'independizada'
                  ? [['Partida independizada', `P-${inmueble.partidaIndependizada||'—'}`]]
                  : [['Estado registral', 'Sin independizar (usa matriz)']]),
                ['Área', `${inmueble.area} m²`],
              ]}/>
              <ReviewCard title="Económico" items={[
                ['Precio', `S/ ${fmtSoles(terminos.precio)}`],
                ['Inicial', `S/ ${fmtSoles(terminos.inicial)}${terminos.inicialFraccionada ? ` (${(terminos.pagosIniciales||[]).length} pagos)` : ''}`],
                ['Saldo', `S/ ${fmtSoles(terminos.precio - terminos.inicial)}`],
                ['Cuotas', `${terminos.cuotas} × S/ ${fmtSoles((terminos.precio - terminos.inicial)/terminos.cuotas)}`],
                ['Primera cuota', fmtDate(terminos.primeraCuota)],
              ]}/>
            </div>

            <div className="mt-24 field">
              <label className="field-label">Notas internas (no aparecen en el contrato)</label>
              <textarea className="textarea" placeholder="Ej. el cliente solicita firmar en notaría Murguía…" value={meta.notas} onChange={(e)=>setMeta({...meta, notas:e.target.value})}/>
            </div>
          </>
        )}
      </div>

      {/* Aviso de validación */}
      {showErrors && curErrors.length > 0 && (
        <div className="val-banner">
          <Icon name="alert" size={15}/>
          <div>
            <b>Faltan datos obligatorios:</b> {curErrors.join(' · ')}
          </div>
        </div>
      )}

      {/* Footer nav */}
      <div className="hstack between mt-16">
        <button className="btn" onClick={goBack} disabled={stepIdx===0} style={{opacity: stepIdx===0?.5:1}}>
          <Icon name="arrowL" size={14}/> Atrás
        </button>
        <div className="hstack gap-8">
          {stepIdx < WIZARD_STEPS.length - 1 ? (
            <button className="btn primary" onClick={tryNext}>
              Continuar <Icon name="arrowR" size={14}/>
            </button>
          ) : (
            <button className="btn primary" onClick={tryGenerate} style={{opacity: allValid ? 1 : .55}}>
              <Icon name="sparkle" size={14}/> {initialData?.id ? 'Guardar cambios' : `Generar ${nDocs} documentos`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ReviewCard = ({ title, items }) => (
  <div className="card card-pad" style={{background:'var(--surface-2)'}}>
    <div className="card-title mb-12">{title}</div>
    <div className="vstack gap-8">
      {items.map(([k,v], i) => (
        <div key={i} className="hstack between gap-12" style={{alignItems:'flex-start'}}>
          <span className="muted text-sm">{k}</span>
          <span className="strong text-sm" style={{textAlign:'right', maxWidth:'60%'}}>{v || '—'}</span>
        </div>
      ))}
    </div>
  </div>
);

const ResumenItem = ({ label, value }) => (
  <div>
    <div className="muted text-xs" style={{textTransform:'uppercase', letterSpacing:'.07em', fontWeight:600}}>{label}</div>
    <div className="serif mt-4" style={{fontSize:20, fontWeight:500, color:'var(--ink)', fontVariantNumeric:'tabular-nums'}}>{value}</div>
  </div>
);

Object.assign(window, { ScreenWizard });
