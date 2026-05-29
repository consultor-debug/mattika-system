// bundle-core.jsx — icons + ui helpers + mock data + lighter screens
// (Consolidated to avoid babel-standalone parallel-fetch flakiness)

// icons.jsx — tiny inline SVG set, single stroke style
const Icon = ({ name, size = 16, stroke = 1.7, ...rest }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    ...rest,
  };
  const paths = ICONS[name];
  if (!paths) return null;
  return <svg {...props} className={`icn ${rest.className||''}`}>{paths}</svg>;
};

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></>,
  docs: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></>,
  building: <><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="9" y1="14" x2="9" y2="14"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="15" y1="10" x2="15" y2="10"/><line x1="15" y1="14" x2="15" y2="14"/><line x1="10" y1="22" x2="10" y2="18"/><line x1="14" y1="22" x2="14" y2="18"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  money: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  receipt: <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  whatsapp: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></>,
  signature: <><path d="M3 17c2.5-3 4.5-7 6-12 2 5 4 9 6 12"/><path d="M3 21h18"/><path d="M14 13c2 0 4-2 4-4"/></>,
  excel: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></>,
  print: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
  chevronR: <><polyline points="9 18 15 12 9 6"/></>,
  chevronL: <><polyline points="15 18 9 12 15 6"/></>,
  chevronD: <><polyline points="6 9 12 15 18 9"/></>,
  check: <><polyline points="20 6 9 17 4 12"/></>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
  arrowR: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  arrowL: <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
  trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  trendDown: <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
  filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  more: <><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></>,
  menu: <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  maximize: <><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>,
  minimize: <><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  scale: <><path d="M12 3v18"/><path d="M3 21h18"/><path d="M7 7l-4 8a4 4 0 0 0 8 0z"/><path d="M17 7l4 8a4 4 0 0 1-8 0z"/></>,
  heart2: <><circle cx="9" cy="9" r="4"/><circle cx="15" cy="9" r="4"/><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  sparkle: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 16l.7 2.1L22 19l-2.3.9L19 22l-.7-2.1L16 19l2.3-.9z"/></>,
  refresh: <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></>,
  archive: <><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></>,
  template: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 9v12"/></>,
  layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></>,
  attachment: <><path d="M21.4 11.05L12.3 20.15a5.5 5.5 0 0 1-7.78-7.78l9.1-9.1a3.7 3.7 0 0 1 5.22 5.22l-9.1 9.1a1.85 1.85 0 0 1-2.61-2.61l8.4-8.4"/></>,
  info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
};

Object.assign(window, { Icon });


// ui.jsx — Shared UI helpers + formatting + currency

// Format S/ Soles peruanos
const fmtSoles = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
};

const fmtInt = (n) => new Intl.NumberFormat('es-PE').format(n || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' });
};

const fmtDateLong = (d) => {
  if (!d) return "—";
  if (typeof d === 'string') d = new Date(d);
  return d.toLocaleDateString('es-PE', { day:'numeric', month:'long', year:'numeric' });
};

// Number → letters (very simplified, for soles)
const numeroALetras = (num) => {
  const UNI = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
  const DEC = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const ESP = ['DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const CEN = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  function under1000(n){
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    const c = Math.floor(n/100), r = n%100;
    let s = CEN[c];
    if (r) {
      if (r < 10) s += (s?' ':'') + UNI[r];
      else if (r < 20) s += (s?' ':'') + ESP[r-10];
      else {
        const d = Math.floor(r/10), u = r%10;
        s += (s?' ':'') + DEC[d] + (u ? ' Y ' + UNI[u] : '');
      }
    }
    return s.trim();
  }
  const n = Math.floor(num);
  const cents = Math.round((num - n) * 100);
  let words = '';
  const miles = Math.floor(n/1000), resto = n%1000;
  if (miles) {
    if (miles === 1) words = 'MIL';
    else words = under1000(miles) + ' MIL';
  }
  if (resto) words += (words?' ':'') + under1000(resto);
  if (!words) words = 'CERO';
  return `${words} CON ${String(cents).padStart(2,'0')}/100 SOLES`;
};

// Sparkline mini svg
const Sparkline = ({ data, color = "currentColor", w = 80, h = 26 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i*step},${h - ((v - min)/range) * (h - 4) - 2}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={(data.length-1)*step} cy={h - ((data[data.length-1] - min)/range) * (h - 4) - 2} r="2" fill={color}/>
    </svg>
  );
};

