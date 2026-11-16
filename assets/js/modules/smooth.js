/**
 * Rolagem suave (Lenis) sincronizada com o ScrollTrigger.
 * Devolve null se a biblioteca não carregou: a página segue com a rolagem nativa.
 * @param {{ gsap: any, ScrollTrigger: any }} libs
 */
export function initSmooth({ gsap, ScrollTrigger }) {
  const Lenis = window.Lenis;
  if (typeof Lenis !== 'function') return null;

  const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // O pin do portfólio muda a altura da página: o Lenis precisa remedir o limite
  // de rolagem, senão ele "trava" antes do fim da página.
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  return lenis;
}

/**
 * Guarda a velocidade e a direção da rolagem para os efeitos que "aceleram"
 * (selo giratório e faixa de tecnologias). O impulso decai sozinho.
 * @param {{ gsap: any, ScrollTrigger: any }} libs
 * @returns {{ boost: number, direction: number }}
 */
export function createVelocity({ gsap, ScrollTrigger }) {
  const state = { boost: 0, direction: 1 };

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      state.direction = self.direction;
      state.boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
    },
  });

  gsap.ticker.add(() => {
    state.boost = state.boost < 0.01 ? 0 : state.boost * 0.92;
  });

  return state;
}
