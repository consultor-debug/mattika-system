// comercial-engine.jsx — motor de datos del módulo Comercial (Ventas Nápoles)
// Portado verbatim desde el tablero DC original. Lógica intacta; datos propios en localStorage (namespace napoles_*).
// NO es JSX: es una clase JS pura que produce el "view-model" vía renderVals()/reportVals().

class DCLogic {
  constructor(){ this.state = {}; this.props = {}; this._notify = null; }
  setState(patch, cb){
    const next = (typeof patch === 'function') ? patch(this.state) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this._notify) this._notify();
    if (cb) cb();
  }
}

class ComercialEngine extends DCLogic {
  RAW = [];

  EJ_PALETTE = ['#137A5B','#2C6E9B','#C49A3F','#7C5CC4','#D26A4C','#1F9E8A','#B0593C','#3D7A4E'];
  TIPO_COLOR = { 'Contado':'#137A5B', 'Contado Fraccionado':'#1F9E8A', 'Fraccionado':'#C49A3F', 'Separación':'#2C6E9B', 'Desistido':'#D26A4C' };
  esFrac(tipo){ return tipo==='Fraccionado' || tipo==='Contado Fraccionado'; }
  CANAL_COLOR = { 'Lead Digital':'#2C6E9B', 'Referido Asesor':'#137A5B', 'Referido Propietario':'#1F9E8A', 'Asesor Externo':'#C49A3F', 'Prospección':'#7C5CC4', '—':'#AAB1BB' };
  PIN = '1234';
  // --- Constantes de planilla (Perú, referenciales 2026) ---
  RMV = 1025;            // Remuneración Mínima Vital
  UIT = 5350;            // Unidad Impositiva Tributaria
  ESSALUD = 0.09;        // Aporte del empleador (no se descuenta al trabajador)
  AFP_APORTE = 0.10;     // Aporte obligatorio al fondo
  AFP_PRIMA = 0.0174;    // Prima de seguro (sobre remuneración asegurable, con tope)
  AFP_TOPE = 12585.36;   // Tope de remuneración asegurable para la prima
  AFP_DATA = { 'Integra':0.0155, 'Prima':0.0160, 'Profuturo':0.0169, 'Habitat':0.0147 }; // comisión sobre flujo
  RENTA_BANDS = [[5,0.08],[15,0.14],[15,0.17],[10,0.20],[Infinity,0.30]]; // anchos en UIT y tasa

  BANDS = [ {key:'b0', label:'Inicial < 20%'}, {key:'b1', label:'Inicial 21–49%'}, {key:'b2', label:'Inicial 50–99%'}, {key:'contado', label:'Pago al Contado'} ];
  ESCALAS = ['2–3','4–5','6–7','8 +'];

  todayStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  defaultForm(){ return { periodo:'6.2026', ejecutivo:'', equipo:'E. Interno', cliente:'', etapa:'I', mz:'', lt:'', lista:'', desc:'', recaudo:'', tipo:'Contado', canal:'Lead Digital', fSep:'', fFirma:'', fIni:'', modCompra:'', visito:false, liderPart:false, superPart:false, iniContratada:'', cuotas:[{monto:'',fecha:'',pagado:false}] }; }
  defaultEjes(){ return [ {name:'Kevin M.',equipo:'E. Interno'}, {name:'Piero J.',equipo:'E. Interno'}, {name:'Arkon Inmb.',equipo:'E. Externo'} ]; }
  defaultMatrix(){ return { b0:[0.020,0.030,0.040,0.050], b1:[0.025,0.035,0.045,0.055], b2:[0.035,0.045,0.055,0.065], contado:[0.050,0.060,0.070,0.080] }; }
  defaultVolBonos(){ return [ {ventas:5, monto:370}, {ventas:10, monto:740} ]; }
  defaultSpeedBonos(){ return [ {dias:7, monto:100} ]; }
  defaultEscala(){ return { mode:'matrix', bounds:[2,4,6,8], flatRate:0.10, matrix:this.defaultMatrix(), volBonos:this.defaultVolBonos(), speedBonos:this.defaultSpeedBonos() }; }
  defaultEscalaExterno(){ return { mode:'flat', bounds:[2,4,6,8], flatRate:0.10, matrix:this.defaultMatrix(), volBonos:[], speedBonos:[] }; }
  normCfg(cfg, team){ const base=team==='externo'?this.defaultEscalaExterno():this.defaultEscala(); cfg=cfg||{}; return { mode:cfg.mode||(team==='externo'?'flat':'matrix'), bounds:cfg.bounds||[2,4,6,8], flatRate:cfg.flatRate!=null?cfg.flatRate:0.10, matrix:cfg.matrix||this.defaultMatrix(), volBonos:cfg.volBonos||base.volBonos, speedBonos:cfg.speedBonos||base.speedBonos }; }
  cloneEscala(c){ return JSON.parse(JSON.stringify(c||this.defaultEscala())); }
  teamKey(eq){ return eq==='E. Externo' ? 'externo' : 'interno'; }
  escalaFor(p, eq){ const tk=this.teamKey(eq); const base=this.state.escalasDefault[tk]; const po=this.state.escalasByPeriod[p]; const ov = po && po[tk]; if(!ov) return base;
    // Los bonos (volumen/velocidad) heredan de la base cuando el override los tiene vacíos,
    // para que editar la matriz/tramos de un periodo no borre silenciosamente los bonos.
    const vol = (ov.volBonos && ov.volBonos.length) ? ov.volBonos : (base.volBonos||[]);
    const speed = (ov.speedBonos && ov.speedBonos.length) ? ov.speedBonos : (base.speedBonos||[]);
    return { ...ov, volBonos:vol, speedBonos:speed };
  }
  effEditCfg(){ const tk=this.state.editTeam, ep=this.state.editPeriod; const base=this.state.escalasDefault[tk]; const raw=this.getEditCfg();
    if(ep==='base') return raw;
    const vol=(raw.volBonos&&raw.volBonos.length)?raw.volBonos:(base.volBonos||[]);
    const speed=(raw.speedBonos&&raw.speedBonos.length)?raw.speedBonos:(base.speedBonos||[]);
    return { ...raw, volBonos:vol, speedBonos:speed };
  }
  getEditCfg(){ const tk=this.state.editTeam, ep=this.state.editPeriod; if(ep==='base') return this.state.escalasDefault[tk]; return (this.state.escalasByPeriod[ep] && this.state.escalasByPeriod[ep][tk]) || this.state.escalasDefault[tk]; }
  writeEditCfg(mut){
    const tk=this.state.editTeam, ep=this.state.editPeriod;
    if(ep==='base'){ const d={...this.state.escalasDefault}; d[tk]=this.cloneEscala(d[tk]); mut(d[tk]); this.setState({escalasDefault:d}, ()=>this.persistEscalas()); return; }
    const map={...this.state.escalasByPeriod}; const po={...(map[ep]||{})}; po[tk]=this.cloneEscala(po[tk]||this.state.escalasDefault[tk]); mut(po[tk]); map[ep]=po; this.setState({escalasByPeriod:map}, ()=>this.persistEscalas());
  }

  state = {
    tab:'tablero', periodo:'Todos', equipo:'Todos', asesor:'Todos', rankBy:'recaudo', trendBy:'monto', descMode:'todos',
    showForm:false, formErr:'', editingId:null, dupWarn:null, expandedRow:null,
    xfTipo:null, xfCanal:null, xfEtapa:null, tablePeriod:'Todos', tablePage:0, cuotaMode:'todas', openMenu:null,
    loggedIn:false, loginUser:'', loginPass:'', loginErr:'', seedFlags:{},
    reportOpen:false, reportPeriod:null,
    userSales:[], ejecutivos:this.defaultEjes(),
    escalasDefault:{ interno:this.defaultEscala(), externo:this.defaultEscalaExterno() }, escalasByPeriod:{}, editPeriod:'base', editTeam:'interno',
    comUnlocked:false, pinInput:'', pinErr:'',
    liderPolicy:this.defaultLiderPolicy(), liderEditPeriod:'base',
    newEj:{ name:'', equipo:'E. Interno' }, ejeErr:'',
    editingEje:null, editEjeForm:{ name:'', equipo:'E. Interno' }, editEjeErr:'',
    descPolicy:{ base:{ frac:2000, contado:4000 }, byPeriod:{} }, descEditPeriod:'base',
    metaAds:{}, leads:{}, targetCPA:800, leadsPeriod:null,
    metas:{},
    importOpen:false, importText:'', importResult:null,
    expandedUbi:null, ubiQuery:'', ubiSort:'movs', ubiEstado:'Todos',
    tableQuery:'', tableTipo:'Todos', tableCanal:'Todos', leadsHoy:{}, sidebarHidden:false,
    closedPeriods:{},
    retencion:{}, expandedCom:[], showLider:true, inicialMin:3500, showMatriz:true,
    boletaEje:'', boletaPeriodo:'', nomina:{},
    form:this.defaultForm(), cleared:false,
  };

  onLoginUser(v){ this.setState({loginUser:v, loginErr:''}); }
  onLoginPass(v){ this.setState({loginPass:v, loginErr:''}); }
  submitLogin(){
    const u=(this.state.loginUser||'').trim().toLowerCase(), p=(this.state.loginPass||'');
    if(u==='larce' && p==='larce'){ try{ localStorage.setItem('napoles_auth','1'); }catch(e){} this.setState({loggedIn:true, loginErr:'', loginPass:''}); }
    else { this.setState({loginErr:'Usuario o contraseña incorrectos.'}); }
  }
  logout(){ try{ localStorage.removeItem('napoles_auth'); }catch(e){} this.setState({loggedIn:false, loginUser:'', loginPass:'', loginErr:''}); }
  componentDidMount(){
    try { if(localStorage.getItem('napoles_auth')==='1') this.setState({loggedIn:true}); } catch(e){}
    let cleared=false;
    try { cleared = localStorage.getItem('napoles_cleared')==='1'; } catch(e){}
    if(cleared) this.setState({cleared:true, ejecutivos:[]});
    // Ventas: FUENTE ÚNICA = mattika.ventas (CRM). Migra una sola vez
    // cualquier venta que solo existiera en el almacén legacy del tablero.
    try {
      if (window.saveComercialRows && !localStorage.getItem('napoles_migrado.v1')) {
        const legacy = JSON.parse(localStorage.getItem('napoles_ventas') || '[]');
        if (Array.isArray(legacy) && legacy.length) {
          const existentes = new Set((window.loadComercialRows?.() || []).map(r => (r.mz||'')+'-'+(r.lt||'')));
          const nuevas = legacy.filter(r => !existentes.has((r.mz||'')+'-'+(r.lt||'')));
          if (nuevas.length) window.saveComercialRows(nuevas.map(r => ({ ...r, _mkId: undefined })));
        }
        localStorage.setItem('napoles_migrado.v1', '1');
      }
    } catch(e){}
    try { const s = window.loadComercialRows ? window.loadComercialRows() : JSON.parse(localStorage.getItem('napoles_ventas')||'[]'); if(Array.isArray(s)) this.setState({userSales:s}); } catch(e){}
    try { const e=JSON.parse(localStorage.getItem('napoles_ejecutivos')||'null'); if(Array.isArray(e)&&e.length) this.setState({ejecutivos:e}); } catch(e){}
    try { const c=JSON.parse(localStorage.getItem('napoles_escalas')||'null');
      let def=null, bp={};
      if(c && c.default && c.default.interno){ def=c.default; bp=c.byPeriod||{}; }
      else if(c && c.default && c.default.matrix){ def={interno:c.default, externo:null}; Object.entries(c.byPeriod||{}).forEach(([p,cfg])=>{ bp[p]={interno:cfg}; }); }
      else if(c && c.matrix){ def={interno:c, externo:null}; }
      if(def){
        const nd={ interno:this.normCfg(def.interno,'interno'), externo:this.normCfg(def.externo,'externo') };
        const nbp={}; Object.entries(bp).forEach(([p,po])=>{ const o={}; if(po.interno) o.interno=this.normCfg(po.interno,'interno'); if(po.externo) o.externo=this.normCfg(po.externo,'externo'); nbp[p]=o; });
        this.setState({escalasDefault:nd, escalasByPeriod:nbp});
      }
    } catch(e){}
    try { const c=JSON.parse(localStorage.getItem('napoles_captacion')||'null'); if(c){ this.setState({metaAds:c.metaAds||{}, leads:c.leads||{}, targetCPA:(c.targetCPA!=null?c.targetCPA:800)}); } } catch(e){}
    try { const m=JSON.parse(localStorage.getItem('napoles_metas')||'null'); if(m&&typeof m==='object') this.setState({metas:m}); } catch(e){}
    try { const cc=JSON.parse(localStorage.getItem('napoles_cierres')||'null'); if(cc&&typeof cc==='object') this.setState({closedPeriods:cc}); } catch(e){}
    try { const rt=JSON.parse(localStorage.getItem('napoles_retencion')||'null'); if(rt&&typeof rt==='object') this.setState({retencion:rt}); } catch(e){}
    try { const im=localStorage.getItem('napoles_inicialmin'); if(im!=null && im!=='' && isFinite(parseFloat(im))) this.setState({inicialMin:parseFloat(im)}); } catch(e){}
    try { const nm=JSON.parse(localStorage.getItem('napoles_nomina')||'null'); if(nm&&typeof nm==='object') this.setState({nomina:nm}); } catch(e){}
    try { const d=JSON.parse(localStorage.getItem('napoles_descpolicy')||'null'); if(d&&d.base){ this.setState({descPolicy:{ base:{ frac:(d.base.frac!=null?d.base.frac:2000), contado:(d.base.contado!=null?d.base.contado:4000) }, byPeriod:d.byPeriod||{} }}); } } catch(e){}
    try { const sf=JSON.parse(localStorage.getItem('napoles_seedflags')||'null'); if(sf&&typeof sf==='object') this.setState({seedFlags:sf}); } catch(e){}
    try { const lh=JSON.parse(localStorage.getItem('napoles_leadshoy')||'null'); if(lh&&typeof lh==='object') this.setState({leadsHoy:lh}); } catch(e){}
    try { const l=JSON.parse(localStorage.getItem('napoles_lider')||'null'); if(l){ const d=this.defaultLiderPolicy();
      if(l.lider){ this.setState({liderPolicy:{ lider:{ base:{...d.lider.base, ...(l.lider.base||{})}, byPeriod:l.lider.byPeriod||{} }, super:{ activo:!!(l.super&&l.super.activo), base:{...d.super.base, ...((l.super&&l.super.base)||{})}, byPeriod:(l.super&&l.super.byPeriod)||{} } }}); }
      else if(l.base){ this.setState({liderPolicy:{ lider:{ base:{...d.lider.base, interno:(l.base.interno!=null?l.base.interno:0.02), externo:(l.base.externo!=null?l.base.externo:0.01), nameI:l.base.nameI||'', nameE:l.base.nameE||''}, byPeriod:l.byPeriod||{} }, super:d.super }}); }
    } } catch(e){}
  }

  // ---- persistence ----
  // FUENTE ÚNICA: vuelca las ventas del tablero al CRM (mattika.ventas) para que
  // Contratos, Pagos, Clientes y Plano se repliquen. Si el CRM no está disponible,
  // cae al almacén legacy para no romper el tablero.
  saveSales(l){
    try {
      if (window.saveComercialRows && window.getSesion?.()?.empresaId) { window.saveComercialRows(l); return; }
    } catch(e){}
    try{ localStorage.setItem('napoles_ventas', JSON.stringify(l)); }catch(e){}
  }
  saveEjes(l){ try{ localStorage.setItem('napoles_ejecutivos', JSON.stringify(l)); }catch(e){} }
  persistEscalas(){ try{ localStorage.setItem('napoles_escalas', JSON.stringify({default:this.state.escalasDefault, byPeriod:this.state.escalasByPeriod})); }catch(e){} }
  saveCaptacion(){ try{ localStorage.setItem('napoles_captacion', JSON.stringify({metaAds:this.state.metaAds, leads:this.state.leads, targetCPA:this.state.targetCPA})); }catch(e){} }
  saveDescPolicy(){ try{ localStorage.setItem('napoles_descpolicy', JSON.stringify(this.state.descPolicy)); }catch(e){} }
  defaultLiderPolicy(){ return {
    lider:{ base:{interno:0.02, externo:0.01, minI:0, minE:0, nameI:'', nameE:'', reqPart:false}, byPeriod:{} },
    super:{ activo:false, base:{interno:0.005, externo:0.005, minI:0, minE:0, name:'', reqPart:true}, byPeriod:{} }
  }; }
  saveLider(){ try{ localStorage.setItem('napoles_lider', JSON.stringify(this.state.liderPolicy)); }catch(e){} }
  liderFor(level, p){ const lv=this.state.liderPolicy[level]; const bp=(lv.byPeriod||{})[p]||{}; const b=lv.base; const g=(k,d)=>(bp[k]!=null?bp[k]:(b[k]!=null?b[k]:d)); return { interno:g('interno',0), externo:g('externo',0), minI:g('minI',0), minE:g('minE',0), nameI:g('nameI',''), nameE:g('nameE',''), name:g('name',''), reqPart:g('reqPart',false) }; }
  setLiderEditPeriod(p){ this.setState({liderEditPeriod:p}); }
  toggleSuper(){ const lp={...this.state.liderPolicy, super:{...this.state.liderPolicy.super, activo:!this.state.liderPolicy.super.activo}}; this.setState({liderPolicy:lp}, ()=>this.saveLider()); }
  setLiderField(level, field, val){
    const ep=this.state.liderEditPeriod; const lv={...this.state.liderPolicy[level]};
    if(ep==='base'){ lv.base={...lv.base, [field]:val}; }
    else { const byP={...(lv.byPeriod||{})}; const cur={...(byP[ep]||{})}; cur[field]=val; byP[ep]=cur; lv.byPeriod=byP; }
    this.setState({liderPolicy:{...this.state.liderPolicy, [level]:lv}}, ()=>this.saveLider());
  }
  resetLiderPeriod(level){ const ep=this.state.liderEditPeriod; if(ep==='base') return; const lv={...this.state.liderPolicy[level]}; const byP={...(lv.byPeriod||{})}; delete byP[ep]; lv.byPeriod=byP; this.setState({liderPolicy:{...this.state.liderPolicy, [level]:lv}}, ()=>this.saveLider()); }
  computeLider(level, scope){
    const partKey = level==='lider' ? 'liderPart' : 'superPart';
    const perP={}; scope.forEach(s=>{ const tk=this.teamKey(s.eq); const o=perP[s.p]=perP[s.p]||{iU:0,eU:0,iM:0,eM:0,iP:0,eP:0}; const part=!!s[partKey];
      if(tk==='interno'){ o.iU++; o.iM+=(s.fin||0); if(part) o.iP+=(s.fin||0); } else { o.eU++; o.eM+=(s.fin||0); if(part) o.eP+=(s.fin||0); } });
    let comI=0, comE=0, baseI=0, baseE=0, uI=0, uE=0, okI=0, okE=0;
    Object.entries(perP).forEach(([p,o])=>{ const pol=this.liderFor(level,p);
      uI+=o.iU; uE+=o.eU;
      const eligI = pol.reqPart ? o.iP : o.iM; const eligE = pol.reqPart ? o.eP : o.eM;
      if(o.iU>=(pol.minI||0)){ comI+=eligI*(pol.interno||0); baseI+=eligI; okI++; }
      if(o.eU>=(pol.minE||0)){ comE+=eligE*(pol.externo||0); baseE+=eligE; }
    });
    return { comI, comE, baseI, baseE, uI, uE, total:comI+comE };
  }
  descFor(p){ const bp=(this.state.descPolicy.byPeriod||{})[p]||{}; const b=this.state.descPolicy.base; return { frac: (bp.frac!=null?bp.frac:b.frac), contado: (bp.contado!=null?bp.contado:b.contado) }; }
  descMaxFor(tipo,p){ const pol=this.descFor(p); return (tipo==='Contado'||tipo==='Contado Fraccionado') ? pol.contado : pol.frac; }

