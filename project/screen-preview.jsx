// screen-preview.jsx — Vista del paquete de 5 documentos generados
// para una venta.  Sidebar con tabs para alternar entre documentos
// y un botón único para descargar todos en PDF.

// ─── Render de un documento desde su plantilla ─────────────────
const RenderedDoc = ({ docId, data, firmaFisica, firmaFecha, firmaLugar }) => {
  const tpl = loadTemplate();
  const doc = tpl.documentos[docId];
  const vars = buildVars(data);
  const blocks = React.useMemo(() => parseDocumentText(doc.texto), [doc.texto]);
  const meta = DOC_TYPES.find(d => d.id === docId);

  const fechaFmt = firmaFecha ? fmtDate(firmaFecha) : '';

  return (
    <div className="doc-page contract">
      <div className="doc-header">
        <div className="corp">{EMPRESA.razonSocial.replace('S.A.C.','').trim()} · {meta.tag}</div>
        <div className="corp-mark">{data.inmueble.proyecto}</div>
      </div>

      <h1 dangerouslySetInnerHTML={{__html:
        renderTextHtml(doc.titulo, vars) + (doc.subtitulo ? '<br/>' + renderTextHtml(doc.subtitulo, vars) : '')
      }}/>

      {blocks.map((b, i) => (
        <RenderBlock key={i} b={b} vars={vars} cronograma={data.cronograma} compradorA={data.compradorA} preview={false}/>
      ))}

      {firmaFisica && (
        <div style={{
          marginTop: 36,
          padding: '14px 18px',
          border: '1.5px solid #15795C',
          background: '#F1FBF6',
          color: '#0E5B43',
          borderRadius: 4,
          textAlign: 'center',
          fontFamily: 'var(--font-sans)',
          fontSize: '10pt',
          letterSpacing: '.04em',
        }}>
          <div style={{fontWeight:700, textTransform:'uppercase', letterSpacing:'.12em', fontSize:'9pt'}}>
            ✓ Documento firmado físicamente
          </div>
          <div style={{marginTop:4, color:'#1a4a3a'}}>
            {firmaLugar || '—'} · {fechaFmt || '—'}
          </div>
        </div>
      )}

      <div className="doc-footer-note">
        Documento {meta.label} · Generado por Mattika System · {fmtDate(data.meta.fechaContrato)}
        {firmaFisica && ' · Firma física registrada'}
      </div>
    </div>
  );
};

