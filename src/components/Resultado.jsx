import React from "react";
import { crc } from "../lib/economia.js";

const ETAPAS = [
  { k: "viral", t: "Viral", sub: "La encuentra", c: "var(--amarillo)", w: "100%" },
  { k: "experiencial", t: "Experiencial", sub: "La convence", c: "var(--teal)", w: "89%" },
  { k: "confianza", t: "Confianza", sub: "La cierra", c: "#FFFFFF", w: "78%" },
];

/** Render del funnel generado. */
export default function Resultado({ funnel, meta, eco, onCopiar, onGuardar, guardado }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <div className="cejilla" style={{ color: "var(--amarillo)" }}>
            Semana {meta.semana} · {meta.sucursal} · {meta.franja}
          </div>
          <div style={{ fontSize: 21, fontWeight: 900, marginTop: 4 }}>{meta.nombre}</div>
          <div style={{ fontSize: 12, color: "var(--gris)", marginTop: 3 }}>
            {meta.publico} · {meta.edad} · {meta.temperatura}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="boton-linea" onClick={onCopiar}>Copiar todo</button>
          <button className="boton-linea" onClick={onGuardar} disabled={guardado}
            style={guardado ? {} : { background: "var(--teal)", color: "#0A0A0A" }}>
            {guardado ? "Guardado ✓" : "Guardar en historial"}
          </button>
        </div>
      </div>

      <div className="tarjeta" style={{ marginBottom: 13, borderLeft: "3px solid var(--teal)" }}>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>{funnel.diagnostico}</div>
      </div>

      {ETAPAS.map((s) => {
        const p = funnel[s.k];
        if (!p) return null;
        return (
          <div key={s.k} style={{ width: s.w, margin: "0 auto 12px" }}>
            <div className="tarjeta" style={{ borderLeft: `3px solid ${s.c}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
                <div className="cejilla" style={{ color: s.c }}>{s.t} · {s.sub}</div>
                <div style={{ fontSize: 11, color: "var(--gris)" }}>{p.formato}</div>
              </div>
              <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 8 }}>{p.concepto}</div>
              <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: "#D8D6D0" }}>{p.guion}</div>
              {p.texto_pantalla && (
                <div style={{ marginTop: 9, fontSize: 12, color: "var(--gris)" }}>
                  En pantalla: <span style={{ color: "var(--hueso)", fontWeight: 700 }}>{p.texto_pantalla}</span>
                </div>
              )}
              {p.cta && (
                <div style={{ marginTop: 3, fontSize: 12, color: "var(--gris)" }}>
                  CTA: <span style={{ color: "var(--hueso)", fontWeight: 700 }}>{p.cta}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {funnel.copy_pauta && (
        <div className="tarjeta" style={{ marginBottom: 13 }}>
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 10 }}>Meta Ads</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>{funnel.copy_pauta.primario}</div>
          <div style={{ fontSize: 13, fontWeight: 300, color: "#D8D6D0" }}>{funnel.copy_pauta.descripcion}</div>
          <div style={{ marginTop: 10, display: "inline-block", background: "var(--amarillo)", color: "#0A0A0A", padding: "6px 14px", fontSize: 11, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase" }}>
            {funnel.copy_pauta.boton}
          </div>
          {funnel.segmentacion && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--borde)", fontSize: 12, color: "var(--gris)", lineHeight: 1.8 }}>
              <div>Intereses: <span style={{ color: "var(--hueso)" }}>{funnel.segmentacion.intereses?.join(" · ")}</span></div>
              <div>Excluir: <span style={{ color: "var(--hueso)" }}>{funnel.segmentacion.exclusiones?.join(" · ")}</span></div>
              <div style={{ marginTop: 6, fontWeight: 300 }}>{funnel.segmentacion.nota}</div>
            </div>
          )}
        </div>
      )}

      <div className="tarjeta" style={{ marginBottom: 13 }}>
        <div className="cejilla" style={{ color: "var(--teal)", marginBottom: 12 }}>Flujo ManyChat</div>
        <div style={{ fontSize: 12, color: "var(--gris)", marginBottom: 4 }}>
          Trigger: <span style={{ color: "var(--hueso)" }}>{funnel.trigger.tipo}</span> · Palabra clave:{" "}
          <span style={{ color: "var(--amarillo)", fontWeight: 900 }}>{funnel.trigger.palabra_clave}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--gris)", marginBottom: 14 }}>
          Historia: <span style={{ color: "var(--hueso)" }}>{funnel.trigger.story_cta}</span>
        </div>
        {funnel.mensajes?.map((m) => (
          <div key={m.paso} style={{ marginBottom: 10, paddingLeft: 13, borderLeft: "2px solid #2A2A2A" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "var(--teal)", letterSpacing: ".2em" }}>MSJ {m.paso}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{m.texto}</div>
            {m.botones?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {m.botones.map((b, i) => (
                  <span key={i} style={{ border: "1px solid var(--teal)", color: "var(--teal)", fontSize: 11, padding: "4px 10px", borderRadius: 2 }}>{b}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {funnel.recuperacion && (
          <div style={{ marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--borde)" }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "var(--gris)", letterSpacing: ".2em" }}>
              RECUPERACIÓN · {funnel.recuperacion.cuando}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, marginTop: 5 }}>{funnel.recuperacion.texto}</div>
          </div>
        )}
        <div style={{ marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--borde)", fontSize: 12, color: "var(--gris)" }}>
          Custom fields: {funnel.custom_fields?.join(" · ")}
        </div>
      </div>

      <div className="tarjeta" style={{ marginBottom: 13, borderLeft: "3px solid var(--amarillo)" }}>
        <div className="cejilla" style={{ color: "var(--amarillo)", marginBottom: 12 }}>Trazabilidad hasta caja</div>
        <div style={{ fontSize: 13, lineHeight: 1.9 }}>
          Código: <span style={{ background: "var(--amarillo)", color: "#0A0A0A", padding: "2px 9px", fontWeight: 900, letterSpacing: ".08em" }}>{meta.codigo}</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 10, wordBreak: "break-all", fontFamily: "ui-monospace,monospace" }}>{meta.utm}</div>
        <div style={{ fontSize: 13, marginTop: 14, lineHeight: 1.65, color: "#D8D6D0" }}>
          <strong style={{ color: "var(--hueso)" }}>Mesero:</strong> {funnel.mesero}
        </div>
      </div>

      <div className="tarjeta" style={{ marginBottom: 13 }}>
        <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 13 }}>Escenarios de retorno</div>
        {eco.escenarios.map((e) => (
          <div key={e.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--borde-suave)" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.nombre}</div>
              <div style={{ fontSize: 11, color: "var(--gris)" }}>{e.conv} promos · {crc(e.ingreso)} en ventas</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: e.roi > 0 ? "var(--teal)" : "var(--rojo)" }}>
                {e.roi > 0 ? "+" : ""}{e.roi.toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: "var(--gris)" }}>{crc(e.gp)} margen</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 12 }}>
          ROI sobre margen bruto real, no sobre venta. Piso = punto de equilibrio.
        </div>
      </div>

      {funnel.checklist && (
        <div className="tarjeta">
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 12 }}>Para ejecutar</div>
          {funnel.checklist.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: i < funnel.checklist.length - 1 ? "1px solid var(--borde-suave)" : "none" }}>
              <span style={{ color: "var(--teal)", fontWeight: 900, fontSize: 12, minWidth: 16 }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.55 }}>{c}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