// Toast (singleton via window)
const useToasts = () => {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 2400);
  }, []);
  const node = (
    <>
      {toasts.map((t, i) => (
        <div key={t.id} className="toast" style={{ bottom: 28 + i*52 }}>
          <Icon name="checkCircle" size={15}/>
          {t.msg}
        </div>
      ))}
    </>
  );
  return [push, node];
};

// Status pill mapping
const StatusPill = ({ status }) => {
  const map = {
    'firmado': { cls: 'success', label: 'Firmado' },
    'por-firmar': { cls: 'warn', label: 'Por firmar' },
    'borrador': { cls: 'outline', label: 'Borrador' },
    'separacion': { cls: 'brand', label: 'Separación' },
    'vencido': { cls: 'danger', label: 'Vencido' },
    'pagado': { cls: 'success', label: 'Pagado' },
    'pendiente': { cls: 'warn', label: 'Pendiente' },
    'desistido': { cls: 'danger', label: 'Desistido' },
  };
  const m = map[status] || { cls: '', label: status };
  return <span className={`pill ${m.cls}`}><span className="dot"/>{m.label}</span>;
};

const DocTypeBadge = ({ type }) => {
  const map = {
    'compraventa': { label: 'Compraventa', icon: 'doc' },
    'promesa': { label: 'Promesa de C/V', icon: 'doc' },
    'separacion': { label: 'Acta de Separación', icon: 'receipt' },
    'cronograma': { label: 'Cronograma', icon: 'calendar' },
    'desistimiento': { label: 'Desistimiento', icon: 'archive' },
  };
  const m = map[type] || { label: type, icon: 'doc' };
  return (
    <span className="hstack gap-8">
      <span style={{
        width:24, height:24, borderRadius:6,
        background:'var(--brand-50)', color:'var(--brand)',
        display:'grid', placeItems:'center'
      }}>
        <Icon name={m.icon} size={13}/>
      </span>
      <span className="strong">{m.label}</span>
    </span>
  );
};

Object.assign(window, {
  fmtSoles, fmtInt, fmtDate, fmtDateLong, numeroALetras,
  Sparkline, useToasts, StatusPill, DocTypeBadge,
});


// mock-data.jsx — Sample contratos / clientes / inmuebles para el prototipo

const ASESORES = [
  { id: 'u1', name: 'Camila Reátegui',    initials: 'CR', role: 'Asesora Senior' },
  { id: 'u2', name: 'Diego Saldaña',      initials: 'DS', role: 'Asesor' },
  { id: 'u3', name: 'Lorena Quispe',      initials: 'LQ', role: 'Asesora' },
  { id: 'u4', name: 'Andrés Castañeda',   initials: 'AC', role: 'Asesor Junior' },
  { id: 'me', name: 'Mateo Vargas',       initials: 'MV', role: 'Administrador' },
];

// ───────────────────────────────────────────────────────────────
// EMPRESA VENDEDORA — datos fijos del contrato. Editables en Ajustes.
// ───────────────────────────────────────────────────────────────
const EMPRESA = {
  razonSocial: 'TERRENOPOLIS S.A.C.',
  ruc: '20610745696',
  domicilio: 'Mz. H Lt. 09, Calle Los Almendros, Urb. La Arboleda, Distrito Trujillo, Provincia Trujillo, Departamento La Libertad',
  representante: 'CESAR FRANCISCO LEYTON APONTE',
  representanteDni: '44788259',
  partidaJuridica: '11512333',
  oficinaRegistral: 'Oficina Registral N° V – Sede Trujillo',
  bancoNombre: 'BCP',
  bancoCuenta: '570-7307941059',
  lugarFirma: 'Trujillo',
};

// Cargar EMPRESA desde localStorage si fue editada por el admin
try {
  const saved = localStorage.getItem('mattika.empresa.v1');
  if (saved) Object.assign(EMPRESA, JSON.parse(saved));
} catch(e) {}

const PROYECTOS = [
  {
    id:'p1',
    name: 'Nápoles Condominio Club',
    predio: 'Valle Chicama Predio Mocan, Sector La Arenita U.C. 1900',
    distrito: 'Razuri',
    provincia: 'Ascope',
    departamento: 'La Libertad',
    partidaElectronica: '11550511',
    oficinaRegistral: 'SUNARP — Sede Trujillo, Oficina Registral Trujillo',
    fechaEntrega: '12.2027',
  },
];