  reportVals(periodos, accent){
    const rp = this.state.reportPeriod || (periodos.length?periodos[periodos.length-1]:null);
    const reportPeriodOpts = periodos.map(p=>({v:p, l:this.monthShort(p)+' '+p.split('.')[1]}));
    const base = {
      reportOpen:this.state.reportOpen, openReport:()=>this.openReport(), closeReport:()=>this.closeReport(),
      printReport:()=>this.printReport(), reportPeriodVal:rp,
      reportPeriodOpts, onReportPeriod:(e)=>this.setReportPeriod(e.target.value),
    };
    if(!this.state.reportOpen || !rp) return base;
    const d = this.buildReport(rp);
    const money=(n)=>this.money(n), pct=(n)=>this.pct(n);
    const totMonto=d.monto||1;
    const TC=this.TIPO_COLOR;
    const tipoRows=Object.entries(d.tipoM).sort((a,b)=>b[1].fin-a[1].fin).map(([k,v])=>({label:k, color:TC[k]||'#7C5CC4', det:v.u+' · '+money(v.fin), pctL:Math.round(v.fin/totMonto*100)+'%'}));
    const etRows=Object.entries(d.etM).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>({label:'Etapa '+k, color:k==='I'?accent:'#C49A3F', det:v.u+' · '+money(v.fin), pctL:Math.round(v.fin/totMonto*100)+'%'}));
    const cRows=Object.entries(d.cM).sort((a,b)=>b[1].fin-a[1].fin).map(([k,v])=>({label:k, u:String(v.u), fin:money(v.fin), pctL:(Math.round(v.fin/totMonto*1000)/10).toFixed(1)+'%'}));
    const ejRows=d.byEj.map(e=>({name:e.name, eq:e.eq, u:String(e.u), monto:money(e.monto), rec:money(e.rec), desc:money(e.desc), pctDesc:e.lista?pct(e.desc/e.lista):'—'}));
    const medal=['🥇','🥈','🥉'];
    const topRows=d.topEj.map((o,i)=>({ pos:String(i+1), medal:medal[i]||'', name:o.name, eq:o.eq, rec:money(o.rec), ops:String(o.u), monto:money(o.monto), rRec:'#'+o.rRec, rOps:'#'+o.rOps, rMonto:'#'+o.rMonto, score:String(o.score), isTop:i===0, rowBg:i===0?'#F1F8F4':(i%2?'#FAFBFC':'#fff'), nameColor:i===0?'#0B3D2E':'#14171C' }));
    const t1=d.topEj[0]||null;
    const wins=t1?['Recaudo','Operaciones','Monto'].filter((_,idx)=>[t1.rRec,t1.rOps,t1.rMonto][idx]===1):[];
    const top1Name=t1?t1.name:'—';
    const top1Why=t1?(wins.length===3?('Lidera simultáneamente en las tres métricas — recaudo ('+money(t1.rec)+'), operaciones ('+t1.u+') y monto ('+money(t1.monto)+').'):('Mejor puntaje combinado ('+t1.score+' pts): '+money(t1.rec)+' recaudado, '+t1.u+' operaciones, '+money(t1.monto)+' vendido.')):'';
    const lead=(o,val)=> o?{name:o.name, value:val}:{name:'—', value:'—'};
    const leaders=[
      {label:'Top Recaudo', color:'#137A5B', bg:'#EAF5EF', ...lead(d.leadRec, d.leadRec?money(d.leadRec.rec):'—')},
      {label:'Top Operaciones', color:'#2C6E9B', bg:'#EAF1F7', ...lead(d.leadOps, d.leadOps?(d.leadOps.u+' ops'):'—')},
      {label:'Top Monto', color:'#B7862B', bg:'#FBF3DF', ...lead(d.leadMonto, d.leadMonto?money(d.leadMonto.monto):'—')},
    ];
    const anexo=d.anexo.map(r=>({ej:r.ej, cli:r.cli, lote:r.lote, et:r.et, tipo:r.tipo, tipoColor:TC[r.tipo]||'#475063', fin:money(r.fin), visito:r.visito?'Sí':'—', visitoColor:r.visito?'#137A5B':'#9AA1AB'}));
    const now=new Date(); const fecha=now.getDate()+' de '+['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][now.getMonth()]+' de '+now.getFullYear();
    const modNote = d.cont.u&&d.fin.u ? ('Dos bloques: Contado (incluye contado fraccionado) y Financiado (fraccionado), con topes distintos (S/ '+d.cont.tope+' vs S/ '+d.fin.tope+').') : 'Los descuentos se evalúan contra el tope de cada modalidad — Contado (incl. contado fraccionado) y Financiado (fraccionado).';
    return { ...base,
      repTitle:'Informe Comercial — '+this.monthShort(rp)+' '+rp.split('.')[1],
      repFecha:'Generado el '+fecha, repPeriodLabel:this.monthShort(rp)+' '+rp.split('.')[1],
      repHasData:d.unid>0, repNoData:d.unid===0,
      repKpis:[
        {label:'Monto vendido', value:money(d.monto), sub:d.unid+' operaciones', color:'#14171C'},
        {label:'Recaudo del periodo', value:money(d.recTot), sub:pct(d.recPct)+' del monto', color:'#137A5B'},
        {label:'Iniciales por cobrar', value:money(d.iniPend), sub:d.iniCount+' cuota(s) pendiente(s)', color:'#C0563A'},
        {label:'Ticket promedio', value:money(d.ticket), sub:'por operación', color:'#14171C'},
        {label:'Descuento otorgado', value:money(d.desc), sub:pct(d.descPct)+' del precio lista', color:'#C49A3F'},
        {label:'Velocidad de cierre', value: d.vel!=null?(d.vel+' días'):'—', sub:d.nCerr+' ventas firmadas', color:'#2C6E9B'},
        {label:'Desistimientos', value:String(d.desist), sub: d.desist===0?'sin desistimientos':'en el periodo', color: d.desist===0?'#137A5B':'#D26A4C'},
        {label:'Visitó el proyecto', value:pct(d.visitPct), sub:d.visited+' de '+d.unid+' operaciones', color:'#7C5CC4'},
        {label:'Ejecutivos activos', value:String(d.byEj.length), sub:'con al menos 1 venta', color:'#14171C'},
      ],
      repTop:topRows, repTop1Name:top1Name, repTop1Why:top1Why, repLeaders:leaders,
      repEj:ejRows, repEjTotMonto:money(d.monto), repEjTotRec:money(d.recTot), repEjTotDesc:money(d.desc), repEjTotU:String(d.unid),
      repTipo:tipoRows, repEt:etRows, repCanal:cRows,
      repModNote:modNote,
      repMod:[
        {label:'Contado (incl. contado fracc.)', color:'#137A5B', u:String(d.cont.u), avg: d.cont.u?money(d.cont.avg):'—', pct: d.cont.u?pct(d.cont.pct):'—', tope:'S/ '+d.cont.tope, exc:String(d.cont.exc), excColor:d.cont.exc>0?'#C0563A':'#137A5B'},
        {label:'Financiado (fraccionado)', color:'#C49A3F', u:String(d.fin.u), avg: d.fin.u?money(d.fin.avg):'—', pct: d.fin.u?pct(d.fin.pct):'—', tope:'S/ '+d.fin.tope, exc:String(d.fin.exc), excColor:d.fin.exc>0?'#C0563A':'#137A5B'},
      ],
      repPendCont:d.pendCont.map(o=>({ej:o.ej, initials:this.initials(o.ej), color:this.colorFor(o.ej), lote:o.lote, cli:o.cli, falta:o.falta})),
      repPendFin:d.pendFin.map(o=>({ej:o.ej, initials:this.initials(o.ej), color:this.colorFor(o.ej), lote:o.lote, cli:o.cli, falta:o.falta})),
      repPendContN:String(d.pendCont.length), repPendFinN:String(d.pendFin.length),
      repHasPendCont:d.pendCont.length>0, repHasPendFin:d.pendFin.length>0, repHasPend:(d.pendCont.length+d.pendFin.length)>0,
      repAnexo:anexo,
    };
  }

  // ---- report (por periodo, sin cobranza) ----
  openReport(){ const ps=Array.from(new Set(this.allRows().map(r=>r.p))).sort((a,b)=>this.periodSort(a,b)); const def=this.state.periodo!=='Todos'?this.state.periodo:(ps.length?ps[ps.length-1]:null); this.setState({reportOpen:true, reportPeriod:this.state.reportPeriod||def}); }
  closeReport(){ this.setState({reportOpen:false}); }
  setReportPeriod(p){ this.setState({reportPeriod:p}); }
  printReport(){ try{ window.print(); }catch(e){} }
  buildReport(p){
    const rows=this.allRows().filter(r=>r.p===p);
    const active=rows.filter(r=>r.tipo!=='Desistido');
    const desist=rows.filter(r=>r.tipo==='Desistido');
    const sum=(a,k)=>a.reduce((x,r)=>x+(r[k]||0),0);
    const unid=active.length, monto=sum(active,'fin'), lista=sum(active,'lista'), desc=sum(active,'desc');
    const recTot=sum(active,'rec'), recPct=monto?recTot/monto:0;
    const ticket=unid?monto/unid:0, descPct=lista?desc/lista:0;
    const dArr=active.map(r=>this.diasCierre(r)).filter(d=>d!=null&&d>=0);
    const vel=dArr.length?Math.round(dArr.reduce((a,b)=>a+b,0)/dArr.length):null;
    const visited=active.filter(r=>r.visito).length, visitPct=unid?visited/unid:0;
    // por ejecutivo (sin recaudo)
    // por ejecutivo (con recaudo)
    const ejM={}; active.forEach(r=>{ const o=ejM[r.ej]=ejM[r.ej]||{name:r.ej,eq:r.eq,u:0,monto:0,rec:0,desc:0,lista:0}; o.u++; o.monto+=r.fin; o.rec+=(r.rec||0); o.desc+=r.desc; o.lista+=r.lista; });
    const byEj=Object.values(ejM).sort((a,b)=>b.monto-a.monto);
    // ranking combinado: puesto en recaudo + operaciones + monto (menor puntaje = mejor)
    const ejArr=Object.values(ejM);
    const rankMap=(k)=>{ const s=[...ejArr].sort((a,b)=>b[k]-a[k]); const mp={}; s.forEach((o,i)=>mp[o.name]=i+1); return mp; };
    const rR=rankMap('rec'), rO=rankMap('u'), rM=rankMap('monto');
    ejArr.forEach(o=>{ o.rRec=rR[o.name]; o.rOps=rO[o.name]; o.rMonto=rM[o.name]; o.score=o.rRec+o.rOps+o.rMonto; });
    const topEj=[...ejArr].sort((a,b)=> a.score-b.score || b.monto-a.monto);
    const leadRec=[...ejArr].sort((a,b)=>b.rec-a.rec)[0]||null;
    const leadOps=[...ejArr].sort((a,b)=>b.u-a.u)[0]||null;
    const leadMonto=[...ejArr].sort((a,b)=>b.monto-a.monto)[0]||null;
    // iniciales / cuotas por cobrar del periodo (ventas fraccionadas)
    let iniPend=0, iniCount=0; active.forEach(r=>{ if(this.esFrac(r.tipo)) (r.cuotas||[]).forEach(c=>{ if(!c.pagado){ iniPend+=parseFloat(c.monto)||0; iniCount++; } }); });
    // composición
    const tipoM={}; active.forEach(r=>{ const o=tipoM[r.tipo]=tipoM[r.tipo]||{u:0,fin:0}; o.u++; o.fin+=r.fin; });
    const etM={}; active.forEach(r=>{ const o=etM[r.et]=etM[r.et]||{u:0,fin:0}; o.u++; o.fin+=r.fin; });
    const cM={}; active.forEach(r=>{ const k=r.canal||'—'; const o=cM[k]=cM[k]||{u:0,fin:0}; o.u++; o.fin+=r.fin; });
    // descuentos por modalidad
    const cont=active.filter(r=>r.eq!=='E. Externo' && (r.tipo==='Contado'||r.tipo==='Contado Fraccionado')), fin=active.filter(r=>r.eq!=='E. Externo' && (r.tipo==='Fraccionado'||r.tipo==='Separación'));
    const baseC=this.descMaxFor('Contado',p), baseF=this.descMaxFor('Fraccionado',p);
    const missingOf=(r)=>{ const m=[]; if(!(r.cli||'').trim()) m.push('cliente'); if(!r.fSep) m.push('fecha de separación'); if(!r.fFirma) m.push('fecha de firma'); return m; };
    const dm=(arr,tope)=>({u:arr.length, desc:sum(arr,'desc'), avg:arr.length?sum(arr,'desc')/arr.length:0, pct:sum(arr,'lista')?sum(arr,'desc')/sum(arr,'lista'):0, tope, exc:arr.filter(r=>(r.desc||0)>this.descMaxFor(r.tipo,p)).length, pend:arr.filter(r=>missingOf(r).length).length});
    const pendBlock=(arr)=>arr.filter(r=>missingOf(r).length).map(r=>({ej:r.ej, lote:(r.mz||'')+'-'+(r.lt||''), cli:r.cli||'—', tipo:r.tipo, falta:missingOf(r).join(', ')}));
    return { unid, monto, lista, desc, ticket, descPct, vel, nCerr:dArr.length, visited, visitPct, desist:desist.length,
      recTot, recPct, topEj, leadRec, leadOps, leadMonto, iniPend, iniCount,
      byEj, tipoM, etM, cM, cont:dm(cont,baseC), fin:dm(fin,baseF), pendCont:pendBlock(cont), pendFin:pendBlock(fin),
      anexo: active.slice().map(r=>({ej:r.ej, cli:r.cli||'—', lote:r.mz+'-'+r.lt, et:r.et, tipo:r.tipo, fin:r.fin, visito:!!r.visito})) };
  }

  // ---- helpers ----
  money(n){ return 'S/ ' + Math.round(n).toLocaleString('es-PE'); }
  moneyK(n){ if(n>=1000) return 'S/ ' + (n/1000).toFixed(n>=10000?0:1) + 'k'; return 'S/ ' + Math.round(n); }
  pct(n){ return (n*100).toFixed(1) + '%'; }
  monthShort(p){ const n=['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']; const m=parseInt(String(p).split('.')[0]); return n[m]||p; }
  monthLong(p){ const n=['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; const m=parseInt(String(p).split('.')[0]); return n[m]||p; }
  periodSort(a,b){ const [ma,ya]=a.split('.').map(Number); const [mb,yb]=b.split('.').map(Number); return ya-yb || ma-mb; }
  prevPeriodWith(p){ const ps=Array.from(new Set(this.allRows().map(r=>r.p))).sort((a,b)=>this.periodSort(a,b)); const i=ps.indexOf(p); return i>0?ps[i-1]:null; }
  periodMetrics(p){
    const rows=this.allRows().filter(r=> r.p===p && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor));
    const act=rows.filter(r=>r.tipo!=='Desistido'); const des=rows.filter(r=>r.tipo==='Desistido');
    const sum=(a,k)=>a.reduce((x,r)=>x+(r[k]||0),0);
    const monto=sum(act,'fin'), rec=sum(act,'rec'), unid=act.length;
    return { monto, rec, unid, ticket:unid?monto/unid:0, recPct:monto?rec/monto:0, saldo:Math.max(0,monto-rec), desRate:rows.length?des.length/rows.length:0 };
  }
  allRows(){ const sf=this.state.seedFlags||{}; const seed=(this.state.cleared ? [] : this.RAW).map(r=>{ const k=r.p+'|'+r.mz+'|'+r.lt; return sf[k]?{...r,...sf[k]}:r; }); return seed.concat(this.state.userSales); }
  saveSeedFlags(){ try{ localStorage.setItem('napoles_seedflags', JSON.stringify(this.state.seedFlags||{})); }catch(e){} }
  toggleFlag(r, field){
    if(r.user){ const l=this.state.userSales.map(x=> x.id===r.id ? {...x,[field]:!x[field]} : x); this.saveSales(l); this.setState({userSales:l}); return; }
    const k=r.p+'|'+r.mz+'|'+r.lt; const cur={visito:!!r.visito, liderPart:!!r.liderPart, superPart:!!r.superPart, ...(this.state.seedFlags[k]||{})}; cur[field]=!cur[field];
    const sf={...this.state.seedFlags, [k]:cur}; this.setState({seedFlags:sf}, ()=>this.saveSeedFlags());
  }
  toggleCuota(r, idx){
    const recal=(cu)=>cu.reduce((a,c)=>a+(c.pagado?(parseFloat(c.monto)||0):0),0);
    if(r.user){ const l=this.state.userSales.map(x=>{ if(x.id!==r.id) return x; const cu=(x.cuotas||[]).map((c,i)=> i===idx?{...c,pagado:!c.pagado}:c); return {...x, cuotas:cu, rec:this.esFrac(x.tipo)?recal(cu):x.rec}; }); this.saveSales(l); this.setState({userSales:l}); return; }
    const k=r.p+'|'+r.mz+'|'+r.lt; const cu=(r.cuotas||[]).map((c,i)=> i===idx?{...c,pagado:!c.pagado}:c);
    const cur={...(this.state.seedFlags[k]||{}), cuotas:cu, rec:this.esFrac(r.tipo)?recal(cu):r.rec};
    const sf={...this.state.seedFlags, [k]:cur}; this.setState({seedFlags:sf}, ()=>this.saveSeedFlags());
  }
  setCuotaMode(m){ this.setState({cuotaMode:m}); }
  resetAll(){
    if(!confirm('¿Restablecer la CONFIGURACIÓN comercial (comisiones, escalas, captación, metas)?\n\nNo se borran las ventas: son la base compartida del sistema (Contratos, Pagos, Clientes). Para dar de baja una venta, elimínala desde su ficha.')) return;
    try{ localStorage.removeItem('napoles_ejecutivos'); localStorage.removeItem('napoles_escalas'); localStorage.removeItem('napoles_captacion'); localStorage.removeItem('napoles_descpolicy'); localStorage.removeItem('napoles_seedflags'); localStorage.removeItem('napoles_lider'); localStorage.removeItem('napoles_cierres'); localStorage.removeItem('napoles_retencion'); localStorage.removeItem('napoles_inicialmin'); localStorage.removeItem('napoles_nomina'); }catch(e){}
    this.setState({ cleared:false, ejecutivos:this.defaultEjes(), seedFlags:{}, closedPeriods:{}, retencion:{}, expandedCom:[], inicialMin:3500, nomina:{},
      escalasDefault:{ interno:this.defaultEscala(), externo:this.defaultEscalaExterno() }, escalasByPeriod:{}, editPeriod:'base', editTeam:'interno',
      descPolicy:{ base:{ frac:2000, contado:4000 }, byPeriod:{} }, descEditPeriod:'base',
      liderPolicy:this.defaultLiderPolicy(), liderEditPeriod:'base',
      editingEje:null, editEjeForm:{name:'',equipo:'E. Interno'}, editEjeErr:'',
      metaAds:{}, leads:{}, targetCPA:800, leadsPeriod:null,
      form:this.defaultForm(), formErr:'', showForm:true, periodo:'Todos', equipo:'Todos', asesor:'Todos', newEj:{name:'',equipo:'E. Interno'}, ejeErr:'' });
  }
  restoreDemo(){
    if(!confirm('¿Restaurar los datos de ejemplo? Se conservarán tus ventas registradas, pero volverán a mostrarse las ventas de demostración.')) return;
    try{ localStorage.removeItem('napoles_cleared'); }catch(e){}
    this.setState({ cleared:false, ejecutivos:this.defaultEjes() });
  }
  filtered(){ return this.allRows().filter(r => (this.state.periodo==='Todos'||r.p===this.state.periodo) && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor)); }
  colorFor(name){ let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0; return this.EJ_PALETTE[h % this.EJ_PALETTE.length]; }
  initials(name){ const parts=name.trim().split(/\s+/); return ((parts[0]||'')[0]||'')+((parts[1]||'')[0]||(parts[0]||'')[1]||''); }
  equipoFor(name){ const e=this.state.ejecutivos.find(x=>x.name===name); if(e) return e.equipo; const r=this.RAW.find(x=>x.ej===name); return r?r.eq:'E. Interno'; }
  escalaCol(units){ return units>=8?3:units>=6?2:units>=4?1:0; }
  bandFor(s){ if(s.tipo==='Contado') return 'contado'; const pct=s.fin?(s.rec/s.fin):0; if(pct<0.20) return 'b0'; if(pct<0.50) return 'b1'; return 'b2'; }
  diasCierre(s){ if(!s.fSep||!s.fFirma) return null; const a=new Date(s.fSep), b=new Date(s.fFirma); if(isNaN(a)||isNaN(b)) return null; return Math.round((b-a)/86400000); }
  fmtDate(s){ if(!s) return '—'; const p=String(s).split('-'); if(p.length!==3) return s; return p[2]+' '+this.monthShort(p[1]+'.'+p[0])+' '+p[0]; }
  daysBetween(a,b){ if(!a||!b) return null; const da=new Date(a+'T00:00:00'), db=new Date(b+'T00:00:00'); if(isNaN(da)||isNaN(db)) return null; return Math.round((db-da)/86400000); }
  // fecha "de referencia" de una operación para ordenar la línea de tiempo de una ubicación
  opDate(r){ return r.fFirma || r.fIni || r.fSep || (String(r.p).split('.').reverse().join('-')+'-01'); }
  // Historial por ubicación (lote): tiempo, a nombre de quién, cuántas veces liberada/vendida
  buildUbicaciones(){
    const today=this.todayStr();
    const groups={};
    this.allRows().forEach(r=>{
      const mz=String(r.mz||'').toUpperCase().trim(), lt=String(r.lt||'').trim();
      if(!mz && !lt) return;
      const key=mz+'-'+lt;
      (groups[key]=groups[key]||{key, mz, lt, ops:[]}).ops.push(r);
    });
    const list=Object.values(groups).map(g=>{
      const ops=g.ops.slice().sort((a,b)=>this.opDate(a).localeCompare(this.opDate(b)));
      const veces = ops.length;
      const liberada = ops.filter(o=>o.tipo==='Desistido').length;
      const vendida = ops.filter(o=>o.tipo==='Contado'||o.tipo==='Contado Fraccionado'||o.tipo==='Fraccionado'||(o.tipo==='Separación'&&o.fIni)).length;
      const last = ops[ops.length-1];
      // estado actual y "a nombre de quién"
      let estado, estadoColor, holder, holderEj;
      if(last.tipo==='Desistido'){ estado='Libre'; estadoColor='#9AA1AB'; holder='—'; holderEj='—'; }
      else if(last.tipo==='Separación' && !last.fIni){ estado='Separada'; estadoColor='#2C6E9B'; holder=last.cli||'Sin cliente'; holderEj=last.ej; }
      else { estado='Vendida'; estadoColor='#137A5B'; holder=last.cli||'Sin cliente'; holderEj=last.ej; }
      // tiempo que "tiene" la ubicación: desde la separación de la ocupación vigente
      let tiempoLbl='—', tiempoN=null;
      if(estado!=='Libre'){ const startRef = last.fSep || this.opDate(last); const endRef = (estado==='Vendida' && last.fFirma) ? last.fFirma : today; const d=this.daysBetween(startRef, endRef); if(d!=null && d>=0){ tiempoN=d; tiempoLbl = estado==='Vendida' ? ('Cerró en '+d+' días') : (d+' días separada'); } }
      const timeline = ops.map(o=>{
        let st, stColor;
        if(o.tipo==='Desistido'){ st='Liberada'; stColor='#D26A4C'; }
        else if(o.tipo==='Separación'){ st = o.fIni ? 'Separación completada' : 'Separada'; stColor='#2C6E9B'; }
        else { st='Vendida'; stColor='#137A5B'; }
        const fechaRef = o.fSep || this.opDate(o);
        return { ej:o.ej, cli:o.cli||'Sin cliente', tipo:o.tipo, tipoColor:this.TIPO_COLOR[o.tipo]||'#7C5CC4',
          st, stColor, fSep:this.fmtDate(o.fSep), fCierre:this.fmtDate(o.fFirma||o.fIni),
          periodo:this.monthShort(o.p)+' '+String(o.p).split('.')[1], initials:this.initials(o.ej), color:this.colorFor(o.ej),
          modCompra:o.modCompra||'', hasMod:!!(o.tipo==='Separación'&&o.modCompra), _sort:fechaRef };
      });
      return { key:g.key, mz:g.mz, lt:g.lt, etapa:(last.et||''), veces, liberada, vendida, estado, estadoColor,
        holder, holderEj, holderInitials:holder==='—'?'—':this.initials(holder==='Sin cliente'?last.ej:holder), holderColor:this.colorFor(holderEj||g.key),
        tiempoLbl, tiempoN: tiempoN==null?-1:tiempoN, timeline };
    });
    return list;
  }

  // commission engine for a set of active sales (one executive)
  commForPeriod(sales, cfg){
    const units=sales.length; let base=0;
    const _bounds=cfg.bounds||[2,4,6,8];
    if(cfg.mode!=='flat' && units < _bounds[0]){ return { units, base:0, vol:0, speed:0, total:0, belowMin:true }; }
    if(cfg.mode==='flat'){ const r=cfg.flatRate||0; sales.forEach(s=>{ base+=s.fin*r; }); }
    else { const bounds=cfg.bounds||[2,4,6,8]; const col=this.escalaColB(units,bounds); const m=cfg.matrix;
      sales.forEach(s=>{ const row=this.bandFor(s); base+=s.fin*(((m[row]||[])[col])||0); }); }
    let vol=0; (cfg.volBonos||[]).slice().sort((a,b)=>b.ventas-a.ventas).some(b=>{ if(units>=b.ventas){ vol=b.monto; return true; } return false; });
    let speed=0; const tiers=(cfg.speedBonos||[]).slice().sort((a,b)=>a.dias-b.dias);
    sales.forEach(s=>{ const d=this.diasCierre(s); if(d!=null){ for(const t of tiers){ if(d<=t.dias){ speed+=t.monto; break; } } } });
    return { units, base, vol, speed, total:base+vol+speed };
  }

  // clave estable por operación (para la decisión de retención)
  saleKey(s){ return (s.id!=null && s.id!=='') ? ('u:'+s.id) : ('s:'+s.p+'|'+(s.mz||'')+'|'+(s.lt||'')); }
  retencionFor(s){ const v=(this.state.retencion||{})[this.saleKey(s)]; if(v==='retener') return 'retener'; if(typeof v==='number' && isFinite(v)) return v; return 'completo'; }
  // Recaudo Base de una operación: el 100% contra el que se prorratea.
  // Fraccionado → inicial contratada (o la inicial mínima configurable). Contado/otros → Precio Final.
  recaudoBase(s){ if(this.esFrac(s.tipo)){ const ic=parseFloat(s.iniContratada)||0; return ic>0?ic:(this.state.inicialMin||3500); } return s.fin||0; }

