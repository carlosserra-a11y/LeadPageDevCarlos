/**
 * Hero com a imagem completa (computador): entrada com máscara, paralaxe na
 * rolagem, inclinação 3D leve e uma luz que seguem o mouse.
 * Só é chamado quando o movimento está liberado; sem ele a arte fica estática
 * e as áreas clicáveis continuam funcionando.
 * @param {{ gsap: any, finePointer: boolean }} options
 * @returns {{ intro: () => void }}
 */
export function initHeroArt({ gsap, finePointer }) {
  const hero = document.querySelector('[data-hero]');
  const art = document.querySelector('[data-hero-art]');
  const inner = art?.querySelector('[data-hero-art-inner]');
  if (!hero || !art || !inner) return { intro: () => {} };

  const fades = art.querySelectorAll('[data-art-fade]');
  const radius = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--radius')) || 24;

  /* estado inicial (escondido atrás do pré-carregador) */
  gsap.set(inner, {
    autoAlpha: 0,
    scale: 1.1,
    transformPerspective: 1600,
    clipPath: `inset(8% 12% 8% 12% round ${radius}px)`,
  });
  gsap.set(fades, { autoAlpha: 0, y: 10 });

  const intro = () =>
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(inner, { autoAlpha: 1, scale: 1.02, clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.7 }, 0)
      .to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.8);

  /* paralaxe: ao rolar, a arte desce mais devagar, recua e escurece */
  gsap.matchMedia().add('(min-width: 901px)', () => {
    gsap.to(art, {
      yPercent: 14,
      scale: 0.94,
      opacity: 0.35,
      ease: 'none',
      transformOrigin: '50% 0%',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  });

  /* inclinação 3D leve e luz que acompanham o mouse */
  if (finePointer) {
    const rx = gsap.quickTo(inner, 'rotationX', { duration: 1.1, ease: 'power3' });
    const ry = gsap.quickTo(inner, 'rotationY', { duration: 1.1, ease: 'power3' });

    art.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = art.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      rx((ny - 0.5) * -2.4);
      ry((nx - 0.5) * 3);
      art.style.setProperty('--lx', `${(nx * 100).toFixed(1)}%`);
      art.style.setProperty('--ly', `${(ny * 100).toFixed(1)}%`);
    });

    art.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  }

  return { intro };
}
