// Manifiesto: cada palabra es un span cuya opacidad sigue de forma
// continua el progreso de scroll de la sección. Preserva los <em>
// (palabras en serif) reconstruyendo el árbol al trocear.
import { clock } from '../core/clock';
import { norm } from '../core/math';
import { reducedMotion } from '../core/env';

export function initManifesto(): void {
  const el = document.querySelector<HTMLElement>('[data-manifesto]');
  if (!el) return;

  const words: HTMLElement[] = [];

  const splitInto = (node: Node, host: Element): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = (node.textContent ?? '').split(/\s+/).filter(Boolean);
      parts.forEach((word) => {
        const span = document.createElement('span');
        span.className = 'w';
        span.textContent = word;
        host.appendChild(span);
        host.appendChild(document.createTextNode(' '));
        words.push(span);
      });
    } else if (node instanceof Element) {
      const clone = document.createElement(node.tagName.toLowerCase());
      host.appendChild(clone);
      Array.from(node.childNodes).forEach((child) => splitInto(child, clone));
    }
  };

  const original = Array.from(el.childNodes);
  el.textContent = '';
  original.forEach((n) => splitInto(n, el));

  if (reducedMotion) return; // el CSS deja todo visible

  const section = el.closest('section') ?? el;
  let progress = -1;
  clock.add(() => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    const p = norm(vh * 0.85 - r.top, 0, r.height * 0.9);
    if (Math.abs(p - progress) < 0.001) return;
    progress = p;
    const n = words.length;
    words.forEach((w, idx) => {
      const local = norm(p * (n + 3) - idx, 0, 2.5);
      w.style.opacity = String(0.12 + 0.88 * local);
    });
  });
}