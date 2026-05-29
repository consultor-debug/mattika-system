// plano-satelite.jsx — Vista satelital del plano de ventas (georreferenciado).
// ════════════════════════════════════════════════════════════════
// Mapa satelital real (Esri World Imagery, sin API key) como fondo, con el
// plano de ventas superpuesto y los lotes clicables encima.
//
// Alineación 100%: el plano se ancla por sus CUATRO esquinas a coordenadas
// geográficas reales (transformación proyectiva / homografía). En "modo
// alineación" se arrastra cada esquina sobre el terreno, se afina con lat/lng
// exactos y se puede rotar. El plano y los lotes comparten la misma
// transformación, por lo que calzan siempre entre sí. Todo se guarda por
// alcance (empresa·proyecto·etapa).

const SAT_CORNERS_KEY = 'mattika.plano.satelite-corners.v1';

function loadSatCorners(scopeKey) {
  try { return JSON.parse(localStorage.getItem(`${SAT_CORNERS_KEY}.${scopeKey}`) || 'null'); }
  catch (e) { return null; }
}
function saveSatCorners(scopeKey, c) {
  try { localStorage.setItem(`${SAT_CORNERS_KEY}.${scopeKey}`, JSON.stringify(c)); } catch (e) {}
}

// Centro por defecto: valle Chicama, Razuri (Ascope, La Libertad) — zona de Nápoles.
const SAT_DEFAULT = { lat: -7.70395, lng: -79.42010, widthM: 720 };
const M_PER_DEG_LAT = 111320;

// Esquinas por defecto (rectángulo centrado) → {tl,tr,br,bl} en {lat,lng}
function defaultCorners(aspect) {
  const { lat, lng, widthM } = SAT_DEFAULT;
  const dLat = (widthM * aspect / 2) / M_PER_DEG_LAT;
  const dLng = (widthM / 2) / (M_PER_DEG_LAT * Math.cos(lat * Math.PI / 180));
  return {
    tl: { lat: lat + dLat, lng: lng - dLng },
    tr: { lat: lat + dLat, lng: lng + dLng },
    br: { lat: lat - dLat, lng: lng + dLng },
    bl: { lat: lat - dLat, lng: lng - dLng },
  };
}