  // ============ PLANILLA / BOLETAS ============
  nominaFor(name){ const d=(this.state.nomina||{})[name]||{};
    return { basico:(d.basico!=null?d.basico:1500), afp:d.afp||'Integra', sistema:d.sistema||'AFP', hijos:!!d.hijos, adelanto:d.adelanto||0 }; }
  saveNomina(){ try{ localStorage.setItem('napoles_nomina', JSON.stringify(this.state.nomina)); }catch(e){} }
  setNomina(name, patch){ this.setState(s=>{ const nm={...s.nomina}; nm[name]={...this.nominaFor(name), ...nm[name], ...patch}; return {nomina:nm}; }, ()=>this.saveNomina()); }
  // Comisión pagable (a pagar hoy: base prorrateada + bonos) de un ejecutivo en un periodo, respetando cierres.
  comisionExecPeriodo(name, p){
    const snap=(this.state.closedPeriods||{})[p];
    if(snap){ const e=(snap.execs||[]).find(x=>x.name===name);
      if(e){ const pagar=(e.pagar!=null?e.pagar:e.base)||0; return { pagable:pagar+(e.vol||0)+(e.speed||0), generada:(e.gen!=null?e.gen:e.base)||0, units:e.units||0 }; }
      return {pagable:0, generada:0, units:0}; }
    const sales=this.allRows().filter(r=> r.p===p && r.ej===name && r.tipo!=='Desistido');
    if(!sales.length) return {pagable:0, generada:0, units:0};
    const cfg=this.escalaFor(p, this.equipoFor(name));
    const c=this.execCommission(sales, cfg);
    return { pagable:c.pagarBase+c.vol+c.speed, generada:c.generadaBase, units:c.units };
  }
  // Impuesto a la renta de 5ta (anual), método por tramos acumulados en UIT.
  renta5taAnual(annual){ const U=this.UIT; let t=Math.max(0, annual - 7*U); let tax=0;
    for(const [wUIT,rate] of this.RENTA_BANDS){ if(t<=0) break; const w=(wUIT===Infinity)?t:Math.min(t, wUIT*U); tax+=w*rate; t-=w; } return tax; }
  buildBoleta(name, p){
    const n=this.nominaFor(name); const com=this.comisionExecPeriodo(name, p);
    const basico=n.basico, comision=com.pagable;
    const asigFam = n.hijos ? Math.round(this.RMV*0.10*100)/100 : 0;
    const bruta = basico + comision + asigFam;
    let pension;
    if(n.sistema==='ONP'){ const onp=bruta*0.13; pension={sistema:'ONP', label:'ONP', aporte:onp, prima:0, comAfp:0, comRate:0, total:onp}; }
    else { const rate=this.AFP_DATA[n.afp]||this.AFP_DATA['Integra'];
      const aporte=bruta*this.AFP_APORTE, prima=Math.min(bruta,this.AFP_TOPE)*this.AFP_PRIMA, comAfp=bruta*rate;
      pension={sistema:'AFP', label:'AFP '+n.afp, aporte, prima, comAfp, comRate:rate, total:aporte+prima+comAfp}; }
    const annual=(basico+asigFam)*14 + comision*12; // proyección referencial (12 sueldos + 2 gratif. + comisión×12)
    const r5anual=this.renta5taAnual(annual), renta=r5anual/12;
    const adelanto=n.adelanto||0;
    const totalDesc=pension.total+renta+adelanto, neto=bruta-totalDesc, essalud=bruta*this.ESSALUD;
    return { name, basico, comision, comUnits:com.units, comGenerada:com.generada, asigFam, bruta,
      pension, renta, r5anual, annual, adelanto, totalDesc, neto, essalud, hijos:n.hijos, afp:n.afp, sistema:n.sistema };
  }
  ejeNames(){ return Array.from(new Set(this.state.ejecutivos.map(e=>e.name).concat(this.allRows().map(r=>r.ej)))).filter(Boolean); }
  setBoletaEje(v){ this.setState({boletaEje:v}); }
  setBoletaPeriodo(v){ this.setState({boletaPeriodo:v}); }
  toggleMatriz(){ this.setState(s=>({showMatriz:!s.showMatriz})); }
  printBoleta(){ try{ document.body.setAttribute('data-print-boleta','1'); window.print(); }catch(e){} finally{ setTimeout(()=>{ try{ document.body.removeAttribute('data-print-boleta'); }catch(e){} }, 400); } }
  // fracción de la comisión generada que se paga hoy, según la decisión de la operación
  pagoFrac(s, pctRec){ const d=this.retencionFor(s); if(d==='retener') return pctRec; if(typeof d==='number') return Math.max(0,Math.min(1,d/100)); return 1; }
  // motor con prorrateo por operación: % alcanzado = Recaudo ÷ Recaudo Base (inicial base en fraccionado, Precio Final en contado).
  // decisión por operación: 'completo' (paga la comisión generada), 'retener' (paga %alcanzado × generada) o un % manual.
  execCommission(sales, cfg){
    const units=sales.length;
    const _b=cfg.bounds||[2,4,6,8];
    const belowMin = cfg.mode!=='flat' && units < _b[0];
    const col=this.escalaColB(units,_b); const m=cfg.matrix||{};
    const rateFor=(s)=> belowMin?0:(cfg.mode==='flat'?(cfg.flatRate||0):(((m[this.bandFor(s)]||[])[col])||0));
    let gen=0, pagar=0, pend=0, recBaseSum=0; const ops=[];
    sales.forEach(s=>{
      const rate=rateFor(s); const og=(s.fin||0)*rate;
      const rbase=this.recaudoBase(s); recBaseSum+=rbase;
      const pct = (rbase>0)? Math.min(1,(s.rec||0)/rbase) : 0;
      const dec = this.retencionFor(s);
      const pf = this.pagoFrac(s, pct);
      const op_pagar = pf*og;
      const op_pend = og-op_pagar;
      gen+=og; pagar+=op_pagar; pend+=op_pend;
      const decKind = dec==='retener' ? 'retener' : (typeof dec==='number' ? 'manual' : 'completo');
      ops.push({ key:this.saleKey(s), lote:(s.mz||'')+'-'+(s.lt||''), tipo:s.tipo, fin:s.fin||0, rec:s.rec||0, base:rbase, esFrac:this.esFrac(s.tipo), pct, generada:og, decision:decKind, manualPct:(typeof dec==='number'?dec:null), payFrac:pf, retFrac:(1-pf), pagar:op_pagar, pend:op_pend });
    });
    let vol=0; if(!belowMin){ (cfg.volBonos||[]).slice().sort((a,b)=>b.ventas-a.ventas).some(b=>{ if(units>=b.ventas){ vol=b.monto; return true; } return false; }); }
    let speed=0; if(!belowMin){ const tiers=(cfg.speedBonos||[]).slice().sort((a,b)=>a.dias-b.dias);
      sales.forEach(s=>{ const d=this.diasCierre(s); if(d!=null){ for(const t of tiers){ if(d<=t.dias){ speed+=t.monto; break; } } } }); }
    return { units, belowMin, generadaBase:gen, pagarBase:pagar, pendBase:pend, recBaseSum, vol, speed, total:pagar+vol+speed, ops };
  }

  // proyección: siguiente tramo de escala y siguiente bono de volumen para un set de ventas de un ejecutivo
  nextStepFor(sales, cfg){
    const units=sales.length; const cur=this.commForPeriod(sales,cfg); const steps=[];
    const bounds=cfg.bounds||[2,4,6,8];
    if(cfg.mode!=='flat'){
      const m=cfg.matrix||{};
      const baseAt=(col)=> sales.reduce((a,s)=> a + (s.fin||0)*(((m[this.bandFor(s)]||[])[col])||0), 0);
      const labs=this.escalaLabels(bounds);
      if(units < bounds[0]){
        steps.push({ kind:'unlock', gap:bounds[0]-units, label:'empezar a comisionar · tramo '+labs[0], reward:baseAt(0) });
      } else {
        const curCol=this.escalaColB(units,bounds);
        if(curCol < bounds.length-1){
          steps.push({ kind:'tier', gap:bounds[curCol+1]-units, label:'subir al tramo '+labs[curCol+1], reward:Math.max(0, baseAt(curCol+1)-baseAt(curCol)) });
        }
      }
    }
    const vbs=(cfg.volBonos||[]).slice().sort((a,b)=>a.ventas-b.ventas);
    const nextVb=vbs.find(b=>b.ventas>units);
    if(nextVb) steps.push({ kind:'bono', gap:nextVb.ventas-units, label:'bono por volumen ('+nextVb.ventas+' ventas)', reward:Math.max(0,(nextVb.monto||0)-cur.vol) });
    return { units, cur, steps };
  }

