// AUTO-PORT: bloques de UI del tablero Comercial (Ventas Nápoles) → JSX MATTIKA.
// Generado desde la plantilla DC; el look verde/Manrope se remapea a azul/Montserrat vía S().
const S = window.__csS;

function CComisiones(props){ const V = props.V; return (
V.isComisiones && (<>
      <div data-screen-label="Comisiones">
        {V.comUnlocked && (<>
          <div>
            
            <div style={S(`display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:16px;`)}>
              <div style={S(`background:#0B3D2E; border-radius:16px; padding:20px; color:#fff;`)}>
                <div style={S(`font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9FD8C2;`)}>Comisión Total</div>
                <div className="num" style={S(`font-size:27px; font-weight:700; margin-top:10px;`)}>{V.comTotal}</div>
                <div style={S(`font-size:10.5px; color:#7FBBA3; margin-top:5px;`)}>a pagar hoy</div>
              </div>
              <div style={S(`background:#fff; border:1px solid #E6E8EC; border-radius:16px; padding:20px;`)}>
                <div style={S(`font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#7A828E;`)}>Comisión Base</div>
                <div className="num" style={S(`font-size:27px; font-weight:700; margin-top:10px;`)}>{V.comBase}</div>
                <div style={S(`font-size:10.5px; color:#9AA1AB; margin-top:5px;`)}>generada {V.comGen}</div>
              </div>
              <div style={S(`background:#fff; border:1px solid #EBD9A8; border-radius:16px; padding:20px;`)}>
                <div style={S(`font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#C49A3F;`)}>Bono Volumen</div>
                <div className="num" style={S(`font-size:27px; font-weight:700; margin-top:10px; color:#C49A3F;`)}>{V.comVol}</div>
              </div>
              <div style={S(`background:#fff; border:1px solid #BFD9CC; border-radius:16px; padding:20px;`)}>
                <div style={S(`font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#137A5B;`)}>Bono Velocidad</div>
                <div className="num" style={S(`font-size:27px; font-weight:700; margin-top:10px; color:#137A5B;`)}>{V.comSpeed}</div>
              </div>
            </div>

            {V.comHasReten && (<>
              <div style={S(`display:flex; align-items:center; gap:10px; background:#FBEDE8; border:1px solid #E9CFC4; border-radius:12px; padding:10px 14px; margin-bottom:16px;`)}>
                <span style={S(`font-size:14px;`)}>⏸</span>
                <span style={S(`font-size:12px; color:#8A3D22; font-weight:600; line-height:1.4;`)}>Retenido por prorrateo: <strong>{V.comPend}</strong> — se libera cuando el cliente complete el recaudo. El total mostrado ({V.comTotal}) es lo pagable hoy.</span>
              </div>
            </>)}

            <div style={S(`display:flex; align-items:center; gap:10px; margin-bottom:14px;`)}>
              <button onClick={V.toggleLider} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:7px; border:1px solid #D7DBE0; background:#fff; color:#0B3D2E; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:9px 14px; border-radius:10px;`)}><span style={S(`font-size:11px;`)}>{V.liderChev}</span> {V.liderToggleLabel}</button>
              <span style={S(`font-size:11.5px; color:#9AA1AB;`)}>Comisiones de liderazgo (Líder de equipo y gerencia)</span>
            </div>

            {V.showLider && (<>
            
            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
              <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:6px;`)}>
                <div style={S(`display:flex; align-items:center; gap:8px;`)}>
                  <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Comisión del Líder de Equipo</h2>
                  <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#C49A3F; background:#FBF3DF; padding:3px 8px; border-radius:20px;`)}>Privado</span>
                </div>
                <div style={S(`display:flex; align-items:center; gap:8px;`)}>
                  <select value={V.liderEditPeriod} onChange={V.onLiderPeriod} style={S(`padding:8px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; background:#fff; color:#14171C;`)}>
                    {(V.liderPeriodOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
                  </select>
                  {V.liderIsOverride && (<>
                    <button onClick={V.resetLiderPeriod} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#7A828E; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:8px 10px; border-radius:8px; white-space:nowrap;`)}>Usar base</button>
                  </>)}
                </div>
              </div>
              <p style={S(`margin:0 0 4px; font-size:12px; color:#6B7280; line-height:1.5;`)}>{V.liderNote}</p>
              <p style={S(`margin:0 0 12px; font-size:11px; color:#9AA1AB; font-weight:600;`)}>{V.liderScopeLabel}</p>
              <label style={S(`display:inline-flex; align-items:center; gap:9px; padding:8px 12px; border:1px solid #D7DBE0; border-radius:9px; background:#F7F8FA; cursor:pointer; font-size:12.5px; font-weight:600; color:#33383F; margin-bottom:14px;`)}>
                <input type="checkbox" checked={V.liderReqPart} onChange={V.onLiderReqPart} style={S(`width:16px; height:16px; accent-color:#0B3D2E; cursor:pointer;`)} />
                <span>Comisiona solo ventas con participación del líder</span>
              </label>
              <div style={S(`display:grid; grid-template-columns:1.5fr 88px 92px 1fr 1fr; gap:10px; padding:0 4px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
                <span>Equipo · Líder</span><span style={S(`text-align:center;`)}>% Com.</span><span style={S(`text-align:center;`)}>Mín und</span><span style={S(`text-align:right;`)}>Monto base</span><span style={S(`text-align:right;`)}>Comisión</span>
              </div>
              {(V.liderRows||[]).map((r, _k1) => (<React.Fragment key={_k1}>
                <div style={S(`display:grid; grid-template-columns:1.5fr 88px 92px 1fr 1fr; gap:10px; align-items:center; padding:12px 4px; border-bottom:1px solid #F2F4F6;`)}>
                  <div style={S(`display:flex; align-items:center; gap:10px; min-width:0;`)}>
                    <div style={S(`width:9px; height:9px; border-radius:3px; background:${r.color}; flex-shrink:0;`)}></div>
                    <div style={S(`min-width:0; flex:1;`)}>
                      <div style={S(`font-size:13px; font-weight:700;`)}>{r.label}</div>
                      <div style={S(`font-size:10.5px; font-weight:700; color:${r.statusColor}; margin-top:2px;`)}>{r.units} und · {r.statusLabel}</div>
                      <input value={r.name} onChange={r.onName} placeholder="Nombre del líder (opcional)" style={S(`margin-top:5px; padding:5px 8px; border:1px solid #E0E3E8; border-radius:7px; font-family:'Manrope',sans-serif; font-size:11.5px; color:#475063; background:#fff; width:100%; max-width:200px;`)} />
                    </div>
                  </div>
                  <div style={S(`position:relative;`)}>
                    <input value={r.pct} onChange={r.onPct} type="number" step="0.1" style={S(`padding:9px 20px 9px 8px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; width:100%; text-align:center;`)} />
                    <span style={S(`position:absolute; right:7px; top:11px; font-size:11px; color:#9AA1AB;`)}>%</span>
                  </div>
                  <input value={r.minU} onChange={r.onMin} type="number" style={S(`padding:9px 8px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; width:100%; text-align:center;`)} />
                  <span className="num" style={S(`text-align:right; font-size:12.5px; color:#475063;`)}>{r.montoBase}</span>
                  <span className="num" style={S(`text-align:right; font-size:14px; font-weight:700; color:#0B3D2E;`)}>{r.comision}</span>
                </div>
              </React.Fragment>))}
              <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding:14px 16px; background:#0B3D2E; border-radius:12px;`)}>
                <span style={S(`font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9FD8C2;`)}>Comisión total del líder</span>
                <span className="num" style={S(`font-size:22px; font-weight:700; color:#fff;`)}>{V.liderTotal}</span>
              </div>
            </div>

            
            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-bottom:16px;`)}>
              <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;`)}>
                <div style={S(`display:flex; align-items:center; gap:8px;`)}>
                  <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Comisión del Líder de Líder</h2>
                  <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#7C5CC4; background:#F0EBFA; padding:3px 8px; border-radius:20px;`)}>Gerencia</span>
                </div>
                <label style={S(`display:inline-flex; align-items:center; gap:9px; cursor:pointer; font-size:12.5px; font-weight:700; color:#33383F;`)}>
                  <input type="checkbox" checked={V.superActivo} onChange={V.onToggleSuper} style={S(`width:17px; height:17px; accent-color:#7C5CC4; cursor:pointer;`)} />
                  <span>Activar este nivel</span>
                </label>
              </div>
              {V.superActivo && (<>
                <div style={S(`margin-top:12px;`)}>
                  <div style={S(`display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;`)}>
                    <input value={V.superName} onChange={V.onSuperName} placeholder="Nombre de gerencia (opcional)" style={S(`flex:1; min-width:200px; padding:8px 11px; border:1px solid #E0E3E8; border-radius:8px; font-family:'Manrope',sans-serif; font-size:12.5px; color:#475063; background:#fff;`)} />
                    {V.superIsOverride && (<>
                      <button onClick={V.resetSuperPeriod} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#7A828E; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:8px 10px; border-radius:8px; white-space:nowrap;`)}>Usar base</button>
                    </>)}
                  </div>
                  <label style={S(`display:inline-flex; align-items:center; gap:9px; padding:8px 12px; border:1px solid #D7DBE0; border-radius:9px; background:#F7F8FA; cursor:pointer; font-size:12.5px; font-weight:600; color:#33383F; margin-bottom:14px;`)}>
                    <input type="checkbox" checked={V.superReqPart} onChange={V.onSuperReqPart} style={S(`width:16px; height:16px; accent-color:#7C5CC4; cursor:pointer;`)} />
                    <span>Comisiona solo ventas con participación de gerencia</span>
                  </label>
                  <div style={S(`display:grid; grid-template-columns:1.5fr 88px 92px 1fr 1fr; gap:10px; padding:0 4px 8px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
                    <span>Equipo</span><span style={S(`text-align:center;`)}>% Com.</span><span style={S(`text-align:center;`)}>Mín und</span><span style={S(`text-align:right;`)}>Monto base</span><span style={S(`text-align:right;`)}>Comisión</span>
                  </div>
                  {(V.superRows||[]).map((r, _k2) => (<React.Fragment key={_k2}>
                    <div style={S(`display:grid; grid-template-columns:1.5fr 88px 92px 1fr 1fr; gap:10px; align-items:center; padding:12px 4px; border-bottom:1px solid #F2F4F6;`)}>
                      <div style={S(`display:flex; align-items:center; gap:10px; min-width:0;`)}>
                        <div style={S(`width:9px; height:9px; border-radius:3px; background:${r.color}; flex-shrink:0;`)}></div>
                        <div style={S(`min-width:0;`)}>
                          <div style={S(`font-size:13px; font-weight:700;`)}>{r.label}</div>
                          <div style={S(`font-size:10.5px; font-weight:700; color:${r.statusColor}; margin-top:2px;`)}>{r.units} und · {r.statusLabel}</div>
                        </div>
                      </div>
                      <div style={S(`position:relative;`)}>
                        <input value={r.pct} onChange={r.onPct} type="number" step="0.1" style={S(`padding:9px 20px 9px 8px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; width:100%; text-align:center;`)} />
                        <span style={S(`position:absolute; right:7px; top:11px; font-size:11px; color:#9AA1AB;`)}>%</span>
                      </div>
                      <input value={r.minU} onChange={r.onMin} type="number" style={S(`padding:9px 8px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; width:100%; text-align:center;`)} />
                      <span className="num" style={S(`text-align:right; font-size:12.5px; color:#475063;`)}>{r.montoBase}</span>
                      <span className="num" style={S(`text-align:right; font-size:14px; font-weight:700; color:#5A3FA0;`)}>{r.comision}</span>
                    </div>
                  </React.Fragment>))}
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding:14px 16px; background:#5A3FA0; border-radius:12px;`)}>
                    <span style={S(`font-size:12.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#D9CCF2;`)}>Comisión total de gerencia</span>
                    <span className="num" style={S(`font-size:22px; font-weight:700; color:#fff;`)}>{V.superTotal}</span>
                  </div>
                </div>
              </>)}
              {V.superInactivo && (<>
                <p style={S(`margin:12px 0 0; font-size:12.5px; color:#9AA1AB;`)}>Nivel desactivado. Actívalo cuando la gerencia comisione en algún periodo bajo condiciones especiales.</p>
              </>)}
            </div>
            </>)}

            <div style={S(`display:grid; grid-template-columns:1fr; gap:16px;`)}>
              
              <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
                <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;`)}>
                  <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>Comisiones por Ejecutivo</h2>
                  <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#C49A3F; background:#FBF3DF; padding:3px 8px; border-radius:20px;`)}>Privado</span>
                  {V.comPeriodLocked && (<>
                    <span className="num" style={S(`display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.04em; color:#137A5B; background:#E7F2EC; border:1px solid #BFE0CE; padding:3px 9px; border-radius:20px;`)}>🔒 Cerrado</span>
                  </>)}
                </div>
                {V.comPeriodLocked && (<>
                  <div style={S(`display:flex; align-items:center; gap:9px; background:#F1F8F4; border:1px solid #CFE6DA; border-radius:11px; padding:9px 13px; margin-bottom:12px;`)}>
                    <span style={S(`font-size:14px;`)}>🔒</span>
                    <span style={S(`font-size:12px; color:#0B5C3F; font-weight:600; line-height:1.35;`)}>Periodo cerrado — {V.comLockLabel}. La tabla muestra el registro oficial; los cambios de matriz o ventas no lo alteran.</span>
                  </div>
                </>)}
                <p style={S(`margin:0 0 12px; font-size:12.5px; color:#6B7280;`)}><strong>%Rec</strong> = Recaudo ÷ Recaudo Base. En <strong>fraccionado</strong> la base es la inicial mínima (o la inicial contratada de la venta); en <strong>contado</strong> es el Precio Final. Cada operación se paga <strong>completa</strong>, se <strong>retiene</strong> (prorrateo por %Rec) o con un <strong>% manual</strong>; despliega una fila para decidir. Bajo <strong>A Pagar</strong> y <strong>Pend.</strong> se indica el % pagado y el retenido. El <strong>Total</strong> es lo pagable hoy; lo retenido se libera al completar el recaudo.</p>
                <div style={S(`display:flex; align-items:center; gap:9px; margin-bottom:16px; flex-wrap:wrap;`)}>
                  <span style={S(`font-size:11.5px; font-weight:700; color:#475063;`)}>Inicial base (fraccionado)</span>
                  <div style={S(`position:relative; display:inline-flex; align-items:center;`)}>
                    <span style={S(`position:absolute; left:9px; font-size:12px; color:#9AA1AB; pointer-events:none;`)}>S/</span>
                    <input value={V.inicialMinVal} onChange={V.onInicialMin} type="number" min="0" step="100" style={S(`width:110px; padding:7px 9px 7px 30px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:700; color:#14171C;`)} />
                  </div>
                  <span style={S(`font-size:11px; color:#9AA1AB;`)}>Se usa cuando la venta fraccionada no tiene inicial contratada propia.</span>
                </div>
                <div style={S(`display:grid; grid-template-columns:16px 1.25fr 0.56fr 22px 0.82fr 0.82fr 0.46fr 0.82fr 0.68fr 0.82fr 16px; gap:6px; padding:0 4px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:#9AA1AB; border-bottom:1px solid #EEF0F3;`)}>
                  <span>#</span><span>Ejecutivo</span><span>Escala</span><span style={S(`text-align:right;`)}>Und.</span><span style={S(`text-align:right;`)}>P. Final</span><span style={S(`text-align:right;`)}>Generada</span><span style={S(`text-align:right;`)}>%Rec</span><span style={S(`text-align:right;`)}>A Pagar</span><span style={S(`text-align:right;`)}>Pend.</span><span style={S(`text-align:right;`)}>Total</span><span></span>
                </div>
                {(V.comRanking||[]).map((r, _k3) => (<React.Fragment key={_k3}>
                  <div style={S(`border-bottom:1px solid #F2F4F6;`)}>
                    <div onClick={r.onToggle} style={S(`display:grid; grid-template-columns:16px 1.25fr 0.56fr 22px 0.82fr 0.82fr 0.46fr 0.82fr 0.68fr 0.82fr 16px; gap:6px; align-items:center; padding:11px 4px; cursor:pointer;`)}>
                      <span className="num" style={S(`font-size:13px; font-weight:700; color:#A9B0BA;`)}>{r.rank}</span>
                      <div style={S(`display:flex; align-items:center; gap:9px; min-width:0;`)}>
                        <div style={S(`width:26px; height:26px; border-radius:7px; background:${r.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10px; flex-shrink:0;`)} className="num">{r.initials}</div>
                        <div style={S(`min-width:0;`)}>
                          <div style={S(`font-size:12.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{r.name}</div>
                          <div style={S(`font-size:10px; color:${r.tierColor}; font-weight:700; white-space:nowrap;`)}>{r.tierLabel}</div>
                        </div>
                      </div>
                      <div style={S(`min-width:0;`)}><span className="num" style={S(`display:inline-block; font-size:9.5px; font-weight:700; color:${r.escColor}; background:${r.escBg}; border-radius:20px; padding:2px 8px; white-space:nowrap;`)}>{r.escala}</span></div>
                      <span className="num" style={S(`text-align:right; font-size:13px; font-weight:700;`)}>{r.units}</span>
                      <span className="num" style={S(`text-align:right; font-size:12px; color:#14171C; font-weight:700;`)}>{r.monto}</span>
                      <span className="num" style={S(`text-align:right; font-size:12px; color:#475063;`)}>{r.gen}</span>
                      <span className="num" style={S(`text-align:right; font-size:11.5px; color:#2C6E9B; font-weight:700;`)}>{r.pctRec}</span>
                      <div style={S(`text-align:right; min-width:0;`)}><div className="num" style={S(`font-size:12px; color:#14171C; font-weight:700;`)}>{r.pagar}</div><div className="num" style={S(`font-size:9px; color:${r.payColor};`)}>{r.payPct}</div></div>
                      <div style={S(`text-align:right; min-width:0;`)}><div className="num" style={S(`font-size:12px; font-weight:700; color:${r.pendColor};`)}>{r.pend}</div><div className="num" style={S(`font-size:9px; color:${r.pendColor};`)}>{r.retPct}</div></div>
                      <span className="num" style={S(`text-align:right; font-size:13px; font-weight:700;`)}>{r.total}</span>
                      <span style={S(`text-align:center; font-size:11px; color:#AEB4BD;`)}>{r.chev}</span>
                    </div>
                    {r.expanded && (<>
                      <div style={S(`background:#FAFBFC; border:1px solid #EEF0F3; border-radius:12px; padding:12px 14px; margin:0 2px 12px;`)}>
                        <div style={S(`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#9AA1AB; margin-bottom:9px;`)}>Detalle por operación · %Rec = Recaudo ÷ Recaudo Base (inicial base en fraccionado · precio final en contado) · elige Completo, Retener o escribe un % manual a pagar</div>
                        <div style={S(`display:grid; grid-template-columns:1.1fr 0.8fr 0.8fr 0.46fr 0.82fr 232px 0.9fr 0.85fr; gap:8px; padding:0 2px 7px; font-size:8.5px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:#AEB4BD; border-bottom:1px solid #EEF0F3;`)}>
                          <span>Lote · Tipo</span><span style={S(`text-align:right;`)}>P. Final</span><span style={S(`text-align:right;`)}>Recaudo</span><span style={S(`text-align:right;`)}>%Rec</span><span style={S(`text-align:right;`)}>Generada</span><span style={S(`text-align:center;`)}>Decisión (% a pagar)</span><span style={S(`text-align:right;`)}>A Pagar</span><span style={S(`text-align:right;`)}>Pendiente</span>
                        </div>
                        {(r.opsRows||[]).map((op, _k4) => (<React.Fragment key={_k4}>
                          <div style={S(`display:grid; grid-template-columns:1.1fr 0.8fr 0.8fr 0.46fr 0.82fr 232px 0.9fr 0.85fr; gap:8px; align-items:center; padding:8px 2px; border-bottom:1px solid #F4F6F8;`)}>
                            <div style={S(`min-width:0;`)}><div style={S(`font-size:11.5px; font-weight:700; color:#14171C; white-space:nowrap;`)}>{op.lote}</div><div style={S(`font-size:9.5px; color:#9AA1AB; white-space:nowrap;`)}>{op.tipo}</div></div>
                            <span className="num" style={S(`text-align:right; font-size:11.5px; color:#475063;`)}>{op.fin}</span>
                            <span className="num" style={S(`text-align:right; font-size:11.5px; color:#2C6E9B;`)}>{op.rec}</span>
                            <div style={S(`text-align:right; min-width:0;`)}><div className="num" style={S(`font-size:11.5px; color:#475063;`)}>{op.pct}</div><div className="num" style={S(`font-size:8.5px; color:#AEB4BD; white-space:nowrap;`)}>de {op.base}</div></div>
                            <span className="num" style={S(`text-align:right; font-size:11.5px; color:#475063;`)}>{op.generada}</span>
                            <div style={S(`display:flex; gap:5px; justify-content:center; align-items:center;`)}>
                              <button onClick={op.onCompleto} style={S(`${op.stCompleto}`)}>Completo</button>
                              <button onClick={op.onRetener} style={S(`${op.stRetener}`)}>Retener</button>
                              <input value={op.manualVal} onChange={op.onManual} type="number" min="0" max="100" placeholder="%" style={S(`${op.stManual}`)} />
                            </div>
                            <div style={S(`text-align:right;`)}><div className="num" style={S(`font-size:11.5px; font-weight:700; color:#14171C;`)}>{op.pagar}</div><div className="num" style={S(`font-size:9px; color:${op.payColor};`)}>{op.payPct}</div></div>
                            <div style={S(`text-align:right;`)}><div className="num" style={S(`font-size:11.5px; font-weight:700; color:${op.pendColor};`)}>{op.pend}</div><div className="num" style={S(`font-size:9px; color:${op.pendColor};`)}>{op.retPct}</div></div>
                          </div>
                        </React.Fragment>))}
                        {r.hasBonus && (<>
                          <div style={S(`display:flex; gap:18px; align-items:center; padding:9px 2px 0; font-size:10.5px; color:#8A929C; flex-wrap:wrap;`)}>
                            <span>Bono volumen: <strong style={S(`color:#C49A3F;`)}>{r.volRaw}</strong></span>
                            <span>Bono velocidad: <strong style={S(`color:#137A5B;`)}>{r.speedRaw}</strong></span>
                            <span style={S(`margin-left:auto;`)}>Los bonos se pagan completos (no se prorratean).</span>
                          </div>
                        </>)}
                      </div>
                    </>)}
                  </div>
                </React.Fragment>))}
              </div>

              
              <div style={S(`display:flex; flex-direction:column; gap:16px;`)}>
                <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:10px;`)}>
                    <h2 style={S(`margin:0; font-size:15px; font-weight:800;`)}>Matriz de Comisión</h2>
                    <button onClick={V.toggleMatriz} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #D7DBE0; background:#fff; color:#0B3D2E; font-family:'Manrope',sans-serif; font-size:11.5px; font-weight:700; padding:6px 11px; border-radius:8px;`)}><span style={S(`font-size:10px;`)}>{V.matrizChev}</span> {V.matrizToggleLabel}</button>
                  </div>
                  {V.showMatriz && (<>
                  <p style={S(`margin:10px 0 12px; font-size:11.5px; color:#9AA1AB;`)}>% por escala (unidades) y modalidad/inicial. Cada equipo y periodo puede tener su matriz; los demás usan la Base.</p>
                  <div style={S(`display:flex; gap:4px; background:#F2F4F6; border-radius:8px; padding:3px; margin-bottom:10px;`)}>
                    {(V.editTeamBtns||[]).map((b, _k5) => (<React.Fragment key={_k5}><button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button></React.Fragment>))}
                  </div>
                  <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:14px;`)}>
                    <select value={V.editPeriod} onChange={V.onEditPeriod} style={S(`flex:1; padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:600; background:#fff;`)}>
                      {(V.editPeriodOpts||[]).map((o, _k6) => (<React.Fragment key={_k6}><option value={o.v}>{o.l}</option></React.Fragment>))}
                    </select>
                    {V.editIsOverride && (<>
                      <button onClick={V.resetEditPeriod} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#7A828E; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:8px 10px; border-radius:8px; white-space:nowrap;`)}>Usar base</button>
                    </>)}
                  </div>
                  <div style={S(`display:flex; gap:4px; background:#F2F4F6; border-radius:8px; padding:3px; margin-bottom:12px;`)}>
                    {(V.modeBtns||[]).map((b, _k7) => (<React.Fragment key={_k7}><button onClick={b.onClick} style={S(`${b.style}`)}>{b.label}</button></React.Fragment>))}
                  </div>

                  {V.editIsFlat && (<>
                    <div style={S(`display:flex; align-items:center; gap:12px; padding:8px 0 4px;`)}>
                      <span style={S(`font-size:12.5px; color:#475063; font-weight:600;`)}>Comisión única sobre Precio Final</span>
                      <div style={S(`position:relative; width:96px;`)}>
                        <input value={V.flatRate.pct} onChange={V.flatRate.onChange} type="number" style={S(`padding:9px 22px 9px 9px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:16px; font-weight:700; width:100%; text-align:center;`)} />
                        <span style={S(`position:absolute; right:10px; top:12px; font-size:12px; color:#9AA1AB;`)}>%</span>
                      </div>
                    </div>
                    <p style={S(`margin:10px 0 0; font-size:11px; color:#9AA1AB;`)}>Un solo rango: todas las ventas de este equipo pagan este % (sin escalas).</p>
                  </>)}

                  {V.editIsMatrix && (<>
                    <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;`)}>
                      <span style={S(`font-size:9.5px; font-weight:700; text-transform:uppercase; color:#9AA1AB;`)}>Rangos por nº de unidades (desde)</span>
                      <div style={S(`display:flex; gap:6px;`)}>
                        <button onClick={V.removeCol} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#7A828E; font-size:14px; font-weight:700; width:24px; height:24px; border-radius:7px; padding:0; line-height:1;`)}>−</button>
                        <button onClick={V.addCol} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#0B3D2E; font-size:14px; font-weight:700; width:24px; height:24px; border-radius:7px; padding:0; line-height:1;`)}>+</button>
                      </div>
                    </div>
                    <div style={S(`display:grid; grid-template-columns:${V.escGrid}; gap:6px; margin-bottom:5px; align-items:end;`)}>
                      <span style={S(`font-size:9px; font-weight:700; text-transform:uppercase; color:#B6BBC3;`)}>Desde</span>
                      {(V.boundsView||[]).map((bd, _k8) => (<React.Fragment key={_k8}>
                        <input value={bd.val} onChange={bd.onChange} type="number" style={S(`padding:5px; border:1px solid #E0E3E8; border-radius:6px; font-family:'Space Grotesk',sans-serif; font-size:11px; width:100%; text-align:center;`)} />
                      </React.Fragment>))}
                    </div>
                    <div style={S(`display:grid; grid-template-columns:${V.escGrid}; gap:6px; margin-bottom:6px;`)}>
                      <span style={S(`font-size:9px; font-weight:700; text-transform:uppercase; color:#9AA1AB;`)}>Modalidad</span>
                      {(V.escHeads||[]).map((h, _k9) => (<React.Fragment key={_k9}><span style={S(`font-size:10px; font-weight:700; text-align:center; color:#7A828E;`)}>{h}</span></React.Fragment>))}
                    </div>
                    {(V.matrixRows||[]).map((row, _k10) => (<React.Fragment key={_k10}>
                      <div style={S(`display:grid; grid-template-columns:${V.escGrid}; gap:6px; align-items:center; margin-bottom:6px;`)}>
                        <span style={S(`font-size:10.5px; font-weight:600; color:#475063;`)}>{row.label}</span>
                        {(row.cells||[]).map((c, _k11) => (<React.Fragment key={_k11}>
                          <div style={S(`position:relative;`)}>
                            <input value={c.pct} onChange={c.onChange} type="number" style={S(`padding:7px 14px 7px 4px; border:1px solid #E0E3E8; border-radius:7px; font-family:'Space Grotesk',sans-serif; font-size:12px; width:100%; text-align:center;`)} />
                            <span style={S(`position:absolute; right:4px; top:7px; font-size:10px; color:#B6BBC3;`)}>%</span>
                          </div>
                        </React.Fragment>))}
                      </div>
                    </React.Fragment>))}
                  </>)}
                  </>)}
                </div>

                <div style={S(`background:#FBF7EC; border-radius:18px; border:1px solid #EBD9A8; padding:20px;`)}>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;`)}>
                    <h2 style={S(`margin:0; font-size:15px; font-weight:800; color:#8A6A1E;`)}>Bono por Volumen</h2>
                    <button onClick={V.addVolBono} style={S(`cursor:pointer; border:1px solid #E3D2A2; background:#fff; color:#8A6A1E; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:5px 9px; border-radius:7px;`)}>+ Bono</button>
                  </div>
                  <p style={S(`margin:0 0 12px; font-size:11.5px; color:#A98B43;`)}>Bono único en S/ al alcanzar N ventas (no acumulable).</p>
                  <div style={S(`display:grid; grid-template-columns:1fr 1fr 24px; gap:8px; margin-bottom:6px; font-size:9px; font-weight:700; text-transform:uppercase; color:#A98B43;`)}>
                    <span>Ventas</span><span>Monto S/</span><span></span>
                  </div>
                  {(V.volBonosView||[]).map((b, _k12) => (<React.Fragment key={_k12}>
                    <div style={S(`display:grid; grid-template-columns:1fr 1fr 24px; gap:8px; align-items:center; margin-bottom:7px;`)}>
                      <input value={b.ventas} onChange={b.onVentas} type="number" style={S(`padding:7px; border:1px solid #E3D2A2; border-radius:7px; font-family:'Space Grotesk',sans-serif; font-size:12px; width:100%; text-align:center; background:#fff;`)} />
                      <input value={b.monto} onChange={b.onMonto} type="number" style={S(`padding:7px; border:1px solid #E3D2A2; border-radius:7px; font-family:'Space Grotesk',sans-serif; font-size:12px; width:100%; text-align:center; background:#fff;`)} />
                      <button onClick={b.onRemove} style={S(`cursor:pointer; border:none; background:none; color:#CDB877; font-size:15px; padding:0;`)}>✕</button>
                    </div>
                  </React.Fragment>))}
                </div>

                <div style={S(`background:#E7F2EC; border-radius:18px; border:1px solid #BFD9CC; padding:20px;`)}>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;`)}>
                    <h2 style={S(`margin:0; font-size:15px; font-weight:800; color:#0B5C3F;`)}>Bono por Velocidad</h2>
                    <button onClick={V.addSpeedBono} style={S(`cursor:pointer; border:1px solid #BFD9CC; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:5px 9px; border-radius:7px;`)}>+ Tramo</button>
                  </div>
                  <p style={S(`margin:0 0 12px; font-size:11.5px; color:#3E8466;`)}>Bono en S/ por lote cerrado dentro de N días (cierre − separación).</p>
                  <div style={S(`display:grid; grid-template-columns:1fr 1fr 24px; gap:8px; margin-bottom:6px; font-size:9px; font-weight:700; text-transform:uppercase; color:#3E8466;`)}>
                    <span>Hasta (días)</span><span>Monto S/</span><span></span>
                  </div>
                  {(V.speedBonosView||[]).map((b, _k13) => (<React.Fragment key={_k13}>
                    <div style={S(`display:grid; grid-template-columns:1fr 1fr 24px; gap:8px; align-items:center; margin-bottom:7px;`)}>
                      <input value={b.dias} onChange={b.onDias} type="number" style={S(`padding:7px; border:1px solid #BFD9CC; border-radius:7px; font-family:'Space Grotesk',sans-serif; font-size:12px; width:100%; text-align:center; background:#fff;`)} />
                      <input value={b.monto} onChange={b.onMonto} type="number" style={S(`padding:7px; border:1px solid #BFD9CC; border-radius:7px; font-family:'Space Grotesk',sans-serif; font-size:12px; width:100%; text-align:center; background:#fff;`)} />
                      <button onClick={b.onRemove} style={S(`cursor:pointer; border:none; background:none; color:#9CC3AE; font-size:15px; padding:0;`)}>✕</button>
                    </div>
                  </React.Fragment>))}
                </div>
              </div>
            </div>

            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:20px 22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-top:16px;`)}>
              <div style={S(`display:flex; align-items:center; gap:12px; flex-wrap:wrap;`)}>
                <span style={S(`font-size:18px; line-height:1;`)}>🔒</span>
                <div style={S(`flex:1; min-width:0;`)}>
                  <h2 style={S(`margin:0 0 2px; font-size:16px; font-weight:800;`)}>Cierre de periodo</h2>
                  <p style={S(`margin:0; font-size:12px; color:#8A929C; line-height:1.4;`)}>Congela el cálculo de comisiones del mes como registro oficial e inmutable. Si luego cambias la matriz o las ventas, los meses cerrados conservan su cifra original (auditable).</p>
                </div>
                {V.selIsClosed && (<>
                  <span className="num" style={S(`font-size:12px; font-weight:800; color:#137A5B; background:#E7F2EC; border:1px solid #BFE0CE; padding:8px 14px; border-radius:10px; white-space:nowrap;`)}>✓ {V.closeSelLabel} cerrado · {V.selClosedAt}</span>
                </>)}
                {V.selNotClosed && (<>
                  <button onClick={V.closePeriod} style={S(`cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; padding:10px 18px; border-radius:10px; white-space:nowrap;`)}>Cerrar {V.closeSelLabel}</button>
                </>)}
                {V.selNotClosable && (<>
                  <span style={S(`font-size:12px; color:#9AA1AB; font-style:italic;`)}>Selecciona un mes en el filtro superior para cerrarlo</span>
                </>)}
              </div>
              {V.hasClosed && (<>
                <div style={S(`margin-top:16px; border-top:1px solid #EEF0F3; padding-top:14px;`)}>
                  <div style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB; margin-bottom:9px;`)}>Periodos cerrados</div>
                  {(V.closedList||[]).map((cl, _k14) => (<React.Fragment key={_k14}>
                    <div style={S(`display:flex; align-items:center; gap:12px; padding:10px 12px; background:#F7F9F8; border:1px solid #E4EBE7; border-radius:11px; margin-bottom:7px;`)}>
                      <span style={S(`font-size:14px;`)}>🔒</span>
                      <span style={S(`font-size:13px; font-weight:800; color:#14171C; min-width:90px;`)}>{cl.label}</span>
                      <span className="num" style={S(`font-size:12px; color:#5A6472;`)}>{cl.execCount} ejecutivos</span>
                      <span className="num" style={S(`font-size:13px; font-weight:800; color:#0B3D2E; margin-left:auto;`)}>{cl.total}</span>
                      <span style={S(`font-size:11px; color:#9AA1AB;`)}>cerrado {cl.closedAt}</span>
                      <button onClick={cl.onReopen} style={S(`cursor:pointer; border:1px solid #E0E3E8; background:#fff; color:#B0593C; font-family:'Manrope',sans-serif; font-size:11px; font-weight:700; padding:5px 11px; border-radius:8px; white-space:nowrap;`)}>Reabrir</button>
                    </div>
                  </React.Fragment>))}
                </div>
              </>)}
            </div>

            <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:22px; box-shadow:0 1px 2px rgba(20,23,28,.04); margin-top:16px;`)}>
              <div style={S(`display:flex; align-items:center; gap:9px; margin-bottom:4px; flex-wrap:wrap;`)}>
                <span style={S(`font-size:18px; line-height:1;`)}>🚀</span>
                <h2 style={S(`margin:0; font-size:17px; font-weight:800;`)}>¿Cuánto falta para el siguiente nivel?</h2>
                <span style={S(`font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#2C6E9B; background:#EAF1F7; padding:3px 8px; border-radius:20px;`)}>{V.projPeriodLabel}</span>
                <button onClick={V.exportComisiones} style={S(`margin-left:auto; cursor:pointer; display:inline-flex; align-items:center; gap:6px; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:12px; font-weight:700; padding:7px 13px; border-radius:9px;`)}>⬇ Exportar comisiones (CSV)</button>
              </div>
              <p style={S(`margin:0 0 16px; font-size:12px; color:#8A929C; line-height:1.45;`)}>Proyección de incentivo por ejecutivo: cuántas ventas faltan para subir de tramo o alcanzar el próximo bono, y cuánto sumaría a su comisión. {V.projIsAgg && (<><strong style={S(`color:#B0593C;`)}>Selecciona un mes en el filtro superior para una proyección exacta; se muestra el último periodo.</strong></>)}</p>
              {V.hasProjection && (<>
                <div style={S(`display:grid; grid-template-columns:repeat(auto-fill, minmax(330px, 1fr)); gap:12px;`)}>
                  {(V.comProjection||[]).map((e, _k15) => (<React.Fragment key={_k15}>
                    <div style={S(`border:1px solid #ECEFF2; border-radius:14px; padding:15px 16px; background:#FCFCFD;`)}>
                      <div style={S(`display:flex; align-items:center; gap:11px; margin-bottom:12px;`)}>
                        <div style={S(`width:34px; height:34px; border-radius:9px; background:${e.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0;`)} className="num">{e.initials}</div>
                        <div style={S(`min-width:0; flex:1;`)}>
                          <div style={S(`font-size:14px; font-weight:800; color:#14171C; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;`)}>{e.name}</div>
                          <div style={S(`font-size:11px; color:#9AA1AB;`)}>{e.unitsNow} ventas · {e.curLabel}</div>
                        </div>
                        <div style={S(`text-align:right; flex-shrink:0;`)}>
                          <div style={S(`font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#9AA1AB;`)}>Comisión hoy</div>
                          <div className="num" style={S(`font-size:15px; font-weight:800; color:#0B3D2E;`)}>{e.comNow}</div>
                        </div>
                      </div>
                      {(e.steps||[]).map((s, _k16) => (<React.Fragment key={_k16}>
                        <div style={S(`display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:10px; background:${s.bg}; border:1px solid ${s.border}; margin-bottom:7px;`)}>
                          <span style={S(`font-size:12px; font-weight:600; color:#475063; line-height:1.35; flex:1;`)}>{s.txt}</span>
                          <span className="num" style={S(`font-size:13px; font-weight:800; color:${s.color}; white-space:nowrap;`)}>{s.reward}</span>
                        </div>
                      </React.Fragment>))}
                      {e.maxed && (<>
                        <div style={S(`display:flex; align-items:center; gap:8px; padding:9px 11px; border-radius:10px; background:#E7F2EC; border:1px solid #BFE0CE;`)}>
                          <span style={S(`font-size:13px;`)}>🏅</span><span style={S(`font-size:12px; font-weight:700; color:#137A5B;`)}>En el nivel máximo de escala</span>
                        </div>
                      </>)}
                      {e.isFlat && (<>
                        <div style={S(`display:flex; align-items:center; gap:8px; padding:9px 11px; border-radius:10px; background:#EFF4EF; border:1px solid #CFE0D8;`)}>
                          <span style={S(`font-size:13px;`)}>≡</span><span style={S(`font-size:12px; font-weight:600; color:#3B7A55;`)}>Tarifa única — sin escalas por volumen</span>
                        </div>
                      </>)}
                      {e.showPotential && (<>
                        <div style={S(`display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-top:11px; padding-top:11px; border-top:1px dashed #E6E8EC;`)}>
                          <span style={S(`font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E;`)}>Potencial del mes</span>
                          <span className="num" style={S(`font-size:16px; font-weight:800; color:#2C6E9B;`)}>{e.potential}</span>
                        </div>
                      </>)}
                    </div>
                  </React.Fragment>))}
                </div>
              </>)}
            </div>
          </div>
        </>)}
        {V.comLocked && (<>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:48px; max-width:420px; margin:40px auto; text-align:center; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <div style={S(`width:56px; height:56px; border-radius:15px; background:#0B3D2E; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:26px;`)}>🔒</div>
            <h2 style={S(`margin:0 0 6px; font-size:19px; font-weight:800;`)}>Vista Privada</h2>
            <p style={S(`margin:0 0 22px; font-size:13px; color:#6B7280;`)}>Las comisiones son confidenciales. Ingresa el PIN para continuar.</p>
            <input value={V.pinInput} onChange={V.onPin} type="password" placeholder="••••" style={S(`padding:12px; border:1px solid #D7DBE0; border-radius:10px; font-family:'Space Grotesk',sans-serif; font-size:18px; text-align:center; letter-spacing:.3em; width:160px; margin-bottom:14px;`)} />
            <div>
              <button onClick={V.submitPin} style={S(`cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:14px; font-weight:700; padding:11px 30px; border-radius:10px;`)}>Desbloquear</button>
            </div>
            <div style={S(`margin-top:12px; font-size:12px; color:#D26A4C; font-weight:600; min-height:16px;`)}>{V.pinErr}</div>
            <div style={S(`margin-top:6px; font-size:11px; color:#B6BBC3;`)}>PIN de demostración: 1234</div>
          </div>
        </>)}
      </div>
    </>)
); }
function CBoletas(props){ const V = props.V; return (
V.isBoletas && (<>
      <div data-screen-label="Boletas">
        {V.comUnlocked && (<>
          <div>
            
            <div data-boleta-hide="" style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:18px 20px; margin-bottom:16px; box-shadow:0 1px 2px rgba(20,23,28,.04); display:flex; align-items:flex-end; gap:16px; flex-wrap:wrap;`)}>
              <div>
                <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Ejecutivo</label>
                <select value={V.boletaEje} onChange={V.onBoletaEje} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; color:#14171C; background:#fff; min-width:180px;`)}>
                  {(V.boletaEjeOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
                </select>
              </div>
              <div>
                <label style={S(`display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#7A828E; margin-bottom:6px;`)}>Periodo</label>
                <select value={V.boletaPeriodo} onChange={V.onBoletaPeriodo} style={S(`padding:9px 11px; border:1px solid #D7DBE0; border-radius:9px; font-family:'Manrope',sans-serif; font-size:13px; font-weight:600; color:#14171C; background:#fff; min-width:150px;`)}>
                  {(V.boletaPeriodoOpts||[]).map((o, _k1) => (<React.Fragment key={_k1}><option value={o.v}>{o.l}</option></React.Fragment>))}
                </select>
              </div>
              <div style={S(`flex:1; min-width:120px;`)}></div>
              <button onClick={V.printBoleta} style={S(`cursor:pointer; display:inline-flex; align-items:center; gap:7px; border:1px solid #CFE0D8; background:#fff; color:#0B5C3F; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:700; padding:10px 15px; border-radius:10px;`)}>🖨 Imprimir / Guardar PDF</button>
            </div>

            {V.boletaEmpty && (<>
              <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:48px; text-align:center; color:#9AA1AB; font-size:14px;`)}>No hay ejecutivos o periodos disponibles para generar una boleta.</div>
            </>)}

            {V.boletaHasData && (<>
              
              <div data-boleta-hide="" style={S(`background:#F7F9F8; border-radius:16px; border:1px solid #E4EBE7; padding:16px 18px; margin-bottom:18px; display:flex; align-items:flex-end; gap:14px; flex-wrap:wrap;`)}>
                <div style={S(`font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#0B5C3F; align-self:center; padding-right:4px;`)}>Parámetros<br />del contrato</div>
                <div>
                  <label style={S(`display:block; font-size:10.5px; font-weight:700; text-transform:uppercase; color:#7A828E; margin-bottom:5px;`)}>Sueldo básico (S/)</label>
                  <input value={V.boBasicoVal} onChange={V.onBoBasico} type="number" step="50" style={S(`width:120px; padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#14171C;`)} />
                </div>
                <div>
                  <label style={S(`display:block; font-size:10.5px; font-weight:700; text-transform:uppercase; color:#7A828E; margin-bottom:5px;`)}>Sistema de pensión</label>
                  <select value={V.boSistemaVal} onChange={V.onBoSistema} style={S(`padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:600; background:#fff;`)}>
                    <option value="AFP">AFP</option>
                    <option value="ONP">ONP</option>
                  </select>
                </div>
                {V.boIsAFP && (<>
                  <div>
                    <label style={S(`display:block; font-size:10.5px; font-weight:700; text-transform:uppercase; color:#7A828E; margin-bottom:5px;`)}>AFP</label>
                    <select value={V.boAfpVal} onChange={V.onBoAfp} style={S(`padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Manrope',sans-serif; font-size:12.5px; font-weight:600; background:#fff;`)}>
                      <option value="Integra">Integra</option>
                      <option value="Prima">Prima</option>
                      <option value="Profuturo">Profuturo</option>
                      <option value="Habitat">Habitat</option>
                    </select>
                  </div>
                </>)}
                <div>
                  <label style={S(`display:block; font-size:10.5px; font-weight:700; text-transform:uppercase; color:#7A828E; margin-bottom:5px;`)}>Asignación familiar</label>
                  <div style={S(`display:flex; gap:5px;`)}>
                    <button onClick={V.onBoHijos} style={S(`${V.boHijosStyle}`)}>Con hijos</button>
                    <button onClick={V.onBoHijos} style={S(`${V.boSinHijosStyle}`)}>Sin hijos</button>
                  </div>
                </div>
                <div>
                  <label style={S(`display:block; font-size:10.5px; font-weight:700; text-transform:uppercase; color:#7A828E; margin-bottom:5px;`)}>Adelanto / préstamo (S/)</label>
                  <input value={V.boAdelantoVal} onChange={V.onBoAdelanto} type="number" step="50" style={S(`width:120px; padding:8px 10px; border:1px solid #D7DBE0; border-radius:8px; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#14171C;`)} />
                </div>
              </div>

              
              <div data-boleta-doc="" style={S(`max-width:840px; margin:0 auto; background:#fff; border-radius:16px; border:1px solid #E0E3E8; box-shadow:0 1px 3px rgba(20,23,28,.05); overflow:hidden;`)}>
                <div style={S(`background:#0B3D2E; color:#fff; padding:22px 28px; display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap;`)}>
                  <div>
                    <div style={S(`font-size:18px; font-weight:800; letter-spacing:.01em;`)}>Lumina Gruipo Inmobiliario</div>
                    <div style={S(`font-size:11.5px; color:#9FD8C2; margin-top:3px;`)}><br /></div>
                  </div>
                  <div style={S(`text-align:right;`)}>
                    <div style={S(`font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#CDEFE0;`)}>Boleta de pago</div>
                    <div className="num" style={S(`font-size:14px; font-weight:700; margin-top:3px;`)}>{V.boPeriodoLabel}</div>
                  </div>
                </div>

                <div style={S(`padding:22px 28px; border-bottom:1px solid #EEF0F3; display:flex; align-items:center; gap:14px; flex-wrap:wrap;`)}>
                  <div style={S(`width:44px; height:44px; border-radius:11px; background:${V.boColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px;`)} className="num">{V.boInitials}</div>
                  <div style={S(`flex:1; min-width:160px;`)}>
                    <div style={S(`font-size:16px; font-weight:800;`)}>{V.boName}</div>
                    <div style={S(`font-size:12px; color:#7A828E; margin-top:2px;`)}>{V.boEquipo} · Ejecutivo de ventas · Sistema pensionario: {V.boSistema}</div>
                  </div>
                  {V.boClosed && (<>
                    <span className="num" style={S(`font-size:11px; font-weight:800; color:#137A5B; background:#E7F2EC; border:1px solid #BFE0CE; padding:6px 12px; border-radius:20px;`)}>✓ Periodo cerrado</span>
                  </>)}
                </div>

                <div style={S(`display:grid; grid-template-columns:1fr 1fr; gap:0;`)}>
                  <div style={S(`padding:20px 28px; border-right:1px solid #EEF0F3;`)}>
                    <div style={S(`font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#137A5B; margin-bottom:12px;`)}>Ingresos</div>
                    {(V.boIngresos||[]).map((i, _k2) => (<React.Fragment key={_k2}>
                      <div style={S(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid #F4F6F8;`)}>
                        <div style={S(`min-width:0;`)}><div style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{i.label}</div><div style={S(`font-size:10.5px; color:#9AA1AB; margin-top:1px;`)}>{i.sub}</div></div>
                        <span className="num" style={S(`font-size:13px; font-weight:700; color:#137A5B; white-space:nowrap;`)}>{i.val}</span>
                      </div>
                    </React.Fragment>))}
                    <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding-top:12px; border-top:2px solid #E4EBE7;`)}>
                      <span style={S(`font-size:12px; font-weight:800; color:#0B3D2E;`)}>Remuneración bruta</span>
                      <span className="num" style={S(`font-size:15px; font-weight:800; color:#0B3D2E;`)}>{V.boBruta}</span>
                    </div>
                  </div>
                  <div style={S(`padding:20px 28px;`)}>
                    <div style={S(`font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#B0593C; margin-bottom:12px;`)}>Descuentos</div>
                    {(V.boDesc||[]).map((d, _k3) => (<React.Fragment key={_k3}>
                      <div style={S(`display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid #F4F6F8;`)}>
                        <div style={S(`min-width:0;`)}><div style={S(`font-size:13px; font-weight:600; color:#14171C;`)}>{d.label}</div><div style={S(`font-size:10.5px; color:#9AA1AB; margin-top:1px;`)}>{d.sub}</div></div>
                        <span className="num" style={S(`font-size:13px; font-weight:700; color:#B0593C; white-space:nowrap;`)}>{d.val}</span>
                      </div>
                    </React.Fragment>))}
                    <div style={S(`display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding-top:12px; border-top:2px solid #F0E4DF;`)}>
                      <span style={S(`font-size:12px; font-weight:800; color:#8A3D22;`)}>Total descuentos</span>
                      <span className="num" style={S(`font-size:15px; font-weight:800; color:#8A3D22;`)}>{V.boTotalDesc}</span>
                    </div>
                  </div>
                </div>

                <div style={S(`margin:0 28px 22px; background:#0B3D2E; border-radius:14px; padding:18px 22px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;`)}>
                  <div>
                    <div style={S(`font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9FD8C2;`)}>Neto a pagar</div>
                    <div style={S(`font-size:11px; color:#7FBBA3; margin-top:3px;`)}>Remuneración bruta − descuentos de ley</div>
                  </div>
                  <div className="num" style={S(`font-size:30px; font-weight:800; color:#fff;`)}>{V.boNeto}</div>
                </div>

                <div style={S(`padding:0 28px 24px;`)}>
                  <div style={S(`display:grid; grid-template-columns:1fr 1fr; gap:12px;`)}>
                    <div style={S(`background:#F7F9F8; border:1px solid #E4EBE7; border-radius:12px; padding:13px 15px;`)}>
                      <div style={S(`font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#7A828E; margin-bottom:5px;`)}>Aporte del empleador (informativo)</div>
                      <div style={S(`display:flex; align-items:center; justify-content:space-between;`)}><span style={S(`font-size:12.5px; color:#475063;`)}>EsSalud · 9%</span><span className="num" style={S(`font-size:13.5px; font-weight:800; color:#2C6E9B;`)}>{V.boEssalud}</span></div>
                      <div style={S(`font-size:10.5px; color:#9AA1AB; margin-top:4px;`)}>Lo asume la empresa; no se descuenta al trabajador.</div>
                    </div>
                    <div style={S(`background:#F7F9F8; border:1px solid #E4EBE7; border-radius:12px; padding:13px 15px;`)}>
                      <div style={S(`font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#7A828E; margin-bottom:5px;`)}>Renta de 5ta · proyección anual</div>
                      <div style={S(`display:flex; align-items:center; justify-content:space-between;`)}><span style={S(`font-size:12.5px; color:#475063;`)}>Base proyectada {V.boAnnual}</span><span className="num" style={S(`font-size:13.5px; font-weight:800; color:#8A6A1E;`)}>{V.boRenta5Anual}</span></div>
                      <div style={S(`font-size:10.5px; color:#9AA1AB; margin-top:4px;`)}>Impuesto anual estimado; se retiene en 12 partes. Exoneradas las primeras 7 UIT.</div>
                    </div>
                  </div>
                  <p style={S(`margin:14px 0 0; font-size:10.5px; color:#AEB4BD; line-height:1.5;`)}>Simulación referencial con parámetros de ley peruanos (RMV S/ {V.boRmvNote}, UIT S/ {V.boUitNote}, tasas AFP/EsSalud vigentes aprox.). No constituye una boleta de pago oficial ni documento tributario. La comisión corresponde al monto <strong>pagable del periodo</strong> según la política de prorrateo configurada.</p>
                </div>
              </div>
            </>)}
          </div>
        </>)}
        {V.comLocked && (<>
          <div style={S(`background:#fff; border-radius:18px; border:1px solid #E6E8EC; padding:48px; max-width:420px; margin:40px auto; text-align:center; box-shadow:0 1px 2px rgba(20,23,28,.04);`)}>
            <div style={S(`width:56px; height:56px; border-radius:15px; background:#0B3D2E; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:26px;`)}>🔒</div>
            <h2 style={S(`margin:0 0 6px; font-size:19px; font-weight:800;`)}>Vista Privada</h2>
            <p style={S(`margin:0 0 22px; font-size:13px; color:#6B7280;`)}>Las boletas y remuneraciones son confidenciales. Ingresa el PIN para continuar.</p>
            <input value={V.pinInput} onChange={V.onPin} type="password" placeholder="••••" style={S(`padding:12px; border:1px solid #D7DBE0; border-radius:10px; font-family:'Space Grotesk',sans-serif; font-size:18px; text-align:center; letter-spacing:.3em; width:160px; margin-bottom:14px;`)} />
            <div>
              <button onClick={V.submitPin} style={S(`cursor:pointer; border:none; background:#0B3D2E; color:#fff; font-family:'Manrope',sans-serif; font-size:14px; font-weight:700; padding:11px 30px; border-radius:10px;`)}>Desbloquear</button>
            </div>
            <div style={S(`margin-top:12px; font-size:12px; color:#D26A4C; font-weight:600; min-height:16px;`)}>{V.pinErr}</div>
            <div style={S(`margin-top:6px; font-size:11px; color:#B6BBC3;`)}>PIN de demostración: 1234</div>
          </div>
        </>)}
      </div>
    </>)
); }
function CInforme(props){ const V = props.V; return (
V.reportOpen && (<>
    <div data-report-root="" style={S(`position:fixed; inset:0; z-index:1500; background:#5A6472; overflow:auto; padding:28px 20px 60px;`)}>
      <div data-report-hide="" style={S(`max-width:820px; margin:0 auto 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;`)}>
        <div style={S(`display:flex; align-items:center; gap:10px;`)}>
          <span style={S(`font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#D5DAE1;`)}>Informe del periodo</span>
          <select value={V.reportPeriodVal} onChange={V.onReportPeriod} style={S(`font-family:'Manrope',sans-serif; cursor:pointer; font-size:13px; font-weight:700; padding:8px 12px; border-radius:9px; border:1px solid #7A828E; background:#fff; color:#14171C;`)}>
            {(V.reportPeriodOpts||[]).map((o, _k0) => (<React.Fragment key={_k0}><option value={o.v}>{o.l}</option></React.Fragment>))}
          </select>
        </div>
        <div style={S(`display:flex; gap:9px;`)}>
          <button onClick={V.printReport} style={S(`cursor:pointer; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; padding:9px 18px; border-radius:9px; border:none; background:#137A5B; color:#fff;`)}>Imprimir / PDF</button>
          <button onClick={V.closeReport} style={S(`cursor:pointer; font-family:'Manrope',sans-serif; font-size:13px; font-weight:700; padding:9px 18px; border-radius:9px; border:1px solid #9AA1AB; background:#fff; color:#475063;`)}>Cerrar</button>
        </div>
      </div>

      <div data-report-sheet="" style={S(`max-width:820px; margin:0 auto; background:#fff; border-radius:6px; box-shadow:0 20px 60px rgba(10,20,15,.35); padding:52px 56px 44px; font-family:'Manrope',sans-serif; color:#14171C;`)}>
        {V.repNoData && (<>
          <div style={S(`text-align:center; padding:60px 20px; color:#8A929C; font-size:15px;`)}>No hay operaciones registradas en este periodo.</div>
        </>)}
        {V.repHasData && (<>
          <div>
            <div style={S(`display:flex; align-items:center; gap:11px; margin-bottom:18px;`)}>
              <div style={S(`width:34px; height:34px; border-radius:9px; background:#0B3D2E; display:flex; align-items:center; justify-content:center;`)}>
                <div style={S(`width:13px; height:13px; border-radius:3px; background:#137A5B;`)}></div>
              </div>
              <div style={S(`font-size:10.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#137A5B;`)}>Gestión de Ventas · Nápoles</div>
            </div>
            <h1 style={S(`font-size:29px; font-weight:800; letter-spacing:-.02em; color:#0B3D2E; margin:0 0 6px; line-height:1.1;`)}>{V.repTitle}</h1>
            <div style={S(`font-size:12.5px; color:#8A929C;`)}>{V.repFecha} · Documento de uso interno</div>
            <div style={S(`height:3px; width:60px; background:#C49A3F; border-radius:2px; margin:14px 0 0;`)}></div>

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Indicadores del periodo</h2>
            </div>
            <div style={S(`display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:14px;`)}>
              {(V.repKpis||[]).map((k, _k1) => (<React.Fragment key={_k1}>
                <div style={S(`border:1px solid #E2E5EA; border-radius:10px; padding:13px 14px;`)}>
                  <div style={S(`font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C;`)}>{k.label}</div>
                  <div className="num" style={S(`font-size:20px; font-weight:700; color:${k.color}; margin-top:6px;`)}>{k.value}</div>
                  <div style={S(`font-size:11px; color:#6B7280; margin-top:3px;`)}>{k.sub}</div>
                </div>
              </React.Fragment>))}
            </div>

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Cuadro de honor — Top ejecutivos</h2>
            </div>
            <p style={S(`font-size:12.5px; color:#6B7280; margin:8px 0 14px; line-height:1.5;`)}>El <strong>Top 1 combinado</strong> asigna a cada ejecutivo su puesto (#) en <strong>Recaudo</strong>, <strong>Operaciones</strong> y <strong>Monto</strong>; gana quien suma el <strong>menor puntaje</strong> de los tres.</p>
            <div style={S(`display:flex; align-items:center; gap:15px; background:#F1F8F4; border:1px solid #BFE0CE; border-radius:12px; padding:15px 18px; margin-bottom:14px;`)}>
              <div style={S(`font-size:30px; line-height:1;`)}>🥇</div>
              <div>
                <div style={S(`font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#137A5B;`)}>Top 1 del periodo</div>
                <div style={S(`font-size:20px; font-weight:800; color:#0B3D2E; margin-top:2px;`)}>{V.repTop1Name}</div>
                <div style={S(`font-size:12px; color:#475063; margin-top:3px; line-height:1.45;`)}>{V.repTop1Why}</div>
              </div>
            </div>
            <div style={S(`display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px;`)}>
              {(V.repLeaders||[]).map((l, _k2) => (<React.Fragment key={_k2}>
                <div style={S(`border-radius:10px; padding:12px 13px; background:${l.bg};`)}>
                  <div style={S(`font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:${l.color};`)}>{l.label}</div>
                  <div style={S(`font-size:14.5px; font-weight:800; color:#14171C; margin-top:5px;`)}>{l.name}</div>
                  <div className="num" style={S(`font-size:12px; color:#475063; margin-top:1px;`)}>{l.value}</div>
                </div>
              </React.Fragment>))}
            </div>
            <table style={S(`width:100%; border-collapse:collapse;`)}>
              <thead><tr>
                <th style={S(`text-align:left; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>#</th>
                <th style={S(`text-align:left; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ejecutivo</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Recaudo</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ops.</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Monto</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Puntaje</th>
              </tr></thead>
              <tbody>
                {(V.repTop||[]).map((t, _k3) => (<React.Fragment key={_k3}>
                  <tr style={S(`background:${t.rowBg};`)}>
                    <td className="num" style={S(`padding:9px; font-size:13px; font-weight:800; color:#14171C; border-bottom:1px solid #ECEEF1; white-space:nowrap;`)}>{t.medal} {t.pos}</td>
                    <td style={S(`padding:9px; border-bottom:1px solid #ECEEF1;`)}><span style={S(`font-size:12.5px; font-weight:700; color:${t.nameColor};`)}>{t.name}</span> <span style={S(`font-size:10.5px; color:#9AA1AB;`)}>{t.eq}</span></td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1; white-space:nowrap;`)}>{t.rec} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{t.rRec}</span></td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1; white-space:nowrap;`)}>{t.ops} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{t.rOps}</span></td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1; white-space:nowrap;`)}>{t.monto} <span style={S(`color:#B0B7C0; font-size:10px;`)}>{t.rMonto}</span></td>
                    <td className="num" style={S(`padding:9px; font-size:13px; text-align:right; font-weight:800; color:#0B3D2E; border-bottom:1px solid #ECEEF1;`)}>{t.score}</td>
                  </tr>
                </React.Fragment>))}
              </tbody>
            </table>

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Desempeño por ejecutivo</h2>
            </div>
            <table style={S(`width:100%; border-collapse:collapse; margin-top:12px;`)}>
              <thead><tr>
                <th style={S(`text-align:left; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ejecutivo</th>
                <th style={S(`text-align:left; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Equipo</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ops.</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Monto</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Recaudo</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Descuento</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>% Desc.</th>
              </tr></thead>
              <tbody>
                {(V.repEj||[]).map((e, _k4) => (<React.Fragment key={_k4}>
                  <tr>
                    <td style={S(`padding:9px; font-size:12.5px; font-weight:700; color:#14171C; border-bottom:1px solid #ECEEF1;`)}>{e.name}</td>
                    <td style={S(`padding:9px; font-size:11.5px; color:#6B7280; border-bottom:1px solid #ECEEF1;`)}>{e.eq}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{e.u}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:700; color:#14171C; border-bottom:1px solid #ECEEF1;`)}>{e.monto}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:700; color:#137A5B; border-bottom:1px solid #ECEEF1;`)}>{e.rec}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{e.desc}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{e.pctDesc}</td>
                  </tr>
                </React.Fragment>))}
                <tr>
                  <td style={S(`padding:9px; font-size:12px; font-weight:800; color:#0B3D2E;`)} colSpan="2">Total</td>
                  <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:800; color:#0B3D2E;`)}>{V.repEjTotU}</td>
                  <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:800; color:#0B3D2E;`)}>{V.repEjTotMonto}</td>
                  <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:800; color:#137A5B;`)}>{V.repEjTotRec}</td>
                  <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:800; color:#0B3D2E;`)}>{V.repEjTotDesc}</td>
                  <td style={S(`padding:9px;`)}></td>
                </tr>
              </tbody>
            </table>

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Composición de la cartera</h2>
            </div>
            <div style={S(`display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:14px;`)}>
              <div>
                <div style={S(`font-size:11.5px; font-weight:800; color:#0B3D2E; text-transform:uppercase; letter-spacing:.04em; margin-bottom:7px;`)}>Por tipo de compra</div>
                {(V.repTipo||[]).map((t, _k5) => (<React.Fragment key={_k5}>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 2px; border-bottom:1px solid #ECEEF1;`)}>
                    <span style={S(`font-size:12.5px; color:#33383F;`)}><span style={S(`display:inline-block; width:9px; height:9px; border-radius:2px; background:${t.color}; margin-right:7px;`)}></span>{t.label}</span>
                    <span className="num" style={S(`font-size:12px; color:#475063;`)}>{t.det} · <strong style={S(`color:#14171C;`)}>{t.pctL}</strong></span>
                  </div>
                </React.Fragment>))}
              </div>
              <div>
                <div style={S(`font-size:11.5px; font-weight:800; color:#0B3D2E; text-transform:uppercase; letter-spacing:.04em; margin-bottom:7px;`)}>Por etapa</div>
                {(V.repEt||[]).map((t, _k6) => (<React.Fragment key={_k6}>
                  <div style={S(`display:flex; align-items:center; justify-content:space-between; gap:8px; padding:7px 2px; border-bottom:1px solid #ECEEF1;`)}>
                    <span style={S(`font-size:12.5px; color:#33383F;`)}><span style={S(`display:inline-block; width:9px; height:9px; border-radius:2px; background:${t.color}; margin-right:7px;`)}></span>{t.label}</span>
                    <span className="num" style={S(`font-size:12px; color:#475063;`)}>{t.det} · <strong style={S(`color:#14171C;`)}>{t.pctL}</strong></span>
                  </div>
                </React.Fragment>))}
              </div>
            </div>
            <div style={S(`margin-top:16px;`)}>
              <div style={S(`font-size:11.5px; font-weight:800; color:#0B3D2E; text-transform:uppercase; letter-spacing:.04em; margin-bottom:7px;`)}>Por canal de captación</div>
              <table style={S(`width:100%; border-collapse:collapse;`)}>
                <thead><tr>
                  <th style={S(`text-align:left; padding:7px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Canal</th>
                  <th style={S(`text-align:right; padding:7px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ops.</th>
                  <th style={S(`text-align:right; padding:7px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Monto</th>
                  <th style={S(`text-align:right; padding:7px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>% Monto</th>
                </tr></thead>
                <tbody>
                  {(V.repCanal||[]).map((c, _k7) => (<React.Fragment key={_k7}>
                    <tr>
                      <td style={S(`padding:8px 9px; font-size:12.5px; color:#33383F; border-bottom:1px solid #ECEEF1;`)}>{c.label}</td>
                      <td className="num" style={S(`padding:8px 9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{c.u}</td>
                      <td className="num" style={S(`padding:8px 9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{c.fin}</td>
                      <td className="num" style={S(`padding:8px 9px; font-size:12.5px; text-align:right; font-weight:700; color:#14171C; border-bottom:1px solid #ECEEF1;`)}>{c.pctL}</td>
                    </tr>
                  </React.Fragment>))}
                </tbody>
              </table>
            </div>

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Descuentos por modalidad</h2>
            </div>
            <p style={S(`font-size:12.5px; color:#6B7280; margin:8px 0 0; line-height:1.5;`)}>{V.repModNote}</p>
            <table style={S(`width:100%; border-collapse:collapse; margin-top:12px;`)}>
              <thead><tr>
                <th style={S(`text-align:left; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Modalidad</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ops.</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Desc. prom.</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>% s/ lista</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Tope</th>
                <th style={S(`text-align:right; padding:8px 9px; font-size:9.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Excep.</th>
              </tr></thead>
              <tbody>
                {(V.repMod||[]).map((m, _k8) => (<React.Fragment key={_k8}>
                  <tr>
                    <td style={S(`padding:9px; font-size:12.5px; font-weight:700; color:#14171C; border-bottom:1px solid #ECEEF1;`)}><span style={S(`display:inline-block; width:9px; height:9px; border-radius:2px; background:${m.color}; margin-right:7px;`)}></span>{m.label}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{m.u}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:700; color:#14171C; border-bottom:1px solid #ECEEF1;`)}>{m.avg}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{m.pct}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; color:#475063; border-bottom:1px solid #ECEEF1;`)}>{m.tope}</td>
                    <td className="num" style={S(`padding:9px; font-size:12.5px; text-align:right; font-weight:700; color:${m.excColor}; border-bottom:1px solid #ECEEF1;`)}>{m.exc}</td>
                  </tr>
                </React.Fragment>))}
              </tbody>
            </table>

            {V.repHasPend && (<>
              <div data-report-sec="" style={S(`margin-top:22px; background:#FBF6E7; border:1px solid #EBDBA8; border-radius:12px; padding:16px 18px;`)}>
                <div style={S(`display:flex; align-items:center; gap:8px; margin-bottom:4px;`)}>
                  <span style={S(`font-size:15px;`)}>⚠️</span>
                  <h3 style={S(`margin:0; font-size:14px; font-weight:800; color:#8A6A1E;`)}>Ventas con datos pendientes</h3>
                </div>
                <p style={S(`margin:0 0 12px; font-size:11.5px; color:#A98B43; line-height:1.5;`)}>Todas cuentan como <strong>vendidas</strong>; estas tienen información por completar (fecha de separación, firma o cliente). Edítalas luego en Operaciones.</p>
                <div style={S(`display:grid; grid-template-columns:1fr 1fr; gap:16px;`)}>
                  <div>
                    <div style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#137A5B; margin-bottom:7px;`)}>Contado (incl. fracc.) · {V.repPendContN}</div>
                    {V.repHasPendCont && (<>
                      {(V.repPendCont||[]).map((p, _k9) => (<React.Fragment key={_k9}>
                        <div style={S(`display:flex; align-items:flex-start; gap:9px; padding:8px 0; border-bottom:1px solid #EEE6CC;`)}>
                          <div style={S(`width:24px; height:24px; border-radius:7px; background:${p.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:9px; flex-shrink:0;`)} className="num">{p.initials}</div>
                          <div style={S(`min-width:0;`)}>
                            <div style={S(`font-size:12px; font-weight:700; color:#14171C;`)}>{p.ej} · <span className="num" style={S(`color:#8A929C;`)}>{p.lote}</span></div>
                            <div style={S(`font-size:11px; color:#B0593C; margin-top:1px;`)}>Falta: {p.falta}</div>
                          </div>
                        </div>
                      </React.Fragment>))}
                    </>)}
                    {V.repHasPendCont && (<><div style={S(`font-size:11.5px; color:#3E8466;`)}>✓ Sin pendientes</div></>)}
                  </div>
                  <div>
                    <div style={S(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:#C49A3F; margin-bottom:7px;`)}>Financiado (fracc.) · {V.repPendFinN}</div>
                    {V.repHasPendFin && (<>
                      {(V.repPendFin||[]).map((p, _k10) => (<React.Fragment key={_k10}>
                        <div style={S(`display:flex; align-items:flex-start; gap:9px; padding:8px 0; border-bottom:1px solid #EEE6CC;`)}>
                          <div style={S(`width:24px; height:24px; border-radius:7px; background:${p.color}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:9px; flex-shrink:0;`)} className="num">{p.initials}</div>
                          <div style={S(`min-width:0;`)}>
                            <div style={S(`font-size:12px; font-weight:700; color:#14171C;`)}>{p.ej} · <span className="num" style={S(`color:#8A929C;`)}>{p.lote}</span></div>
                            <div style={S(`font-size:11px; color:#B0593C; margin-top:1px;`)}>Falta: {p.falta}</div>
                          </div>
                        </div>
                      </React.Fragment>))}
                    </>)}
                    {V.repHasPendFin && (<><div style={S(`font-size:11.5px; color:#3E8466;`)}>✓ Sin pendientes</div></>)}
                  </div>
                </div>
              </div>
            </>)}

            <div data-report-sec="" style={S(`border-top:2px solid #0B3D2E; margin-top:30px; padding-top:8px;`)}>
              <h2 style={S(`font-size:17px; font-weight:800; color:#14171C; margin:0 0 2px;`)}>Anexo — Detalle de operaciones</h2>
            </div>
            <table style={S(`width:100%; border-collapse:collapse; margin-top:12px;`)}>
              <thead><tr>
                <th style={S(`text-align:left; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Ejecutivo</th>
                <th style={S(`text-align:left; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Cliente</th>
                <th style={S(`text-align:center; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Lote</th>
                <th style={S(`text-align:left; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>Tipo</th>
                <th style={S(`text-align:center; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>1ª Vista</th>
                <th style={S(`text-align:right; padding:7px 8px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#8A929C; border-bottom:2px solid #0B3D2E;`)}>P. Final</th>
              </tr></thead>
              <tbody>
                {(V.repAnexo||[]).map((r, _k11) => (<React.Fragment key={_k11}>
                  <tr>
                    <td style={S(`padding:7px 8px; font-size:11.5px; font-weight:700; color:#14171C; border-bottom:1px solid #EEF0F3;`)}>{r.ej}</td>
                    <td style={S(`padding:7px 8px; font-size:11px; color:#6B7280; border-bottom:1px solid #EEF0F3;`)}>{r.cli}</td>
                    <td className="num" style={S(`padding:7px 8px; font-size:11.5px; text-align:center; color:#475063; border-bottom:1px solid #EEF0F3;`)}>{r.lote}</td>
                    <td style={S(`padding:7px 8px; font-size:11px; font-weight:700; color:${r.tipoColor}; border-bottom:1px solid #EEF0F3;`)}>{r.tipo}</td>
                    <td className="num" style={S(`padding:7px 8px; font-size:11.5px; text-align:center; font-weight:700; color:${r.visitoColor}; border-bottom:1px solid #EEF0F3;`)}>{r.visito}</td>
                    <td className="num" style={S(`padding:7px 8px; font-size:11.5px; text-align:right; font-weight:700; color:#14171C; border-bottom:1px solid #EEF0F3;`)}>{r.fin}</td>
                  </tr>
                </React.Fragment>))}
              </tbody>
            </table>

            <p style={S(`font-size:10px; color:#9AA1AB; margin:22px 0 0; line-height:1.5; border-top:1px solid #E6E8EC; padding-top:11px;`)}>Fuente: Tablero Comercial Nápoles. Informe integral de gestión de ventas — incluye recaudo del periodo e iniciales por cobrar. Documento de uso interno.</p>
          </div>
        </>)}
      </div>
    </div>
  </>)
); }

Object.assign(window, { CComisiones, CBoletas, CInforme });
