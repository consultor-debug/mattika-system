// screen-correo.jsx — Configuración de correo (SMTP) + bandeja enviada
// ═══════════════════════════════════════════════════════════════
// Doble función:
//   1) Pantalla de configuración SMTP (servidor, puerto, credenciales, tls)
//      con prueba de conexión SIMULADA — el envío real requiere backend.
//   2) Bandeja enviada interna — cada vez que el sistema "envía" un correo
//      (cotización, contrato, recordatorio de cuota), se registra aquí
//      para revisión.
//
// IMPORTANTE: este componente NO hace SMTP real. Es una capa de UI lista
// para conectar al backend cuando exista. La función global
// `window.enviarCorreo(...)` registra el correo en la bandeja interna y
// dispara un toast — el día que haya backend, este es el único punto
// que hay que cambiar.

const SMTP_KEY_BASE   = 'mattika.smtp-config.v1';
const OUTBOX_KEY_BASE = 'mattika.outbox.v1';

function _correoEmpresaId() {
  try {
    const s = JSON.parse(localStorage.getItem('mattika.sesion.v1') || 'null');
    return s?.empresaId || '_default';
  } catch (e) { return '_default'; }
}
const _smtpKey   = () => `${SMTP_KEY_BASE}.${_correoEmpresaId()}`;
const _outboxKey = () => `${OUTBOX_KEY_BASE}.${_correoEmpresaId()}`;

// ── Configuración SMTP por empresa ──────────────────────────────
const SMTP_DEFAULTS_POR_EMPRESA = {
  lumina: {
    activo: false,
    nombreRemite: 'Lumina Grupo Inmobiliario',
    emailRemite:  'ventas@luminagrupo.pe',
    servidorSaliente: 'smtp.hostinger.com',
    puertoSaliente:   465,
    seguridad: 'ssl',                 // 'ssl' | 'tls' | 'none'
    servidorEntrante: 'imap.hostinger.com',
    puertoEntrante:   993,
    usuario:  '',
    clave:    '',
    enviarPruebasA: '',
  },
  golden: {
    activo: false,
    nombreRemite: 'Golden Inmobiliaria',
    emailRemite:  'contacto@goldeninmobiliaria.pe',
    servidorSaliente: 'smtp.hostinger.com',
    puertoSaliente:   465,
    seguridad: 'ssl',
    servidorEntrante: 'imap.hostinger.com',
    puertoEntrante:   993,
    usuario:  '',
    clave:    '',
    enviarPruebasA: '',
  },
};
const SMTP_DEFAULTS_GENERIC = {
  activo: false,
  nombreRemite: '',
  emailRemite:  '',
  servidorSaliente: 'smtp.hostinger.com',
  puertoSaliente:   465,
  seguridad: 'ssl',
  servidorEntrante: 'imap.hostinger.com',
  puertoEntrante:   993,
  usuario: '', clave: '',
  enviarPruebasA: '',
};

