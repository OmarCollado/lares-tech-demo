// Lares · demo técnica · orquestador
// Fuentes autohospedadas, tokens, estilos y subsistemas. El único
// JavaScript que llega al navegador es el de esta carpeta src/.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/tokens.css';
import './styles/main.css';

import { motionForced, reducedMotion } from './core/env';
import { pointer } from './core/pointer';
import { initMotionToggle } from './fx/motion-toggle';
import { Nebula } from './gl/nebula';
import { initReveals } from './fx/reveal';
import { splitHeroTitle } from './fx/split-text';
import { initManifesto } from './fx/manifesto';
import { initCounters } from './fx/counters';
import { initMagnetic } from './fx/magnetic';
import { initVFloat } from './fx/vfloat';
import { initProcess } from './fx/process';
import { initChrome } from './fx/chrome';
import { initHud } from './hud/hud';

document.documentElement.classList.add('has-js');
// Con movimiento forzado por el usuario, esta clase desactiva el bloque
// CSS de prefers-reduced-motion (que de otro modo gana con !important).
if (motionForced) document.documentElement.classList.add('force-motion');

const boot = (): void => {
  if (!reducedMotion) pointer.init();

  const canvas = document.querySelector<HTMLCanvasElement>('[data-nebula]');
  const hero = document.querySelector<HTMLElement>('.hero');
  let nebula: Nebula | null = null;
  if (canvas && hero) {
    const candidate = new Nebula(canvas, hero);
    // Sin WebGL2 queda el fondo plano --dark; el resto de la página
    // funciona exactamente igual.
    nebula = candidate.init() ? candidate : null;
    splitHeroTitle(hero);
  }

  initChrome();
  initReveals();
  initManifesto();
  initProcess();
  initCounters();
  initMagnetic();
  initVFloat();
  initMotionToggle();
  initHud(() => nebula?.rendererInfo ?? 'render CSS (sin WebGL2)');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}