require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const pool = require('./connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

async function seed() {
  const client = await pool.connect();
  try {
    // Apply schema
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Schema applied');

    // Hash passwords
    const [hLumina, hGolden, hMattika, hAsesor, hGerente] = await Promise.all([
      bcrypt.hash('lumina2026', 10),
      bcrypt.hash('golden2026', 10),
      bcrypt.hash('mattika2026', 10),
      bcrypt.hash('asesor2026', 10),
      bcrypt.hash('gerente2026', 10),
    ]);

    // Empresas
    await client.query(`
      INSERT INTO empresas (id, nombre, color, activa) VALUES
        ('lumina', 'Lumina Grupo Inmobiliario', '#1E4FD4', true),
        ('golden', 'Golden Inmobiliaria', '#B8862A', true)
      ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, color = EXCLUDED.color
    `);
    console.log('✅ Empresas seeded');

    // Proyectos
    await client.query(`
      INSERT INTO proyectos (id, empresa_id, nombre, ubicacion, descripcion, estado, fecha_inicio, fecha_entrega) VALUES
        ('napoles', 'lumina', 'Nápoles', 'Valle Chicama · Trujillo', 'Condominio club con club house, parque central y áreas deportivas.', 'en-obra', '2024-08-01', '2027-12-31'),
        ('villa-club', 'golden', 'Villa Club Malabrigo', 'Malabrigo · La Libertad', 'Proyecto residencial frente al mar con acceso a playa privada.', 'preventa', '2025-06-01', '2028-06-01')
      ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre
    `);
    console.log('✅ Proyectos seeded');

    // Etapas
    await client.query(`
      INSERT INTO etapas (id, proyecto_id, empresa_id, nombre, estado, lotes, fecha_inicio, fecha_entrega) VALUES
        ('napoles-e1', 'napoles', 'lumina', 'Etapa 1', 'entregado', 60, '2024-08-01', '2026-01-01'),
        ('napoles-e2', 'napoles', 'lumina', 'Etapa 2', 'en-obra', 80, '2025-06-01', '2026-12-01'),
        ('napoles-e3', 'napoles', 'lumina', 'Etapa 3', 'preventa', 90, '2026-04-01', '2027-12-31'),
        ('villa-pacifico', 'villa-club', 'golden', 'Pacífico', 'preventa', 72, '2025-06-01', '2027-06-01'),
        ('villa-marina', 'villa-club', 'golden', 'Marina', 'planificacion', 84, '2026-06-01', '2028-06-01')
      ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre
    `);
    console.log('✅ Etapas seeded');

    // Permisos por defecto — mismas claves que auth.jsx del frontend
    const permisosAdmin = {
      vender: true, ver_pagos: true, registrar_pagos: true,
      editar_plano: true, editar_lotes: true, gestionar_proyectos: true,
      editar_condiciones: true, gestionar_usuarios: true,
      editar_plantillas: true, superusuario: true
    };
    const permisosAsesor = {
      vender: true, ver_pagos: true, registrar_pagos: false,
      editar_plano: false, editar_lotes: false, gestionar_proyectos: false,
      editar_condiciones: false, gestionar_usuarios: false,
      editar_plantillas: false, superusuario: false
    };

    // Usuarios empresa
    const users = [
      { id: 'lumina-admin', empresa_id: 'lumina', nombre: 'Admin Lumina', username: 'admin', hash: hLumina, rol: 'Administrador', permisos: permisosAdmin },
      { id: 'lumina-asesor', empresa_id: 'lumina', nombre: 'Ana Salinas', username: 'asesor', hash: hAsesor, rol: 'Asesor', permisos: permisosAsesor },
      { id: 'golden-admin', empresa_id: 'golden', nombre: 'Admin Golden', username: 'admin', hash: hGolden, rol: 'Administrador', permisos: permisosAdmin },
      { id: 'golden-gerente', empresa_id: 'golden', nombre: 'Carlos Ríos', username: 'gerente', hash: hGerente, rol: 'Gerente', permisos: permisosAdmin },
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO usuarios (id, empresa_id, nombre, username, password_hash, rol, permisos, tipo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'empresa')
        ON CONFLICT (empresa_id, username) DO UPDATE SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash
      `, [u.id, u.empresa_id, u.nombre, u.username, u.hash, u.rol, u.permisos]);
    }

    // Master user (empresa_id NULL — usar ON CONFLICT (id) porque UNIQUE(empresa_id, username) no aplica con NULLs)
    await client.query(`
      INSERT INTO usuarios (id, empresa_id, nombre, username, password_hash, rol, permisos, tipo)
      VALUES ('mattika-owner', NULL, 'Owner Mattika', 'owner', $1, 'Master', $2, 'master')
      ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash
    `, [hMattika, permisosAdmin]);

    console.log('✅ Usuarios seeded (contraseñas: lumina2026 / golden2026 / mattika2026)');

    // Condiciones comerciales por defecto
    const condLumina = {
      plazoMaximo: 60, tasaAnual: 8,
      descuentos: [
        { nivel: 'estandar', label: 'Estándar', contado: 3400, financiado: 1400, tiempoEspera: 0 },
        { nivel: 'excepcion', label: 'Excepción', contado: 4000, financiado: 2000, tiempoEspera: 30 },
        { nivel: 'vb', label: 'VB Gerencial', contado: null, financiado: null, tiempoEspera: 120 }
      ],
      aprobadores: ['SubGerente Comercial', 'Gerente General']
    };
    const condGolden = {
      plazoMaximo: 48, tasaAnual: 9.5,
      descuentos: [
        { nivel: 'estandar', label: 'Estándar', contado: 2000, financiado: 800, tiempoEspera: 0 },
        { nivel: 'excepcion', label: 'Excepción', contado: 3000, financiado: 1200, tiempoEspera: 30 },
        { nivel: 'vb', label: 'VB Gerencial', contado: null, financiado: null, tiempoEspera: 120 }
      ],
      aprobadores: ['SubGerente Comercial', 'Gerente General', 'Directorio']
    };

    await client.query(`
      INSERT INTO condiciones_comerciales (empresa_id, config) VALUES
        ('lumina', $1), ('golden', $2)
      ON CONFLICT (empresa_id) DO UPDATE SET config = EXCLUDED.config
    `, [condLumina, condGolden]);
    console.log('✅ Condiciones comerciales seeded');

    console.log('\n🎉 Seed completado. Credenciales:');
    console.log('   Lumina:  admin / lumina2026  |  asesor / asesor2026');
    console.log('   Golden:  admin / golden2026  |  gerente / gerente2026');
    console.log('   Mattika: owner / mattika2026');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