const CONTRATOS_RECIENTES = [
  {
    id: 'MTK-2026-0184', code: 'MTK-2026-0184',
    tipo: 'compraventa', titularidad: 'unico',
    cliente: 'Rosmery Rocío Valderrama Trujillo', dni: '46049117',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 7 · Manzana C',
    partida: 'P-11550511',
    precio: 17100, inicial: 3500,
    cuotasN: 3, saldo: 13600,
    primeraCuota: '2026-05-31',
    asesor: 'Camila Reátegui',
    fecha: '2026-05-22', status: 'por-firmar',
  },
  {
    id: 'MTK-2026-0183', code: 'MTK-2026-0183',
    tipo: 'separacion', titularidad: 'unico',
    cliente: 'Javier Eduardo Cisneros Tello', dni: '09887452',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 12 · Manzana B',
    partida: 'P-11550511',
    precio: 19800, inicial: 500,
    cuotasN: 0, saldo: 0,
    primeraCuota: null,
    asesor: 'Diego Saldaña',
    fecha: '2026-05-21', status: 'separacion',
  },
  {
    id: 'MTK-2026-0182', code: 'MTK-2026-0182',
    tipo: 'compraventa', titularidad: 'unico',
    cliente: 'Lucía Ramos Velarde', dni: '47225910',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 22 · Manzana A',
    partida: 'P-11550511',
    precio: 18200, inicial: 3640,
    cuotasN: 6, saldo: 14560,
    primeraCuota: '2026-06-10',
    asesor: 'Lorena Quispe',
    fecha: '2026-05-19', status: 'firmado',
  },
  {
    id: 'MTK-2026-0181', code: 'MTK-2026-0181',
    tipo: 'compraventa', titularidad: 'unico',
    cliente: 'Andrea Jiménez Soto', dni: '42118094',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 03 · Manzana D',
    partida: 'P-11550511',
    precio: 22500, inicial: 4500,
    cuotasN: 12, saldo: 18000,
    primeraCuota: '2026-06-01',
    asesor: 'Camila Reátegui',
    fecha: '2026-05-18', status: 'firmado',
  },
  {
    id: 'MTK-2026-0180', code: 'MTK-2026-0180',
    tipo: 'desistimiento', titularidad: 'unico',
    cliente: 'Patricia Olarte Núñez', dni: '09553127',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 18 · Manzana B',
    partida: 'P-11550511',
    precio: 16800, inicial: 500,
    cuotasN: 0, saldo: 0,
    primeraCuota: null,
    asesor: 'Andrés Castañeda',
    fecha: '2026-05-16', status: 'desistido',
  },
  {
    id: 'MTK-2026-0179', code: 'MTK-2026-0179',
    tipo: 'compraventa', titularidad: 'unico',
    cliente: 'Renzo Tapia Ferrer', dni: '41005781',
    proyecto: 'Nápoles Condominio Club',
    unidad: 'Lote 05 · Manzana A',
    partida: 'P-11550511',
    precio: 17100, inicial: 3500,
    cuotasN: 3, saldo: 13600,
    primeraCuota: '2026-05-30',
    asesor: 'Diego Saldaña',
    fecha: '2026-05-14', status: 'firmado',
  },
];

const TITULARIDAD_OPTS = [
  { id:'unico',             label:'Titular único',           desc:'Una sola persona natural compra el inmueble.', icon:'user' },
  { id:'copropietarios',    label:'Copropietarios',          desc:'Dos o más personas adquieren en cuotas ideales.', icon:'users' },
  { id:'conyuge',           label:'Sociedad conyugal',       desc:'Esposos bajo sociedad de gananciales.', icon:'heart2' },
  { id:'separacion-bienes', label:'Separación de bienes',    desc:'Esposos con régimen patrimonial separado.', icon:'scale' },
];

const TIPO_DOC_OPTS = [
  { id:'compraventa',   label:'Compraventa de Bien Futuro', desc:'Contrato principal con cronograma y reserva de dominio.', icon:'doc' },
  { id:'separacion',    label:'Acta de Separación',         desc:'Reserva del inmueble antes del contrato.',                icon:'receipt' },
  { id:'cronograma',    label:'Cronograma de Pagos',        desc:'Documento independiente de calendario.',                  icon:'calendar' },
  { id:'desistimiento', label:'Carta de Desistimiento',     desc:'Cancelación con condiciones de devolución.',              icon:'archive' },
];

