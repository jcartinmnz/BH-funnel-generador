/** Perfiles, objetivos y contexto operativo. Ver docs/publicos.md */

export const OBJETIVOS = [
  { id: "reserva", label: "Reservas creadas", desc: "Cierra en la plataforma de reservas" },
  { id: "promo", label: "Promoción activada", desc: "Comenta o escribe para desbloquear" },
  { id: "franja", label: "Llenar una franja", desc: "Demanda dirigida a un horario" },
];

export const PUBLICOS = [
  {
    id: "productiva", n: "La productiva", franja: "Brunch 7–12",
    desc: "Trabaja o estudia con buen café. Busca sentirse en control de su día.",
    intereses: "Coworking, café de especialidad, productividad, brunch",
  },
  {
    id: "social", n: "La social ligera", franja: "Tardeada 3–6pm",
    desc: "Café, postre y conversación sin prisa con amigas o mamá.",
    intereses: "Cafeterías, postres, planes con amigas, repostería",
  },
  {
    id: "protagonista", n: "La protagonista", franja: "Social 6–8pm",
    desc: "Quiere una experiencia que valga el outfit: plato fotogénico, ambiente y drinks.",
    intereses: "Restaurantes, coctelería, moda, vida nocturna",
  },
  {
    id: "fit", n: "Territorio BH Fit", franja: "Brunch 7–12",
    desc: "Entrena en la mañana y quiere comer rico sin salirse del plan.",
    intereses: "Gimnasios, fitness, nutrición, proteína, wellness",
  },
  {
    id: "pet", n: "Perrihijos", franja: "Tardeada 3–6pm",
    desc: "Busca lugares donde su perro sea bienvenido de verdad.",
    intereses: "Mascotas, pet friendly, veterinarias, adopción",
  },
  { id: "custom", n: "Personalizado", franja: "Social 6–8pm", desc: "", intereses: "" },
];

export const TEMPERATURAS = [
  { id: "frio", n: "Frío", desc: "No nos conoce · público nuevo" },
  { id: "tibio", n: "Tibio", desc: "Ya interactuó · retargeting" },
  { id: "caliente", n: "Caliente", desc: "Seguidora o ya vino · reactivación" },
];

export const FRANJAS = ["Brunch 7–12", "Fast Lunch", "Tardeada 3–6pm", "Social 6–8pm"];
export const SUCURSALES = ["Escazú", "Pinares / Curridabat", "Cartago", "Mall San Pedro"];
