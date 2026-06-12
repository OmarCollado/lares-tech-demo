// Renderer WebGL2 para el hero: un quad a pantalla completa y un único
// fragment shader (nebulosa + isotipo en mosaico). Gestiona textura,
// DPR acotado, gating por IntersectionObserver y prefers-reduced-motion
// (un solo frame estático, sin bucle).
import vertSrc from './shaders/quad.vert.glsl?raw';
import fragSrc from './shaders/nebula.frag.glsl?raw';
import { clock } from '../core/clock';
import { pointer } from '../core/pointer';
import { easeOutQuint, norm } from '../core/math';
import { reducedMotion } from '../core/env';

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  src: string,
): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('[nebula] shader:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export class Nebula {
  rendererInfo = 'sin WebGL2';

  private gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private assemble = 0;
  private assembleT = 0;
  private texReady = false;
  private unsub: (() => void) | null = null;

  constructor(
    private canvas: HTMLCanvasElement,
    private hero: HTMLElement,
  ) {}

  init(): boolean {
    const gl = this.canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return false;
    this.gl = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return false;

    const prog = gl.createProgram();
    if (!prog) return false;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('[nebula] link:', gl.getProgramInfoLog(prog));
      return false;
    }
    this.program = prog;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    for (const name of [
      'uRes', 'uTime', 'uPointer', 'uAssemble', 'uFade', 'uLogoPos', 'uLogoBox', 'uLogo',
    ]) {
      this.u[name] = gl.getUniformLocation(prog, name);
    }

    this.rendererInfo = String(gl.getParameter(gl.RENDERER));

    this.loadTexture();
    this.observe();
    return true;
  }

  // Textura: placeholder blanco 1x1 (máscara vacía) hasta que cargue el
  // isotipo real; con flip Y para que la coordenada de muestreo (y hacia
  // arriba) coincida con la orientación de la imagen.
  private loadTexture(): void {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this.texReady = true;
      // Frame inmediato con la textura ya disponible: si la pestaña está
      // en segundo plano (el reloj no corre), el isotipo aparece igualmente.
      if (reducedMotion || document.hidden || !this.unsub) this.renderStatic();
    };
    img.src = `${import.meta.env.BASE_URL}isotipo-lares.png`;
  }

  // Con reduced motion: frame único estático (re-renderizado en resize).
  // En el caso normal el bucle solo corre con el canvas cerca de viewport.
  private observe(): void {
    if (reducedMotion) {
      this.renderStatic();
      new ResizeObserver(() => this.renderStatic()).observe(this.canvas);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !this.unsub) {
            this.unsub = clock.add(this.tick);
          } else if (!e.isIntersecting && this.unsub) {
            this.unsub();
            this.unsub = null;
          }
        }
      },
      { rootMargin: '120px' },
    );
    io.observe(this.canvas);
    // Safety-net: primer frame sin esperar al observer ni al reloj.
    this.render(11.0);
  }

  private tick = (dt: number, t: number): void => {
    if (this.texReady && this.assembleT < 1) {
      this.assembleT = Math.min(this.assembleT + dt / 2.6, 1);
      this.assemble = easeOutQuint(this.assembleT);
    }
    this.render(t);
  };

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w = Math.round(this.canvas.clientWidth * dpr);
    const h = Math.round(this.canvas.clientHeight * dpr);
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  private render(time: number): void {
    const gl = this.gl;
    this.resize();
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    const rect = this.canvas.getBoundingClientRect();
    const sx = w / Math.max(rect.width, 1);
    const sy = h / Math.max(rect.height, 1);

    // Desvanecido por scroll: 1 cuando el hero ha salido un 85%.
    const fade = norm(window.scrollY, 0, this.hero.offsetHeight * 0.85);

    // Colocación responsiva: a la derecha en apaisado, arriba en vertical.
    const mn = Math.min(w, h);
    const wide = w / h > 1.05;
    const box = wide ? Math.min(0.42, (w / mn) * 0.225) : 0.34;
    const posX = wide ? (w / mn) * 0.5 - box - 0.05 : 0;
    const posY = wide ? 0.02 : (h / mn) * 0.5 - box - 0.10;

    gl.useProgram(this.program);
    gl.uniform2f(this.u['uRes'] ?? null, w, h);
    gl.uniform1f(this.u['uTime'] ?? null, time);
    gl.uniform2f(
      this.u['uPointer'] ?? null,
      (pointer.x - rect.left) * sx,
      (pointer.y - rect.top) * sy,
    );
    gl.uniform1f(this.u['uAssemble'] ?? null, this.assemble);
    gl.uniform1f(this.u['uFade'] ?? null, fade);
    gl.uniform2f(this.u['uLogoPos'] ?? null, posX, posY);
    gl.uniform1f(this.u['uLogoBox'] ?? null, box);
    gl.uniform1i(this.u['uLogo'] ?? null, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private renderStatic(): void {
    this.assemble = 1;
    this.render(11.0);
  }
}