// División de texto a mano: cada .hero__line se trocea en palabras
// <span class="w"> con índice incremental --i; el CSS escalona el
// revelado a partir de ese índice.
export function splitHeroTitle(hero: HTMLElement): void {
  const lines = hero.querySelectorAll<HTMLElement>('.hero__line');
  let i = 0;
  lines.forEach((line) => {
    const words = (line.textContent ?? '').trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, j) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.style.setProperty('--i', String(i));
      span.textContent = word;
      i += 1;
      line.appendChild(span);
      if (j < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });
  // Doble rAF para que el estado inicial quede pintado antes de la
  // transición, con fallback por temporizador: en pestañas en segundo
  // plano rAF no dispara y el título debe quedar visible igualmente.
  const ready = (): void => hero.classList.add('is-ready');
  requestAnimationFrame(() => {
    requestAnimationFrame(ready);
  });
  window.setTimeout(ready, 400);
}