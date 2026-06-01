// screen-proyectos.jsx — Gestión de proyectos y etapas de la empresa.
// Pantalla que vive bajo Configuración. Cada usuario empresa ve solo
// los proyectos de su empresa; el contexto activo (proyecto + etapa)
// se controla aquí o desde el chip del topbar.

// ── Almacenamiento de imágenes de plano por etapa ──────────────
// Las imágenes pesan, así que se guardan en claves separadas para
// no inflar el blob principal de empresas.
const PLANO_IMG_KEY = (eid, pid, etid) => `mattika.plano-img.${eid}.${pid}.${etid}`;
function loadPlanoImagen(eid, pid, etid) {
  try { return localStorage.getItem(PLANO_IMG_KEY(eid, pid, etid)); } catch (e) { return null; }
}
function savePlanoImagen(eid, pid, etid, dataUrl) {
  try { localStorage.setItem(PLANO_IMG_KEY(eid, pid, etid), dataUrl); return true; } catch (e) { return false; }
}
function deletePlanoImagen(eid, pid, etid) {
  try { localStorage.removeItem(PLANO_IMG_KEY(eid, pid, etid)); } catch (e) {}
}

// Downscale + recomprime para que quepa en localStorage.
// Devuelve { dataUrl, ancho, alto, peso }.
function downscaleImagen(file, maxW = 2800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.onload = () => doScale(); img.src = reader.result; };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
    function doScale() {
      const ratio = img.naturalHeight / img.naturalWidth;
      const W = Math.min(img.naturalWidth, maxW);
      const H = Math.round(W * ratio);
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      // PNG si el archivo era PNG y pesa poco, JPG si no
      const tryPng = file.type === 'image/png' && W <= 2200;
      const dataUrl = tryPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86);
      resolve({ dataUrl, ancho: W, alto: H, peso: Math.round(dataUrl.length * 0.75 / 1024) });
    }
  });
}

const ESTADO_PROYECTO = {
  'planificacion': { label: 'Planificación', color: '#8B97B3', bg: 'rgba(139,151,179,.16)' },
  'preventa':      { label: 'Preventa',      color: '#1F6FEB', bg: 'rgba(31,111,235,.14)' },
  'en-obra':       { label: 'En obra',       color: '#B8862A', bg: 'rgba(184,134,42,.16)' },
  'entregado':     { label: 'Entregado',     color: '#15795C', bg: 'rgba(21,121,92,.16)' },
  'pausado':       { label: 'Pausado',       color: '#5B6680', bg: 'rgba(91,102,128,.16)' },
};

