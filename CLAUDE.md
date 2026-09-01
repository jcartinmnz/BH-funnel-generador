# Generador de Funnels — Bread House Bistró & Café

Herramienta interna de mercadeo. El usuario define una promoción (artículos,
precio, público) y la app genera el funnel completo listo para ejecutar:
piezas de contenido, copy de pauta, flujo de ManyChat, guion de mesero,
trazabilidad y proyección de ROI. Además guarda el historial para medir
el retorno real semana a semana.

## Contexto obligatorio antes de editar

Leé estos archivos antes de tocar código relacionado. No inventes datos de
marca, menú ni estrategia: están documentados.

- `docs/marca.md` — voz, colores, tipografía, tono. **La voz es la parte más fácil de romper.**
- `docs/menu-2026.md` — precios y márgenes reales (Miller-Kasavana 2026)
- `docs/publicos.md` — los perfiles de clienta y las franjas
- `docs/estrategia-funnels.md` — la lógica del embudo y la medición

## Arquitectura

```
src/
  App.jsx                  orquestador: estado + navegación entre vistas
  data/catalogo.js         menú 2026 (precio, margen, clasificación)
  data/publicos.js         públicos, franjas, objetivos, sucursales
  lib/economia.js          TODA la matemática. Determinista, sin IA.
  lib/api.js               llamadas al endpoint /api/generar
  lib/storage.js           persistencia del historial
  components/              UI dividida por sección
api/
  generar.js               función serverless: habla con la API de Anthropic
```

## Reglas del proyecto

1. **La matemática nunca la hace el modelo.** Todo cálculo de margen, food
   cost, break-even y ROI vive en `lib/economia.js` y se prueba con números.
   El modelo solo escribe texto creativo. Si te piden "que la IA calcule el
   ROI", esa es la respuesta incorrecta.

2. **La API key jamás toca el navegador.** Solo se lee en `api/generar.js`
   vía `process.env.ANTHROPIC_API_KEY`. Si aparece en `src/`, es un bug de
   seguridad.

3. **Márgenes reales, no inventados.** Los valores de `catalogo.js` vienen de
   la ingeniería de menú 2026. Para agregar productos, sacá los datos de la
   hoja real, no los estimes.

4. **Voz costarricense, no neutra.** Se habla de vos ("armá el plan", "traé a
   tus chicas"). Nunca corporativo. Nunca "restaurante que grita promociones".
   Máximo un emoji temático por pieza.

5. **Sin benchmarks inventados.** No pongas tasas de conversión "esperadas"
   como si fueran datos. Las primeras campañas son la línea base.

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
```

Para desarrollo local necesitás `.env` con `ANTHROPIC_API_KEY`. Copiá
`.env.example`. La función de `api/` corre en Vercel; en local usá
`vercel dev` si querés probar la generación de punta a punta.

## Estado actual y pendientes conocidos

- El historial usa `localStorage`: es **por navegador**, no compartido entre
  el equipo. Para historial común hay que mover `lib/storage.js` a Vercel KV
  o Supabase. La interfaz ya está aislada para que sea un cambio de un archivo.
- No hay autenticación. Cualquiera con el link puede generar (y gastar cuota).
- La atribución termina en el código de redención: si caja no lo registra,
  el ROI real queda vacío. Es una limitación operativa, no técnica.