const DEPARTAMENTOS_PE = [
  'La Libertad','Lima','Arequipa','Piura','Lambayeque','Cusco','Junín',
  'Áncash','Ica','Cajamarca','Puno','Loreto','Tacna','Ucayali','San Martín'
];

// ───────────────────────────────────────────────────────────────
// CRONOGRAMA — soporta dos modos:
//   modo='iguales'        → cuotas iguales mensuales
//   modo='personalizadas' → array de {monto, fecha}
// ───────────────────────────────────────────────────────────────
const generarCronograma = ({ precio, inicial, cuotas, primeraCuota, modo = 'iguales', cuotasPersonalizadas = [] }) => {
  const saldo = +(precio - inicial).toFixed(2);

  if (modo === 'personalizadas' && cuotasPersonalizadas.length) {
    let acumulado = 0;
    return cuotasPersonalizadas.map((c, i) => {
      const monto = +(+c.monto || 0).toFixed(2);
      acumulado += monto;
      return {
        n: i + 1,
        fecha: c.fecha,
        monto,
        saldo: +(saldo - acumulado).toFixed(2),
        estado: 'pendiente',
      };
    });
  }

  if (!primeraCuota || cuotas <= 0) return [];
  const cuotaBase = +(saldo / cuotas).toFixed(2);
  const start = new Date(primeraCuota);
  const rows = [];
  let acumulado = 0;
  for (let i = 0; i < cuotas; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, start.getDate());
    let monto = cuotaBase;
    if (i === cuotas - 1) monto = +(saldo - acumulado).toFixed(2);
    acumulado += monto;
    rows.push({
      n: i + 1,
      fecha: d.toISOString().slice(0,10),
      monto,
      saldo: +(saldo - acumulado).toFixed(2),
      estado: 'pendiente',
    });
  }
  return rows;
};

// Generar cuotas iniciales personalizadas a partir del ejemplo del contrato (3 cuotas)
const cuotasPorDefecto = (saldo) => {
  // Distribución: 2 cuotas pequeñas + 1 cuota grande con el resto
  if (saldo <= 0) return [];
  const today = new Date();
  const firstNext = new Date(today.getFullYear(), today.getMonth() + 1, 0); // último día del mes siguiente
  const ofMonth = (d, m) => new Date(d.getFullYear(), d.getMonth() + m + 1, 0).toISOString().slice(0,10);
  const cuota1 = Math.min(2000, Math.round(saldo * 0.15));
  const cuota2 = Math.min(2000, Math.round(saldo * 0.15));
  const cuota3 = +(saldo - cuota1 - cuota2).toFixed(2);
  return [
    { monto: cuota1, fecha: ofMonth(today, 0) },
    { monto: cuota2, fecha: ofMonth(today, 1) },
    { monto: cuota3, fecha: ofMonth(today, 2) },
  ];
};

Object.assign(window, {
  EMPRESA, ASESORES, PROYECTOS, CONTRATOS_RECIENTES,
  TITULARIDAD_OPTS, TIPO_DOC_OPTS, DEPARTAMENTOS_PE,
  generarCronograma, cuotasPorDefecto,
});


// screen-contracts.jsx — Lista de contratos con filtros

