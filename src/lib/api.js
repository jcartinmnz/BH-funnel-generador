/**
 * Cliente del endpoint de generación.
 * La API key vive SOLO en api/generar.js (servidor). Nunca acá.
 */

async function pedir(tipo, datos) {
  const r = await fetch("/api/generar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tipo, datos }),
  });
  if (!r.ok) throw new Error(`Error ${r.status}`);
  return r.json();
}

/** Genera contenido y flujo en paralelo. */
export async function generarFunnel(datos) {
  const [contenido, flujo] = await Promise.all([
    pedir("contenido", datos),
    pedir("flujo", datos),
  ]);
  return { ...contenido, ...flujo };
}
