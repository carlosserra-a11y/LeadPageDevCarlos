import {
  clamp,
  ringRadius,
  angleForProgress,
  activeIndex,
  focusFor,
  progressForIndex,
  nearestIndex,
} from '../lib/ring-math.js';

const GAP = 26; // folga (px) de cada lado entre cartões vizinhos
const SCROLL_PER_CARD = 0.6; // altura de tela rolada para trocar de projeto
const SNAP_DELAY = 220; // ms parado antes de encaixar no projeto mais próximo
const DRAG_THRESHOLD = 6; // px para diferenciar clique de arrasto

/** Lê os dados de um cartão do próprio HTML (uma única fonte de verdade). */
function readCard(card) {
  const text = (selector) => card.querySelector(selector)?.textContent.trim() ?? '';
  return {
    title: text('h3'),
    type: text('[data-type]'),
    desc: text('[data-desc]'),
    stack: Array.from(card.querySelectorAll('[data-stack] li'), (li) => li.textContent.trim()),
    live: card.querySelector('[data-live]')?.href ?? '',
    repo: card.querySelector('[data-repo]')?.href ?? '',
  };
}

function setLink(anchor, href, label) {
  if (!anchor) return;
  anchor.hidden = !href;
  if (!href) return;
  anchor.href = href;
  anchor.setAttribute('aria-label', label);
}

/**
 * Portfólio em anel 3D: a rolagem gira o anel (seção fixada).
 * Setas, teclado, clique e arrasto apenas rolam a página até o projeto,
 * então o anel e a rolagem nunca dessincronizam.
 * Com movimento reduzido (ou sem GSAP) a seção continua como grade.
 * @param {{ gsap: any, ScrollTrigger: any, lenis: any, reduced: boolean }} options
 */
