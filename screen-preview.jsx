// screen-preview.jsx — Vista del paquete de 5 documentos generados
// para una venta.  Sidebar con tabs para alternar entre documentos
// y un botón único para descargar todos en PDF.

// ─── Export a Word (.doc) ──────────────────────────────────────
// Convierte un nodo .doc-page renderizado a HTML compatible con Word:
// las filas de firma (CSS grid) se transforman en una tabla, y los
// resaltados de variables se vuelven texto plano en negrita.
const _cmToPt = (cm) => (cm * 28.35).toFixed(1);

function docNodeToWordHtml(node) {
  const clone = node.cloneNode(true);
  // Quitar chrome que no va al Word
  clone.querySelectorAll('.doc-footer-note').forEach(n => n.remove());
  // TODO EL CONTRATO EN MAYÚSCULAS — Word ignora text-transform de CSS, así que
  // convertimos el texto real a mayúsculas recorriendo los nodos de texto.
  const upper = (el) => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(n => { n.nodeValue = (n.nodeValue || '').toUpperCase(); });
  };
  upper(clone);
  // Filas de firma: grid → tabla (Word no soporta grid/flex)
  clone.querySelectorAll('.doc-sign-row').forEach(row => {
    const cells = [...row.querySelectorAll('.doc-sign')];
    if (!cells.length) return;
    const table = document.createElement('table');
    table.setAttribute('style', 'width:100%;border-collapse:collapse;margin-top:48pt;');
    const tr = document.createElement('tr');
    cells.forEach(c => {
      const td = document.createElement('td');
      td.setAttribute('style', 'vertical-align:top;text-align:center;font-size:10pt;padding:6pt 12pt 0;border:none;border-top:1px solid #000;');
      td.innerHTML = c.innerHTML;
      tr.appendChild(td);
    });
    table.appendChild(tr);
    row.replaceWith(table);
  });
  // Resaltados de variables → negrita simple
  clone.querySelectorAll('.fill').forEach(s => s.setAttribute('style', 'font-weight:bold;'));
  return clone.innerHTML;
}

