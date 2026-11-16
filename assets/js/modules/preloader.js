const MAX_WAIT_MS = 1400;
const SAFETY_MS = 3200;

/** Resolve quando as fontes e o retrato do hero estão prontos (ou após o tempo máximo). */
function assetsReady() {
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const hero = document.querySelector('[data-hero-photo] img');
  const image = hero && typeof hero.decode === 'function' ? hero.decode().catch(() => undefined) : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
  return Promise.race([Promise.all([fonts, image]), timeout]);
}

/**
 * Pré-carregador: contador 00→100 e o nome; depois uma cortina sobe.
 * A promessa resolve quando a cortina começa a subir (a entrada do hero
 * acontece por baixo dela). Sempre resolve, mesmo com erro.
 * @param {{ gsap: any, reduced: boolean }} options
 * @returns {Promise<void>}
 */
export function runPreloader({ gsap, reduced }) {
  const root = document.documentElement;
  const el = document.querySelector('[data-preloader]');

  if (reduced || !el || !root.classList.contains('is-loading')) {
    root.classList.remove('is-loading');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      resolve();
    };
    const finish = () => {
      root.classList.remove('is-loading');
      reveal();
    };
    setTimeout(finish, SAFETY_MS);

    const count = el.querySelector('[data-preloader-count]');
    const letters = el.querySelectorAll('[data-preloader-name] span');
    const counter = { value: 0 };
    const ready = assetsReady();

    const exit = gsap
      .timeline({ paused: true, onComplete: finish })
      .to(letters, { yPercent: -110, duration: 0.35, stagger: 0.03, ease: 'power3.in' })
      .to(el, { yPercent: -100, duration: 0.75, ease: 'expo.inOut' }, '-=0.1')
      .call(reveal, [], '-=0.45');

    gsap
      .timeline({ onComplete: () => ready.then(() => exit.play()) })
      .from(letters, { yPercent: 110, duration: 0.7, stagger: 0.05, ease: 'expo.out' }, 0)
      .to(
        counter,
        {
          value: 100,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count) count.textContent = String(Math.round(counter.value)).padStart(2, '0');
          },
        },
        0,
      );
  });
}
