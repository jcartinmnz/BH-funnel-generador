import React, { useState, useMemo, useEffect } from "react";
import { CATALOGO } from "./data/catalogo.js";
import { OBJETIVOS, PUBLICOS, TEMPERATURAS } from "./data/publicos.js";
import {
  crc, semanaISO, calcularEconomia, evaluarRiesgo, generarCodigo, generarUTM,
} from "./lib/economia.js";
import { leerHistorial, guardarHistorial } from "./lib/storage.js";
import { generarFunnel } from "./lib/api.js";
import { MODELO_POR_DEFECTO } from "./data/modelos.js";
import Formulario from "./components/Formulario.jsx";
import Resultado from "./components/Resultado.jsx";
import Historial from "./components/Historial.jsx";

const art = (base) => ({
  id: Date.now() + Math.random(),
  nombre: base?.n || "",
  precio: base?.precio || 0,
  costo: base ? base.precio - base.gp : 0,
  cantidad: 1,
});

export default function App() {
  const [vista, setVista] = useState("nuevo");

  const [nombrePromo, setNombrePromo] = useState("");
  const [objetivo, setObjetivo] = useState("promo");
  const [articulos, setArticulos] = useState([
    art(CATALOGO.find((p) => p.n === "Tacos de Birria")),
    art(CATALOGO.find((p) => p.n === "Gin Tonic That Girl")),
  ]);
  const [usarPrecioPromo, setUsarPrecioPromo] = useState(true);
  const [precioPromo, setPrecioPromo] = useState(9900);
  const [publicoId, setPublicoId] = useState("protagonista");
  const [publicoCustom, setPublicoCustom] = useState("");
  const [intereses, setIntereses] = useState("");
  const [edadMin, setEdadMin] = useState(18);
  const [edadMax, setEdadMax] = useState(35);
  const [temperatura, setTemperatura] = useState("frio");
  const [sucursal, setSucursal] = useState("Escazú");
  const [franja, setFranja] = useState("Social 6–8pm");
  const [pauta, setPauta] = useState(10000);
  const [modelo, setModelo] = useState(MODELO_POR_DEFECTO);
  const [costoContenido, setCostoContenido] = useState(5000);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [guardado, setGuardado] = useState(false);

  const [historial, setHistorial] = useState([]);
  const [cargandoHist, setCargandoHist] = useState(true);

  const publico = PUBLICOS.find((p) => p.id === publicoId);
  const objetivoObj = OBJETIVOS.find((o) => o.id === objetivo);
  const tempObj = TEMPERATURAS.find((t) => t.id === temperatura);

  useEffect(() => {
    leerHistorial().then((h) => { setHistorial(h); setCargandoHist(false); });
  }, []);

  const eco = useMemo(
    () => calcularEconomia(articulos, usarPrecioPromo ? precioPromo : null, pauta, costoContenido),
    [articulos, usarPrecioPromo, precioPromo, pauta, costoContenido]
  );
  const alerta = evaluarRiesgo(eco);
  const codigo = useMemo(
    () => generarCodigo(nombrePromo || articulos[0]?.nombre),
    [nombrePromo, articulos]
  );
  const utm = generarUTM(objetivo, codigo);

  async function onGenerar() {
    setCargando(true); setError(null); setFunnel(null); setGuardado(false);
    try {
      const r = await generarFunnel({
        nombre: nombrePromo,
        objetivoLabel: objetivoObj.label,
        articulos: articulos.map((a) => `${a.cantidad}x ${a.nombre} (carta ${crc(a.precio)}, costo ${crc(a.costo)})`).join(" + "),
        precioCarta: crc(eco.sumaCarta),
        precioPromo: crc(eco.precioEfectivo),
        ahorro: crc(eco.descuento),
        ahorroPct: eco.descuentoPct.toFixed(0),
        publico: publicoId === "custom" ? publicoCustom : `${publico.n} — ${publico.desc}`,
        temperatura: `${tempObj.n} — ${tempObj.desc}`,
        edadMin, edadMax,
        intereses: intereses || publico.intereses,
        franja, sucursal, codigo,
      }, modelo);
      setFunnel(r);
    } catch (e) {
      setError(e.message
        ? `No se pudo generar el funnel — ${e.message}`
        : "No se pudo generar el funnel. Volvé a intentarlo.");
    } finally {
      setCargando(false);
    }
  }

  function onGuardar() {
    const reg = {
      id: `f_${Date.now()}`,
      fecha: new Date().toISOString(),
      semana: semanaISO(),
      nombre: nombrePromo || funnel?.nombre_sugerido || "Sin nombre",
      objetivo, objetivoLabel: objetivoObj.label,
      publico: publicoId === "custom" ? "Personalizado" : publico.n,
      temperatura: tempObj.n,
      sucursal, franja, codigo,
      articulos: articulos.map((a) => `${a.cantidad}x ${a.nombre}`).join(" + "),
      precio: eco.precioEfectivo,
      gpPromo: eco.gpPromo,
      inversion: eco.inversion,
      pauta: Number(pauta),
      breakEven: eco.breakEven,
      alcance: "", conversaciones: "", conversiones: "", notas: "",
    };
    const lista = [reg, ...historial];
    setHistorial(lista);
    guardarHistorial(lista);
    setGuardado(true);
  }

  function editarReg(id, campo, valor) {
    const lista = historial.map((h) => (h.id === id ? { ...h, [campo]: valor } : h));
    setHistorial(lista);
    guardarHistorial(lista);
  }

  function borrarReg(id) {
    const lista = historial.filter((h) => h.id !== id);
    setHistorial(lista);
    guardarHistorial(lista);
  }

  function copiarTodo() {
    if (!funnel) return;
    const t = `FUNNEL BH — ${nombrePromo || funnel.nombre_sugerido} · ${sucursal} · Semana ${semanaISO()}
Público: ${publicoId === "custom" ? publicoCustom : publico.n} (${edadMin}–${edadMax}) · ${tempObj.n}
Incluye: ${articulos.map((a) => `${a.cantidad}x ${a.nombre}`).join(" + ")}
Carta ${crc(eco.sumaCarta)} → Promo ${crc(eco.precioEfectivo)} · Margen ${crc(eco.gpPromo)} · Food cost ${eco.foodCost.toFixed(0)}%
Código ${codigo} · UTM ${utm}

DIAGNÓSTICO: ${funnel.diagnostico}

VIRAL — ${funnel.viral.concepto} (${funnel.viral.formato})
${funnel.viral.guion} | Pantalla: ${funnel.viral.texto_pantalla} | CTA: ${funnel.viral.cta}

EXPERIENCIAL — ${funnel.experiencial.concepto} (${funnel.experiencial.formato})
${funnel.experiencial.guion} | Pantalla: ${funnel.experiencial.texto_pantalla} | CTA: ${funnel.experiencial.cta}

CONFIANZA — ${funnel.confianza.concepto} (${funnel.confianza.formato})
${funnel.confianza.guion} | CTA: ${funnel.confianza.cta}

PAUTA: ${funnel.copy_pauta.primario} | ${funnel.copy_pauta.descripcion} | ${funnel.copy_pauta.boton}
Intereses: ${funnel.segmentacion?.intereses?.join(", ")} · Excluir: ${funnel.segmentacion?.exclusiones?.join(", ")}

MANYCHAT — ${funnel.trigger.tipo} · ${funnel.trigger.palabra_clave}
Historia: ${funnel.trigger.story_cta}
${funnel.mensajes.map((m) => `${m.paso}. ${m.texto}${m.botones?.length ? ` [${m.botones.join(" | ")}]` : ""}`).join("\n")}
Recuperación (${funnel.recuperacion.cuando}): ${funnel.recuperacion.texto}
Custom fields: ${funnel.custom_fields.join(", ")}

MESERO: ${funnel.mesero}

ECONOMÍA: Inversión ${crc(eco.inversion)} · Break-even ${eco.breakEven} promos
${eco.escenarios.map((e) => `${e.nombre}: ${e.conv} → ${crc(e.gp)} margen → ROI ${e.roi.toFixed(0)}%`).join("\n")}

CHECKLIST:
${funnel.checklist.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
    navigator.clipboard?.writeText(t);
  }

  const campos = {
    nombrePromo, objetivo, articulos, usarPrecioPromo, precioPromo, publicoId,
    publicoCustom, intereses, edadMin, edadMax, temperatura, sucursal, franja,
    pauta, costoContenido, modelo,
  };
  const set = {
    nombrePromo: setNombrePromo, objetivo: setObjetivo, articulos: setArticulos,
    usarPrecioPromo: setUsarPrecioPromo, precioPromo: setPrecioPromo,
    publicoId: setPublicoId, publicoCustom: setPublicoCustom, intereses: setIntereses,
    edadMin: setEdadMin, edadMax: setEdadMax, temperatura: setTemperatura,
    sucursal: setSucursal, franja: setFranja, pauta: setPauta,
    costoContenido: setCostoContenido, modelo: setModelo,
  };

  return (
    <div className="envoltura">
      <div style={{ borderBottom: "2px solid var(--amarillo)", paddingBottom: 13, marginBottom: 6 }}>
        <div className="cejilla" style={{ color: "var(--teal)" }}>Bread House · Bistró &amp; Café</div>
        <h1 style={{ fontWeight: 900, fontSize: 29, lineHeight: 1.05, margin: "8px 0 4px", letterSpacing: "-.02em" }}>
          Generador de funnels
        </h1>
        <p style={{ color: "var(--gris)", fontSize: 13, fontWeight: 300, margin: 0 }}>
          Armá la promoción, generá el funnel, y registrá lo que dio.
        </p>
      </div>

      <div style={{ borderBottom: "1px solid var(--borde)", marginBottom: 24 }}>
        <button className="pestana" data-on={vista === "nuevo" ? "1" : "0"} onClick={() => setVista("nuevo")}>
          Nuevo funnel
        </button>
        <button className="pestana" data-on={vista === "historial" ? "1" : "0"} onClick={() => setVista("historial")}>
          Historial{historial.length ? ` (${historial.length})` : ""}
        </button>
      </div>

      {vista === "nuevo" && (
        <>
          <Formulario f={campos} set={set} eco={eco} alerta={alerta}
            onGenerar={onGenerar} cargando={cargando} />

          {cargando && (
            <div className="latiendo" style={{ textAlign: "center", color: "var(--gris)", fontSize: 12, marginTop: 14 }}>
              Escribiendo piezas, segmentación, flujo de ManyChat y guion de mesero
            </div>
          )}

          {error && (
            <div className="tarjeta" style={{ marginTop: 16, borderColor: "#7A3A3A" }}>
              <div style={{ fontSize: 13, marginBottom: 10 }}>{error}</div>
              <button className="boton-linea" onClick={onGenerar}>Reintentar</button>
            </div>
          )}

          {funnel && (
            <Resultado
              funnel={funnel} eco={eco} guardado={guardado}
              onCopiar={copiarTodo} onGuardar={onGuardar}
              meta={{
                semana: semanaISO(), sucursal, franja, codigo, utm,
                nombre: nombrePromo || funnel.nombre_sugerido,
                publico: publicoId === "custom" ? "Público personalizado" : publico.n,
                edad: `${edadMin}–${edadMax}`, temperatura: tempObj.n,
              }}
            />
          )}
        </>
      )}

      {vista === "historial" && (
        <Historial historial={historial} cargando={cargandoHist}
          onEditar={editarReg} onBorrar={borrarReg} onIrANuevo={() => setVista("nuevo")} />
      )}
    </div>
  );
}
