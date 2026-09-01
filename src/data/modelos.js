/**
 * Modelos disponibles para redactar el funnel, vía OpenRouter.
 *
 * El servidor valida contra esta misma lista. Es a propósito: la app no
 * tiene autenticación, así que el navegador no puede pedir un modelo
 * arbitrario y gastar cuota en algo carísimo.
 *
 * Para agregar uno: abrí su página en openrouter.ai y copiá el slug tal
 * cual sale en la URL (openrouter.ai/<slug>). No lo escribas de memoria:
 * si el slug no existe, OpenRouter responde 404 y la generación falla.
 */

export const MODELOS = [
  {
    id: "anthropic/claude-opus-4.6",
    n: "Claude Opus 4.6",
    desc: "El más fuerte para la voz de marca. Es el predeterminado.",
  },
  {
    id: "anthropic/claude-opus-4.5",
    n: "Claude Opus 4.5",
    desc: "La generación anterior. Alternativa si 4.6 anda saturado.",
  },
  {
    id: "deepseek/deepseek-v4-pro",
    n: "DeepSeek V4 Pro",
    desc: "Más barato. Razona antes de responder, así que es el más lento.",
  },
];

export const MODELO_POR_DEFECTO = "anthropic/claude-opus-4.6";

/** true si el slug está en la lista blanca. */
export function modeloPermitido(id) {
  return MODELOS.some((m) => m.id === id);
}
