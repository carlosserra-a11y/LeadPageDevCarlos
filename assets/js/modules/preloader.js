const MAX_WAIT_MS = 1400;
const SAFETY_MS = 3600;
const LOAD_S = 1.1;
const GLYPHS = '01<>/{}[]#$%&*=+;';
const COMMAND = 'npm run carlos-serra';
const DONE = '✓ pronto para o seu projeto';

/** Resolve quando as fontes e o retrato do hero estão prontos (ou após o tempo máximo). */
function assetsReady() {
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  // a imagem do hero que está visível nesta tela (arte no computador, retrato no celular)
  const candidates = Array.from(document.querySelectorAll('[data-hero-art] img, [data-hero-photo] img'));
  const hero = candidates.find((img) => img.getClientRects().length > 0) ?? candidates[0];
  const image = hero && typeof hero.decode === 'function' ? hero.decode().catch(() => undefined) : Promise.resolve();
  const timeout = new Promise((resolve) => setTimeout(resolve, MAX_WAIT_MS));
  return Promise.race([Promise.all([fonts, image]), timeout]);
}

/** Troca as palavras "Código → Design → Resultado" durante o carregamento. */
function cycleTags(gsap, tags) {
  const tl = gsap.timeline();
  tags.forEach((tag, i) => {
    if (i === 0) return;
    const at = (LOAD_S / tags.length) * i;
    tl.to(tags[i - 1], { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in' }, at).fromTo(
      tag,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      at + 0.15,
    );
  });
  return tl;
}

/** O nome "decodifica": cada letra mostra símbolos de código até virar a letra certa. */
function decodeName(gsap, letters) {
  const state = { p: 0 };
  let frame = 0;
  const total = letters.length;
  return gsap.to(state, {
    p: 1,
    duration: LOAD_S,
    ease: 'none',
    onUpdate: () => {
      frame += 1;
      letters.forEach((letter, i) => {
        const settled = state.p >= 0.12 + (i / total) * 0.78;
        if (settled) {
          if (letter.classList.contains('is-glitch')) {
            letter.classList.remove('is-glitch');
            letter.textContent = letter.dataset.char;
          }
        } else if (frame % 3 === 0) {
          letter.classList.add('is-glitch');
          letter.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      });
    },
  });
}

/** Digita o comando no "terminal" acima do nome. */
function typeCommand(gsap, target) {
  const state = { n: 0 };
  return gsap.to(state, {
    n: COMMAND.length,
    duration: 0.6,
    ease: 'none',
    onUpdate: () => {
      if (target) target.textContent = COMMAND.slice(0, Math.round(state.n));
    },
  });
}

/**
 * Abertura do site: um comando é digitado, o nome "decodifica" letra a letra,
 * a linha carrega com o contador e as palavras trocam; depois um anel laranja
 * abre um círculo a partir do centro e revela o hero (que entra por baixo).
 * A promessa resolve quando o círculo começa a abrir. Sempre resolve.
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

    const q = (selector) => el.querySelector(selector);
    const letters = Array.from(el.querySelectorAll('.preloader__l'));
    const cmd = q('[data-preloader-cmd]');
    const count = q('[data-preloader-count]');
    const center = q('[data-preloader-center]');
    const tags = Array.from(el.querySelectorAll('[data-preloader-tags] span'));
    const counter = { value: 0 };
    const ready = assetsReady();
    const radius = () => Math.hypot(window.innerWidth, window.innerHeight) / 2 + 60;

    const exit = gsap
      .timeline({ paused: true, onComplete: finish })
      .call(() => {
        if (cmd) cmd.textContent = DONE;
      })
      .to(center, { scale: 1.08, opacity: 0, duration: 0.55, ease: 'power2.in' }, 0.15)
      .to(q('.preloader__grid'), { opacity: 0, duration: 0.4 }, 0.15)
      .set(q('[data-preloader-ring]'), { opacity: 1 }, 0.4)
      .to(el, { '--hole': () => `${radius()}px`, duration: 1.05, ease: 'expo.inOut' }, 0.4)
      .to(q('[data-preloader-ring]'), { opacity: 0, duration: 0.35 }, 1.1)
      .call(reveal, [], 0.6);

    gsap
      .timeline({ onComplete: () => ready.then(() => exit.play()) })
      .to(q('.preloader__grid'), { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .fromTo(q('[data-preloader-glow]'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2 }, 0)
      .to(q('.preloader__cmd'), { opacity: 1, duration: 0.3 }, 0)
      .add(typeCommand(gsap, cmd), 0.05)
      .fromTo(letters, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out' }, 0.1)
      .add(decodeName(gsap, letters), 0.1)
      .fromTo(q('.preloader__meta'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 0.3)
      .fromTo(q('[data-preloader-bar]'), { scaleX: 0 }, { scaleX: 1, duration: LOAD_S, ease: 'power2.inOut' }, 0.2)
      .to(
        counter,
        {
          value: 100,
          duration: LOAD_S,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count) count.textContent = String(Math.round(counter.value)).padStart(3, '0');
          },
        },
        0.2,
      )
      .add(cycleTags(gsap, tags), 0.2);
  });
}
