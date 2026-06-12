# DESIGN.md · Lares demo técnica

## Color
- Marca (hex canónico, no tocar): `--blue #1B6BFF` · `--blue-dark #0F4FCF` · `--blue-bright #3D8AFF`.
- Superficie: drench oscuro `#0a0a14` / `#101019`; neutros nuevos en OKLCH tintados hacia el azul (nunca #000/#fff puros).
- Banda clara única (sección Datos): `--paper oklch(0.975 0.004 268)` con tinta `#0a0a14`.
- CTA final: drench azul pleno (`--blue`) con tinta oscura y título blanco.

## Tipografía
- `--sans` Inter (400-800): estructura, títulos en 700/800 con tracking -0.03em.
- `--serif` Instrument Serif (400 + italic): contrapunto editorial en `em` de títulos, numerales gigantes y línea final del hero. Herencia de marca, no elección nueva.
- `--mono` stack de sistema: solo HUD, índices y bloque de código (contenido técnico real).
- Escala fluida con clamp(); hero hasta 6.6rem, títulos de sección hasta 3.9rem.

## Espaciado y layout
- `--sp-section: clamp(6.5rem, 4rem + 12vh, 12rem)`; wrap 1240px.
- Listas con hairlines (`--dark-border`, `--line-light`) en lugar de cards.
- Casos en filas editoriales alternadas 5fr/6fr; proceso con columna sticky 5fr/7fr.

## Motion
- Easing único: `cubic-bezier(0.16, 1, 0.3, 1)` (`--ease-out`).
- Muelles para todo lo que sigue al puntero; transitions CSS para reveals.
- Nada anima propiedades de layout; solo transform y opacity.
- `prefers-reduced-motion: reduce` desactiva todo y muestra el estado final.

## Radii y misc
- `--r-md 14px` (imagen flotante) · `--r-lg 24px` (código, media) · `--r-pill` (botones).
- Selección de texto: fondo azul de marca.