function loadSmtpConfig() {
  const eid = _correoEmpresaId();
  const defaults = SMTP_DEFAULTS_POR_EMPRESA[eid] || SMTP_DEFAULTS_GENERIC;
  try {
    const raw = localStorage.getItem(_smtpKey());
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch (e) {}
  return defaults;
}
function saveSmtpConfig(cfg) {
  try { localStorage.setItem(_smtpKey(), JSON.stringify(cfg)); } catch (e) {}
}

// ── Outbox (bandeja enviada) ────────────────────────────────────
function loadOutbox() {
  try {
    const raw = localStorage.getItem(_outboxKey());
    return raw ? JSON.parse(raw) : DEFAULT_OUTBOX_SEED();
  } catch (e) { return []; }
}
function saveOutbox(arr) {
  try { localStorage.setItem(_outboxKey(), JSON.stringify(arr)); } catch (e) {}
}

// Seed inicial — 3 correos demo para que la bandeja no aparezca vacía
function DEFAULT_OUTBOX_SEED() {
  const eid = _correoEmpresaId();
  const proy = eid === 'golden' ? 'Villa Club Malabrigo' : 'Nápoles Condominio Club';
  const ahora = Date.now();
  const seed = [
    { id:'em-3', tipo:'cotizacion', estado:'entregado',
      destinatario:'andrea.jimenez@correo.pe', destinatarioNombre:'Andrea Jiménez',
      asunto:`Cotización Lote A-22 · Proyecto ${proy}`,
      cuerpo:`Estimada Andrea,\n\nAdjuntamos la cotización del Lote A-22 con financiamiento a 36 meses. Si tienes alguna duda, estamos a tu disposición.\n\nSaludos,\nEquipo comercial.`,
      adjuntos:['Cotizacion_A-22.pdf'],
      enviadoEn: new Date(ahora - 2*60*60*1000).toISOString(),
      abiertoEn: new Date(ahora - 1*60*60*1000).toISOString(),
    },
    { id:'em-2', tipo:'contrato', estado:'entregado',
      destinatario:'renzo.tapia@correo.pe', destinatarioNombre:'Renzo Tapia',
      asunto:`Contrato de compraventa Lote A-05 · ${proy}`,
      cuerpo:`Estimado Renzo,\n\nEnvíamos para revisión y firma el contrato de compraventa correspondiente al Lote A-05.\n\nQuedamos atentos a tus comentarios.`,
      adjuntos:['Contrato_A-05.pdf', 'Cronograma_A-05.pdf', 'Acta_Separacion_A-05.pdf'],
      enviadoEn: new Date(ahora - 26*60*60*1000).toISOString(),
      abiertoEn: new Date(ahora - 24*60*60*1000).toISOString(),
    },
    { id:'em-1', tipo:'recordatorio', estado:'fallido',
      destinatario:'patricia.olarte@correo.pe', destinatarioNombre:'Patricia Olarte',
      asunto:`Recordatorio · Cuota 5 vence el 31/05`,
      cuerpo:`Estimada Patricia,\n\nLe recordamos que su cuota n.° 5 (S/ 1,420) vence el 31/05/2026.\n\nGracias por su puntualidad.`,
      adjuntos:[],
      enviadoEn: new Date(ahora - 3*24*60*60*1000).toISOString(),
      error: 'Mailbox unavailable (5.1.1) — verificar dirección',
    },
  ];
  try { localStorage.setItem(_outboxKey(), JSON.stringify(seed)); } catch (e) {}
  return seed;
}

// ── API global de envío ─────────────────────────────────────────
// Registra un correo en la bandeja interna. Devuelve el item creado.
// Cuando exista backend, esta función es el punto a reemplazar con
// la llamada real al servidor SMTP.
function enviarCorreo({ tipo='generico', destinatario, destinatarioNombre, asunto, cuerpo, adjuntos=[], simularError=false }) {
  const cfg = loadSmtpConfig();
  const item = {
    id: 'em-' + Math.random().toString(36).slice(2, 9),
    tipo, destinatario, destinatarioNombre,
    asunto, cuerpo, adjuntos,
    enviadoEn: new Date().toISOString(),
    estado: cfg.activo && !simularError ? 'entregado' : (simularError ? 'fallido' : 'pendiente'),
    error: simularError ? 'Servidor SMTP no responde' : (!cfg.activo ? 'Servidor SMTP sin configurar' : null),
  };
  const outbox = loadOutbox();
  saveOutbox([item, ...outbox]);
  return item;
}

// ═══════════════════════════════════════════════════════════════
// PANTALLA
// ═══════════════════════════════════════════════════════════════
const ScreenCorreo = ({ onGoto, onToast }) => {
  const [tab, setTab] = React.useState('config'); // 'config' | 'outbox'
  const [cfg, setCfg] = React.useState(() => loadSmtpConfig());
  const [outbox, setOutbox] = React.useState(() => loadOutbox());
  const [dirty, setDirty] = React.useState(false);
  const [testing, setTesting] = React.useState(null); // null | 'running' | 'ok' | 'fail'
  const [showClave, setShowClave] = React.useState(false);
  const [composing, setComposing] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const empresa = window.getEmpresaActual?.();

  const updCfg = (patch) => { setCfg({ ...cfg, ...patch }); setDirty(true); setTesting(null); };

  const guardar = () => {
    saveSmtpConfig(cfg);
    setDirty(false);
    onToast?.('Configuración SMTP guardada');
  };

  const probarConexion = () => {
    setTesting('running');
    setTimeout(() => {
      // Validaciones básicas — sin SMTP real, solo verificamos los campos
      const errores = [];
      if (!cfg.servidorSaliente) errores.push('Falta el servidor SMTP');
      if (!cfg.puertoSaliente)   errores.push('Falta el puerto');
      if (!cfg.usuario)          errores.push('Falta el usuario');
      if (!cfg.clave)            errores.push('Falta la clave');
      if (!cfg.emailRemite)      errores.push('Falta el correo remitente');
      if (errores.length) {
        setTesting('fail');
        onToast?.('✕ ' + errores[0]);
        return;
      }
      setTesting('ok');
      onToast?.('✓ Conexión simulada exitosa');
    }, 1400);
  };

  const enviarPrueba = () => {
    if (!cfg.enviarPruebasA) { onToast?.('Indica un correo de prueba'); return; }
    const item = enviarCorreo({
      tipo: 'prueba',
      destinatario: cfg.enviarPruebasA,
      destinatarioNombre: 'Correo de prueba',
      asunto: 'Prueba de envío · Mattika System',
      cuerpo: `Hola,\n\nEste es un correo de prueba enviado desde Mattika System para verificar la configuración SMTP de ${empresa?.nombre || 'tu empresa'}.\n\nSi recibes este mensaje, todo está funcionando correctamente.\n\n— Mattika`,
    });
    setOutbox(loadOutbox());
    onToast?.(`✓ Correo de prueba enviado a ${cfg.enviarPruebasA}`);
  };

  const reintentar = (item) => {
    const next = outbox.map(x => x.id === item.id ? { ...x, estado: 'entregado', error: null, enviadoEn: new Date().toISOString() } : x);
    setOutbox(next); saveOutbox(next);
    onToast?.('✓ Correo reenviado');
  };

  const eliminar = (item) => {
    const next = outbox.filter(x => x.id !== item.id);
    setOutbox(next); saveOutbox(next);
    if (selected?.id === item.id) setSelected(null);
    onToast?.('Eliminado de la bandeja');
  };

  const stats = React.useMemo(() => ({
    total: outbox.length,
    entregados: outbox.filter(x => x.estado === 'entregado').length,
    fallidos:   outbox.filter(x => x.estado === 'fallido').length,
    pendientes: outbox.filter(x => x.estado === 'pendiente').length,
  }), [outbox]);

  return (
    <div className="page page-correo" data-screen-label="Correo">
      <div className="page-head">
        <div>
          <h1 className="page-title">Correo y notificaciones</h1>
          <div className="page-sub">
            Configura el servidor de salida y revisa todos los correos enviados desde Mattika.
            {empresa && <> · <b>{empresa.nombre}</b></>}
          </div>
        </div>
        <div className="hstack gap-8">
          {tab === 'outbox' && (
            <button className="btn" onClick={() => setComposing(true)}>
              <Icon name="edit" size={13}/> Redactar
            </button>
          )}
        </div>
      </div>

      {/* Aviso de estado */}
      <div className={`correo-state-banner ${cfg.activo ? 'ok' : 'warn'}`}>
        <span className="correo-state-dot"/>
        <div className="flex1">
          <b>{cfg.activo ? 'Servidor SMTP activo' : 'Servidor SMTP sin activar'}</b>
          <div className="muted text-xs" style={{marginTop:2}}>
            {cfg.activo
              ? <>Los correos se envían como <b>{cfg.emailRemite || '—'}</b> vía {cfg.servidorSaliente}:{cfg.puertoSaliente}.</>
              : <>Los correos se registran en la bandeja pero no se envían realmente. Completa la configuración y activa el servidor para empezar.</>
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="correo-tabs">
        <button className={tab === 'config' ? 'on' : ''} onClick={() => setTab('config')}>
          <Icon name="settings" size={13}/> Configuración SMTP
        </button>
        <button className={tab === 'outbox' ? 'on' : ''} onClick={() => setTab('outbox')}>
          <Icon name="send" size={13}/> Bandeja enviada
          <span className="correo-tab-count">{outbox.length}</span>
        </button>
      </div>

      {tab === 'config' && (
        <div className="correo-config">
          {/* Cuenta y servidor */}
          <section className="card correo-card">
            <div className="correo-card-head">
              <div>
                <h3>Cuenta y remitente</h3>
                <p className="muted text-xs">Estos datos aparecen como el "De:" en los correos que envíe el sistema.</p>
              </div>
              <label className="correo-switch">
                <input type="checkbox" checked={cfg.activo} onChange={(e) => updCfg({ activo: e.target.checked })}/>
                <span className="correo-switch-track"/>
                <span className="correo-switch-lbl">{cfg.activo ? 'Activo' : 'Inactivo'}</span>
              </label>
            </div>
            <div className="correo-grid two">
              <label className="auth-field">
                <span className="auth-label">Nombre del remitente</span>
                <input type="text" value={cfg.nombreRemite} onChange={(e) => updCfg({ nombreRemite: e.target.value })} placeholder="Lumina Grupo Inmobiliario"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Correo del remitente</span>
                <input type="text" value={cfg.emailRemite} onChange={(e) => updCfg({ emailRemite: e.target.value })} placeholder="ventas@tudominio.com"/>
              </label>
            </div>
          </section>

          {/* Servidor saliente */}
          <section className="card correo-card">
            <div className="correo-card-head">
              <div>
                <h3>Servidor de salida (SMTP)</h3>
                <p className="muted text-xs">Datos que entrega tu proveedor (Hostinger, Google Workspace, Microsoft 365…).</p>
              </div>
            </div>
            <div className="correo-grid">
              <label className="auth-field">
                <span className="auth-label">Servidor SMTP</span>
                <input type="text" value={cfg.servidorSaliente} onChange={(e) => updCfg({ servidorSaliente: e.target.value })} placeholder="smtp.hostinger.com"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Puerto</span>
                <input type="text" value={cfg.puertoSaliente} onChange={(e) => updCfg({ puertoSaliente: +e.target.value || 0 })} placeholder="465"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Seguridad</span>
                <div className="correo-seg-group">
                  {[
                    {v:'ssl',  l:'SSL', s:'puerto 465'},
                    {v:'tls',  l:'STARTTLS', s:'puerto 587'},
                    {v:'none', l:'Sin cifrado', s:'no recomendado'},
                  ].map(opt => (
                    <button key={opt.v} type="button"
                            className={cfg.seguridad === opt.v ? 'on' : ''}
                            onClick={() => updCfg({ seguridad: opt.v, puertoSaliente: opt.v === 'ssl' ? 465 : opt.v === 'tls' ? 587 : 25 })}>
                      <b>{opt.l}</b>
                      <small>{opt.s}</small>
                    </button>
                  ))}
                </div>
              </label>
            </div>
            <div className="correo-grid two">
              <label className="auth-field">
                <span className="auth-label">Usuario</span>
                <input type="text" value={cfg.usuario} onChange={(e) => updCfg({ usuario: e.target.value })} placeholder="admin@tudominio.com" autoComplete="off"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Clave</span>
                <div className="auth-input-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="11" rx="2"/>
                    <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round"/>
                  </svg>
                  <input type={showClave ? 'text' : 'password'} value={cfg.clave} onChange={(e) => updCfg({ clave: e.target.value })} placeholder="••••••••" autoComplete="new-password"/>
                  <button type="button" className="auth-eye" onClick={() => setShowClave(v => !v)} aria-label="Mostrar clave">
                    {showClave ? '🙈' : '👁'}
                  </button>
                </div>
              </label>
            </div>
          </section>

          {/* Servidor entrante (opcional) */}
          <section className="card correo-card">
            <div className="correo-card-head">
              <div>
                <h3>Servidor de entrada (IMAP) <span className="pill outline" style={{marginLeft:8, fontSize:10}}>Opcional</span></h3>
                <p className="muted text-xs">Permite leer correos entrantes desde Mattika. Útil para asociar respuestas de clientes a contratos.</p>
              </div>
            </div>
            <div className="correo-grid two">
              <label className="auth-field">
                <span className="auth-label">Servidor IMAP</span>
                <input type="text" value={cfg.servidorEntrante} onChange={(e) => updCfg({ servidorEntrante: e.target.value })} placeholder="imap.hostinger.com"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Puerto</span>
                <input type="text" value={cfg.puertoEntrante} onChange={(e) => updCfg({ puertoEntrante: +e.target.value || 0 })} placeholder="993"/>
              </label>
            </div>
          </section>

          {/* Prueba */}
          <section className="card correo-card">
            <div className="correo-card-head">
              <div>
                <h3>Probar configuración</h3>
                <p className="muted text-xs">Verificamos los datos y opcionalmente enviamos un correo de prueba a una dirección que indiques.</p>
              </div>
            </div>
            <div className="correo-grid two">
              <label className="auth-field">
                <span className="auth-label">Enviar prueba a</span>
                <input type="text" value={cfg.enviarPruebasA} onChange={(e) => updCfg({ enviarPruebasA: e.target.value })} placeholder="tu-correo@gmail.com"/>
              </label>
              <div className="hstack gap-8" style={{alignSelf:'flex-end', height:42}}>
                <button className="btn" onClick={probarConexion}>
                  {testing === 'running'
                    ? <><span className="auth-spinner" style={{borderColor:'rgba(11,26,51,.2)', borderTopColor:'var(--brand)'}}/> Probando…</>
                    : <><Icon name="check" size={13}/> Probar conexión</>}
                </button>
                <button className="btn primary" onClick={enviarPrueba} disabled={testing !== 'ok'}>
                  <Icon name="send" size={13}/> Enviar prueba
                </button>
              </div>
            </div>
            {testing === 'ok' && (
              <div className="correo-test-ok">
                <Icon name="checkCircle" size={14}/>
                <span>Validación simulada exitosa. En producción aquí Mattika hace handshake real con <code>{cfg.servidorSaliente}:{cfg.puertoSaliente}</code>.</span>
              </div>
            )}
            {testing === 'fail' && (
              <div className="correo-test-fail">
                <Icon name="alert" size={14}/>
                <span>Faltan datos para conectar. Revisa los campos marcados.</span>
              </div>
            )}
          </section>

          {/* Banner informativo */}
          <div className="correo-info-banner">
            <div className="correo-info-ic">
              <Icon name="info" size={14}/>
            </div>
            <div className="flex1">
              <b>Nota técnica</b>
              <p>Esta vista guarda y valida la configuración. El envío SMTP real necesita el backend de Mattika activo — entretanto, todos los correos se registran en la <b>Bandeja enviada</b> para revisión del equipo.</p>
            </div>
          </div>

          {/* Footer guardar */}
          {dirty && (
            <div className="correo-save-bar">
              <span className="muted text-sm">Tienes cambios sin guardar</span>
              <div className="hstack gap-8">
                <button className="btn" onClick={() => { setCfg(loadSmtpConfig()); setDirty(false); }}>Descartar</button>
                <button className="btn primary" onClick={guardar}>Guardar configuración</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'outbox' && (
        <div className="correo-outbox">
          {/* Stats */}
          <div className="correo-stats">
            <div className="correo-stat"><b>{stats.total}</b><span>Total</span></div>
            <div className="correo-stat ok"><b>{stats.entregados}</b><span>Entregados</span></div>
            <div className="correo-stat warn"><b>{stats.pendientes}</b><span>Pendientes</span></div>
            <div className="correo-stat danger"><b>{stats.fallidos}</b><span>Fallidos</span></div>
          </div>

          {/* Lista */}
          <div className="correo-outbox-grid">
            <div className="correo-outbox-list">
              {outbox.length === 0 && (
                <div className="correo-empty">
                  <div className="correo-empty-ic"><Icon name="send" size={28}/></div>
                  <div className="strong">La bandeja está vacía</div>
                  <p className="muted text-sm">Cada vez que envíes una cotización, contrato o recordatorio, aparecerá aquí.</p>
                </div>
              )}
              {outbox.map(item => (
                <button key={item.id}
                        className={`correo-row ${selected?.id === item.id ? 'on' : ''}`}
                        onClick={() => setSelected(item)}>
                  <div className="correo-row-state" data-state={item.estado}/>
                  <div className="flex1 minw0">
                    <div className="correo-row-top">
                      <span className="correo-row-tipo">{etiquetaTipo(item.tipo)}</span>
                      <span className="correo-row-time">{tiempoRelativo(item.enviadoEn)}</span>
                    </div>
                    <div className="correo-row-to">{item.destinatarioNombre || item.destinatario}</div>
                    <div className="correo-row-subj">{item.asunto}</div>
                    <div className="correo-row-meta">
                      {item.adjuntos?.length > 0 && (
                        <span className="correo-row-attach">
                          <Icon name="attachment" size={11}/> {item.adjuntos.length}
                        </span>
                      )}
                      <span className={`correo-row-status s-${item.estado}`}>{etiquetaEstado(item.estado)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Detalle */}
            <div className="correo-detail">
              {!selected && (
                <div className="correo-empty correo-empty-detail">
                  <div className="correo-empty-ic"><Icon name="doc" size={28}/></div>
                  <div className="strong">Selecciona un correo</div>
                  <p className="muted text-sm">Aquí verás el contenido completo, el estado de entrega y los adjuntos.</p>
                </div>
              )}
              {selected && (
                <article>
                  <header className="correo-detail-head">
                    <div className="flex1">
                      <div className="correo-row-tipo">{etiquetaTipo(selected.tipo)}</div>
                      <h2>{selected.asunto}</h2>
                      <div className="correo-detail-meta">
                        <div><span>Para</span><b>{selected.destinatarioNombre} &lt;{selected.destinatario}&gt;</b></div>
                        <div><span>De</span><b>{cfg.nombreRemite} &lt;{cfg.emailRemite}&gt;</b></div>
                        <div><span>Enviado</span><b className="mono">{new Date(selected.enviadoEn).toLocaleString('es-PE')}</b></div>
                        {selected.abiertoEn && (
                          <div><span>Abierto</span><b className="mono">{new Date(selected.abiertoEn).toLocaleString('es-PE')}</b></div>
                        )}
                      </div>
                    </div>
                    <span className={`correo-row-status s-${selected.estado}`}>{etiquetaEstado(selected.estado)}</span>
                  </header>

                  {selected.error && (
                    <div className="correo-detail-error">
                      <Icon name="alert" size={13}/>
                      <span>{selected.error}</span>
                    </div>
                  )}

                  <div className="correo-detail-body">
                    {selected.cuerpo.split('\n').map((line, i) => (
                      <p key={i}>{line || '\u00A0'}</p>
                    ))}
                  </div>

                  {selected.adjuntos?.length > 0 && (
                    <div className="correo-detail-attachments">
                      <div className="strong text-sm mb-8">Adjuntos ({selected.adjuntos.length})</div>
                      <div className="vstack gap-4">
                        {selected.adjuntos.map((a, i) => (
                          <div key={i} className="correo-attach">
                            <Icon name="doc" size={13}/>
                            <span className="flex1">{a}</span>
                            <button className="btn" onClick={() => onToast?.('Descarga simulada · ' + a)}>
                              <Icon name="download" size={12}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="correo-detail-actions">
                    {selected.estado === 'fallido' && (
                      <button className="btn primary" onClick={() => reintentar(selected)}>
                        <Icon name="refresh" size={13}/> Reintentar envío
                      </button>
                    )}
                    <button className="btn" onClick={() => { setComposing({ ...selected, asunto: 'RE: ' + selected.asunto }); }}>
                      <Icon name="edit" size={13}/> Responder
                    </button>
                    <button className="btn danger" onClick={() => eliminar(selected)}>
                      <Icon name="x" size={13}/> Eliminar
                    </button>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      )}

      {composing && (
        <ComponerModal
          initial={typeof composing === 'object' ? composing : null}
          cfg={cfg}
          onClose={() => setComposing(false)}
          onEnviar={(data) => {
            enviarCorreo(data);
            setOutbox(loadOutbox());
            setComposing(false);
            onToast?.(`✓ Correo "${data.asunto}" agregado a la bandeja`);
          }}
        />
      )}
    </div>
  );
};

// ── Modal: componer correo ──────────────────────────────────────
const ComponerModal = ({ initial, cfg, onClose, onEnviar }) => {
  const [f, setF] = React.useState(() => ({
    tipo: 'generico',
    destinatario: initial?.destinatario || '',
    destinatarioNombre: initial?.destinatarioNombre || '',
    asunto: initial?.asunto || '',
    cuerpo: initial ? '' : `Estimado/a,\n\n\n\nSaludos,\n${cfg.nombreRemite || ''}`,
    adjuntos: [],
  }));
  const submit = (ev) => {
    ev.preventDefault();
    if (!f.destinatario.trim() || !f.asunto.trim()) return;
    onEnviar(f);
  };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" style={{maxWidth:640}} onSubmit={submit}>
        <header>
          <h3>{initial ? 'Responder' : 'Redactar correo'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <div className="correo-from-line">
            <span className="muted">De:</span>
            <b>{cfg.nombreRemite} &lt;{cfg.emailRemite || 'sin-configurar'}&gt;</b>
          </div>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Para (correo)</span>
              <input type="text" value={f.destinatario} onChange={(e) => setF({...f, destinatario: e.target.value})} required placeholder="cliente@correo.com"/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Nombre del destinatario</span>
              <input type="text" value={f.destinatarioNombre} onChange={(e) => setF({...f, destinatarioNombre: e.target.value})} placeholder="Andrea Jiménez"/>
            </label>
          </div>
          <label className="auth-field">
            <span className="auth-label">Asunto</span>
            <input type="text" value={f.asunto} onChange={(e) => setF({...f, asunto: e.target.value})} required placeholder="Cotización Lote A-22 · Proyecto Nápoles"/>
          </label>
          <label className="auth-field">
            <span className="auth-label">Mensaje</span>
            <textarea rows={10} value={f.cuerpo} onChange={(e) => setF({...f, cuerpo: e.target.value})}
                      style={{padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8, background:'var(--surface)', color:'var(--ink)', font:'inherit', fontSize:13.5, resize:'vertical'}}/>
          </label>
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">
            <Icon name="send" size={13}/> Enviar
          </button>
        </footer>
      </form>
    </div>
  );
};

// ── Helpers de presentación ─────────────────────────────────────
function etiquetaTipo(t) {
  const map = {
    cotizacion:   'Cotización',
    contrato:     'Contrato',
    recordatorio: 'Recordatorio de cuota',
    prueba:       'Prueba',
    generico:     'Correo',
    invitacion:   'Invitación al equipo',
  };
  return map[t] || 'Correo';
}
function etiquetaEstado(s) {
  const map = { entregado:'Entregado', pendiente:'En cola', fallido:'Falló', leyendo:'Abierto' };
  return map[s] || s;
}
function tiempoRelativo(iso) {
  const t = new Date(iso).getTime();
  const dif = Date.now() - t;
  const m = Math.floor(dif / 60000);
  if (m < 1)    return 'ahora';
  if (m < 60)   return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24)   return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `hace ${d} d`;
  return new Date(iso).toLocaleDateString('es-PE', { day:'2-digit', month:'short' });
}

Object.assign(window, {
  ScreenCorreo, enviarCorreo, loadSmtpConfig, saveSmtpConfig, loadOutbox,
});
