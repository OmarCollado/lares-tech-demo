// Posición de puntero suavizada con muelles. Mientras el usuario no
// haya movido el ratón (o en pantallas táctiles) el objetivo orbita
// despacio sobre la zona en la que vive el isotipo, para que el shader
// tenga vida propia sin interacción.
import { Spring } from './math';
import { clock } from './clock';

class PointerTracker {
  readonly sx = new Spring(0, 60, 14);
  readonly sy = new Spring(0, 60, 14);
  private interacted = false;

  init(): void {
    const cx = window.innerWidth * 0.66;
    const cy = window.innerHeight * 0.42;
    this.sx.snap(cx);
    this.sy.snap(cy);

    window.addEventListener(
      'pointermove',
      (e) => {
        this.interacted = true;
        this.sx.target = e.clientX;
        this.sy.target = e.clientY;
      },
      { passive: true },
    );

    clock.add((dt, t) => {
      if (!this.interacted) {
        this.sx.target = cx + Math.cos(t * 0.4) * window.innerWidth * 0.08;
        this.sy.target = cy + Math.sin(t * 0.31) * window.innerHeight * 0.08;
      }
      this.sx.update(dt);
      this.sy.update(dt);
    });
  }

  get x(): number {
    return this.sx.value;
  }

  get y(): number {
    return this.sy.value;
  }
}

export const pointer = new PointerTracker();