// ── Álgebra de homografía 2D (mapea un rectángulo a un cuadrilátero) ──
function _adj(m) {
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
  ];
}
function _multmm(a, b) {
  const c = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    let s = 0; for (let k = 0; k < 3; k++) s += a[3*i+k] * b[3*k+j];
    c[3*i+j] = s;
  }
  return c;
}
function _multmv(m, v) {
  return [
    m[0]*v[0]+m[1]*v[1]+m[2]*v[2],
    m[3]*v[0]+m[4]*v[1]+m[5]*v[2],
    m[6]*v[0]+m[7]*v[1]+m[8]*v[2],
  ];
}
function _basisToPoints(x1,y1,x2,y2,x3,y3,x4,y4) {
  const m = [x1,x2,x3, y1,y2,y3, 1,1,1];
  const v = _multmv(_adj(m), [x4,y4,1]);
  return _multmm(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
}
function _general2D(s, d) {
  return _multmm(d, _adj(s));
}
// Devuelve un string matrix3d() que mapea (0,0)-(W,H) a los 4 puntos px [tl,tr,br,bl]
function homographyMatrix3d(W, H, pts) {
  const s = _basisToPoints(0,0, W,0, W,H, 0,H);
  const d = _basisToPoints(pts[0].x,pts[0].y, pts[1].x,pts[1].y, pts[2].x,pts[2].y, pts[3].x,pts[3].y);
  const t = _general2D(s, d);
  for (let i = 0; i < 9; i++) t[i] = t[i] / t[8];
  const m = [t[0],t[3],0,t[6], t[1],t[4],0,t[7], 0,0,1,0, t[2],t[5],0,t[8]];
  return 'matrix3d(' + m.join(',') + ')';
}

// Mueve las 4 esquinas la misma distancia (traslada todo el plano)
function translateCorners(c, dLat, dLng) {
  const o = {};
  ['tl','tr','br','bl'].forEach(k => { o[k] = { lat: c[k].lat + dLat, lng: c[k].lng + dLng }; });
  return o;
}
function cornersCentroid(c) {
  return {
    lat: (c.tl.lat + c.tr.lat + c.br.lat + c.bl.lat) / 4,
    lng: (c.tl.lng + c.tr.lng + c.br.lng + c.bl.lng) / 4,
  };
}

// Rota/escala las 4 esquinas alrededor de su centro (en plano métrico local)
function transformCorners(corners, { rotDeg = 0, scale = 1 }) {
  const ks = ['tl','tr','br','bl'];
  const clat = ks.reduce((s,k) => s + corners[k].lat, 0) / 4;
  const clng = ks.reduce((s,k) => s + corners[k].lng, 0) / 4;
  const mLat = M_PER_DEG_LAT;
  const mLng = M_PER_DEG_LAT * Math.cos(clat * Math.PI / 180);
  const rad = rotDeg * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const out = {};
  ks.forEach(k => {
    let x = (corners[k].lng - clng) * mLng;
    let y = (corners[k].lat - clat) * mLat;
    x *= scale; y *= scale;
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    out[k] = { lat: clat + ry / mLat, lng: clng + rx / mLng };
  });
  return out;
}

// ── Capa Leaflet personalizada: plano (img) + lotes (svg) bajo una misma
//    transformación proyectiva, anclada a 4 esquinas geográficas. ──
let RotatedGroup = null;
function ensureRotatedGroup() {
  if (RotatedGroup || !window.L) return RotatedGroup;
  const L = window.L;
  RotatedGroup = L.Layer.extend({
    initialize: function (imgUrl, svgEl, W, H, opts) {
      this._url = imgUrl; this._svg = svgEl; this._W = W; this._H = H;
      this._corners = null; this._opacity = (opts && opts.opacity) != null ? opts.opacity : 0.62;
    },
    onAdd: function (map) {
      this._map = map;
      const pane = map.getPane('overlayPane');
      const c = this._container = L.DomUtil.create('div', 'rot-group', pane);
      c.style.position = 'absolute';
      c.style.transformOrigin = '0 0';
      c.style.willChange = 'transform';
      c.style.pointerEvents = 'none';
      c.style.width = this._W + 'px';
      c.style.height = this._H + 'px';
      if (this._url) {
        const img = this._img = L.DomUtil.create('img', '', c);
        img.src = this._url;
        img.style.cssText = `position:absolute;left:0;top:0;width:${this._W}px;height:${this._H}px;pointer-events:none;opacity:${this._opacity};`;
        img.draggable = false;
      }
      if (this._svg) {
        this._svg.style.position = 'absolute';
        this._svg.style.left = '0'; this._svg.style.top = '0';
        this._svg.setAttribute('width', this._W);
        this._svg.setAttribute('height', this._H);
        this._svg.style.pointerEvents = 'auto';
        c.appendChild(this._svg);
      }
      map.on('zoom viewreset move zoomanim', this._reset, this);
      this._reset();
    },
    onRemove: function (map) {
      map.off('zoom viewreset move zoomanim', this._reset, this);
      L.DomUtil.remove(this._container);
    },
    setCorners: function (corners) { this._corners = corners; this._reset(); return this; },
    setOpacity: function (o) { this._opacity = o; if (this._img) this._img.style.opacity = o; return this; },
    setUrl: function (url) {
      this._url = url;
      if (this._img) this._img.src = url || '';
      return this;
    },
    replaceSvg: function (svgEl) {
      if (this._svg && this._svg.parentNode) this._svg.parentNode.removeChild(this._svg);
      this._svg = svgEl;
      if (svgEl && this._container) {
        svgEl.style.position = 'absolute'; svgEl.style.left = '0'; svgEl.style.top = '0';
        svgEl.setAttribute('width', this._W); svgEl.setAttribute('height', this._H);
        svgEl.style.pointerEvents = 'auto';
        this._container.appendChild(svgEl);
      }
      this._reset();
    },
    _reset: function (e) {
      if (!this._corners || !this._map) return;
      const map = this._map;
      const proj = (ll) => (e && e.zoom !== undefined)
        ? map._latLngToNewLayerPoint(L.latLng(ll.lat, ll.lng), e.zoom, e.center)
        : map.latLngToLayerPoint(L.latLng(ll.lat, ll.lng));
      const c = this._corners;
      const pts = [proj(c.tl), proj(c.tr), proj(c.br), proj(c.bl)];
      this._container.style.transform = homographyMatrix3d(this._W, this._H, pts);
    },
  });
  return RotatedGroup;
}

const CORNER_LABELS = { tl: 'Sup. izq.', tr: 'Sup. der.', br: 'Inf. der.', bl: 'Inf. izq.' };

// Recorta el fondo blanco del plano a transparente (con borde suave) para que
// sobre el satélite solo se vea el dibujo, no el rectángulo blanco del PNG.
function whiteKnockout(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, cv.width, cv.height);
        const p = data.data;
        for (let i = 0; i < p.length; i += 4) {
          const r = p[i], g = p[i+1], b = p[i+2];
          const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
          const sat = mx - mn;
          if (mn > 236 && sat < 16) {
            p[i+3] = 0;                       // blanco puro → transparente
          } else if (mn > 208 && sat < 26) {  // casi blanco → desvanecer borde
            p[i+3] = Math.round(p[i+3] * (1 - (mn - 208) / 28));
          }
        }
        ctx.putImageData(data, 0, 0);
        resolve(cv.toDataURL('image/png'));
      } catch (e) { resolve(url); }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

