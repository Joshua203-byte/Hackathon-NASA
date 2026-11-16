// Cuándo se reproduce la entrada espacial. Se decide una sola vez al cargar la página, y en cada carga normal se reproduce.
/** Parámetros que significan «vengo de un enlace a algo concreto»: ahí no se hace esperar a nadie. */
const DEEP = ['cell', 'case', 'mirror', 'layer', 'ind', 'lens', 'win', 'tour', 'dataset'];

export function shouldPlayIntro(): boolean {
  const q = new URLSearchParams(window.location.search);
  const force = q.get('intro');
  if (force === '0') return false;
  if (force === '1') return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if (DEEP.some(k => q.has(k))) return false;
  if (navigator.webdriver) return false; // pruebas automáticas: sin animación salvo ?intro=1
  return true;
}

