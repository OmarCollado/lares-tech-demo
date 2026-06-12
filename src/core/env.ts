// Capacidades de entorno, evaluadas una sola vez al arrancar.
export const reducedMotion: boolean =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer: boolean =
  window.matchMedia('(pointer: fine)').matches;