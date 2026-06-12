// HUD técnico: FPS con sparkline, frame time, scroll, sección activa,
// DPR y GPU. Se abre y cierra con la tecla D; mientras está cerrado no
// consume nada (su suscripción al reloj se libera).
import { clock } from '../core/clock';
import { scrollInfo } from '../fx/chrome';

export function initHud(getRenderer: () => string): void {
  const hud = document.createElement('aside');
  hud.className = 'hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = [
    '<p class="hud__title">Lares · HUD técnico</p>',
    '<div class="hud__row"><span>fps</span><b data-h="fps">·</b></div>',
    '<div class="hud__row"><span>frame</span><b data-h="ms">·</b></div>',
    '<div class="hud__row"><span>scroll</span><b data-h="scroll">·</b></div>',
    '<div class="hud__row"><span>velocidad</span><b data-h="vel">·</b></div>',
    '<div class="hud__row"><span>sección</span><b data-h="sec">·</b></div>',
    '<div class="hud__row"><span>dpr</span><b data-h="dpr">·</b></div>',
    '<div class="hud__row"><span>gpu</span><b data-h="gpu">·</b></div>',
    '<canvas width="232" height="36"></canvas>',
  ].join('');
  document.body.appendChild(hud);

  const q = (k: string): HTMLElement =>
    hud.querySelector(`[data-h="${k}"]`) as HTMLElement;
  const fpsEl = q('fps');
  const msEl = q('ms');
  const scrollEl = q('scroll');
  const velEl = q('vel');
  const secEl = q('sec');
  const dprEl = q('dpr');
  const gpuEl = q('gpu');
  const canvas = hud.querySelector('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  const samples: number[] = [];
  let open = false;
  let unsub: (() => void) | null = null;
  let acc = 0;

  const shorten = (s: string): string =>
    s.length > 26 ? `${s.slice(0, 25)}…` : s;

  const draw = (): void => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Línea de referencia: 16.7 ms (60 fps).
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    const y60 = canvas.height - (16.7 / 33.3) * (canvas.height - 4) - 2;
    ctx.beginPath();
    ctx.moveTo(0, y60);
    ctx.lineTo(canvas.width, y60);
    ctx.stroke();
    // Sparkline de frame time.
    ctx.strokeStyle = '#3D8AFF';
    ctx.beginPath();
    samples.forEach((ms, i) => {
      const x = (i / 79) * canvas.width;
      const y = canvas.height - Math.min(ms / 33.3, 1) * (canvas.height - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const tick = (dt: number): void => {
    samples.push(clock.frameMs);
    if (samples.length > 80) samples.shift();
    acc += dt;
    if (acc < 0.12) return; // texto a ~8 Hz; sparkline por frame
    acc = 0;
    fpsEl.textContent = clock.fps.toFixed(0);
    msEl.textContent = `${clock.frameMs.toFixed(2)} ms`;
    scrollEl.textContent = `${Math.round(scrollInfo.y)} px`;
    velEl.textContent = `${Math.round(scrollInfo.velocity)} px/s`;
    secEl.textContent = scrollInfo.section;
    dprEl.textContent = String(window.devicePixelRatio);
    gpuEl.textContent = shorten(getRenderer());
    draw();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return;
    open = !open;
    hud.classList.toggle('is-open', open);
    if (open && !unsub) unsub = clock.add(tick);
    if (!open && unsub) {
      unsub();
      unsub = null;
    }
  });
}