const INTERACTIVE = 'a, button, summary, label, [role="button"]';
const TEXT_FIELDS = 'input, textarea, select';

/** Anel que segue o mouse, cresce sobre links e mostra rótulos ("Arraste"). */
function cursor(gsap) {
  const el = document.querySelector('[data-cursor]');
  if (!el) return;
  const ring = el.querySelector('.cursor__ring');
  const label = el.querySelector('.cursor__label');
  document.documentElement.classList.add('has-cursor');
  el.classList.add('is-hidden');

  const xTo = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
  const yTo = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  let visible = false;

  window.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      if (!visible) {
        gsap.set(ring, { x: event.clientX, y: event.clientY });
        el.classList.remove('is-hidden');
        visible = true;
      }
      xTo(event.clientX);
      yTo(event.clientY);
    },
    { passive: true },
  );

  document.documentElement.addEventListener('mouseleave', () => {
    el.classList.add('is-hidden');
    visible = false;
  });

  document.addEventListener('pointerover', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const labelled = target.closest('[data-cursor-label]');
    const overField = Boolean(target.closest(TEXT_FIELDS));
    const text = labelled ? labelled.dataset.cursorLabel : '';
    el.classList.toggle('has-label', Boolean(text));
    el.classList.toggle('is-hover', !text && Boolean(target.closest(INTERACTIVE)));
    el.classList.toggle('is-hidden', overField || !visible);
    if (label) label.textContent = text;
  });
}

/** Botões magnéticos: puxam levemente em direção ao mouse. */
function magnetic(gsap) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.45)' });
    el.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * 0.22);
      yTo((event.clientY - (rect.top + rect.height / 2)) * 0.32);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** Cartões de serviço: brilho que segue o mouse e leve inclinação 3D. */
function glowCards(gsap) {
  document.querySelectorAll('[data-glow]').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
    gsap.set(card, { transformPerspective: 900 });

    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      rx(((y / rect.height) - 0.5) * -5);
      ry(((x / rect.width) - 0.5) * 6);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
}

/**
 * Efeitos de ponteiro. Só para mouse (pointer: fine) e com movimento liberado.
 * @param {{ gsap: any }} options
 */
export function initPointerFx({ gsap }) {
  [cursor, magnetic, glowCards].forEach((run) => {
    try {
      run(gsap);
    } catch (error) {
      console.error('[efeitos de ponteiro]', error);
    }
  });
}
