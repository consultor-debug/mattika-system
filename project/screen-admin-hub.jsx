// screen-admin-hub.jsx — Panel de Superusuario / Administrador

const ADMIN_CARDS = [
  {
    id: 'lotes',
    title: 'Administrador de Lotes',
    desc: 'Cargar lista de precios desde Excel, editar lotes individualmente y administrar disponibilidad.',
    icon: 'building',
    accent: '#1ea968',
    route: 'inmuebles',
    badge: '264 lotes',
  },
  {
    id: 'precios',
    title: 'Condiciones Comerciales',
    desc: 'Topes de descuento, plazos de financiamiento y aprobadores autorizados para vistos buenos.',
    icon: 'money',
    accent: '#d99b1e',
    route: 'condiciones',
    badge: 'Editar',
  },
  {
    id: 'usuarios',
    title: 'Usuarios y Roles',
    desc: 'Gestiona el equipo, permisos por rol y accesos al sistema.',
    icon: 'users',
    accent: '#7A4DB5',
    route: 'asesores',
    badge: '5 activos',
  },
  {
    id: 'plantillas',
    title: 'Plantillas de Contrato',
    desc: 'Editor avanzado de minutas, cláusulas y variables del contrato.',
    icon: 'template',
    accent: '#1E4FD4',
    route: 'templates',
  },
  {
    id: 'proyectos',
    title: 'Proyectos y Etapas',
    desc: 'Crear nuevos proyectos, configurar manzanas y dividir por etapas.',
    icon: 'layers',
    accent: '#0C7A6B',
    route: 'proyectos',
    badge: '1 proyecto',
  },
  {
    id: 'auditoria',
    title: 'Auditoría',
    desc: 'Historial de cambios de precio, asignaciones y movimientos sensibles.',
    icon: 'shield',
    accent: '#B33049',
    badge: 'Nuevo',
  },
  {
    id: 'integraciones',
    title: 'Integraciones',
    desc: 'Conexiones con BCP, WhatsApp Business, SUNAT y notarías.',
    icon: 'send',
    accent: '#1F6FEB',
    route: 'settings',
  },
  {
    id: 'respaldos',
    title: 'Respaldos',
    desc: 'Exportar backup completo y restaurar desde un archivo previo.',
    icon: 'archive',
    accent: '#5B6680',
  },
];

const ScreenAdminHub = ({ onGoto, onToast }) => {
  return (
    <div className="page page-admin-hub" data-screen-label="Superusuario"
         style={{maxWidth: 1180}}>

      <div className="admin-hero">
        <div className="admin-hero-badge">
          <Icon name="shield" size={14}/>
          <span>Superusuario</span>
        </div>
        <h1 className="admin-hero-title">Panel de administración</h1>
        <p className="admin-hero-sub">
          Controles avanzados para configurar el sistema, cargar datos masivamente y gestionar permisos del equipo.
        </p>
        <div className="admin-hero-stats">
          <div>
            <div className="admin-hero-stat-num">264</div>
            <div className="admin-hero-stat-label">Lotes registrados</div>
          </div>
          <div>
            <div className="admin-hero-stat-num">5</div>
            <div className="admin-hero-stat-label">Usuarios activos</div>
          </div>
          <div>
            <div className="admin-hero-stat-num">1</div>
            <div className="admin-hero-stat-label">Proyecto activo</div>
          </div>
          <div>
            <div className="admin-hero-stat-num">v 2.4</div>
            <div className="admin-hero-stat-label">Versión del sistema</div>
          </div>
        </div>
      </div>

      <div className="admin-section-title">
        <span>Herramientas</span>
        <div className="admin-section-line"/>
      </div>

      <div className="admin-grid">
        {ADMIN_CARDS.map(c => (
          <button key={c.id}
                  className="admin-card"
                  onClick={() => c.route ? onGoto(c.route) : onToast?.('Próximamente · ' + c.title)}>
            <div className="admin-card-ic" style={{
              background: `color-mix(in oklab, ${c.accent} 14%, white)`,
              color: c.accent,
            }}>
              <Icon name={c.icon} size={20}/>
            </div>
            <div className="admin-card-body">
              <div className="admin-card-head">
                <div className="admin-card-title">{c.title}</div>
                {c.badge && <span className="admin-card-badge">{c.badge}</span>}
              </div>
              <div className="admin-card-desc">{c.desc}</div>
            </div>
            <div className="admin-card-arrow">
              <Icon name="chevronR" size={14}/>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-section-title">
        <span>Zona crítica</span>
        <div className="admin-section-line"/>
      </div>

      <div className="admin-danger">
        <div className="admin-danger-row">
          <div>
            <div className="strong">Restablecer datos del sistema</div>
            <div className="muted text-sm">Borra todos los lotes cargados y vuelve a los datos de fábrica. No afecta contratos firmados.</div>
          </div>
          <button className="btn danger" onClick={() => {
            if (confirm('¿Restablecer todos los lotes a los datos de fábrica?')) {
              localStorage.removeItem('mattika.lotes-admin.v1');
              onToast?.('Datos restablecidos. Recarga la página para ver los cambios.');
            }
          }}>
            <Icon name="refresh" size={13}/> Restablecer
          </button>
        </div>
        <div className="admin-danger-row">
          <div>
            <div className="strong">Cerrar acceso de superusuario</div>
            <div className="muted text-sm">Salir del modo administrador. Volverás al rol de asesor.</div>
          </div>
          <button className="btn" onClick={() => onToast?.('Sesión de superusuario cerrada (demo)')}>
            <Icon name="x" size={13}/> Cerrar acceso
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ScreenAdminHub });
