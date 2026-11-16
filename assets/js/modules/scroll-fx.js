import { splitWords } from '../lib/split.js';

/** Barra de progresso de leitura no topo. */
function progressBar(gsap) {
  const bar = document.querySelector('[data-progress] span');
  if (!bar) return;
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

/** Faixas de tecnologias: andam sozinhas e invertem com a direção da rolagem. */
function marquees(gsap, ScrollTrigger, velocity) {
  document.querySelectorAll('[data-marquee]').forEach((band) => {
    const inner = band.querySelector('.ticker__inner');
    if (!inner) return;
    const base = band.dataset.marquee === 'right' ? -1 : 1;
    const loop = gsap.to(inner, { xPercent: -50, duration: 32, ease: 'none', repeat: -1, paused: true });
    loop.totalTime(loop.duration() * 200);

    let speed = base;
    const tick = () => {
      const target = base * (velocity?.direction ?? 1) * (1 + (velocity?.boost ?? 0) * 2);
      speed += (target - speed) * 0.08;
      loop.timeScale(speed);
    };

    ScrollTrigger.create({
      trigger: band,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) {
          gsap.ticker.add(tick);
          loop.resume();
        } else {
          gsap.ticker.remove(tick);
          loop.pause();
        }
      },
    });
  });
}

/** Títulos: palavras sobem por trás de uma máscara ao entrar na tela. */
function splitTitles(gsap) {
  document.querySelectorAll('[data-split]').forEach((title) => {
    const words = splitWords(title, { mask: true });
    gsap.from(words, {
      yPercent: 115,
      duration: 1.15,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    });
  });
}

/**
 * Observa elementos e chama `onShow` (em lote) na primeira vez que entram na tela.
 * Usa IntersectionObserver: dispara também para o que já está visível depois de
 * um salto por âncora ou de recarregar a página no meio (onde o batch falhava).
 */
function onFirstView(elements, onShow) {
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
      if (!visible.length) return;
      visible.forEach((el) => io.unobserve(el));
      onShow(visible);
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  elements.forEach((el) => io.observe(el));
}

/** Blocos que aparecem subindo, em lotes. */
function revealBlocks(gsap) {
  const blocks = gsap.utils.toArray('[data-reveal]');
  if (!blocks.length || !('IntersectionObserver' in window)) return;
  gsap.set(blocks, { autoAlpha: 0, y: 44 });
  onFirstView(blocks, (batch) =>
    gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: 'auto' }),
  );
}

/** Manifesto do "Sobre": as palavras acendem conforme a rolagem. */
function manifesto(gsap) {
  const el = document.querySelector('[data-manifesto]');
  if (!el) return;
  const words = splitWords(el, { mask: false });
  gsap.fromTo(
    words,
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: true },
    },
  );
}



/** Etapas do processo: a linha laranja de cada etapa cresce em sequência. */
function steps() {
  const items = Array.from(document.querySelectorAll('.step'));
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach((step) => step.classList.add('is-in'));
    return;
  }
  onFirstView(items, (batch) =>
    batch.forEach((step, i) => {
      window.setTimeout(() => step.classList.add('is-in'), i * 140);
    }),
  );
}

/** Rótulos "[ 01 ] Sobre": as letras se embaralham e "decodificam" ao entrar na tela. */
function scrambleLabels() {
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/*+';
  const DURATION = 650;
  const labels = Array.from(document.querySelectorAll('main .label')).filter((label) => !label.closest('[data-hero]'));
  const items = labels
    .map((label) => {
      const node = Array.from(label.childNodes).find((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      return node ? { label, node, text: node.textContent } : null;
    })
    .filter(Boolean);
  if (!items.length || !('IntersectionObserver' in window)) return;

  const run = ({ node, text }) => {
    const start = performance.now();
    const frame = (now) => {
      const progress = Math.min(1, (now - start) / DURATION);
      const shown = Math.floor(progress * text.length);
      node.textContent = Array.from(text, (ch, i) =>
        i < shown || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      ).join('');
      if (progress < 1) requestAnimationFrame(frame);
      else node.textContent = text;
    };
    requestAnimationFrame(frame);
  };

  const byLabel = new Map(items.map((item) => [item.label, item]));
  onFirstView(
    items.map((item) => item.label),
    (batch) => batch.forEach((label, i) => window.setTimeout(() => run(byLabel.get(label)), i * 90)),
  );
}

/** FAQ: as respostas abrem e fecham deslizando (o <details> continua acessível). */
function faqAccordion(gsap) {
  document.querySelectorAll('.faq details').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector('p');
    if (!summary || !body) return;
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      gsap.killTweensOf(body);
      if (details.open) {
        gsap.to(body, {
          height: 0,
          paddingBottom: 0,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            details.open = false;
            gsap.set(body, { clearProps: 'height,paddingBottom,opacity,overflow' });
          },
        });
      } else {
        details.open = true;
        gsap.fromTo(
          body,
          { height: 0, paddingBottom: 0, opacity: 0, overflow: 'hidden' },
          { height: 'auto', paddingBottom: '1.4rem', opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'height,paddingBottom,overflow' },
        );
      }
    });
  });
}

/** Nome do rodapé: o contorno vai sendo preenchido. */
function footerName(gsap) {
  const name = document.querySelector('[data-footer-name]');
  if (!name) return;
  gsap.to(name, {
    '--fill': '100%',
    ease: 'none',
    scrollTrigger: { trigger: name, start: 'top 95%', end: 'bottom 60%', scrub: true },
  });
}

/**
 * Efeitos ligados à rolagem. Só é chamado quando o movimento está liberado.
 * @param {{ gsap: any, ScrollTrigger: any, velocity: { boost: number, direction: number } | undefined }} options
 */
export function initScrollFx({ gsap, ScrollTrigger, velocity }) {
  const effects = [
    () => progressBar(gsap),
    () => marquees(gsap, ScrollTrigger, velocity),
    () => splitTitles(gsap),
    () => revealBlocks(gsap),
    () => manifesto(gsap),
    () => scrambleLabels(),
    () => faqAccordion(gsap),
    () => steps(),
    () => footerName(gsap),
  ];
  effects.forEach((run) => {
    try {
      run();
    } catch (error) {
      console.error('[efeitos de rolagem]', error);
    }
  });
}
