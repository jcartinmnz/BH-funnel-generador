/**
 * Cliente del endpoint de generación.
 * La API key vive SOLO en api/generar.js (servidor). Nunca acá.
 */

async function pedir(tipo, datos, modelo) {
  const r = await fetch("/api/generar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, datos, modelo }),
  });

  if (!r.ok) {
    // El servidor manda el motivo real en el cuerpo. Sin esto, cualquier
    // fallo llega como "Error 502" y no hay forma de saber qué pasó.
    let detalle = "";
    try {
      const cuerpo = await r.json();
      detalle = cuerpo.detalle ? `${cuerpo.error}: ${cuerpo.detalle}` : cuerpo.error;
    } catch {
      detalle = r.status === 504 ? "el modelo tardó demasiado" : "";
    }
    throw new Error(detalle || `Error ${r.status}`);
  }

  return r.json();
}

/** Genera contenido y flujo en paralelo con el modelo elegido. */
export async function generarFunnel(datos, modelo) {
  const [contenido, flujo] = await Promise.all([
    pedir("contenido", datos, modelo),
    pedir("flujo", datos, modelo),
  ]);
  return { ...contenido, ...flujo };
}