export function initRing({ gsap, ScrollTrigger, lenis, reduced }) {
  const section = document.querySelector('[data-work]');
  if (!section || reduced || !gsap || !ScrollTrigger) return;

  const pin = section.querySelector('[data-work-pin]');
  const stage = section.querySelector('[data-ring-stage]');
  const ring = section.querySelector('[data-ring]');
  const cards = Array.from(ring?.querySelectorAll('[data-ring-card]') ?? []);
  const count = cards.length;
  if (!pin || !stage || !ring || count < 3) return;

  const panel = {
    num: section.querySelector('[data-ring-num]'),
    name: section.querySelector('[data-ring-name]'),
    type: section.querySelector('[data-ring-type]'),
    desc: section.querySelector('[data-ring-desc]'),
    stack: section.querySelector('[data-ring-stack]'),
    live: section.querySelector('[data-ring-live]'),
    repo: section.querySelector('[data-ring-repo]'),
    prev: section.querySelector('[data-ring-prev]'),
    next: section.querySelector('[data-ring-next]'),
    bar: section.querySelector('[data-ring-bar]'),
    status: section.querySelector('[data-ring-status]'),
    animated: section.querySelectorAll('[data-ring-anim]'),
  };
  const data = cards.map(readCard);

  /* modo anel: o anel vira só visual; o painel traz os links acessíveis */
  section.classList.add('is-ring');
  ring.setAttribute('aria-hidden', 'true');
  cards.forEach((card) => {
    card.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
  });
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-roledescription', 'carrossel');

  let current = -1;

  const layout = () => {
    const width = cards[0].offsetWidth || 400;
    ring.style.setProperty('--r', `${ringRadius(width, count, GAP)}px`);
    cards.forEach((card, i) => card.style.setProperty('--ry', `${(i * 360) / count}deg`));
  };

  const setActive = (index, announce) => {
    if (index === current) return;
    cards[current]?.classList.remove('is-active');
    current = index;
    cards[index].classList.add('is-active');

    const item = data[index];
    if (panel.num) panel.num.textContent = String(index + 1).padStart(2, '0');
    if (panel.name) panel.name.textContent = item.title;
    if (panel.type) panel.type.textContent = item.type;
    if (panel.desc) panel.desc.textContent = item.desc;
    if (panel.stack) {
      panel.stack.replaceChildren(
        ...item.stack.map((tech) => {
          const li = document.createElement('li');
          li.textContent = tech;
          return li;
        }),
      );
    }
    setLink(panel.live, item.live, `Ver ${item.title} ao vivo (abre em nova aba)`);
    setLink(panel.repo, item.repo, `Código de ${item.title} no GitHub (abre em nova aba)`);
    if (panel.prev) panel.prev.disabled = index === 0;
    if (panel.next) panel.next.disabled = index === count - 1;
    if (announce && panel.status) panel.status.textContent = `Projeto ${index + 1} de ${count}: ${item.title}. ${item.desc}`;

    gsap.fromTo(
      panel.animated,
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.04, ease: 'power3.out', overwrite: true },
    );
  };

  let announceNext = false;
  const render = (progress) => {
    const angle = angleForProgress(progress, count);
    ring.style.setProperty('--angle', `${angle.toFixed(3)}deg`);
    cards.forEach((card, i) => card.style.setProperty('--focus', focusFor(i, angle, count).toFixed(3)));
    if (panel.bar) panel.bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    setActive(activeIndex(angle, count), announceNext);
  };

  let snapTimer = 0;
  let dragging = false;

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * SCROLL_PER_CARD * (count - 1))}`,
    pin,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefreshInit: layout,
    onRefresh: (self) => render(self.progress),
    onUpdate: (self) => {
      render(self.progress);
      scheduleSnap();
    },
  });

  /** Dentro do trecho fixado (com tolerância nas pontas, onde isActive pode ser falso). */
  const inRange = () => window.scrollY >= trigger.start - 2 && window.scrollY <= trigger.end + 2;

  const scrollFor = (index) => trigger.start + (trigger.end - trigger.start) * progressForIndex(index, count);

  const scrollTo = (top, duration = 1.1) => {
    if (lenis) lenis.scrollTo(top, { duration });
    else window.scrollTo({ top, behavior: 'smooth' });
  };

  const goTo = (index) => {
    announceNext = true;
    scrollTo(scrollFor(clamp(index, 0, count - 1)));
    window.setTimeout(() => {
      announceNext = false;
    }, 1300);
  };

  function scheduleSnap() {
    window.clearTimeout(snapTimer);
    if (dragging) return;
    snapTimer = window.setTimeout(() => {
      if (dragging || !inRange()) return;
      const progress = trigger.progress;
      if (progress <= 0.001 || progress >= 0.999) return;
      const target = scrollFor(nearestIndex(progress, count));
      if (Math.abs(target - window.scrollY) > 2) scrollTo(target, 0.6);
    }, SNAP_DELAY);
  }

  /* botões e teclado */
  panel.prev?.addEventListener('click', () => goTo(current - 1));
  panel.next?.addEventListener('click', () => goTo(current + 1));
  stage.addEventListener('keydown', (event) => {
    const keys = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  });

  /* arrastar (mouse ou dedo na horizontal) e clicar num cartão */
  let startX = 0;
  let startScroll = 0;
  let moved = 0;

  const onMove = (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved < DRAG_THRESHOLD) return;
    stage.classList.add('is-dragging');
    const perCard = (trigger.end - trigger.start) / (count - 1);
    const cardWidth = cards[0].offsetWidth || 400;
    const target = clamp(startScroll - (dx / cardWidth) * perCard, trigger.start, trigger.end);
    if (lenis) lenis.scrollTo(target, { immediate: true });
    else window.scrollTo(0, target);
  };

  const onUp = (event) => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);

    if (event.type === 'pointerup' && moved < DRAG_THRESHOLD) {
      const card = event.target instanceof Element ? event.target.closest('[data-ring-card]') : null;
      const index = cards.indexOf(card);
      if (index === -1) return;
      if (index === current && data[index].live) {
        const link = document.createElement('a');
        link.href = data[index].live;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      } else {
        goTo(index);
      }
      return;
    }
    scheduleSnap();
  };

  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !inRange()) return;
    dragging = true;
    moved = 0;
    startX = event.clientX;
    startScroll = window.scrollY;
    window.clearTimeout(snapTimer);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  });

  ring.addEventListener('dragstart', (event) => event.preventDefault());

  layout();
  render(0);
}
