/**
 * Hero com a sua imagem (computador), em camadas: fundo → luz → nome "CARLOS"
 * vetorial → você. Entrada em sequência, brilho que percorre o nome,
 * profundidade com o mouse e paralaxe com a rolagem (cada camada numa velocidade).
 * Só é chamado quando o movimento está liberado; sem ele tudo fica estático
 * e as áreas clicáveis continuam funcionando.
 * @param {{ gsap: any, finePointer: boolean }} options
 * @returns {{ intro: () => void }}
 */
export function initHeroArt({ gsap, finePointer }) {
  const hero = document.querySelector('[data-hero]');
  const art = document.querySelector('[data-hero-art]');
  const inner = art?.querySelector('[data-hero-art-inner]');
  if (!hero || !art || !inner) return { intro: () => {} };

  const plate = inner.querySelector('.hero-art__img');
  const name = inner.querySelector('[data-art-name]');
  const nameText = name?.querySelectorAll('text');
  const shine = inner.querySelector('[data-name-shine]');
  const person = inner.querySelector('.hero-art__person');
  const fades = art.querySelectorAll('[data-art-fade]');
  const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 24;

  /* estado inicial (escondido atrás do pré-carregador) */
  gsap.set(inner, { autoAlpha: 0, scale: 1.08, clipPath: `inset(8% 12% 8% 12% round ${radius}px)` });
  if (nameText?.length) gsap.set(nameText, { yPercent: 40, autoAlpha: 0 });
  if (person) gsap.set(person, { yPercent: 6, autoAlpha: 0 });
  gsap.set(fades, { autoAlpha: 0, y: 10 });

  /* brilho que percorre o nome de tempos em tempos */
  const sweep = () => {
    if (!shine) return;
    gsap.fromTo(
      shine,
      { attr: { x1: -260, x2: 0 } },
      { attr: { x1: 960, x2: 1220 }, duration: 1.6, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.2 },
    );
  };

  const intro = () => {
    const tl = gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(inner, { autoAlpha: 1, scale: 1.02, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.7 }, 0)
      .to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.9)
      .add(sweep, 2.2);
    if (nameText?.length) tl.to(nameText, { yPercent: 0, autoAlpha: 1, duration: 1.5 }, 0.45);
    if (person) tl.to(person, { yPercent: 0, autoAlpha: 1, duration: 1.6 }, 0.6);
    return tl;
  };

  /* paralaxe na rolagem: o nome desce mais devagar, você sobe, o conjunto recua */
  gsap.matchMedia().add('(min-width: 901px)', () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    tl.to(art, { yPercent: 12, scale: 0.95, opacity: 0.4, transformOrigin: '50% 0%' }, 0);
    if (name) tl.to(name, { yPercent: 10 }, 0);
    if (person) tl.to(person, { yPercent: -5 }, 0);
  });

  /* profundidade com o mouse: cada camada se move numa distância diferente */
  if (finePointer) {
    const layers = [
      [plate, 8, 5],
      [name, -18, -8],
      [person, 26, 12],
    ].filter(([el]) => el);
    const movers = layers.map(([el, dx, dy]) => ({
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
      dx,
      dy,
    }));

    art.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = art.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      movers.forEach((m) => {
        m.x((nx - 0.5) * m.dx * 2);
        m.y((ny - 0.5) * m.dy * 2);
      });
      art.style.setProperty('--lx', `${(nx * 100).toFixed(1)}%`);
      art.style.setProperty('--ly', `${(ny * 100).toFixed(1)}%`);
    });

    art.addEventListener('pointerleave', () =>
      movers.forEach((m) => {
        m.x(0);
        m.y(0);
      }),
    );
  }

  return { intro };
}
