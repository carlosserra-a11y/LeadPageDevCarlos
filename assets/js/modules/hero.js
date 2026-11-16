/**
 * Hero: entrada animada, paralaxe na rolagem, profundidade com o mouse,
 * contadores e o selo giratório que acelera com a rolagem.
 * Só é chamado quando o movimento está liberado.
 * @param {{ gsap: any, ScrollTrigger: any, finePointer: boolean, velocity: { boost: number } | undefined }} options
 * @returns {{ intro: () => void }}
 */
export function initHero({ gsap, finePointer, velocity }) {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return { intro: () => {} };

  const header = document.querySelector('[data-header]');
  const nameWrap = hero.querySelector('[data-hero-name]');
  const nameMask = hero.querySelector('.hero__name-mask');
  const letters = hero.querySelectorAll('[data-hero-name] .hero__name-mask span');
  const photo = hero.querySelector('[data-hero-photo]');
  const photoInner = hero.querySelector('[data-hero-photo-inner]');
  const photoImg = photoInner?.querySelector('img');
  const lines = hero.querySelectorAll('.hero__title .line > span');
  const content = hero.querySelector('.hero__content');
  const side = hero.querySelector('.hero__side');
  const fades = hero.querySelectorAll('[data-hero-fade]');
  const glow = hero.querySelector('[data-hero-glow]');
  const badgeRing = hero.querySelector('.badge__ring');
  const counters = hero.querySelectorAll('[data-counter]');

  /* estado inicial (escondido atrás do pré-carregador) */
  gsap.set(letters, { yPercent: 105 });
  gsap.set(lines, { yPercent: 115 });
  gsap.set(photoInner, { autoAlpha: 0, y: 80 });
  gsap.set(fades, { autoAlpha: 0, y: 26 });
  if (header) gsap.set(header, { autoAlpha: 0, y: -16 });
  counters.forEach((el) => {
    el.textContent = '0';
  });

  const runCounters = () => {
    counters.forEach((el) => {
      const target = Number(el.dataset.counter) || 0;
      const state = { value: 0 };
      gsap.to(state, {
        value: target,
        duration: 2,
        ease: 'power3.out',
        onUpdate: () => {
          el.textContent = String(Math.round(state.value));
        },
      });
    });
  };

  const intro = () => {
    const tl = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(letters, { yPercent: 0, duration: 1.5, stagger: 0.06 }, 0)
      .to(photoInner, { autoAlpha: 1, y: 0, duration: 1.7 }, 0.15)
      .to(lines, { yPercent: 0, duration: 1.15, stagger: 0.1 }, 0.3)
      .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.06 }, 0.5)
      .add(runCounters, 0.8);
    if (header) tl.to(header, { autoAlpha: 1, y: 0, duration: 1, clearProps: 'transform' }, 0.6);
    return tl;
  };

  /* paralaxe na rolagem: o nome sobe mais devagar que o retrato.
     No celular a coluna lateral fica abaixo do retrato, então só o
     nome e a luz se movem (nada esmaece enquanto a pessoa lê). */
  const frame = hero.querySelector('.hero__frame');
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    gsap
      .timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        defaults: { ease: 'none' },
      })
      .to(nameWrap, { yPercent: 38 }, 0)
      .to(photo, { yPercent: -6, scale: 1.05, transformOrigin: '50% 100%' }, 0)
      .to(content, { y: -80, opacity: 0.15 }, 0)
      .to(side, { y: -120, opacity: 0.15 }, 0)
      .to(glow, { yPercent: 18, opacity: 0.55 }, 0);
  });
  mm.add('(max-width: 900px)', () => {
    gsap
      .timeline({
        scrollTrigger: { trigger: frame, start: 'top top', end: 'bottom top', scrub: true },
        defaults: { ease: 'none' },
      })
      .to(nameWrap, { yPercent: 30 }, 0)
      .to(glow, { yPercent: 12 }, 0);
  });

  /* profundidade com o mouse */
  if (finePointer && photoImg && nameMask && glow) {
    const photoX = gsap.quickTo(photoImg, 'x', { duration: 1.2, ease: 'power3' });
    const photoY = gsap.quickTo(photoImg, 'y', { duration: 1.2, ease: 'power3' });
    const nameX = gsap.quickTo(nameMask, 'x', { duration: 1.4, ease: 'power3' });
    const glowX = gsap.quickTo(glow, 'x', { duration: 1.8, ease: 'power3' });

    hero.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      photoX(nx * 22);
      photoY(ny * 12);
      nameX(nx * -36);
      glowX(nx * 70);
    });

    hero.addEventListener('pointerleave', () => {
      photoX(0);
      photoY(0);
      nameX(0);
      glowX(0);
    });
  }

  /* selo giratório ("giro"): acelera com a velocidade da rolagem */
  if (badgeRing) {
    const spin = gsap.to(badgeRing, {
      rotation: 360,
      duration: 16,
      ease: 'none',
      repeat: -1,
      transformOrigin: '50% 50%',
    });
    gsap.ticker.add(() => {
      spin.timeScale(1 + (velocity?.boost ?? 0) * 1.6);
    });
  }

  return { intro };
}
