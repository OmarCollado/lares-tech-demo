// Timeline de proceso: el número grande, el rail de progreso y el
// estado activo leen la posición de los hitos respecto al viewport.
import { clock } from '../core/clock';
import { norm } from '../core/math';
import { reducedMotion } from '../core/env';

export function initProcess(): void {
  const list = document.querySelector<HTMLElement>('[data-proceso-list]');
  const numEl = document.querySelector<HTMLElement>('[data-proceso-num]');
  const rail = document.querySelector<HTMLElement>('[data-proceso-rail]');
  if (!list || !numEl || !rail) return;
  const items = Array.from(list.querySelectorAll<HTMLElement>('.hito'));
  if (items.length === 0) return;

  if (reducedMotion) {
    items.forEach((el) => el.classList.add('is-active'));
    return;
  }

  let current = -1;
  clock.add(() => {
    const vh = window.innerHeight;
    const lr = list.getBoundingClientRect();
    if (lr.bottom < -200 || lr.top > vh + 200) return;

    // Rail: progreso de la lista completa a su paso por el viewport.
    rail.style.transform = `scaleY(${norm(vh * 0.7 - lr.top, 0, lr.height)})`;

    // Hito activo: el más cercano al 45% de la altura de la ventana.
    let best = 0;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.45);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });

    if (best !== current) {
      current = best;
      items.forEach((el, i) => el.classList.toggle('is-active', i === best));
      numEl.classList.add('is-swapping');
      window.setTimeout(() => {
        numEl.textContent = `0${best + 1}`;
        numEl.classList.remove('is-swapping');
      }, 160);
    }
  });
}