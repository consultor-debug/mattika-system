// ubigeo.jsx — Ubigeo del Perú en cascada (Departamento → Provincia → Distrito)
// + datos de contrato por proyecto (partida matriz, dirección, ubigeo, cuentas
// bancarias). Se carga ANTES de contract-template / screen-wizard.
// ════════════════════════════════════════════════════════════════
// La Libertad y Lima están completos. Para el resto de departamentos el
// distrito/provincia caen a texto libre (no rompe nada y sigue siendo editable).

const UBIGEO = {
  'La Libertad': {
    'Trujillo': ['Trujillo','El Porvenir','Florencia de Mora','Huanchaco','La Esperanza','Laredo','Moche','Poroto','Salaverry','Simbal','Víctor Larco Herrera'],
    'Ascope': ['Ascope','Chicama','Chocope','Magdalena de Cao','Paiján','Rázuri','Santiago de Cao','Casa Grande'],
    'Bolívar': ['Bolívar','Bambamarca','Condormarca','Longotea','Uchumarca','Ucuncha'],
    'Chepén': ['Chepén','Pacanga','Pueblo Nuevo'],
    'Gran Chimú': ['Cascas','Lucma','Marmot','Sayapullo'],
    'Julcán': ['Julcán','Calamarca','Carabamba','Huaso'],
    'Otuzco': ['Otuzco','Agallpampa','Charat','Huaranchal','La Cuesta','Mache','Paranday','Salpo','Sinsicap','Usquil'],
    'Pacasmayo': ['San Pedro de Lloc','Guadalupe','Jequetepeque','Pacasmayo','San José'],
    'Pataz': ['Tayabamba','Buldibuyo','Chillia','Huancaspata','Huaylillas','Huayo','Ongón','Parcoy','Pataz','Pías','Santiago de Challas','Taurija','Urpay'],
    'Sánchez Carrión': ['Huamachuco','Chugay','Cochorco','Curgos','Marcabal','Sanagorán','Sarín','Sartimbamba'],
    'Santiago de Chuco': ['Santiago de Chuco','Angasmarca','Cachicadán','Mollebamba','Mollepata','Quiruvilca','Santa Cruz de Chuca','Sitabamba'],
    'Virú': ['Virú','Chao','Guadalupito'],
  },
  'Lima': {
    'Lima': ['Lima','Ancón','Ate','Barranco','Breña','Carabayllo','Chaclacayo','Chorrillos','Cieneguilla','Comas','El Agustino','Independencia','Jesús María','La Molina','La Victoria','Lince','Los Olivos','Lurigancho','Lurín','Magdalena del Mar','Miraflores','Pachacámac','Pucusana','Pueblo Libre','Puente Piedra','Punta Hermosa','Punta Negra','Rímac','San Bartolo','San Borja','San Isidro','San Juan de Lurigancho','San Juan de Miraflores','San Luis','San Martín de Porres','San Miguel','Santa Anita','Santa María del Mar','Santa Rosa','Santiago de Surco','Surquillo','Villa El Salvador','Villa María del Triunfo'],
    'Barranca': ['Barranca','Paramonga','Pativilca','Supe','Supe Puerto'],
    'Cañete': ['San Vicente de Cañete','Asia','Calango','Cerro Azul','Chilca','Coayllo','Imperial','Lunahuaná','Mala','Nuevo Imperial','Pacarán','Quilmaná','San Antonio','San Luis','Santa Cruz de Flores','Zúñiga'],
    'Huaral': ['Huaral','Atavillos Alto','Atavillos Bajo','Aucallama','Chancay','Ihuarí','Lampián','Pacaraos','San Miguel de Acos','Santa Cruz de Andamarca','Sumbilca','Veintisiete de Noviembre'],
    'Huarochirí': ['Matucana','Ricardo Palma','San Mateo','Santa Eulalia'],
    'Huaura': ['Huacho','Ámbar','Caleta de Carquín','Checras','Hualmay','Leoncio Prado','Paccho','Santa Leonor','Santa María','Sayán','Végueta'],
    'Cajatambo': ['Cajatambo','Copa','Gorgor','Huancapón','Manás'],
    'Canta': ['Canta','Arahuay','Huamantanga','Huaros','Lachaqui','San Buenaventura','Santa Rosa de Quives'],
    'Oyón': ['Oyón','Andajes','Caujul','Cochamarca','Naván','Pachangara'],
    'Yauyos': ['Yauyos','Alis','Ayauca','Carania','Catahuasi','Huangáscar','Lincha','Madeán','Miraflores','Omas','Tanta','Tomas','Tupe','Viñac'],
  },
  'Callao': {
    'Callao': ['Callao','Bellavista','Carmen de la Legua Reynoso','La Perla','La Punta','Mi Perú','Ventanilla'],
  },
};

