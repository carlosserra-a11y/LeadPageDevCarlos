import { CONFIG } from './config.js';
import { initSmooth, createVelocity } from './modules/smooth.js';
import { initNav } from './modules/nav.js';
import { runPreloader } from './modules/preloader.js';
import { initHero } from './modules/hero.js';
import { initHeroCard } from './modules/hero-card.js';
import { initScrollFx } from './modules/scroll-fx.js';
import { initPointerFx } from './modules/pointer-fx.js';
import { initRing } from './modules/ring.js';
import { initContact } from './modules/contact.js';

const root = document.documentElement;

/** Roda uma parte do site isolada: se ela falhar, o resto continua. */
function safely(name, run) {
  try {
    return run();
  } catch (error) {
    console.error(`[${name}]`, error);
    return undefined;
  }
}

function setYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = year;
  });
}

/** Captura que não carregar mostra o nome do projeto no lugar. */
function guardImages() {
  document.querySelectorAll('[data-fallback] img').forEach((img) => {
    const mark = () => img.closest('[data-fallback]')?.classList.add('is-broken');
    img.addEventListener('error', mark, { once: true });
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') mark();
  });
}

async function start() {
  const reduced = root.classList.contains('reduced-motion');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const { gsap, ScrollTrigger } = window;

  safely('ano', setYear);
  safely('imagens', guardImages);
  safely('contato', () => initContact(CONFIG.contact, CONFIG.emailSubject));
  safely('cartao', () => initHeroCard({ interval: CONFIG.heroCardInterval, autoplay: !reduced }));

  /* sem GSAP (bloqueado ou falhou): página estática, porém completa */
  if (!gsap || !ScrollTrigger) {
    root.classList.remove('is-loading');
    if (!reduced) document.querySelector('.badge')?.classList.add('is-css-spin');
    safely('nav', () => initNav({ lenis: null, ScrollTrigger: null, reduced }));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = reduced ? null : safely('rolagem', () => initSmooth({ gsap, ScrollTrigger }));
  lenis?.stop();
  const nav = safely('nav', () => initNav({ lenis, ScrollTrigger, reduced }));
  safely('portfolio', () => initRing({ gsap, ScrollTrigger, lenis, reduced }));

  let hero;
  if (!reduced) {
    const velocity = safely('velocidade', () => createVelocity({ gsap, ScrollTrigger }));
    hero = safely('hero', () => initHero({ gsap, ScrollTrigger, finePointer, velocity }));
    safely('efeitos', () => initScrollFx({ gsap, ScrollTrigger, velocity }));
    if (finePointer) safely('ponteiro', () => initPointerFx({ gsap }));
  }

  try {
    await runPreloader({ gsap, reduced });
  } catch (error) {
    console.error('[pre-carregador]', error);
    root.classList.remove('is-loading');
  } finally {
    lenis?.start();
    safely('entrada', () => hero?.intro());
  }

  const refresh = () => ScrollTrigger.refresh();
  if (document.fonts) document.fonts.ready.then(refresh).catch(() => undefined);
  if (document.readyState === 'complete') refresh();
  else window.addEventListener('load', refresh, { once: true });
  safely('ancora', () => nav?.goToInitialHash());
}

start().catch((error) => {
  console.error('[inicio]', error);
  root.classList.remove('is-loading');
});
