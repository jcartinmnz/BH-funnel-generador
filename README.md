# Generador de Funnels — Bread House

Herramienta interna de mercadeo. Definís una promoción (artículos, precio,
público) y sale el funnel completo listo para ejecutar: piezas de contenido,
copy de pauta, flujo de ManyChat, guion de mesero, trazabilidad hasta caja y
proyección de ROI. Guarda el historial para medir el retorno real.

---

## Subirlo a GitHub

```bash
cd bh-generador-funnels
git init
git add .
git commit -m "Generador de funnels BH"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bh-generador-funnels.git
git push -u origin main
```

Creá el repo vacío en github.com/new antes del push. **Ponelo privado**: tiene
márgenes y costos reales del menú.

---

## Correrlo local

```bash
npm install
cp .env.example .env      # pegá tu OPENROUTER_API_KEY
npm run dev               # http://localhost:5173
```

Para probar la generación de punta a punta necesitás las funciones serverless:

```bash
npm i -g vercel
vercel dev
```

---

## Publicarlo en Vercel

1. vercel.com → Add New → Project → importá el repo
2. Framework: **Vite** (lo detecta solo)
3. Settings → Environment Variables → agregá `OPENROUTER_API_KEY`
4. Deploy

Para restringirlo al equipo: Settings → Deployment Protection → Password
Protection, o Vercel Authentication si todos tienen cuenta.

---

## Editarlo con Claude Code

```bash
cd bh-generador-funnels
claude
```

`CLAUDE.md` se carga solo y trae las reglas del proyecto. La carpeta `docs/`
tiene el contexto de negocio; pedile que lea el que corresponda:

```
Leé docs/menu-2026.md y agregá los productos de la línea BH Fit al catálogo
```

```
Leé docs/estrategia-funnels.md y agregá un cuarto objetivo de funnel para
recuperación de clientas que no vuelven hace 60 días
```

```
Mové lib/storage.js a Vercel KV para que el historial sea compartido
entre todo el equipo
```

---

## Estructura

```
CLAUDE.md              reglas del proyecto — Claude Code lo lee solo
docs/                  contexto de negocio
  marca.md               voz, colores, tipografía
  menu-2026.md           ingeniería de menú y clasificación
  publicos.md            perfiles de clienta y franjas
  estrategia-funnels.md  lógica del embudo y medición
api/generar.js         serverless — único lugar con la API key
src/
  App.jsx              estado y navegación
  data/                catálogo y públicos
  lib/economia.js      toda la matemática (sin IA)
  lib/storage.js       persistencia del historial
  lib/api.js           cliente del endpoint
  components/          Formulario · Resultado · Historial
```

---

## Cosas que hay que saber

**La matemática no la hace el modelo.** Márgenes, food cost, break-even y ROI
salen de `lib/economia.js`. El modelo solo escribe texto.

**El historial es por navegador.** `localStorage` guarda local: cada quien ve
el suyo. Para historial compartido hay que mover `lib/storage.js` a Vercel KV
o Supabase — la interfaz ya está aislada para que sea un solo archivo.

**No hay autenticación.** Cualquiera con el link genera y consume cuota. Usá
la protección de Vercel.

**La atribución depende de caja.** Si el mesero no registra el código de
redención, el ROI real queda vacío. Es el eslabón frágil del sistema y es
operativo, no técnico.
