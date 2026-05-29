// auth.jsx — Autenticación multi-empresa para Mattika System
// ════════════════════════════════════════════════════════════════
// Modelo:
//   - EMPRESAS   → cada inmobiliaria que usa el sistema (con su proyecto)
//   - USUARIOS   → asociados a una empresa, con username + password
//   - SESION     → quién está logueado ahora mismo
//   - MASTER     → cuenta interna de Mattika para gestionar empresas/usuarios
//
// Todo es localStorage — demo sin backend. En producción esto vive
// en el servidor.

const EMPRESAS_KEY = 'mattika.empresas.v1';
const USUARIOS_KEY = 'mattika.usuarios.v1';
const SESION_KEY   = 'mattika.sesion.v1';

// ── Empresas de arranque ────────────────────────────────────────
// Cada empresa puede tener N proyectos, y cada proyecto N etapas.
// Estados de proyecto: 'planificacion' | 'preventa' | 'en-obra' | 'entregado' | 'pausado'
// Estados de etapa:    'planificacion' | 'preventa' | 'en-obra' | 'entregado' | 'pausado'

const EMPRESAS_DEFAULT = [
  {
    id: 'lumina',
    nombre: 'Lumina Grupo Inmobiliario',
    color: '#1E4FD4',
    creadaEl: '2025-09-10',
    activa: true,
    proyectos: [
      {
        id: 'napoles',
        nombre: 'Nápoles',
        ubicacion: 'Valle Chicama · Trujillo',
        descripcion: 'Condominio club con club house, parque central y áreas deportivas.',
        estado: 'en-obra',
        fechaInicio: '2024-08-01',
        fechaEntrega: '2027-12-31',
        etapas: [
          { id:'e1', nombre:'Etapa 1', estado:'entregado', lotes:60, fechaInicio:'2024-08-01', fechaEntrega:'2026-01-01' },
          { id:'e2', nombre:'Etapa 2', estado:'en-obra',   lotes:80, fechaInicio:'2025-06-01', fechaEntrega:'2026-12-01' },
          { id:'e3', nombre:'Etapa 3', estado:'preventa',  lotes:90, fechaInicio:'2026-04-01', fechaEntrega:'2027-12-31' },
        ],
      },
    ],
  },
  {
    id: 'golden',
    nombre: 'Golden Inmobiliaria',
    color: '#B8862A',
    creadaEl: '2026-02-04',
    activa: true,
    proyectos: [
      {
        id: 'villaclub-malabrigo',
        nombre: 'Villa Club Malabrigo',
        ubicacion: 'Malabrigo · Rázuri',
        descripcion: 'Condominio frente a la playa con dos etapas (Pacífico y Marina).',
        estado: 'preventa',
        fechaInicio: '2026-03-01',
        fechaEntrega: '2028-06-30',
        etapas: [
          { id:'e1', nombre:'Etapa Pacífico', estado:'preventa',      lotes:72, fechaInicio:'2026-03-01', fechaEntrega:'2027-12-01' },
          { id:'e2', nombre:'Etapa Marina',   estado:'planificacion', lotes:84, fechaInicio:'2027-01-01', fechaEntrega:'2028-06-30' },
        ],
      },
    ],
  },
];

// ── Migración de empresas con esquema viejo (proyecto: string) ──
function migrateEmpresa(e) {
  if (Array.isArray(e.proyectos) && e.proyectos.length) return e;
  // Empresa antigua — convertir el campo `proyecto` a un proyecto único con una etapa
  const nombre = e.proyecto || 'Proyecto principal';
  const id = (nombre).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30) || 'proyecto';
  return {
    ...e,
    proyectos: [{
      id, nombre,
      ubicacion: e.proyectoSub || '',
      descripcion: '',
      estado: 'en-obra',
      fechaInicio: '', fechaEntrega: '',
      etapas: [{ id:'e1', nombre:'Etapa 1', estado:'en-obra', lotes:0, fechaInicio:'', fechaEntrega:'' }],
    }],
  };
}

// ── Usuarios de arranque ────────────────────────────────────────
const USUARIOS_DEFAULT = [
  // Lumina
  { id:'u-lum-1', empresaId:'lumina', usuario:'admin',   clave:'lumina2026',   nombre:'Mateo Vargas',     rol:'Administrador', activo:true },
  { id:'u-lum-2', empresaId:'lumina', usuario:'asesor',  clave:'lumina2026',   nombre:'Ana Salinas',      rol:'Asesor',        activo:true },
  // Golden
  { id:'u-gol-1', empresaId:'golden', usuario:'admin',   clave:'golden2026',   nombre:'Renzo Cárdenas',   rol:'Administrador', activo:true },
  { id:'u-gol-2', empresaId:'golden', usuario:'gerente', clave:'golden2026',   nombre:'Sofía Mendoza',    rol:'Gerente',       activo:true },
];

// ── Cuenta MASTER (Mattika) ─────────────────────────────────────
// No vive en USUARIOS — es una credencial interna fija para gestionar todo.
const MASTER_EMPRESA  = 'mattika';
const MASTER_USUARIO  = 'owner';
const MASTER_CLAVE    = 'mattika2026';

