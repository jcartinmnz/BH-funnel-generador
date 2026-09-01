/**
 * Función serverless (Vercel). Único lugar donde vive la API key.
 * POST /api/generar  { tipo: "contenido" | "flujo", datos: {...} }
 */

const VOZ = `
MARCA — Bread House Bistró & Café (Costa Rica). Posicionamiento "chic accesible".
Voz: vos costarricense natural ("armá el plan", "traé a tus chicas"), frases cortas,
cero corporativo, nunca "restaurante que grita promociones". Máximo un emoji temático.
Insight: ella no compra comida, compra escenarios para su vida y su feed.
`;

function contexto(d) {
  return `${VOZ}
FUNNEL A GENERAR:
- Nombre de la promoción: ${d.nombre || "(sin nombre — proponé uno)"}
- Objetivo: ${d.objetivoLabel}
- Artículos: ${d.articulos}
- Precio carta ${d.precioCarta} · Precio promo ${d.precioPromo} · Ahorro ${d.ahorro} (${d.ahorroPct}%)
- Público: ${d.publico}
- Temperatura: ${d.temperatura}
- Edad ${d.edadMin}–${d.edadMax} · Intereses: ${d.intereses}
- Franja: ${d.franja} · Sucursal: ${d.sucursal} · Código: ${d.codigo}
`;
}

const PROMPTS = {
  contenido: (d) => `${contexto(d)}
Generá las 3 piezas del funnel (viral → experiencial → convencimiento) habladas a ESE público.
Respondé SOLO JSON válido, sin markdown ni backticks:
{"nombre_sugerido":"","diagnostico":"2 frases",
"viral":{"concepto":"","formato":"","guion":"","texto_pantalla":"","cta":""},
"experiencial":{"concepto":"","formato":"","guion":"","texto_pantalla":"","cta":""},
"confianza":{"concepto":"","formato":"","guion":"","texto_pantalla":"","cta":""},
"copy_pauta":{"primario":"máx 100 car","descripcion":"máx 80 car","boton":""},
"segmentacion":{"intereses":["3 a 5"],"exclusiones":["a quién excluir"],"nota":"1 frase"}}`,

  flujo: (d) => `${contexto(d)}
Generá el flujo de ManyChat y el plan de ejecución. El objetivo define el cierre:
reserva = link a plataforma; promo = código de redención; franja = oferta con ventana de validez.
Respondé SOLO JSON válido, sin markdown ni backticks:
{"trigger":{"tipo":"","palabra_clave":"UNA palabra mayúsculas","story_cta":""},
"mensajes":[{"paso":1,"texto":"","botones":[""]}],
"recuperacion":{"cuando":"","texto":""},
"custom_fields":[""],"mesero":"","checklist":[""]}
Máximo 4 mensajes y 5 pasos. Tono de amiga, no de bot.`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST" });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Falta ANTHROPIC_API_KEY en el entorno" });
  }

  const { tipo, datos } = req.body || {};
  const armar = PROMPTS[tipo];
  if (!armar) {
    return res.status(400).json({ error: "tipo debe ser 'contenido' o 'flujo'" });
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    };

    // Las API keys ligadas a identidad exigen declarar en que workspace
    // actua el request. Una key normal no lo necesita y el header se omite.
    const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
    if (workspace) headers["anthropic-workspace-id"] = workspace;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: armar(datos) }],
      }),
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error(`Anthropic respondio ${r.status}: ${detalle}`);
      return res.status(502).json({ error: "Error de la API de Anthropic", detalle });
    }

    const data = await r.json();
    const texto = data.content
      .map((i) => (i.type === "text" ? i.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    return res.status(200).json(JSON.parse(texto));
  } catch (e) {
    console.error("Fallo en /api/generar:", e);
    return res.status(500).json({ error: "No se pudo generar", detalle: String(e) });
  }
}
