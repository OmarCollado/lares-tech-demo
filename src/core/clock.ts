// Reloj único de la demo: todos los subsistemas animados se suscriben
// aquí. Un solo requestAnimationFrame por página; el bucle se detiene
// solo cuando no queda ningún suscriptor o la pestaña pasa a segundo
// plano, y dt llega acotado para que no haya saltos de física al volver.

type Tick = (dt: number, elapsed: number) => void;

class Clock {
  private subs = new Set<Tick>();
  private raf: number | null = null;
  private last = 0;
  private elapsed = 0;

  // Métricas expuestas para el HUD.
  fps = 0;
  frameMs = 0;

  constructor() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.start();
    });
  }

  add(fn: Tick): () => void {
    this.subs.add(fn);
    this.start();
    return () => {
      this.subs.delete(fn);
      if (this.subs.size === 0) this.stop();
    };
  }

  private start(): void {
    if (this.raf !== null || this.subs.size === 0 || document.hidden) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private stop(): void {
    if (this.raf !== null) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }
  }

  private loop = (now: number): void => {
    const rawMs = now - this.last;
    this.last = now;
    // dt acotado a 50 ms: un frame perdido no dispara la física.
    const dt = Math.min(rawMs, 50) / 1000;
    this.elapsed += dt;
    // Media móvil exponencial para que el HUD no parpadee.
    this.frameMs = this.frameMs === 0 ? rawMs : this.frameMs * 0.9 + rawMs * 0.1;
    this.fps = 1000 / Math.max(this.frameMs, 0.001);
    for (const fn of this.subs) fn(dt, this.elapsed);
    this.raf = this.subs.size > 0 ? requestAnimationFrame(this.loop) : null;
  };
}

export const clock = new Clock();