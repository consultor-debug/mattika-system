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
    if (!suppress && getToken() && esDato(key)) { pendientes.add(key); scheduleFlush(); }
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

  // ── Hidratación: server → localStorage ──────────────────────────
  async function hydrate() {
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
      // resuelvan con exactitud (queda local; no se sincroniza).
      try {
        const us = (window.loadUsuarios && window.loadUsuarios()) || [];
        const idx = us.findIndex(function (u) { return u.id === user.id; });
        const entry = { id: user.id, empresaId: user.empresaId, usuario: user.username, nombre: user.nombre, rol: user.rol, permisos: user.permisos || {}, activo: true };
        if (idx >= 0) us[idx] = Object.assign({}, us[idx], entry); else us.push(entry);
        window.saveUsuarios && window.saveUsuarios(us);
      } catch (e) {}
      await hydrate();
    }
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
          if (s && s.tipo === 'empresa') {
            if (getToken()) { await hydrate(); }
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
