// screen-wizard.jsx — Asistente paso a paso para generar documentos
// Pasos: Tipo → Titularidad → Comprador(es) → Inmueble → Términos → Revisión

const WIZARD_STEPS = [
  { key:'titular',   label:'Titularidad' },
  { key:'comprador', label:'Comprador' },
  { key:'inmueble',  label:'Inmueble' },
  { key:'terminos',  label:'Términos y cronograma' },
  { key:'revision',  label:'Revisión y generación' },
];

// One person field-set
const PersonaForm = ({ persona, onChange, label }) => {
  const set = (k, v) => onChange({ ...persona, [k]: v });
  return (
    <div className="card card-pad" style={{background:'var(--surface-2)'}}>
      <div className="hstack between mb-12">
        <div className="card-title">{label}</div>
        <span className="pill outline">Persona natural</span>
      </div>
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
        <div className="field" style={{gridColumn:'1 / -1'}}>
          <label className="field-label">Correo electrónico</label>
          <input className="input" placeholder="ejemplo@correo.com" value={persona.email||''} onChange={(e)=>set('email', e.target.value)}/>
        </div>
        <div className="field" style={{gridColumn:'1 / -1'}}>
          <label className="field-label">Domicilio <span className="req">*</span></label>
          <input className="input" placeholder="Av./Jr./Calle, número, distrito, provincia, departamento" value={persona.domicilio||''} onChange={(e)=>set('domicilio', e.target.value)}/>
        </div>
      </div>
    </div>
  );
};

