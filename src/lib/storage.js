/**
 * Persistencia del historial.
 *
 * HOY: localStorage — es POR NAVEGADOR, no compartido entre el equipo.
 * Para historial común, reemplazá el cuerpo de estas tres funciones por
 * llamadas a Vercel KV o Supabase. La interfaz no cambia: solo este archivo.
 */

const KEY = "bh:historial-funnels";

export async function leerHistorial() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function guardarHistorial(lista) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lista));
    return true;
  } catch {
    return false;
  }
}

export async function limpiarHistorial() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
