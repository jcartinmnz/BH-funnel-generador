# Estrategia de funnels

## Los dos motores

### 1. Clientes Adquiridos (push)
Buscamos activamente a quien no nos conoce y generamos la visita. Se ejecuta
con funnels pagados, medidos por ROI. **Esto es lo que genera la app.**

Tres objetivos:
- **Reservas creadas** — cierra en la plataforma de reservas
- **Promoción activada** — la clienta comenta o escribe para desbloquear
- **Llenar una franja** — demanda dirigida a un horario débil

### 2. Clientes Intencionales (pull)
Quien ya nos busca y hay que ganarle la comparación: perfil de Instagram como
landing, fichas de Google Business, UGC y fotografía de producto. No lleva
pauta directa. Fuera del alcance de esta herramienta.

## Estructura del funnel

```
VIRAL           la encuentra      alcance a no-seguidoras
   ↓
EXPERIENCIAL    la convence       se proyecta viviendo el momento
   ↓
CONFIANZA       la cierra         elimina la duda final
   ↓
MANYCHAT        captura           keyword / reacción a historia / DM
   ↓
CIERRE          convierte         reserva, código o franja
```

## Medición

```
ROI = (margen bruto real − inversión) ÷ inversión
inversión = pauta + costo de contenido
```

Se mide sobre **margen bruto, no sobre venta**. Una promoción que vende mucho
con margen negativo destruye valor aunque el ingreso se vea bien.

### La cadena de atribución
Meta atribuye hasta "conversación iniciada" y ahí se corta. Para llegar al
ticket real hacen falta tres capturas:

1. **UTM** en el link de reserva — mide reservas por campaña
2. **Código de redención** único por funnel (ej. `BIRRIA34`) — lo registra caja
3. **Custom Field en ManyChat** — identifica de qué funnel vino la conversación

**El eslabón frágil es caja.** Si el mesero no registra el código, el ROI real
queda vacío y el sistema queda ciego después de la conversación.

### Métricas que importan
- **Costo por conversión** — cuánto cuesta traer una clienta. Se compara contra
  el margen que deja: si cuesta ₡3.000 y deja ₡5.858, se escala.
- **Tasa de cierre** — de cada 100 que escriben, cuántas llegan.
- **Punto de equilibrio** — cuántas promos hay que vender para no perder.

## Sobre benchmarks
No hay tasas de conversión esperadas. Las primeras campañas **son** la línea
base. No inventes números de referencia en la interfaz ni en los prompts.

## Presupuesto operativo
Pauta semanal modesta con varios funnels. Con montos bajos por funnel los
resultados son ruidosos: conviene concentrar el presupuesto en un funnel por
semana hasta tener línea base, y recién ahí correr varios en paralelo.

## Herramientas
ManyChat Premium (automatización IG/Messenger, Custom Fields) · Pani (gestión
de reservas por WhatsApp) · plataforma de reservas · Meta Ads.