const PlanoSatelite = ({ lotes, vertOverrides, bgImage, selectedId, onSelect, filter, canEdit, scopeKey, onToast }) => {
  const VB     = window.PLANO_VIEWBOX || { w: 2800, h: 2006 };
  const TOKENS = window.ESTADO_TOKENS;
  const getVerts = window.getLoteVerts;
  const aspect = VB.h / VB.w;

  const paneRef   = React.useRef(null);
  const elRef     = React.useRef(null);
  const mapRef    = React.useRef(null);
  const groupRef  = React.useRef(null);
  const markersRef= React.useRef({});
  const polysRef  = React.useRef(new Map());

  const [ready, setReady]       = React.useState(false);
  const [opacity, setOpacity]   = React.useState(1);
  const [aligning, setAligning] = React.useState(false);
  const [fs, setFs]             = React.useState(false);
  const [recortar, setRecortar] = React.useState(true);   // quitar fondo blanco
  const [processedBg, setProcessedBg] = React.useState(null);
  const [corners, setCorners]   = React.useState(() => loadSatCorners(scopeKey) || defaultCorners(aspect));

  // Imagen efectiva: con o sin fondo blanco recortado
  const displayBg = (recortar && processedBg) ? processedBg : bgImage;
  const displayBgRef = React.useRef(displayBg);
  React.useEffect(() => { displayBgRef.current = displayBg; }, [displayBg]);

  // Procesa el recorte de blanco cuando cambia el plano
  React.useEffect(() => {
    let alive = true;
    if (!bgImage) { setProcessedBg(null); return; }
    whiteKnockout(bgImage).then(u => { if (alive) setProcessedBg(u); });
    return () => { alive = false; };
  }, [bgImage]);

  const cornersRef = React.useRef(corners);
  const aligningRef = React.useRef(aligning);
  React.useEffect(() => { cornersRef.current = corners; }, [corners]);
  React.useEffect(() => { aligningRef.current = aligning; }, [aligning]);

  const matches = React.useCallback((l) => {
    if (!filter) return true;
    if (filter.estado && filter.estado !== 'todos' && l.estado !== filter.estado) return false;
    if (filter.q) {
      const q = filter.q.toLowerCase().replace(/[\s-]/g, '');
      const hay = `${l.id} ${l.manzana}${l.numero} ${l.manzana} ${l.numero}`.toLowerCase().replace(/[\s-]/g, '');
      if (!hay.includes(q)) return false;
    }
    return true;
  }, [filter]);

  // Construye el SVG de lotes
  const buildSvg = React.useCallback(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${VB.w} ${VB.h}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.overflow = 'visible';
    polysRef.current = new Map();
    lotes.forEach((l) => {
      const verts = getVerts(l, vertOverrides);
      if (!verts || !verts.length) return;
      const poly = document.createElementNS(NS, 'polygon');
      poly.setAttribute('points', verts.map(v => `${v.x},${v.y}`).join(' '));
      poly.setAttribute('vector-effect', 'non-scaling-stroke');
      poly.style.cursor = 'pointer';
      poly.style.transition = 'fill-opacity .12s ease';
      poly.addEventListener('click', (ev) => { ev.stopPropagation(); onSelect?.(l.id); });
      poly.addEventListener('mouseenter', () => { if (cornersRef.current && selectedId !== l.id) poly.setAttribute('stroke-width', '3.2'); });
      poly.addEventListener('mouseleave', () => { if (selectedId !== l.id) poly.setAttribute('stroke-width', '1.6'); });
      svg.appendChild(poly);
      polysRef.current.set(l.id, { poly, lote: l });

      // Etiqueta Mz+Lote (ej. "K11") centrada en el polígono
      const xs = verts.map(v => v.x), ys = verts.map(v => v.y);
      const cx = xs.reduce((a,b)=>a+b,0) / xs.length;
      const cy = ys.reduce((a,b)=>a+b,0) / ys.length;
      const bbW = Math.max(...xs) - Math.min(...xs);
      const bbH = Math.max(...ys) - Math.min(...ys);
      if (bbW > 22 && bbH > 16) {
        const label = `${l.manzana}${l.numero}`;
        const fs = 20; // tamaño uniforme para TODAS las etiquetas
        const txt = document.createElementNS(NS, 'text');
        txt.setAttribute('x', cx); txt.setAttribute('y', cy + fs * 0.34);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', 'ui-monospace, monospace');
        txt.setAttribute('font-size', fs);
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', '#0B1A33');
        txt.setAttribute('stroke', '#ffffff');
        txt.setAttribute('stroke-width', 2.6);
        txt.setAttribute('paint-order', 'stroke');
        txt.style.pointerEvents = 'none';
        txt.textContent = label;
        svg.appendChild(txt);
        polysRef.current.get(l.id).txt = txt;
      }
    });
    return svg;
  }, [lotes, vertOverrides, VB.w, VB.h]);

  const restyle = React.useCallback(() => {
    polysRef.current.forEach(({ poly, lote, txt }, id) => {
      const t = TOKENS[lote.estado] || TOKENS.disponible;
      const sel = id === selectedId;
      const dim = !matches(lote);
      poly.setAttribute('fill', t.fill);
      poly.setAttribute('stroke', sel ? '#0B1B3F' : t.stroke);
      poly.setAttribute('fill-opacity', dim ? 0.12 : (sel ? 0.92 : 0.74));
      poly.setAttribute('stroke-width', sel ? 4.2 : 1.6);
      poly.style.opacity = dim ? 0.4 : 1;
      if (txt) txt.style.opacity = dim ? 0.18 : 1;
    });
  }, [selectedId, matches, TOKENS]);

  // ── Inicializa el mapa (una vez) ──
  React.useEffect(() => {
    if (!window.L || !elRef.current || mapRef.current) return;
    const L = window.L;
    ensureRotatedGroup();
    const ctr = corners.tl; // arranque
    const map = L.map(elRef.current, { center: [SAT_DEFAULT.lat, SAT_DEFAULT.lng], zoom: 16, zoomControl: true, zoomSnap: 0.25 });
    mapRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 21, maxNativeZoom: 19, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 21, maxNativeZoom: 19, opacity: 0.8,
    }).addTo(map);

    const svg = buildSvg();
    const grp = new RotatedGroup(displayBgRef.current || null, svg, VB.w, VB.h, { opacity }).addTo(map);
    grp.setCorners(corners);
    groupRef.current = grp;
    restyle();

    // Encadra a las esquinas
    const b = L.latLngBounds([corners.tl, corners.tr, corners.br, corners.bl]);
    map.fitBounds(b, { padding: [60, 60] });
    setReady(true);
    setTimeout(() => map.invalidateSize(), 200);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    map.__onResize = onResize;

    return () => { window.removeEventListener('resize', onResize); map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line

  // Actualiza esquinas en la capa + persiste
  React.useEffect(() => {
    if (!ready || !groupRef.current) return;
    groupRef.current.setCorners(corners);
    saveSatCorners(scopeKey, corners);
  }, [corners, ready, scopeKey]);

  // Marcadores de esquina (solo en modo alineación)
  React.useEffect(() => {
    if (!ready || !mapRef.current) return;
    const L = window.L;
    const map = mapRef.current;
    // limpia
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    if (!aligning) return;
    ['tl','tr','br','bl'].forEach(k => {
      const icon = L.divIcon({ className: 'sat-corner', html: `<span>${k.toUpperCase()}</span>`, iconSize: [26,26], iconAnchor: [13,13] });
      const mk = L.marker([corners[k].lat, corners[k].lng], { icon, draggable: true, autoPan: true }).addTo(map);
      mk.on('drag', () => {
        const ll = mk.getLatLng();
        setCorners(prev => ({ ...prev, [k]: { lat: ll.lat, lng: ll.lng } }));
      });
      markersRef.current[k] = mk;
    });
    // Manija central: arrastra TODO el plano a la vez
    const ctr = cornersCentroid(corners);
    const moveIcon = L.divIcon({ className: 'sat-move', html: '<span>✛</span>', iconSize: [34,34], iconAnchor: [17,17] });
    const mv = L.marker([ctr.lat, ctr.lng], { icon: moveIcon, draggable: true, autoPan: true }).addTo(map);
    let base = null;
    mv.on('dragstart', () => { base = { corners: cornersRef.current, start: mv.getLatLng() }; });
    mv.on('drag', () => {
      if (!base) return;
      const ll = mv.getLatLng();
      setCorners(translateCorners(base.corners, ll.lat - base.start.lat, ll.lng - base.start.lng));
    });
    markersRef.current.__center = mv;
    return () => { Object.values(markersRef.current).forEach(m => map.removeLayer(m)); markersRef.current = {}; };
  }, [aligning, ready]); // eslint-disable-line

  // Mantén los marcadores sincronizados si las esquinas cambian por otra vía (rotar/escalar/inputs/flechas)
  React.useEffect(() => {
    if (!aligning) return;
    ['tl','tr','br','bl'].forEach(k => {
      const mk = markersRef.current[k];
      if (!mk) return;
      const ll = mk.getLatLng();
      if (Math.abs(ll.lat - corners[k].lat) > 1e-9 || Math.abs(ll.lng - corners[k].lng) > 1e-9) {
        mk.setLatLng([corners[k].lat, corners[k].lng]);
      }
    });
    const mv = markersRef.current.__center;
    if (mv && !mv.dragging?._draggable?._moving) {
      const ctr = cornersCentroid(corners);
      mv.setLatLng([ctr.lat, ctr.lng]);
    }
  }, [corners, aligning]);

  React.useEffect(() => { if (groupRef.current) groupRef.current.setUrl(displayBg || null); }, [displayBg, ready]);
  React.useEffect(() => { if (groupRef.current) groupRef.current.setOpacity(opacity); }, [opacity, ready]);
  React.useEffect(() => {
    if (!ready || !groupRef.current) return;
    groupRef.current.replaceSvg(buildSvg());
    restyle();
  }, [buildSvg, ready]); // eslint-disable-line
  React.useEffect(() => { if (ready) restyle(); }, [restyle, ready]);

  // ── Fullscreen ──
  React.useEffect(() => {
    const onFs = () => {
      const active = document.fullscreenElement === paneRef.current;
      setFs(active);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 150);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const toggleFs = () => {
    const el = paneRef.current;
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const rotate = (deg) => setCorners(c => transformCorners(c, { rotDeg: deg }));
  const scaleBy = (f)  => setCorners(c => transformCorners(c, { scale: f }));
  const nudge = (dirLat, dirLng) => setCorners(c => {
    const spanLng = Math.abs(c.tr.lng - c.tl.lng) || 0.001;
    const spanLat = Math.abs(c.bl.lat - c.tl.lat) || 0.001;
    return translateCorners(c, dirLat * spanLat * 0.04, dirLng * spanLng * 0.04);
  });
  const editCorner = (k, field, val) => {
    const num = parseFloat(val);
    if (Number.isNaN(num)) return;
    setCorners(c => ({ ...c, [k]: { ...c[k], [field]: num } }));
  };

  return (
    <div className="sat-pane" ref={paneRef}>
      <div ref={elRef} className="sat-map"/>

      {/* Barra superior izquierda: fullscreen */}
      <div className="sat-topbar" onMouseDown={(e) => e.stopPropagation()}>
        <button className="sat-iconbtn" onClick={toggleFs} title={fs ? 'Salir de pantalla completa' : 'Pantalla completa'}>
          <Icon name={fs ? 'minimize' : 'maximize'} size={15}/>
        </button>
      </div>

      {/* Opacidad del plano */}
      <div className="sat-ctl sat-ctl-opacity" onMouseDown={(e) => e.stopPropagation()}>
        <Icon name="layers" size={13}/>
        <span className="sat-ctl-label">Plano</span>
        <input type="range" min="0" max="1" step="0.02" value={opacity}
               onChange={(e) => setOpacity(parseFloat(e.target.value))}/>
        <span className="sat-ctl-val">{Math.round(opacity * 100)}%</span>
        <span className="sat-ctl-sep"/>
        <button className={`sat-ctl-toggle ${recortar ? 'on' : ''}`}
                onClick={() => setRecortar(v => !v)}
                title={recortar ? 'Mostrar fondo blanco del plano' : 'Quitar fondo blanco del plano'}>
          <Icon name="scissors" size={13}/> Sin fondo
        </button>
      </div>

      {/* Alineación (solo editores) */}
      {canEdit && (
        <div className="sat-align" onMouseDown={(e) => e.stopPropagation()}>
          {!aligning ? (
            <button className="btn sm" onClick={() => setAligning(true)}>
              <Icon name="mapPin" size={13}/> Alinear plano
            </button>
          ) : (
            <div className="sat-align-panel">
              <div className="sat-align-head">
                <b>Calce del plano</b>
                <button className="btn sm primary" onClick={() => { setAligning(false); onToast?.('✓ Alineación guardada'); }}>Listo</button>
              </div>
              <p className="sat-align-hint">Arrastra la cruz central para mover todo el plano, o cada esquina para calzarla. También puedes escribir coordenadas exactas.</p>

              <div className="sat-tools">
                <div className="sat-tool-grp">
                  <span>Rotar</span>
                  <button onClick={() => rotate(-5)} title="−5°">⟲5</button>
                  <button onClick={() => rotate(-1)} title="−1°">⟲1</button>
                  <button onClick={() => rotate(1)} title="+1°">⟳1</button>
                  <button onClick={() => rotate(5)} title="+5°">⟳5</button>
                </div>
                <div className="sat-tool-grp">
                  <span>Escala</span>
                  <button onClick={() => scaleBy(0.98)}>−</button>
                  <button onClick={() => scaleBy(1.02)}>+</button>
                </div>
                <div className="sat-tool-grp sat-tool-move">
                  <span>Mover</span>
                  <div className="sat-pad">
                    <button onClick={() => nudge(1, 0)}>↑</button>
                    <div className="sat-pad-mid">
                      <button onClick={() => nudge(0, -1)}>←</button>
                      <button onClick={() => nudge(0, 1)}>→</button>
                    </div>
                    <button onClick={() => nudge(-1, 0)}>↓</button>
                  </div>
                </div>
              </div>

              <div className="sat-corners">
                {['tl','tr','br','bl'].map(k => (
                  <div key={k} className="sat-corner-row">
                    <span className="sat-corner-tag">{CORNER_LABELS[k]}</span>
                    <input type="number" step="0.00001" value={corners[k].lat.toFixed(5)}
                           onChange={(e) => editCorner(k, 'lat', e.target.value)} title="Latitud"/>
                    <input type="number" step="0.00001" value={corners[k].lng.toFixed(5)}
                           onChange={(e) => editCorner(k, 'lng', e.target.value)} title="Longitud"/>
                  </div>
                ))}
              </div>

              <button className="btn sm block" onClick={() => setCorners(defaultCorners(aspect))}>Restablecer</button>
            </div>
          )}
        </div>
      )}

      {!bgImage && (
        <div className="sat-noplano">
          <Icon name="info" size={14}/> Sube el plano de la etapa para superponerlo sobre el satélite.
        </div>
      )}
    </div>
  );
};

Object.assign(window, { PlanoSatelite });