const ScreenWizard = ({ initialData, onCancel, onGenerate, asesores }) => {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [titularidad, setTitularidad] = React.useState('unico');
  const [compradorA, setCompradorA] = React.useState({
    nombres:'', apellidos:'', dni:'',
    estadoCivil:'Soltero(a)', telefono:'', ocupacion:'',
    email:'', domicilio:'',
    ...(initialData?.compradorA || {}),
  });
  const [compradorB, setCompradorB] = React.useState({
    nombres:'', apellidos:'', dni:'',
    estadoCivil:'Casado(a)', telefono:'', ocupacion:'',
    email:'', domicilio:'',
  });
  const [inmueble, setInmueble] = React.useState({
    proyecto:'Nápoles Condominio Club',
    tipoInmueble:'Lote',
    unidad:'7',
    manzana:'C',
    direccion:'Valle Chicama, Predio Mocan, Sector La Arenita U.C. 1900',
    distrito:'Razuri', provincia:'Ascope', departamento:'La Libertad',
    partida:'11550511',
    area:'140',
    linderoNorte:'', linderoSur:'', linderoEste:'', linderoOeste:'',
    ...(initialData?.inmueble || {}),
  });
  const [terminos, setTerminos] = React.useState({
    precio: 17100,
    inicial: 3500,
    modoCuotas: 'personalizadas',
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
    numOperacion: '',
    plazoEntrega: '12.2027',
    penalidadDiaria: 30,
    porcLucroCesante: 30,
    ...(initialData?.terminos || {}),
  });
  const asesoresEmpresa = (window.getAsesoresEmpresa && window.getAsesoresEmpresa()) || ASESORES;
  const [meta, setMeta] = React.useState({
    asesorId: (asesoresEmpresa[0] && asesoresEmpresa[0].id) || 'me',
    plantilla: 'tpl-1',
    fechaContrato: new Date().toISOString().slice(0,10),
    lugarFirma: 'Trujillo',
    notas: '',
  });

  const cronograma = React.useMemo(() => generarCronograma(terminos), [terminos]);

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

  const next = () => setStepIdx((i) => Math.min(WIZARD_STEPS.length - 1, i + 1));
  const back = () => setStepIdx((i) => Math.max(0, i - 1));

  const isCopropietarios = ['copropietarios','conyuge','separacion-bienes'].includes(titularidad);
  const cur = WIZARD_STEPS[stepIdx];

  return (
    <div className="page" data-screen-label="Wizard nuevo contrato" style={{maxWidth:1180}}>
      <div className="page-head">
        <div>
          <div className="hstack gap-8" style={{color:'var(--muted)', fontSize:12.5, marginBottom:4}}>
            <Icon name="plus" size={12}/> Nueva venta
          </div>
          <h1 className="page-title">Nueva venta · 6 documentos</h1>
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
                  <div style={{fontWeight:600, color:'var(--ink)'}}>Cada venta genera 6 documentos</div>
                  <div className="muted text-sm">Separación · Compraventa · Cronograma de Pagos · Acta de Separación · Tratamiento de Datos · Declaración Jurada</div>
                </div>
                <span className="pill brand">1 venta = 6 docs</span>
              </div>
            </div>
            <div className="card-title mb-8">Régimen de titularidad</div>
            <div className="page-sub mb-16">Determina cuántos compradores y qué cláusulas se incluyen en el contrato.</div>
            <div className="field-group cols-2">
              {TITULARIDAD_OPTS.map((o) => (
                <div key={o.id} className={`choice ${titularidad===o.id?'selected':''}`} onClick={()=>setTitularidad(o.id)}>
                  <div className="ic"><Icon name={o.icon} size={18}/></div>
                  <div className="flex1">
                    <div className="choice-title">{o.label}</div>
                    <div className="choice-desc">{o.desc}</div>
                  </div>
                  <div style={{marginLeft:'auto', alignSelf:'center'}}>
                    {titularidad===o.id ? <Icon name="checkCircle" size={18} style={{color:'var(--brand)'}}/>
                                       : <span style={{display:'inline-block', width:18, height:18, borderRadius:999, border:'1.5px solid var(--border-strong)'}}/>}
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
              <select className="select" value={meta.asesorId} onChange={(e)=>setMeta({...meta, asesorId: e.target.value})}>
                {asesoresEmpresa.map(a => <option key={a.id} value={a.id}>{a.name} — {a.role}</option>)}
              </select>
            </div>
          </>
        )}

        {/* STEP 3 — COMPRADOR(ES) */}
        {cur.key === 'comprador' && (
          <>
            <div className="card-title mb-12">Datos del comprador{isCopropietarios?'es':''}</div>
            <div className="vstack gap-16">
              <PersonaForm persona={compradorA} onChange={setCompradorA} label={isCopropietarios ? 'Comprador 1' : 'Comprador'}/>
              {isCopropietarios && (
                <PersonaForm persona={compradorB} onChange={setCompradorB} label="Comprador 2"/>
              )}
              {titularidad==='copropietarios' && (
                <div className="card card-pad" style={{background:'var(--surface-2)'}}>
                  <div className="card-title mb-12">Cuotas ideales</div>
                  <div className="field-group cols-2">
                    <div className="field">
                      <label className="field-label">% Comprador 1</label>
                      <div className="input-prefix"><input defaultValue="50" type="number"/><span className="px">%</span></div>
                    </div>
                    <div className="field">
                      <label className="field-label">% Comprador 2</label>
                      <div className="input-prefix"><input defaultValue="50" type="number"/><span className="px">%</span></div>
                    </div>
                  </div>
                </div>
              )}
              {(titularidad==='conyuge' || titularidad==='separacion-bienes') && (
                <div className="card card-pad" style={{background:'var(--surface-2)'}}>
                  <div className="card-title mb-12">Datos del matrimonio</div>
                  <div className="field-group cols-2">
                    <div className="field">
                      <label className="field-label">Fecha de matrimonio</label>
                      <input className="input" type="date" defaultValue="2018-04-21"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Lugar de matrimonio</label>
                      <input className="input" defaultValue="Municipalidad de San Isidro, Lima"/>
                    </div>
                    {titularidad==='separacion-bienes' && (
                      <div className="field" style={{gridColumn:'1 / -1'}}>
                        <label className="field-label">Escritura pública de separación de bienes</label>
                        <input className="input" placeholder="Notaría, fecha, kárdex"/>
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
            <div className="field-group cols-3">
              <div className="field">
                <label className="field-label">Proyecto</label>
                <select className="select" value={inmueble.proyecto} onChange={(e)=>setInmueble({...inmueble, proyecto:e.target.value})}>
                  {PROYECTOS.map(p => <option key={p.id}>{p.name}</option>)}
                </select>
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
                <label className="field-label">Nº de partida registral <span className="req">*</span></label>
                <div className="input-prefix">
                  <span className="px">P-</span>
                  <input value={inmueble.partida} onChange={(e)=>setInmueble({...inmueble, partida:e.target.value})}/>
                </div>
                <div className="field-hint">SUNARP — Registro de Propiedad Inmueble</div>
              </div>
              <div className="field">
                <label className="field-label">Área total (m²)</label>
                <div className="input-prefix"><input value={inmueble.area} onChange={(e)=>setInmueble({...inmueble, area:e.target.value})}/><span className="px">m²</span></div>
              </div>
              <div className="field" style={{gridColumn:'1 / -1'}}>
                <label className="field-label">Dirección completa <span className="req">*</span></label>
                <input className="input" value={inmueble.direccion} onChange={(e)=>setInmueble({...inmueble, direccion:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">Distrito</label>
                <input className="input" value={inmueble.distrito} onChange={(e)=>setInmueble({...inmueble, distrito:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">Provincia</label>
                <input className="input" value={inmueble.provincia} onChange={(e)=>setInmueble({...inmueble, provincia:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">Departamento</label>
                <select className="select" value={inmueble.departamento} onChange={(e)=>setInmueble({...inmueble, departamento:e.target.value})}>
                  {DEPARTAMENTOS_PE.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

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

        {/* STEP 5 — TERMINOS */}
        {cur.key === 'terminos' && (
          <>
            <div className="card-title mb-12">Términos económicos</div>
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
                <label className="field-label">Cuota inicial</label>
                <div className="input-prefix">
                  <span className="px">S/</span>
                  <input type="number" value={terminos.inicial} onChange={(e)=>setTerminos({...terminos, inicial:+e.target.value})}/>
                </div>
                <div className="field-hint">
                  {Math.round((terminos.inicial / terminos.precio) * 100)}% del precio — pagado al firmar
                </div>
              </div>
              <div className="field">
                <label className="field-label">Saldo a financiar</label>
                <div className="input-prefix" style={{background:'var(--surface-2)'}}>
                  <span className="px">S/</span>
                  <input readOnly value={fmtSoles(terminos.precio - terminos.inicial)} style={{background:'transparent', color:'var(--muted)'}}/>
                </div>
              </div>

              <div className="field">
                <label className="field-label">N° operación / voucher</label>
                <input className="input mono" placeholder="31715926 / 05976617 / ..." value={terminos.numOperacion} onChange={(e)=>setTerminos({...terminos, numOperacion:e.target.value})}/>
              </div>
              <div className="field">
                <label className="field-label">Banco</label>
                <select className="select" value={terminos.bancoNombre} onChange={(e)=>setTerminos({...terminos, bancoNombre:e.target.value})}>
                  <option>BCP</option><option>BBVA</option><option>Interbank</option><option>Scotiabank</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">N° de cuenta</label>
                <input className="input mono" value={terminos.bancoCuenta} onChange={(e)=>setTerminos({...terminos, bancoCuenta:e.target.value})}/>
              </div>

              <div className="field">
                <label className="field-label">Penalidad por día (mora)</label>
                <div className="input-prefix"><span className="px">S/</span><input type="number" value={terminos.penalidadDiaria} onChange={(e)=>setTerminos({...terminos, penalidadDiaria:+e.target.value})}/></div>
                <div className="field-hint">Tras 5 días hábiles de retraso (Cláusula Quinta)</div>
              </div>
              <div className="field">
                <label className="field-label">Lucro cesante en resolución</label>
                <div className="input-prefix"><input type="number" value={terminos.porcLucroCesante} onChange={(e)=>setTerminos({...terminos, porcLucroCesante:+e.target.value})}/><span className="px">%</span></div>
                <div className="field-hint">Retención del vendedor si se resuelve el contrato</div>
              </div>
              <div className="field">
                <label className="field-label">Fecha de entrega del lote</label>
                <input className="input mono" placeholder="12.2027" value={terminos.plazoEntrega} onChange={(e)=>setTerminos({...terminos, plazoEntrega:e.target.value})}/>
              </div>
            </div>

            {/* Cronograma editor */}
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

            {/* Resumen */}
            <div className="mt-24 card card-pad" style={{background:'var(--surface-2)'}}>
              <div className="card-title mb-12">Resumen financiero</div>
              <div className="field-group cols-4">
                <ResumenItem label="Precio total" value={`S/ ${fmtSoles(terminos.precio)}`}/>
                <ResumenItem label="Inicial" value={`S/ ${fmtSoles(terminos.inicial)}`}/>
                <ResumenItem label="Saldo financiado" value={`S/ ${fmtSoles(terminos.precio - terminos.inicial)}`}/>
                <ResumenItem label="N° cuotas" value={cronograma.length || '—'}/>
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
                ['Estado civil', compradorA.estadoCivil],
                ['Domicilio', compradorA.domicilio],
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
                ['Partida', `P-${inmueble.partida}`],
                ['Área', `${inmueble.area} m²`],
              ]}/>
              <ReviewCard title="Económico" items={[
                ['Precio', `S/ ${fmtSoles(terminos.precio)}`],
                ['Inicial', `S/ ${fmtSoles(terminos.inicial)}`],
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

      {/* Footer nav */}
      <div className="hstack between mt-16">
        <button className="btn" onClick={back} disabled={stepIdx===0} style={{opacity: stepIdx===0?.5:1}}>
          <Icon name="arrowL" size={14}/> Atrás
        </button>
        <div className="hstack gap-8">
          <button className="btn ghost">
            <Icon name="download" size={14}/> Guardar borrador
          </button>
          {stepIdx < WIZARD_STEPS.length - 1 ? (
            <button className="btn primary" onClick={next}>
              Continuar <Icon name="arrowR" size={14}/>
            </button>
          ) : (
            <button className="btn primary" onClick={() => onGenerate({
              titularidad, compradorA, compradorB: isCopropietarios ? compradorB : null,
              inmueble, terminos, meta, cronograma,
            })}>
              <Icon name="sparkle" size={14}/> Generar 6 documentos
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
