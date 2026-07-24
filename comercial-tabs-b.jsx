// AUTO-PORT: bloques de UI del tablero Comercial (Ventas Nápoles) → JSX MATTIKA.
// Generado desde la plantilla DC; el look verde/Manrope se remapea a azul/Montserrat vía S().
const S = window.__csS;

function CUbicaciones(props){ const V = props.V; return (
V.isUbicaciones && (<>
      <div data-screen-label="Historial de ubicaciones">
        <div style={S(`margin-bottom:16px;`)}>
          <h2 style={S(`margin:0 0 4px; font-size:19px; font-weight:800; letter-spacing:-.01em;`)}>Historial de Ubicaciones</h2>
          <p style={S(`margin:0; font-size:13px; color:#6B7280;`)}>Trayectoria de cada lote: cuánto tiempo lleva ocupado, a nombre de quién está separado y cuántas veces se liberó o se vendió.</p>
        </div>

        <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px;`)}>
          {(V.ubiKpis||[]).map((k, _k0) => (<React.Fragment key={_k0}>
            <div style={S(`background:#fff; border-radius:16px; border:1px solid #E6E8EC; padding:16px 18px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <div style={S(`font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB;`)}>{k.label}</div>
              <div className="num" style={S(`font-size:26px; font-weight:800; margin:5px 0 2px; color:${k.color};`)}>{k.value}</div>
              <div style={S(`font-size:11.5px; color:#8A929C;`)}>{k.sub}</div>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04); overflow:hidden;`)}>
          <div style={S(`display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:16px 20px; border-bottom:1px solid #EEF0F3;`)}>
            <input value={V.ubiQuery} onChange={V.onUbiQuery} placeholder="Buscar lote, cliente o asesor…" style={S(`flex:1; min-width:200px; padding:9px 13px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; color:#14171C; background:#fff;`)} />
            <div style={S(`display:flex; gap:6px; flex-wrap:wrap;`)}>
              {(V.ubiEstadoBtns||[]).map((b, _k1) => (<React.Fragment key={_k1}><button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button></React.Fragment>))}
            </div>
            <div style={S(`display:flex; gap:4px; background:#EDEFF2; border-radius:10px; padding:4px;`)}>
              {(V.ubiSortBtns||[]).map((b, _k2) => (<React.Fragment key={_k2}><button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button></React.Fragment>))}
            </div>
          </div>

          <div style={S(`display:grid; grid-template-columns:26px 90px 1.1fr 1.3fr 1.1fr 70px 66px 66px; gap:10px; padding:10px 20px; background:#F7F8FA; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
            <span></span><span>Lote</span><span>Estado</span><span>A nombre de</span><span>Tiempo</span><span style={S(`text-align:center;`)}>Movs.</span><span style={S(`text-align:center;`)}>Liber.</span><span style={S(`text-align:center;`)}>Vend.</span>
          </div>

          {V.ubiEmpty && (<>
            <div style={S(`padding:48px 20px; text-align:center; color:#9AA1AB;`)}>
              <div style={S(`font-size:26px; margin-bottom:8px;`)}>🏷️</div>
              <div style={S(`font-size:14px; font-weight:700; color:#6B7280;`)}>Sin ubicaciones para el filtro seleccionado</div>
            </div>
          </>)}

          {(V.ubiList||[]).map((u, _k3) => (<React.Fragment key={_k3}>
            <div>
              <div onClick={u.onToggle} style={S(`display:grid; grid-template-columns:26px 90px 1.1fr 1.3fr 1.1fr 70px 66px 66px; gap:10px; align-items:center; padding:12px 20px; border-bottom:1px solid #F4F5F7; cursor:pointer; font-size:12.5px;`)}>
                <span style={S(`color:#B0B7C0; font-size:11px;`)}>{u.chevron}</span>
                <span className="num" style={S(`font-weight:800; color:#14171C;`)}>{u.key}</span>
                <span><span style={S(`${u.estadoChip}`)}>{u.estado}</span></span>
                <span style={S(`display:flex; align-items:center; gap:8px; min-width:0;`)}>
                  <span style={S(`width:26px; height:26px; border-radius:8px; background:${u.holderColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; flex-shrink:0; text-transform:uppercase;`)}>{u.holderInitials}</span>
                  <span style={S(`min-width:0;`)}><span style={S(`display:block; font-weight:700; color:#14171C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{u.holder}</span><span style={S(`display:block; font-size:11px; color:#8A929C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{u.holderEj}</span></span>
                </span>
                <span className="num" style={S(`color:#475063; font-weight:600;`)}>{u.tiempoLbl}</span>
                <span className="num" style={S(`text-align:center; font-weight:700; color:#475063;`)}>{u.vecesLbl}</span>
                <span className="num" style={S(`text-align:center; font-weight:800; color:${u.liberadaColor};`)}>{u.liberadaLbl}</span>
                <span className="num" style={S(`text-align:center; font-weight:800; color:${u.vendidaColor};`)}>{u.vendidaLbl}</span>
              </div>
              {u.expanded && (<>
                <div style={S(`padding:6px 20px 20px 56px; background:#FAFBFC; border-bottom:1px solid #EEF0F3;`)}>
                  <div style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB; margin:12px 0 10px;`)}>Línea de tiempo</div>
                  <div style={S(`display:flex; flex-direction:column; gap:0;`)}>
                    {(u.timeline||[]).map((t, _k4) => (<React.Fragment key={_k4}>
                      <div style={S(`display:grid; grid-template-columns:34px 1.2fr 1fr 1fr 1fr; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #F0F2F4;`)}>
                        <span style={S(`width:28px; height:28px; border-radius:8px; background:${t.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; text-transform:uppercase;`)}>{t.initials}</span>
                        <span style={S(`min-width:0;`)}><span style={S(`display:block; font-size:12.5px; font-weight:700; color:#14171C;`)}>{t.ej}</span><span style={S(`display:block; font-size:11.5px; color:#8A929C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{t.cli}</span></span>
                        <span style={S(`font-size:11.5px; font-weight:700; color:${t.stColor};`)}>{t.st}</span>
                        <span className="num" style={S(`font-size:11.5px; color:#6B7280;`)}>Sep. {t.fSep}</span>
                        <span className="num" style={S(`font-size:11.5px; color:#6B7280;`)}>Cierre {t.fCierre}</span>
                      </div>
                    </React.Fragment>))}
                  </div>
                </div>
              </>)}
            </div>
          </React.Fragment>))}
        </div>
      </div>
    </>)
); }
function CCuotas(props){ const V = props.V; return (
V.isCuotas && (<>
      <div data-screen-label="Iniciales">
        <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:14px;`)}>
          <div>
            <h2 style={S(`margin:0; font-size:18px; font-weight:800;`)}>Iniciales por Vencer</h2>
            <p style={S(`margin:3px 0 0; font-size:12.5px; color:#6B7280;`)}>Cuotas de la inicial aún no cobradas de las ventas fraccionadas. Respeta los filtros de equipo y asesor.</p>
          </div>
          <div style={S(`display:flex; gap:5px; background:#EDEFF2; border-radius:11px; padding:4px;`)}>
            {(V.cuotaModeBtns||[]).map((b, _k0) => (<React.Fragment key={_k0}>
              <button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button>
            </React.Fragment>))}
          </div>
        </div>

        <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:16px;`)}>
          {(V.cuotaKpis||[]).map((k, _k1) => (<React.Fragment key={_k1}>
            <div style={S(`background:#fff; border-radius:16px; border:1px solid #E6E8EC; padding:16px 18px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <div style={S(`width:26px; height:4px; border-radius:3px; background:${k.color}; margin-bottom:11px;`)}></div>
              <div style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB;`)}>{k.label}</div>
              <div className="num" style={S(`font-size:23px; font-weight:800; margin-top:5px; color:#14171C;`)}>{k.value}</div>
              <div style={S(`font-size:11.5px; color:#7A828E; margin-top:3px;`)}>{k.sub}</div>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04); overflow:hidden;`)}>
          <div style={S(`overflow-x:auto;`)}>
            <div style={S(`min-width:820px;`)}>
              <div style={S(`display:grid; grid-template-columns:4px 0.85fr 2fr 70px 60px 46px 1fr 130px 120px; gap:11px; padding:12px 22px; background:#F7F8FA; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3; align-items:center;`)}>
                <span></span><span>Ejecutivo</span><span>Cliente</span><span>Lote</span><span>Periodo</span><span style={S(`text-align:center;`)}>Cuota</span><span style={S(`text-align:right;`)}>Monto</span><span>Vence</span><span style={S(`text-align:center;`)}>Acción</span>
              </div>
              {(V.cuotaRows||[]).map((c, _k2) => (<React.Fragment key={_k2}>
                <div style={S(`display:grid; grid-template-columns:4px 0.85fr 2fr 70px 60px 46px 1fr 130px 120px; gap:11px; padding:13px 22px; align-items:center; border-bottom:1px solid #F4F5F7; font-size:12.5px;`)}>
                  <span style={S(`width:4px; height:34px; border-radius:3px; background:${c.barColor}; display:block;`)}></span>
                  <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                    <div className="num" style={S(`width:26px; height:26px; border-radius:7px; background:${c.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)}>{c.initials}</div>
                    <span style={S(`font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{c.ejecutivo}</span>
                  </div>
                  <span style={S(`color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{c.cliente}</span>
                  <span className="num" style={S(`color:#475063; font-weight:600;`)}>{c.lote}</span>
                  <span className="num" style={S(`color:#475063;`)}>{c.periodo}</span>
                  <span className="num" style={S(`text-align:center; color:#9AA1AB; font-weight:700;`)}>{c.cuotaNum}</span>
                  <span className="num" style={S(`text-align:right; font-weight:800; color:#14171C;`)}>{c.monto}</span>
                  <div style={S(`display:flex; flex-direction:column; gap:3px;`)}>
                    <span style={S(`${c.statusStyle}`)}>{c.stLabel}</span>
                    <span className="num" style={S(`font-size:11px; color:#9AA1AB;`)}>{c.fecha}</span>
                  </div>
                  <div style={S(`text-align:center;`)}>
                    <button onClick={c.onPay} style={S(`cursor:pointer; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:7px 13px; border-radius:9px; white-space:nowrap;`)}>✓ Marcar pagada</button>
                  </div>
                </div>
              </React.Fragment>))}
              {V.cuotaEmpty && (<>
                <div style={S(`padding:48px 22px; text-align:center; color:#9AA1AB; font-size:13.5px;`)}>No hay cuotas pendientes con este filtro. 🎉</div>
              </>)}
            </div>
          </div>
        </div>

        
        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04); overflow:hidden; margin-top:18px;`)}>
          <div style={S(`padding:18px 22px 14px;`)}>
            <div style={S(`display:flex; align-items:center; gap:9px;`)}>
              <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Separaciones por Completar Inicial</h2>
              <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#2C6E9B; background:#EAF2F9; padding:3px 9px; border-radius:20px;`)}>{V.sepCount} pendientes</span>
            </div>
            <p style={S(`margin:4px 0 0; font-size:12.5px; color:#6B7280;`)}>Reservas cuyo pago de la inicial aún no se completa, con su fecha límite y la modalidad de compra acordada. Ordenadas por fecha que completa la inicial.</p>
          </div>
          <div style={S(`overflow-x:auto;`)}>
            <div style={S(`min-width:900px;`)}>
              <div style={S(`display:grid; grid-template-columns:4px 0.85fr 2fr 66px 1.1fr 90px 130px 110px; gap:11px; padding:12px 22px; background:#F7F8FA; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3; align-items:center;`)}>
                <span></span><span>Ejecutivo</span><span>Cliente</span><span>Lote</span><span>Modalidad</span><span style={S(`text-align:right;`)}>Recaudo</span><span>Completa inicial</span><span style={S(`text-align:center;`)}>Acción</span>
              </div>
              {(V.sepList||[]).map((s, _k3) => (<React.Fragment key={_k3}>
                <div style={S(`display:grid; grid-template-columns:4px 0.85fr 2fr 66px 1.1fr 90px 130px 110px; gap:11px; padding:13px 22px; align-items:center; border-bottom:1px solid #F4F5F7; font-size:12.5px;`)}>
                  <span style={S(`width:4px; height:34px; border-radius:3px; background:${s.barColor}; display:block;`)}></span>
                  <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                    <div className="num" style={S(`width:26px; height:26px; border-radius:7px; background:${s.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)}>{s.initials}</div>
                    <span style={S(`font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{s.ejecutivo}</span>
                  </div>
                  <span style={S(`color:#6B7280; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{s.cliente}</span>
                  <span className="num" style={S(`color:#475063; font-weight:600;`)}>{s.lote}</span>
                  <span><span style={S(`display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; color:${s.modColor}; background:${s.modBg}; white-space:nowrap;`)}>{s.modalidad}</span></span>
                  <span className="num" style={S(`text-align:right; font-weight:800; color:#137A5B;`)}>{s.recaudo}</span>
                  <div style={S(`display:flex; flex-direction:column; gap:3px;`)}>
                    <span style={S(`${s.statusStyle}`)}>{s.stLabel}</span>
                    <span className="num" style={S(`font-size:11px; color:#9AA1AB;`)}>{s.fecha}</span>
                  </div>
                  <div style={S(`text-align:center;`)}>
                    {s.isUser && (<>
                      <button onClick={s.onEdit} style={S(`cursor:pointer; border:1px solid #C6D3E4; background:#fff; color:#2C5A8A; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:7px 13px; border-radius:9px; white-space:nowrap;`)}>✎ Completar</button>
                    </>)}
                    {s.isUser && (<></>)}
                  </div>
                </div>
              </React.Fragment>))}
              {V.sepEmpty && (<>
                <div style={S(`padding:40px 22px; text-align:center; color:#9AA1AB; font-size:13.5px;`)}>No hay separaciones pendientes con este filtro. 🎉</div>
              </>)}
            </div>
          </div>
        </div>
      </div>
    </>)
); }
function CEjecutivos(props){ const V = props.V; return (
V.isEjecutivos && (<>
      <div data-screen-label="Ejecutivos">
        <div style={S(`display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:16px;`)}>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <h2 style={S(`margin:0 0 4px; font-size:17px; font-weight:800;`)}>Base de Ejecutivos</h2>
            <p style={S(`margin:0 0 18px; font-size:13px; color:#6B7280;`)}>Posición por recaudo en el periodo seleccionado.</p>
            <div style={S(`display:grid; grid-template-columns:28px minmax(0,1.6fr) 72px 40px 76px 66px; gap:9px; padding:0 4px 8px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
              <span>Pos.</span><span>Ejecutivo</span><span>Equipo</span><span style={S(`text-align:right;`)}>Oper.</span><span style={S(`text-align:right;`)}>Recaudo</span><span></span>
            </div>
            {(V.ejeStats||[]).map((e, _k0) => (<React.Fragment key={_k0}>
              <div style={S(`display:grid; grid-template-columns:28px minmax(0,1.6fr) 72px 40px 76px 66px; gap:9px; align-items:center; padding:12px 4px; border-bottom:1px solid #F2F4F6;`)}>
                <span className="num" style={S(`font-size:15px; font-weight:700; color:${e.posColor};`)}>{e.pos}</span>
                <div style={S(`display:flex; align-items:center; gap:10px; min-width:0;`)}>
                  <div style={S(`width:30px; height:30px; border-radius:8px; background:${e.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; flex-shrink:0;`)} className="num">{e.initials}</div>
                  <span style={S(`font-size:13.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{e.name}</span>
                </div>
                <span style={S(`font-size:12px; color:#6B7280; white-space:nowrap;`)}>{e.equipo}</span>
                <span className="num" style={S(`text-align:right; font-size:13.5px; font-weight:700;`)}>{e.ops}</span>
                <span className="num" style={S(`text-align:right; font-size:13px; color:#475063; white-space:nowrap;`)}>{e.recaudo}</span>
                <span style={S(`display:flex; gap:5px; justify-content:flex-end;`)}><button onClick={e.onEdit} title="Editar" style={S(`${e.editStyle}`)}>✎</button><button onClick={e.onDelete} title="Quitar" style={S(`${e.delStyle}`)}>✕</button></span>
              </div>
            </React.Fragment>))}
          </div>
          {V.isEditingEje && (<>
            <div style={S(`background:#fff; border-radius:18px; border:1px solid #CFE0D8; padding:22px; box-shadow:0 8px 26px rgba(20,23,28,.08); align-self:flex-start;`)}>
              <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;`)}>
                <h2 style={S(`margin:0; font-size:16px; font-weight:800;`)}>Editar Ejecutivo</h2>
                <span style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#0B5C3F; background:#E7F2EC; padding:3px 9px; border-radius:20px;`)}>Editando</span>
              </div>
              <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Nombre</label>
              <input value={V.ev.name} onChange={V.onEditEjeName} placeholder="Nombre del ejecutivo" style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; width:100%; margin-bottom:14px;`)} />
              <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Equipo</label>
              <select value={V.ev.equipo} onChange={V.onEditEjeEquipo} style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; width:100%; background:#fff; margin-bottom:14px;`)}>
                <option value="E. Interno">E. Interno</option>
                <option value="E. Externo">E. Externo</option>
              </select>
              <div style={S(`font-size:11.5px; color:#9AA1AB; line-height:1.45; margin-bottom:16px;`)}>Al cambiar el nombre, tus ventas registradas de <strong style={S(`color:#475063;`)}>{V.editEjeName}</strong> se actualizan automáticamente.</div>
              <div style={S(`display:flex; gap:8px;`)}>
                <button onClick={V.saveEditEje} style={S(`flex:1; cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:13.5px; font-weight:700; padding:11px; border-radius:10px;`)}>Guardar cambios</button>
                <button onClick={V.cancelEditEje} style={S(`cursor:pointer; border:1px solid #D7DBE0; background:#fff; color:#475063; font-family:'Manrope',sans-serif; font-size:13.5px; font-weight:700; padding:11px 16px; border-radius:10px;`)}>Cancelar</button>
              </div>
              <div style={S(`margin-top:10px; font-size:12px; color:#D26A4C; font-weight:600; min-height:16px;`)}>{V.editEjeError}</div>
            </div>
          </>)}
          {V.notEditingEje && (<>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); align-self:flex-start;`)}>
            <h2 style={S(`margin:0 0 16px; font-size:16px; font-weight:800;`)}>Agregar Ejecutivo</h2>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Nombre</label>
            <input value={V.nv.name} onChange={V.nh.name} placeholder="Ej. Carla R." style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; width:100%; margin-bottom:14px;`)} />
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Equipo</label>
            <select value={V.nv.equipo} onChange={V.nh.equipo} style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; width:100%; background:#fff; margin-bottom:18px;`)}>
              <option value="E. Interno">E. Interno</option>
              <option value="E. Externo">E. Externo</option>
            </select>
            <button onClick={V.nh.add} style={S(`cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:13.5px; font-weight:700; padding:11px; border-radius:10px; width:100%;`)}>Agregar a la base</button>
            <div style={S(`margin-top:10px; font-size:12px; color:#D26A4C; font-weight:600; min-height:16px;`)}>{V.ejeError}</div>
          </div>
          </>)}
        </div>
      </div>
    </>)
); }
function CDescuentos(props){ const V = props.V; return (
V.isDescuentos && (<>
      <div data-screen-label="Descuentos">
        <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:14px;`)}>
          <div style={S(`display:flex; gap:5px; background:#EDEFF2; border-radius:11px; padding:4px;`)}>
            {(V.descModeBtns||[]).map((b, _k0) => (<React.Fragment key={_k0}>
              <button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button>
            </React.Fragment>))}
          </div>
          <div style={S(`flex:1; min-width:280px; font-size:12px; color:#8A6A1E; background:#FBF6E7; border:1px solid #EBDBA8; border-radius:10px; padding:9px 13px; line-height:1.4;`)}>{V.descModeNote}</div>
        </div>
        <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:16px;`)}>
          {(V.descKpis||[]).map((k, _k1) => (<React.Fragment key={_k1}>
            <div style={S(`background:#fff; border-radius:16px; padding:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:13px;`)}>
                <div style={S(`width:8px; height:8px; border-radius:50%; background:${k.color};`)}></div>
                <span style={S(`font-size:11.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:#7A828E;`)}>{k.label}</span>
              </div>
              <div className="num" style={S(`font-size:27px; font-weight:700; letter-spacing:-.02em; line-height:1;`)}>{k.value}</div>
              <div style={S(`margin-top:8px; font-size:12.5px; color:#6B7280;`)}>{k.sub}</div>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`display:grid; grid-template-columns:repeat(auto-fit, minmax(360px, 1fr)); gap:16px; margin-bottom:16px;`)}>
          
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <h2 style={S(`margin:0 0 4px; font-size:17px; font-weight:800;`)}>Descuentos por Ejecutivo</h2>
            <p style={S(`margin:0 0 16px; font-size:12.5px; color:#6B7280;`)}>Ordenado por descuento promedio otorgado. Excep. = ventas por encima del tope de la política.</p>
            <div style={S(`display:grid; grid-template-columns:1.9fr 52px 1fr 1fr 68px 60px; gap:10px; padding:0 4px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
              <span>Ejecutivo</span><span style={S(`text-align:right;`)}>Ops.</span><span style={S(`text-align:right;`)}>Desc. Total</span><span style={S(`text-align:right;`)}>Desc. Prom.</span><span style={S(`text-align:right;`)}>% Lista</span><span style={S(`text-align:center;`)}>Excep.</span>
            </div>
            {(V.descRows||[]).map((d, _k2) => (<React.Fragment key={_k2}>
              <div style={S(`display:grid; grid-template-columns:1.9fr 52px 1fr 1fr 68px 60px; gap:10px; align-items:center; padding:12px 4px; border-bottom:1px solid #F2F4F6;`)}>
                <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                  <div style={S(`width:28px; height:28px; border-radius:8px; background:${d.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10.5px; flex-shrink:0;`)} className="num">{d.initials}</div>
                  <div style={S(`min-width:0;`)}>
                    <div style={S(`font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{d.name}</div>
                    <div style={S(`display:flex; align-items:center; gap:6px; margin-top:2px;`)}>
                      <span style={S(`font-size:10.5px; color:#9AA1AB; white-space:nowrap;`)}>{d.equipo}</span>
                      {d.tagShow && (<><span style={S(`${d.tagBadge}`)}>{d.tag}</span></>)}
                    </div>
                  </div>
                </div>
                <span className="num" style={S(`text-align:right; font-size:13px; font-weight:700;`)}>{d.ops}</span>
                <span className="num" style={S(`text-align:right; font-size:13px; color:#475063;`)}>{d.descTotal}</span>
                <span className="num" style={S(`text-align:right; font-size:13px; font-weight:700; color:#7C5CC4;`)}>{d.descAvg}</span>
                <span className="num" style={S(`text-align:right; font-size:12.5px; color:#6B7280;`)}>{d.pct}</span>
                <span className="num" style={S(`${d.excStyle}`)}>{d.excLabel}</span>
              </div>
            </React.Fragment>))}
          </div>

          
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); align-self:flex-start;`)}>
            <h2 style={S(`margin:0 0 4px; font-size:16px; font-weight:800;`)}>Política de Descuentos</h2>
            <p style={S(`margin:0 0 14px; font-size:11.5px; color:#9AA1AB;`)}>Tope de descuento (S/) por modalidad. Puedes fijar una regla distinta para un mes específico.</p>
            <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:6px;`)}>
              <select value={V.descEditPeriod} onChange={V.onDescEditPeriod} style={S(`flex:1; padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:600; background:#fff;`)}>
                {(V.descPeriodOpts||[]).map((o, _k3) => (<React.Fragment key={_k3}><option value={o.v}>{o.l}</option></React.Fragment>))}
              </select>
              {V.descIsOverride && (<>
                <button onClick={V.resetDescPeriod} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#7A828E; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:8px 10px; border-radius:8px; white-space:nowrap;`)}>Usar base</button>
              </>)}
            </div>
            <div style={S(`font-size:11px; color:#9AA1AB; margin-bottom:16px;`)}>{V.descScopeLabel}</div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Máx. Fraccionamiento (S/)</label>
            <input value={V.descFracVal} onChange={V.onDescFrac} type="number" placeholder="0" style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:14px; width:100%; margin-bottom:14px;`)} />
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Máx. Contado (S/)</label>
            <input value={V.descContadoVal} onChange={V.onDescContado} type="number" placeholder="0" style={S(`padding:10px 12px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:14px; width:100%; margin-bottom:14px;`)} />
            <div style={S(`font-size:11.5px; color:#9AA1AB; line-height:1.45;`)}>La modalidad <strong style={S(`color:#475063;`)}>Separación</strong> usa el tope de Fraccionamiento. Se guarda en este navegador.</div>
          </div>
        </div>

        
        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
          <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:4px;`)}>
            <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Excepciones de Descuento</h2>
            <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#B0593C; background:#FBEDE8; padding:3px 8px; border-radius:20px;`)}>Sobre el tope</span>
          </div>
          <p style={S(`margin:0 0 16px; font-size:12.5px; color:#6B7280;`)}>Ventas cuyo descuento superó el límite de la política vigente en su mes.</p>
          {V.hasExc && (<>
            <div style={S(`display:grid; grid-template-columns:1.5fr 70px 1.1fr 1fr 1fr 1fr 1fr; gap:10px; padding:0 4px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
              <span>Ejecutivo</span><span>Lote</span><span>Modalidad</span><span>Periodo</span><span style={S(`text-align:right;`)}>Descuento</span><span style={S(`text-align:right;`)}>Tope</span><span style={S(`text-align:right;`)}>Exceso</span>
            </div>
            {(V.excList||[]).map((x, _k4) => (<React.Fragment key={_k4}>
              <div style={S(`display:grid; grid-template-columns:1.5fr 70px 1.1fr 1fr 1fr 1fr 1fr; gap:10px; align-items:center; padding:12px 4px; border-bottom:1px solid #F2F4F6;`)}>
                <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                  <div style={S(`width:26px; height:26px; border-radius:7px; background:${x.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)} className="num">{x.initials}</div>
                  <span style={S(`font-size:12.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{x.ej}</span>
                </div>
                <span className="num" style={S(`font-size:12.5px; color:#475063;`)}>{x.lote}</span>
                <span><span style={S(`${x.tipoStyle}`)}>{x.tipo}</span></span>
                <span className="num" style={S(`font-size:12px; color:#6B7280;`)}>{x.periodo}</span>
                <span className="num" style={S(`text-align:right; font-size:13px; font-weight:700;`)}>{x.desc}</span>
                <span className="num" style={S(`text-align:right; font-size:12.5px; color:#9AA1AB;`)}>{x.max}</span>
                <span className="num" style={S(`text-align:right; font-size:13px; font-weight:800; color:#B0593C;`)}>+{x.exceso}</span>
              </div>
            </React.Fragment>))}
          </>)}
          {V.hasExc && (<></>)}
          {V.noExc && (<>
            <div style={S(`text-align:center; padding:34px 20px; color:#137A5B;`)}>
              <div style={S(`font-size:26px; margin-bottom:8px;`)}>✓</div>
              <div style={S(`font-size:14px; font-weight:700;`)}>Sin excepciones en el periodo seleccionado</div>
              <div style={S(`font-size:12.5px; color:#9AA1AB; margin-top:4px;`)}>Todos los descuentos están dentro de la política.</div>
            </div>
          </>)}
        </div>
      </div>
    </>)
); }
function CCaptacion(props){ const V = props.V; return (
V.isCaptacion && (<>
      <div data-screen-label="Captacion">
        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px 22px; margin-bottom:16px; box-shadow:0 1px 2px rgba(20,23,28,.04); display:flex; align-items:flex-end; gap:20px; flex-wrap:wrap;`)}>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Periodo</label>
            <select value={V.leadsPeriod} onChange={V.onLeadsPeriod} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; color:#14171C; background:#fff; min-width:150px;`)}>
              {(V.leadsPeriodOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
            </select>
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Inversión Meta Ads (S/)</label>
            <input value={V.metaAdsVal} onChange={V.onMetaAds} type="number" placeholder="0" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; color:#14171C; background:#fff; width:160px;`)} />
          </div>
          <div>
            <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Costo objetivo por venta (S/)</label>
            <input value={V.targetCPAVal} onChange={V.onTargetCPA} type="number" placeholder="0" style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; color:#14171C; background:#fff; width:170px;`)} />
          </div>
          <div style={S(`flex:1; min-width:200px; font-size:12px; color:#9AA1AB; line-height:1.45;`)}>Los leads de Meta Ads se reparten entre el equipo interno. La eficiencia compara el costo por venta atribuida contra tu objetivo.</div>
        </div>

        <div style={S(`display:grid; grid-template-columns:repeat(6,1fr); gap:14px; margin-bottom:16px;`)}>
          {(V.adsKpis||[]).map((k, _k1) => (<React.Fragment key={_k1}>
            <div style={S(`background:#fff; border-radius:16px; padding:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
              <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:13px;`)}>
                <div style={S(`width:8px; height:8px; border-radius:50%; background:${k.color};`)}></div>
                <span style={S(`font-size:10.5px; font-weight:700; letter-spacing:.03em; text-transform:uppercase; color:#7A828E;`)}>{k.label}</span>
              </div>
              <div className="num" style={S(`font-size:23px; font-weight:700; letter-spacing:-.02em; line-height:1;`)}>{k.value}</div>
              <div style={S(`margin-top:8px; font-size:11.5px; color:#6B7280;`)}>{k.sub}</div>
            </div>
          </React.Fragment>))}
        </div>

        <div style={S(`${V.verdictBannerStyle}`)}>
          <div style={S(`${V.verdictIconStyle}`)}>{V.verdictIcon}</div>
          <div>
            <div style={S(`font-size:16px; font-weight:800; color:${V.verdictColor};`)}>{V.verdictLabel}</div>
            <div style={S(`font-size:13px; color:#475063; margin-top:3px; line-height:1.45;`)}>{V.verdictMsg}</div>
          </div>
        </div>

        <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; box-shadow:0 1px 2px rgba(20,23,28,.04); overflow:hidden;`)}>
          <div style={S(`display:flex; align-items:baseline; justify-content:space-between; padding:20px 22px 14px;`)}>
            <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Leads por Asesor Interno</h2>
            <span className="num" style={S(`font-size:12px; color:#7A828E;`)}>{V.leadsPeriodLabel}</span>
          </div>
          <div style={S(`overflow-x:auto;`)}>
            <div style={S(`min-width:720px;`)}>
              <div style={S(`display:grid; grid-template-columns:1.5fr 110px 80px 90px 1fr 96px; gap:12px; padding:10px 22px; background:#F7F8FA; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-top:1px solid #EEF0F3; border-bottom:1px solid #EEF0F3;`)}>
                <span>Asesor</span><span style={S(`text-align:center;`)}>Leads asignados</span><span style={S(`text-align:right;`)}>Ventas</span><span style={S(`text-align:right;`)}>Conv.</span><span style={S(`text-align:right;`)}>Costo/venta</span><span style={S(`text-align:center;`)}>Estado</span>
              </div>
              {(V.adsRows||[]).map((r, _k2) => (<React.Fragment key={_k2}>
                <div style={S(`display:grid; grid-template-columns:1.5fr 110px 80px 90px 1fr 96px; gap:12px; padding:12px 22px; align-items:center; border-bottom:1px solid #F4F5F7;`)}>
                  <div style={S(`display:flex; align-items:center; gap:10px; min-width:0;`)}>
                    <div style={S(`width:30px; height:30px; border-radius:8px; background:${r.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:11px; flex-shrink:0;`)} className="num">{r.initials}</div>
                    <span style={S(`font-size:13.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{r.name}</span>
                  </div>
                  <input value={r.leadsVal} onChange={r.onLeads} type="number" placeholder="0" style={S(`padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:700; color:#14171C; background:#fff; width:100%; text-align:center;`)} />
                  <span className="num" style={S(`text-align:right; font-size:13.5px; font-weight:700;`)}>{r.ventas}</span>
                  <span className="num" style={S(`text-align:right; font-size:13.5px; color:#475063;`)}>{r.conv}</span>
                  <span className="num" style={S(`text-align:right; font-size:13.5px; color:#475063;`)}>{r.cpa}</span>
                  <span style={S(`text-align:center;`)}><span style={S(`${r.vBadge}`)}>{r.vLabel}</span></span>
                </div>
              </React.Fragment>))}
            </div>
          </div>
        </div>
      </div>
    </>)
); }

Object.assign(window, { CUbicaciones, CCuotas, CEjecutivos, CDescuentos, CCaptacion });