function buildWordDocHtml(innerHtml, pagina) {
  const num = (v, d) => (v === '' || v == null || isNaN(+v)) ? d : +v;
  const mT = num(pagina?.margenSup, 2), mB = num(pagina?.margenInf, 2);
  const mL = num(pagina?.margenIzq, 2), mR = num(pagina?.margenDer, 2);
  // Ajustes de tabla configurables
  const tblFs = num(pagina?.tablaFontSize, 8.5);
  const padW = { compacta: '1pt 4pt', normal: '2.5pt 5pt', amplia: '5pt 9pt' }[pagina?.tablaDensidad] || '1pt 4pt';
  const tblBorder = pagina?.tablaBorde === 'sutil' ? '1px solid #c9c2b2' : '1px solid #333';
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Documentos</title>
<style>
@page Section1 { size:595.3pt 841.9pt; margin:${_cmToPt(mT)}pt ${_cmToPt(mR)}pt ${_cmToPt(mB)}pt ${_cmToPt(mL)}pt; mso-page-orientation:portrait; }
div.Section1 { page:Section1; }
body { font-family:'Montserrat','Segoe UI',sans-serif; font-size:9pt; line-height:1.5; color:#000; text-transform:uppercase; }
h1 { font-size:11pt; text-align:center; text-transform:uppercase; font-weight:bold; margin:0 0 14pt; }
h2 { font-size:9.5pt; text-transform:uppercase; font-weight:bold; margin:14pt 0 7pt; }
p { margin:0 0 8pt; text-align:justify; }
ol,ul { margin:0 0 8pt 24pt; }
li { margin-bottom:4pt; text-align:justify; }
table { border-collapse:collapse; width:100%; margin:8pt 0; }
.crono-inline td, .crono-inline th { border:${tblBorder}; padding:${padW}; font-size:${tblFs}pt; text-align:center; line-height:1.15; }
.docbreak { page-break-before:always; }
.doc-header { text-align:center; border-bottom:1.5px solid #222; padding-bottom:10pt; margin-bottom:18pt; }
.doc-header .corp { font-size:9pt; letter-spacing:3pt; text-transform:uppercase; color:#555; }
.doc-header .corp-mark { font-size:18pt; font-style:italic; }
</style></head>
<body>${innerHtml}</body></html>`;
}

// ─── Render de un documento desde su plantilla ─────────────────
const RenderedDoc = ({ docId, data, firmaFisica, firmaFecha, firmaLugar }) => {
  const tpl = loadTemplate();
  const doc = tpl.documentos[docId];
  const vars = buildVars(data, tpl.bloqueComprador);
  const blocks = React.useMemo(() => parseDocumentText(resolveConditionals(doc.texto, vars._flags || {})), [doc.texto, data]);
  const meta = docTypesForPack(tpl).find(d => d.id === docId);

  const fechaFmt = firmaFecha ? fmtDate(firmaFecha) : '';

  // Formato de página configurable (márgenes en cm → px @96dpi: 1cm ≈ 37.8px)
  const pg = tpl.pagina || {};
  const CM = 37.8;
  const num = (v, d) => (v === '' || v == null || isNaN(+v)) ? d : +v;
  const mSup = num(pg.margenSup, 2), mInf = num(pg.margenInf, 2);
  const mIzq = num(pg.margenIzq, 2), mDer = num(pg.margenDer, 2);
  const reserva = num(pg.reservaMembrete, 0);
  const mostrarEnc = pg.mostrarEncabezado !== false;
  const mostrarPie = pg.mostrarPie !== false;
  // Ajustes de tabla configurables (cronograma / pagos)
  const tblFs = num(pg.tablaFontSize, 8.5);
  const padMap = { compacta: '1px 5px', normal: '3px 7px', amplia: '6px 11px' };
  const tblPad = padMap[pg.tablaDensidad] || padMap.compacta;
  const tblBorde = pg.tablaBorde === 'sutil' ? '1px solid #d8d2c4' : '1px solid #2a2a2a';
  // Lista de pagos de la inicial (fraccionada o pago único) para el cronograma
  const inicialPagos = (data.terminos?.inicialFraccionada && data.terminos?.pagosIniciales?.length)
    ? data.terminos.pagosIniciales
    : [{ etiqueta: 'Cuota inicial', monto: +(data.terminos?.inicial) || 0, fecha: data.meta?.fechaContrato }];
  const pageStyle = {
    paddingTop: ((mSup + reserva) * CM) + 'px',
    paddingBottom: (mInf * CM) + 'px',
    paddingLeft: (mIzq * CM) + 'px',
    paddingRight: (mDer * CM) + 'px',
    '--tbl-fs': tblFs + 'pt',
    '--tbl-head-fs': Math.max(6, tblFs - 0.5) + 'pt',
    '--tbl-pad': tblPad,
    '--tbl-border': tblBorde,
  };

  return (
    <div className="doc-page contract" style={pageStyle}>
      {mostrarEnc && (
        <div className="doc-header">
          <div className="corp">{EMPRESA.razonSocial.replace('S.A.C.','').trim()} · {meta.tag}</div>
          <div className="corp-mark">{data.inmueble.proyecto}</div>
        </div>
      )}

      <h1 dangerouslySetInnerHTML={{__html:
        renderTextHtml(doc.titulo, vars) + (doc.subtitulo ? '<br/>' + renderTextHtml(doc.subtitulo, vars) : '')
      }}/>

      {blocks.map((b, i) => (
        <RenderBlock key={i} b={b} vars={vars} cronograma={data.cronograma} pagosIniciales={data.terminos?.inicialFraccionada ? data.terminos.pagosIniciales : null} inicialPagos={inicialPagos} firmas={tpl.firmas} compradorA={data.compradorA} compradorB={data.compradorB} preview={false}/>
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

      {mostrarPie && (
        <div className="doc-footer-note">
          Documento {meta.label} · Generado por Mattika System · {fmtDate(data.meta.fechaContrato)}
          {firmaFisica && ' · Firma física registrada'}
        </div>
      )}
    </div>
  );
};

// ─── Pantalla principal ────────────────────────────────────────
const ScreenPreview = ({ data, onBack, onEdit, onToast }) => {
  const [activeDoc, setActiveDoc] = React.useState('separacion');
  const tplPack = React.useMemo(() => loadTemplate(), []);
  const docTypes = React.useMemo(() => docTypesForPack(tplPack), [tplPack]);
  const [signOpen, setSignOpen] = React.useState(false);
  const [waOpen, setWaOpen] = React.useState(false);
  const [downloadingId, setDownloadingId] = React.useState(null); // doc id o 'ALL'
  const [batchProgress, setBatchProgress] = React.useState(null);
  const [formato, setFormato] = React.useState(() => {
    try { return localStorage.getItem('mattika.descarga.formato') === 'word' ? 'word' : 'pdf'; } catch (e) { return 'pdf'; }
  });
  const setFormatoPersist = (f) => {
    setFormato(f);
    try { localStorage.setItem('mattika.descarga.formato', f); } catch (e) {}
  };
  const [firmaFisica, setFirmaFisica] = React.useState(() => data.status === 'firmado');
  const [firmaFecha, setFirmaFecha] = React.useState(() => new Date().toISOString().slice(0,10));
  const [firmaLugar, setFirmaLugar] = React.useState('Trujillo');

  const { compradorA, inmueble, meta } = data;
  const nombre = `${compradorA.nombres} ${compradorA.apellidos}`.toUpperCase();
  const ventaCode = data.code || 'MTK-2026-0185';
  // Nombre base de archivo: "Mz-Lote - NOMBRE COMPRADOR"
  const mzLote = `${(inmueble.manzana || '').trim()}-${(inmueble.unidad || '').trim()}`.replace(/^-|-$/g, '') || 'Lote';
  const nombreArchivo = `${mzLote} - ${nombre}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim();

  // Regla @page para el botón "Imprimir": márgenes A4 por empresa +
  // reserva de membrete en la primera página. Se inyecta y se limpia.
  React.useEffect(() => {
    const pg = tplPack.pagina || {};
    const num = (v, d) => (v === '' || v == null || isNaN(+v)) ? d : +v;
    const t = num(pg.margenSup, 2), b = num(pg.margenInf, 2);
    const l = num(pg.margenIzq, 2), r = num(pg.margenDer, 2);
    const reserva = num(pg.reservaMembrete, 0);
    const css = `@page { size: A4 portrait; margin: ${t}cm ${r}cm ${b}cm ${l}cm; }`
      + (reserva > 0 ? ` @page :first { margin-top: ${t + reserva}cm; }` : '');
    let st = document.getElementById('mattika-print-format');
    if (!st) { st = document.createElement('style'); st.id = 'mattika-print-format'; document.head.appendChild(st); }
    st.textContent = css;
    return () => { try { st.remove(); } catch (e) {} };
  }, [tplPack]);

  // Persistir estado de firma física en la venta guardada
  const marcarFirma = (checked) => {
    setFirmaFisica(checked);
    if (data.id) {
      try { window.setVentaEstado?.(window.getSesion?.()?.empresaId, data.id, checked ? 'firmado' : 'por-firmar'); } catch (e) {}
    }
    if (checked) onToast('✓ Marcado como firmado físicamente');
  };

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
    const docMeta = docTypes.find(d => d.id === docId);
    const idx = docTypes.findIndex(d => d.id === docId) + 1;
    const filename = `${nombreArchivo} - ${String(idx).padStart(2,'0')} ${docMeta.label.replace(/[^\w\sÁÉÍÓÚÑáéíóúñ]/g,'').trim()}.pdf`;

    try {
      if (!el) throw new Error('Documento no renderizado');
      // Forzar ancho exacto A4 para que html2canvas capture al tamaño correcto.
      // Los márgenes los aporta el PADDING del propio documento (definido por
      // el formato de página de la empresa), por eso html2pdf va con margin:0.
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

  // ── Descargar un solo documento (en el formato elegido)
  const downloadOne = async (docId) => {
    if (downloadingId) return;
    setDownloadingId(docId);
    const docMeta = docTypes.find(d => d.id === docId);
    const idx = docTypes.findIndex(d => d.id === docId) + 1;
    const base = `${nombreArchivo} - ${String(idx).padStart(2,'0')} ${docMeta.label.replace(/[^\w\sÁÉÍÓÚÑáéíóúñ]/g,'').trim()}`;
    try {
      if (formato === 'word') await exportWord([docId], base + '.doc');
      else await renderAndDownload(docId);
      onToast(`✓ Descargado: ${docMeta.label} (${formato.toUpperCase()})`);
    } catch (e) {
      console.error('downloadOne error:', e);
      onToast(`✗ Error: ${e.message || 'no se pudo generar'}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Descargar TODO el paquete (en el formato elegido)
  //    PDF → un archivo por documento. Word → un solo .doc con todo.
  const downloadAll = async () => {
    if (downloadingId) return;
    setDownloadingId('ALL');
    try {
      if (formato === 'word') {
        setBatchProgress({ i: 1, total: 1, label: 'Paquete Word' });
        await exportWord(docTypes.map(d => d.id), `${nombreArchivo}.doc`);
        onToast(`✓ Paquete Word descargado (${docTypes.length} documentos)`);
      } else {
        const errores = [];
        for (let i = 0; i < docTypes.length; i++) {
          const d = docTypes[i];
          setBatchProgress({ i: i + 1, total: docTypes.length, label: d.label });
          try {
            await renderAndDownload(d.id);
            await new Promise(r => setTimeout(r, 700));
          } catch (e) {
            console.error(`Error descargando ${d.id}:`, e);
            errores.push(d.label);
          }
        }
        if (errores.length === 0) onToast(`✓ Descargados ${docTypes.length} PDFs`);
        else onToast(`Descargados ${docTypes.length - errores.length}/${docTypes.length}. Falló: ${errores.join(', ')}`);
      }
    } finally {
      setBatchProgress(null);
      setDownloadingId(null);
    }
  };

  // ── Genera un .doc (Word) con los documentos indicados y lo descarga.
  //    Sirve para un solo documento o para todo el paquete.
  const exportWord = async (docIds, filename) => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-9999;';
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    try {
      await new Promise((res) => {
        root.render(
          <div>
            {docIds.map(id => (
              <RenderedDoc key={id} docId={id} data={data}
                firmaFisica={firmaFisica} firmaFecha={firmaFecha} firmaLugar={firmaLugar}/>
            ))}
          </div>
        );
        setTimeout(res, 400);
      });
      if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
      const nodes = [...container.querySelectorAll('.doc-page')];
      if (!nodes.length) throw new Error('No se renderizaron los documentos');
      const inner = nodes.map((n, i) =>
        `<div class="Section1${i > 0 ? ' docbreak' : ''}">${docNodeToWordHtml(n)}</div>`
      ).join('');
      const html = buildWordDocHtml(inner, tplPack.pagina);
      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally {
      try { root.unmount(); } catch (e) {}
      try { container.remove(); } catch (e) {}
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
            {data.compradorB && (data.compradorB.nombres || data.compradorB.apellidos) && (
              <>
                <span style={{color:'var(--border-strong)'}}>·</span>
                <span>+ {`${data.compradorB.nombres || ''} ${data.compradorB.apellidos || ''}`.trim().toUpperCase()}</span>
              </>
            )}
            <span style={{color:'var(--border-strong)'}}>·</span>
            <span className="pill accent"><span className="dot"/>{docTypes.length} documentos</span>
            {firmaFisica && (
              <span className="firmado-pill" title={`Firmado físicamente el ${fmtDate(firmaFecha)} en ${firmaLugar}`}>
                <Icon name="check" size={12}/> Firmado físicamente
              </span>
            )}
          </div>
        </div>
        <div className="hstack gap-8">
          <button className="btn" onClick={() => onEdit && onEdit(data)}><Icon name="edit" size={14}/> Editar datos</button>
        </div>
      </div>

      <div className="doc-wrap">
        {/* Visor: pestañas + documento activo */}
        <div className="vstack gap-12">
          <div className="doc-tabs">
            {docTypes.map((d, i) => (
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
                onChange={(e) => marcarFirma(e.target.checked)}
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
              <div className="card-title">Descargar</div>
              {batchProgress && (
                <span className="muted text-xs">{batchProgress.i}/{batchProgress.total} · {batchProgress.label}</span>
              )}
            </div>
            <div className="vstack gap-8" style={{padding:14}}>
              {/* Selector de formato: PDF o Word */}
              <div className="fmt-switch" role="tablist" aria-label="Formato de descarga">
                <button role="tab" aria-selected={formato==='pdf'}
                  className={`fmt-switch-opt${formato==='pdf'?' on':''}`}
                  onClick={() => setFormatoPersist('pdf')} disabled={!!downloadingId}>
                  <Icon name="doc" size={14}/> PDF
                </button>
                <button role="tab" aria-selected={formato==='word'}
                  className={`fmt-switch-opt${formato==='word'?' on':''}`}
                  onClick={() => setFormatoPersist('word')} disabled={!!downloadingId}>
                  <Icon name="doc" size={14}/> Word
                </button>
              </div>
              <button className="btn primary block lg" onClick={downloadAll} disabled={!!downloadingId}>
                <Icon name="download" size={15}/>
                {downloadingId === 'ALL'
                  ? `Generando ${batchProgress?.i || 0}/${formato==='word' ? 1 : docTypes.length}...`
                  : (formato==='word'
                      ? `Descargar paquete en Word`
                      : `Descargar los ${docTypes.length} PDFs`)}
              </button>
              <div className="muted text-xs center" style={{padding:'2px 0'}}>
                {formato==='word'
                  ? 'Un solo archivo .doc (A4, tus márgenes) — editable e ideal para membrete.'
                  : 'Un PDF por documento. Para uno solo, usa ↓ en la lista de abajo.'}
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
                  cuerpo: `Estimado/a ${compradorA.nombres},\n\nLe hacemos llegar el paquete completo de documentos (${docTypes.length} documentos) correspondiente a la compra del Lote ${inmueble.unidad}, Manzana ${inmueble.manzana} en el proyecto ${inmueble.proyecto}.\n\nQuedamos atentos a cualquier consulta.\n\nSaludos cordiales.`,
                  adjuntos: docTypes.map((d, i) => `${String(i+1).padStart(2,'0')}-${d.label.replace(/[^\w\s]/g,'').replace(/\s+/g,'-')}.${formato==='word'?'doc':'pdf'}`),
                });
                onToast(`Documentos enviados a ${to}`);
              }}>
                <Icon name="mail" size={14}/> Enviar por correo
              </button>
              <button className="btn block" onClick={() => window.print()}>
                <Icon name="print" size={14}/> Imprimir documento a la vista
              </button>
              <div className="muted text-xs center" style={{padding:'2px 0'}}>
                Imprime el documento que tienes abierto, en A4 con tus márgenes.
              </div>
            </div>
          </div>

          {/* Lista de documentos con descarga individual */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Documentos del paquete</div>
              <span className="muted text-xs">click para ver · ↓ descargar {formato.toUpperCase()}</span>
            </div>
            <div style={{padding:'4px 0'}}>
              {docTypes.map((d, i) => {
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
                            title={`Descargar ${d.label} en ${formato.toUpperCase()}`}>
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
                <textarea className="textarea" defaultValue={`Estimad@ ${compradorA.nombres}, le hacemos llegar el paquete completo de documentos (${docTypes.length} documentos) correspondiente a la compra del ${inmueble.tipoInmueble.toLowerCase()} ${inmueble.unidad}, Mz. ${inmueble.manzana} del proyecto ${inmueble.proyecto}. Cualquier consulta estamos a su disposición. — Equipo ${EMPRESA.razonSocial.replace('S.A.C.','').trim()}.`}/>
              </div>
              <div className="vstack gap-6">
                {docTypes.map((d, i) => (
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
              <div className="page-sub">Los firmantes recibirán un enlace para firmar los {docTypes.length} documentos del paquete con validez legal.</div>
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
