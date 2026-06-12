// Utilidades matemáticas de la demo. Sin dependencias.

export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// Progreso 0..1 de v entre a y b, con clamp en ambos extremos.
export const norm = (v: number, a: number, b: number): number =>
  clamp((v - a) / (b - a), 0, 1);

export const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

export const easeOutExpo = (t: number): number =>
  t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

// Muelle amortiguado: integración semi-implícita con amortiguación
// exponencial, estable frente a dt variable (el reloj ya acota dt).
export class Spring {
  velocity = 0;
  target: number;

  constructor(
    public value = 0,
    private stiffness = 170,
    private damping = 26,
  ) {
    this.target = value;
  }

  update(dt: number): number {
    const force = -this.stiffness * (this.value - this.target);
    this.velocity = (this.velocity + force * dt) * Math.exp(-this.damping * dt);
    this.value += this.velocity * dt;
    return this.value;
  }

  snap(v: number): void {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  get settled(): boolean {
    return (
      Math.abs(this.value - this.target) < 0.01 && Math.abs(this.velocity) < 0.01
    );
  }
}