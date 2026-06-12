# Lares · Demo técnica

La web corporativa de [Lares Gestión y Consultoría](https://laresgestion.com) reconstruida como demostración de ingeniería front-end. Sin frameworks, sin librerías de animación, sin three.js: **todo el runtime está escrito a mano en TypeScript estricto**.

> Pulsa **D** en la página para abrir el HUD técnico (FPS, frame time, scroll, sección activa, GPU).

## Qué demuestra

| Sistema | Implementación |
|---|---|
| **Render** | WebGL2 con un único fragment shader: nebulosa por *domain warping* (fbm, 6 octavas, técnica de Iñigo Quilez) y el isotipo de Lares reconstruido como **mosaico de diamantes que muestrea su propia textura PNG celda a celda**. Cada celda aparece según un umbral aleatorio (ensamblado al cargar), brilla cerca del puntero y se disuelve con el scroll. |
| **Movimiento** | Muelles amortiguados (integración semi-implícita con amortiguación exponencial) y **un único reloj `requestAnimationFrame`** al que se suscriben todos los subsistemas. Las suscripciones se liberan cuando el muelle se asienta o el elemento sale de viewport. |
| **Scroll** | Coreografía por IntersectionObserver + mapeo continuo de progreso: manifiesto con revelado palabra a palabra, timeline sticky con número grande y rail, contadores con easing exponencial, barra de progreso global y desvanecido del hero. |
| **Tipografía** | División de texto propia (sin SplitText): revelado escalonado por palabra en el hero, preservando los `<em>` serif en el manifiesto. |
| **HUD** | Panel de diagnóstico en vivo (tecla `D`): FPS, frame time con sparkline en canvas 2D, velocidad de scroll, sección activa, DPR y renderer GPU. Cerrado no consume nada. |
| **Accesibilidad** | `prefers-reduced-motion` apaga todos los bucles y muestra el estado final (el shader pinta un solo frame estático). HTML semántico, foco visible, contraste AA, contenido íntegro sin JavaScript. |

## Presupuesto de producción

- **JavaScript: 19,9 kB (7,8 kB gzip)** · un solo chunk
- CSS: 27,8 kB (5,6 kB gzip)
- **0 dependencias JavaScript en runtime** (los únicos paquetes son las fuentes autohospedadas de `@fontsource`)

## Stack

- [Vite 7](https://vite.dev) · build y dev server; los shaders GLSL entran por `?raw`
- TypeScript 5 en modo estricto (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, …)
- Inter + Instrument Serif autohospedadas (identidad tipográfica de la marca)

## Desarrollo

```bash
npm install
npm run dev        # localhost:5173
npm run build      # tsc --noEmit + vite build → dist/
```

## Arquitectura

```
src/
├── core/          # clock (reloj único rAF), math (Spring, easings), pointer, env
├── gl/            # renderer WebGL2 + shaders GLSL (quad.vert, nebula.frag)
├── fx/            # reveal, split-text, manifesto, counters, magnetic, vfloat, process, chrome
├── hud/           # HUD técnico (tecla D)
└── main.ts        # orquestador
```

## Origen

El contenido, la paleta (azul `#1B6BFF` + oscuro `#0a0a14`), la tipografía y el isotipo provienen de la web de producción ([`OmarCollado/lares-web`](https://github.com/OmarCollado/lares-web), Astro + Tailwind). Esta demo conserva la identidad y eleva la ejecución técnica.