const ScreenContracts = ({ onOpenContract, onNew, initialFilterStatus }) => {
  const [filterTipo, setFilterTipo] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState(initialFilterStatus || 'all');
  const [q, setQ] = React.useState('');

  const filtered = CONTRATOS_RECIENTES.filter(c => {
    if (filterTipo !== 'all' && c.tipo !== filterTipo) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (q && !`${c.cliente} ${c.code} ${c.proyecto}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page" data-screen-label="Contratos">
      <div className="page-head">
        <div>
          <h1 className="page-title">Contratos</h1>
          <div className="page-sub">Todos los documentos generados por el equipo.</div>
        </div>
        <div className="hstack gap-8">
          <button className="btn"><Icon name="download" size={14}/> Exportar</button>
          <button className="btn primary" onClick={() => onNew()}>
            <Icon name="plus" size={15}/> Nuevo documento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card card-pad mb-16" style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap', padding:'12px 16px'}}>
        <div className="search" style={{margin:0, flex:'1 1 280px'}}>
          <Icon name="search" size={14}/>
          <input placeholder="Buscar por cliente, código o proyecto..." value={q} onChange={(e)=>setQ(e.target.value)}/>
        </div>
        <div className="hstack gap-8">
          <Tabs value={filterTipo} onChange={setFilterTipo} options={[
            {id:'all', label:'Todos'},
            {id:'compraventa', label:'Compraventa'},
            {id:'separacion', label:'Separaciones'},
            {id:'cronograma', label:'Cronogramas'},
            {id:'desistimiento', label:'Desistimientos'},
          ]}/>
        </div>
        <select className="select" style={{width:170}} value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="firmado">Firmado</option>
          <option value="por-firmar">Por firmar</option>
          <option value="separacion">Separación</option>
          <option value="desistido">Desistido</option>
        </select>
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{width:140}}>Código</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Inmueble</th>
              <th>Asesor</th>
              <th className="right">Precio S/</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => onOpenContract(c)}>
                <td className="num">{c.code}</td>
                <td>
                  <div className="strong">{c.cliente}</div>
                  {c.coClientes && <div className="muted text-xs">+ {c.coClientes[0]}</div>}
                </td>
                <td><DocTypeBadge type={c.tipo}/></td>
                <td>
                  <div style={{fontSize:13}}>{c.unidad}</div>
                  <div className="muted text-xs">{c.proyecto}</div>
                </td>
                <td>
                  <span className="hstack gap-8">
                    <div className="avatar sm">{c.asesor.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                    <span className="text-sm">{c.asesor.split(' ')[0]}</span>
                  </span>
                </td>
                <td className="num right strong">{fmtSoles(c.precio)}</td>
                <td className="text-sm muted">{fmtDate(c.fecha)}</td>
                <td><StatusPill status={c.status}/></td>
                <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9" style={{padding:36, textAlign:'center', color:'var(--muted)'}}>
                Sin resultados para los filtros aplicados.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Tabs = ({ value, onChange, options }) => (
  <div style={{display:'inline-flex', background:'var(--bg-sunken)', borderRadius:8, padding:3, gap:2}}>
    {options.map(o => (
      <button key={o.id}
        onClick={()=>onChange(o.id)}
        className="btn sm"
        style={{
          background: value===o.id ? 'var(--surface)' : 'transparent',
          border: value===o.id ? '1px solid var(--border)' : '1px solid transparent',
          color: value===o.id ? 'var(--ink)' : 'var(--muted)',
          fontWeight: value===o.id ? 600 : 500,
          padding:'5px 12px',
          boxShadow: value===o.id ? 'var(--shadow-xs)' : 'none',
        }}>
        {o.label}
      </button>
    ))}
  </div>
);

Object.assign(window, { ScreenContracts, Tabs });


// screen-clients.jsx — Catálogo de clientes y plantillas (simple placeholders)

const ScreenClients = () => {
  const clients = [
    { id:1, n:'Rosa Mercedes Pacheco Arias',   dni:'45872391', contratos: 1, ult:'2026-05-22' },
    { id:2, n:'Javier Eduardo Cisneros Tello', dni:'09887452', contratos: 1, ult:'2026-05-21' },
    { id:3, n:'Lucía Ramos Velarde',           dni:'47225910', contratos: 1, ult:'2026-05-19' },
    { id:4, n:'Andrea Jiménez Soto',           dni:'42118094', contratos: 2, ult:'2026-05-18' },
    { id:5, n:'Renzo Tapia Ferrer',            dni:'41005781', contratos: 1, ult:'2026-05-14' },
    { id:6, n:'Patricia Olarte Núñez',         dni:'09553127', contratos: 1, ult:'2026-05-16' },
  ];
  return (
    <div className="page" data-screen-label="Clientes">
      <div className="page-head">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-sub">Personas naturales registradas en el sistema.</div>
        </div>
        <button className="btn primary"><Icon name="plus" size={15}/> Nuevo cliente</button>
      </div>

      <div className="card">
        <table className="tbl">
          <thead><tr><th>Nombre</th><th>DNI</th><th className="right">Contratos</th><th>Última actividad</th><th></th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td className="hstack gap-10">
                  <div className="avatar sm">{c.n.split(' ').map(p=>p[0]).slice(0,2).join('')}</div>
                  <span className="strong">{c.n}</span>
                </td>
                <td className="num">{c.dni}</td>
                <td className="right strong">{c.contratos}</td>
                <td className="muted text-sm">{fmtDate(c.ult)}</td>
                <td><Icon name="chevronR" size={14} style={{color:'var(--muted-2)'}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScreenInmuebles = () => {
  const items = [
    { id:1, code:'Lote 14 · Mz. C',  proy:'Residencial Las Lomas',  area:180, precio:248500, st:'Reservado' },
    { id:2, code:'Lote 07 · Mz. A',  proy:'Residencial Las Lomas',  area:160, precio:198000, st:'Vendido' },
    { id:3, code:'Dpto. 802',        proy:'Torre Alameda',           area:112, precio:412000, st:'Reservado' },
    { id:4, code:'Dpto. 503',        proy:'Edificio Pinares',        area:138, precio:528000, st:'Vendido' },
    { id:5, code:'Dpto. 504',        proy:'Torre Alameda',           area:88,  precio:320000, st:'Disponible' },
    { id:6, code:'Casa 22',          proy:'Condominio Vista Mar',    area:240, precio:365000, st:'Vendido' },
    { id:7, code:'Lote 22 · Mz. B',  proy:'Residencial Las Lomas',   area:180, precio:235000, st:'Disponible' },
    { id:8, code:'Dpto. 1001',       proy:'Torre Alameda',           area:140, precio:485000, st:'Disponible' },
  ];
  const stMap = { 'Disponible':'success', 'Reservado':'warn', 'Vendido':'outline' };
  return (
    <div className="page" data-screen-label="Inmuebles">
      <div className="page-head">
        <div>
          <h1 className="page-title">Inmuebles</h1>
          <div className="page-sub">Inventario por proyecto.</div>
        </div>
        <button className="btn primary"><Icon name="plus" size={15}/> Nuevo inmueble</button>
      </div>
      <div className="field-group cols-4">
        {items.map(i => (
          <div key={i.id} className="card card-pad" style={{cursor:'default'}}>
            <div className="hstack between mb-8">
              <div className="qa-ic" style={{width:32, height:32}}><Icon name="building" size={16}/></div>
              <span className={`pill ${stMap[i.st]}`}>{i.st}</span>
            </div>
            <div className="serif" style={{fontSize:18, fontWeight:500, color:'var(--ink)', letterSpacing:'-.01em'}}>{i.code}</div>
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
    </div>
  );
};

const ScreenTemplates = () => {
  const tpls = [
    { n:'Nápoles · Compraventa de Bien Futuro · v3.2', tipo:'compraventa', desc:'Plantilla notarial Terrenopolis con cronograma de pagos personalizado.', uso: 184, fecha:'2026-04-12', activa: true },
    { n:'Acta de Separación · v1.4',  tipo:'separacion', desc:'Reserva de inmueble por 30 días con arras de retracto.', uso: 56, fecha:'2026-03-08', activa: true },
    { n:'Cronograma · v2.0',          tipo:'cronograma', desc:'Cronograma independiente para reemitir.', uso: 240, fecha:'2026-04-12', activa: true },
    { n:'Desistimiento · v1.2',       tipo:'desistimiento', desc:'Cancelación con devolución parcial al comprador.', uso: 12, fecha:'2026-02-22', activa: true },
  ];
  return (
    <div className="page" data-screen-label="Plantillas">
      <div className="page-head">
        <div>
          <h1 className="page-title">Plantillas</h1>
          <div className="page-sub">Documentos base que se rellenan automáticamente con los datos del formulario.</div>
        </div>
        <button className="btn primary"><Icon name="plus" size={15}/> Nueva plantilla</button>
      </div>
      <div className="vstack gap-12">
        {tpls.map((t, i) => (
          <div key={i} className="card card-pad hstack gap-16">
            <div className="qa-ic" style={{width:46, height:46}}><Icon name="template" size={20}/></div>
            <div className="flex1">
              <div className="hstack gap-8">
                <span className="serif" style={{fontSize:17, fontWeight:500}}>{t.n}</span>
                {t.activa && <span className="pill success"><span className="dot"/>Activa</span>}
              </div>
              <div className="muted text-sm">{t.desc}</div>
              <div className="hstack gap-12 mt-8">
                <span className="muted text-xs"><Icon name="doc" size={11} style={{verticalAlign:-1, marginRight:4}}/>{t.uso} usos</span>
                <span className="muted text-xs"><Icon name="clock" size={11} style={{verticalAlign:-1, marginRight:4}}/>Última edición {fmtDate(t.fecha)}</span>
              </div>
            </div>
            <button className="btn"><Icon name="edit" size={13}/> Editar</button>
            <button className="btn ghost"><Icon name="copy" size={13}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { ScreenClients, ScreenInmuebles, ScreenTemplates });

