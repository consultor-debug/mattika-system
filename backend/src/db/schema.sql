-- ═══════════════════════════════════════════════════════════
-- MATTIKA SYSTEM · Schema PostgreSQL
-- ═══════════════════════════════════════════════════════════

-- Empresas (tenants)
CREATE TABLE IF NOT EXISTS empresas (
  id          VARCHAR(50) PRIMARY KEY,
  nombre      VARCHAR(200) NOT NULL,
  color       VARCHAR(20) DEFAULT '#1E4FD4',
  activa      BOOLEAN DEFAULT true,
  creada_el   TIMESTAMP DEFAULT NOW()
);

-- Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id             VARCHAR(50) PRIMARY KEY,
  empresa_id     VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre         VARCHAR(200) NOT NULL,
  ubicacion      TEXT,
  descripcion    TEXT,
  estado         VARCHAR(50) DEFAULT 'preventa',
  fecha_inicio   DATE,
  fecha_entrega  DATE,
  creado_el      TIMESTAMP DEFAULT NOW()
);

-- Etapas
CREATE TABLE IF NOT EXISTS etapas (
  id             VARCHAR(50) PRIMARY KEY,
  proyecto_id    VARCHAR(50) NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  empresa_id     VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre         VARCHAR(200) NOT NULL,
  estado         VARCHAR(50) DEFAULT 'preventa',
  lotes          INTEGER DEFAULT 0,
  fecha_inicio   DATE,
  fecha_entrega  DATE,
  plano_imagen   TEXT,
  plano_alineacion JSONB DEFAULT '{}',
  creado_el      TIMESTAMP DEFAULT NOW()
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id             VARCHAR(50) PRIMARY KEY,
  empresa_id     VARCHAR(50) REFERENCES empresas(id) ON DELETE CASCADE,
  nombre         VARCHAR(200) NOT NULL,
  username       VARCHAR(100) NOT NULL,
  password_hash  VARCHAR(200) NOT NULL,
  rol            VARCHAR(50) NOT NULL DEFAULT 'Asesor',
  activo         BOOLEAN DEFAULT true,
  permisos       JSONB DEFAULT '{}',
  tipo           VARCHAR(20) DEFAULT 'empresa',
  creado_el      TIMESTAMP DEFAULT NOW(),
  UNIQUE(empresa_id, username)
);

-- Lotes
CREATE TABLE IF NOT EXISTS lotes (
  id           VARCHAR(50) PRIMARY KEY,
  empresa_id   VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  proyecto_id  VARCHAR(50) REFERENCES proyectos(id),
  etapa_id     VARCHAR(50) REFERENCES etapas(id),
  codigo       VARCHAR(50),
  manzana      VARCHAR(20),
  numero       VARCHAR(20),
  area         DECIMAL(10,2),
  frente       DECIMAL(10,2),
  fondo        DECIMAL(10,2),
  l_der        DECIMAL(10,2),
  l_izq        DECIMAL(10,2),
  precio       DECIMAL(12,2),
  estado       VARCHAR(50) DEFAULT 'disponible',
  tipologia    VARCHAR(100),
  orientacion  VARCHAR(50),
  vertices     JSONB,
  creado_el    TIMESTAMP DEFAULT NOW(),
  UNIQUE(empresa_id, proyecto_id, manzana, numero)
);

-- Reservas (ventas rápidas del plano)
CREATE TABLE IF NOT EXISTS reservas (
  id                  VARCHAR(50) PRIMARY KEY,
  empresa_id          VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  proyecto_id         VARCHAR(50) REFERENCES proyectos(id),
  etapa_id            VARCHAR(50) REFERENCES etapas(id),
  lote_id             VARCHAR(50) REFERENCES lotes(id),
  tipo                VARCHAR(20) NOT NULL DEFAULT 'separacion',
  comprador_nombre    VARCHAR(200),
  comprador_apellidos VARCHAR(200),
  comprador_dni       VARCHAR(20),
  comprador_telefono  VARCHAR(30),
  comprador_correo    VARCHAR(200),
  precio              DECIMAL(12,2),
  inicial             DECIMAL(12,2),
  cuotas              INTEGER DEFAULT 12,
  descuento           DECIMAL(12,2) DEFAULT 0,
  notas               TEXT,
  documentos_generados BOOLEAN DEFAULT false,
  reniec_verificado   BOOLEAN DEFAULT false,
  creada_el           TIMESTAMP DEFAULT NOW(),
  creada_por          VARCHAR(50) REFERENCES usuarios(id)
);

-- Contratos
CREATE TABLE IF NOT EXISTS contratos (
  id           VARCHAR(50) PRIMARY KEY,
  empresa_id   VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  reserva_id   VARCHAR(50) REFERENCES reservas(id),
  codigo       VARCHAR(50) UNIQUE,
  estado       VARCHAR(50) DEFAULT 'borrador',
  datos        JSONB NOT NULL DEFAULT '{}',
  firmado_fisicamente BOOLEAN DEFAULT false,
  fecha_firma  DATE,
  lugar_firma  VARCHAR(200),
  creado_el    TIMESTAMP DEFAULT NOW(),
  creado_por   VARCHAR(50) REFERENCES usuarios(id)
);

-- Cuotas / cronograma de pagos
CREATE TABLE IF NOT EXISTS cuotas (
  id                VARCHAR(50) PRIMARY KEY,
  empresa_id        VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  contrato_id       VARCHAR(50) NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  numero            INTEGER NOT NULL,
  descripcion       VARCHAR(200),
  monto             DECIMAL(12,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago        DATE,
  monto_pagado      DECIMAL(12,2),
  estado            VARCHAR(50) DEFAULT 'pendiente',
  metodo_pago       VARCHAR(50),
  num_operacion     VARCHAR(100),
  registrado_por    VARCHAR(50) REFERENCES usuarios(id),
  registrado_el     TIMESTAMP
);

-- Condiciones comerciales por empresa
CREATE TABLE IF NOT EXISTS condiciones_comerciales (
  id           SERIAL PRIMARY KEY,
  empresa_id   VARCHAR(50) NOT NULL UNIQUE REFERENCES empresas(id) ON DELETE CASCADE,
  config       JSONB NOT NULL DEFAULT '{}',
  actualizado_el TIMESTAMP DEFAULT NOW()
);

-- Plantillas de documentos por empresa
CREATE TABLE IF NOT EXISTS plantillas (
  id           SERIAL PRIMARY KEY,
  empresa_id   VARCHAR(50) NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nombre       VARCHAR(100) NOT NULL,
  contenido    TEXT,
  actualizado_el TIMESTAMP DEFAULT NOW(),
  UNIQUE(empresa_id, nombre)
);

-- Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id           SERIAL PRIMARY KEY,
  empresa_id   VARCHAR(50),
  usuario_id   VARCHAR(50),
  usuario_nombre VARCHAR(200),
  accion       VARCHAR(200) NOT NULL,
  tabla        VARCHAR(100),
  registro_id  VARCHAR(100),
  datos        JSONB,
  ip           VARCHAR(50),
  creado_el    TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lotes_empresa ON lotes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_proyecto ON lotes(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_etapa ON lotes(etapa_id);
CREATE INDEX IF NOT EXISTS idx_reservas_empresa ON reservas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_reservas_lote ON reservas(lote_id);
CREATE INDEX IF NOT EXISTS idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_contrato ON cuotas(contrato_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_empresa ON cuotas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_empresa ON auditoria(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios(empresa_id);
