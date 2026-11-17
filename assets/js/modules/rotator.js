/**
 * Palavra que gira no título do hero ("Código que vira cliente. / pedido. /
 * venda. / resultado."). Cada [data-rotator] troca a palavra visível de tempos
 * em tempos; para com a aba oculta e não roda para quem prefere menos movimento
 * (aí fica só a primeira palavra, que também é a lida por leitores de tela).
 * @param {{ interval: number, autoplay: boolean }} options
 */
export function initRotator({ interval, autoplay }) {
  if (!autoplay) return;
  document.querySelectorAll('[data-rotator]').forEach((rotator) => {
    const words = Array.from(rotator.querySelectorAll('.rotator__word'));
    if (words.length < 2) return;

    let index = 0;
    const tick = () => {
      if (document.hidden) return;
      const current = words[index];
      index = (index + 1) % words.length;
      const next = words[index];
      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      window.setTimeout(() => current.classList.remove('is-leaving'), interval / 2);
    };
    window.setInterval(tick, interval);
  });
}