// Lista completa de departamentos (los que no están en UBIGEO usan texto libre).
const DEPARTAMENTOS = [
  'Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco',
  'Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto',
  'Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali',
];

const provinciasDe = (dep) => Object.keys(UBIGEO[dep] || {});
const distritosDe = (dep, prov) => (UBIGEO[dep] && UBIGEO[dep][prov]) || [];

// ── Componente reutilizable: Departamento → Provincia → Distrito ──
// value = { departamento, provincia, distrito }
// onChange(patch) recibe el parche con los 3 campos reseteados en cascada.
const UbigeoFields = ({ value = {}, onChange, required = false, gridClass = 'field-group cols-3' }) => {
  const dep = value.departamento || '';
  const prov = value.provincia || '';
  const dist = value.distrito || '';
  const provs = provinciasDe(dep);
  const dists = distritosDe(dep, prov);
  const tieneProvs = provs.length > 0;
  const tieneDists = dists.length > 0;
  const req = required ? <span className="req">*</span> : null;

  return (
    <div className={gridClass}>
      {/* Orden visual: Departamento, Provincia, Distrito */}
      <div className="field">
        <label className="field-label">Departamento {req}</label>
        <select className="select" value={dep}
                onChange={(e) => onChange({ departamento: e.target.value, provincia: '', distrito: '' })}>
          <option value="">Seleccionar...</option>
          {DEPARTAMENTOS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="field">
        <label className="field-label">Provincia {req}</label>
        {tieneProvs ? (
          <select className="select" value={prov} disabled={!dep}
                  onChange={(e) => onChange({ provincia: e.target.value, distrito: '' })}>
            <option value="">Seleccionar...</option>
            {provs.map(p => <option key={p}>{p}</option>)}
          </select>
        ) : (
          <input className="input" value={prov} placeholder={dep ? 'Escribe la provincia' : 'Elige departamento'}
                 disabled={!dep}
                 onChange={(e) => onChange({ provincia: e.target.value, distrito: '' })}/>
        )}
      </div>

      <div className="field">
        <label className="field-label">Distrito {req}</label>
        {tieneDists ? (
          <select className="select" value={dist} disabled={!prov}
                  onChange={(e) => onChange({ distrito: e.target.value })}>
            <option value="">Seleccionar...</option>
            {dists.map(d => <option key={d}>{d}</option>)}
          </select>
        ) : (
          <input className="input" value={dist} placeholder={prov ? 'Escribe el distrito' : 'Elige provincia'}
                 disabled={!prov}
                 onChange={(e) => onChange({ distrito: e.target.value })}/>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// DATOS DE CONTRATO POR PROYECTO
// Lo que NO cambia entre ventas del mismo proyecto: partida matriz, dirección
// del predio, ubigeo del predio y las cuentas bancarias del proyecto.
// (unidad, manzana y área SÍ cambian por venta → no se incluyen aquí.)
// ════════════════════════════════════════════════════════════════
const PROYECTO_DATOS = {
  'Nápoles': {
    partida: '11550511',
    direccion: 'Valle Chicama, Predio Mocan, Sector La Arenita U.C. 1900',
    distrito: 'Rázuri',
    provincia: 'Ascope',
    departamento: 'La Libertad',
    tipoInmueble: 'Lote',
    cuentas: [
      { banco: 'BCP', moneda: 'Soles', cuenta: '570-7307941059', cci: '00257000730794105917' },
      { banco: 'BBVA', moneda: 'Soles', cuenta: '0011-0814-0200123456', cci: '01181400020012345677' },
      { banco: 'Yape', moneda: 'Soles', cuenta: '932650915', cci: '' },
    ],
  },
};
// Normaliza claves (sin tildes, minúsculas) para tolerar "Napoles" / "NÁPOLES".
const _normKey = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
function getProyectoDatos(nombre) {
  const target = _normKey(nombre);
  const hit = Object.keys(PROYECTO_DATOS).find(k => _normKey(k) === target);
  return hit ? PROYECTO_DATOS[hit] : null;
}

Object.assign(window, {
  UBIGEO, DEPARTAMENTOS_UBIGEO: DEPARTAMENTOS, provinciasDe, distritosDe,
  UbigeoFields, PROYECTO_DATOS, getProyectoDatos,
});
