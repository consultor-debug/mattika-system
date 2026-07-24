// mattika-sync.jsx — Capa de sincronización localStorage ↔ backend.
// ════════════════════════════════════════════════════════════════
// Centraliza los datos SIN reescribir cada pantalla:
//   1) Login real contra Postgres (/api/auth/login → JWT).
//   2) Al entrar/recargar, hidrata localStorage desde /api/store.
//   3) Cada escritura a una clave de DATOS se replica al servidor
//      (debounced, en lote). Así, al recargar, todos ven lo último.
//
// Las PREFERENCIAS de UI y la config estática (empresas/proyectos) se
// quedan en localStorage. Si el backend está caído, el login cae de
// vuelta al modo local para no dejar la app inaccesible.
(function () {
  const API = window.MATTIKA_API || ''; // mismo origen: Express sirve web + /api
  window.MATTIKA_API = API;
  const TOKEN_KEY = 'mattika.token';
  // Identidad (usuarios/empresas): NO van al KV genérico — tienen tablas y
  // rutas tipadas (/api/usuarios, /api/empresas) porque el login autentica
  // contra Postgres. Se espejan aparte (ver sección "Identidad").
  const USUARIOS_KEY = 'mattika.usuarios.v1';
  const EMPRESAS_KEY = 'mattika.empresas.v1';

  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || null; } catch (e) { return null; } };
  const setToken = (t) => { try { t ? _setItem(TOKEN_KEY, t) : _removeItem(TOKEN_KEY); } catch (e) {} };

  // Referencias nativas ANTES de parchear (para no auto-disparar sync).
  const _setItem = localStorage.setItem.bind(localStorage);
  const _removeItem = localStorage.removeItem.bind(localStorage);

  async function api(path, opts) {
    opts = opts || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    const tk = getToken();
    if (tk) headers['Authorization'] = 'Bearer ' + tk;
    const r = await fetch(API + path, Object.assign({}, opts, { headers }));
    if (r.status === 401) { setToken(null); const e = new Error('no-auth'); e.status = 401; throw e; }
    if (!r.ok) {
      let msg = 'Error ' + r.status;
      try { const j = await r.json(); if (j && j.error) msg = j.error; } catch (e) {}
      const e = new Error(msg); e.status = r.status; throw e;
    }
    if (r.status === 204) return null;
    try { return await r.json(); } catch (e) { return null; }
  }
  window.mattikaApi = api;

  // ── Clasificación de claves ─────────────────────────────────────
  // Datos (se sincronizan) vs preferencias/config local (no).
  const UI_KEYS = new Set([
    'mattika.sidebar.collapsed', 'mattika.nav.sections', 'mattika.descarga.formato',
    'mattika.last-login.v1', 'mattika.sesion.v1', 'mattika.token',
    'mattika.usuarios.v1', 'mattika.empresas.v1',
  ]);
  const UI_PREFIXES = ['mattika.contexto']; // selección de proyecto/etapa por usuario (UI)
  function esDato(key) {
    if (!key) return false;
    if (UI_KEYS.has(key)) return false;
    for (const p of UI_PREFIXES) if (key.indexOf(p) === 0) return false;
    return key.indexOf('mattika.') === 0 || key.indexOf('napoles_') === 0;
  }

  // ── Mirror de escrituras (debounced, en lote) ───────────────────
  let suppress = false; // true durante la hidratación (evita eco al server)
  const pendientes = new Set();
  let timer = null;

  function scheduleFlush() { if (!timer) timer = setTimeout(flush, 800); }
  async function flush() {
    timer = null;
    if (!getToken() || !pendientes.size) return;
    const claves = {};
    for (const k of pendientes) {
      try { const raw = localStorage.getItem(k); claves[k] = raw == null ? null : JSON.parse(raw); }
      catch (e) { claves[k] = null; }
    }
    pendientes.clear();
    try { await api('/api/store/bulk', { method: 'POST', body: JSON.stringify({ claves }) }); }
    catch (e) { /* best-effort: el próximo cambio reintenta */ }
  }

  localStorage.setItem = function (key, value) {
    _setItem(key, value);
    if (suppress || !getToken()) return;
    // Identidad: espejo tipado (crea filas reales en Postgres para login).
    if (key === USUARIOS_KEY) { scheduleIdentity('usu'); return; }
    if (key === EMPRESAS_KEY) { scheduleIdentity('emp'); return; }
    // Resto de DATOS: KV genérico.
    if (esDato(key)) { pendientes.add(key); scheduleFlush(); }
  };
  localStorage.removeItem = function (key) {
    _removeItem(key);
    if (!suppress && getToken() && esDato(key)) {
      api('/api/store/' + encodeURIComponent(key), { method: 'DELETE' }).catch(function () {});
    }
  };

  function localDataKeys() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (esDato(k)) { try { out[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {} }
    }
    return out;
  }

  // ════════════════════════════════════════════════════════════════
  // Identidad: usuarios + empresas contra rutas tipadas (Postgres).
  // El login autentica contra la tabla `usuarios`, así que crear/editar/
  // borrar usuarios y empresas debe reflejarse en filas reales (no en el
  // KV genérico). Se hidrata la lista desde el servidor al entrar/recargar
  // y se espejan las escrituras con un diff contra un snapshot.
  // ════════════════════════════════════════════════════════════════
  const sesionActual = () => { try { return (window.loadSesion && window.loadSesion()) || null; } catch (e) { return null; } };
  const readKey = (k) => { try { const raw = localStorage.getItem(k); const v = raw ? JSON.parse(raw) : []; return Array.isArray(v) ? v : []; } catch (e) { return []; } };

  // Mapeos DB ↔ forma del frontend.
  function usuFromApi(u) {
    return { id: u.id, empresaId: u.empresa_id, usuario: u.username, clave: '',
             nombre: u.nombre, rol: u.rol, activo: u.activo !== false, permisos: u.permisos || {} };
  }
  function empFromApi(e, prevById) {
    // Merge sobre la empresa local para preservar datos anidados (proyectos,
    // etapas, branding) que la tabla `empresas` no guarda.
    return Object.assign({}, prevById[e.id] || {},
      { id: e.id, nombre: e.nombre, color: e.color, activa: e.activa !== false });
  }
  const snapUsuEntry = (u) => ({ nombre: u.nombre, rol: u.rol, activo: u.activo !== false,
                                 permisos: u.permisos || {}, clave: u.clave || '', empresaId: u.empresaId });
  const snapEmpEntry = (e) => ({ nombre: e.nombre, color: e.color, activa: e.activa !== false });

  let snapUsu = new Map(); // id → snapUsuEntry (estado conocido en el server)
  let snapEmp = new Map(); // id → snapEmpEntry
  const permisosIguales = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});

  // ── Espejo de USUARIOS (diff vs snapshot) ───────────────────────
  async function mirrorUsuarios(nextArr) {
    const me = sesionActual();
    if (!getToken() || !me) return;
    const isMaster = me.tipo === 'master';
    // En sesión de empresa solo se tocan los usuarios de ESA empresa (el POST
    // usa req.user.empresaId; mandar otros crearía usuarios ajenos por error).
    const next = (nextArr || []).filter((u) => isMaster || u.empresaId === me.empresaId);
    const nextIds = new Set(next.map((u) => u.id));

    for (const u of next) {
      const prev = snapUsu.get(u.id);
      if (!prev) {
        const body = { id: u.id, nombre: u.nombre, username: u.usuario,
                       password: u.clave || Math.random().toString(36).slice(2, 12),
                       rol: u.rol, permisos: u.permisos || {} };
        if (isMaster) body.empresaId = u.empresaId;
        try {
          await api('/api/usuarios', { method: 'POST', body: JSON.stringify(body) });
          if (u.activo === false) await api('/api/usuarios/' + encodeURIComponent(u.id), { method: 'PUT', body: JSON.stringify({ activo: false }) });
        } catch (e) { /* 409 dup u otros: se reintenta en el próximo guardado */ }
      } else {
        const changed = prev.nombre !== u.nombre || prev.rol !== u.rol ||
          prev.activo !== (u.activo !== false) || !permisosIguales(prev.permisos, u.permisos);
        if (changed) {
          try { await api('/api/usuarios/' + encodeURIComponent(u.id), { method: 'PUT', body: JSON.stringify({ nombre: u.nombre, rol: u.rol, activo: u.activo !== false, permisos: u.permisos || {} }) }); } catch (e) {}
        }
        if (u.clave && u.clave !== prev.clave) {
          try { await api('/api/usuarios/' + encodeURIComponent(u.id) + '/password', { method: 'PUT', body: JSON.stringify({ password: u.clave }) }); } catch (e) {}
        }
      }
    }
    for (const id of snapUsu.keys()) {
      if (!nextIds.has(id)) { try { await api('/api/usuarios/' + encodeURIComponent(id), { method: 'DELETE' }); } catch (e) {} }
    }
    snapUsu = new Map(next.map((u) => [u.id, snapUsuEntry(u)]));
  }

  // ── Espejo de EMPRESAS (solo master; rutas /api/empresas son master) ─
  async function mirrorEmpresas(nextArr) {
    const me = sesionActual();
    if (!getToken() || !me || me.tipo !== 'master') return;
    const next = nextArr || [];
    const nextIds = new Set(next.map((e) => e.id));
    for (const e of next) {
      const prev = snapEmp.get(e.id);
      if (!prev) {
        try {
          await api('/api/empresas', { method: 'POST', body: JSON.stringify({ id: e.id, nombre: e.nombre, color: e.color }) });
          if (e.activa === false) await api('/api/empresas/' + encodeURIComponent(e.id), { method: 'PUT', body: JSON.stringify({ activa: false }) });
        } catch (err) {}
      } else {
        const changed = prev.nombre !== e.nombre || prev.color !== e.color || prev.activa !== (e.activa !== false);
        if (changed) { try { await api('/api/empresas/' + encodeURIComponent(e.id), { method: 'PUT', body: JSON.stringify({ nombre: e.nombre, color: e.color, activa: e.activa !== false }) }); } catch (err) {} }
      }
    }
    for (const id of snapEmp.keys()) {
      if (!nextIds.has(id)) { try { await api('/api/empresas/' + encodeURIComponent(id), { method: 'DELETE' }); } catch (err) {} }
    }
    snapEmp = new Map(next.map((e) => [e.id, snapEmpEntry(e)]));
  }

  // Debounce compartido para no disparar en cada tecla/migración.
  let idTimer = null; const idPend = { usu: false, emp: false };
  function scheduleIdentity(which) {
    idPend[which] = true;
    if (idTimer) return;
    idTimer = setTimeout(async () => {
      idTimer = null;
      const doU = idPend.usu, doE = idPend.emp; idPend.usu = false; idPend.emp = false;
      // Empresas PRIMERO: un usuario nuevo referencia empresa_id (FK), así que
      // la fila de la empresa debe existir antes de insertar sus usuarios.
      if (doE) { try { await mirrorEmpresas(readKey(EMPRESAS_KEY)); } catch (e) {} }
      if (doU) { try { await mirrorUsuarios(readKey(USUARIOS_KEY)); } catch (e) {} }
    }, 700);
  }

  // ── Hidratación de identidad: server (Postgres) → localStorage ──
  // meArg: la sesión que se está estableciendo (en login aún no está guardada).
  async function hydrateIdentity(meArg) {
    const me = meArg || sesionActual();
    if (!getToken() || !me) return;
    // El server NUNCA devuelve la contraseña (solo el hash). Pero la UI muestra
    // y edita la clave en texto ("Ver claves"), guardada en localStorage. Al
    // hidratar preservamos la clave local conocida por id, para no vaciarla
    // (síntoma: "se borran las credenciales al recargar"). El login sigue
    // autenticando contra el hash del server; la clave local es solo para la UI.
    const withLocalClave = (list) => {
      const prev = {}; for (const u of readKey(USUARIOS_KEY)) prev[u.id] = u;
      return list.map((u) => (prev[u.id] && prev[u.id].clave) ? Object.assign(u, { clave: prev[u.id].clave }) : u);
    };
    if (me.tipo === 'master') {
      const [emps, usus] = await Promise.all([
        api('/api/empresas').catch(() => null),
        api('/api/usuarios').catch(() => null),
      ]);
      suppress = true;
      try {
        if (Array.isArray(emps)) {
          const prevById = {}; for (const e of readKey(EMPRESAS_KEY)) prevById[e.id] = e;
          _setItem(EMPRESAS_KEY, JSON.stringify(emps.map((e) => empFromApi(e, prevById))));
          snapEmp = new Map(emps.map((e) => [e.id, snapEmpEntry(e)]));
        }
        if (Array.isArray(usus)) {
          const list = withLocalClave(usus.filter((u) => u.tipo !== 'master').map(usuFromApi));
          _setItem(USUARIOS_KEY, JSON.stringify(list));
          snapUsu = new Map(list.map((u) => [u.id, snapUsuEntry(u)]));
        }
      } finally { suppress = false; }
    } else {
      // Sesión de empresa: /api/empresas es master-only, así que solo se
      // hidratan los usuarios de la propia empresa (los demás quedan intactos).
      const usus = await api('/api/usuarios').catch(() => null);
      if (Array.isArray(usus)) {
        const mine = withLocalClave(usus.filter((u) => u.tipo !== 'master').map(usuFromApi));
        const otros = readKey(USUARIOS_KEY).filter((u) => u.empresaId !== me.empresaId);
        suppress = true;
        try { _setItem(USUARIOS_KEY, JSON.stringify(otros.concat(mine))); } finally { suppress = false; }
        snapUsu = new Map(mine.map((u) => [u.id, snapUsuEntry(u)]));
      }
    }
  }

  // ── Hidratación KV (datos operativos por empresa) ───────────────
  async function hydrateKv() {
    if (!getToken()) return;
    let data;
    try { data = await api('/api/store'); }
    catch (e) { return; } // 401 ya limpió token; otros: seguimos con lo local
    // Primera vez para esta empresa (server vacío): adoptar lo local como base.
    if (!data || !Object.keys(data).length) {
      const local = localDataKeys();
      if (Object.keys(local).length) {
        try { await api('/api/store/bulk', { method: 'POST', body: JSON.stringify({ claves: local }) }); } catch (e) {}
      }
      return;
    }
    suppress = true;
    try {
      for (const k in data) {
        if (!Object.prototype.hasOwnProperty.call(data, k)) continue;
        if (!esDato(k)) continue;
        _setItem(k, JSON.stringify(data[k]));
      }
    } finally { suppress = false; }
  }

  // ── Hidratación completa: KV (solo empresa) + identidad ─────────
  // meArg: sesión que se está estableciendo (en login aún no está guardada).
  async function hydrate(meArg) {
    const me = meArg || sesionActual();
    if (me && me.tipo === 'empresa') await hydrateKv(); // el KV es por empresa
    await hydrateIdentity(me);
  }

  // ── Login remoto (JWT contra Postgres, con fallback local) ──────
  window.loginRemoto = async function (creds) {
    const empRaw = (creds.empresa || '').trim();
    const usr = (creds.usuario || '').trim();
    const clave = creds.clave;
    if (!empRaw || !usr || !clave) return { ok: false, error: 'Completa todos los campos para continuar.' };

    const esMaster = empRaw.toLowerCase() === 'mattika';
    let empresaId = 'mattika';
    let empObj = null;
    if (!esMaster) {
      const emps = (window.loadEmpresas && window.loadEmpresas()) || [];
      empObj = emps.find(function (e) {
        return e.nombre.toLowerCase() === empRaw.toLowerCase() || e.id.toLowerCase() === empRaw.toLowerCase();
      });
      if (!empObj) return { ok: false, error: 'No encontramos esa empresa. Verifica el nombre.' };
      if (empObj.activa === false) return { ok: false, error: 'Esa empresa está desactivada. Contacta a Mattika.' };
      empresaId = empObj.id;
    }

    let res;
    try {
      res = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ empresaId: empresaId, username: usr, password: clave }),
      });
    } catch (e) {
      // 401 = credenciales incorrectas (no caer a local: rompería la centralización).
      if (e.status === 401) return { ok: false, error: 'Usuario o clave incorrectos.' };
      // Backend caído / 5xx → fallback al login local para no bloquear la operación.
      if (window.autenticar) {
        const local = window.autenticar({ empresa: empRaw, usuario: usr, clave: clave });
        if (local.ok) { console.warn('[mattika-sync] backend no disponible; login local (sin sincronización).'); return local; }
        return local;
      }
      return { ok: false, error: 'No se pudo conectar con el servidor. Intenta de nuevo.' };
    }

    const token = res && res.token;
    const user = res && res.user;
    if (!token || !user) return { ok: false, error: 'Respuesta inválida del servidor.' };
    setToken(token);

    const emps = (window.loadEmpresas && window.loadEmpresas()) || [];
    const emp = empObj || emps.find(function (e) { return e.id === user.empresaId; });
    const sesion = {
      tipo: user.tipo === 'master' ? 'master' : 'empresa',
      empresaId: user.empresaId || null,
      usuarioId: user.id,
      nombre: user.nombre,
      rol: user.rol,
      empresaNombre: user.empresaNombre || (emp && emp.nombre),
      proyecto: emp && emp.proyectos && emp.proyectos[0] && emp.proyectos[0].nombre,
      permisos: user.permisos || {},
      inicioMs: Date.now(),
    };

    if (sesion.tipo === 'empresa') {
      // Inyecta el usuario logueado en el blob local para que can()/permisos
      // resuelvan con exactitud antes de la hidratación.
      try {
        const us = (window.loadUsuarios && window.loadUsuarios()) || [];
        const idx = us.findIndex(function (u) { return u.id === user.id; });
        const entry = { id: user.id, empresaId: user.empresaId, usuario: user.username, nombre: user.nombre, rol: user.rol, permisos: user.permisos || {}, activo: true };
        if (idx >= 0) us[idx] = Object.assign({}, us[idx], entry); else us.push(entry);
        window.saveUsuarios && window.saveUsuarios(us);
      } catch (e) {}
    }
    // Hidrata datos + identidad desde Postgres (empresa y master). Se pasa la
    // sesión recién creada porque aún no está guardada en localStorage.
    await hydrate(sesion);
    return { ok: true, sesion: sesion };
  };

  // ── Logout: limpia el token además de la sesión ─────────────────
  const _cerrar = window.cerrarSesion;
  window.cerrarSesion = function () {
    setToken(null);
    try { _cerrar && _cerrar(); } catch (e) {}
  };

  // ── ready(): en recarga con sesión activa, hidratar ANTES de render ─
  let _ready = null;
  window.MattikaSync = {
    ready: function () {
      if (_ready) return _ready;
      _ready = (async function () {
        try {
          const s = (window.loadSesion && window.loadSesion()) || null;
          if (s && (s.tipo === 'empresa' || s.tipo === 'master')) {
            if (getToken()) { await hydrate(s); }
            else {
              // Sesión local heredada sin token (login viejo) → pedir re-login
              // para obtener JWT y poder sincronizar.
              try { window.saveSesion && window.saveSesion(null); } catch (e) {}
            }
          }
        } catch (e) {}
        return true;
      })();
      return _ready;
    },
    hydrate: hydrate,
    flush: flush,
  };
})();
