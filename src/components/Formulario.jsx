import React from "react";
import { CATALOGO } from "../data/catalogo.js";
import { OBJETIVOS, PUBLICOS, TEMPERATURAS, FRANJAS, SUCURSALES } from "../data/publicos.js";
import { MODELOS } from "../data/modelos.js";
import { crc } from "../lib/economia.js";

/** Todos los controles de entrada del funnel. */
export default function Formulario({ f, set, eco, alerta, onGenerar, cargando }) {
  const publico = PUBLICOS.find((p) => p.id === f.publicoId);

  const setArt = (id, campo, valor) =>
    set.articulos(f.articulos.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));

  const nuevoArticulo = (base) => ({
    id: Date.now() + Math.random(),
    nombre: base?.n || "",
    precio: base?.precio || 0,
    costo: base ? base.precio - base.gp : 0,
    cantidad: 1,
  });

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 7 }}>
          Nombre de la promoción
        </div>
        <input className="campo" value={f.nombrePromo} style={{ fontSize: 16, fontWeight: 700 }}
          placeholder="Ej. Noche de birria · Tardeada de dos"
          onChange={(e) => set.nombrePromo(e.target.value)} />
      </div>

      <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 9 }}>Objetivo</div>
      <div className="rejilla" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginBottom: 22 }}>
        {OBJETIVOS.map((o) => (
          <button key={o.id} className="opcion" data-on={f.objetivo === o.id ? "1" : "0"}
            onClick={() => set.objetivo(o.id)}>
            <div style={{ fontWeight: 900, fontSize: 13 }}>{o.label}</div>
            <div style={{ fontSize: 11, fontWeight: 300, opacity: 0.7, marginTop: 3 }}>{o.desc}</div>
          </button>
        ))}
      </div>

      {/* Artículos */}
      <div className="tarjeta" style={{ marginBottom: 16 }}>
        <div className="cejilla" style={{ color: "var(--amarillo)", marginBottom: 14 }}>
          Artículos de la promoción
        </div>
        <div className="rejilla fila-articulo" style={{ gap: 7, marginBottom: 6 }}>
          {["Artículo", "Precio", "Costo", "Cant.", ""].map((h, i) => (
            <div key={i} style={{ fontSize: 9, color: "var(--gris)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700 }}>{h}</div>
          ))}
        </div>

        {f.articulos.map((a) => (
          <div key={a.id} style={{ marginBottom: 8 }}>
            <div className="rejilla fila-articulo" style={{ gap: 7, alignItems: "center" }}>
              <input className="campo campo-sm" value={a.nombre} placeholder="Nombre del artículo"
                onChange={(e) => setArt(a.id, "nombre", e.target.value)} />
              <input className="campo campo-sm" type="number" value={a.precio}
                onChange={(e) => setArt(a.id, "precio", e.target.value)} />
              <input className="campo campo-sm" type="number" value={a.costo}
                onChange={(e) => setArt(a.id, "costo", e.target.value)} />
              <input className="campo campo-sm" type="number" min="1" value={a.cantidad}
                onChange={(e) => setArt(a.id, "cantidad", e.target.value)} />
              <button className="equis" aria-label="Quitar artículo"
                onClick={() => set.articulos(f.articulos.filter((y) => y.id !== a.id))}>×</button>
            </div>
            <div style={{ fontSize: 10, color: "var(--gris)", marginTop: 3 }}>
              margen {crc((Number(a.precio) - Number(a.costo)) * Number(a.cantidad || 1))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <select className="campo campo-sm" style={{ flex: 1, minWidth: 190 }} value=""
            onChange={(e) => {
              const base = CATALOGO.find((p) => p.n === e.target.value);
              if (base) set.articulos([...f.articulos, nuevoArticulo(base)]);
              e.target.value = "";
            }}>
            <option value="">+ Agregar del menú…</option>
            {CATALOGO.map((p) => (
              <option key={p.n} value={p.n}>{p.n} — {p.clase} · margen {crc(p.gp)}</option>
            ))}
          </select>
          <button className="boton-linea" onClick={() => set.articulos([...f.articulos, nuevoArticulo()])}>
            Artículo nuevo
          </button>
        </div>
      </div>

      {/* Precio */}
      <div className="tarjeta" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div className="cejilla" style={{ color: "var(--amarillo)" }}>Precio</div>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--gris)", cursor: "pointer" }}>
            <input type="checkbox" checked={f.usarPrecioPromo}
              onChange={(e) => set.usarPrecioPromo(e.target.checked)} />
            Precio especial de paquete
          </label>
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 4 }}>Suma en carta</div>
            <div style={{ fontSize: 20, fontWeight: 700, textDecoration: f.usarPrecioPromo ? "line-through" : "none", opacity: f.usarPrecioPromo ? 0.45 : 1 }}>
              {crc(eco.sumaCarta)}
            </div>
          </div>
          {f.usarPrecioPromo && (
            <div>
              <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 4 }}>Precio promoción ₡</div>
              <input className="campo" type="number" step="100" value={f.precioPromo}
                onChange={(e) => set.precioPromo(e.target.value)}
                style={{ fontSize: 20, fontWeight: 900, color: "var(--amarillo)", width: 140 }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 160, fontSize: 12, color: "var(--gris)", lineHeight: 1.75 }}>
            Ahorro de la clienta {crc(eco.descuento)} ({eco.descuentoPct.toFixed(0)}%)<br />
            Margen por promo <span style={{ color: eco.gpPromo > 0 ? "var(--teal)" : "var(--rojo)", fontWeight: 900 }}>{crc(eco.gpPromo)}</span><br />
            Food cost {eco.foodCost.toFixed(0)}%
          </div>
        </div>
        {alerta && (
          <div style={{ marginTop: 14, padding: "10px 12px", border: "1px solid var(--rojo)", borderRadius: 2, fontSize: 12, color: "var(--rojo)", lineHeight: 1.5 }}>
            {alerta}
          </div>
        )}
      </div>

      {/* Público */}
      <div className="tarjeta" style={{ marginBottom: 16 }}>
        <div className="cejilla" style={{ color: "var(--amarillo)", marginBottom: 14 }}>Público objetivo</div>
        <div className="rejilla" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", marginBottom: 14 }}>
          {PUBLICOS.map((p) => (
            <button key={p.id} className="opcion" data-on={f.publicoId === p.id ? "1" : "0"}
              onClick={() => { set.publicoId(p.id); if (p.franja) set.franja(p.franja); }}>
              <div style={{ fontWeight: 900, fontSize: 12 }}>{p.n}</div>
              {p.desc && <div style={{ fontSize: 10, fontWeight: 300, opacity: 0.7, marginTop: 3, lineHeight: 1.4 }}>{p.desc}</div>}
            </button>
          ))}
        </div>

        {f.publicoId === "custom" && (
          <textarea className="campo" rows={2} value={f.publicoCustom} style={{ marginBottom: 12, resize: "vertical" }}
            placeholder="Describí a quién le hablás: qué busca, qué hora del día, qué le importa"
            onChange={(e) => set.publicoCustom(e.target.value)} />
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {TEMPERATURAS.map((t) => (
            <button key={t.id} className="opcion opcion-sm" data-on={f.temperatura === t.id ? "1" : "0"}
              onClick={() => set.temperatura(t.id)}>
              {t.n} <span style={{ fontWeight: 300, opacity: 0.65 }}>· {t.desc}</span>
            </button>
          ))}
        </div>

        <div className="rejilla" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 5 }}>Edad</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input className="campo campo-sm" type="number" value={f.edadMin} onChange={(e) => set.edadMin(e.target.value)} />
              <span style={{ color: "var(--gris)" }}>–</span>
              <input className="campo campo-sm" type="number" value={f.edadMax} onChange={(e) => set.edadMax(e.target.value)} />
            </div>
          </div>
          <div style={{ gridColumn: "span 2", minWidth: 200 }}>
            <div style={{ fontSize: 11, color: "var(--gris)", marginBottom: 5 }}>Intereses (opcional)</div>
            <input className="campo campo-sm" value={f.intereses} placeholder={publico.intereses}
              onChange={(e) => set.intereses(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Contexto */}
      <div className="rejilla" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 6 }}>Franja</div>
          <select className="campo" value={f.franja} onChange={(e) => set.franja(e.target.value)}>
            {FRANJAS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 6 }}>Sucursal</div>
          <select className="campo" value={f.sucursal} onChange={(e) => set.sucursal(e.target.value)}>
            {SUCURSALES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div>
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 6 }}>Pauta ₡</div>
          <input className="campo" type="number" step="1000" value={f.pauta} onChange={(e) => set.pauta(e.target.value)} />
        </div>
        <div>
          <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 6 }}>Contenido ₡</div>
          <input className="campo" type="number" step="1000" value={f.costoContenido} onChange={(e) => set.costoContenido(e.target.value)} />
        </div>
      </div>

      {/* Punto de equilibrio */}
      <div className="tarjeta" style={{ marginBottom: 16, borderColor: "var(--teal)" }}>
        <div className="cejilla" style={{ color: "var(--teal)", marginBottom: 12 }}>Punto de equilibrio</div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: eco.breakEven ? "var(--amarillo)" : "var(--rojo)" }}>
              {eco.breakEven ?? "—"}
            </div>
            <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 4 }}>promociones vendidas</div>
          </div>
          <div style={{ flex: 1, minWidth: 180, borderLeft: "1px solid var(--borde)", paddingLeft: 18, fontSize: 12, color: "var(--gris)", lineHeight: 1.75 }}>
            Inversión {crc(eco.inversion)}<br />
            Margen por promo {crc(eco.gpPromo)}<br />
            {f.articulos.length} artículo{f.articulos.length !== 1 ? "s" : ""} · {f.franja}
          </div>
        </div>
      </div>

      {/* Modelo que redacta */}
      <div style={{ marginBottom: 12 }}>
        <div className="cejilla" style={{ color: "var(--gris)", marginBottom: 6 }}>
          Modelo que redacta
        </div>
        <select className="campo" value={f.modelo} onChange={(e) => set.modelo(e.target.value)}>
          {MODELOS.map((m) => (
            <option key={m.id} value={m.id}>{m.n}</option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--gris)", marginTop: 6, lineHeight: 1.6 }}>
          {MODELOS.find((m) => m.id === f.modelo)?.desc}
        </div>
      </div>

      <button className="boton" onClick={onGenerar} disabled={cargando}>
        {cargando ? "Armando el funnel…" : "Generar funnel"}
      </button>
    </>
  );
}
