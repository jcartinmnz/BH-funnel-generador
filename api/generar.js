/**
 * Función serverless (Vercel). Único lugar donde vive la API key.
 * POST /api/generar  { tipo: "contenido" | "flujo", datos: {...} }
 *
 * Usa DeepSeek V4, que expone una API compatible con OpenAI.
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

// v4-pro razona antes de responder y es el mas lento. Si las generaciones
// se pasan del limite de tiempo de la funcion, poner DEEPSEEK_MODEL en
// deepseek-v4-flash desde Vercel: no requiere tocar codigo.
const MODELO = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

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

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Falta DEEPSEEK_API_KEY en el entorno" });
  }

  const { tipo, datos } = req.body || {};
  const armar = PROMPTS[tipo];
  if (!armar) {
    return res.status(400).json({ error: "tipo debe ser 'contenido' o 'flujo'" });
  }

  try {
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODELO,
        // v4-pro razona antes de responder y ese razonamiento consume tokens
        // del mismo presupuesto, asi que el techo va holgado para que el JSON
        // no salga cortado a la mitad.
        max_tokens: 4000,
        messages: [{ role: "user", content: armar(datos) }],
      }),
    });

    if (!r.ok) {
      const detalle = await r.text();
      console.error(`DeepSeek respondio ${r.status}: ${detalle}`);
      return res.status(502).json({ error: "Error de la API de DeepSeek", detalle });
    }

    const data = await r.json();

    // Formato OpenAI. En los modelos que razonan el texto util viene en
    // content; reasoning_content trae el razonamiento y no nos interesa.
    const texto = (data.choices?.[0]?.message?.content || "")
      .replace(/```json|```/g, "")
      .trim();

    if (!texto) {
      console.error("DeepSeek no devolvio contenido:", JSON.stringify(data));
      return res.status(502).json({ error: "DeepSeek no devolvió contenido" });
    }

    return res.status(200).json(JSON.parse(texto));
  } catch (e) {
    console.error("Fallo en /api/generar:", e);
    return res.status(500).json({ error: "No se pudo generar", detalle: String(e) });
  }
}
