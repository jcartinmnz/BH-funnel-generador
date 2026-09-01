import React, { useMemo, useState } from "react";
import { crc, metricasReales } from "../lib/economia.js";
import { OBJETIVOS } from "../data/publicos.js";

const CAMPOS = [
  { k: "alcance", l: "Alcance" },
  { k: "conversaciones", l: "Conversaciones" },
  { k: "conversiones", l: "Conversiones" },
];

export default function Historial({ historial, cargando, onEditar, onBorrar, onIrANuevo }) {
  const [confirmar, setConfirmar] = useState(null);

  const resumen = useMemo(() => {
    const medidos = historial.filter((h) => metricasReales(h).medido);
    const inv = medidos.reduce((s, h) => s + Number(h.inversion || 0), 0);
    const mar = medidos.reduce((s, h) => s + metricasReales(h).margen, 0);
    const cps = medidos.map((h) => metricasReales(h).cpConversion).filter((x) => x != null);
    const mejor = medidos.length
      ? medidos.reduce((a, b) => (metricasReales(a).roi >= metricasReales(b).roi ? a : b))
      : null;
    const porObjetivo = OBJETIVOS.map((o) => {
      const g = medidos.filter((h) => h.objetivo === o.id);
      const i = g.reduce((s, h) => s + Number(h.inversion || 0), 0);
      const m = g.reduce((s, h) => s + metricasReales(h).margen, 0);
      return { ...o, cantidad: g.length, roi: i > 0 ? ((m - i) / i) * 100 : null };
    }).filter((x) => x.cantidad > 0);
    return {
      total: historial.length, medidos: medidos.length, inv, mar,
      roi: inv > 0 ? ((mar - inv) / inv) * 100 : null,
      cpProm: cps.length ? cps.reduce((a, b) => a + b, 0) / cps.length : null,
      mejor, porObjetivo,
    };
  }, [historial]);

  const copiarTabla = () => {
    const head = ["Fecha", "Sem", "Promo", "Objetivo", "Público", "Temp", "Sucursal", "Franja",
      "Código", "Inversión", "Margen/promo", "Break-even", "Alcance", "Conversaciones",
      "Conversiones", "Margen real", "ROI %", "Costo/conversión", "Notas"].join("\t");
    const filas = historial.map((h) => {
      const m = metricasReales(h);
      return [new Date(h.fecha).toLocaleDateString("es-CR"), h.semana, h.nombre, h.objetivoLabel,
        h.publico, h.temperatura, h.sucursal, h.franja, h.codigo, h.inversion, h.gpPromo,
        h.breakEven ?? "", h.alcance, h.conversaciones, h.conversiones, Math.round(m.margen),
        m.medido ? m.roi.toFixed(0) : "", m.cpConversion ? Math.round(m.cpConversion) : "", h.notas].join("\t");
    });
    navigator.clipboard?.writeText([head, ...filas].join("\n"));
  };

  if (cargando) return <div className="latiendo" style={{ color: "var(--gris)", fontSize: 13 }}>Abriendo el historial…</div>;

  if (!historial.length) {
    return (
      <div className="tarjeta" style={{ textAlign: "center", padding: "44px 20px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Todavía no hay funnels registrados</div>
        <div style={{ fontSize: 13, color: "var(--gris)", marginBottom: 18, lineHeight: 1.6 }}>
          Generá un funnel y guardalo acá. Después metés los números reales y se arma solo el registro de ROI.
        </div>
        <button className="boton-linea" onClick={onIrANuevo}>Crear el primero</button>
      </div>
    );
  }

  return (
    <>
      <div className="tarjeta" style={{ marginBottom: 16, borderColor: "var(--teal)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div className="cejilla" style={{ color: "var(--teal)" }}>
            Acumulado · {resumen.medidos} de {resumen.total} con datos
          </div>
          <button className="boton-linea" onClick={copiarTabla}>Copiar a hoja de cálculo</button>
        </div>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: resumen.roi == null ? "var(--gris)" : resumen.roi >= 0 ? "var(--amarillo)" : "var(--rojo)" }}>
              {resumen.roi == null ? "—" : `${resumen.roi > 0 ? "+" : ""}${resumen.roi.toFixed(0)}%`}
            </div>
            <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 4 }}>ROI acumulado</div>
          </div>
          <div style={{ flex: 1, minWidth: 190, borderLeft: "1px solid var(--borde)", paddingLeft: 20, fontSize: 12, color: "var(--gris)", lineHeight: 1.8 }}>
            Invertido {crc(resumen.inv)} · Margen {crc(resumen.mar)}<br />
            {resumen.cpProm ? `Costo por conversión ${crc(resumen.cpProm)}` : "Sin conversiones registradas"}<br />
            {resumen.mejor ? `Mejor: ${resumen.mejor.nombre} (${metricasReales(resumen.mejor).roi.toFixed(0)}%)` : ""}
          </div>
        </div>
        {resumen.porObjetivo.length > 1 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--borde)", display: "flex", gap: 20, flexWrap: "wrap" }}>
            {resumen.porObjetivo.map((o) => (
              <div key={o.id}>
                <div style={{ fontSize: 15, fontWeight: 900, color: o.roi >= 0 ? "var(--teal)" : "var(--rojo)" }}>
                  {o.roi == null ? "—" : `${o.roi > 0 ? "+" : ""}${o.roi.toFixed(0)}%`}
                </div>
                <div style={{ fontSize: 10, color: "var(--gris)" }}>{o.label} · {o.cantidad}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {historial.map((h) => {
        const m = metricasReales(h);
        const cumple = h.breakEven && m.conv >= h.breakEven;
        return (
          <div key={h.id} className="tarjeta" style={{ marginBottom: 12, borderLeft: `3px solid ${m.medido ? (m.roi >= 0 ? "var(--teal)" : "var(--rojo)") : "#2A2A2A"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900 }}>{h.nombre}</div>
                <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 3, lineHeight: 1.6 }}>
                  Sem {h.semana} · {h.objetivoLabel} · {h.publico} · {h.temperatura}<br />
                  {h.sucursal} · {h.franja} · <span style={{ color: "var(--amarillo)", fontWeight: 700 }}>{h.codigo}</span><br />
                  {h.articulos}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: !m.medido ? "var(--gris)" : m.roi >= 0 ? "var(--teal)" : "var(--rojo)" }}>
                  {m.medido ? `${m.roi > 0 ? "+" : ""}${m.roi.toFixed(0)}%` : "sin datos"}
                </div>
                <div style={{ fontSize: 10, color: "var(--gris)" }}>{crc(h.inversion)} invertidos</div>
                {confirmar === h.id ? (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button className="equis" style={{ color: "var(--rojo)", fontSize: 11, fontWeight: 700 }}
                      onClick={() => { onBorrar(h.id); setConfirmar(null); }}>Borrar</button>
                    <button className="equis" style={{ fontSize: 11 }} onClick={() => setConfirmar(null)}>Cancelar</button>
                  </div>
                ) : (
                  <button className="equis" style={{ marginTop: 6 }} aria-label="Borrar registro"
                    onClick={() => setConfirmar(h.id)}>×</button>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--borde-suave)" }}>
              <div className="rejilla" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))" }}>
                {CAMPOS.map((c) => (
                  <div key={c.k}>
                    <div style={{ fontSize: 9, color: "var(--gris)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{c.l}</div>
                    <input className="campo campo-sm" type="number" value={h[c.k]} placeholder="—"
                      onChange={(e) => onEditar(h.id, c.k, e.target.value)} />
                  </div>
                ))}
              </div>
              <input className="campo campo-sm" style={{ marginTop: 8 }} value={h.notas}
                placeholder="Notas: qué funcionó, qué no"
                onChange={(e) => onEditar(h.id, "notas", e.target.value)} />

              <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 12, lineHeight: 1.8 }}>
                Break-even {h.breakEven} promos · margen unitario {crc(h.gpPromo)}<br />
                {m.medido ? (
                  <>
                    Margen real {crc(m.margen)}
                    {m.cpConversacion != null && ` · ${crc(m.cpConversacion)} por conversación`}
                    {m.cpConversion != null && ` · ${crc(m.cpConversion)} por conversión`}
                    {m.tasa != null && ` · cierre ${m.tasa.toFixed(0)}%`}
                    <br />
                    <span style={{ color: cumple ? "var(--teal)" : "var(--gris)" }}>
                      {cumple ? "Superó el punto de equilibrio" : `Faltan ${h.breakEven - m.conv} promos para equilibrio`}
                    </span>
                  </>
                ) : "Meté los números cuando cierre la semana."}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
