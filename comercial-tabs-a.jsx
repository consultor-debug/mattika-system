// AUTO-PORT: bloques de UI del tablero Comercial (Ventas Nápoles) → JSX MATTIKA.
// Generado desde la plantilla DC; el look verde/Manrope se remapea a azul/Montserrat vía S().
const S = window.__csS;

function CForm(props){ const V = props.V; return (
V.showForm && (<>
      <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; margin-bottom:18px; box-shadow:0 8px 26px rgba(20,23,28,.10);`)}>
        <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;`)}>
          <div style={S(`display:flex; align-items:center; gap:10px;`)}>
            <div style={S(`width:30px; height:30px; border-radius:8px; background:#0B3D2E; color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; line-height:1;`)}>+</div>
            <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Registrar Nueva Venta</h2>
          </div>
          <button onClick={V.toggleForm} style={S(`cursor:pointer; border:none; background:#F0F2F5; color:#6B7280; width:30px; height:30px; border-radius:8px; font-size:16px; font-family:'Manrope',sans-serif;`)}>✕</button>
        </div>
        <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px;`)}>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Periodo</label>
            <select value={V.fv.periodo} onChange={V.fh.periodo} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              {(V.periodOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Ejecutivo</label>
            <select value={V.fv.ejecutivo} onChange={V.fh.ejecutivo} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              <option value="">Selecciona…</option>
              {(V.ejeOpts||[]).map((o, _k1) => (<React.Fragment key={_k1}><option value={o.v}>{o.l}</option></React.Fragment>))}
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Equipo</label>
            <select value={V.fv.equipo} onChange={V.fh.equipo} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              <option value="E. Interno">E. Interno</option>
              <option value="E. Externo">E. Externo</option>
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Cliente</label>
            <input value={V.fv.cliente} onChange={V.fh.cliente} placeholder="Opcional" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Etapa</label>
            <select value={V.fv.etapa} onChange={V.fh.etapa} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              <option value="I">Etapa I</option>
              <option value="II">Etapa II</option>
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Manzana / Lote</label>
            <div style={S(`display:flex; gap:8px;`)}>
              <input value={V.fv.mz} onChange={V.fh.mz} placeholder="Mz" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:50%;`)} />
              <input value={V.fv.lt} onChange={V.fh.lt} placeholder="Lt" type="number" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:50%;`)} />
            </div>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Precio Lista (S/)</label>
            <input value={V.fv.lista} onChange={V.fh.lista} placeholder="0" type="number" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Descuento (S/)</label>
            <input value={V.fv.desc} onChange={V.fh.desc} placeholder="0" type="number" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Recaudo (S/)</label>
            <input value={V.fv.recaudo} onChange={V.fh.recaudo} placeholder="0" type="number" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Tipo de Compra</label>
            <select value={V.fv.tipo} onChange={V.fh.tipo} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              <option value="Contado">Contado</option>
              <option value="Contado Fraccionado">Contado Fraccionado</option>
              <option value="Fraccionado">Fraccionado</option>
              <option value="Separación">Separación</option>
              <option value="Desistido">Desistido</option>
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Canal de Captación</label>
            <select value={V.fv.canal} onChange={V.fh.canal} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)}>
              <option value="Lead Digital">Lead Digital</option>
              <option value="Referido Asesor">Referido Asesor</option>
              <option value="Referido Propietario">Referido Propietario</option>
              <option value="Prospección">Prospección</option>
              <option value="Asesor Externo">Asesor Externo</option>
              <option value="—">Sin definir</option>
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Fecha Separación</label>
            <input value={V.fv.fSep} onChange={V.fh.fSep} type="date" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          {V.formNotSep && (<>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Fecha Cierre (firma)</label>
            <input value={V.fv.fFirma} onChange={V.fh.fFirma} type="date" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
          </div>
          </>)}
          {V.formIsSep && (<>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#2C6E9B; margin-bottom:6px;`)}>Fecha que completa inicial</label>
            <input value={V.fv.fIni} onChange={V.fh.fIni} type="date" style={S(`padding:9px 11px; border:1px solid #BBD3E8; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#F5F9FD; width:100%;`)} />
          </div>
          </>)}
          {V.formIsSep && (<>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#2C6E9B; margin-bottom:6px;`)}>Modalidad de compra</label>
            <select value={V.fv.modCompra} onChange={V.fh.modCompra} style={S(`padding:9px 11px; border:1px solid #BBD3E8; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#F5F9FD; width:100%;`)}>
              <option value="">Sin definir aún</option>
              <option value="Contado">Contado</option>
              <option value="Contado Fraccionado">Contado Fraccionado</option>
              <option value="Fraccionado">Fraccionado</option>
            </select>
          </div>
          </>)}
        </div>

        <div style={S(`margin-top:14px; padding-top:16px; border-top:1px solid #EEF0F3;`)}>
          <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:9px;`)}>Seguimiento y participación</label>
          <div style={S(`display:grid; grid-template-columns:repeat(3,1fr); gap:10px;`)}>
            <label style={S(`display:flex; align-items:center; gap:10px; padding:10px 13px; border:1px solid #D7DBE0; border-radius:9px; background:#fff; cursor:pointer; font-size:13px; color:#14171C;`)}>
              <input type="checkbox" checked={V.fv.visito} onChange={V.fh.visito} style={S(`width:17px; height:17px; accent-color:#0B3D2E; cursor:pointer; flex-shrink:0;`)} />
              <span>Visitó el proyecto</span>
            </label>
            <label style={S(`display:flex; align-items:center; gap:10px; padding:10px 13px; border:1px solid #D7DBE0; border-radius:9px; background:#fff; cursor:pointer; font-size:13px; color:#14171C;`)}>
              <input type="checkbox" checked={V.fv.liderPart} onChange={V.fh.liderPart} style={S(`width:17px; height:17px; accent-color:#0B3D2E; cursor:pointer; flex-shrink:0;`)} />
              <span>Participó el líder de equipo</span>
            </label>
            <label style={S(`display:flex; align-items:center; gap:10px; padding:10px 13px; border:1px solid #D7DBE0; border-radius:9px; background:#fff; cursor:pointer; font-size:13px; color:#14171C;`)}>
              <input type="checkbox" checked={V.fv.superPart} onChange={V.fh.superPart} style={S(`width:17px; height:17px; accent-color:#0B3D2E; cursor:pointer; flex-shrink:0;`)} />
              <span>Participó gerencia (líder de líder)</span>
            </label>
          </div>
        </div>

        {V.showFrac && (<>
          <div style={S(`margin-top:18px; padding:16px 18px; background:#F4FAF7; border:1px solid #CDE7DB; border-radius:14px;`)}>
            <div style={S(`display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:14px;`)}>
              <div>
                <div style={S(`font-size:13px; font-weight:800; color:#0B3D2E;`)}>Contrato inicial · recaudo fraccionado</div>
                <div style={S(`font-size:12px; color:#5E7A6E; margin-top:3px; max-width:440px; line-height:1.45;`)}>Detalla las cuotas de la inicial pactada y marca ✓ Pagado cuando se cobre cada una. El recaudo solo suma las cuotas marcadas como pagadas (una cuota programada para hoy pero no cobrada no cuenta).</div>
              </div>
              <div style={S(`display:flex; gap:22px;`)}>
                <div style={S(`text-align:right;`)}>
                  <div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A9488;`)}>Recaudado</div>
                  <div className="num" style={S(`font-size:16px; font-weight:800; color:#137A5B; margin-top:2px;`)}>{V.cuotasSum}</div>
                </div>
                <div style={S(`text-align:right;`)}>
                  <div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A9488;`)}>Saldo inicial</div>
                  <div className="num" style={S(`font-size:16px; font-weight:800; color:#B0593C; margin-top:2px;`)}>{V.cuotasSaldo}</div>
                </div>
              </div>
            </div>
            <div style={S(`max-width:280px; margin-bottom:14px;`)}>
              <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Inicial contratada (S/)</label>
              <input value={V.fv.iniContratada} onChange={V.fh.iniContratada} placeholder="0" type="number" style={S(`padding:9px 11px; border:1px solid #CDE7DB; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
            </div>
            <div style={S(`display:grid; grid-template-columns:26px 1fr 1fr 96px 36px; gap:10px; padding:0 2px 6px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#7A9488;`)}>
              <span>#</span><span>Monto cuota (S/)</span><span>Fecha de pago</span><span style={S(`text-align:center;`)}>¿Pagado?</span><span></span>
            </div>
            <div style={S(`display:flex; flex-direction:column; gap:8px;`)}>
              {(V.cuotasView||[]).map((c, _k2) => (<React.Fragment key={_k2}>
                <div style={S(`display:grid; grid-template-columns:26px 1fr 1fr 96px 36px; gap:10px; align-items:center;`)}>
                  <span className="num" style={S(`font-size:12.5px; font-weight:700; color:#5E7A6E;`)}>{c.num}</span>
                  <input value={c.monto} onChange={c.onMonto} placeholder="0" type="number" style={S(`padding:8px 10px; border:1px solid #CDE7DB; border-radius:8px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
                  <input value={c.fecha} onChange={c.onFecha} type="date" style={S(`padding:8px 10px; border:1px solid #CDE7DB; border-radius:8px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff; width:100%;`)} />
                  <label style={S(`display:flex; align-items:center; justify-content:center; gap:6px; cursor:pointer; font-size:11.5px; font-weight:700; color:${c.pagadoColor}; background:${c.pagadoBg}; border:1px solid ${c.pagadoBorder}; border-radius:8px; height:34px;`)}>
                    <input type="checkbox" checked={c.pagado} onChange={c.onToggle} style={S(`width:15px; height:15px; accent-color:#137A5B; cursor:pointer;`)} />{c.pagadoLabel}
                  </label>
                  <button onClick={c.onRemove} style={S(`cursor:pointer; border:1px solid #E3C4BB; background:#fff; color:#C0563A; font-size:15px; font-weight:700; line-height:1; border-radius:8px; height:34px;`)}>×</button>
                </div>
              </React.Fragment>))}
            </div>
            <button onClick={V.addCuota} style={S(`margin-top:12px; cursor:pointer; border:1px dashed #9CC7B4; background:#fff; color:#137A5B; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 14px; border-radius:9px;`)}>+ Agregar cuota</button>
          </div>
        </>)}

        {V.dupWarnShow && (<>
          <div style={S(`margin-top:18px; padding:14px 16px; background:#FBEDE8; border:1px solid #E9CFC4; border-radius:12px; display:flex; align-items:flex-start; gap:12px;`)}>
            <div style={S(`width:26px; height:26px; border-radius:7px; background:#D26A4C; color:#fff; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; flex-shrink:0;`)}>!</div>
            <div style={S(`flex:1;`)}>
              <div style={S(`font-size:13.5px; font-weight:800; color:#B0593C;`)}>Lote duplicado: {V.dupWarnLote}</div>
              <div style={S(`font-size:12.5px; color:#8A5443; margin-top:2px; line-height:1.45;`)}>{V.dupWarnMsg}</div>
              <div style={S(`display:flex; gap:8px; margin-top:12px;`)}>
                <button onClick={V.dupConfirm} style={S(`cursor:pointer; border:none; background:#B0593C; color:#fff; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 16px; border-radius:9px;`)}>Registrar de todos modos</button>
                <button onClick={V.dupCancel} style={S(`cursor:pointer; border:1px solid #E0C4B8; background:#fff; color:#8A5443; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 16px; border-radius:9px;`)}>Cancelar</button>
              </div>
            </div>
          </div>
        </>)}

        <div style={S(`display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; margin-top:20px; padding-top:18px; border-top:1px solid #EEF0F3;`)}>
          <div style={S(`display:flex; align-items:center; gap:24px;`)}>
            <div>
              <div style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E;`)}>Precio Final</div>
              <div className="num" style={S(`font-size:22px; font-weight:700; margin-top:3px;`)}>{V.finalCalc}</div>
            </div>
            <div>
              <div style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E;`)}>Cierre</div>
              <div className="num" style={S(`font-size:16px; font-weight:700; margin-top:5px; color:#137A5B;`)}>{V.diasForm}</div>
            </div>
            <div style={S(`font-size:12px; color:#9AA1AB; max-width:240px; line-height:1.4;`)}>{V.formNote}</div>
          </div>
          <div style={S(`display:flex; align-items:center; gap:12px;`)}>
            <span style={S(`font-size:12.5px; color:#D26A4C; font-weight:600;`)}>{V.formError}</span>
            {V.isEditing && (<>
              <button onClick={V.cancelEdit} style={S(`cursor:pointer; border:1px solid #D7DBE0; background:#fff; color:#475063; font-family:'Manrope',sans-serif; font-size:13.5px; font-weight:700; padding:11px 18px; border-radius:10px;`)}>Cancelar</button>
            </>)}
            <button onClick={V.fh.submit} style={S(`cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:13.5px; font-weight:700; padding:11px 22px; border-radius:10px;`)}>{V.submitLabel}</button>
          </div>
        </div>
        {V.hasUserSales && (<>
          <div style={S(`margin-top:20px; padding-top:18px; border-top:1px solid #EEF0F3;`)}>
            <div style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:10px;`)}>Ventas registradas por ti ({V.userCount}) · guardadas en este navegador</div>
            <div style={S(`display:flex; flex-direction:column; gap:6px;`)}>
              {(V.userSalesList||[]).map((u, _k3) => (<React.Fragment key={_k3}>
                <div style={S(`display:flex; align-items:center; gap:12px; padding:9px 12px; background:#F7F8FA; border-radius:10px; font-size:12.5px;`)}>
                  <span className="num" style={S(`color:#475063; font-weight:600; width:48px;`)}>{u.periodo}</span>
                  <span style={S(`font-weight:700; flex:1;`)}>{u.ejecutivo}</span>
                  <span className="num" style={S(`color:#9AA1AB; width:60px;`)}>{u.lote}</span>
                  <span className="num" style={S(`font-weight:700; width:90px; text-align:right;`)}>{u.final}</span>
                  <span style={S(`color:#6B7280; width:90px;`)}>{u.tipo}</span>
                  <span style={S(`color:#137A5B; font-size:11px; font-weight:600; flex:1;`)}>{u.frac}</span>
                  <button onClick={u.onEdit} style={S(`${u.editStyle}`)}>{u.editLabel}</button>
                  <button onClick={u.onDelete} style={S(`cursor:pointer; border:none; background:none; color:#D26A4C; font-size:13px; font-weight:700; font-family:'Manrope',sans-serif;`)}>Eliminar</button>
                </div>
              </React.Fragment>))}
            </div>
          </div>
        </>)}
      </div>
    </>)
); }
function CTablero(props){ const V = props.V; return (
V.isTablero && (<>
      <div data-screen-label="Tablero">

        
        <div style={S(`background:#0B3D2E; border-radius:18px; padding:20px 24px; margin-bottom:16px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
          <div style={S(`display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:15px;`)}>
            <div style={S(`font-size:16px; font-weight:800; color:#fff; letter-spacing:-.01em;`)}>Avance a la fecha</div>
            <div className="num" style={S(`font-size:12.5px; color:#8FB9A8;`)}>{V.avanceLabel}</div>
          </div>
          <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:12px;`)}>
            {(V.avanceCards||[]).map((a, _k0) => (<React.Fragment key={_k0}>
              <div style={S(`background:#fff; border-radius:13px; padding:14px 16px;`)}>
                <div style={S(`font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.045em; color:#8A929C;`)}>{a.label}</div>
                {a.isLeads && (<>
                  <input value={V.leadsHoyVal} onChange={V.onLeadsHoy} type="number" placeholder="—" className="num" style={S(`width:100%; border:none; border-bottom:2px solid #EDE7FA; background:transparent; font-family:'Space Grotesk',sans-serif; font-weight:800; font-size:27px; color:#7C5CC4; padding:2px 0; margin:3px 0 1px;`)} />
                </>)}
                {a.notLeads && (<>
                  <div className="num" style={S(`font-size:28px; font-weight:800; color:${a.color}; margin:4px 0 1px; line-height:1;`)}>{a.value}</div>
                </>)}
                <div style={S(`font-size:11.5px; color:#8A929C;`)}>{a.sub}</div>
              </div>
            </React.Fragment>))}
          </div>
        </div>

        {V.metaShow && (<>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px 22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
            <div style={S(`display:flex; align-items:center; gap:9px; margin-bottom:16px;`)}>
              <span style={S(`font-size:17px; line-height:1;`)}>🎯</span>
              <h2 style={S(`margin:0; font-size:16px; font-weight:800;`)}>Meta de {V.metaPeriodLabel}</h2>
              <span style={S(`font-size:11px; color:#9AA1AB; margin-left:2px;`)}>avance del mes vs. objetivo</span>
            </div>
            <div style={S(`display:grid; grid-template-columns:1fr 1fr; gap:26px;`)}>
              {(V.metaCards||[]).map((m, _k1) => (<React.Fragment key={_k1}>
                <div>
                  <div style={S(`display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:9px;`)}>
                    <span style={S(`font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:#7A828E;`)}>{m.label}</span>
                    <div style={S(`display:flex; align-items:baseline; gap:6px;`)}>
                      <span className="num" style={S(`font-size:19px; font-weight:800; color:#14171C;`)}>{m.curTxt}</span>
                      <span style={S(`font-size:12px; color:#9AA1AB;`)}>/ meta</span>
                      <input value={m.targetInput} onChange={m.onInput} placeholder="—" inputMode="numeric" className="num" style={S(`width:82px; padding:5px 8px; border:1px solid #D7DBE0; border-radius:8px; font-size:13px; font-weight:700; text-align:right; color:${m.color}; background:#FAFBFC;`)} />
                    </div>
                  </div>
                  <div style={S(`position:relative; height:10px; background:#EEF1F4; border-radius:20px; overflow:hidden;`)}>
                    <div style={S(`position:absolute; inset:0 auto 0 0; width:${m.barW}; background:${m.barColor}; border-radius:20px; transition:width .3s;`)}></div>
                  </div>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:7px;`)}>
                    <span style={S(`font-size:12px; font-weight:600; color:${m.msgColor};`)}>{m.msg}</span>
                    <span className="num" style={S(`font-size:12px; font-weight:800; color:${m.barColor};`)}>{m.pctLabel}</span>
                  </div>
                  {m.paceShow && (<>
                    <div style={S(`margin-top:10px; padding-top:10px; border-top:1px dashed #E6E8EC;`)}>
                      <div style={S(`display:flex; align-items:center; gap:8px; flex-wrap:wrap;`)}>
                        <span style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB;`)}>Ritmo · {m.paceEvery}</span>
                        <span className="num" style={S(`font-size:11px; font-weight:800; color:${m.paceColor}; background:${m.paceBg}; padding:2px 9px; border-radius:20px; white-space:nowrap;`)}>GAP {m.paceGap}</span>
                        <span style={S(`font-size:12px; font-weight:700; color:${m.paceColor};`)}>{m.paceMsg}</span>
                      </div>
                      <div style={S(`font-size:11px; color:#8A929C; margin-top:5px;`)}>{m.paceHint}</div>
                    </div>
                  </>)}
                </div>
              </React.Fragment>))}
            </div>
          </div>
        </>)}
        {V.hasAlerts && (<>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:18px 20px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
            <div style={S(`display:flex; align-items:center; gap:9px; margin-bottom:14px;`)}>
              <span style={S(`font-size:16px; line-height:1;`)}>📌</span>
              <h2 style={S(`margin:0; font-size:15px; font-weight:800;`)}>Alertas y señales</h2>
              <span style={S(`font-size:11px; color:#9AA1AB;`)}>lo que exige tu atención ahora</span>
            </div>
            <div style={S(`display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:10px;`)}>
              {(V.alerts||[]).map((a, _k2) => (<React.Fragment key={_k2}>
                <div style={S(`display:flex; align-items:flex-start; gap:11px; padding:12px 14px; border-radius:12px; background:${a.bg}; border:1px solid ${a.border};`)}>
                  <span className="num" style={S(`font-size:15px; line-height:1.2; color:${a.color}; flex-shrink:0;`)}>{a.icon}</span>
                  <div style={S(`min-width:0;`)}>
                    <div style={S(`font-size:13px; font-weight:800; color:${a.color}; line-height:1.3;`)}>{a.title}</div>
                    <div style={S(`font-size:12px; color:#5A6472; margin-top:3px; line-height:1.4;`)}>{a.msg}</div>
                  </div>
                </div>
              </React.Fragment>))}
            </div>
          </div>
        </>)}

        <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:16px;`)}>
          {(V.kpis||[]).map((k, _k3) => (<React.Fragment key={_k3}>
            <div style={S(`background:#fff; border-radius:16px; padding:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:13px;`)}>
                <div style={S(`width:8px; height:8px; border-radius:50%; background:${k.color};`)}></div>
                <span style={S(`font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:#7A828E;`)}>{k.label}</span>
              </div>
              <div className="num" style={S(`font-size:27px; font-weight:700; letter-spacing:-.02em; line-height:1;`)}>{k.value}</div>
              <div style={S(`margin-top:8px; display:flex; align-items:center; gap:7px; flex-wrap:wrap;`)}>
                {k.hasDelta && (<>
                  <span className="num" style={S(`display:inline-flex; align-items:center; font-size:11px; font-weight:800; color:${k.deltaColor}; background:${k.deltaBg}; padding:2px 7px; border-radius:20px;`)}>{k.deltaTxt}</span>
                  <span style={S(`font-size:11px; color:#9AA1AB;`)}>vs {k.prevLabel}</span>
                </>)}
                <span style={S(`font-size:12.5px; color:#6B7280;`)}>{k.sub}</span>
              </div>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:14px; font-size:12.5px; color:#8A93A0;`)}>
          <span style={S(`display:inline-flex; align-items:center; justify-content:center; width:17px; height:17px; border-radius:50%; background:#E7ECF2; color:#6B7686; font-size:11px; font-weight:800;`)}>i</span>
          <span>Haz clic en cualquier segmento de los gráficos (tipo, canal o etapa) para filtrar todo el tablero de forma cruzada.</span>
        </div>
        {V.hasActiveFilters && (<>
          <div style={S(`display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; padding:11px 14px; background:#EEF4FF; border:1px solid #D6E2F5; border-radius:12px;`)}>
            <span style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#5A7CB0;`)}>Filtros activos</span>
            {(V.activeFilters||[]).map((af, _k4) => (<React.Fragment key={_k4}>
              <button onClick={af.onClear} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #C3D4EC; background:#fff; color:#2C4C7A; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:5px 11px; border-radius:20px;`)}>{af.label} <span style={S(`font-size:12px; line-height:1;`)}>✕</span></button>
            </React.Fragment>))}
            <button onClick={V.clearAllFilters} style={S(`cursor:pointer; margin-left:auto; border:none; background:transparent; color:#5A7CB0; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; text-decoration:underline;`)}>Limpiar todo</button>
          </div>
        </>)}

        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
          <div style={S(`display:flex; align-items:center; gap:9px; margin-bottom:4px;`)}>
            <span style={S(`font-size:18px; line-height:1;`)}>🏆</span>
            <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Cuadro de Honor</h2>
          </div>
          <p style={S(`margin:0 0 16px; font-size:12px; color:#8A929C; line-height:1.45;`)}>Top 1 combinado: puesto (#) en <strong style={S(`color:#137A5B;`)}>Recaudo</strong>, <strong style={S(`color:#2C6E9B;`)}>Operaciones</strong> y <strong style={S(`color:#B7862B;`)}>Monto</strong> — gana el menor puntaje.</p>
          <div style={S(`display:flex; align-items:center; gap:18px; background:#F1F8F4; border:1px solid #BFE0CE; border-radius:14px; padding:12px 16px; margin-bottom:14px; flex-wrap:wrap;`)}>
            <div style={S(`display:flex; align-items:center; gap:11px; min-width:0; flex:1 1 280px;`)}>
              <div style={S(`font-size:25px; line-height:1;`)}>🥇</div>
              <div style={S(`min-width:0;`)}>
                <div style={S(`font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#137A5B;`)}>Top 1 combinado</div>
                <div style={S(`font-size:16px; font-weight:800; color:#0B3D2E; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{V.honorTop1Name}</div>
                <div style={S(`font-size:10.5px; color:#5A6472; margin-top:1px; line-height:1.35;`)}>{V.honorTop1Why}</div>
              </div>
            </div>
            <div style={S(`display:flex; gap:20px; flex-wrap:wrap;`)}>
              {(V.honorLeaders||[]).map((l, _k5) => (<React.Fragment key={_k5}>
                <div style={S(`display:flex; align-items:center; gap:8px; min-width:0;`)}>
                  <span style={S(`width:8px; height:8px; border-radius:50%; background:${l.color}; flex-shrink:0;`)}></span>
                  <div style={S(`min-width:0;`)}>
                    <div style={S(`font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:${l.color};`)}>{l.label}</div>
                    <div style={S(`font-size:12.5px; font-weight:800; color:#14171C; margin-top:1px; white-space:nowrap;`)}>{l.name} <span className="num" style={S(`font-weight:600; color:#8A929C; font-size:11px;`)}>{l.value}</span></div>
                  </div>
                </div>
              </React.Fragment>))}
            </div>
          </div>
          <div style={S(`display:grid; grid-template-columns:34px 1.6fr 1fr 74px 1fr 64px; gap:10px; padding:0 4px 6px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
            <span>#</span><span>Ejecutivo</span><span style={S(`text-align:right;`)}>Recaudo</span><span style={S(`text-align:right;`)}>Oper.</span><span style={S(`text-align:right;`)}>Monto</span><span style={S(`text-align:right;`)}>Puntaje</span>
          </div>
          {(V.honorTop||[]).map((h, _k6) => (<React.Fragment key={_k6}>
            <div style={S(`display:grid; grid-template-columns:34px 1.6fr 1fr 74px 1fr 64px; gap:10px; align-items:center; padding:7px 4px; border-bottom:1px solid #F2F4F6; background:${h.rowBg};`)}>
              <span className="num" style={S(`font-size:13px; font-weight:800; white-space:nowrap;`)}>{h.medal}{h.pos}</span>
              <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                <div style={S(`width:26px; height:26px; border-radius:7px; background:${h.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)} className="num">{h.initials}</div>
                <div style={S(`min-width:0;`)}>
                  <div style={S(`font-size:13.5px; font-weight:700; color:${h.nameColor}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{h.name}</div>
                  <div style={S(`font-size:10.5px; color:#9AA1AB;`)}>{h.eq}</div>
                </div>
              </div>
              <span className="num" style={S(`text-align:right; font-size:13px; color:#475063; white-space:nowrap;`)}>{h.rec} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{h.rRec}</span></span>
              <span className="num" style={S(`text-align:right; font-size:13px; color:#475063; white-space:nowrap;`)}>{h.ops} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{h.rOps}</span></span>
              <span className="num" style={S(`text-align:right; font-size:13px; color:#475063; white-space:nowrap;`)}>{h.monto} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{h.rMonto}</span></span>
              <span className="num" style={S(`text-align:right; font-size:14px; font-weight:800; color:#0B3D2E;`)}>{h.score}</span>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`display:grid; grid-template-columns:1.55fr 1fr; gap:16px; margin-bottom:16px;`)}>
          
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap;`)}>
              <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Ranking TOP de Ejecutivos</h2>
              <div style={S(`display:flex; gap:4px; background:#F2F4F6; border-radius:9px; padding:3px;`)}>
                {(V.rankBtns||[]).map((b, _k7) => (<React.Fragment key={_k7}>
                  <button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button>
                </React.Fragment>))}
              </div>
            </div>
            <div style={S(`display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:14px;`)}>
              {(V.podium||[]).map((p, _k8) => (<React.Fragment key={_k8}>
                <div style={S(`${p.cardStyle}`)}>
                  <div style={S(`display:flex; justify-content:space-between; align-items:flex-start;`)}>
                    <div style={S(`width:34px; height:34px; border-radius:10px; background:${p.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px;`)} className="num">{p.initials}</div>
                    <span className="num" style={S(`font-size:25px; font-weight:700; color:${p.rankColor}; line-height:1;`)}>{p.rank}</span>
                  </div>
                  <div style={S(`margin-top:9px; font-size:14px; font-weight:700;`)}>{p.name}</div>
                  <div className="num" style={S(`margin-top:2px; font-size:17px; font-weight:700; letter-spacing:-.01em;`)}>{p.metric}</div>
                  <div style={S(`margin-top:2px; font-size:11px; color:#6B7280;`)}>{p.sub}</div>
                </div>
              </React.Fragment>))}
            </div>
            <div style={S(`display:grid; grid-template-columns:26px 1.4fr 1fr 70px 1fr; gap:10px; padding:0 4px 8px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
              <span>#</span><span>Ejecutivo</span><span style={S(`text-align:right;`)}>Recaudo</span><span style={S(`text-align:right;`)}>Oper.</span><span style={S(`text-align:right;`)}>Monto</span>
            </div>
            {(V.ranking||[]).map((r, _k9) => (<React.Fragment key={_k9}>
              <div style={S(`display:grid; grid-template-columns:26px 1.4fr 1fr 70px 1fr; gap:10px; align-items:center; padding:7px 4px; border-bottom:1px solid #F2F4F6;`)}>
                <span className="num" style={S(`font-size:13px; font-weight:700; color:#A9B0BA;`)}>{r.rank}</span>
                <div style={S(`min-width:0;`)}>
                  <div style={S(`display:flex; align-items:center; gap:9px;`)}>
                    <div style={S(`width:26px; height:26px; border-radius:7px; background:${r.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)} className="num">{r.initials}</div>
                    <div style={S(`min-width:0;`)}>
                      <div style={S(`font-size:13.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{r.name}</div>
                      <div style={S(`font-size:10.5px; color:#9AA1AB;`)}>{r.equipo}</div>
                    </div>
                  </div>
                  <div style={S(`height:5px; border-radius:3px; background:#EEF0F3; margin-top:8px; overflow:hidden;`)}>
                    <div style={S(`height:100%; border-radius:3px; background:${r.color}; width:${r.pct};`)}></div>
                  </div>
                </div>
                <span className="num" style={S(`text-align:right; font-size:13.5px; font-weight:700;`)}>{r.recaudo}</span>
                <span className="num" style={S(`text-align:right; font-size:13.5px; color:#475063;`)}>{r.unidades}</span>
                <span className="num" style={S(`text-align:right; font-size:13.5px; color:#475063;`)}>{r.monto}</span>
              </div>
            </React.Fragment>))}
          </div>

          
          <div style={S(`display:flex; flex-direction:column; gap:16px;`)}>
            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <h2 style={S(`margin:0 0 16px; font-size:15px; font-weight:800;`)}>Tipo de Compra</h2>
              {(V.byTipo||[]).map((t, _k10) => (<React.Fragment key={_k10}>
                <div onClick={t.onClick} style={S(`${t.rowStyle}`)}>
                  <div style={S(`display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;`)}>
                    <span style={S(`font-size:12.5px; font-weight:600;`)}>{t.label}</span>
                    <span className="num" style={S(`font-size:12.5px; color:#6B7280;`)}>{t.value} · {t.count}</span>
                  </div>
                  <div style={S(`height:8px; border-radius:4px; background:#F0F2F5; overflow:hidden;`)}>
                    <div style={S(`height:100%; border-radius:4px; background:${t.color}; width:${t.pct};`)}></div>
                  </div>
                </div>
              </React.Fragment>))}
            </div>
            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <h2 style={S(`margin:0 0 16px; font-size:15px; font-weight:800;`)}>Canal de Captación</h2>
              {(V.byCanal||[]).map((c, _k11) => (<React.Fragment key={_k11}>
                <div onClick={c.onClick} style={S(`${c.rowStyle}`)}>
                  <div style={S(`display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;`)}>
                    <span style={S(`font-size:12.5px; font-weight:600;`)}>{c.label}</span>
                    <span className="num" style={S(`font-size:12.5px; color:#6B7280;`)}>{c.count}</span>
                  </div>
                  <div style={S(`height:8px; border-radius:4px; background:#F0F2F5; overflow:hidden;`)}>
                    <div style={S(`height:100%; border-radius:4px; background:${c.color}; width:${c.pct};`)}></div>
                  </div>
                </div>
              </React.Fragment>))}
            </div>
          </div>
        </div>

        <div style={S(`display:grid; grid-template-columns:1.55fr 1fr; gap:16px; margin-bottom:16px;`)}>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; flex-wrap:wrap;`)}>
              <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Tendencia por Periodo</h2>
              <div style={S(`display:flex; gap:4px; background:#F2F4F6; border-radius:9px; padding:3px;`)}>
                {(V.trendBtns||[]).map((b, _k12) => (<React.Fragment key={_k12}>
                  <button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button>
                </React.Fragment>))}
              </div>
            </div>
            <div style={S(`font-size:11.5px; font-weight:700; color:#7A828E; text-transform:uppercase; letter-spacing:.05em; margin-bottom:14px;`)}>{V.trendLabel}</div>
            <div style={S(`display:flex; align-items:flex-end; gap:14px; height:190px; padding-top:10px;`)}>
              {(V.byPeriodo||[]).map((p, _k13) => (<React.Fragment key={_k13}>
                <div style={S(`flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;`)}>
                  <span className="num" style={S(`font-size:11.5px; font-weight:700; color:#14171C;`)}>{p.value}</span>
                  <div style={S(`width:100%; max-width:54px; border-radius:8px 8px 3px 3px; background:${p.color}; height:${p.h};`)}></div>
                  <span className="num" style={S(`font-size:11px; color:#9AA1AB;`)}>{p.label}</span>
                </div>
              </React.Fragment>))}
            </div>
          </div>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <h2 style={S(`margin:0 0 18px; font-size:17px; font-weight:800;`)}>Distribución por Etapa</h2>
            {(V.byEtapa||[]).map((e, _k14) => (<React.Fragment key={_k14}>
              <div onClick={e.onClick} style={S(`${e.rowStyle}`)}>
                <div style={S(`width:46px; height:46px; border-radius:12px; background:${e.bg}; color:${e.color}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px;`)} className="num">{e.label}</div>
                <div style={S(`flex:1; min-width:0;`)}>
                  <div style={S(`font-size:13px; font-weight:700;`)}>{e.name}</div>
                  <div className="num" style={S(`font-size:12px; color:#6B7280; margin-top:2px;`)}>{e.count} unid. · {e.value}</div>
                </div>
                <span className="num" style={S(`font-size:20px; font-weight:700; color:${e.color};`)}>{e.pctLabel}</span>
              </div>
            </React.Fragment>))}
            <div style={S(`margin-top:14px; padding-top:14px; border-top:1px solid #EEF0F3; display:flex; flex-direction:column; gap:10px;`)}>
              <div style={S(`display:flex; justify-content:space-between;`)}>
                <span style={S(`font-size:12.5px; color:#6B7280;`)}>Velocidad de cierre prom.</span>
                <span className="num" style={S(`font-size:14px; font-weight:700;`)}>{V.velCierre}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
          <div style={S(`display:flex; align-items:baseline; justify-content:space-between; margin-bottom:4px;`)}>
            <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Indicadores de Salud Comercial</h2>
            <span style={S(`font-size:11.5px; font-weight:700; color:#7A828E; text-transform:uppercase; letter-spacing:.05em;`)}>Sobre la selección actual</span>
          </div>
          <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:16px;`)}>
            {(V.healthRings||[]).map((g, _k15) => (<React.Fragment key={_k15}>
              <div style={S(`display:flex; align-items:center; gap:14px; padding:8px 2px;`)}>
                <div style={S(`position:relative; width:100px; height:100px; flex-shrink:0;`)}>
                  <svg width="100" height="100" viewBox="0 0 120 120" style={S(`transform:rotate(-90deg);`)}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#EEF0F3" strokeWidth="12"></circle>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={g.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={g.circ} strokeDashoffset={g.off}></circle>
                  </svg>
                  <div style={S(`position:absolute; inset:0; display:flex; align-items:center; justify-content:center;`)}>
                    <span className="num" style={S(`font-size:21px; font-weight:800; color:#14171C;`)}>{g.value}</span>
                  </div>
                </div>
                <div style={S(`min-width:0;`)}>
                  <div style={S(`font-size:14px; font-weight:800; color:#14171C;`)}>{g.label}</div>
                  <div style={S(`font-size:12px; color:#6B7280; margin-top:3px;`)}>{g.sub}</div>
                </div>
              </div>
            </React.Fragment>))}
          </div>
        </div>

      </div>
    </>)
); }
function COperaciones(props){ const V = props.V; return (
V.isOperaciones && (<>
      <div data-screen-label="Operaciones">

        
        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04); overflow:hidden;`)}>
          <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; padding:20px 22px 14px;`)}>
            <div style={S(`display:flex; align-items:baseline; gap:10px;`)}>
              <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Detalle de Operaciones</h2>
              <span className="num" style={S(`font-size:12px; color:#7A828E;`)}>{V.tableRangeLabel}</span>
              <span style={S(`font-size:11.5px; color:#8A93A0;`)}>· Marca las casillas para <strong style={S(`color:#0B3D2E;`)}>editar en lote</strong>, o toca <strong style={S(`color:#137A5B;`)}>1ª Vista</strong> / <strong style={S(`color:#2C6E9B;`)}>Líder</strong> al instante</span>
            </div>
            <div style={S(`display:flex; align-items:center; gap:8px;`)}>
              <button onClick={V.openImport} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #C6D3E4; background:#fff; color:#2C5A8A; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:7px 12px; border-radius:9px;`)}>⬆ Importar CSV</button>
              <button onClick={V.exportVentas} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:7px 12px; border-radius:9px;`)}>⬇ Exportar CSV</button>
              <label style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB;`)}>Periodo</label>
              <select value={V.tablePeriodVal} onChange={V.onTablePeriod} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:7px 11px; border-radius:9px; border:1px solid #D7DBE0; background:#fff; color:#14171C;`)}>
                {(V.tablePeriodOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
              </select>
            </div>
          </div>
          <div style={S(`display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:0 22px 16px;`)}>
            <div style={S(`position:relative; flex:1; min-width:220px;`)}>
              <span style={S(`position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:13px; color:#9AA1AB;`)}>🔍</span>
              <input value={V.tableQuery} onChange={V.onTableQuery} placeholder="Buscar por ejecutivo, cliente, lote o canal…" style={S(`width:100%; padding:9px 12px 9px 34px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff;`)} />
            </div>
            <select value={V.tableTipoVal} onChange={V.onTableTipo} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:8px 11px; border-radius:9px; border:1px solid #D7DBE0; background:#fff; color:#14171C;`)}>
              {(V.tableTipoOpts||[]).map((o, _k1) => (<React.Fragment key={_k1}><option value={o.v}>{o.l}</option></React.Fragment>))}
            </select>
            <select value={V.tableCanalVal} onChange={V.onTableCanal} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:12.5px; font-weight:700; padding:8px 11px; border-radius:9px; border:1px solid #D7DBE0; background:#fff; color:#14171C;`)}>
              {(V.tableCanalOpts||[]).map((o, _k2) => (<React.Fragment key={_k2}><option value={o.v}>{o.l}</option></React.Fragment>))}
            </select>
            {V.tableFiltersActive && (<>
              <button onClick={V.clearTableFilters} style={S(`cursor:pointer; border:none; background:#F2F4F6; color:#6B7280; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 13px; border-radius:9px;`)}>✕ Limpiar</button>
            </>)}
          </div>
          {V.hasSel && (<>
            <div style={S(`display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:11px 22px; background:#0B3D2E; color:#fff;`)}>
              <span style={S(`font-size:12.5px; font-weight:800; white-space:nowrap;`)}>{V.selCount} seleccionada(s)</span>
              <span style={S(`width:1px; height:20px; background:rgba(255,255,255,.22);`)}></span>
              <span style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#9FD8C2;`)}>1ª Vista</span>
              <button onClick={V.bulkVisitoOn} style={S(`cursor:pointer; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.12); color:#fff; font-family:'Manrope',sans-serif; font-size:12px; font-weight:800; padding:5px 10px; border-radius:8px;`)}>✓</button>
              <button onClick={V.bulkVisitoOff} style={S(`cursor:pointer; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.12); color:#fff; font-family:'Manrope',sans-serif; font-size:12px; font-weight:800; padding:5px 10px; border-radius:8px;`)}>✕</button>
              <span style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#9FD8C2; margin-left:4px;`)}>Líder</span>
              <button onClick={V.bulkLiderOn} style={S(`cursor:pointer; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.12); color:#fff; font-family:'Manrope',sans-serif; font-size:12px; font-weight:800; padding:5px 10px; border-radius:8px;`)}>✓</button>
              <button onClick={V.bulkLiderOff} style={S(`cursor:pointer; border:1px solid rgba(255,255,255,.28); background:rgba(255,255,255,.12); color:#fff; font-family:'Manrope',sans-serif; font-size:12px; font-weight:800; padding:5px 10px; border-radius:8px;`)}>✕</button>
              <span style={S(`width:1px; height:20px; background:rgba(255,255,255,.22);`)}></span>
              <select value={V.bulkTipoVal} onChange={V.bulkTipo} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:11.5px; font-weight:700; padding:5px 9px; border-radius:8px; border:1px solid rgba(255,255,255,.28); background:#fff; color:#14171C;`)}><option value="">Estado…</option>{(V.bulkTipoOpts||[]).map((o, _k3) => (<React.Fragment key={_k3}><option value={o}>{o}</option></React.Fragment>))}</select>
              <select value={V.bulkCanalVal} onChange={V.bulkCanal} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:11.5px; font-weight:700; padding:5px 9px; border-radius:8px; border:1px solid rgba(255,255,255,.28); background:#fff; color:#14171C;`)}><option value="">Canal…</option>{(V.bulkCanalOpts||[]).map((o, _k4) => (<React.Fragment key={_k4}><option value={o}>{o}</option></React.Fragment>))}</select>
              <button onClick={V.bulkRemoveFn} style={S(`cursor:pointer; border:1px solid rgba(255,150,130,.5); background:rgba(255,120,100,.18); color:#FFD9CF; font-family:'Manrope',sans-serif; font-size:12px; font-weight:800; padding:5px 10px; border-radius:8px;`)}>🗑 Eliminar</button>
              <button onClick={V.clearSelFn} style={S(`margin-left:auto; cursor:pointer; border:none; background:transparent; color:#CFE7DC; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; text-decoration:underline;`)}>Limpiar</button>
            </div>
          </>)}
          <div style={S(`overflow-x:auto;`)}>
            <div style={S(`min-width:1080px;`)}>
              <div style={S(`display:grid; grid-template-columns:28px 26px 54px 0.95fr 1.35fr 1fr 42px 0.9fr 0.9fr 54px 54px 0.9fr; gap:8px; padding:8px 18px; background:#F7F8FA; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-top:1px solid #EEF0F3; border-bottom:1px solid #EEF0F3;`)}>
                <span style={S(`display:flex; align-items:center; justify-content:center;`)}><input type="checkbox" checked={V.allVisSelected} onChange={V.onSelectAllVisible} title="Seleccionar todo lo visible" style={S(`width:15px; height:15px; accent-color:#0B3D2E; cursor:pointer;`)} /></span><span></span><span>Periodo</span><span>Ejecutivo</span><span style={S(`width: 225px`)}>Cliente</span><span>Canal</span><span>Lote</span><span style={S(`text-align:right;`)}>P. Final</span><span style={S(`text-align:right;`)}>Recaudo</span><span style={S(`text-align:center;`)}>1ª Vista</span><span style={S(`text-align:center;`)}>Líder</span><span>Estado</span>
              </div>
              {(V.table||[]).map((row, _k5) => (<React.Fragment key={_k5}>
                <div>
                  <div onClick={row.onToggle} style={S(`display:grid; grid-template-columns:28px 26px 54px 0.95fr 1.35fr 1fr 42px 0.9fr 0.9fr 54px 54px 0.9fr; gap:8px; padding:7px 18px; align-items:center; border-bottom:1px solid #F4F5F7; font-size:11.5px; cursor:pointer;`)}>
                    <span onClick={row.onSelStop} style={S(`display:flex; align-items:center; justify-content:center;`)}><input type="checkbox" checked={row.selected} onChange={row.onSelect} style={S(`width:15px; height:15px; accent-color:#0B3D2E; cursor:pointer;`)} /></span>
                    <span style={S(`color:#B0B7C0; font-size:11px;`)}>{row.chevron}</span>
                    <span className="num" style={S(`color:#475063; font-weight:600;`)}>{row.periodo}</span>
                    <span style={S(`font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{row.ejecutivo}</span><span style={S(`color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 225px`)}>{row.cliente}</span>
                    
                    <span style={S(`color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{row.canal}</span>
                    <span className="num" style={S(`color:#475063;`)}>{row.lote}</span>
                    <span className="num" style={S(`text-align:right; font-weight:700;`)}>{row.final}</span>
                    <span onClick={row.onRecaudoStop} style={S(`display:flex; align-items:center; justify-content:flex-end; gap:1px;`)} title="Editar recaudo — clic y escribe">
                      <span style={S(`color:#AAB1BB; font-size:9.5px; font-weight:600;`)}>S/</span>
                      <input type="text" inputMode="numeric" autoComplete="off" value={row.recaudoVal} onChange={row.onRecaudoChange} onClick={row.onRecaudoStop} onBlur={row.onRecaudoCommit} onKeyDown={row.onRecaudoKey} style={S(`width:100%; max-width:74px; text-align:right; font-family:'Manrope',sans-serif; font-size:11.5px; font-weight:600; color:#475063; border:1px solid transparent; border-radius:6px; background:transparent; padding:3px 5px;`)} />
                    </span>
                    <span style={S(`text-align:center;`)}><button onClick={row.onToggleVisito} title="Marcar visita al proyecto" style={S(`${row.visitaChipStyle}`)}>{row.visitoShort}</button></span>
                    <span style={S(`text-align:center;`)}><button onClick={row.onToggleLider} title="Marcar participación del líder" style={S(`${row.liderChipStyle}`)}>{row.liderShort}</button></span>
                    <span><span style={S(`${row.tipoStyle}`)}>{row.tipo}</span></span>
                  </div>
                  {row.expanded && (<>
                    <div style={S(`padding:16px 22px 20px 48px; background:#FAFBFC; border-bottom:1px solid #EEF0F3;`)}>
                      <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px 18px; margin-bottom:14px;`)}>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Equipo</div><div style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.equipo}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Canal de captación</div><div style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.canal}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Precio lista</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.lista}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Descuento</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#B0593C;`)}>{row.descuento}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Fecha separación</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.fSep}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Fecha cierre</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.fFirma}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Días de cierre</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{row.dias}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Recaudo</div><div className="num" style={S(`font-size:13px; font-weight:600; color:#137A5B;`)}>{row.recaudo}</div></div>
                        <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Visitó el proyecto</div><div style={S(`font-size:13px; font-weight:700; color:${row.visitoColor};`)}>{row.visito}</div></div>
                      </div>
                      {row.isSep && (<>
                        <div style={S(`margin-bottom:16px; padding:13px 15px; background:#F5F9FD; border:1px solid #CFE0F0; border-radius:11px; display:flex; flex-wrap:wrap; gap:26px; align-items:center;`)}>
                          <div style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#2C6E9B;`)}>Separación</div>
                          <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Fecha que completa inicial</div><div className="num" style={S(`font-size:13px; font-weight:700; color:${row.fIniColor};`)}>{row.fIni}</div></div>
                          <div><div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:3px;`)}>Modalidad de compra</div><div style={S(`font-size:13px; font-weight:700; color:${row.modCompraColor};`)}>{row.modCompra}</div></div>
                        </div>
                      </>)}
                      {row.isFrac && (<>
                        <div style={S(`margin-bottom:16px; padding:12px 14px; background:#fff; border:1px solid #EEF0F3; border-radius:11px;`)}>
                          <div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:8px;`)}>Cuotas de la inicial</div>
                          <div style={S(`display:flex; flex-direction:column; gap:6px;`)}>
                            {(row.cuotas||[]).map((c, _k6) => (<React.Fragment key={_k6}>
                              <div style={S(`display:grid; grid-template-columns:36px 1fr 1fr 90px; gap:10px; align-items:center; font-size:12px;`)}>
                                <span className="num" style={S(`color:#9AA1AB;`)}>#{c.num}</span>
                                <span className="num" style={S(`font-weight:700; color:#14171C;`)}>{c.monto}</span>
                                <span className="num" style={S(`color:#6B7280;`)}>{c.fecha}</span>
                                <span style={S(`font-weight:700; color:${c.estadoColor};`)}>{c.estado}</span>
                              </div>
                            </React.Fragment>))}
                          </div>
                        </div>
                      </>)}
                      {row.canEdit && (<>
                        <div style={S(`display:flex; gap:8px;`)}>
                          <button onClick={row.onEdit} style={S(`cursor:pointer; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 16px; border-radius:9px;`)}>✎ Editar operación</button>
                          <button onClick={row.onRemove} style={S(`cursor:pointer; border:1px solid #ECEFF2; background:#fff; color:#C0563A; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:8px 16px; border-radius:9px;`)}>✕ Eliminar</button>
                        </div>
                      </>)}
                      {row.isSeed && (<>
                        <div style={S(`font-size:12px; color:#9AA1AB; font-style:italic;`)}>Operación de ejemplo — no editable. Registra tus propias ventas para poder editarlas.</div>
                      </>)}
                    </div>
                  </>)}
                </div>
              </React.Fragment>))}
            </div>
          </div>
          {V.tableHasPages && (<>
            <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 22px; border-top:1px solid #EEF0F3;`)}>
              <span style={S(`font-size:12.5px; color:#7A828E;`)}>{V.tablePageLabel}</span>
              <div style={S(`display:flex; gap:8px;`)}>
                <button onClick={V.tablePrev} style={S(`${V.tablePrevStyle}`)}>‹ Anterior</button>
                <button onClick={V.tableNext} style={S(`${V.tableNextStyle}`)}>Siguiente ›</button>
              </div>
            </div>
          </>)}
        </div>
      </div>
    </>)
); }

Object.assign(window, { CForm, CTablero, COperaciones });
