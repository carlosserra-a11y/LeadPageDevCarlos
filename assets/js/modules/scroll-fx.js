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

/** Fotos do "Sobre": revelação por máscara + paralaxe da imagem. */
function aboutPhotos(gsap) {
  const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 24;
  document.querySelectorAll('[data-photo]').forEach((photo) => {
    gsap.fromTo(
      photo,
      { clipPath: `inset(100% 0% 0% 0% round ${radius}px)` },
      {
        clipPath: `inset(0% 0% 0% 0% round ${radius}px)`,
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: photo, start: 'top 85%', once: true },
      },
    );
    const img = photo.querySelector('img');
    if (img) {
      gsap.fromTo(
        img,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
    const speed = Number(photo.dataset.speed || 0);
    if (speed) {
      gsap.to(photo, {
        y: speed,
        ease: 'none',
        scrollTrigger: { trigger: photo, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });
}

/** Linha do tempo: a linha se desenha e os pontos acendem. */
function timeline(gsap, ScrollTrigger) {
  const list = document.querySelector('[data-timeline]');
  if (!list) return;
  const fill = list.querySelector('.timeline__fill');
  if (fill) {
    gsap.to(fill, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 55%', scrub: true },
    });
  }
  list.querySelectorAll('.timeline__item').forEach((item) => {
    const sync = (self) => item.classList.toggle('is-on', self.progress > 0);
    ScrollTrigger.create({
      trigger: item,
      start: 'top 68%',
      end: 'max',
      onUpdate: sync,
      onToggle: sync,
      onRefresh: sync,
    });
  });
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
    () => aboutPhotos(gsap),
    () => timeline(gsap, ScrollTrigger),
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
