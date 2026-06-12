// Header, barra de progreso global y sección activa. El objeto
// scrollInfo lo consume también el HUD.
import { clock } from '../core/clock';
import { reducedMotion } from '../core/env';

export const scrollInfo = { y: 0, velocity: 0, section: 'top' };

export function initChrome(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  const sections = document.querySelectorAll<HTMLElement>('main section[id]');

  let lastY = window.scrollY;

  const apply = (): void => {
    const y = window.scrollY;
    scrollInfo.y = y;
    header?.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };

  if (reducedMotion) {
    window.addEventListener('scroll', apply, { passive: true });
    apply();
  } else {
    clock.add((dt) => {
      const y = window.scrollY;
      scrollInfo.velocity =
        scrollInfo.velocity * 0.85 + ((y - lastY) / Math.max(dt, 1e-3)) * 0.15;
      lastY = y;
      apply();
    });
  }

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) scrollInfo.section = e.target.id || '?';
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }
}