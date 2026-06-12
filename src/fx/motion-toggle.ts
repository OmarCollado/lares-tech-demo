// Toggle de movimiento: solo aparece cuando el sistema operativo pide
// reducir movimiento. Permite activar las animaciones de la demo sin
// tocar la configuración de Windows; recarga para reiniciar los
// subsistemas con el nuevo estado.
import { prefersReduce, motionForced } from '../core/env';

export function initMotionToggle(): void {
  if (!prefersReduce) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'motion-toggle';
  btn.textContent = motionForced ? 'Reducir movimiento' : 'Activar animaciones';
  btn.setAttribute(
    'title',
    motionForced
      ? 'Volver a respetar la preferencia de movimiento reducido'
      : 'Tu sistema pide movimiento reducido; esta demo lo respeta. Pulsa para ver las animaciones igualmente.',
  );
  btn.addEventListener('click', () => {
    try {
      if (motionForced) localStorage.removeItem('lares-motion');
      else localStorage.setItem('lares-motion', 'on');
    } catch {
      // sin localStorage no hay persistencia, pero la recarga no rompe nada
    }
    location.reload();
  });
  document.body.appendChild(btn);
}