// ─── Pantalla principal ────────────────────────────────────────
const ScreenPreview = ({ data, onBack, onToast }) => {
  const [activeDoc, setActiveDoc] = React.useState('separacion');
  const [signOpen, setSignOpen] = React.useState(false);
  const [waOpen, setWaOpen] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState(null); // doc id o 'ALL'
  const [batchProgress, setBatchProgress] = React.useState(null);
  const [firmaFisica, setFirmaFisica] = React.useState(false);
  const [firmaFecha, setFirmaFecha] = React.useState(() => new Date().toISOString().slice(0,10));
  const [firmaLugar, setFirmaLugar] = React.useState('Trujillo');

  const { compradorA, inmueble, meta } = data;
  const nombre = `${compradorA.nombres} ${compradorA.apellidos}`.toUpperCase();
  const ventaCode = `MTK-2026-0185`;

  // ── Renderiza un documento en un contenedor temporal off-screen
  //    y lo exporta a PDF en tamaño A4 fiel (210x297mm = 794x1123 px @ 96dpi).
  //    Aislado de la pantalla visible para que no dependa del estado activo.
  const renderAndDownload = async (docId) => {
    if (!window.html2pdf) throw new Error('Librería PDF no cargada');

    const A4_W = 794;  // A4 width @ 96dpi (210mm)

    const container = document.createElement('div');
    container.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_W}px;background:#fff;z-index:-9999;`;
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(<RenderedDoc docId={docId} data={data} firmaFisica={firmaFisica} firmaFecha={firmaFecha} firmaLugar={firmaLugar}/>);

    // Esperar a que React monte y las fuentes/layout estabilicen
    await new Promise(r => setTimeout(r, 350));
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch(e) {}
    }

    const el = container.querySelector('.doc-page');
    const docMeta = DOC_TYPES.find(d => d.id === docId);
    const idx = DOC_TYPES.findIndex(d => d.id === docId) + 1;
    const apellido = (compradorA.apellidos || 'doc').replace(/\s+/g,'_');
    const filename = `${String(idx).padStart(2,'0')}-${docMeta.label.replace(/[^\w\s]/g,'').replace(/\s+/g,'-')}-${apellido}.pdf`;

    try {
      if (!el) throw new Error('Documento no renderizado');
      // Forzar ancho exacto A4 para que html2canvas capture al tamaño correcto
      el.style.width = A4_W + 'px';
      el.style.maxWidth = 'none';
      el.style.boxShadow = 'none';
      await window.html2pdf().set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: A4_W,
          width: A4_W,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.doc-sign-row'] },
      }).from(el).save();
    } finally {
      // Limpieza siempre
      setTimeout(() => {
        try { root.unmount(); } catch(e) {}
        try { container.remove(); } catch(e) {}
      }, 100);
    }
  };

  // ── Descargar un solo documento
  const downloadOne = async (docId) => {
    if (downloadingId) return;
    setDownloadingId(docId);
    const docMeta = DOC_TYPES.find(d => d.id === docId);
    try {
      await renderAndDownload(docId);
      onToast(`✓ Descargado: ${docMeta.label}`);
    } catch (e) {
      console.error('downloadOne error:', e);
      onToast(`✗ Error: ${e.message || 'no se pudo generar el PDF'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Descargar TODOS uno por uno, secuencialmente
  const downloadAll = async () => {
    if (downloadingId) return;
    setDownloadingId('ALL');
    const errores = [];
    for (let i = 0; i < DOC_TYPES.length; i++) {
      const d = DOC_TYPES[i];
      setBatchProgress({ i: i + 1, total: DOC_TYPES.length, label: d.label });
      try {
        await renderAndDownload(d.id);
        // Pequeña pausa para que el navegador no agrupe descargas
        await new Promise(r => setTimeout(r, 700));
      } catch (e) {
        console.error(`Error descargando ${d.id}:`, e);
        errores.push(d.label);
      }
    }
    setBatchProgress(null);
    setDownloadingId(null);
    if (errores.length === 0) {
      onToast(`✓ Descargados ${DOC_TYPES.length} documentos`);
    } else {
      onToast(`Descargados ${DOC_TYPES.length - errores.length}/${DOC_TYPES.length}. Falló: ${errores.join(', ')}`);
    }
  };

  return (
    <div className="page" data-screen-label="Venta generada" style={{maxWidth:1400}}>
      <div className="page-head">
        <div>
          <button className="btn ghost sm" onClick={onBack} style={{marginBottom:8, marginLeft:-10}}>
            <Icon name="arrowL" size={13}/> Volver
          </button>
          <h1 className="page-title">Paquete de venta generado</h1>
          <div className="page-sub hstack gap-8" style={{flexWrap:'wrap'}}>
            <span className="mono">{ventaCode}</span>
            <span style={{color:'var(--border-strong)'}}>·</span>
            <span>{nombre} · DNI {compradorA.dni}</span>
            <span style={{color:'var(--border-strong)'}}>·</span>
            <span className="pill brand"><span className="dot"/>6 documentos</span>
            {firmaFisica && (
              <span className="firmado-pill" title={`Firmado físicamente el ${fmtDate(firmaFecha)} en ${firmaLugar}`}>
                <Icon name="check" size={12}/> Firmado físicamente
              </span>
            )}
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={onBack}><Icon name="edit" size={14}/> Editar datos</button>
        </div>
      </div>

      <div className="doc-wrap">
        {/* Visor: pestañas + documento activo */}
        <div className="vstack gap-12">
          <div className="doc-tabs">
            {DOC_TYPES.map((d, i) => (
              <button key={d.id}
                      className={`doc-tab ${activeDoc===d.id ? 'active' : ''}`}
                      onClick={() => setActiveDoc(d.id)}>
                <span className="seq">{String(i+1).padStart(2,'0')}</span>
                <span className="tab-label">{d.label}</span>
                <span className="tab-tag">{d.tag}</span>
              </button>
            ))}
          </div>

          <div>
            <div className="doc-scroll">
              <RenderedDoc docId={activeDoc} data={data} firmaFisica={firmaFisica} firmaFecha={firmaFecha} firmaLugar={firmaLugar}/>
            </div>
          </div>
        </div>

        {/* Sidebar de acciones */}
        <aside className="vstack gap-16 actions-card">
          {/* Estado de firma física */}
          <div className="sign-status-card" data-signed={firmaFisica ? 'true' : 'false'}>
            <label className="sign-status-row">
              <input type="checkbox"
                checked={firmaFisica}
                onChange={(e) => {
                  setFirmaFisica(e.target.checked);
                  if (e.target.checked) onToast('✓ Marcado como firmado físicamente');
                }}
                style={{position:'absolute', opacity:0, pointerEvents:'none'}}
              />
              <span className="sign-check" aria-hidden="true"/>
              <span className="flex1">
                <span className="sign-status-title">
                  {firmaFisica ? 'Firmado físicamente' : 'Marcar como firmado físicamente'}
                </span>
                <span className="sign-status-desc">
                  {firmaFisica
                    ? `Registro de firma manual del paquete.`
                    : 'Indica que el cliente ya firmó los documentos impresos.'}
                </span>
              </span>
            </label>
            {firmaFisica && (
              <div className="sign-meta">
                <div className="field">
                  <label className="field-label">Fecha</label>
                  <input className="input" type="date" value={firmaFecha} onChange={(e)=>setFirmaFecha(e.target.value)}/>
                </div>
                <div className="field">
                  <label className="field-label">Lugar</label>
                  <input className="input" value={firmaLugar} onChange={(e)=>setFirmaLugar(e.target.value)} placeholder="Lugar de firma"/>
                </div>
              </div>
            )}
          </div>
          {/* Acción principal: descarga */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Descargar PDFs</div>
              {batchProgress && (
                <span className="muted text-xs">{batchProgress.i}/{batchProgress.total} · {batchProgress.label}</span>
              )}
            </div>
            <div className="vstack gap-8" style={{padding:14}}>
              <button className="btn primary block lg" onClick={downloadAll} disabled={!!downloadingId}>
                <Icon name="download" size={15}/>
                {downloadingId === 'ALL' ? `Descargando ${batchProgress?.i || 0}/${DOC_TYPES.length}...` : `Descargar los ${DOC_TYPES.length} documentos`}
              </button>
              <div className="muted text-xs center" style={{padding:'2px 0'}}>
                Se descargan como PDFs separados, uno por documento.
              </div>
              <div className="divider"/>
              <button className="btn block" onClick={() => setSignOpen(true)}>
                <Icon name="signature" size={14}/> Solicitar firma digital
              </button>
              <button className="btn block" onClick={() => setWaOpen(true)}>
                <Icon name="whatsapp" size={14}/> Enviar por WhatsApp
              </button>
              <button className="btn block" onClick={() => {
                const to = compradorA.email || window.prompt('Correo del cliente:', '');
                if (!to) return;
                window.enviarCorreo?.({
                  tipo: 'contrato',
                  destinatario: to,
                  destinatarioNombre: `${compradorA.nombres} ${compradorA.apellidos}`,
                  asunto: `Documentos de compraventa · ${inmueble.proyecto} · Lote ${inmueble.unidad}-${inmueble.manzana}`,
                  cuerpo: `Estimado/a ${compradorA.nombres},\n\nLe hacemos llegar el paquete completo de documentos (6 documentos) correspondiente a la compra del Lote ${inmueble.unidad}, Manzana ${inmueble.manzana} en el proyecto ${inmueble.proyecto}.\n\nQuedamos atentos a cualquier consulta.\n\nSaludos cordiales.`,
                  adjuntos: ['01-Separacion.pdf', '02-Compraventa.pdf', '03-Cronograma.pdf', '04-Tratamiento-de-Datos.pdf', '05-Declaracion-Jurada.pdf', '06-Anexos.pdf'],
                });
                onToast(`Documentos enviados a ${to}`);
              }}>
                <Icon name="mail" size={14}/> Enviar por correo
              </button>
              <button className="btn block" onClick={() => window.print()}>
                <Icon name="print" size={14}/> Imprimir / Guardar como PDF
              </button>
            </div>
          </div>

          {/* Lista de documentos con descarga individual */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Documentos del paquete</div>
              <span className="muted text-xs">click para ver · ↓ descargar</span>
            </div>
            <div style={{padding:'4px 0'}}>
              {DOC_TYPES.map((d, i) => {
                const isDownloading = downloadingId === d.id || downloadingId === 'ALL';
                return (
                  <div key={d.id}
                       className={`doc-row ${activeDoc===d.id ? 'active' : ''}`}
                       style={{cursor:'default'}}>
                    <button className="doc-row-main"
                            onClick={() => setActiveDoc(d.id)}>
                      <span className="seq">{String(i+1).padStart(2,'0')}</span>
                      <span className="flex1" style={{textAlign:'left'}}>
                        <span className="strong text-sm" style={{display:'block'}}>{d.label}</span>
                        <span className="muted text-xs">{d.tag}</span>
                      </span>
                    </button>
                    <button className="doc-row-dl"
                            onClick={() => downloadOne(d.id)}
                            disabled={!!downloadingId}
                            title={`Descargar ${d.label}`}>
                      {isDownloading
                        ? <span className="spinner"/>
                        : <Icon name="download" size={14}/>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Datos del contrato */}
          <div className="card card-pad">
            <div className="card-title mb-8">Datos de la venta</div>
            <div className="vstack gap-8">
              <KV k="Fecha" v={fmtDate(meta.fechaContrato)}/>
              <KV k="Lugar de firma" v={meta.lugarFirma || 'Trujillo'}/>
              <KV k="Asesor" v={[...(window.getAsesoresEmpresa?.()||[]), ...(window.ASESORES||[])].find(a=>a.id===meta.asesorId)?.name}/>
              <KV k="Proyecto" v={inmueble.proyecto}/>
              <KV k="Unidad" v={`${inmueble.tipoInmueble} ${inmueble.unidad} · Mz. ${inmueble.manzana}`}/>
            </div>
          </div>
        </aside>
      </div>

      {/* WhatsApp modal */}
      {waOpen && (
        <div className="modal-bg" onClick={()=>setWaOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="card-head">
              <div className="card-title hstack gap-8"><Icon name="whatsapp" size={16}/> Enviar por WhatsApp</div>
              <button className="icon-btn" onClick={()=>setWaOpen(false)}><Icon name="x" size={14}/></button>
            </div>
            <div className="card-pad vstack gap-12">
              <div className="field">
                <label className="field-label">Destinatario</label>
                <select className="select" defaultValue="A">
                  <option value="A">{nombre} · +51 {compradorA.telefono}</option>
                  <option value="X">Otro número…</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Mensaje</label>
                <textarea className="textarea" defaultValue={`Estimad@ ${compradorA.nombres}, le hacemos llegar el paquete completo de documentos (6 documentos) correspondiente a la compra del ${inmueble.tipoInmueble.toLowerCase()} ${inmueble.unidad}, Mz. ${inmueble.manzana} del proyecto ${inmueble.proyecto}. Cualquier consulta estamos a su disposición. — Equipo ${EMPRESA.razonSocial.replace('S.A.C.','').trim()}.`}/>
              </div>
              <div className="vstack gap-6">
                {DOC_TYPES.map((d, i) => (
                  <label key={d.id} className="hstack gap-8">
                    <input type="checkbox" defaultChecked/>
                    <span className="text-sm">{String(i+1).padStart(2,'0')}. {d.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
              <button className="btn" onClick={()=>setWaOpen(false)}>Cancelar</button>
              <button className="btn primary" onClick={()=>{setWaOpen(false); onToast('Documentos enviados por WhatsApp');}}>
                <Icon name="send" size={13}/> Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Firma digital modal */}
      {signOpen && (
        <div className="modal-bg" onClick={()=>setSignOpen(false)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <div className="card-head">
              <div className="card-title hstack gap-8"><Icon name="signature" size={16}/> Solicitar firma digital</div>
              <button className="icon-btn" onClick={()=>setSignOpen(false)}><Icon name="x" size={14}/></button>
            </div>
            <div className="card-pad vstack gap-12">
              <div className="page-sub">Los firmantes recibirán un enlace para firmar los 6 documentos del paquete con validez legal.</div>
              <div className="vstack gap-8">
                {[
                  { who: EMPRESA.razonSocial, sub: 'gerencia@terrenopolis.pe' },
                  { who: nombre, sub: compradorA.email || `+51 ${compradorA.telefono}` },
                ].map((s, i) => (
                  <div key={i} className="hstack gap-10" style={{padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8}}>
                    <div className="avatar sm">{s.who.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                    <div className="flex1">
                      <div style={{fontSize:13, fontWeight:500}}>{s.who}</div>
                      <div className="muted text-xs">{s.sub}</div>
                    </div>
                    <span className="pill outline">Pendiente</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:14, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:8}}>
              <button className="btn" onClick={()=>setSignOpen(false)}>Cancelar</button>
              <button className="btn primary" onClick={()=>{setSignOpen(false); onToast('Solicitudes de firma enviadas');}}>
                <Icon name="send" size={13}/> Enviar solicitudes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KV = ({ k, v }) => (
  <div className="hstack between gap-12" style={{alignItems:'flex-start'}}>
    <span className="muted text-sm">{k}</span>
    <span className="strong text-sm" style={{textAlign:'right'}}>{v || '—'}</span>
  </div>
);

Object.assign(window, { ScreenPreview, RenderedDoc });
