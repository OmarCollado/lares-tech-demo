// Revelado por scroll: añade .is-in una sola vez por elemento.
import { reducedMotion } from '../core/env';

export function initReveals(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        const delay = el.dataset['revealDelay'];
        if (delay) el.style.setProperty('--rd', `${delay}ms`);
        el.classList.add('is-in');
        io.unobserve(el);
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -40px 0px' },
  );
  els.forEach((el) => io.observe(el));
}