// ── Permisos (capacidades por usuario) ──────────────────────────
// El acceso a cada función se controla por usuario con checkboxes.
// El ROL solo define los valores por defecto; cada usuario puede
// personalizarse (p.ej. un asesor que SÍ puede subir planos).
const PERMISOS_DEF = [
  { grupo: 'Ventas y cobranza', items: [
    { key:'vender',          label:'Apartar y vender lotes',      desc:'Separar/vender lotes y generar contratos.' },
    { key:'ver_pagos',       label:'Ver pagos y cuotas',          desc:'Consultar si el cliente está al día (solo lectura).' },
    { key:'registrar_pagos', label:'Registrar y confirmar pagos', desc:'Marcar cuotas como pagadas y registrar operaciones.' },
  ]},
  { grupo: 'Catálogo y planos', items: [
    { key:'editar_plano',        label:'Subir planos y editar polígonos', desc:'Cargar el plano de la etapa y dibujar/editar lotes.' },
    { key:'editar_lotes',        label:'Administrar lotes y precios',      desc:'Editar lista de lotes, precios y disponibilidad.' },
    { key:'gestionar_proyectos', label:'Crear y editar proyectos/etapas',  desc:'Administrar proyectos, etapas y cronogramas.' },
  ]},
  { grupo: 'Administración', items: [
    { key:'editar_condiciones', label:'Editar condiciones comerciales', desc:'Topes de descuento, plazos y aprobadores.' },
    { key:'gestionar_usuarios', label:'Gestionar usuarios del equipo',   desc:'Crear, editar y desactivar usuarios.' },
    { key:'editar_plantillas',  label:'Editar plantillas de contrato',   desc:'Modificar minutas, cláusulas y variables.' },
    { key:'superusuario',       label:'Panel de Superusuario',           desc:'Acceso a las herramientas avanzadas del sistema.' },
  ]},
];
const PERMISOS_KEYS = PERMISOS_DEF.flatMap(g => g.items.map(i => i.key));
const _permTodos = (v) => Object.fromEntries(PERMISOS_KEYS.map(k => [k, v]));

// Roles disponibles (incluye la jefatura comercial mencionada por el negocio)
const ROLES = [
  'Administrador', 'Gerente',
  'SubGerente Comercial', 'Jefe Comercial', 'Jefe de Ventas', 'Coordinador de Ventas',
  'Asesor', 'Cobranzas', 'Contable',
];

// Jefatura comercial: vende, ve y registra pagos, sube planos y administra lotes.
const _PERM_JEFATURA = {
  vender:true, ver_pagos:true, registrar_pagos:true,
  editar_plano:true, editar_lotes:true, gestionar_proyectos:true,
};
const PERMISOS_POR_ROL = {
  'Administrador':         _permTodos(true),
  'Gerente':               _permTodos(true),
  'SubGerente Comercial':  { ..._PERM_JEFATURA },
  'Jefe Comercial':        { ..._PERM_JEFATURA },
  'Jefe de Ventas':        { ..._PERM_JEFATURA },
  'Coordinador de Ventas': { ..._PERM_JEFATURA, gestionar_proyectos:false },
  // Asesor de ventas: vende y consulta pagos, pero NO registra pagos ni edita planos.
  'Asesor':                { vender:true, ver_pagos:true },
  'Cobranzas':             { ver_pagos:true, registrar_pagos:true },
  'Contable':              { ver_pagos:true, registrar_pagos:true },
};

// Permisos por defecto de un rol (objeto completo con todas las llaves).
function permisosPorRol(rol) {
  const base = PERMISOS_POR_ROL[rol] || { vender:true, ver_pagos:true };
  const out = {};
  for (const k of PERMISOS_KEYS) out[k] = !!base[k];
  return out;
}
// Permisos efectivos de un usuario: overrides explícitos sobre defaults del rol.
function resolverPermisos(u) {
  const base = permisosPorRol(u?.rol);
  const ov = u?.permisos || {};
  const out = {};
  for (const k of PERMISOS_KEYS) out[k] = (k in ov) ? !!ov[k] : base[k];
  return out;
}

