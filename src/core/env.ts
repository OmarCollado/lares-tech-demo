// Capacidades de entorno. prefers-reduced-motion se respeta por defecto,
// pero el usuario puede forzar el movimiento desde el toggle de la
// página (persistido en localStorage): muchos Windows llevan los
// efectos de animación apagados sin que sea una preferencia consciente.
const stored = ((): string | null => {
  try {
    return localStorage.getItem('lares-motion');
  } catch {
    return null;
  }
})();

export const prefersReduce: boolean =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const motionForced: boolean = prefersReduce && stored === 'on';

export const reducedMotion: boolean = prefersReduce && !motionForced;

export const finePointer: boolean =
  window.matchMedia('(pointer: fine)').matches;