  // ---- actions ----
  setTab(t){ this.setState({tab:t}); }
  toggleUbi(key){ this.setState(s=>({expandedUbi:s.expandedUbi===key?null:key})); }
  setUbiQuery(v){ this.setState({ubiQuery:v}); }
  setUbiSort(v){ this.setState({ubiSort:v}); }
  setUbiEstado(v){ this.setState({ubiEstado:v}); }
  toggleMenu(id){ this.setState(s=>({openMenu:s.openMenu===id?null:id})); }
  closeMenu(){ this.setState({openMenu:null}); }
  selectTab(t){ this.setState({tab:t, openMenu:null}); }
  toggleSidebar(){ this.setState(s=>({sidebarHidden:!s.sidebarHidden})); }
  setLeadsHoy(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10); const day=this.state.periodo; this.setState(s=>{ const m={...(s.leadsHoy||{})}; if(isFinite(n)&&n>0) m[day]=n; else delete m[day]; try{ localStorage.setItem('napoles_leadshoy', JSON.stringify(m)); }catch(e){} return {leadsHoy:m}; }); }
  setPeriodo(p){ this.setState({periodo:p}); }
  setEquipo(e){ this.setState({equipo:e, asesor:'Todos'}); }
  setAsesor(a){ this.setState({asesor:a}); }
  saveRetencion(){ try{ localStorage.setItem('napoles_retencion', JSON.stringify(this.state.retencion)); }catch(e){} }
  setRetencion(key, val){ this.setState(s=>{ const r={...s.retencion}; if(val==='retener') r[key]='retener'; else if(typeof val==='number' && isFinite(val)) r[key]=Math.max(0,Math.min(100,val)); else delete r[key]; return {retencion:r}; }, ()=>this.saveRetencion()); }
  setRetencionPct(key, str){ const raw=String(str).trim(); if(raw===''){ this.setRetencion(key,'completo'); return; } const n=parseFloat(raw); if(!isFinite(n)) return; this.setRetencion(key, n); }
  toggleExpandCom(name){ this.setState(s=>{ const set=s.expandedCom.includes(name)? s.expandedCom.filter(n=>n!==name) : s.expandedCom.concat(name); return {expandedCom:set}; }); }
  toggleLider(){ this.setState(s=>({showLider:!s.showLider})); }
  saveInicialMin(){ try{ localStorage.setItem('napoles_inicialmin', String(this.state.inicialMin)); }catch(e){} }
  setInicialMin(v){ const n=parseFloat(String(v).replace(/[^0-9.]/g,'')); this.setState({inicialMin: (isFinite(n)&&n>0)?n:0}, ()=>this.saveInicialMin()); }
  _segStyle(on, locked){ return "font-family:'Manrope',sans-serif; font-size:10.5px; font-weight:700; padding:4px 9px; border-radius:7px; white-space:nowrap; border:1px solid "+(on?'#0B3D2E':'#D7DBE0')+"; background:"+(on?'#0B3D2E':'#fff')+"; color:"+(on?'#fff':'#5A6472')+"; cursor:"+(locked?'default':'pointer')+"; opacity:"+(locked&&!on?'.5':'1')+";"; }
  setRankBy(r){ this.setState({rankBy:r}); }
  setTrendBy(t){ this.setState({trendBy:t}); }
  toggleForm(){ this.setState(s=>({showForm:!s.showForm})); }
  updateField(k,v){ this.setState(s=>{ const f={...s.form,[k]:v}; if(k==='ejecutivo') f.equipo=this.equipoFor(v); return {form:f}; }); }
  updateCuota(i,k,v){ this.setState(s=>{ const cs=(s.form.cuotas||[]).slice(); cs[i]={...cs[i],[k]:v}; return {form:{...s.form,cuotas:cs}}; }); }
  addCuota(){ this.setState(s=>({form:{...s.form,cuotas:(s.form.cuotas||[]).concat([{monto:'',fecha:'',pagado:false}])}})); }
  removeCuota(i){ this.setState(s=>{ const cs=(s.form.cuotas||[]).slice(); cs.splice(i,1); return {form:{...s.form,cuotas:cs.length?cs:[{monto:'',fecha:'',pagado:false}]}}; }); }
  addSale(force){
    const f=this.state.form; const lista=parseFloat(f.lista)||0, desc=parseFloat(f.desc)||0; const fin=Math.max(0,lista-desc);
    if(!(f.ejecutivo||'').trim() || !lista){ this.setState({formErr:'Selecciona Ejecutivo e indica Precio Lista'}); return; }
    const editId=this.state.editingId;
    const mzU=(f.mz||'').toUpperCase().trim(), ltU=String(f.lt||'').trim();
    if(mzU && ltU && force!==true){
      const dup=this.allRows().find(r=> r.id!==editId && String(r.mz||'').toUpperCase().trim()===mzU && String(r.lt||'').trim()===ltU);
      if(dup){ this.setState({dupWarn:{lote:mzU+'-'+ltU, ej:dup.ej, periodo:this.monthShort(dup.p)+' '+String(dup.p).split('.')[1], tipo:dup.tipo}, formErr:''}); return; }
    }
    const cuotas=(this.esFrac(f.tipo)) ? (f.cuotas||[]).filter(c=>parseFloat(c.monto)>0).map(c=>({monto:parseFloat(c.monto)||0, fecha:c.fecha||'', pagado:!!c.pagado})) : [];
    const iniContratada=(this.esFrac(f.tipo)) ? (parseFloat(f.iniContratada)||0) : 0;
    let rec=parseFloat(f.recaudo)||0; if(this.esFrac(f.tipo) && cuotas.length){ rec=cuotas.reduce((a,c)=>a+(c.pagado?c.monto:0),0); }
    const editingId=this.state.editingId;
    const esSep = f.tipo==='Separación';
    const row={ id: editingId||('u'+Date.now()), p:f.periodo, ej:f.ejecutivo, eq:f.equipo, cli:(f.cliente||'').trim(), et:f.etapa, mz:(f.mz||'').toUpperCase(), lt:f.lt||'', lista, desc, fin, rec, tipo:f.tipo, canal:f.canal, fSep:f.fSep||'', fFirma:f.fFirma||'', fIni: esSep?(f.fIni||''):'', modCompra: esSep?(f.modCompra||''):'', visito:!!f.visito, liderPart:!!f.liderPart, superPart:!!f.superPart, iniContratada, cuotas, user:true };
    const l = editingId ? this.state.userSales.map(r=>r.id===editingId?row:r) : this.state.userSales.concat(row);
    this.saveSales(l); this.setState({userSales:l, form:this.defaultForm(), formErr:'', editingId:null, dupWarn:null});
  }
  toggleRow(key){ this.setState(s=>({expandedRow:s.expandedRow===key?null:key})); }
  setXf(kind,val){ const key='xf'+kind; this.setState(s=>({[key]: s[key]===val?null:val, tablePage:0})); }
  clearXf(){ this.setState({xfTipo:null, xfCanal:null, xfEtapa:null, tablePage:0}); }
  setTablePeriod(p){ this.setState({tablePeriod:p, tablePage:0}); }
  setTableQuery(v){ this.setState({tableQuery:v, tablePage:0}); }
  setTableTipo(v){ this.setState({tableTipo:v, tablePage:0}); }
  setTableCanal(v){ this.setState({tableCanal:v, tablePage:0}); }
  clearTableFilters(){ this.setState({tableQuery:'', tableTipo:'Todos', tableCanal:'Todos', tablePage:0}); }
  setTablePage(n){ this.setState({tablePage:n}); }
  selId(r){ return r.user ? ('u:'+r.id) : ('s:'+r.p+'|'+r.mz+'|'+r.lt); }
  _selIdSet(){ const sel=this.state.selRows||{}; return new Set(Object.keys(sel).filter(k=>sel[k])); }
  toggleSel(r){ const id=this.selId(r); this.setState(s=>{ const sel={...(s.selRows||{})}; if(sel[id]) delete sel[id]; else sel[id]=true; return {selRows:sel}; }); }
  setSelMany(ids, on){ this.setState(s=>{ const sel={...(s.selRows||{})}; ids.forEach(id=>{ if(on) sel[id]=true; else delete sel[id]; }); return {selRows:sel}; }); }
  clearSel(){ this.setState({selRows:{}}); }
  bulkField(field, value, toggle){
    const idSet=this._selIdSet(); if(!idSet.size) return;
    const us=this.state.userSales.map(x=> idSet.has('u:'+x.id) ? {...x, [field]: (toggle? !x[field] : value)} : x);
    const sf={...(this.state.seedFlags||{})};
    (this.state.cleared?[]:this.RAW).forEach(r=>{ const sid='s:'+r.p+'|'+r.mz+'|'+r.lt; if(!idSet.has(sid)) return; const k=r.p+'|'+r.mz+'|'+r.lt; const cur={...(sf[k]||{})}; const curVal=(field in cur)?cur[field]:r[field]; cur[field]= toggle? !curVal : value; sf[k]=cur; });
    this.saveSales(us); try{ localStorage.setItem('napoles_seedflags', JSON.stringify(sf)); }catch(e){}
    this.setState({userSales:us, seedFlags:sf});
  }
  bulkRemove(){ const idSet=this._selIdSet(); if(!idSet.size) return; const nUser=this.state.userSales.filter(x=>idSet.has('u:'+x.id)).length; if(nUser===0){ return; } const us=this.state.userSales.filter(x=>!idSet.has('u:'+x.id)); this.saveSales(us); this.setState(s=>{ const sel={...(s.selRows||{})}; Object.keys(sel).forEach(k=>{ if(k.startsWith('u:')) delete sel[k]; }); return {userSales:us, selRows:sel}; }); }
  setRecaudo(r, val){
    const num=Math.max(0, Math.round(parseFloat(String(val).replace(/[^0-9.\-]/g,''))||0));
    const dk=this.selId(r);
    if((r.rec||0)===num){ this.setState(s=>{ const d={...(s.recDraft||{})}; delete d[dk]; return {recDraft:d}; }); return; }
    if(r.user){ const us=this.state.userSales.map(x=> x.id===r.id ? {...x, rec:num} : x); this.saveSales(us); this.setState(s=>{ const d={...(s.recDraft||{})}; delete d[dk]; return {userSales:us, recDraft:d}; }); }
    else { const k=r.p+'|'+r.mz+'|'+r.lt; const sf={...(this.state.seedFlags||{})}; sf[k]={...(sf[k]||{}), rec:num}; try{ localStorage.setItem('napoles_seedflags', JSON.stringify(sf)); }catch(e){} this.setState(s=>{ const d={...(s.recDraft||{})}; delete d[dk]; return {seedFlags:sf, recDraft:d}; }); }
  }
  editSale(id){
    const r=this.state.userSales.find(x=>x.id===id); if(!r) return;
    const form={ periodo:r.p, ejecutivo:r.ej, equipo:r.eq, cliente:r.cli||'', etapa:r.et, mz:r.mz||'', lt:r.lt||'', lista:r.lista!=null?String(r.lista):'', desc:r.desc!=null?String(r.desc):'', recaudo:r.rec!=null?String(r.rec):'', tipo:r.tipo, canal:r.canal, fSep:r.fSep||'', fFirma:r.fFirma||'', fIni:r.fIni||'', modCompra:r.modCompra||'', visito:!!r.visito, liderPart:!!r.liderPart, superPart:!!r.superPart, iniContratada:r.iniContratada?String(r.iniContratada):'', cuotas:(r.cuotas&&r.cuotas.length)?r.cuotas.map(c=>({monto:String(c.monto),fecha:c.fecha||'',pagado:!!c.pagado})):[{monto:'',fecha:'',pagado:false}] };
    this.setState({form, editingId:id, showForm:true, formErr:'', dupWarn:null});
  }
  cancelEdit(){ this.setState({form:this.defaultForm(), editingId:null, formErr:'', dupWarn:null}); }
  goEditSale(id){ this.editSale(id); this.setState({tab:'operaciones'}); }
  removeSale(id){ const row=this.state.userSales.find(r=>r.id===id); const l=this.state.userSales.filter(r=>r.id!==id); try{ if(window.removeComercialRow && window.getSesion?.()?.empresaId){ window.removeComercialRow((row&&row._mkId)||id); } else { this.saveSales(l); } }catch(e){ this.saveSales(l); } this.setState(s=>({userSales:l, editingId:s.editingId===id?null:s.editingId, form:s.editingId===id?this.defaultForm():s.form})); }
  updateNewEj(k,v){ this.setState(s=>({newEj:{...s.newEj,[k]:v}})); }
  addEje(){
    const n=(this.state.newEj.name||'').trim();
    if(!n){ this.setState({ejeErr:'Indica un nombre'}); return; }
    if(this.state.ejecutivos.some(e=>e.name.toLowerCase()===n.toLowerCase())){ this.setState({ejeErr:'Ya existe ese ejecutivo'}); return; }
    const l=this.state.ejecutivos.concat({name:n, equipo:this.state.newEj.equipo}); this.saveEjes(l);
    this.setState({ejecutivos:l, newEj:{name:'',equipo:'E. Interno'}, ejeErr:''});
  }
  removeEje(name){ const l=this.state.ejecutivos.filter(e=>e.name!==name); this.saveEjes(l); this.setState({ejecutivos:l}); }
  startEditEje(name){ const e=this.state.ejecutivos.find(x=>x.name===name); if(!e) return; this.setState({editingEje:name, editEjeForm:{name:e.name, equipo:e.equipo}, editEjeErr:''}); }
  updateEditEje(k,v){ this.setState(s=>({editEjeForm:{...s.editEjeForm,[k]:v}})); }
  cancelEditEje(){ this.setState({editingEje:null, editEjeForm:{name:'',equipo:'E. Interno'}, editEjeErr:''}); }
  saveEditEje(){
    const orig=this.state.editingEje; const nn=(this.state.editEjeForm.name||'').trim(); const eq=this.state.editEjeForm.equipo;
    if(!nn){ this.setState({editEjeErr:'Indica un nombre'}); return; }
    if(this.state.ejecutivos.some(e=>e.name!==orig && e.name.toLowerCase()===nn.toLowerCase())){ this.setState({editEjeErr:'Ya existe un ejecutivo con ese nombre'}); return; }
    const list=this.state.ejecutivos.map(e=>e.name===orig?{name:nn, equipo:eq}:e); this.saveEjes(list);
    const sales=this.state.userSales.map(r=>r.ej===orig?{...r, ej:nn, eq:eq}:r); this.saveSales(sales);
    this.setState({ejecutivos:list, userSales:sales, editingEje:null, editEjeForm:{name:'',equipo:'E. Interno'}, editEjeErr:''});
  }
  setDescEditPeriod(p){ this.setState({descEditPeriod:p}); }
  setDescMode(m){ this.setState({descMode:m}); }
  updateDescPolicy(field,v){
    const raw=String(v).trim(); const val = raw==='' ? null : (parseFloat(raw)||0);
    this.setState(s=>{
      const pol={ base:{...s.descPolicy.base}, byPeriod:{...s.descPolicy.byPeriod} };
      if(s.descEditPeriod==='base'){ pol.base[field]= (val==null?0:val); }
      else { const p=s.descEditPeriod; const po={...(pol.byPeriod[p]||{})}; if(val==null) delete po[field]; else po[field]=val; if(Object.keys(po).length) pol.byPeriod[p]=po; else delete pol.byPeriod[p]; }
      return {descPolicy:pol};
    }, ()=>this.saveDescPolicy());
  }
  resetDescPeriod(){ if(this.state.descEditPeriod==='base') return; this.setState(s=>{ const bp={...s.descPolicy.byPeriod}; delete bp[s.descEditPeriod]; return {descPolicy:{base:s.descPolicy.base, byPeriod:bp}}; }, ()=>this.saveDescPolicy()); }
  setEditPeriod(p){ this.setState({editPeriod:p}); }
  setEditTeam(t){ this.setState({editTeam:t}); }
  resetEditPeriod(){ if(this.state.editPeriod==='base') return; const ep=this.state.editPeriod, tk=this.state.editTeam; const map={...this.state.escalasByPeriod}; if(map[ep]){ const po={...map[ep]}; delete po[tk]; if(Object.keys(po).length) map[ep]=po; else delete map[ep]; } this.setState({escalasByPeriod:map}, ()=>this.persistEscalas()); }
  updateMatrix(rowKey,col,v){ this.writeEditCfg(c=>{ const arr=(c.matrix[rowKey]||[]).slice(); while(arr.length<=col) arr.push(0); arr[col]=v; c.matrix[rowKey]=arr; }); }
  updateMode(m){ this.writeEditCfg(c=>{ c.mode=m; }); }
  updateFlatRate(v){ this.writeEditCfg(c=>{ c.flatRate=v; }); }
  updateBound(i,v){ this.writeEditCfg(c=>{ c.bounds=(c.bounds||[2,4,6,8]).map((b,idx)=>idx===i?v:b); }); }
  addCol(){ this.writeEditCfg(c=>{ const b=(c.bounds||[2,4,6,8]).slice(); b.push((b[b.length-1]||0)+2); c.bounds=b; Object.keys(c.matrix).forEach(k=>{ const a=c.matrix[k].slice(); a.push(a[a.length-1]||0); c.matrix[k]=a; }); }); }
  removeCol(){ this.writeEditCfg(c=>{ const b=(c.bounds||[2,4,6,8]); if(b.length<=1) return; c.bounds=b.slice(0,-1); Object.keys(c.matrix).forEach(k=>{ c.matrix[k]=c.matrix[k].slice(0,-1); }); }); }
  escalaColB(units,bounds){ let i=0; (bounds||[2,4,6,8]).forEach((b,idx)=>{ if(units>=b) i=idx; }); return i; }
  escalaLabels(bounds){ const bs=bounds||[2,4,6,8]; return bs.map((b,i)=> i<bs.length-1 ? (b+'–'+(bs[i+1]-1)) : (b+' +')); }
  _baseBonos(k){ const b=this.state.escalasDefault[this.state.editTeam]; return JSON.parse(JSON.stringify((b&&b[k])||[])); }
  _seedVol(c){ if(!(c.volBonos&&c.volBonos.length)) c.volBonos=this._baseBonos('volBonos'); }
  _seedSpeed(c){ if(!(c.speedBonos&&c.speedBonos.length)) c.speedBonos=this._baseBonos('speedBonos'); }
  updateVolBono(i,k,v){ this.writeEditCfg(c=>{ this._seedVol(c); c.volBonos=c.volBonos.map((b,idx)=>idx===i?{...b,[k]:v}:b); }); }
  addVolBono(){ this.writeEditCfg(c=>{ this._seedVol(c); c.volBonos=c.volBonos.concat({ventas:0,monto:0}); }); }
  removeVolBono(i){ this.writeEditCfg(c=>{ this._seedVol(c); c.volBonos=c.volBonos.filter((_,idx)=>idx!==i); }); }
  updateSpeedBono(i,k,v){ this.writeEditCfg(c=>{ this._seedSpeed(c); c.speedBonos=c.speedBonos.map((b,idx)=>idx===i?{...b,[k]:v}:b); }); }
  addSpeedBono(){ this.writeEditCfg(c=>{ this._seedSpeed(c); c.speedBonos=c.speedBonos.concat({dias:0,monto:0}); }); }
  removeSpeedBono(i){ this.writeEditCfg(c=>{ this._seedSpeed(c); c.speedBonos=c.speedBonos.filter((_,idx)=>idx!==i); }); }
  onPin(e){ this.setState({pinInput:e.target.value}); }
  submitPin(){ if(this.state.pinInput===this.PIN){ this.setState({comUnlocked:true, pinErr:''}); } else { this.setState({pinErr:'PIN incorrecto'}); } }
  setLeadsPeriod(p){ this.setState({leadsPeriod:p}); }
  setMetaAds(p,v){ this.setState(s=>{ const m={...s.metaAds}; m[p]=v; return {metaAds:m}; }, ()=>this.saveCaptacion()); }
  setLeadCount(p,name,v){ this.setState(s=>{ const l={...s.leads}; const po={...(l[p]||{})}; po[name]=v; l[p]=po; return {leads:l}; }, ()=>this.saveCaptacion()); }
  setTargetCPA(v){ this.setState({targetCPA:v}, ()=>this.saveCaptacion()); }
  saveMetas(){ try{ localStorage.setItem('napoles_metas', JSON.stringify(this.state.metas)); }catch(e){} }
  setMeta(p,key,v){ const raw=String(v).replace(/[^0-9.]/g,''); const val=raw===''?null:(parseFloat(raw)||0); this.setState(s=>{ const m={...s.metas}; const po={...(m[p]||{})}; if(val==null) delete po[key]; else po[key]=val; if(Object.keys(po).length) m[p]=po; else delete m[p]; return {metas:m}; }, ()=>this.saveMetas()); }

  // ---- importación CSV ----
  openImport(){ this.setState({importOpen:true, importText:'', importResult:null}); }
  closeImport(){ this.setState({importOpen:false, importResult:null}); }
  setImportText(v){ this.setState({importText:v}); }
  onImportFile(e){ const f=e.target.files&&e.target.files[0]; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ this.setState({importText:String(rd.result||'')}, ()=>this.parseImport()); }; rd.readAsText(f); }
  _splitCSVLine(line){ const out=[]; let cur='', q=false; for(let i=0;i<line.length;i++){ const c=line[i]; if(q){ if(c==='"'){ if(line[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; } else { if(c==='"') q=true; else if(c===',') { out.push(cur); cur=''; } else cur+=c; } } out.push(cur); return out.map(s=>s.trim()); }
  parseImport(){
    const raw=(this.state.importText||'').replace(/\ufeff/g,'').trim();
    if(!raw){ this.setState({importResult:{valid:[], errors:[], dupes:[], empty:true}}); return; }
    const lines=raw.split(/\r?\n/).filter(l=>l.trim());
    let start=0; const first=this._splitCSVLine(lines[0]).map(s=>s.toLowerCase());
    if(first.join(',').includes('periodo') && first.join(',').includes('ejecutivo')) start=1;
    const TIPOS=['Contado','Contado Fraccionado','Fraccionado','Separación','Desistido'];
    const existing=new Set(this.allRows().map(r=>String(r.mz||'').toUpperCase()+'-'+String(r.lt||'')));
    const valid=[], errors=[], dupes=[];
    for(let i=start;i<lines.length;i++){
      const ln=lines[i]; const c=this._splitCSVLine(ln); const rowNo=i+1;
      const [periodo,ej,eq,cli,lote,etapa,canal,tipo,lista,desc,pfinal,rec,fSep,fFirma]=c;
      const errs=[];
      if(!/^\d{1,2}\.\d{4}$/.test(periodo||'')) errs.push('periodo inválido ("'+(periodo||'')+'", usa M.AAAA)');
      if(!(ej||'').trim()) errs.push('falta ejecutivo');
      const listaN=parseFloat(lista)||0, descN=parseFloat(desc)||0, finN=(pfinal!==undefined&&pfinal!=='')?(parseFloat(pfinal)||0):Math.max(0,listaN-descN);
      if(!(finN>0)) errs.push('precio final/lista inválido');
      let tipoV=(tipo||'').trim(); if(tipoV && !TIPOS.includes(tipoV)){ const m=TIPOS.find(t=>t.toLowerCase()===tipoV.toLowerCase()); tipoV=m||'Contado'; } if(!tipoV) tipoV='Contado';
      if(errs.length){ errors.push({row:rowNo, msg:errs.join('; '), raw:ln.slice(0,60)}); continue; }
      const mz=(lote||'').split('-')[0]||'', lt=(lote||'').split('-').slice(1).join('-')||'';
      const eqV = eq||this.equipoFor(ej)||'E. Interno';
      const sale={ id:'imp-'+Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2,6), p:periodo, ej:ej.trim(), eq:eqV, cli:(cli||'').trim(), mz:mz.toUpperCase(), lt, et:(etapa||'I').trim()||'I', canal:(canal||'Lead Digital').trim(), tipo:tipoV, lista:listaN||finN, desc:descN, fin:finN, rec:parseFloat(rec)||0, fSep:(fSep||'').trim(), fFirma:(fFirma||'').trim(), cuotas:[], user:true };
      if(lote && existing.has(mz.toUpperCase()+'-'+lt)) dupes.push({row:rowNo, lote:lote});
      valid.push(sale);
    }
    this.setState({importResult:{valid, errors, dupes, empty:false}});
  }
  confirmImport(){
    const res=this.state.importResult; if(!res||!res.valid.length) return;
    const list=this.state.userSales.concat(res.valid); this.saveSales(list);
    this.setState({userSales:list, importOpen:false, importResult:null, importText:''});
  }
  // ---- cierre de periodo (snapshot inmutable de comisiones) ----
  saveCierres(){ try{ localStorage.setItem('napoles_cierres', JSON.stringify(this.state.closedPeriods)); }catch(e){} }
  buildClosure(p){
    const active=this.allRows().filter(r=> r.p===p && r.tipo!=='Desistido');
    const grupos={}; active.forEach(s=>{ const k=s.ej; (grupos[k]=grupos[k]||{ej:s.ej,eq:s.eq,sales:[]}).sales.push(s); });
    const execs=Object.values(grupos).map(g=>{ const cfg=this.escalaFor(p,g.eq); const c=this.execCommission(g.sales,cfg); const _b=cfg.bounds||[2,4,6,8];
      const esc= cfg.mode==='flat'?(Math.round((cfg.flatRate||0)*100)+'%'):(g.sales.length<_b[0]?('< '+_b[0]):this.escalaLabels(_b)[this.escalaColB(g.sales.length,_b)]);
      return { name:g.ej, eq:g.eq, units:c.units, escala:esc, monto:g.sales.reduce((a,s)=>a+(s.fin||0),0), rec:g.sales.reduce((a,s)=>a+(s.rec||0),0), recBase:Math.round(c.recBaseSum),
        gen:Math.round(c.generadaBase), base:Math.round(c.pagarBase), pagar:Math.round(c.pagarBase), pend:Math.round(c.pendBase),
        ops:c.ops.map(o=>({ lote:o.lote, tipo:o.tipo, fin:o.fin, rec:o.rec, base:o.base, esFrac:o.esFrac, pct:o.pct, generada:o.generada, decision:o.decision, manualPct:o.manualPct, payFrac:o.payFrac, retFrac:o.retFrac, pagar:o.pagar, pend:o.pend })),
        vol:Math.round(c.vol), speed:Math.round(c.speed), total:Math.round(c.total) };
    }).sort((a,b)=>b.total-a.total);
    return { closedAt:new Date().toISOString().slice(0,10), execCount:execs.length, execs,
      totalBase:execs.reduce((a,e)=>a+e.base,0), totalVol:execs.reduce((a,e)=>a+e.vol,0), totalSpeed:execs.reduce((a,e)=>a+e.speed,0), total:execs.reduce((a,e)=>a+e.total,0) };
  }
  closePeriod(p){ if(!p||p==='Todos') return; if(!confirm('¿Cerrar las comisiones de '+this.monthShort(p)+' '+p.split('.')[1]+'?\n\nSe congela el cálculo actual como registro oficial del mes. Podrás reabrirlo si necesitas corregir.')) return;
    this.setState(s=>({closedPeriods:{...s.closedPeriods, [p]:this.buildClosure(p)}}), ()=>this.saveCierres()); }
  reopenPeriod(p){ if(!confirm('¿Reabrir '+this.monthShort(p)+' '+p.split('.')[1]+'? El registro congelado se descartará y las comisiones volverán a calcularse en vivo.')) return;
    this.setState(s=>{ const c={...s.closedPeriods}; delete c[p]; return {closedPeriods:c}; }, ()=>this.saveCierres()); }
  downloadCSV(filename, rows){
    const csv=rows.map(r=>r.map(c=>{ const s=String(c==null?'':c); return /[",\n;]/.test(s)?('"'+s.replace(/"/g,'""')+'"'):s; }).join(',')).join('\r\n');
    try{ const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500); }catch(e){}
  }
  scopeLabel(){ const p=this.state.periodo==='Todos'?'todos':this.state.periodo.replace('.','-'); const e=this.state.equipo==='Todos'?'':('_'+this.teamKey(this.state.equipo)); return p+e; }
  exportVentas(){
    const rows=this.allRows().filter(r=> (this.state.periodo==='Todos'||r.p===this.state.periodo) && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor));
    const head=['Periodo','Ejecutivo','Equipo','Cliente','Lote','Etapa','Canal','Tipo','P.Lista','Descuento','P.Final','Recaudo','F.Separacion','F.Firma','DiasCierre','Visito','ParticipoLider'];
    const body=rows.map(r=>[ r.p, r.ej, r.eq, r.cli||'', (r.mz||'')+'-'+(r.lt||''), r.et||'', r.canal||'', r.tipo, r.lista||0, r.desc||0, r.fin||0, r.rec||0, r.fSep||'', r.fFirma||'', (this.diasCierre(r)!=null?this.diasCierre(r):''), r.visito?'Si':'No', r.liderPart?'Si':'No' ]);
    this.downloadCSV('ventas_napoles_'+this.scopeLabel()+'.csv', [head].concat(body));
  }
  exportComisiones(){
    const active=this.allRows().filter(r=> r.tipo!=='Desistido' && (this.state.periodo==='Todos'||r.p===this.state.periodo) && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor));
    const grupos={}; active.forEach(s=>{ const k=s.ej+'|'+s.p; (grupos[k]=grupos[k]||{ej:s.ej,p:s.p,eq:s.eq,sales:[]}).sales.push(s); });
    const head=['Ejecutivo','Equipo','Periodo','Unidades','Escala','MontoFinal','Recaudo','ComisionGenerada','ComisionAPagar','Retenido','BonoVolumen','BonoVelocidad','ComisionTotal'];
    const body=Object.values(grupos).sort((a,b)=> a.ej.localeCompare(b.ej)||this.periodSort(a.p,b.p)).map(g=>{
      const cfg=this.escalaFor(g.p,g.eq); const c=this.execCommission(g.sales,cfg); const _b=cfg.bounds||[2,4,6,8];
      const esc = cfg.mode==='flat' ? (Math.round((cfg.flatRate||0)*100)+'% (tarifa)') : (g.sales.length<_b[0]?('< '+_b[0]):this.escalaLabels(_b)[this.escalaColB(g.sales.length,_b)]);
      const monto=g.sales.reduce((a,s)=>a+(s.fin||0),0), rec=g.sales.reduce((a,s)=>a+(s.rec||0),0);
      return [ g.ej, g.eq, g.p, c.units, esc, monto, rec, Math.round(c.generadaBase), Math.round(c.pagarBase), Math.round(c.pendBase), Math.round(c.vol), Math.round(c.speed), Math.round(c.total) ];
    });
    this.downloadCSV('comisiones_napoles_'+this.scopeLabel()+'.csv', [head].concat(body));
  }

  renderVals(){
    const accent = this.props.accentColor || '#137A5B';
    const base = this.filtered();
    const xfTipo=this.state.xfTipo, xfCanal=this.state.xfCanal, xfEtapa=this.state.xfEtapa;
    const all = base.filter(r=> (!xfTipo||r.tipo===xfTipo) && (!xfCanal||(r.canal||'—')===xfCanal) && (!xfEtapa||r.et===xfEtapa));
    const activeFilters=[];
    if(xfTipo) activeFilters.push({label:'Tipo · '+xfTipo, onClear:()=>this.setXf('Tipo',xfTipo)});
    if(xfCanal) activeFilters.push({label:'Canal · '+xfCanal, onClear:()=>this.setXf('Canal',xfCanal)});
    if(xfEtapa) activeFilters.push({label:'Etapa '+xfEtapa, onClear:()=>this.setXf('Etapa',xfEtapa)});
    const active = all.filter(r=>r.tipo!=='Desistido');
    const desist = all.filter(r=>r.tipo==='Desistido');
    const sum=(a,k)=>a.reduce((x,r)=>x+(r[k]||0),0);
    const montoTot=sum(active,'fin'), recaudoTot=sum(active,'rec'), listaTot=sum(active,'lista'), descTot=sum(active,'desc');
    const unid=active.length;
    const ticket=unid?montoTot/unid:0, descPct=listaTot?descTot/listaTot:0, recPct=montoTot?recaudoTot/montoTot:0;
    const desRate=all.length?desist.length/all.length:0;
    const diasArr=active.map(r=>this.diasCierre(r)).filter(d=>d!=null);
    const velAvg=diasArr.length?Math.round(diasArr.reduce((a,b)=>a+b,0)/diasArr.length):null;
    const nCerradas=diasArr.length;
    const nFirmadas=active.filter(r=>r.tipo!=='Separación').length;

    // --- KPIs (public, no commission) ---
    // Comparación temporal: solo cuando hay un periodo específico seleccionado y sin filtros cruzados.
    const _selP=this.state.periodo;
    const _prevP = (_selP!=='Todos' && !xfTipo && !xfCanal && !xfEtapa) ? this.prevPeriodWith(_selP) : null;
    const _cur = _prevP ? this.periodMetrics(_selP) : null;
    const _prev = _prevP ? this.periodMetrics(_prevP) : null;
    const _prevLabel = _prevP ? this.monthShort(_prevP) : '';
    const _delta=(c,p,inverse)=>{
      if(_prev==null) return {has:false};
      if(!p){ return c>0?{has:true, txt:'nuevo', color:'#137A5B', bg:'#E7F2EC'}:{has:false}; }
      const ch=(c-p)/Math.abs(p); const up=ch>=0; const flat=Math.abs(ch)<0.005; const good= inverse?!up:up;
      return { has:true, txt:(up?'▲ ':'▼ ')+Math.abs(ch*100).toFixed(0)+'%', color: flat?'#7A828E':(good?'#137A5B':'#C0563A'), bg: flat?'#F2F4F6':(good?'#E7F2EC':'#FBEDE8') };
    };
    const _dk=(cur,prev,inv)=>{ const d=_cur?_delta(cur,prev,inv):{has:false}; return { hasDelta:d.has, deltaTxt:d.txt||'', deltaColor:d.color||'#7A828E', deltaBg:d.bg||'#F2F4F6', prevLabel:_prevLabel }; };
    const kpis=[
      {label:'Monto Vendido', color:accent, value:this.money(montoTot), sub:unid+' operaciones activas', ..._dk(_cur&&_cur.monto, _prev&&_prev.monto)},
      {label:'Recaudo Total', color:'#2C6E9B', value:this.money(recaudoTot), sub:this.pct(recPct)+' del monto', ..._dk(_cur&&_cur.rec, _prev&&_prev.rec)},
      {label:'Operaciones', color:'#1F9E8A', value:String(unid), sub:desist.length+' desistimientos', ..._dk(_cur&&_cur.unid, _prev&&_prev.unid)},
      {label:'Ticket Promedio', color:'#0B3D2E', value:this.money(ticket), sub:'por operación', ..._dk(_cur&&_cur.ticket, _prev&&_prev.ticket)},
      {label:'Tasa Desistimiento', color:'#D26A4C', value:this.pct(desRate), sub:desist.length+' de '+all.length+' ops.', ..._dk(_cur&&_cur.desRate, _prev&&_prev.desRate, true)},
      {label:'Velocidad Cierre', color:'#C49A3F', value: velAvg!=null?velAvg+' d':'—', sub: nCerradas+' venta(s) cerrada(s)', hasDelta:false, deltaTxt:'', deltaColor:'#7A828E', deltaBg:'#F2F4F6', prevLabel:_prevLabel},
    ];

    // --- Meta del mes vs. real (objetivo editable por periodo) ---
    const _metaP = _selP!=='Todos' ? _selP : null;
    const metaShow = _metaP!=null;
    const metaPeriodLabel = _metaP ? (this.monthShort(_metaP)+' '+_metaP.split('.')[1]) : '';
    const _mo = _metaP ? (this.state.metas[_metaP]||{}) : {};
    const _mkCard=(key, cur, color, unit, fmt)=>{
      const target=_mo[key]||0; const has=target>0; const ratio=has?cur/target:0; const pct=Math.round(Math.min(1,ratio)*100);
      const done=has&&cur>=target; const rem=target-cur;
      const barColor = !has?'#CBD2DA' : done?'#137A5B' : (ratio>=0.6?color:'#C49A3F');
      const msg = !has ? 'Define un objetivo para medir el avance' : (done ? ('Meta cumplida · +'+(unit==='ops'?(cur-target)+' ops':this.money(cur-target))) : ('Faltan '+(unit==='ops'?rem+' ops':this.money(rem))+' ('+pct+'%)'));
      return { key, label:key==='recaudo'?'Recaudo':'Operaciones', color,
        curTxt: unit==='ops'?String(cur):this.money(cur),
        targetInput: has?String(target):'', unit,
        barW: pct+'%', barColor, pctLabel: has?(pct+'%'):'—',
        msg, msgColor: !has?'#9AA1AB':(done?'#137A5B':(ratio>=0.6?'#5A6472':'#B0593C')),
        onInput:(e)=>this.setMeta(_metaP, key, e.target.value) };
    };
    const metaCards = metaShow ? [ _mkCard('recaudo', recaudoTot, '#2C6E9B', 'money'), _mkCard('operaciones', unid, accent, 'ops') ] : [];
    // Ritmo / GAP de cierres sobre la meta de operaciones (según día del mes)
    if(metaShow && metaCards[1]){
      const p=metaCards[1]; const opsTarget=_mo.operaciones||0;
      if(opsTarget>0){
        const now=new Date(); const [pm,py]=_metaP.split('.').map(Number);
        const dim=new Date(py,pm,0).getDate(); const cy=now.getFullYear(), cm=now.getMonth()+1, cd=now.getDate();
        let elapsedDays; if(py<cy||(py===cy&&pm<cm)) elapsedDays=dim; else if(py>cy||(py===cy&&pm>cm)) elapsedDays=0; else elapsedDays=cd;
        const everyN=dim/opsTarget; const expected=Math.floor(elapsedDays/everyN);
        const actualClose=nFirmadas; const gap=expected-actualClose; const remDays=Math.max(0,dim-elapsedDays);
        p.paceShow = elapsedDays>0 && elapsedDays<dim;
        p.paceEvery = '1 cierre cada ~'+(everyN>=2?Math.round(everyN):(Math.round(everyN*10)/10))+' días';
        p.paceGap = String(Math.abs(gap));
        p.paceColor = gap>0?'#B0593C':(gap<0?'#137A5B':'#8A6A1E');
        p.paceBg = gap>0?'#FBEDE8':(gap<0?'#E7F2EC':'#FBF3DF');
        p.paceMsg = gap>0?(Math.abs(gap)+' cierre'+(Math.abs(gap)===1?'':'s')+' por debajo del ritmo'):(gap<0?('Adelantado '+Math.abs(gap)+' cierre'+(Math.abs(gap)===1?'':'s')):'Al día con el ritmo');
        p.paceHint = 'Hoy deberías llevar '+expected+' · llevas '+actualClose+' cierre'+(actualClose===1?'':'s')+' · quedan '+remDays+' días';
      } else { p.paceShow=false; p.paceHint='Fija la meta de operaciones para ver el ritmo requerido'; p.paceEmpty=true; }
    }

    // --- Executive aggregation (active) ---
    const byEj={};
    active.forEach(r=>{ if(!byEj[r.ej]) byEj[r.ej]={name:r.ej, eq:r.eq, monto:0, rec:0, u:0, sales:[]}; const o=byEj[r.ej]; o.monto+=r.fin; o.rec+=r.rec; o.u++; o.sales.push(r); });
    const ejArr=Object.values(byEj);

    // --- Public ranking ---
    const rankBy=this.state.rankBy;
    const rk = rankBy==='operaciones'?'u' : rankBy==='monto'?'monto' : 'rec';
    const rankSorted=ejArr.slice().sort((a,b)=>b[rk]-a[rk]);
    const maxRk=Math.max(1,...rankSorted.map(r=>r[rk]));
    const metricFmt=(r)=> rankBy==='operaciones'? r.u+' oper.' : this.money(r[rk]);
    const ranking=rankSorted.map((r,i)=>({
      rank:i+1, name:r.name, equipo:r.eq, color:this.colorFor(r.name), initials:this.initials(r.name),
      recaudo:this.money(r.rec), unidades:String(r.u), monto:this.money(r.monto),
      pct:Math.round(r[rk]/maxRk*100)+'%',
    }));
    const podColors=['#C49A3F','#9AA1AB','#B07A4A'];
    const podium=rankSorted.slice(0,3).map((r,i)=>({
      rank:'#'+(i+1), rankColor:podColors[i], name:r.name, metric:metricFmt(r),
      sub:r.u+' oper. · '+this.money(r.rec)+' recaudado',
      color:this.colorFor(r.name), initials:this.initials(r.name),
      cardStyle:`background:${i===0?'#FBF7EC':'#F7F8FA'}; border:1px solid ${i===0?'#EBD9A8':'#EAECEF'}; border-radius:14px; padding:12px 13px;`,
    }));
    const rankBtns=[['recaudo','Recaudo'],['operaciones','Oper.'],['monto','Monto']].map(([k,l])=>({
      label:l, onClick:()=>this.setRankBy(k),
      style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:6px 12px; border-radius:7px; border:none; background:${this.state.rankBy===k?'#fff':'transparent'}; color:${this.state.rankBy===k?'#0B3D2E':'#7A828E'}; box-shadow:${this.state.rankBy===k?'0 1px 2px rgba(0,0,0,.08)':'none'};`,
    }));

    // --- Cuadro de honor (ranking combinado: puesto en recaudo + operaciones + monto) ---
    const hRankMap=(k)=>{ const s=ejArr.slice().sort((a,b)=>b[k]-a[k]); const mp={}; s.forEach((o,i)=>mp[o.name]=i+1); return mp; };
    const hR=hRankMap('rec'), hO=hRankMap('u'), hM=hRankMap('monto');
    const honorArr=ejArr.map(o=>({...o, rRec:hR[o.name], rOps:hO[o.name], rMonto:hM[o.name], score:hR[o.name]+hO[o.name]+hM[o.name]}));
    honorArr.sort((a,b)=> a.score-b.score || b.monto-a.monto);
    const hMedal=['🥇','🥈','🥉'];
    const honorTop=honorArr.map((o,i)=>({ pos:String(i+1), medal:hMedal[i]||'', name:o.name, eq:o.eq, initials:this.initials(o.name), color:this.colorFor(o.name),
      rec:this.money(o.rec), ops:String(o.u), monto:this.money(o.monto), rRec:'#'+o.rRec, rOps:'#'+o.rOps, rMonto:'#'+o.rMonto, score:String(o.score),
      isTop:i===0, rowBg:i===0?'#F1F8F4':'transparent', nameColor:i===0?'#0B3D2E':'#14171C' }));
    const ht1=honorArr[0]||null;
    const hWins=ht1?['recaudo','operaciones','monto'].filter((_,idx)=>[ht1.rRec,ht1.rOps,ht1.rMonto][idx]===1):[];
    const honorTop1Name=ht1?ht1.name:'—';
    const honorTop1Why=ht1?(hWins.length===3?('Lidera en las tres métricas — '+this.money(ht1.rec)+' recaudado, '+ht1.u+' oper. y '+this.money(ht1.monto)+' vendido.'):('Mejor puntaje combinado ('+ht1.score+' pts) entre recaudo, operaciones y monto.')):'Sin datos en el filtro actual.';
    const hLead=(o,val)=> o?{name:o.name, value:val}:{name:'—', value:'—'};
    const bestRec=ejArr.slice().sort((a,b)=>b.rec-a.rec)[0]||null;
    const bestOps=ejArr.slice().sort((a,b)=>b.u-a.u)[0]||null;
    const bestMonto=ejArr.slice().sort((a,b)=>b.monto-a.monto)[0]||null;
    const honorLeaders=[
      {label:'Top Recaudo', color:'#137A5B', bg:'#EAF5EF', ...hLead(bestRec, bestRec?this.money(bestRec.rec):'—')},
      {label:'Top Operaciones', color:'#2C6E9B', bg:'#EAF1F7', ...hLead(bestOps, bestOps?(bestOps.u+' ops'):'—')},
      {label:'Top Monto', color:'#B7862B', bg:'#FBF3DF', ...hLead(bestMonto, bestMonto?this.money(bestMonto.monto):'—')},
    ];

    // --- Alertas y narrativa automática ---
    const _alerts=[];
    const A=(tone,icon,title,msg)=>{ const map={bad:['#B0593C','#FBEDE8','#E9CFC4'],warn:['#8A6A1E','#FBF3DF','#EBD9A8'],good:['#137A5B','#E7F2EC','#BFE0CE'],info:['#2C6E9B','#EAF1F7','#CFE0EF']}; const c=map[tone]||map.info; return {icon,title,msg,color:c[0],bg:c[1],border:c[2]}; };
    if(_cur && _prev && _prev.rec>0){ const ch=(_cur.rec-_prev.rec)/_prev.rec; if(ch<=-0.1) _alerts.push(A('bad','▼','Recaudo cae '+Math.abs(ch*100).toFixed(0)+'% vs '+_prevLabel,'Pasó de '+this.money(_prev.rec)+' a '+this.money(_cur.rec)+'.')); else if(ch>=0.15) _alerts.push(A('good','▲','Recaudo crece '+(ch*100).toFixed(0)+'% vs '+_prevLabel,'Subió de '+this.money(_prev.rec)+' a '+this.money(_cur.rec)+'.')); }
    if(desist.length>0) _alerts.push(A('warn','⚠',desist.length+' desistimiento(s) en el periodo','Equivale al '+this.pct(desRate)+' de las operaciones; revisa causas y retención.'));
    if(metaShow){ const _mm=this.state.metas[_metaP]||{}; if(_mm.recaudo>0){ const r=recaudoTot/_mm.recaudo; if(r>=1) _alerts.push(A('good','🎯','Meta de recaudo cumplida','Alcanzaste '+this.money(recaudoTot)+' sobre un objetivo de '+this.money(_mm.recaudo)+'.')); else if(r<0.5) _alerts.push(A('warn','🎯','Meta de recaudo al '+Math.round(r*100)+'%','Faltan '+this.money(_mm.recaudo-recaudoTot)+' para cerrar el objetivo del mes.')); } }
    if(velAvg!=null && velAvg<=15 && nCerradas>0) _alerts.push(A('good','⚡','Cierres rápidos: '+velAvg+' días promedio','Buen ritmo comercial en '+nCerradas+' venta(s) cerrada(s).'));
    if(honorTop1Name && honorTop1Name!=='—' && unid>0) _alerts.push(A('info','🏆',honorTop1Name+' lidera el cuadro de honor',honorTop1Why));
    const alerts=_alerts.slice(0,6);

    // --- Charts (compute from base so distributions always show full context; active segment highlighted) ---
    const baseActive = base.filter(r=>r.tipo!=='Desistido');
    const rowDeco=(sel, activeVal, color)=>`margin:0 -9px 6px; padding:8px 9px; border-radius:10px; cursor:pointer; transition:background .12s,opacity .12s; opacity:${sel&&sel!==activeVal?0.4:1}; background:${sel===activeVal?color+'16':'transparent'};`;
    const tipoOrder=['Contado','Contado Fraccionado','Fraccionado','Separación','Desistido']; const tipoMap={};
    base.forEach(r=>{ if(!tipoMap[r.tipo]) tipoMap[r.tipo]={v:0,c:0}; tipoMap[r.tipo].v+=r.fin; tipoMap[r.tipo].c++; });
    const maxTipo=Math.max(1,...Object.values(tipoMap).map(t=>t.v));
    const byTipo=tipoOrder.filter(t=>tipoMap[t]).map(t=>({label:t, value:this.money(tipoMap[t].v), count:tipoMap[t].c+' ops', color:this.TIPO_COLOR[t], pct:Math.round(tipoMap[t].v/maxTipo*100)+'%', active:xfTipo===t, onClick:()=>this.setXf('Tipo',t), rowStyle:rowDeco(xfTipo,t,this.TIPO_COLOR[t])}));
    const canalMap={}; base.forEach(r=>{ const k=r.canal||'—'; canalMap[k]=(canalMap[k]||0)+1; });
    const maxCanal=Math.max(1,...Object.values(canalMap));
    const byCanal=Object.entries(canalMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({label:k, count:v+' ops', color:this.CANAL_COLOR[k]||'#7C5CC4', pct:Math.round(v/maxCanal*100)+'%', active:xfCanal===k, onClick:()=>this.setXf('Canal',k), rowStyle:rowDeco(xfCanal,k,this.CANAL_COLOR[k]||'#7C5CC4')}));

    const seedPeriods=this.state.cleared?[]:['2.2026','3.2026','4.2026','5.2026','6.2026'];
    const periodos=Array.from(new Set(seedPeriods.concat(this.allRows().map(r=>r.p)))).sort((a,b)=>this.periodSort(a,b));
    const _multiYear = new Set(periodos.map(p=>p.split('.')[1])).size>1;
    const _mLbl=(p)=> _multiYear ? (this.monthShort(p)+' '+String(p.split('.')[1]||'').slice(-2)) : this.monthShort(p);

    // --- Boletas (planilla) ---
    const _ejeNames=this.ejeNames();
    const boletaEje=(this.state.boletaEje && _ejeNames.includes(this.state.boletaEje))?this.state.boletaEje:(_ejeNames[0]||'');
    const boletaPeriodo=(this.state.boletaPeriodo && periodos.includes(this.state.boletaPeriodo))?this.state.boletaPeriodo:(periodos.length?periodos[periodos.length-1]:'');
    const boletaEjeOpts=_ejeNames.map(nm=>({v:nm,l:nm}));
    const boletaPeriodoOpts=periodos.map(p=>({v:p,l:this.monthShort(p)+' '+p.split('.')[1]}));
    const _boClosed=!!((this.state.closedPeriods||{})[boletaPeriodo]);
    let boletaVals=null;
    if(boletaEje && boletaPeriodo){
      const B=this.buildBoleta(boletaEje, boletaPeriodo);
      const _nom=this.nominaFor(boletaEje);
      const M=(n)=>this.money(n), M2=(n)=>'S/ '+ (Math.round(n*100)/100).toLocaleString('es-PE',{minimumFractionDigits:2, maximumFractionDigits:2});
      const ingresos=[
        {label:'Sueldo básico', sub:'Remuneración fija mensual', val:M2(B.basico), pos:true},
        {label:'Comisión de ventas', sub:B.comUnits+' operación(es) · pagable del periodo', val:M2(B.comision), pos:true},
      ];
      if(B.hijos) ingresos.push({label:'Asignación familiar', sub:'10% de la RMV (S/ '+this.RMV+')', val:M2(B.asigFam), pos:true});
      const desc=[];
      if(B.sistema==='AFP'){
        desc.push({label:'AFP '+B.afp+' · Aporte al fondo', sub:'10.00% de la remuneración', val:M2(B.pension.aporte)});
        desc.push({label:'AFP '+B.afp+' · Prima de seguro', sub:'1.74% (con tope asegurable)', val:M2(B.pension.prima)});
        desc.push({label:'AFP '+B.afp+' · Comisión', sub:(Math.round(B.pension.comRate*10000)/100)+'% sobre flujo', val:M2(B.pension.comAfp)});
      } else {
        desc.push({label:'ONP · Sistema Nacional de Pensiones', sub:'13.00% de la remuneración', val:M2(B.pension.aporte)});
      }
      desc.push({label:'Renta de 5ta categoría', sub:'Retención mensual (proyección anual)', val:B.renta>0.005?M2(B.renta):'—', zero:!(B.renta>0.005)});
      if(B.adelanto>0) desc.push({label:'Adelantos / préstamos', sub:'Descuento pactado', val:M2(B.adelanto)});
      boletaVals={
        boName:boletaEje, boInitials:this.initials(boletaEje), boColor:this.colorFor(boletaEje),
        boEquipo:this.equipoFor(boletaEje), boPeriodoLabel:this.monthLong(boletaPeriodo)+' '+boletaPeriodo.split('.')[1],
        boClosed:_boClosed, boSistema:B.pension.label,
        boIngresos:ingresos, boDesc:desc,
        boBruta:M2(B.bruta), boTotalDesc:M2(B.totalDesc), boNeto:M2(B.neto), boNetoRound:this.money(B.neto),
        boEssalud:M2(B.essalud),
        boRmvNote:String(this.RMV), boUitNote:this.UIT.toLocaleString('es-PE'),
        boRenta5Anual: B.r5anual>0.5 ? this.money(B.r5anual) : 'No afecto',
        boAnnual:this.money(B.annual), boAfecto: B.r5anual>0.5,
        // config
        boBasicoVal:String(_nom.basico), onBoBasico:(e)=>this.setNomina(boletaEje,{basico:Math.max(0,parseFloat(e.target.value)||0)}),
        boSistemaVal:_nom.sistema, onBoSistema:(e)=>this.setNomina(boletaEje,{sistema:e.target.value}),
        boAfpVal:_nom.afp, onBoAfp:(e)=>this.setNomina(boletaEje,{afp:e.target.value}), boIsAFP:_nom.sistema==='AFP',
        boHijos:_nom.hijos, onBoHijos:()=>this.setNomina(boletaEje,{hijos:!_nom.hijos}),
        boHijosStyle:this._segStyle(_nom.hijos,false), boSinHijosStyle:this._segStyle(!_nom.hijos,false),
        boAdelantoVal:String(_nom.adelanto||0), onBoAdelanto:(e)=>this.setNomina(boletaEje,{adelanto:Math.max(0,parseFloat(e.target.value)||0)}),
      };
    }
    const boletaEmpty=!(boletaEje && boletaPeriodo);
    const periodScope=this.state.periodo==='Todos'?periodos:[this.state.periodo];
    const trendBy=this.state.trendBy;
    const trendKey = trendBy==='recaudo'?'rec':(trendBy==='operaciones'?null:'fin');
    const perMap={}; this.allRows().filter(r=>(this.state.equipo==='Todos'||r.eq===this.state.equipo)&&r.tipo!=='Desistido').forEach(r=>{ perMap[r.p]=(perMap[r.p]||0)+(trendKey?(r[trendKey]||0):1); });
    const maxPer=Math.max(1,...periodScope.map(p=>perMap[p]||0));
    const trendFmt=(v)=> trendBy==='operaciones'? (v+' op') : this.moneyK(v);
    const byPeriodo=periodScope.map(p=>({label:_mLbl(p), value:trendFmt(perMap[p]||0), h:Math.max(4,Math.round((perMap[p]||0)/maxPer*100))+'%', color:accent}));
    const trendBtns=[['recaudo','Recaudo'],['operaciones','Oper.'],['monto','Monto']].map(([k,l])=>({ label:l, onClick:()=>this.setTrendBy(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:6px 12px; border-radius:7px; border:none; background:${trendBy===k?'#fff':'transparent'}; color:${trendBy===k?'#0B3D2E':'#7A828E'}; box-shadow:${trendBy===k?'0 1px 2px rgba(20,23,28,.08)':'none'};` }));
    const trendLabel = trendBy==='recaudo'?'Recaudo (S/)':(trendBy==='operaciones'?'N.º de operaciones':'Monto vendido (S/)');

    const etapaMap={}; baseActive.forEach(r=>{ if(!etapaMap[r.et]) etapaMap[r.et]={v:0,c:0}; etapaMap[r.et].v+=r.fin; etapaMap[r.et].c++; });
    const totEt=Object.values(etapaMap).reduce((a,t)=>a+t.c,0)||1;
    const etColors={'I':accent,'II':'#C49A3F'}, etBg={'I':'#E7F2EC','II':'#FBF3DF'}, etNames={'I':'Etapa I','II':'Etapa II'};
    const byEtapa=['I','II'].filter(e=>etapaMap[e]).map(e=>({label:e, name:etNames[e], color:etColors[e], bg:etBg[e], count:etapaMap[e].c, value:this.money(etapaMap[e].v), pctLabel:Math.round(etapaMap[e].c/totEt*100)+'%', active:xfEtapa===e, onClick:()=>this.setXf('Etapa',e), rowStyle:`display:flex; align-items:center; gap:14px; padding:13px 9px; margin:0 -9px; border-radius:11px; cursor:pointer; border-bottom:1px solid #F2F4F6; transition:background .12s,opacity .12s; opacity:${xfEtapa&&xfEtapa!==e?0.4:1}; background:${xfEtapa===e?etBg[e]:'transparent'};`}));

    // --- Health rings (tie KPIs together visually) ---
    const ring=(pct)=>{ const r=52, c=2*Math.PI*r; const p=Math.max(0,Math.min(1,pct||0)); return {circ:c.toFixed(1), off:(c*(1-p)).toFixed(1)}; };
    const visited=active.filter(r=>r.visito).length; const visitPct=unid?visited/unid:0;
    const rr=ring(recPct), er=ring(1-desRate), tr=ring(unid?nFirmadas/unid:0), vr=ring(visitPct);
    const healthRings=[
      {label:'Retención', value:this.pct(1-desRate), sub:desist.length+' desistimientos', color:accent, circ:er.circ, off:er.off},
      {label:'Cierres firmados', value:this.pct(unid?nFirmadas/unid:0), sub:nFirmadas+' de '+unid+' (excl. separación)', color:'#C49A3F', circ:tr.circ, off:tr.off},
      {label:'Visitó el proyecto', value:this.pct(visitPct), sub:visited+' de '+unid+' cerradas', color:'#7C5CC4', circ:vr.circ, off:vr.off},
    ];

    // --- Table (public, no commission) — period filter + pagination (15/page) ---
    const _tq=(this.state.tableQuery||'').toLowerCase().trim();
    const _ttipo=this.state.tableTipo, _tcanal=this.state.tableCanal;
    const tableAll = all.filter(r=> (this.state.tablePeriod==='Todos' || r.p===this.state.tablePeriod)
        && (_ttipo==='Todos' || r.tipo===_ttipo)
        && (_tcanal==='Todos' || (r.canal||'—')===_tcanal)
        && (!_tq || [r.ej, r.cli, (r.mz||'')+'-'+(r.lt||''), r.canal, r.eq, r.tipo].some(v=>String(v||'').toLowerCase().includes(_tq)))
      ).slice().sort((a,b)=>this.periodSort(b.p,a.p));
    const _tCanalOpts=Array.from(new Set(all.map(r=>r.canal||'—'))).sort();
    const tableFiltersActive = _tq!=='' || _ttipo!=='Todos' || _tcanal!=='Todos';
    const PER_PAGE=15;
    const tTotal=tableAll.length;
    const tPages=Math.max(1, Math.ceil(tTotal/PER_PAGE));
    const tPage=Math.min(this.state.tablePage, tPages-1);
    const tStart = tTotal? tPage*PER_PAGE : 0;
    const tSlice = tableAll.slice(tStart, tStart+PER_PAGE);
    const _selSet = this._selIdSet();
    const table=tSlice.map((r,i)=>{
      const gi=tStart+i; const key=r.id||('seed-'+r.p+'-'+r.mz+'-'+r.lt+'-'+gi); const dias=this.diasCierre(r); const exp=this.state.expandedRow===key;
      return {
      key, expanded:exp, chevron: exp?'▾':'▸', onToggle:()=>this.toggleRow(key),
      periodo:r.p, ejecutivo:r.ej, equipo:r.eq, cliente:r.cli||'—', lote:r.mz+'-'+r.lt, etapa:r.et,
      lista:this.money(r.lista||0), descuento:(r.desc>0?'– ':'')+this.money(r.desc||0), canal:r.canal||'—',
      final:this.money(r.fin), recaudo:this.money(r.rec), tipo:r.tipo,
      fSep:r.fSep||'—', fFirma:r.fFirma||'—', dias: dias!=null?(dias+' días'):'—', visito:r.visito?'Sí':'No', visitoColor:r.visito?'#137A5B':'#9AA1AB', visitoShort:r.visito?'Sí':'—',
      visitoOn:!!r.visito, liderOn:!!r.liderPart,
      visitaChipStyle:`cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-width:30px; padding:2px 6px; border-radius:20px; font-size:10px; font-weight:800; border:1px solid ${r.visito?'#BFE0D0':'#E2E5EA'}; background:${r.visito?'#E7F2EC':'#F7F8FA'}; color:${r.visito?'#137A5B':'#9AA1AB'};`,
      liderChipStyle:`cursor:pointer; display:inline-flex; align-items:center; justify-content:center; min-width:30px; padding:2px 6px; border-radius:20px; font-size:10px; font-weight:800; border:1px solid ${r.liderPart?'#C6DBEF':'#E2E5EA'}; background:${r.liderPart?'#EAF2FB':'#F7F8FA'}; color:${r.liderPart?'#2C6E9B':'#9AA1AB'};`,
      liderShort:r.liderPart?'Sí':'—',
      onToggleVisito:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); this.toggleFlag(r,'visito'); },
      onToggleLider:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); this.toggleFlag(r,'liderPart'); },
      selected:_selSet.has(this.selId(r)), onSelect:()=>this.toggleSel(r), onSelStop:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); },
      recaudoVal:(this.state.recDraft && this.state.recDraft[this.selId(r)]!==undefined) ? this.state.recDraft[this.selId(r)] : String(r.rec||0),
      onRecaudoStop:(e)=>{ if(e&&e.stopPropagation)e.stopPropagation(); },
      onRecaudoChange:(e)=>{ const v=e.target.value; const dk=this.selId(r); this.setState(s=>({recDraft:{...(s.recDraft||{}), [dk]:v}})); },
      onRecaudoCommit:(e)=>{ this.setRecaudo(r, e.target.value); },
      onRecaudoKey:(e)=>{ if(e.key==='Enter'){ e.target.blur(); } if(e.key==='Escape'){ const dk=this.selId(r); this.setState(s=>{ const d={...(s.recDraft||{})}; delete d[dk]; return {recDraft:d}; }); e.target.blur(); } },
      isSep:r.tipo==='Separación', fIni:r.fIni?this.fmtDate(r.fIni):'Pendiente', fIniColor:r.fIni?'#137A5B':'#C08A2E',
      modCompra:r.modCompra||'Sin definir', modCompraColor:r.modCompra?(this.TIPO_COLOR[r.modCompra]||'#14171C'):'#9AA1AB',
      isFrac:!!(this.esFrac(r.tipo) && r.cuotas && r.cuotas.length>0),
      cuotas:(r.cuotas||[]).map((c,ci)=>({num:String(ci+1), monto:this.money(c.monto||0), fecha:c.fecha||'—', estado:c.pagado?'Pagado':'Pendiente', estadoColor:c.pagado?'#137A5B':'#9AA1AB'})),
      canEdit:!!r.user, isSeed:!r.user,
      onEdit:()=>this.editSale(r.id), onRemove:()=>this.removeSale(r.id),
      tipoStyle:`display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; color:${this.TIPO_COLOR[r.tipo]}; background:${this.TIPO_COLOR[r.tipo]}1A;`,
    };});
    const _visIds = tSlice.map(r=>this.selId(r));
    const allVisSelected = _visIds.length>0 && _visIds.every(id=>_selSet.has(id));
    const selCount = _selSet.size;

    // --- Ejecutivos tab stats ---
    const ejStatSorted=ejArr.slice().sort((a,b)=>b.rec-a.rec);
    const statByName={}; ejStatSorted.forEach((r,i)=>{ statByName[r.name]={pos:i+1, rec:r.rec, u:r.u}; });
    const rawNames=new Set(this.RAW.map(r=>r.ej));
    const ejeStats=this.state.ejecutivos.map(e=>{
      const st=statByName[e.name]||{pos:'–', rec:0, u:0};
      return { pos:st.pos, posColor: st.pos===1?'#C49A3F':(st.pos===2?'#9AA1AB':(st.pos===3?'#B07A4A':'#C9CED6')),
        name:e.name, equipo:e.equipo, color:this.colorFor(e.name), initials:this.initials(e.name),
        ops:String(st.u), recaudo:this.money(st.rec),
        delStyle:`cursor:pointer; border:1px solid #ECEFF2; background:#fff; color:#C0563A; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; border-radius:8px;`,
        editStyle:`cursor:pointer; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; border-radius:8px;`,
        onDelete:()=>this.removeEje(e.name), onEdit:()=>this.startEditEje(e.name),
      };
    }).sort((a,b)=> (a.pos==='–'?999:a.pos)-(b.pos==='–'?999:b.pos));

    // --- Comisiones (private) ---
    const grupos={};
    active.forEach(s=>{ const k=s.ej+'|'+s.p; (grupos[k]=grupos[k]||{ej:s.ej,p:s.p,eq:s.eq,sales:[]}).sales.push(s); });
    const byExec={};
    Object.values(grupos).forEach(g=>{ const cfg=this.escalaFor(g.p, g.eq); const c=this.execCommission(g.sales, cfg);
      const o=byExec[g.ej]=byExec[g.ej]||{name:g.ej,units:0,monto:0,rec:0,recBase:0,gen:0,pagar:0,pend:0,vol:0,speed:0,total:0,ops:[],escLab:'—',escFlat:false,_bestU:-1};
      o.units+=c.units; o.monto+=g.sales.reduce((a,s)=>a+(s.fin||0),0); o.rec+=g.sales.reduce((a,s)=>a+(s.rec||0),0); o.recBase+=c.recBaseSum;
      o.gen+=c.generadaBase; o.pagar+=c.pagarBase; o.pend+=c.pendBase; o.vol+=c.vol; o.speed+=c.speed; o.total+=c.total;
      o.ops=o.ops.concat(c.ops);
      const _b=cfg.bounds||[2,4,6,8];
      const isFlat = cfg.mode==='flat';
      const lab = isFlat ? (Math.round((cfg.flatRate||0)*100)+'%') : (g.sales.length < _b[0] ? ('< '+_b[0]) : this.escalaLabels(_b)[this.escalaColB(g.sales.length, _b)]);
      if(g.sales.length > o._bestU){ o._bestU=g.sales.length; o.escLab=lab; o.escFlat=isFlat; } });
    const comList=Object.values(byExec).sort((a,b)=>b.total-a.total);
    const _pctI=(v)=>Math.round(v*100)+'%';
    const _mkOps=(ops, locked)=> ops.slice().sort((a,b)=>b.generada-a.generada).map(op=>{
      const isRet=op.decision==='retener', isManual=op.decision==='manual', isCompleto=op.decision==='completo';
      const payFrac=(op.payFrac!=null?op.payFrac:(isRet?op.pct:1)); const retFrac=(op.retFrac!=null?op.retFrac:(1-payFrac));
      return { lote:op.lote, tipo:op.tipo, fin:this.money(op.fin), rec:this.money(op.rec), pct:_pctI(op.pct),
        base:this.money(op.base!=null?op.base:op.fin), baseLabel:(op.esFrac?'inicial base':'precio final'),
        generada:this.money(op.generada), pagar:this.money(op.pagar), pend:op.pend>0.5?this.money(op.pend):'—',
        payPct:_pctI(payFrac), retPct: retFrac>0.005?_pctI(retFrac):'—',
        isRet, isManual, isCompleto, manualVal:(op.manualPct!=null?String(Math.round(op.manualPct)):''), pendColor: op.pend>0.5?'#B0593C':'#B6BBC3', payColor: payFrac>=0.999?'#137A5B':'#8A6A1E', locked,
        onCompleto: locked?(()=>{}):(()=>this.setRetencion(op.key,'completo')), onRetener: locked?(()=>{}):(()=>this.setRetencion(op.key,'retener')),
        onManual: locked?(()=>{}):((e)=>this.setRetencionPct(op.key, e.target.value)),
        stCompleto: this._segStyle(isCompleto, locked), stRetener: this._segStyle(isRet, locked),
        stManual: "font-family:'Space Grotesk',sans-serif; font-size:11.5px; font-weight:700; width:46px; text-align:right; padding:4px 6px; border-radius:7px; border:1px solid "+(isManual?'#0B3D2E':'#D7DBE0')+"; background:"+(isManual?'#EAF1F6':'#fff')+"; color:#14171C; "+(locked?'pointer-events:none; opacity:.6;':'') }; });
    const comRanking=comList.map((r,i)=>{ const comm=r.total>0; const pctRec = r.recBase>0 ? r.rec/r.recBase : 0; const expanded=this.state.expandedCom.includes(r.name);
      const payFrac = r.gen>0 ? r.pagar/r.gen : 1; const retFrac = 1-payFrac;
      return { rank:i+1, name:r.name, color:this.colorFor(r.name), initials:this.initials(r.name),
        units:String(r.units), monto:this.money(r.monto), rec:this.money(r.rec),
        gen:this.money(r.gen), pctRec:_pctI(pctRec), pagar:this.money(r.pagar), pend:r.pend>0.5?this.money(r.pend):'—',
        payPct:_pctI(payFrac), retPct: retFrac>0.005?_pctI(retFrac):'—', payColor: payFrac>=0.999?'#137A5B':'#8A6A1E',
        pendColor: r.pend>0.5?'#B0593C':'#B6BBC3',
        vol:r.vol>0?this.money(r.vol):'—', speed:r.speed>0?this.money(r.speed):'—', total:this.money(r.total),
        expanded, chev: expanded?'▾':'▸', onToggle:()=>this.toggleExpandCom(r.name),
        hasBonus:(r.vol>0||r.speed>0), volRaw:this.money(r.vol), speedRaw:this.money(r.speed),
        opsRows:_mkOps(r.ops, false),
        tierLabel: comm?'Comisiona':'No comisiona', tierColor: comm?'#137A5B':'#B0593C',
        escala: r.escLab, escFlat: r.escFlat, escNone: (r.escLab==='—'||/^</.test(r.escLab)),
        escBg: r.escFlat?'#EFF4EF':((r.escLab==='—'||/^</.test(r.escLab))?'#F3F0EE':'#EAF1F6'),
        escColor: r.escFlat?'#3B7A55':((r.escLab==='—'||/^</.test(r.escLab))?'#9B7B63':'#2C6E9B') }; });
    const comBaseT=comList.reduce((a,r)=>a+r.pagar,0), comVolT=comList.reduce((a,r)=>a+r.vol,0), comSpeedT=comList.reduce((a,r)=>a+r.speed,0);
    const comGenT=comList.reduce((a,r)=>a+r.gen,0), comPendT=comList.reduce((a,r)=>a+r.pend,0);

    // Si el periodo seleccionado está cerrado, la tabla lee del registro congelado (inmutable)
    const _selClosedSnap = this.state.periodo!=='Todos' ? (this.state.closedPeriods||{})[this.state.periodo] : null;
    let comRankingF=comRanking, comBaseF=comBaseT, comVolF=comVolT, comSpeedF=comSpeedT, comGenF=comGenT, comPendF=comPendT;
    const comPeriodLocked = !!_selClosedSnap;
    const comLockLabel = _selClosedSnap ? (this.monthShort(this.state.periodo)+' '+this.state.periodo.split('.')[1]+' · cifras congeladas el '+_selClosedSnap.closedAt) : '';
    if(_selClosedSnap){
      const execs=(_selClosedSnap.execs||[]).filter(r=> (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.name===this.state.asesor));
      comRankingF = execs.map((r,i)=>{ const comm=r.total>0; const escLab=r.escala||'—'; const escFlat=/%/.test(escLab);
        const gen=(r.gen!=null?r.gen:r.base), pagar=(r.pagar!=null?r.pagar:r.base), pend=(r.pend!=null?r.pend:0);
        const _rbase=(r.recBase!=null&&r.recBase>0)?r.recBase:r.monto; const pctRec = _rbase>0 ? r.rec/_rbase : 0; const expanded=this.state.expandedCom.includes(r.name);
        const payFrac = gen>0 ? pagar/gen : 1; const retFrac = 1-payFrac;
        return { rank:i+1, name:r.name, color:this.colorFor(r.name), initials:this.initials(r.name),
          units:String(r.units), monto:this.money(r.monto), rec:this.money(r.rec),
          gen:this.money(gen), pctRec:_pctI(pctRec), pagar:this.money(pagar), pend:pend>0.5?this.money(pend):'—',
          payPct:_pctI(payFrac), retPct: retFrac>0.005?_pctI(retFrac):'—', payColor: payFrac>=0.999?'#137A5B':'#8A6A1E',
          pendColor: pend>0.5?'#B0593C':'#B6BBC3',
          vol:r.vol>0?this.money(r.vol):'—', speed:r.speed>0?this.money(r.speed):'—', total:this.money(r.total),
          expanded, chev: expanded?'▾':'▸', onToggle:()=>this.toggleExpandCom(r.name),
          hasBonus:(r.vol>0||r.speed>0), volRaw:this.money(r.vol), speedRaw:this.money(r.speed),
          opsRows:_mkOps(r.ops||[], true),
          tierLabel: comm?'Comisiona':'No comisiona', tierColor: comm?'#137A5B':'#B0593C',
          escala:escLab, escFlat, escNone:(escLab==='—'||/^</.test(escLab)),
          escBg: escFlat?'#EFF4EF':((escLab==='—'||/^</.test(escLab))?'#F3F0EE':'#EAF1F6'),
          escColor: escFlat?'#3B7A55':((escLab==='—'||/^</.test(escLab))?'#9B7B63':'#2C6E9B') }; });
      comBaseF=execs.reduce((a,e)=>a+(e.pagar!=null?e.pagar:e.base),0); comVolF=execs.reduce((a,e)=>a+e.vol,0); comSpeedF=execs.reduce((a,e)=>a+e.speed,0);
      comGenF=execs.reduce((a,e)=>a+(e.gen!=null?e.gen:e.base),0); comPendF=execs.reduce((a,e)=>a+(e.pend!=null?e.pend:0),0);
    }

    // --- Proyección por ejecutivo: "cuánto falta para el siguiente nivel" (periodo específico) ---
    const projP = this.state.periodo!=='Todos' ? this.state.periodo : (periodos.length?periodos[periodos.length-1]:null);
    const projPeriodLabel = projP ? (this.monthShort(projP)+' '+projP.split('.')[1]) : '—';
    const projIsAgg = this.state.periodo==='Todos';
    const projGroups={};
    (projP?this.allRows():[]).filter(r=> r.p===projP && r.tipo!=='Desistido' && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor))
      .forEach(s=>{ (projGroups[s.ej]=projGroups[s.ej]||{ej:s.ej,eq:s.eq,sales:[]}).sales.push(s); });
    const comProjection = Object.values(projGroups).map(g=>{
      const cfg=this.escalaFor(projP, g.eq); const ns=this.nextStepFor(g.sales, cfg); const isFlat=cfg.mode==='flat';
      const _b=cfg.bounds||[2,4,6,8];
      const curLabel = isFlat ? ('Tarifa '+Math.round((cfg.flatRate||0)*100)+'%') : (ns.units<_b[0] ? 'Aún no comisiona' : this.escalaLabels(_b)[this.escalaColB(ns.units,_b)]);
      const steps = ns.steps.map(s=>({ txt:'Faltan '+s.gap+' venta'+(s.gap===1?'':'s')+' para '+s.label, reward:'+'+this.money(Math.max(0,s.reward)),
        color: s.kind==='bono'?'#8A6A1E':(s.kind==='unlock'?'#B0593C':'#2C6E9B'), bg: s.kind==='bono'?'#FBF3DF':(s.kind==='unlock'?'#FBEDE8':'#EAF1F6'), border: s.kind==='bono'?'#EBD9A8':(s.kind==='unlock'?'#E9CFC4':'#CFE0EF') }));
      const potential = ns.cur.total + ns.steps.reduce((a,s)=>a+Math.max(0,s.reward),0);
      return { name:g.ej, initials:this.initials(g.ej), color:this.colorFor(g.ej), eq:g.eq,
        unitsNow:String(ns.units), curLabel, comNow:this.money(ns.cur.total),
        steps, hasSteps:steps.length>0, maxed:!isFlat && ns.units>=_b[0] && steps.length===0, isFlat,
        potential:this.money(potential), showPotential: potential>ns.cur.total+0.5, _sort:ns.cur.total };
    }).sort((a,b)=>b._sort-a._sort);
    const hasProjection = comProjection.length>0;

    // --- Cierre de periodo (registro inmutable) ---
    const _cp=this.state.closedPeriods||{};
    const selP2=this.state.periodo;
    const selClosable = selP2!=='Todos';
    const selClosedObj = selClosable ? _cp[selP2] : null;
    const closeSelLabel = selClosable ? (this.monthShort(selP2)+' '+selP2.split('.')[1]) : '';
    const closedList=Object.keys(_cp).sort((a,b)=>this.periodSort(b,a)).map(p=>({ p, label:this.monthShort(p)+' '+p.split('.')[1], closedAt:_cp[p].closedAt, total:this.money(_cp[p].total), execCount:String(_cp[p].execCount), onReopen:()=>this.reopenPeriod(p) }));

    // --- Comisión del Líder de equipo (por periodo, 2 niveles) ---
    const liderEP=this.state.liderEditPeriod;
    const liderScope = liderEP==='base' ? active : active.filter(s=>s.p===liderEP);
    const liderPeriodOpts=[{v:'base',l:'Base · todos los periodos'}].concat(periodos.map(p=>({v:p, l:this.monthShort(p)+' '+p.split('.')[1]+(((this.state.liderPolicy.lider.byPeriod||{})[p]||(this.state.liderPolicy.super.byPeriod||{})[p])?' ✓':'')})));
    const liderScopeLabel = liderEP==='base' ? 'Aplica a todos los meses sin regla propia' : ('Regla y cálculo solo para '+this.monthShort(liderEP)+' '+liderEP.split('.')[1]);
    const buildLevel=(level, palette)=>{
      const r=this.computeLider(level, liderScope);
      const cur = liderEP==='base' ? this.state.liderPolicy[level].base : this.liderFor(level, liderEP);
      const isOvr = liderEP!=='base' && !!(this.state.liderPolicy[level].byPeriod||{})[liderEP];
      const mkRow=(team,label,color,pctKey,minKey,nameKey,units,base,com,pol)=>{
        const min=pol[minKey]||0; const meets=units>=min;
        return { team, label, color, name: nameKey?(cur[nameKey]||''):'', hasName:!!nameKey,
          pct:Math.round((cur[pctKey]||0)*1000)/10, minU:String(min), units:String(units),
          meets, statusLabel: meets ? (min>0?('cumple mín · '+min):'sin mínimo') : ('bajo el mínimo ('+units+'/'+min+')'),
          statusColor: meets?'#137A5B':'#B0593C',
          montoBase:this.money(base), comision:this.money(meets?com:0), comZero:!meets,
          onName: nameKey?((e)=>this.setLiderField(level,nameKey,e.target.value)):null,
          onPct:(e)=>this.setLiderField(level,pctKey,(parseFloat(e.target.value)||0)/100),
          onMin:(e)=>this.setLiderField(level,minKey,Math.max(0,parseInt(e.target.value)||0)) };
      };
      const pol=cur;
      const rows=[
        mkRow('interno','Equipo Interno','#0B3D2E','interno','minI', level==='lider'?'nameI':null, r.uI, r.baseI, r.comI, pol),
        mkRow('externo','Equipo Externo','#C49A3F','externo','minE', level==='lider'?'nameE':null, r.uE, r.baseE, r.comE, pol),
      ];
      return { rows, total:this.money(r.total), reqPart:!!cur.reqPart,
        onReqPart:(e)=>this.setLiderField(level,'reqPart',e.target.checked),
        isOverride:isOvr, superName: level==='super'?(cur.name||''):'', onSuperName:(e)=>this.setLiderField('super','name',e.target.value) };
    };
    const liderLvl = buildLevel('lider');
    const superLvl = buildLevel('super');
    const superActivo = !!this.state.liderPolicy.super.activo;
    const liderNote = 'El líder comisiona un % del Precio Final de las ventas de cada equipo. Usa el mínimo de unidades para que un equipo solo cuente si alcanza ese volumen, y "requiere participación" para comisionar solo las ventas marcadas con su participación.';

    const editCfg=this.getEditCfg();
    const effCfg=this.effEditCfg();
    const editBounds=editCfg.bounds||[2,4,6,8];
    const escGrid='1.3fr repeat('+editBounds.length+',1fr)';
    const escHeads=this.escalaLabels(editBounds);
    const boundsView=editBounds.map((b,i)=>({ val:b, onChange:(e)=>this.updateBound(i, parseInt(e.target.value)||0) }));
    const matrixRows=this.BANDS.map(b=>({
      label:b.label,
      cells:editBounds.map((bd,col)=>({ pct:Math.round(((editCfg.matrix[b.key]||[])[col]||0)*1000)/10, onChange:(e)=>this.updateMatrix(b.key,col,(parseFloat(e.target.value)||0)/100) })),
    }));
    const editIsFlat=editCfg.mode==='flat'; const editIsMatrix=!editIsFlat;
    const flatRate={ pct:Math.round((editCfg.flatRate||0)*1000)/10, onChange:(e)=>this.updateFlatRate((parseFloat(e.target.value)||0)/100) };
    const modeBtns=[['flat','Tarifa única'],['matrix','Por escalas']].map(([k,l])=>({label:l, onClick:()=>this.updateMode(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:6px 12px; border-radius:7px; border:none; background:${editCfg.mode===k?'#0B3D2E':'transparent'}; color:${editCfg.mode===k?'#fff':'#7A828E'};`}));
    const volBonosView=effCfg.volBonos.map((b,i)=>({
      ventas:b.ventas, monto:b.monto,
      onVentas:(e)=>this.updateVolBono(i,'ventas',parseInt(e.target.value)||0),
      onMonto:(e)=>this.updateVolBono(i,'monto',parseFloat(e.target.value)||0),
      onRemove:()=>this.removeVolBono(i),
    }));
    const speedBonosView=effCfg.speedBonos.map((b,i)=>({
      dias:b.dias, monto:b.monto,
      onDias:(e)=>this.updateSpeedBono(i,'dias',parseInt(e.target.value)||0),
      onMonto:(e)=>this.updateSpeedBono(i,'monto',parseFloat(e.target.value)||0),
      onRemove:()=>this.removeSpeedBono(i),
    }));
    const allMonths=[]; for(let y=2025;y<=2027;y++){ for(let mm=1;mm<=12;mm++){ allMonths.push(mm+'.'+y); } }
    const ovr=(p)=> this.state.escalasByPeriod[p] && this.state.escalasByPeriod[p][this.state.editTeam];
    const editPeriodOpts=[{v:'base',l:'Base · todos los periodos'}].concat(allMonths.map(p=>({v:p,l:this.monthShort(p)+' '+p.split('.')[1]+(ovr(p)?' ✓':'')})));
    const editIsOverride=this.state.editPeriod!=='base' && !!ovr(this.state.editPeriod);
    const editTeamBtns=[['interno','Interno'],['externo','Externo']].map(([k,l])=>({label:l, onClick:()=>this.setEditTeam(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:6px 14px; border-radius:7px; border:none; background:${this.state.editTeam===k?'#0B3D2E':'transparent'}; color:${this.state.editTeam===k?'#fff':'#7A828E'};`}));

    // --- Historial de ubicaciones ---
    const _ubiAll=this.buildUbicaciones();
    const _uq=(this.state.ubiQuery||'').toUpperCase().trim();
    const _ust=this.state.ubiSort, _uest=this.state.ubiEstado;
    let ubiRows=_ubiAll.filter(u=> (_uest==='Todos'||u.estado===_uest) && (!_uq || u.key.toUpperCase().includes(_uq) || (u.holder||'').toUpperCase().includes(_uq) || (u.holderEj||'').toUpperCase().includes(_uq)));
    ubiRows.sort((a,b)=> _ust==='tiempo' ? (b.tiempoN-a.tiempoN) : (_ust==='liberada' ? (b.liberada-a.liberada) : (b.veces-a.veces || b.tiempoN-a.tiempoN)));
    const _ubiExp=this.state.expandedUbi;
    const ubiList=ubiRows.map(u=>({ ...u, expanded:_ubiExp===u.key, chevron:_ubiExp===u.key?'▾':'▸', onToggle:()=>this.toggleUbi(u.key),
      estadoChip:`display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:10.5px; font-weight:800; color:#fff; background:${u.estadoColor};`,
      vecesLbl:String(u.veces), liberadaLbl:u.liberada>0?String(u.liberada):'—', vendidaLbl:u.vendida>0?String(u.vendida):'—',
      liberadaColor:u.liberada>0?'#D26A4C':'#C9CED6', vendidaColor:u.vendida>0?'#137A5B':'#C9CED6' }));
    const ubiEmpty=ubiList.length===0;
    const ubiKpis=[
      {label:'Ubicaciones', value:String(_ubiAll.length), color:'#2C6E9B', sub:'con movimiento registrado'},
      {label:'Separadas hoy', value:String(_ubiAll.filter(u=>u.estado==='Separada').length), color:'#2C6E9B', sub:'esperando completar inicial'},
      {label:'Vendidas', value:String(_ubiAll.filter(u=>u.estado==='Vendida').length), color:'#137A5B', sub:'cierre firme'},
      {label:'Liberaciones', value:String(_ubiAll.reduce((a,u)=>a+u.liberada,0)), color:'#D26A4C', sub:'desistimientos acumulados'},
    ];
    const ubiSortBtns=[['movs','Más movimientos'],['tiempo','Más tiempo'],['liberada','Más liberadas']].map(([k,l])=>({label:l, onClick:()=>this.setUbiSort(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:7px 13px; border-radius:8px; border:none; background:${_ust===k?'#fff':'transparent'}; color:${_ust===k?'#0B3D2E':'#7A828E'}; box-shadow:${_ust===k?'0 1px 2px rgba(20,23,28,.08)':'none'};`}));
    const ubiEstadoBtns=['Todos','Separada','Vendida','Libre'].map(k=>({label:k, onClick:()=>this.setUbiEstado(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12px; font-weight:700; padding:7px 13px; border-radius:8px; border:1px solid ${_uest===k?'#0B3D2E':'#D7DBE0'}; background:${_uest===k?'#0B3D2E':'#fff'}; color:${_uest===k?'#fff':'#475063'};`}));

    // --- Tabs / chrome (agrupados por categoría) ---
    const tabs=[['tablero','Tablero'],['operaciones','Operaciones'],['ubicaciones','Ubicaciones'],['cuotas','Iniciales'],['ejecutivos','Ejecutivos'],['descuentos','Descuentos'],['captacion','Captación & Ads'],['comisiones','Comisiones 🔒'],['boletas','Boletas 🔒']];
    const tabLabel=Object.fromEntries(tabs);
    const navDefs=[
      {id:'resumen', label:'Resumen', tabs:['tablero']},
      {id:'ventas', label:'Ventas & Iniciales', tabs:['operaciones','ubicaciones','cuotas']},
      {id:'equipo', label:'Equipo', tabs:['ejecutivos','comisiones','boletas']},
      {id:'comercial', label:'Comercial', tabs:['descuentos','captacion']},
    ];
    const curTab=this.state.tab, openMenu=this.state.openMenu;
    const navGroups=navDefs.map(g=>{
      const active=g.tabs.includes(curTab);
      const single=g.tabs.length===1;
      const open=openMenu===g.id;
      const gLabel = single ? tabLabel[g.tabs[0]] : g.label;
      return {
        id:g.id, label:gLabel, hasMenu:!single, isOpen:open, caret: single?'':(open?'▴':'▾'),
        onClick: single ? (()=>this.selectTab(g.tabs[0])) : (()=>this.toggleMenu(g.id)),
        style:`font-family:'Manrope',sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; padding:8px 15px; border-radius:9px; border:none; background:${active?'#0B3D2E':'transparent'}; color:${active?'#fff':'#5B6470'};`,
        items:g.tabs.map(k=>({ label:tabLabel[k], onClick:()=>this.selectTab(k),
          style:`font-family:'Manrope',sans-serif; cursor:pointer; display:block; width:100%; text-align:left; white-space:nowrap; font-size:13px; font-weight:${curTab===k?'800':'600'}; padding:9px 14px; border-radius:8px; border:none; background:${curTab===k?'#E7F2EC':'transparent'}; color:${curTab===k?'#0B3D2E':'#475063'};` })),
      };
    });
    const navMenuOpen=!!openMenu;
    // --- Sidebar navigation (todas las secciones a la vista) ---
    const _navSecDefs=[
      {group:'Resumen', items:['tablero']},
      {group:'Ventas', items:['operaciones','ubicaciones','cuotas']},
      {group:'Equipo', items:['ejecutivos','comisiones','boletas']},
      {group:'Comercial', items:['descuentos','captacion']},
    ];
    const navSections=_navSecDefs.map(s=>({ group:s.group, items:s.items.map(k=>{ const on=curTab===k; return {
      label:tabLabel[k], onClick:()=>this.selectTab(k),
      style:`font-family:'Manrope',sans-serif; cursor:pointer; display:block; width:100%; text-align:left; font-size:13px; font-weight:${on?'800':'600'}; padding:9px 12px; border-radius:9px; border:none; background:${on?'#137A5B':'transparent'}; color:${on?'#fff':'#B7CFC4'}; margin-bottom:2px; transition:background .12s;` };
    }) }));
    const curSectionTitle=tabLabel[curTab]||'Tablero';
    const _secSubs={ tablero:'Resumen comercial y avance a la fecha', operaciones:'Detalle de todas las ventas registradas', ubicaciones:'Trayectoria de cada lote', cuotas:'Iniciales y separaciones por cobrar', ejecutivos:'Desempeño del equipo de ventas', descuentos:'Política y control de descuentos', captacion:'Eficiencia de leads y Meta Ads', comisiones:'Cálculo de comisiones (privado)', boletas:'Planilla y boletas (privado)' };
    const curSectionSub=_secSubs[curTab]||'';

    // --- Avance a la fecha (acumulado del periodo seleccionado) ---
    const _scope=this.filtered();
    const _pk=this.state.periodo;
    const _cerr=_scope.filter(r=>r.tipo!=='Desistido' && r.tipo!=='Separación');
    const _cerrMonto=_cerr.reduce((a,r)=>a+(r.fin||0),0);
    const _recTot=_cerr.reduce((a,r)=>a+(r.rec||0),0);
    const _sep=_scope.filter(r=>r.tipo==='Separación');
    const _leadsN=(this.state.leadsHoy||{})[_pk];
    const avanceLabel = _pk==='Todos' ? 'Acumulado · todos los periodos' : (this.monthLong(_pk)+' '+_pk.split('.')[1]);
    const avanceCards=[
      {label:'Ventas a la fecha', value:String(_cerr.length), sub:_cerr.length?this.money(_cerrMonto)+' vendido':'sin ventas aún', color:'#137A5B', notLeads:true},
      {label:'Recaudo acumulado', value:this.money(_recTot), sub:_cerrMonto?this.pct(_recTot/_cerrMonto)+' del monto':'—', color:'#2C6E9B', notLeads:true},
      {label:'Separaciones activas', value:String(_sep.length), sub:'reservas en el periodo', color:'#C49A3F', notLeads:true},
      {label:'Leads del periodo', value:(_leadsN!=null?String(_leadsN):'—'), sub:'ingreso manual', color:'#7C5CC4', isLeads:true, notLeads:false},
    ];
    const leadsHoyVal=(_leadsN!=null?String(_leadsN):'');
    const chip=(on)=>`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:7px 13px; border-radius:9px; border:1px solid ${on?'#0B3D2E':'#D7DBE0'}; background:${on?'#0B3D2E':'#fff'}; color:${on?'#fff':'#475063'};`;
    const periodChips=[{k:'Todos',l:'Todos'}].concat(periodos.map(p=>({k:p,l:_mLbl(p)}))).map(o=>({label:o.l, active:this.state.periodo===o.k, style:chip(this.state.periodo===o.k), onClick:()=>this.setPeriodo(o.k)}));
    const teamChips=['Todos','E. Interno','E. Externo'].map(t=>({label:t==='Todos'?'Todos los equipos':t, active:this.state.equipo===t, style:chip(this.state.equipo===t), onClick:()=>this.setEquipo(t)}));

    // --- Form ---
    const f=this.state.form; const fLista=parseFloat(f.lista)||0, fDesc=parseFloat(f.desc)||0, fFin=Math.max(0,fLista-fDesc);
    const mk=(k)=>(e)=>this.updateField(k,e.target.value);
    const fh={ periodo:mk('periodo'), ejecutivo:mk('ejecutivo'), equipo:mk('equipo'), cliente:mk('cliente'), etapa:mk('etapa'), mz:mk('mz'), lt:mk('lt'), lista:mk('lista'), desc:mk('desc'), recaudo:mk('recaudo'), tipo:mk('tipo'), canal:mk('canal'), fSep:mk('fSep'), fFirma:mk('fFirma'), fIni:mk('fIni'), modCompra:mk('modCompra'), iniContratada:mk('iniContratada'), visito:(e)=>this.updateField('visito',e.target.checked), liderPart:(e)=>this.updateField('liderPart',e.target.checked), superPart:(e)=>this.updateField('superPart',e.target.checked), submit:()=>this.addSale() };
    const cuotasView=(f.cuotas||[]).map((c,i)=>({ num:String(i+1), monto:c.monto, fecha:c.fecha, pagado:!!c.pagado, pagadoLabel: c.pagado?'Pagado':'Pendiente', pagadoColor: c.pagado?'#137A5B':'#9AA1AB', pagadoBg: c.pagado?'#EAF5EF':'#fff', pagadoBorder: c.pagado?'#9CC7B4':'#CDE7DB', onMonto:(e)=>this.updateCuota(i,'monto',e.target.value), onFecha:(e)=>this.updateCuota(i,'fecha',e.target.value), onToggle:(e)=>this.updateCuota(i,'pagado',e.target.checked), onRemove:()=>this.removeCuota(i) }));
    const cuotasSumN=(f.cuotas||[]).reduce((a,c)=>a+(c.pagado?(parseFloat(c.monto)||0):0),0);
    const cuotasPendN=(f.cuotas||[]).reduce((a,c)=>a+(!c.pagado?(parseFloat(c.monto)||0):0),0);
    const iniContratadaN=parseFloat(f.iniContratada)||0;
    const diasForm=this.diasCierre(f);
    const periodOpts=[]; for(let y=2025;y<=2027;y++){ for(let m=1;m<=12;m++){ periodOpts.push({v:m+'.'+y, l:this.monthShort(m+'.'+y)+' '+y}); } }
    const ejeOpts=this.state.ejecutivos.map(e=>({v:e.name, l:e.name}));
    const asesorNames=Array.from(new Set(this.allRows().filter(r=>this.state.equipo==='Todos'||r.eq===this.state.equipo).map(r=>r.ej).concat(this.state.ejecutivos.filter(e=>this.state.equipo==='Todos'||e.equipo===this.state.equipo).map(e=>e.name)))).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    const asesorOpts=asesorNames.map(n=>({v:n, l:n}));
    const userSalesList=this.state.userSales.slice().reverse().map(r=>({periodo:r.p, ejecutivo:r.ej, lote:r.mz+'-'+r.lt, final:this.money(r.fin), tipo:r.tipo, frac:(this.esFrac(r.tipo)&&r.cuotas&&r.cuotas.length)?('Inicial recaudada '+this.money(r.cuotas.reduce((a,c)=>a+(c.pagado?(c.monto||0):0),0))+(r.iniContratada?(' / '+this.money(r.iniContratada)):''))+' · '+r.cuotas.length+' cuotas':'', editing:r.id===this.state.editingId, editLabel:r.id===this.state.editingId?'Editando…':'Editar', editStyle:`cursor:pointer; border:none; background:none; color:${r.id===this.state.editingId?'#C49A3F':'#137A5B'}; font-size:13px; font-weight:700; font-family:'Manrope',sans-serif;`, onEdit:()=>this.editSale(r.id), onDelete:()=>this.removeSale(r.id)}));

    const nh={ name:(e)=>this.updateNewEj('name',e.target.value), equipo:(e)=>this.updateNewEj('equipo',e.target.value), add:()=>this.addEje() };

    const footerNote=this.state.periodo==='Todos' ? (periodos.length+' periodos · '+this.state.userSales.length+' ventas registradas por ti') : ('Periodo '+this.monthShort(this.state.periodo));

    // --- Captación & Meta Ads (eficiencia de leads) ---
    const lp = this.state.leadsPeriod || (periodos.length?periodos[periodos.length-1]:'6.2026');
    const internos = this.state.ejecutivos.filter(e=>e.equipo==='E. Interno');
    const adsActive = this.allRows().filter(r=> r.p===lp && r.eq==='E. Interno' && r.tipo!=='Desistido');
    const adsSalesByName={}; adsActive.forEach(r=>{ const o=adsSalesByName[r.ej]=adsSalesByName[r.ej]||{u:0,monto:0}; o.u++; o.monto+=r.fin; });
    const adsInv = parseFloat(this.state.metaAds[lp])||0;
    const adsLeadsMap = this.state.leads[lp]||{};
    const adsTotalLeads = internos.reduce((a,e)=>a+(parseFloat(adsLeadsMap[e.name])||0),0);
    const adsTotalVentas = adsActive.length;
    const adsTotalMonto = adsActive.reduce((a,r)=>a+r.fin,0);
    const target = parseFloat(this.state.targetCPA)||0;
    const cplG = adsTotalLeads>0 ? adsInv/adsTotalLeads : 0;
    const cpaG = adsTotalVentas>0 ? adsInv/adsTotalVentas : 0;
    const convG = adsTotalLeads>0 ? adsTotalVentas/adsTotalLeads : 0;
    const roasG = adsInv>0 ? adsTotalMonto/adsInv : 0;
    const maxLeads = Math.max(1, ...internos.map(e=>parseFloat(adsLeadsMap[e.name])||0));
    const adsRows = internos.map(e=>{
      const leads=parseFloat(adsLeadsMap[e.name])||0;
      const st=adsSalesByName[e.name]||{u:0,monto:0};
      const ventas=st.u, monto=st.monto;
      const conv= leads>0 ? ventas/leads : 0;
      const adCost= adsTotalLeads>0 ? adsInv*(leads/adsTotalLeads) : 0;
      const cpa= ventas>0 ? adCost/ventas : 0;
      let vLabel,vColor,vBg;
      if(leads<=0){ vLabel='Sin leads'; vColor='#9AA1AB'; vBg='#F2F4F6'; }
      else if(ventas===0){ vLabel='Sin ventas'; vColor='#D26A4C'; vBg='#FBEDE8'; }
      else if(target>0 && cpa<=target){ vLabel='Eficiente'; vColor='#137A5B'; vBg='#E7F2EC'; }
      else if(target>0 && cpa<=target*1.5){ vLabel='Regular'; vColor='#C49A3F'; vBg='#FBF3DF'; }
      else if(target>0){ vLabel='Costoso'; vColor='#D26A4C'; vBg='#FBEDE8'; }
      else { vLabel='—'; vColor='#9AA1AB'; vBg='#F2F4F6'; }
      return { name:e.name, initials:this.initials(e.name), color:this.colorFor(e.name),
        leadsVal: leads||'', onLeads:(ev)=>this.setLeadCount(lp,e.name,ev.target.value),
        ventas:String(ventas), conv:this.pct(conv), cpa: ventas>0?this.money(cpa):'—',
        vLabel, vBadge:`display:inline-block; padding:4px 11px; border-radius:20px; font-size:11.5px; font-weight:700; color:${vColor}; background:${vBg};` };
    });
    const adsKpis=[
      {label:'Inversión Meta Ads', color:'#2C6E9B', value:this.money(adsInv), sub:this.monthShort(lp)+' '+lp.split('.')[1]},
      {label:'Leads Asignados', color:accent, value:String(adsTotalLeads), sub:internos.length+' asesores internos'},
      {label:'Costo por Lead', color:'#7C5CC4', value: adsTotalLeads>0?this.money(cplG):'—', sub:'CPL'},
      {label:'Ventas Atribuidas', color:'#1F9E8A', value:String(adsTotalVentas), sub:this.money(adsTotalMonto)},
      {label:'Costo por Venta', color:'#C49A3F', value: adsTotalVentas>0?this.money(cpaG):'—', sub: target>0?('objetivo '+this.money(target)):'define un objetivo'},
      {label:'Conversión', color:'#137A5B', value:this.pct(convG), sub:'lead → venta'},
    ];
    let vbLabel,vbColor,vbBg,vbBorder,vbIcon,vbMsg;
    if(adsInv<=0 || adsTotalLeads<=0){ vbLabel='Faltan datos'; vbColor='#7A828E'; vbBg='#F7F8FA'; vbBorder='#E6E8EC'; vbIcon='•'; vbMsg='Ingresa la inversión de Meta Ads y los leads asignados por asesor para evaluar la eficiencia del periodo.'; }
    else if(adsTotalVentas===0){ vbLabel='Campaña sin retorno'; vbColor='#B0593C'; vbBg='#FBEDE8'; vbBorder='#E9CFC4'; vbIcon='✕'; vbMsg='Se invirtió '+this.money(adsInv)+' en '+adsTotalLeads+' leads pero no hay ventas atribuidas en el periodo.'; }
    else if(target>0 && cpaG<=target){ vbLabel='Campaña eficiente'; vbColor='#0B5C3F'; vbBg='#E7F2EC'; vbBorder='#BFD9CC'; vbIcon='✓'; vbMsg='Costo por venta de '+this.money(cpaG)+', por debajo del objetivo de '+this.money(target)+'. Conversión '+this.pct(convG)+' · retorno '+roasG.toFixed(1)+'x.'; }
    else if(target>0 && cpaG<=target*1.5){ vbLabel='Eficiencia regular'; vbColor='#8A6A1E'; vbBg='#FBF3DF'; vbBorder='#EBD9A8'; vbIcon='≈'; vbMsg='Costo por venta de '+this.money(cpaG)+', algo por encima del objetivo de '+this.money(target)+'. Conversión '+this.pct(convG)+' · retorno '+roasG.toFixed(1)+'x.'; }
    else { vbLabel='Campaña costosa'; vbColor='#B0593C'; vbBg='#FBEDE8'; vbBorder='#E9CFC4'; vbIcon='✕'; vbMsg='Costo por venta de '+this.money(cpaG)+', muy por encima del objetivo de '+this.money(target)+'. Conversión '+this.pct(convG)+' · retorno '+roasG.toFixed(1)+'x.'; }
    const leadsPeriodOpts=periodos.map(p=>({v:p, l:this.monthShort(p)+' '+p.split('.')[1]}));

    // --- Descuentos (política + eficiencia por ejecutivo) ---
    const descMode=this.state.descMode;
    const descActive = active.filter(r=> r.eq!=='E. Externo' && (descMode==='contado' ? r.tipo==='Contado' : (descMode==='financiado' ? r.tipo!=='Contado' : true)));
    const baseC=this.state.descPolicy.base.contado, baseF=this.state.descPolicy.base.frac;
    const descModeBtns=[['todos','Todos'],['contado','Contado'],['financiado','Financiado']].map(([k,l])=>({ label:l, onClick:()=>this.setDescMode(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:7px 15px; border-radius:8px; border:none; background:${descMode===k?'#fff':'transparent'}; color:${descMode===k?'#0B3D2E':'#7A828E'}; box-shadow:${descMode===k?'0 1px 2px rgba(20,23,28,.08)':'none'};` }));
    const descModeNote = descMode==='contado' ? ('Solo ventas al contado · tope base S/ '+baseC+' por operación.') : (descMode==='financiado' ? ('Solo ventas financiadas — fraccionado y separación · tope base S/ '+baseF+' por operación.') : ('Contado y financiado tienen topes distintos (Contado S/ '+baseC+' · Financiado S/ '+baseF+'). El promedio combinado mezcla dos políticas: compara el % Lista dentro de cada modalidad.'));
    const descByEj={};
    descActive.forEach(r=>{
      const o=descByEj[r.ej]=descByEj[r.ej]||{name:r.ej, eq:r.eq, ops:0, desc:0, lista:0, exc:0, exceso:0};
      o.ops++; o.desc+=(r.desc||0); o.lista+=(r.lista||0);
      const mx=this.descMaxFor(r.tipo, r.p);
      if((r.desc||0) > mx){ o.exc++; o.exceso += (r.desc - mx); }
    });
    const descArrAll=Object.values(descByEj);
    const dTotal=descArrAll.reduce((a,o)=>a+o.desc,0);
    const dLista=descArrAll.reduce((a,o)=>a+o.lista,0);
    const dOps=descArrAll.reduce((a,o)=>a+o.ops,0);
    const dExcCount=descArrAll.reduce((a,o)=>a+o.exc,0);
    const dExcMonto=descArrAll.reduce((a,o)=>a+o.exceso,0);
    const descKpis=[
      {label:'Descuento Otorgado', color:'#7C5CC4', value:this.money(dTotal), sub:dOps+' operaciones'},
      {label:'Descuento Promedio', color:'#2C6E9B', value:this.money(dOps?dTotal/dOps:0), sub:this.pct(dLista?dTotal/dLista:0)+' del precio lista'},
      {label:'Excepciones', color:'#D26A4C', value:String(dExcCount), sub:'ventas sobre el tope'},
      {label:'Monto en Exceso', color:'#C0563A', value:this.money(dExcMonto), sub:'sobre el límite permitido'},
    ];
    const descSorted=descArrAll.map(o=>({ ...o, avgN:o.ops?o.desc/o.ops:0 })).sort((a,b)=>b.avgN-a.avgN);
    const descRows=descSorted.map((o,i)=>{
      let tag='', tagStyle='';
      if(descSorted.length>=2 && i===0){ tag='Más descuento'; tagStyle='color:#B0593C; background:#FBEDE8;'; }
      else if(descSorted.length>=2 && i===descSorted.length-1){ tag='Más conservador'; tagStyle='color:#0B5C3F; background:#E7F2EC;'; }
      return { name:o.name, initials:this.initials(o.name), color:this.colorFor(o.name), equipo:o.eq,
        ops:String(o.ops), descTotal:this.money(o.desc), descAvg:this.money(o.avgN), pct:this.pct(o.lista?o.desc/o.lista:0),
        excLabel:o.exc>0?String(o.exc):'—', excStyle:`text-align:center; font-size:13px; font-weight:${o.exc>0?'800':'700'}; color:${o.exc>0?'#B0593C':'#C9CED6'};`,
        tag, tagShow:!!tag, tagBadge:`display:inline-block; flex-shrink:0; padding:2px 7px; border-radius:20px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.03em; white-space:nowrap; ${tagStyle}` };
    });
    const excList=descActive.filter(r=>(r.desc||0)>this.descMaxFor(r.tipo,r.p))
      .map(r=>{ const mx=this.descMaxFor(r.tipo,r.p); return { ej:r.ej, initials:this.initials(r.ej), color:this.colorFor(r.ej),
        lote:r.mz+'-'+r.lt, cliente:r.cli||'—', tipo:r.tipo, periodo:this.monthShort(r.p)+' '+String(r.p).split('.')[1],
        desc:this.money(r.desc), max:this.money(mx), exceso:this.money(r.desc-mx), excesoN:r.desc-mx,
        tipoStyle:`display:inline-block; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:700; color:${this.TIPO_COLOR[r.tipo]}; background:${this.TIPO_COLOR[r.tipo]}1A;` }; })
      .sort((a,b)=>b.excesoN-a.excesoN);
    const descCur = this.state.descEditPeriod==='base' ? this.state.descPolicy.base : this.descFor(this.state.descEditPeriod);
    const descIsOverride = this.state.descEditPeriod!=='base' && !!this.state.descPolicy.byPeriod[this.state.descEditPeriod];
    const descPeriodOpts=[{v:'base',l:'Base · todos los periodos'}].concat(periodos.map(p=>({v:p, l:this.monthShort(p)+' '+p.split('.')[1]+(this.state.descPolicy.byPeriod[p]?' ✓':'')})));
    const descScopeLabel = this.state.descEditPeriod==='base' ? 'Aplica a todos los meses sin regla propia' : ('Regla solo para '+this.monthShort(this.state.descEditPeriod)+' '+this.state.descEditPeriod.split('.')[1]);

    // --- Iniciales por vencer (cuotas pendientes de ventas fraccionadas) ---
    const cuotaMode=this.state.cuotaMode;
    const todayD=new Date(this.todayStr()+'T00:00:00');
    const fmtFecha=(s)=>{ if(!s) return '—'; const p=s.split('-'); return p.length===3?(p[2]+' '+this.monthShort(p[1]+'.'+p[0])+' '+p[0]):s; };
    const cuotaSrc=this.allRows().filter(r=> r.tipo!=='Desistido' && this.esFrac(r.tipo) && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor));
    let cuotaAll=[];
    cuotaSrc.forEach(r=>{ (r.cuotas||[]).forEach((c,idx)=>{ if(c.pagado) return; const m=parseFloat(c.monto)||0; if(m<=0) return; const dd=c.fecha?new Date(c.fecha+'T00:00:00'):null; const diff=dd&&!isNaN(dd)?Math.round((dd-todayD)/86400000):null; cuotaAll.push({r, idx, monto:m, fecha:c.fecha||'', dd:(dd&&!isNaN(dd))?dd:null, diff}); }); });
    const totPend=cuotaAll.reduce((a,c)=>a+c.monto,0);
    const vencidas=cuotaAll.filter(c=>c.diff!=null&&c.diff<0);
    const vencidoAmt=vencidas.reduce((a,c)=>a+c.monto,0);
    const prox7=cuotaAll.filter(c=>c.diff!=null&&c.diff>=0&&c.diff<=7);
    const prox7Amt=prox7.reduce((a,c)=>a+c.monto,0);
    const cuotaFiltered=cuotaAll.filter(c=> cuotaMode==='vencidas'?(c.diff!=null&&c.diff<0) : (cuotaMode==='porvencer'?(c.diff==null||c.diff>=0) : true));
    cuotaFiltered.sort((a,b)=>{ if(a.dd&&b.dd) return a.dd-b.dd; if(a.dd) return -1; if(b.dd) return 1; return 0; });
    const cuotaKpis=[
      {label:'Total por Cobrar', color:'#7C5CC4', value:this.money(totPend), sub:cuotaAll.length+' cuotas pendientes'},
      {label:'Vencidas', color:'#D26A4C', value:this.money(vencidoAmt), sub:vencidas.length+' cuota(s) atrasada(s)'},
      {label:'Vencen en 7 días', color:'#C49A3F', value:this.money(prox7Amt), sub:prox7.length+' cuota(s) próxima(s)'},
      {label:'Cuotas pendientes', color:'#2C6E9B', value:String(cuotaAll.length), sub:cuotaSrc.length+' ventas fraccionadas'},
    ];
    const cuotaRows=cuotaFiltered.map((c,i)=>{
      const r=c.r; let stLabel, stColor, stBg, urgColor;
      if(c.diff==null){ stLabel='Sin fecha'; stColor='#9AA1AB'; stBg='#F2F4F6'; urgColor='#9AA1AB'; }
      else if(c.diff<0){ stLabel='Vencida hace '+Math.abs(c.diff)+' d'; stColor='#B0593C'; stBg='#FBEDE8'; urgColor='#D26A4C'; }
      else if(c.diff===0){ stLabel='Vence hoy'; stColor='#8A6A1E'; stBg='#FBF3DF'; urgColor='#C49A3F'; }
      else if(c.diff<=7){ stLabel='En '+c.diff+' d'; stColor='#8A6A1E'; stBg='#FBF3DF'; urgColor='#C49A3F'; }
      else { stLabel='En '+c.diff+' d'; stColor='#2C6E9B'; stBg='#EAF2F9'; urgColor='#2C6E9B'; }
      return {
        key:(r.id||(r.p+'|'+r.mz+'|'+r.lt))+'-'+c.idx,
        ejecutivo:r.ej, initials:this.initials(r.ej), color:this.colorFor(r.ej),
        cliente:r.cli||'—', lote:r.mz+'-'+r.lt, periodo:this.monthShort(r.p)+' '+String(r.p).split('.')[1],
        cuotaNum:'#'+(c.idx+1), monto:this.money(c.monto), fecha:fmtFecha(c.fecha),
        stLabel, statusStyle:`display:inline-block; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:800; color:${stColor}; background:${stBg}; white-space:nowrap;`,
        barColor:urgColor,
        onPay:()=>this.toggleCuota(r, c.idx),
      };
    });
    const cuotaModeBtns=[['todas','Todas'],['vencidas','Vencidas'],['porvencer','Por vencer']].map(([k,l])=>({ label:l, onClick:()=>this.setCuotaMode(k), style:`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:7px 15px; border-radius:8px; border:none; background:${cuotaMode===k?'#fff':'transparent'}; color:${cuotaMode===k?'#0B3D2E':'#7A828E'}; box-shadow:${cuotaMode===k?'0 1px 2px rgba(20,23,28,.08)':'none'};` }));
    const cuotaEmpty=cuotaRows.length===0;

    // --- Separaciones por completar inicial (fecha que completa inicial pendiente) ---
    const sepSrc=this.allRows().filter(r=> r.tipo==='Separación' && (this.state.equipo==='Todos'||r.eq===this.state.equipo) && (this.state.asesor==='Todos'||r.ej===this.state.asesor));
    const sepList=sepSrc.map(r=>{
      const dd=r.fIni?new Date(r.fIni+'T00:00:00'):null;
      const diff=(dd&&!isNaN(dd))?Math.round((dd-todayD)/86400000):null;
      let stLabel, stColor, stBg, urg;
      if(diff==null){ stLabel='Sin fecha'; stColor='#9AA1AB'; stBg='#F2F4F6'; urg='#C9CED6'; }
      else if(diff<0){ stLabel='Vencida hace '+Math.abs(diff)+' d'; stColor='#B0593C'; stBg='#FBEDE8'; urg='#D26A4C'; }
      else if(diff===0){ stLabel='Vence hoy'; stColor='#8A6A1E'; stBg='#FBF3DF'; urg='#C49A3F'; }
      else if(diff<=7){ stLabel='En '+diff+' d'; stColor='#8A6A1E'; stBg='#FBF3DF'; urg='#C49A3F'; }
      else { stLabel='En '+diff+' d'; stColor='#2C6E9B'; stBg='#EAF2F9'; urg='#2C6E9B'; }
      return { key:r.id||(r.p+'|'+r.mz+'|'+r.lt), ejecutivo:r.ej, initials:this.initials(r.ej), color:this.colorFor(r.ej),
        cliente:r.cli||'—', lote:r.mz+'-'+r.lt, periodo:this.monthShort(r.p)+' '+String(r.p).split('.')[1],
        modalidad:r.modCompra||'Sin definir', modColor:r.modCompra?(this.TIPO_COLOR[r.modCompra]||'#14171C'):'#9AA1AB',
        modBg:r.modCompra?((this.TIPO_COLOR[r.modCompra]||'#14171C')+'1A'):'#F2F4F6',
        recaudo:this.money(r.rec||0), fecha:fmtFecha(r.fIni), stLabel, barColor:urg,
        statusStyle:`display:inline-block; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:800; color:${stColor}; background:${stBg}; white-space:nowrap;`,
        isUser:!!r.user, onEdit:()=>this.goEditSale(r.id),
        _sort:(dd&&!isNaN(dd))?dd.getTime():Infinity };
    }).sort((a,b)=>a._sort-b._sort);
    const sepEmpty=sepList.length===0;
    const sepCount=sepList.length;

    return {
      // chrome
      loggedIn:this.state.loggedIn, notLoggedIn:!this.state.loggedIn,
      ...this.reportVals(periodos, accent),
      loginUser:this.state.loginUser, loginPass:this.state.loginPass, loginErr:this.state.loginErr||'',
      onLoginUser:(e)=>this.onLoginUser(e.target.value), onLoginPass:(e)=>this.onLoginPass(e.target.value),
      onLoginKey:(e)=>{ if(e.key==='Enter') this.submitLogin(); }, submitLogin:()=>this.submitLogin(), logout:()=>this.logout(),
      navGroups, navMenuOpen, closeMenu:()=>this.closeMenu(), periodChips, teamChips, footerNote,
      navSections, curSectionTitle, curSectionSub, sidebarShown:!this.state.sidebarHidden, toggleSidebar:()=>this.toggleSidebar(),
      avanceLabel, avanceCards, leadsHoyVal, onLeadsHoy:(e)=>this.setLeadsHoy(e.target.value),
      exportVentas:()=>this.exportVentas(), exportComisiones:()=>this.exportComisiones(),
      openImport:()=>this.openImport(), closeImport:()=>this.closeImport(),
      importOpen:this.state.importOpen, importText:this.state.importText,
      onImportText:(e)=>this.setImportText(e.target.value), onImportFile:(e)=>this.onImportFile(e),
      parseImport:()=>this.parseImport(), confirmImport:()=>this.confirmImport(),
      importRes:this.state.importResult,
      importHasRes:!!this.state.importResult,
      importValidCount: this.state.importResult?this.state.importResult.valid.length:0,
      importErrCount: this.state.importResult?this.state.importResult.errors.length:0,
      importDupeCount: this.state.importResult?this.state.importResult.dupes.length:0,
      importErrors: this.state.importResult?this.state.importResult.errors.slice(0,8):[],
      importDupes: this.state.importResult?this.state.importResult.dupes.slice(0,8).map(d=>d.lote).join(', '):'',
      importCanConfirm: !!(this.state.importResult && this.state.importResult.valid.length),
      cuotaKpis, cuotaRows, cuotaModeBtns, cuotaEmpty,
      sepList, sepEmpty, sepCount, sepHasItems:!sepEmpty,
      asesorFilter:this.state.asesor, asesorOpts, onAsesorFilter:(e)=>this.setAsesor(e.target.value),
      isTablero:this.state.tab==='tablero', isOperaciones:this.state.tab==='operaciones', isUbicaciones:this.state.tab==='ubicaciones', isCuotas:this.state.tab==='cuotas',
      ubiList, ubiEmpty, ubiKpis, ubiSortBtns, ubiEstadoBtns, ubiQuery:this.state.ubiQuery, onUbiQuery:(e)=>this.setUbiQuery(e.target.value), isEjecutivos:this.state.tab==='ejecutivos', isComisiones:this.state.tab==='comisiones', isCaptacion:this.state.tab==='captacion', isDescuentos:this.state.tab==='descuentos',
      isBoletas:this.state.tab==='boletas', boletaHasData:!boletaEmpty,
      boletaEje, boletaPeriodo, boletaEjeOpts, boletaPeriodoOpts, boletaEmpty,
      onBoletaEje:(e)=>this.setBoletaEje(e.target.value), onBoletaPeriodo:(e)=>this.setBoletaPeriodo(e.target.value),
      printBoleta:()=>this.printBoleta(),
      ...(boletaVals||{}),
      leadsPeriod:lp, leadsPeriodOpts, onLeadsPeriod:(e)=>this.setLeadsPeriod(e.target.value),
      leadsPeriodLabel:this.monthShort(lp)+' '+lp.split('.')[1],
      metaAdsVal: (this.state.metaAds[lp]!=null && this.state.metaAds[lp]!=='')?this.state.metaAds[lp]:'', onMetaAds:(e)=>this.setMetaAds(lp,e.target.value),
      targetCPAVal:this.state.targetCPA, onTargetCPA:(e)=>this.setTargetCPA(e.target.value),
      adsKpis, adsRows,
      verdictLabel:vbLabel, verdictMsg:vbMsg, verdictIcon:vbIcon, verdictColor:vbColor,
      verdictBannerStyle:`display:flex; align-items:center; gap:16px; background:${vbBg}; border:1px solid ${vbBorder}; border-radius:18px; padding:20px 22px; margin-bottom:16px;`,
      verdictIconStyle:`width:44px; height:44px; border-radius:12px; background:${vbColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; flex-shrink:0;`,
      showForm:this.state.showForm, toggleForm:()=>this.toggleForm(),
      resetAll: this.state.cleared ? (()=>this.restoreDemo()) : (()=>this.resetAll()),
      resetLabel: this.state.cleared ? 'Restaurar ejemplo' : 'Empezar de cero',
      formBtnLabel:this.state.showForm?'Cerrar':'+ Registrar venta',
      formBtnStyle:`cursor:pointer; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; padding:10px 16px; border-radius:11px; border:none; background:${this.state.showForm?'#F0F2F5':'#0B3D2E'}; color:${this.state.showForm?'#475063':'#fff'};`,
      // form
      fv:f, fh, periodOpts, ejeOpts, finalCalc:this.money(fFin), formError:this.state.formErr||'',
      formNote:'La comisión se calcula automáticamente por matriz/escalas en la vista privada.',
      diasForm: diasForm!=null ? (diasForm+' días al cierre') : 'Cierre pendiente',
      showFrac: this.esFrac(f.tipo), formIsSep:f.tipo==='Separación', formNotSep:f.tipo!=='Separación', cuotasView, addCuota:()=>this.addCuota(),
      cuotasSum:this.money(cuotasSumN), iniContratadaFmt:this.money(iniContratadaN),
      cuotasSaldo: this.money(iniContratadaN>0 ? Math.max(0, iniContratadaN-cuotasSumN) : cuotasPendN),
      hasUserSales:this.state.userSales.length>0, userCount:this.state.userSales.length, userSalesList,
      isEditing:!!this.state.editingId, submitLabel:this.state.editingId?'Actualizar venta':'Guardar venta', cancelEdit:()=>this.cancelEdit(),
      dupWarnShow:!!this.state.dupWarn, dupWarnLote:this.state.dupWarn?this.state.dupWarn.lote:'', dupWarnMsg:this.state.dupWarn?('Ya existe una operación en este lote, registrada por '+this.state.dupWarn.ej+' ('+this.state.dupWarn.periodo+' · '+this.state.dupWarn.tipo+'). Verifica que no sea un registro duplicado antes de continuar.'):'', dupConfirm:()=>this.addSale(true), dupCancel:()=>this.setState({dupWarn:null}),
      // tablero
      kpis, rankBtns, ranking, podium, byTipo, byCanal, byPeriodo, byEtapa, healthRings, trendBtns, trendLabel,
      metaShow, metaPeriodLabel, metaCards,
      alerts, hasAlerts:alerts.length>0,
      honorTop, honorTop1Name, honorTop1Why, honorLeaders,
      activeFilters, hasActiveFilters:activeFilters.length>0, clearAllFilters:()=>this.clearXf(),
      tasaRecaudo:this.pct(recPct), velCierre: velAvg!=null?velAvg+' días':'—',
      table, tableCount:String(tTotal),
      hasSel: selCount>0, selCount:String(selCount),
      allVisSelected, onSelectAllVisible:()=>this.setSelMany(_visIds, !allVisSelected),
      bulkVisitoOn:()=>this.bulkField('visito', true, false), bulkVisitoOff:()=>this.bulkField('visito', false, false),
      bulkLiderOn:()=>this.bulkField('liderPart', true, false), bulkLiderOff:()=>this.bulkField('liderPart', false, false),
      bulkTipoVal:'', bulkCanalVal:'',
      bulkTipoOpts:['Contado','Contado Fraccionado','Fraccionado','Separación','Desistido'],
      bulkCanalOpts:['Lead Digital','Referido Asesor','Referido Propietario','Asesor Externo','Prospección'],
      bulkTipo:(e)=>{ const v=e.target.value; if(v) this.bulkField('tipo', v, false); },
      bulkCanal:(e)=>{ const v=e.target.value; if(v) this.bulkField('canal', v, false); },
      bulkRemoveFn:()=>this.bulkRemove(), clearSelFn:()=>this.clearSel(),
      tableQuery:this.state.tableQuery, onTableQuery:(e)=>this.setTableQuery(e.target.value),
      tableTipoVal:this.state.tableTipo, onTableTipo:(e)=>this.setTableTipo(e.target.value),
      tableTipoOpts:[{v:'Todos',l:'Todos los estados'}].concat(['Contado','Contado Fraccionado','Fraccionado','Separación','Desistido'].map(t=>({v:t,l:t}))),
      tableCanalVal:this.state.tableCanal, onTableCanal:(e)=>this.setTableCanal(e.target.value),
      tableCanalOpts:[{v:'Todos',l:'Todos los canales'}].concat(_tCanalOpts.map(c=>({v:c,l:c}))),
      tableFiltersActive, clearTableFilters:()=>this.clearTableFilters(),
      tablePeriodVal:this.state.tablePeriod, tablePeriodOpts:[{v:'Todos',l:'Todos los periodos'}].concat(periodos.map(p=>({v:p, l:this.monthShort(p)+' '+p.split('.')[1]}))), onTablePeriod:(e)=>this.setTablePeriod(e.target.value),
      tableRangeLabel: tTotal? ((tStart+1)+'–'+Math.min(tStart+PER_PAGE,tTotal)+' de '+tTotal) : '0 de 0',
      tablePageLabel:'Página '+(tPage+1)+' de '+tPages, tableHasPages:tPages>1,
      tablePrev:()=>this.setTablePage(Math.max(0,tPage-1)), tableNext:()=>this.setTablePage(Math.min(tPages-1,tPage+1)),
      tablePrevDisabled:tPage<=0, tableNextDisabled:tPage>=tPages-1,
      tablePrevStyle:`cursor:${tPage<=0?'not-allowed':'pointer'}; opacity:${tPage<=0?0.4:1}; border:1px solid #D7DBE0; background:#fff; color:#475063; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:7px 14px; border-radius:9px;`,
      tableNextStyle:`cursor:${tPage>=tPages-1?'not-allowed':'pointer'}; opacity:${tPage>=tPages-1?0.4:1}; border:1px solid #D7DBE0; background:#fff; color:#475063; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:7px 14px; border-radius:9px;`,
      // ejecutivos
      ejeStats, nv:this.state.newEj, nh, ejeError:this.state.ejeErr||'',
      isEditingEje:!!this.state.editingEje, notEditingEje:!this.state.editingEje, editEjeName:this.state.editingEje||'',
      ev:this.state.editEjeForm, editEjeError:this.state.editEjeErr||'',
      onEditEjeName:(e)=>this.updateEditEje('name',e.target.value), onEditEjeEquipo:(e)=>this.updateEditEje('equipo',e.target.value),
      saveEditEje:()=>this.saveEditEje(), cancelEditEje:()=>this.cancelEditEje(),
      // descuentos
      descKpis, descRows, excList, hasExc:excList.length>0, noExc:excList.length===0, descModeBtns, descModeNote,
      descFracVal:(descCur.frac!=null?descCur.frac:''), descContadoVal:(descCur.contado!=null?descCur.contado:''),
      onDescFrac:(e)=>this.updateDescPolicy('frac',e.target.value), onDescContado:(e)=>this.updateDescPolicy('contado',e.target.value),
      descEditPeriod:this.state.descEditPeriod, descPeriodOpts, onDescEditPeriod:(e)=>this.setDescEditPeriod(e.target.value),
      descIsOverride, resetDescPeriod:()=>this.resetDescPeriod(), descScopeLabel,
      // comisiones
      comUnlocked:this.state.comUnlocked, comLocked:!this.state.comUnlocked,
      pinInput:this.state.pinInput, onPin:(e)=>this.onPin(e), submitPin:()=>this.submitPin(), pinErr:this.state.pinErr||'',
      comRanking:comRankingF, comTotal:this.money(comBaseF+comVolF+comSpeedF), comBase:this.money(comBaseF), comVol:this.money(comVolF), comSpeed:this.money(comSpeedF),
      comGen:this.money(comGenF), comPend:this.money(comPendF), comHasReten:(comPendF>0.5), comGenTotal:this.money(comGenF+comVolF+comSpeedF),
      showLider:this.state.showLider, toggleLider:()=>this.toggleLider(), liderChev:this.state.showLider?'▾':'▸', liderToggleLabel:this.state.showLider?'Ocultar comisiones de liderazgo':'Mostrar comisiones de liderazgo',
      inicialMinVal:String(this.state.inicialMin||0), onInicialMin:(e)=>this.setInicialMin(e.target.value),
      comPeriodLocked, comLockLabel,
      comProjection, hasProjection, projPeriodLabel, projIsAgg,
      selClosable, selIsClosed:!!selClosedObj, closeSelLabel, selClosedAt:selClosedObj?selClosedObj.closedAt:'',
      selNotClosed: selClosable && !selClosedObj, selNotClosable: !selClosable,
      closePeriod:()=>this.closePeriod(selP2), closedList, hasClosed:closedList.length>0,
      liderEditPeriod:liderEP, liderPeriodOpts, onLiderPeriod:(e)=>this.setLiderEditPeriod(e.target.value), liderScopeLabel, liderNote,
      liderRows:liderLvl.rows, liderTotal:liderLvl.total, liderReqPart:liderLvl.reqPart, onLiderReqPart:liderLvl.onReqPart,
      liderIsOverride:liderLvl.isOverride, resetLiderPeriod:()=>this.resetLiderPeriod('lider'),
      superActivo, superInactivo:!superActivo, onToggleSuper:()=>this.toggleSuper(),
      superRows:superLvl.rows, superTotal:superLvl.total, superReqPart:superLvl.reqPart, onSuperReqPart:superLvl.onReqPart,
      superName:superLvl.superName, onSuperName:superLvl.onSuperName, superIsOverride:superLvl.isOverride, resetSuperPeriod:()=>this.resetLiderPeriod('super'),
      matrixRows, escHeads, volBonosView, speedBonosView, addVolBono:()=>this.addVolBono(), addSpeedBono:()=>this.addSpeedBono(),
      showMatriz:this.state.showMatriz, toggleMatriz:()=>this.toggleMatriz(), matrizChev:this.state.showMatriz?'▾':'▸', matrizToggleLabel:this.state.showMatriz?'Ocultar':'Mostrar',
      editPeriodOpts, editPeriod:this.state.editPeriod, onEditPeriod:(e)=>this.setEditPeriod(e.target.value), editIsOverride, resetEditPeriod:()=>this.resetEditPeriod(), editTeamBtns,
      modeBtns, editIsFlat, editIsMatrix, flatRate, boundsView, escGrid, addCol:()=>this.addCol(), removeCol:()=>this.removeCol(),
    };
  }
}

window.ComercialEngine = ComercialEngine;

// ── S(): convierte un string CSS inline en un objeto de estilo React, y remapea
// el look verde/Manrope original al sistema MATTIKA (azul / Montserrat).
// Solo se remapea la MARCA (verdes → azules); los colores semánticos de estado
// (rojo, ámbar, morado, azul de acento) se conservan para mantener la riqueza del tablero.
(function(){
  const REMAP = {
    // verdes de marca → azul MATTIKA
    '#0b3d2e':'#152C63', '#0e4c39':'#1E3E86', '#0a3527':'#122452',
    '#137a5b':'#1E4FD4', '#0b5c3f':'#1E4FD4', '#3e8466':'#3763D8', '#3d7a4e':'#3763D8',
    '#1f9e8a':'#2E77C9', '#3b7a55':'#3763D8', '#0b5c3f':'#1E4FD4',
    // verdes claros / tintes → tintes azules
    '#b7e4ce':'#C6D4F7', '#b7cfc4':'#AFC0EC', '#8fb3a5':'#93A6D6', '#7fbba3':'#93A6D6',
    '#8fb9a8':'#93A6D6', '#5e8b78':'#7387C4', '#e7f2ec':'#EAF0FE', '#eaf5ef':'#EAF0FE',
    '#f1f8f4':'#EEF3FE', '#f4faf7':'#EEF3FE', '#eff4ef':'#EEF3FE',
    '#cde7db':'#C6D4F7', '#bfe0d0':'#C6D4F7', '#bfe0ce':'#C6D4F7', '#9cc7b4':'#AFC0EC',
    '#bfd9cc':'#C6D4F7', '#cfe0d8':'#C6D4F7', '#eaf1f6':'#EAF0FE'
  };
  function remap(css){
    let s = String(css);
    s = s.replace(/'Manrope'|"Manrope"|Manrope/g, "'Montserrat'")
         .replace(/'Space Grotesk'|"Space Grotesk"|Space Grotesk/g, "'Montserrat'");
    s = s.replace(/#[0-9a-fA-F]{6}/g, (h)=> REMAP[h.toLowerCase()] || h);
    return s;
  }
  function camel(p){ return p.replace(/-([a-z])/g, (_,c)=>c.toUpperCase()); }
  function S(css){
    if(!css) return {};
    const s = remap(css);
    const obj = {};
    s.split(';').forEach(decl=>{
      const i = decl.indexOf(':'); if(i<0) return;
      const k = decl.slice(0,i).trim(); if(!k) return;
      let v = decl.slice(i+1).trim();
      obj[k.startsWith('--') ? k : camel(k)] = v;
    });
    return obj;
  }
  window.__csS = S;
})();
