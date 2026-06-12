// Contadores: animan de 0 a su valor con easeOutExpo al entrar en
// viewport. El HTML ya trae el valor final, así que sin JS (o con
// reduced motion) no hay hueco ni parpadeo.
import { clock } from '../core/clock';
import { easeOutExpo } from '../core/math';
import { reducedMotion } from '../core/env';

export function initCounters(): void {
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll<HTMLElement>('.num[data-count]');

  const animate = (el: HTMLElement): void => {
    const target = Number(el.dataset['count'] ?? '0');
    const prefix = el.dataset['prefix'] ?? '';
    const suffix = el.dataset['suffix'] ?? '';
    const dur = 1.6;
    let t = 0;
    const unsub = clock.add((dt) => {
      t += dt;
      const p = easeOutExpo(Math.min(t / dur, 1));
      el.textContent = `${prefix}${Math.round(target * p)}${suffix}`;
      if (t >= dur) {
        el.textContent = `${prefix}${target}${suffix}`;
        unsub();
      }
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        animate(e.target as HTMLElement);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}