const ScreenProyectos = ({ onGoto, onToast }) => {
  const empresa = window.getEmpresaActual?.();
  const puedeGestionar = window.can?.('gestionar_proyectos') ?? false;
  const puedeEditarPlano = window.can?.('editar_plano') ?? false;
  const [empresas, setEmpresas] = React.useState(() => window.loadEmpresas?.() || []);
  const [ctx, setCtx] = window.useContexto?.(empresa?.id) || [{}, () => {}];
  const [modal, setModal] = React.useState(null);
  const [proyectoExpandido, setProyectoExpandido] = React.useState(null);

  const empresaActual = empresas.find(e => e.id === empresa?.id);
  const proyectos = empresaActual?.proyectos || [];

  React.useEffect(() => {
    if (!proyectoExpandido && ctx.proyectoId) setProyectoExpandido(ctx.proyectoId);
  }, [ctx.proyectoId]);

  // Cargar proyectos desde API y sincronizar con el store local
  React.useEffect(() => {
    if (!window.apiClient || !empresa?.id) return;
    window.apiClient('/api/proyectos').then(data => {
      if (!Array.isArray(data) || !data.length) return;
      const proyectosApi = data.map(p => ({
        id: p.id, nombre: p.nombre, ubicacion: p.ubicacion || '',
        descripcion: p.descripcion || '', estado: p.estado || 'preventa',
        fechaInicio: p.fecha_inicio || '', fechaEntrega: p.fecha_entrega || '',
        etapas: (p.etapas || []).map(e => ({
          id: e.id, nombre: e.nombre, estado: e.estado || 'preventa',
          lotes: e.lotes || 0, fechaInicio: e.fecha_inicio || '',
          fechaEntrega: e.fecha_entrega || '',
          planoAncho: null, planoAlto: null, planoFechaSubida: null, planoPesoKB: null,
        })),
      }));
      setEmpresas(prev => {
        const next = prev.map(emp => emp.id !== empresa.id ? emp : { ...emp, proyectos: proyectosApi });
        window.saveEmpresas?.(next);
        return next;
      });
    }).catch(() => {});
  }, [empresa?.id]);

  const persistEmpresas = (next) => {
    setEmpresas(next);
    window.saveEmpresas?.(next);
  };

  const guardarProyecto = async (data) => {
    const isNew = !data.id;
    if (window.apiClient) {
      try {
        const payload = { nombre: data.nombre, ubicacion: data.ubicacion, descripcion: data.descripcion, estado: data.estado, fechaInicio: data.fechaInicio || null, fechaEntrega: data.fechaEntrega || null };
        const result = isNew
          ? await window.apiClient('/api/proyectos', { method: 'POST', body: JSON.stringify(payload) })
          : await window.apiClient(`/api/proyectos/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (result?.id) {
          const proyecto = {
            id: result.id, nombre: result.nombre, ubicacion: result.ubicacion || '',
            descripcion: result.descripcion || '', estado: result.estado,
            fechaInicio: result.fecha_inicio || '', fechaEntrega: result.fecha_entrega || '',
            etapas: isNew ? [{ id:'e1', nombre:'Etapa 1', estado:'planificacion', lotes:0, fechaInicio:'', fechaEntrega:'' }] : proyectos.find(p => p.id === result.id)?.etapas || [],
          };
          persistEmpresas(empresas.map(e => e.id !== empresa.id ? e : {
            ...e, proyectos: isNew ? [...(e.proyectos || []), proyecto] : (e.proyectos || []).map(p => p.id === result.id ? { ...p, ...proyecto } : p),
          }));
          setModal(null);
          onToast?.(isNew ? '✓ Proyecto creado' : '✓ Proyecto actualizado');
          if (isNew) setProyectoExpandido(result.id);
          return;
        }
      } catch (err) { onToast?.('Error: ' + (err.message || 'No se pudo guardar')); return; }
    }
    const id = data.id || (data.nombre || 'proyecto').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,30) + '-' + Math.random().toString(36).slice(2,4);
    const proyecto = isNew
      ? { id, etapas: [{ id:'e1', nombre:'Etapa 1', estado:'planificacion', lotes:0, fechaInicio:'', fechaEntrega:'' }], ...data }
      : { ...proyectos.find(p => p.id === id), ...data, id };
    persistEmpresas(empresas.map(e => e.id === empresa.id ? { ...e, proyectos: isNew ? [...(e.proyectos || []), proyecto] : (e.proyectos || []).map(p => p.id === id ? proyecto : p) } : e));
    setModal(null);
    onToast?.(isNew ? '✓ Proyecto creado' : '✓ Proyecto actualizado');
    if (isNew) setProyectoExpandido(id);
  };

  const eliminarProyecto = async (p) => {
    if (proyectos.length === 1) { onToast?.('Debe haber al menos un proyecto'); return; }
    if (!window.confirm(`¿Eliminar el proyecto "${p.nombre}" y todas sus etapas?\n\nEsta acción no se puede deshacer.`)) return;
    if (window.apiClient) {
      try {
        await window.apiClient(`/api/proyectos/${p.id}`, { method: 'DELETE' });
      } catch (err) { onToast?.('Error al eliminar: ' + err.message); return; }
    }
    const next = empresas.map(e => e.id === empresa.id ? { ...e, proyectos: e.proyectos.filter(x => x.id !== p.id) } : e);
    persistEmpresas(next);
    if (ctx.proyectoId === p.id) {
      const otro = empresaActual.proyectos.find(x => x.id !== p.id);
      if (otro) setCtx({ proyectoId: otro.id, etapaId: otro.etapas?.[0]?.id || null });
    }
    onToast?.('Proyecto eliminado');
  };

  const guardarEtapa = async (proyectoId, data) => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    const isNew = !data.id;
    if (window.apiClient) {
      try {
        const payload = { nombre: data.nombre, estado: data.estado, lotes: data.lotes || 0, fechaInicio: data.fechaInicio || null, fechaEntrega: data.fechaEntrega || null };
        const result = isNew
          ? await window.apiClient(`/api/proyectos/${proyectoId}/etapas`, { method: 'POST', body: JSON.stringify(payload) })
          : await window.apiClient(`/api/proyectos/${proyectoId}/etapas/${data.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (result?.id) {
          const etapa = { id: result.id, nombre: result.nombre, estado: result.estado, lotes: result.lotes || 0, fechaInicio: result.fecha_inicio || '', fechaEntrega: result.fecha_entrega || '' };
          persistEmpresas(empresas.map(e => e.id !== empresa.id ? e : {
            ...e, proyectos: e.proyectos.map(p => p.id !== proyectoId ? p : ({
              ...p, etapas: isNew ? [...(p.etapas || []), etapa] : (p.etapas || []).map(x => x.id === etapa.id ? { ...x, ...etapa } : x),
            })),
          }));
          setModal(null);
          onToast?.(isNew ? '✓ Etapa creada' : '✓ Etapa actualizada');
          return;
        }
      } catch (err) { onToast?.('Error: ' + err.message); return; }
    }
    const id = data.id || 'e' + (Math.max(0, ...(proyecto.etapas || []).map(e => parseInt(e.id.replace(/\D/g,'') || '0', 10))) + 1);
    const etapa = isNew ? { id, ...data } : { ...proyecto.etapas.find(e => e.id === id), ...data, id };
    persistEmpresas(empresas.map(e => e.id !== empresa.id ? e : {
      ...e, proyectos: e.proyectos.map(p => p.id !== proyectoId ? p : ({
        ...p, etapas: isNew ? [...(p.etapas || []), etapa] : (p.etapas || []).map(x => x.id === id ? etapa : x),
      })),
    }));
    setModal(null);
    onToast?.(isNew ? '✓ Etapa creada' : '✓ Etapa actualizada');
  };

  const eliminarEtapa = async (proyectoId, e) => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    if (proyecto.etapas.length === 1) { onToast?.('El proyecto debe tener al menos una etapa'); return; }
    if (!window.confirm(`¿Eliminar la etapa "${e.nombre}"?`)) return;
    if (window.apiClient) {
      try {
        await window.apiClient(`/api/proyectos/${proyectoId}/etapas/${e.id}`, { method: 'DELETE' });
      } catch (err) { onToast?.('Error al eliminar etapa: ' + err.message); return; }
    }
    persistEmpresas(empresas.map(emp => emp.id !== empresa.id ? emp : {
      ...emp, proyectos: emp.proyectos.map(p => p.id !== proyectoId ? p : ({ ...p, etapas: p.etapas.filter(x => x.id !== e.id) })),
    }));
    if (ctx.etapaId === e.id) {
      const otra = proyecto.etapas.find(x => x.id !== e.id);
      if (otra) setCtx({ ...ctx, etapaId: otra.id });
    }
    onToast?.('Etapa eliminada');
  };

  const activarProyecto = (p) => {
    setCtx({ proyectoId: p.id, etapaId: p.etapas?.[0]?.id || null });
    onToast?.(`Trabajando en ${p.nombre}`);
  };
  const activarEtapa = (proyectoId, e) => {
    setCtx({ proyectoId, etapaId: e.id });
    onToast?.(`Etapa activa: ${e.nombre}`);
  };

  const guardarPlanoEtapa = async (proyectoId, etapaId, file) => {
    try {
      const { dataUrl, ancho, alto, peso } = await downscaleImagen(file);
      const ok = savePlanoImagen(empresa.id, proyectoId, etapaId, dataUrl);
      if (!ok) {
        onToast?.('✕ La imagen es muy pesada para el navegador. Intenta una versión más liviana.');
        return;
      }
      // Guardar metadata en la etapa (sin la imagen)
      const next = empresas.map(emp => emp.id !== empresa.id ? emp : ({
        ...emp,
        proyectos: emp.proyectos.map(p => p.id !== proyectoId ? p : ({
          ...p, etapas: p.etapas.map(et => et.id !== etapaId ? et : ({
            ...et,
            planoAncho: ancho, planoAlto: alto,
            planoFechaSubida: new Date().toISOString(),
            planoPesoKB: peso,
          }))
        }))
      }));
      persistEmpresas(next);
      window.dispatchEvent(new CustomEvent('mattika:contexto-cambiado'));
      onToast?.(`✓ Plano guardado (${ancho}×${alto}px · ${peso} KB)`);
      setModal(null);
    } catch (err) {
      onToast?.('✕ ' + (err.message || 'No se pudo procesar el plano'));
    }
  };

  const eliminarPlanoEtapa = (proyectoId, etapaId) => {
    if (!window.confirm('¿Eliminar el plano de esta etapa? Los polígonos dibujados se mantienen.')) return;
    deletePlanoImagen(empresa.id, proyectoId, etapaId);
    const next = empresas.map(emp => emp.id !== empresa.id ? emp : ({
      ...emp,
      proyectos: emp.proyectos.map(p => p.id !== proyectoId ? p : ({
        ...p, etapas: p.etapas.map(et => et.id !== etapaId ? et : ({
          ...et, planoAncho: null, planoAlto: null, planoFechaSubida: null, planoPesoKB: null,
        }))
      }))
    }));
    persistEmpresas(next);
    window.dispatchEvent(new CustomEvent('mattika:contexto-cambiado'));
    onToast?.('Plano eliminado');
  };

  if (!empresa) return <div className="page"><p className="muted">Sin sesión activa.</p></div>;

  return (
    <div className="page page-proyectos" data-screen-label="Proyectos">
      <div className="page-head">
        <div>
          <h1 className="page-title">Proyectos y etapas</h1>
          <div className="page-sub">
            Cada proyecto tiene sus propias etapas, lotes y cronograma de entrega.
            {' · '}<b>{empresa.nombre}</b>
          </div>
        </div>
        <div className="hstack gap-8">
          {puedeGestionar && (
            <button className="btn primary" onClick={() => setModal({ tipo: 'proyecto-nuevo' })}>
              <Icon name="plus" size={13}/> Nuevo proyecto
            </button>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="proy-stats">
        <div className="proy-stat"><b>{proyectos.length}</b><span>Proyectos</span></div>
        <div className="proy-stat"><b>{proyectos.reduce((s,p) => s + (p.etapas?.length || 0), 0)}</b><span>Etapas totales</span></div>
        <div className="proy-stat"><b>{proyectos.reduce((s,p) => s + (p.etapas || []).reduce((ss, e) => ss + (e.lotes || 0), 0), 0)}</b><span>Lotes proyectados</span></div>
        <div className="proy-stat ok"><b>{proyectos.filter(p => p.estado === 'en-obra' || p.estado === 'preventa').length}</b><span>En comercialización</span></div>
      </div>

      {/* Tarjetas de proyecto */}
      <div className="proy-list">
        {proyectos.length === 0 && (
          <div className="proy-empty">
            <div className="proy-empty-ic"><Icon name="layers" size={32}/></div>
            <div className="strong">Aún no hay proyectos</div>
            <p className="muted text-sm">Crea el primero para empezar a registrar etapas y lotes.</p>
          </div>
        )}

        {proyectos.map(p => {
          const exp = proyectoExpandido === p.id;
          const isActivo = ctx.proyectoId === p.id;
          const lotesTotal = (p.etapas || []).reduce((s, e) => s + (e.lotes || 0), 0);
          const estadoTok = ESTADO_PROYECTO[p.estado] || ESTADO_PROYECTO.planificacion;
          return (
            <article key={p.id} className={`proy-card ${exp ? 'expanded' : ''} ${isActivo ? 'activo' : ''}`}>
              <header className="proy-card-head" onClick={() => setProyectoExpandido(exp ? null : p.id)}>
                <button className="proy-card-expand" aria-label="Expandir">
                  <Icon name={exp ? 'chevronD' : 'chevronR'} size={14}/>
                </button>
                <div className="proy-card-title-block">
                  <div className="hstack gap-8" style={{flexWrap:'wrap'}}>
                    <h3>{p.nombre}</h3>
                    <span className="proy-estado-pill" style={{ color: estadoTok.color, background: estadoTok.bg }}>
                      <span className="dot" style={{background: estadoTok.color}}/>
                      {estadoTok.label}
                    </span>
                    {isActivo && (
                      <span className="proy-activo-pill">
                        <Icon name="check" size={10}/> Activo
                      </span>
                    )}
                  </div>
                  {p.ubicacion && <div className="muted text-xs" style={{marginTop:2}}>{p.ubicacion}</div>}
                </div>
                <div className="proy-card-meta">
                  <div><span>Etapas</span><b>{p.etapas?.length || 0}</b></div>
                  <div><span>Lotes</span><b>{lotesTotal}</b></div>
                  <div><span>Entrega</span><b className="mono">{p.fechaEntrega || '—'}</b></div>
                </div>
                <div className="proy-card-actions" onClick={(ev) => ev.stopPropagation()}>
                  {!isActivo && (
                    <button className="btn primary" onClick={() => activarProyecto(p)}>
                      Trabajar aquí
                    </button>
                  )}
                  {puedeGestionar && <button className="btn" onClick={() => setModal({ tipo:'proyecto-editar', p })}>Editar</button>}
                  {puedeGestionar && <button className="btn danger" onClick={() => eliminarProyecto(p)}>×</button>}
                </div>
              </header>

              {exp && (
                <div className="proy-card-body">
                  {p.descripcion && <p className="proy-desc">{p.descripcion}</p>}

                  <div className="proy-etapas-head">
                    <div className="strong text-sm">Etapas</div>
                    {puedeGestionar && (
                      <button className="btn ghost" onClick={() => setModal({ tipo:'etapa-nuevo', proyectoId: p.id })}>
                        <Icon name="plus" size={12}/> Nueva etapa
                      </button>
                    )}
                  </div>

                  <div className="proy-etapas-grid">
                    {(p.etapas || []).map(e => {
                      const isEtapaActiva = isActivo && ctx.etapaId === e.id;
                      const eTok = ESTADO_PROYECTO[e.estado] || ESTADO_PROYECTO.planificacion;
                      return (
                        <div key={e.id} className={`proy-etapa ${isEtapaActiva ? 'activa' : ''}`}>
                          <div className="proy-etapa-head">
                            <div className="flex1">
                              <div className="proy-etapa-name">{e.nombre}</div>
                              <div className="proy-etapa-state" style={{ color: eTok.color, background: eTok.bg }}>
                                <span className="dot" style={{background: eTok.color}}/>
                                {eTok.label}
                              </div>
                            </div>
                            {isEtapaActiva && <span className="proy-activo-pill"><Icon name="check" size={10}/> Activa</span>}
                          </div>
                          <div className="proy-etapa-meta">
                            <div><span>Lotes</span><b>{e.lotes || 0}</b></div>
                            <div><span>Inicio</span><b className="mono">{e.fechaInicio || '—'}</b></div>
                            <div><span>Entrega</span><b className="mono">{e.fechaEntrega || '—'}</b></div>
                          </div>

                          {/* Plano de la etapa */}
                          <div className="proy-etapa-plano">
                            {e.planoFechaSubida ? (
                              <>
                                <div className="proy-etapa-plano-thumb">
                                  <img alt={`Plano ${e.nombre}`} src={loadPlanoImagen(empresa.id, p.id, e.id) || ''}/>
                                </div>
                                <div className="flex1 minw0">
                                  <div className="strong text-xs">Plano cargado</div>
                                  <div className="muted text-xs">
                                    {e.planoAncho}×{e.planoAlto}px · {e.planoPesoKB} KB
                                  </div>
                                </div>
                                {puedeEditarPlano && (
                                  <button className="btn" onClick={() => setModal({ tipo:'plano-subir', proyectoId: p.id, etapaId: e.id, etapaNombre: e.nombre })}>
                                    <Icon name="refresh" size={11}/>
                                  </button>
                                )}
                                {puedeEditarPlano && (
                                  <button className="btn danger" onClick={() => eliminarPlanoEtapa(p.id, e.id)}>×</button>
                                )}
                              </>
                            ) : (
                              puedeEditarPlano ? (
                                <button className="proy-etapa-plano-empty"
                                        onClick={() => setModal({ tipo:'plano-subir', proyectoId: p.id, etapaId: e.id, etapaNombre: e.nombre })}>
                                  <Icon name="upload" size={13}/>
                                  <span>Subir plano de la etapa</span>
                                </button>
                              ) : (
                                <div className="muted text-xs" style={{padding:'8px 4px'}}>
                                  <Icon name="info" size={11}/> Sin plano cargado
                                </div>
                              )
                            )}
                          </div>
                          <div className="proy-etapa-actions">
                            {isActivo && !isEtapaActiva && (
                              <button className="btn" onClick={() => activarEtapa(p.id, e)}>
                                <Icon name="check" size={11}/> Activar
                              </button>
                            )}
                            {puedeGestionar && (
                              <button className="btn" onClick={() => setModal({ tipo:'etapa-editar', proyectoId: p.id, e })}>
                                <Icon name="edit" size={11}/>
                              </button>
                            )}
                            {puedeGestionar && (
                              <button className="btn danger" onClick={() => eliminarEtapa(p.id, e)}>×</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Aviso si las condiciones son por empresa */}
      <div className="proy-info-banner">
        <div className="proy-info-ic"><Icon name="info" size={14}/></div>
        <div className="flex1">
          <b>Cómo se relacionan con el resto del sistema</b>
          <p>El <b>plano</b>, los <b>lotes</b>, los <b>contratos</b> y los <b>pagos</b> se filtran por el proyecto y la etapa activos. Las <b>condiciones comerciales</b> se mantienen a nivel de empresa — si quieres condiciones distintas por proyecto, dímelo y lo habilitamos.</p>
        </div>
      </div>

      {modal?.tipo === 'proyecto-nuevo' || modal?.tipo === 'proyecto-editar' ? (
        <ProyectoModal
          initial={modal.tipo === 'proyecto-editar' ? modal.p : null}
          onClose={() => setModal(null)}
          onSave={guardarProyecto}
        />
      ) : null}
      {modal?.tipo === 'etapa-nuevo' || modal?.tipo === 'etapa-editar' ? (
        <EtapaModal
          proyectoNombre={proyectos.find(p => p.id === modal.proyectoId)?.nombre || ''}
          initial={modal.tipo === 'etapa-editar' ? modal.e : null}
          onClose={() => setModal(null)}
          onSave={(data) => guardarEtapa(modal.proyectoId, data)}
        />
      ) : null}
      {modal?.tipo === 'plano-subir' ? (
        <PlanoUploadModal
          etapaNombre={modal.etapaNombre}
          onClose={() => setModal(null)}
          onUpload={(file) => guardarPlanoEtapa(modal.proyectoId, modal.etapaId, file)}
        />
      ) : null}
    </div>
  );
};

// ── Modal: nuevo/editar proyecto ────────────────────────────────
const ProyectoModal = ({ initial, onClose, onSave }) => {
  const [f, setF] = React.useState(() => initial || {
    nombre:'', ubicacion:'', descripcion:'',
    estado:'planificacion',
    fechaInicio:'', fechaEntrega:'',
  });
  const submit = (ev) => { ev.preventDefault(); if (!f.nombre.trim()) return; onSave({ ...f, ...(initial ? { id: initial.id } : {}) }); };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" style={{maxWidth: 560}} onSubmit={submit}>
        <header>
          <h3>{initial ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <label className="auth-field">
            <span className="auth-label">Nombre del proyecto</span>
            <input type="text" value={f.nombre} onChange={(e) => setF({...f, nombre: e.target.value})} required placeholder="p.ej. Nápoles"/>
          </label>
          <label className="auth-field">
            <span className="auth-label">Ubicación</span>
            <input type="text" value={f.ubicacion} onChange={(e) => setF({...f, ubicacion: e.target.value})} placeholder="p.ej. Valle Chicama · Trujillo"/>
          </label>
          <label className="auth-field">
            <span className="auth-label">Descripción (opcional)</span>
            <textarea rows={3} value={f.descripcion} onChange={(e) => setF({...f, descripcion: e.target.value})}
                      style={{padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8, background:'var(--surface)', color:'var(--ink)', font:'inherit', fontSize:13.5, resize:'vertical'}}
                      placeholder="Breve descripción del proyecto…"/>
          </label>
          <label className="auth-field">
            <span className="auth-label">Estado actual</span>
            <div className="proy-estado-picker">
              {Object.entries(ESTADO_PROYECTO).map(([key, t]) => (
                <button type="button" key={key}
                        className={f.estado === key ? 'on' : ''}
                        onClick={() => setF({...f, estado: key})}
                        style={f.estado === key ? { color: t.color, background: t.bg, borderColor: t.color } : {}}>
                  <span className="dot" style={{background: t.color}}/>
                  {t.label}
                </button>
              ))}
            </div>
          </label>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Fecha de inicio</span>
              <input type="date" value={f.fechaInicio} onChange={(e) => setF({...f, fechaInicio: e.target.value})}/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Fecha de entrega</span>
              <input type="date" value={f.fechaEntrega} onChange={(e) => setF({...f, fechaEntrega: e.target.value})}/>
            </label>
          </div>
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{initial ? 'Guardar cambios' : 'Crear proyecto'}</button>
        </footer>
      </form>
    </div>
  );
};

// ── Modal: nuevo/editar etapa ───────────────────────────────────
const EtapaModal = ({ proyectoNombre, initial, onClose, onSave }) => {
  const [f, setF] = React.useState(() => initial || {
    nombre:'', estado:'planificacion', lotes:0, fechaInicio:'', fechaEntrega:'',
  });
  const submit = (ev) => { ev.preventDefault(); if (!f.nombre.trim()) return; onSave({ ...f, ...(initial ? { id: initial.id } : {}) }); };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" style={{maxWidth: 520}} onSubmit={submit}>
        <header>
          <h3>{initial ? 'Editar etapa' : 'Nueva etapa'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <div className="proy-modal-context">
            <span className="muted text-xs">Proyecto</span>
            <b>{proyectoNombre}</b>
          </div>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Nombre de la etapa</span>
              <input type="text" value={f.nombre} onChange={(e) => setF({...f, nombre: e.target.value})} required placeholder="Etapa 1 · Pacífico"/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Lotes proyectados</span>
              <input type="number" min="0" value={f.lotes} onChange={(e) => setF({...f, lotes: +e.target.value || 0})}/>
            </label>
          </div>
          <label className="auth-field">
            <span className="auth-label">Estado</span>
            <div className="proy-estado-picker">
              {Object.entries(ESTADO_PROYECTO).map(([key, t]) => (
                <button type="button" key={key}
                        className={f.estado === key ? 'on' : ''}
                        onClick={() => setF({...f, estado: key})}
                        style={f.estado === key ? { color: t.color, background: t.bg, borderColor: t.color } : {}}>
                  <span className="dot" style={{background: t.color}}/>
                  {t.label}
                </button>
              ))}
            </div>
          </label>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Fecha de inicio</span>
              <input type="date" value={f.fechaInicio} onChange={(e) => setF({...f, fechaInicio: e.target.value})}/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Fecha de entrega</span>
              <input type="date" value={f.fechaEntrega} onChange={(e) => setF({...f, fechaEntrega: e.target.value})}/>
            </label>
          </div>
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{initial ? 'Guardar cambios' : 'Crear etapa'}</button>
        </footer>
      </form>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// SELECTOR DE CONTEXTO (chip clickeable que vive en el topbar)
// ════════════════════════════════════════════════════════════════
const ContextoSwitcher = ({ empresa, onToast }) => {
  const [open, setOpen] = React.useState(false);
  const [ctx, setCtx] = window.useContexto?.(empresa?.id) || [{}, () => {}];
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const off = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);

  const proyecto = empresa?.proyectos?.find(p => p.id === ctx.proyectoId) || empresa?.proyectos?.[0];
  const etapa    = proyecto?.etapas?.find(e => e.id === ctx.etapaId) || proyecto?.etapas?.[0];

  if (!proyecto) return null;

  const cambiarProyecto = (p) => {
    setCtx({ proyectoId: p.id, etapaId: p.etapas?.[0]?.id || null });
    onToast?.(`Trabajando en ${p.nombre}`);
    setOpen(false);
  };
  const cambiarEtapa = (e) => {
    setCtx({ ...ctx, etapaId: e.id });
    onToast?.(`Etapa activa: ${e.nombre}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="ctx-switcher-wrap">
      <button className="empresa-chip" onClick={() => setOpen(v => !v)}>
        <span className="empresa-chip-dot" style={{ background: empresa?.color }}/>
        <b>{empresa?.nombre?.split(' ')[0] || 'Empresa'}</b>
        <span className="sep">·</span>
        <span className="proj">{proyecto?.nombre || '—'}</span>
        {etapa && empresa?.proyectos?.some(p => (p.etapas?.length || 0) > 1) && (
          <>
            <span className="sep">·</span>
            <span className="proj etapa">{etapa.nombre}</span>
          </>
        )}
        <Icon name="chevronD" size={11} style={{ color:'var(--muted-2)', marginLeft:2 }}/>
      </button>

      {open && (
        <div className="ctx-switcher-pop">
          <div className="ctx-pop-section">
            <div className="ctx-pop-title">
              <Icon name="layers" size={11}/> Proyectos de {empresa.nombre}
            </div>
            <div className="ctx-pop-list">
              {empresa.proyectos.map(p => {
                const sel = p.id === proyecto?.id;
                return (
                  <button key={p.id} className={`ctx-pop-item ${sel ? 'on' : ''}`} onClick={() => cambiarProyecto(p)}>
                    <span className="ctx-pop-dot" style={{ background: ESTADO_PROYECTO[p.estado]?.color || 'var(--muted)' }}/>
                    <div className="flex1 minw0">
                      <div className="ctx-pop-name">{p.nombre}</div>
                      <div className="ctx-pop-sub">
                        {p.etapas?.length || 0} etapa{p.etapas?.length === 1 ? '' : 's'} · {ESTADO_PROYECTO[p.estado]?.label || p.estado}
                      </div>
                    </div>
                    {sel && <Icon name="check" size={12} style={{color:'var(--brand)'}}/>}
                  </button>
                );
              })}
            </div>
          </div>

          {(proyecto?.etapas?.length || 0) > 1 && (
            <div className="ctx-pop-section">
              <div className="ctx-pop-title">
                <Icon name="layers" size={11}/> Etapa activa
              </div>
              <div className="ctx-pop-list">
                {proyecto.etapas.map(e => {
                  const sel = e.id === etapa?.id;
                  return (
                    <button key={e.id} className={`ctx-pop-item ${sel ? 'on' : ''}`} onClick={() => cambiarEtapa(e)}>
                      <span className="ctx-pop-dot" style={{ background: ESTADO_PROYECTO[e.estado]?.color || 'var(--muted)' }}/>
                      <div className="flex1 minw0">
                        <div className="ctx-pop-name">{e.nombre}</div>
                        <div className="ctx-pop-sub">
                          {e.lotes || 0} lotes · {ESTADO_PROYECTO[e.estado]?.label || e.estado}
                        </div>
                      </div>
                      {sel && <Icon name="check" size={12} style={{color:'var(--brand)'}}/>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="ctx-pop-footer">
            <button className="btn block" onClick={() => { setOpen(false); window.__appGoto?.('proyectos'); }}>
              <Icon name="settings" size={12}/> Administrar proyectos y etapas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Modal: subir plano ──────────────────────────────────────────
const PlanoUploadModal = ({ etapaNombre, onClose, onUpload }) => {
  const [file, setFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [meta, setMeta] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const onFileChosen = (f) => {
    if (!f) return;
    if (!/image\/(png|jpe?g|webp)/i.test(f.type)) {
      alert('Formato no soportado. Usa PNG, JPG o WebP.');
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      alert('La imagen pesa más de 12 MB. Reduce su tamaño antes de subir.');
      return;
    }
    setFile(f);
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => setMeta({ w: img.naturalWidth, h: img.naturalHeight, sizeKB: Math.round(f.size / 1024) });
      img.src = r.result;
      setPreview(r.result);
    };
    r.readAsDataURL(f);
  };

  const onDrop = (ev) => {
    ev.preventDefault();
    const f = ev.dataTransfer.files?.[0];
    onFileChosen(f);
  };

  const confirmar = async () => {
    if (!file) return;
    setBusy(true);
    await onUpload(file);
    setBusy(false);
  };

  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mtk-modal" style={{maxWidth: 560}}>
        <header>
          <h3>Subir plano · {etapaNombre}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          {/* Recomendaciones */}
          <div className="plano-specs">
            <div className="plano-specs-title">Formato recomendado</div>
            <ul>
              <li><b>PNG</b> con fondo blanco o transparente (también acepta JPG / WebP)</li>
              <li>Relación ~ <b>7:5</b> · 2000–3000 px en el lado largo</li>
              <li>Norte hacia arriba · escala consistente</li>
              <li>Sin sombras ni marcas sobre los lotes — los polígonos se dibujan arriba</li>
              <li>El sistema reescala automáticamente a máx. 2800 px y comprime a JPG</li>
            </ul>
          </div>

          {/* Dropzone / input */}
          <label className="plano-drop"
                 onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('over'); }}
                 onDragLeave={(e) => e.currentTarget.classList.remove('over')}
                 onDrop={onDrop}>
            <input type="file" accept="image/png,image/jpeg,image/webp" style={{display:'none'}}
                   onChange={(e) => onFileChosen(e.target.files?.[0])}/>
            {!preview && (
              <div className="plano-drop-empty">
                <div className="plano-drop-ic"><Icon name="upload" size={24}/></div>
                <div className="strong">Arrastra el plano aquí o haz clic para elegir</div>
                <div className="muted text-xs">PNG, JPG o WebP · máx 12 MB</div>
              </div>
            )}
            {preview && (
              <div className="plano-drop-preview">
                <img src={preview} alt="Vista previa"/>
                <div className="plano-drop-info">
                  <div><span>Archivo</span><b className="mono">{file?.name}</b></div>
                  <div><span>Tamaño</span><b className="mono">{meta?.sizeKB ?? '…'} KB</b></div>
                  <div><span>Dimensiones</span><b className="mono">{meta?.w ?? '…'} × {meta?.h ?? '…'}</b></div>
                  <div><span>Proporción</span><b className="mono">{meta ? (meta.w/meta.h).toFixed(2) + ':1' : '…'}</b></div>
                </div>
              </div>
            )}
          </label>
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn primary" disabled={!file || busy} onClick={confirmar}>
            {busy ? <><span className="auth-spinner" style={{borderColor:'rgba(255,255,255,.4)', borderTopColor:'white'}}/> Subiendo…</> : <><Icon name="upload" size={13}/> Subir plano</>}
          </button>
        </footer>
      </div>
    </div>
  );
};

Object.assign(window, {
  ScreenProyectos, ContextoSwitcher,
  loadPlanoImagen, savePlanoImagen, deletePlanoImagen,
});
