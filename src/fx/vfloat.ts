// Imagen flotante de verticales: sigue al cursor con muelles, rota
// con la velocidad horizontal y hace crossfade entre las seis fotos.
import { Spring, clamp } from '../core/math';
import { clock } from '../core/clock';
import { finePointer, reducedMotion } from '../core/env';

export function initVFloat(): void {
  const list = document.querySelector<HTMLElement>('[data-vlist]');
  const float = document.querySelector<HTMLElement>('[data-vfloat]');
  if (!list || !float || !finePointer || reducedMotion) return;

  const imgs = new Map<string, HTMLImageElement>();
  float.querySelectorAll<HTMLImageElement>('img[data-vimg]').forEach((img) => {
    imgs.set(img.dataset['vimg'] ?? '', img);
  });

  const sx = new Spring(0, 110, 17);
  const sy = new Spring(0, 110, 17);
  let visible = false;
  let unsub: (() => void) | null = null;

  const targetFor = (e: PointerEvent): [number, number] => {
    const maxX = window.innerWidth - float.offsetWidth - 16;
    return [
      clamp(e.clientX + 28, 16, maxX),
      e.clientY - float.offsetHeight / 2,
    ];
  };

  const hide = (): void => {
    list.classList.remove('has-hover');
    float.classList.remove('is-visible');
    visible = false;
  };

  const ensure = (): void => {
    unsub ??= clock.add((dt) => {
      sx.update(dt);
      sy.update(dt);
      const rot = clamp(sx.velocity * 0.008, -7, 7);
      float.style.transform = `translate(${sx.value.toFixed(1)}px, ${sy.value.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      // Si la lista sale del viewport (scroll con rueda sin mover el
      // cursor), la figura se retira aunque no llegue pointerleave.
      if (visible) {
        const lr = list.getBoundingClientRect();
        if (lr.bottom < 0 || lr.top > window.innerHeight) hide();
      }
      if (!visible && sx.settled && sy.settled && unsub) {
        unsub();
        unsub = null;
      }
    });
  };

  list.addEventListener(
    'pointermove',
    (e) => {
      const [tx, ty] = targetFor(e);
      sx.target = tx;
      sy.target = ty;
    },
    { passive: true },
  );

  list.querySelectorAll<HTMLElement>('.vlist__item').forEach((item) => {
    item.addEventListener('pointerenter', (e) => {
      const key = item.dataset['vkey'] ?? '';
      imgs.forEach((img, k) => img.classList.toggle('is-active', k === key));
      list.classList.add('has-hover');
      float.classList.add('is-visible');
      if (!visible) {
        const [tx, ty] = targetFor(e);
        sx.snap(tx);
        sy.snap(ty);
      }
      visible = true;
      ensure();
    });
  });

  list.addEventListener('pointerleave', hide);
}