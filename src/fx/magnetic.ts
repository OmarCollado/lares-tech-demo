// Botones magnéticos: el elemento persigue al cursor con muelles y
// vuelve a su sitio al salir. Solo puntero fino y sin reduced motion.
// La suscripción al reloj se libera cuando el muelle se asienta.
import { Spring } from '../core/math';
import { clock } from '../core/clock';
import { finePointer, reducedMotion } from '../core/env';

export function initMagnetic(): void {
  if (!finePointer || reducedMotion) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const sx = new Spring(0, 140, 16);
    const sy = new Spring(0, 140, 16);
    let active = false;
    let unsub: (() => void) | null = null;

    const ensure = (): void => {
      unsub ??= clock.add((dt) => {
        sx.update(dt);
        sy.update(dt);
        el.style.setProperty('--mx', `${sx.value.toFixed(2)}px`);
        el.style.setProperty('--my', `${sy.value.toFixed(2)}px`);
        if (!active && sx.settled && sy.settled && unsub) {
          el.style.setProperty('--mx', '0px');
          el.style.setProperty('--my', '0px');
          unsub();
          unsub = null;
        }
      });
    };

    el.addEventListener('pointerenter', () => {
      active = true;
      ensure();
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      sx.target = (e.clientX - r.left - r.width / 2) * 0.32;
      sy.target = (e.clientY - r.top - r.height / 2) * 0.32;
    });
    el.addEventListener('pointerleave', () => {
      active = false;
      sx.target = 0;
      sy.target = 0;
      ensure();
    });
  });
}