// ── CRUD de empresas + usuarios ─────────────────────────────────
function loadEmpresas() {
  try {
    const raw = localStorage.getItem(EMPRESAS_KEY);
    if (raw) {
      const arr = JSON.parse(raw).map(migrateEmpresa);
      // Persistir migración si hubo cambios
      localStorage.setItem(EMPRESAS_KEY, JSON.stringify(arr));
      return arr;
    }
  } catch (e) {}
  localStorage.setItem(EMPRESAS_KEY, JSON.stringify(EMPRESAS_DEFAULT));
  return EMPRESAS_DEFAULT;
}
function saveEmpresas(arr) {
  try { localStorage.setItem(EMPRESAS_KEY, JSON.stringify(arr)); } catch (e) {}
}
function loadUsuarios() {
  try {
    const raw = localStorage.getItem(USUARIOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(USUARIOS_KEY, JSON.stringify(USUARIOS_DEFAULT));
  return USUARIOS_DEFAULT;
}
function saveUsuarios(arr) {
  try { localStorage.setItem(USUARIOS_KEY, JSON.stringify(arr)); } catch (e) {}
}
function loadSesion() {
  try {
    const raw = localStorage.getItem(SESION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveSesion(s) {
  try {
    if (s) localStorage.setItem(SESION_KEY, JSON.stringify(s));
    else   localStorage.removeItem(SESION_KEY);
  } catch (e) {}
}

// ── Autenticación ───────────────────────────────────────────────
// Devuelve { ok:true, sesion } o { ok:false, error:'mensaje' }.
function autenticar({ empresa, usuario, clave }) {
  const empNorm = (empresa || '').trim().toLowerCase();
  const usrNorm = (usuario || '').trim().toLowerCase();
  if (!empNorm || !usrNorm || !clave) return { ok:false, error:'Completa todos los campos para continuar.' };

  // Master
  if (empNorm === MASTER_EMPRESA && usrNorm === MASTER_USUARIO && clave === MASTER_CLAVE) {
    return { ok:true, sesion:{ tipo:'master', empresaId:null, usuarioId:'master', nombre:'Mattika · Owner', rol:'Master', inicioMs: Date.now() } };
  }

  // Empresa
  const empresas = loadEmpresas();
  const emp = empresas.find(e =>
    e.nombre.toLowerCase() === empNorm ||
    e.id.toLowerCase()     === empNorm
  );
  if (!emp)        return { ok:false, error:'No encontramos esa empresa. Verifica el nombre.' };
  if (!emp.activa) return { ok:false, error:'Esa empresa está desactivada. Contacta a Mattika.' };

  const usuarios = loadUsuarios();
  const u = usuarios.find(x =>
    x.empresaId === emp.id &&
    x.usuario.toLowerCase() === usrNorm
  );
  if (!u)        return { ok:false, error:'Usuario o clave incorrectos.' };
  if (!u.activo) return { ok:false, error:'Usuario desactivado. Contacta al administrador.' };
  if (u.clave !== clave) return { ok:false, error:'Usuario o clave incorrectos.' };

  return {
    ok:true,
    sesion:{
      tipo:'empresa',
      empresaId: emp.id,
      usuarioId: u.id,
      nombre: u.nombre,
      rol: u.rol,
      empresaNombre: emp.nombre,
      proyecto: emp.proyecto,
      inicioMs: Date.now(),
    },
  };
}

function cerrarSesion() { saveSesion(null); }

// Hook ligero para el shell — devuelve la sesión actual + setters
function useSesion() {
  const [sesion, setSesion] = React.useState(() => loadSesion());
  React.useEffect(() => { saveSesion(sesion); }, [sesion]);
  return [sesion, setSesion];
}

// ════════════════════════════════════════════════════════════════
// PANTALLA DE LOGIN
// ════════════════════════════════════════════════════════════════
const LoginScreen = ({ onLogin }) => {
  const [empresa, setEmpresa] = React.useState('');
  const [usuario, setUsuario] = React.useState('');
  const [clave,   setClave]   = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [recuerda, setRecuerda] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [hintOpen, setHintOpen] = React.useState(false);

  // Cargar empresas activas para el desplegable
  const empresasActivas = React.useMemo(() => loadEmpresas().filter(e => e.activa), []);

  // Pre-rellenar último empresa/usuario (no la clave) si recordó el login
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('mattika.last-login.v1');
      if (raw) {
        const { empresa: e, usuario: u } = JSON.parse(raw);
        if (e) setEmpresa(e);
        if (u) setUsuario(u);
      }
    } catch (e) {}
  }, []);

  const submit = (ev) => {
    ev?.preventDefault?.();
    setError(null);
    setLoading(true);
    // Pequeño delay para que se sienta como una validación real
    setTimeout(() => {
      const res = autenticar({ empresa, usuario, clave });
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      if (recuerda) {
        try { localStorage.setItem('mattika.last-login.v1', JSON.stringify({ empresa, usuario })); } catch (e) {}
      } else {
        try { localStorage.removeItem('mattika.last-login.v1'); } catch (e) {}
      }
      onLogin(res.sesion);
    }, 450);
  };

  const llenarDemo = (empName, user, pass) => {
    setEmpresa(empName); setUsuario(user); setClave(pass); setError(null);
  };

  return (
    <div className="auth-shell">
      {/* ─── Lado izquierdo: formulario ──────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-top">
          <div className="auth-mini-brand">
            <span className="auth-mini-mark">M</span>
            <span className="auth-mini-name">Mattika</span>
            <span className="auth-mini-system">SYSTEM</span>
          </div>
          <span className="auth-mini-version">v1.0 · PE</span>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-form-head">
            <h1>Bienvenido</h1>
            <p>Ingresa con las credenciales que te entregamos para acceder al sistema de tu inmobiliaria.</p>
          </div>

          <label className="auth-field">
            <span className="auth-label">Empresa</span>
            <div className="auth-input-wrap auth-select-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h0M9 13h0M9 17h0M15 9h0M15 13h0M15 17h0" strokeLinecap="round"/>
              </svg>
              <select
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                autoComplete="organization"
                autoFocus
              >
                <option value="" disabled>Selecciona tu empresa…</option>
                {empresasActivas.map(e => (
                  <option key={e.id} value={e.nombre}>{e.nombre}</option>
                ))}
                <option disabled>──────────</option>
                <option value="Mattika">Mattika · Acceso interno</option>
              </select>
              <svg className="auth-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </label>

          <label className="auth-field">
            <span className="auth-label">Usuario</span>
            <div className="auth-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.6"/>
                <path d="M5 20c.6-3.6 3.6-6 7-6s6.4 2.4 7 6" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="usuario"
                value={usuario}
                autoComplete="username"
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
          </label>

          <label className="auth-field">
            <div className="auth-label-row">
              <span className="auth-label">Clave</span>
              <button type="button" className="auth-link" onClick={() => setHintOpen(v => !v)}>
                ¿No la recuerdas?
              </button>
            </div>
            <div className="auth-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round"/>
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={clave}
                autoComplete="current-password"
                onChange={(e) => setClave(e.target.value)}
              />
              <button type="button" className="auth-eye" onClick={() => setShowPass(v => !v)} aria-label="Mostrar clave">
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 3l18 18M10.6 6.2A9.9 9.9 0 0 1 12 6c5 0 9 5 10 6-.5.6-1.8 1.9-3.6 3.2M6.2 7.5C4.2 8.8 2.8 10.5 2 12c1 1 5 6 10 6 1.2 0 2.3-.2 3.3-.5" strokeLinecap="round"/>
                    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </label>

          {hintOpen && (
            <div className="auth-recovery">
              Las claves las gestiona Mattika directamente. Escribe a{' '}
              <a href="mailto:soporte@mattika.pe">soporte@mattika.pe</a>{' '}
              y te asignaremos una nueva en minutos.
            </div>
          )}

          <label className="auth-remember">
            <input type="checkbox" checked={recuerda} onChange={(e) => setRecuerda(e.target.checked)} />
            <span>Recordar empresa y usuario en este equipo</span>
          </label>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v5M12 16h.01" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-spinner"/>
                <span>Verificando…</span>
              </>
            ) : (
              <>
                <span>Iniciar sesión</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          <div className="auth-demos">
            <div className="auth-demos-title">Credenciales de demostración</div>
            <div className="auth-demos-grid">
              <button type="button" className="auth-demo-card" onClick={() => llenarDemo('Lumina Grupo Inmobiliario', 'admin', 'lumina2026')}>
                <span className="auth-demo-emp">Lumina Grupo Inmobiliario</span>
                <span className="auth-demo-proj">Proyecto Nápoles</span>
                <span className="auth-demo-creds"><b>admin</b> · lumina2026</span>
              </button>
              <button type="button" className="auth-demo-card" onClick={() => llenarDemo('Golden Inmobiliaria', 'admin', 'golden2026')}>
                <span className="auth-demo-emp">Golden Inmobiliaria</span>
                <span className="auth-demo-proj">Villa Club Malabrigo</span>
                <span className="auth-demo-creds"><b>admin</b> · golden2026</span>
              </button>
            </div>
            <button type="button" className="auth-master-link" onClick={() => llenarDemo('Mattika', 'owner', 'mattika2026')}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>
              </svg>
              <span>Acceso interno · administrador Mattika</span>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <span>© {new Date().getFullYear()} Mattika System · Hecho en Trujillo, Perú</span>
          <span className="dot">·</span>
          <a href="#">Términos</a>
          <span className="dot">·</span>
          <a href="#">Privacidad</a>
        </div>
      </div>

      {/* ─── Lado derecho: showcase ──────────────────────────── */}
      <aside className="auth-right">
        <div className="auth-right-glow"/>
        <div className="auth-right-grid"/>
        <div className="auth-right-inner">
          <img className="auth-logo" src="mattika-logo.png" alt="Mattika System"/>
          <p className="auth-tagline">
            Comercial y contable, <em>en un solo plano.</em>
          </p>
          <p className="auth-subtagline">
            El sistema operativo de la inmobiliaria moderna — un lugar para vender, cobrar, firmar y llevar el orden.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </div>
              <div>
                <div className="auth-feature-title">Plano interactivo</div>
                <div className="auth-feature-desc">Cada lote, su estado y su precio — en tiempo real.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 3v5h5M6 3h8l5 5v13H6z"/><path d="M9 13h6M9 17h4" strokeLinecap="round"/></svg>
              </div>
              <div>
                <div className="auth-feature-title">Contratos en minutos</div>
                <div className="auth-feature-desc">Minutas, addendas y cronogramas listos para firmar.</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-ic">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7l9 5 9-5M3 7v10l9 5 9-5V7M3 7l9-4 9 4" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div className="auth-feature-title">Cobranzas al día</div>
                <div className="auth-feature-desc">Cuotas, intereses y conciliación bancaria en orden.</div>
              </div>
            </div>
          </div>

          <div className="auth-meta">
            <div className="auth-meta-row">
              <span className="auth-meta-k">Acceso</span>
              <span className="auth-meta-v">Privado · por invitación</span>
            </div>
            <div className="auth-meta-row">
              <span className="auth-meta-k">Soporte</span>
              <span className="auth-meta-v">soporte@mattika.pe · +51 923 585 590</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// SUPER ADMIN — gestor de empresas y usuarios (solo cuenta Master)
// ════════════════════════════════════════════════════════════════
const ScreenMattikaAdmin = ({ onToast, onCerrarSesion }) => {
  const [empresas, setEmpresas] = React.useState(() => loadEmpresas());
  const [usuarios, setUsuarios] = React.useState(() => loadUsuarios());
  const [tab, setTab] = React.useState('empresas');
  const [empresaSel, setEmpresaSel] = React.useState(empresas[0]?.id || null);
  const [empresaModal, setEmpresaModal] = React.useState(null); // null | 'new' | empresa
  const [usuarioModal, setUsuarioModal] = React.useState(null); // null | 'new' | usuario

  const persistEmpresas = (next) => { setEmpresas(next); saveEmpresas(next); };
  const persistUsuarios = (next) => { setUsuarios(next); saveUsuarios(next); };

  const onSaveEmpresa = (data) => {
    const isNew = !data.id;
    const id = data.id || (data.nombre || 'emp').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24) + '-' + Math.random().toString(36).slice(2,5);
    let next;
    if (isNew) {
      // Construir proyectos[0] a partir de los campos del formulario
      const proyId = (data.proyecto || 'proyecto').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30) + '-' + Math.random().toString(36).slice(2,4);
      const empresa = {
        id,
        nombre: data.nombre,
        color: data.color || '#1E4FD4',
        creadaEl: new Date().toISOString().slice(0,10),
        activa: data.activa !== false,
        proyectos: [{
          id: proyId,
          nombre: data.proyecto || 'Proyecto principal',
          ubicacion: data.proyectoSub || '',
          descripcion: '',
          estado: 'planificacion',
          fechaInicio: '',
          fechaEntrega: '',
          etapas: [{ id:'e1', nombre:'Etapa 1', estado:'planificacion', lotes:0, fechaInicio:'', fechaEntrega:'' }],
        }],
      };
      next = [...empresas, empresa];
    } else {
      // Solo actualizar metadata de la empresa — proyectos se gestionan desde la pantalla Proyectos
      next = empresas.map(e => e.id === id ? { ...e, nombre: data.nombre, color: data.color, activa: data.activa } : e);
    }
    persistEmpresas(next);
    setEmpresaModal(null);
    onToast?.(isNew ? '✓ Empresa creada' : '✓ Empresa actualizada');
  };
  const onDeleteEmpresa = (emp) => {
    if (!window.confirm(`¿Eliminar la empresa "${emp.nombre}"?\n\nTodos sus usuarios también se eliminarán. Esta acción no se puede deshacer.`)) return;
    persistEmpresas(empresas.filter(e => e.id !== emp.id));
    persistUsuarios(usuarios.filter(u => u.empresaId !== emp.id));
    if (empresaSel === emp.id) setEmpresaSel(null);
    onToast?.('Empresa eliminada');
  };
  const onToggleEmpresa = (emp) => {
    persistEmpresas(empresas.map(e => e.id === emp.id ? { ...e, activa: !e.activa } : e));
    onToast?.(emp.activa ? 'Empresa desactivada' : 'Empresa reactivada');
  };

  const onSaveUsuario = (data) => {
    const isNew = !data.id;
    const id = data.id || 'u-' + Math.random().toString(36).slice(2, 10);
    const next = isNew
      ? [...usuarios, { ...data, id, activo: data.activo !== false }]
      : usuarios.map(u => u.id === id ? { ...u, ...data, id } : u);
    persistUsuarios(next);
    setUsuarioModal(null);
    window.dispatchEvent(new CustomEvent('mattika:permisos-cambiado'));
    onToast?.(isNew ? '✓ Usuario creado' : '✓ Usuario actualizado');
  };
  const onDeleteUsuario = (u) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.usuario}" (${u.nombre})?`)) return;
    persistUsuarios(usuarios.filter(x => x.id !== u.id));
    onToast?.('Usuario eliminado');
  };
  const onToggleUsuario = (u) => {
    persistUsuarios(usuarios.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x));
    onToast?.(u.activo ? 'Usuario desactivado' : 'Usuario reactivado');
  };

  const empresaActual = empresas.find(e => e.id === empresaSel);
  const usuariosEmpresa = empresaActual ? usuarios.filter(u => u.empresaId === empresaActual.id) : usuarios;

  return (
    <div className="mtk-admin">
      <header className="mtk-admin-head">
        <div className="flex1">
          <div className="mtk-admin-eyebrow">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></svg>
            Consola Mattika · Master
          </div>
          <h1>Gestión de empresas y usuarios</h1>
          <p>Aquí defines quién puede entrar al sistema. Cada empresa tiene sus propios proyectos, condiciones comerciales y usuarios.</p>
        </div>
        <button className="btn ghost" onClick={onCerrarSesion}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h14" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Salir
        </button>
      </header>

      <div className="mtk-admin-stats">
        <div className="mtk-admin-stat">
          <div className="mtk-admin-stat-num">{empresas.length}</div>
          <div className="mtk-admin-stat-lbl">Empresas registradas</div>
        </div>
        <div className="mtk-admin-stat">
          <div className="mtk-admin-stat-num">{empresas.filter(e => e.activa).length}</div>
          <div className="mtk-admin-stat-lbl">Activas</div>
        </div>
        <div className="mtk-admin-stat">
          <div className="mtk-admin-stat-num">{usuarios.length}</div>
          <div className="mtk-admin-stat-lbl">Usuarios totales</div>
        </div>
        <div className="mtk-admin-stat">
          <div className="mtk-admin-stat-num">{usuarios.filter(u => u.activo).length}</div>
          <div className="mtk-admin-stat-lbl">Usuarios activos</div>
        </div>
      </div>

      <div className="mtk-admin-tabs">
        <button className={tab === 'empresas' ? 'on' : ''} onClick={() => setTab('empresas')}>Empresas</button>
        <button className={tab === 'usuarios' ? 'on' : ''} onClick={() => setTab('usuarios')}>Usuarios</button>
      </div>

      {tab === 'empresas' && (
        <div className="mtk-admin-section">
          <div className="mtk-admin-section-head">
            <h2>Empresas</h2>
            <button className="btn primary" onClick={() => setEmpresaModal('new')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
              Nueva empresa
            </button>
          </div>
          <div className="mtk-admin-cards">
            {empresas.map(emp => {
              const nUsers = usuarios.filter(u => u.empresaId === emp.id).length;
              return (
                <div key={emp.id} className="mtk-admin-card" data-inactive={!emp.activa}>
                  <div className="mtk-admin-card-head">
                    <div className="mtk-admin-card-logo" style={{ background: emp.color || '#1E4FD4' }}>
                      {emp.nombre[0]}
                    </div>
                    <div className="flex1">
                      <div className="mtk-admin-card-name">{emp.nombre}</div>
                      <div className="mtk-admin-card-proj">
                        {emp.proyectos?.length === 1
                          ? <>{emp.proyectos[0].nombre}<span className="muted"> · {emp.proyectos[0].ubicacion}</span></>
                          : <>{emp.proyectos?.length || 0} proyectos · {(emp.proyectos || []).reduce((s, p) => s + (p.etapas?.length || 0), 0)} etapas</>
                        }
                      </div>
                    </div>
                    <span className={`mtk-admin-pill ${emp.activa ? 'on' : 'off'}`}>
                      {emp.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="mtk-admin-card-meta">
                    <div><span>Usuarios</span><b>{nUsers}</b></div>
                    <div><span>Creada</span><b className="mono">{emp.creadaEl}</b></div>
                    <div><span>ID interno</span><b className="mono">{emp.id}</b></div>
                  </div>
                  <div className="mtk-admin-card-actions">
                    <button className="btn" onClick={() => setEmpresaModal(emp)}>Editar</button>
                    <button className="btn" onClick={() => onToggleEmpresa(emp)}>{emp.activa ? 'Desactivar' : 'Reactivar'}</button>
                    <button className="btn" onClick={() => { setTab('usuarios'); setEmpresaSel(emp.id); }}>Usuarios ({nUsers})</button>
                    <button className="btn danger" onClick={() => onDeleteEmpresa(emp)}>Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="mtk-admin-section">
          <div className="mtk-admin-section-head">
            <h2>Usuarios</h2>
            <div className="mtk-admin-filter">
              <span>Filtrar por empresa</span>
              <select value={empresaSel || ''} onChange={(e) => setEmpresaSel(e.target.value || null)}>
                <option value="">Todas</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <button className="btn primary" onClick={() => setUsuarioModal('new')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
                Nuevo usuario
              </button>
            </div>
          </div>
          <table className="mtk-admin-tbl">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Clave</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuariosEmpresa.map(u => {
                const emp = empresas.find(e => e.id === u.empresaId);
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="mtk-admin-row-emp">
                        <span className="mtk-admin-row-dot" style={{ background: emp?.color }}/>
                        <span>{emp?.nombre || '—'}</span>
                      </div>
                    </td>
                    <td className="mono"><b>{u.usuario}</b></td>
                    <td>{u.nombre}</td>
                    <td><span className="pill outline">{u.rol}</span></td>
                    <td className="mono muted">{'•'.repeat(Math.min(u.clave?.length || 8, 12))}</td>
                    <td>
                      <span className={`mtk-admin-pill ${u.activo ? 'on' : 'off'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="mtk-admin-row-actions">
                      <button className="btn" onClick={() => setUsuarioModal(u)}>Editar</button>
                      <button className="btn" onClick={() => onToggleUsuario(u)}>{u.activo ? 'Desactivar' : 'Reactivar'}</button>
                      <button className="btn danger" onClick={() => onDeleteUsuario(u)}>×</button>
                    </td>
                  </tr>
                );
              })}
              {usuariosEmpresa.length === 0 && (
                <tr><td colSpan={7} className="muted center" style={{padding:'24px'}}>No hay usuarios para esta empresa todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {empresaModal && (
        <EmpresaModal
          initial={empresaModal === 'new' ? null : empresaModal}
          onClose={() => setEmpresaModal(null)}
          onSave={onSaveEmpresa}
        />
      )}
      {usuarioModal && (
        <UsuarioModal
          initial={usuarioModal === 'new' ? null : usuarioModal}
          empresas={empresas}
          empresaIdDefault={empresaSel || empresas[0]?.id}
          onClose={() => setUsuarioModal(null)}
          onSave={onSaveUsuario}
        />
      )}
    </div>
  );
};

// ── Editor de permisos (checkboxes) — reutilizable ─────────────
const PermisosEditor = ({ rol, value, onChange }) => {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="perm-editor">
      <div className="perm-editor-head">
        <span className="auth-label" style={{margin:0}}>Permisos de acceso</span>
        <button type="button" className="auth-link" onClick={() => onChange(permisosPorRol(rol))}>
          Usar valores del rol “{rol}”
        </button>
      </div>
      {PERMISOS_DEF.map(g => (
        <div key={g.grupo} className="perm-group">
          <div className="perm-group-title">{g.grupo}</div>
          {g.items.map(it => (
            <label key={it.key} className="perm-row">
              <input type="checkbox" checked={!!value[it.key]} onChange={(e) => set(it.key, e.target.checked)}/>
              <span className="perm-row-main">
                <span className="perm-row-label">{it.label}</span>
                <span className="perm-row-desc">{it.desc}</span>
              </span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};

// ── Modal: nueva/editar empresa ─────────────────────────────────
const EmpresaModal = ({ initial, onClose, onSave }) => {
  const [f, setF] = React.useState(() => initial
    ? { id: initial.id, nombre: initial.nombre, color: initial.color || '#1E4FD4', activa: initial.activa !== false }
    : { nombre: '', proyecto: '', proyectoSub: '', color: '#1E4FD4', activa: true }
  );
  const submit = (ev) => {
    ev.preventDefault();
    if (!f.nombre.trim()) return;
    if (!initial && !f.proyecto.trim()) return;
    onSave({ ...f, ...(initial ? { id: initial.id, creadaEl: initial.creadaEl } : {}) });
  };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" onSubmit={submit}>
        <header>
          <h3>{initial ? 'Editar empresa' : 'Nueva empresa'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <label className="auth-field">
            <span className="auth-label">Nombre de la empresa</span>
            <input type="text" value={f.nombre} onChange={(e) => setF({...f, nombre: e.target.value})} required placeholder="p.ej. Lumina Grupo Inmobiliario"/>
          </label>

          {!initial && (
            <>
              <div className="auth-recovery" style={{marginBottom:4}}>
                Al crear la empresa, también se crea su <b>primer proyecto</b> y <b>Etapa 1</b>. Luego puedes agregar más desde Configuración → Proyectos.
              </div>
              <label className="auth-field">
                <span className="auth-label">Nombre del primer proyecto</span>
                <input type="text" value={f.proyecto} onChange={(e) => setF({...f, proyecto: e.target.value})} required placeholder="p.ej. Nápoles"/>
              </label>
              <label className="auth-field">
                <span className="auth-label">Ubicación / referencia del proyecto</span>
                <input type="text" value={f.proyectoSub} onChange={(e) => setF({...f, proyectoSub: e.target.value})} placeholder="p.ej. Valle Chicama · Trujillo"/>
              </label>
            </>
          )}

          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Color de la marca</span>
              <div className="mtk-color-picker">
                {['#1E4FD4','#0F3D8A','#7A4DB5','#0C7A6B','#B8862A','#B33049','#1F2C47'].map(c => (
                  <button type="button" key={c} className={f.color === c ? 'on' : ''} style={{background: c}} onClick={() => setF({...f, color: c})}/>
                ))}
              </div>
            </label>
            <label className="auth-field">
              <span className="auth-label">Estado</span>
              <label className="auth-remember" style={{marginTop:8}}>
                <input type="checkbox" checked={f.activa !== false} onChange={(e) => setF({...f, activa: e.target.checked})}/>
                <span>Empresa activa (puede iniciar sesión)</span>
              </label>
            </label>
          </div>

          {initial && (
            <div className="muted text-xs" style={{lineHeight:1.5, marginTop:4}}>
              Los proyectos y etapas se gestionan desde la pantalla <b>Configuración → Proyectos</b> de cada empresa.
            </div>
          )}
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{initial ? 'Guardar cambios' : 'Crear empresa'}</button>
        </footer>
      </form>
    </div>
  );
};

// ── Modal: nuevo/editar usuario ─────────────────────────────────
const UsuarioModal = ({ initial, empresas, empresaIdDefault, onClose, onSave }) => {
  const [f, setF] = React.useState(() => {
    const base = initial || {
      empresaId: empresaIdDefault || empresas[0]?.id || '',
      usuario: '', clave: '', nombre: '', rol: 'Asesor', activo: true,
    };
    return { ...base, permisos: base.permisos ? { ...permisosPorRol(base.rol), ...base.permisos } : permisosPorRol(base.rol) };
  });
  const [showPass, setShowPass] = React.useState(false);
  const submit = (ev) => {
    ev.preventDefault();
    if (!f.usuario.trim() || !f.clave.trim() || !f.empresaId) return;
    onSave({ ...f, ...(initial ? { id: initial.id } : {}) });
  };
  const generarClave = () => {
    const cs = 'abcdefghkmnopqrstuvwxyz23456789';
    let p = '';
    for (let i = 0; i < 10; i++) p += cs[Math.floor(Math.random()*cs.length)];
    setF({...f, clave: p});
    setShowPass(true);
  };
  return (
    <div className="mtk-modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="mtk-modal" onSubmit={submit}>
        <header>
          <h3>{initial ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <button type="button" className="mtk-modal-x" onClick={onClose}>×</button>
        </header>
        <div className="mtk-modal-body">
          <label className="auth-field">
            <span className="auth-label">Empresa</span>
            <select value={f.empresaId} onChange={(e) => setF({...f, empresaId: e.target.value})} required>
              <option value="" disabled>Selecciona una empresa</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </label>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Usuario</span>
              <input type="text" value={f.usuario} onChange={(e) => setF({...f, usuario: e.target.value.toLowerCase().replace(/\s/g,'')})} required placeholder="usuario"/>
            </label>
            <label className="auth-field">
              <span className="auth-label">Nombre completo</span>
              <input type="text" value={f.nombre} onChange={(e) => setF({...f, nombre: e.target.value})} placeholder="Mateo Vargas"/>
            </label>
          </div>
          <div className="mtk-modal-grid">
            <label className="auth-field">
              <span className="auth-label">Rol</span>
              <select value={f.rol} onChange={(e) => setF({...f, rol: e.target.value, permisos: permisosPorRol(e.target.value)})}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
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
          <PermisosEditor rol={f.rol} value={f.permisos} onChange={(p) => setF({...f, permisos: p})}/>
        </div>
        <footer>
          <button type="button" className="btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn primary">{initial ? 'Guardar cambios' : 'Crear usuario'}</button>
        </footer>
      </form>
    </div>
  );
};

// ── Contexto actual (proyecto + etapa seleccionados) ───────────
// Una clave por empresa para que cada usuario de la misma empresa
// pueda tener su propia selección sin pisarse.
const CONTEXTO_KEY_BASE = 'mattika.contexto.v1';
function _ctxKey(empresaId) {
  return `${CONTEXTO_KEY_BASE}.${empresaId || '_default'}`;
}
function loadContexto(empresaId) {
  try {
    const raw = localStorage.getItem(_ctxKey(empresaId));
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Por defecto: primer proyecto + primera etapa
  const emp = loadEmpresas().find(e => e.id === empresaId);
  const p = emp?.proyectos?.[0];
  return { proyectoId: p?.id || null, etapaId: p?.etapas?.[0]?.id || null };
}
function saveContexto(empresaId, ctx) {
  try { localStorage.setItem(_ctxKey(empresaId), JSON.stringify(ctx)); } catch (e) {}
}
function setProyectoActivo(empresaId, proyectoId) {
  const emp = loadEmpresas().find(e => e.id === empresaId);
  const p = emp?.proyectos?.find(x => x.id === proyectoId);
  // Al cambiar de proyecto, resetea la etapa a la primera del proyecto nuevo
  const ctx = { proyectoId, etapaId: p?.etapas?.[0]?.id || null };
  saveContexto(empresaId, ctx);
  return ctx;
}
function setEtapaActiva(empresaId, etapaId) {
  const cur = loadContexto(empresaId);
  const ctx = { ...cur, etapaId };
  saveContexto(empresaId, ctx);
  return ctx;
}
// Hook ligero para que el shell escuche cambios de contexto
function useContexto(empresaId) {
  const [ctx, setCtx] = React.useState(() => loadContexto(empresaId));
  React.useEffect(() => { setCtx(loadContexto(empresaId)); }, [empresaId]);
  const update = (next) => {
    setCtx(next);
    saveContexto(empresaId, next);
    // Notificar a otros componentes que el contexto cambió
    window.dispatchEvent(new CustomEvent('mattika:contexto-cambiado', { detail: next }));
  };
  return [ctx, update];
}

Object.assign(window, {
  LoginScreen, ScreenMattikaAdmin, PermisosEditor,
  useSesion, autenticar, cerrarSesion, loadSesion, saveSesion,
  loadEmpresas, saveEmpresas, loadUsuarios, saveUsuarios,
  loadContexto, saveContexto, setProyectoActivo, setEtapaActiva, useContexto,
  // Helper para que cualquier pantalla consulte la empresa actual.
  getEmpresaActual: () => {
    const s = loadSesion();
    if (!s || s.tipo !== 'empresa') return null;
    return loadEmpresas().find(e => e.id === s.empresaId) || null;
  },
  // Helper: proyecto activo (objeto)
  getProyectoActual: () => {
    const s = loadSesion();
    if (!s || s.tipo !== 'empresa') return null;
    const emp = loadEmpresas().find(e => e.id === s.empresaId);
    if (!emp) return null;
    const ctx = loadContexto(s.empresaId);
    return emp.proyectos?.find(p => p.id === ctx.proyectoId) || emp.proyectos?.[0] || null;
  },
  // Helper: etapa activa (objeto)
  getEtapaActual: () => {
    const p = window.getProyectoActual?.();
    if (!p) return null;
    const ctx = loadContexto(loadSesion()?.empresaId);
    return p.etapas?.find(e => e.id === ctx.etapaId) || p.etapas?.[0] || null;
  },
  // Sesión actual (objeto) — atajo
  getSesion: () => loadSesion(),
  // ── Permisos del usuario en sesión ───────────────────────────
  PERMISOS_DEF, PERMISOS_KEYS, PERMISOS_POR_ROL, ROLES,
  permisosPorRol, resolverPermisos,
  // Permisos efectivos del usuario logueado (objeto {key:bool}).
  getPermisos: () => {
    const s = loadSesion();
    if (!s) return _permTodos(false);
    if (s.tipo === 'master') return _permTodos(true);
    const u = loadUsuarios().find(x => x.id === s.usuarioId) || { rol: s.rol };
    return resolverPermisos(u);
  },
  // ¿El usuario en sesión puede hacer `perm`?
  can: (perm) => {
    const s = loadSesion();
    if (!s) return false;
    if (s.tipo === 'master') return true;
    const u = loadUsuarios().find(x => x.id === s.usuarioId) || { rol: s.rol };
    return !!resolverPermisos(u)[perm];
  },
  // ── Clave de alcance (scope) ─────────────────────────────────
  // Identifica de forma única el contexto activo: empresa · proyecto · etapa.
  // TODO el dato comercial (plano, polígonos, reservas, lista de lotes) se
  // guarda y se lee bajo esta clave, de modo que cada proyecto/etapa de cada
  // empresa es completamente independiente del resto.
  getScopeKey: () => {
    const s = loadSesion();
    if (!s || s.tipo !== 'empresa') return '_default._default._default';
    const emp = loadEmpresas().find(e => e.id === s.empresaId);
    const ctx = loadContexto(s.empresaId);
    const pid = ctx.proyectoId || emp?.proyectos?.[0]?.id || '_default';
    const eid = ctx.etapaId || emp?.proyectos?.find(p => p.id === pid)?.etapas?.[0]?.id || '_default';
    return `${s.empresaId}.${pid}.${eid}`;
  },
  // ¿El contexto activo es el proyecto semilla (Nápoles, demo de Lumina)?
  // Solo este proyecto trae los 264 lotes de demostración pre-cargados;
  // cualquier otro proyecto arranca en blanco para dibujar sus propios lotes.
  isSeedScope: () => {
    const s = loadSesion();
    if (!s || s.tipo !== 'empresa') return false;
    const ctx = loadContexto(s.empresaId);
    const pid = ctx.proyectoId || loadEmpresas().find(e => e.id === s.empresaId)?.proyectos?.[0]?.id;
    return s.empresaId === 'lumina' && pid === 'napoles';
  },
});
