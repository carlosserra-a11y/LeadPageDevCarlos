import { mod } from '../lib/ring-math.js';

/**
 * Cartão do hero com destaques que trocam (setas e troca automática).
 * A troca automática pausa com o mouse/foco em cima, com a aba oculta
 * e não existe para quem prefere menos movimento.
 * @param {{ interval: number, autoplay: boolean }} options
 */
export function initHeroCard({ interval, autoplay }) {
  const card = document.querySelector('[data-hero-card]');
  if (!card) return;

  const slides = Array.from(card.querySelectorAll('[data-slide]'));
  const bar = card.querySelector('[data-card-progress]');
  const prev = card.querySelector('[data-card-prev]');
  const next = card.querySelector('[data-card-next]');
  const live = card.querySelector('[data-card-live]');
  if (slides.length < 2) return;

  let index = 0;
  let timer = 0;
  let paused = false;

  const show = (target, announce = false) => {
    index = mod(target, slides.length);
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', String(!on));
    });
    if (bar) bar.style.transform = `scaleX(${(index + 1) / slides.length})`;
    if (announce && live) live.textContent = slides[index].textContent.replace(/\s+/g, ' ').trim();
  };

  const schedule = () => {
    window.clearInterval(timer);
    if (!autoplay) return;
    timer = window.setInterval(() => {
      if (!paused && !document.hidden) show(index + 1);
    }, interval);
  };

  prev?.addEventListener('click', () => {
    show(index - 1, true);
    schedule();
  });
  next?.addEventListener('click', () => {
    show(index + 1, true);
    schedule();
  });

  card.addEventListener('pointerenter', () => {
    paused = true;
  });
  card.addEventListener('pointerleave', () => {
    paused = false;
  });
  card.addEventListener('focusin', () => {
    paused = true;
  });
  card.addEventListener('focusout', (event) => {
    if (!card.contains(event.relatedTarget)) paused = false;
  });

  show(0);
  schedule();
}
