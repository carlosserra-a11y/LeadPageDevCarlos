import {
  clamp,
  mod,
  ringRadius,
  angleForProgress,
  activeIndex,
  focusFor,
  progressForIndex,
  nearestIndex,
} from '../lib/ring-math.js';

const GAP = 26; // folga (px) de cada lado entre cartões vizinhos
const SCROLL_PER_CARD = 0.6; // altura de tela rolada para trocar de projeto (modo rolagem)
const SNAP_DELAY = 220; // ms parado antes de encaixar no projeto mais próximo
const DRAG_THRESHOLD = 6; // px para diferenciar toque/clique de arrasto
const FLICK_MS = 180; // quanto um "peteleco" projeta o giro à frente

/* Computador com mouse: a rolagem gira o anel (seção fixada).
   Toque (celular, tablet, notebook com tela de toque): a página rola normal
   e o anel gira arrastando para os lados. */
const SCROLL_MODE = '(min-width: 901px) and (pointer: fine)';
const SWIPE_MODE = '(max-width: 900px), (pointer: coarse), (pointer: none)';

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

function openInNewTab(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
}

/**
 * Arrasto horizontal reutilizável (mouse ou dedo). Decide a direção nos
 * primeiros pixels: gesto vertical fica com a rolagem da página.
 * @returns {() => void} remove os ouvintes
 */
function bindDrag(stage, { canStart, onStart, onMove, onEnd, onTap }) {
  let active = false;
  let decided = false;
  let horizontal = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;

  const move = (event) => {
    if (!active) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      decided = true;
      horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) stage.classList.add('is-dragging');
    }
    if (!horizontal) return;
    const now = performance.now();
    velocity = (event.clientX - lastX) / Math.max(1, now - lastT);
    lastX = event.clientX;
    lastT = now;
    onMove(dx);
  };

  const end = (event) => {
    if (!active) return;
    active = false;
    stage.classList.remove('is-dragging');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    if (event.type === 'pointerup' && !decided) {
      onTap(event);
      return;
    }
    if (horizontal) onEnd(velocity);
  };

  const down = (event) => {
    if (event.button !== 0 || !canStart()) return;
    active = true;
    decided = false;
    horizontal = false;
    velocity = 0;
    startX = lastX = event.clientX;
    startY = event.clientY;
    lastT = performance.now();
    onStart();
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  stage.addEventListener('pointerdown', down);
  return () => {
    stage.removeEventListener('pointerdown', down);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
  };
}

/** Modo rolagem: a rolagem gira o anel; arrasto, trackpad e setas apenas rolam a página. */
function scrollMode({ ScrollTrigger, lenis, section, pin, stage, cards, count, layout, render, tap }) {
  let snapTimer = 0;
  let dragging = false;

  const scrollTo = (top, duration = 1.1, immediate = false) => {
    if (lenis) lenis.scrollTo(top, { duration, immediate });
    else window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${Math.round(window.innerHeight * SCROLL_PER_CARD * (count - 1))}`,
    pin,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefreshInit: layout,
    onRefresh: (self) => render(angleForProgress(self.progress, count), self.progress),
    onUpdate: (self) => {
      render(angleForProgress(self.progress, count), self.progress);
      scheduleSnap();
    },
  });

  /* dentro do trecho fixado (com tolerância nas pontas, onde isActive pode ser falso) */
  const inRange = () => window.scrollY >= trigger.start - 2 && window.scrollY <= trigger.end + 2;
  const perCard = () => (trigger.end - trigger.start) / (count - 1);
  const scrollFor = (index) => trigger.start + (trigger.end - trigger.start) * progressForIndex(index, count);

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

  let startScroll = 0;
  const unbindDrag = bindDrag(stage, {
    canStart: inRange,
    onStart: () => {
      dragging = true;
      startScroll = window.scrollY;
      window.clearTimeout(snapTimer);
    },
    onMove: (dx) => {
      const target = clamp(startScroll - (dx / (cards[0].offsetWidth || 400)) * perCard(), trigger.start, trigger.end);
      scrollTo(target, 0, true);
    },
    onEnd: () => {
      dragging = false;
      scheduleSnap();
    },
    onTap: (event) => {
      dragging = false;
      tap(event);
    },
  });

  /* trackpad: deslizar dois dedos para os lados também gira o anel */
  const onWheel = (event) => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || !inRange()) return;
    event.preventDefault();
    const target = clamp(window.scrollY + event.deltaX * 1.4, trigger.start, trigger.end);
    scrollTo(target, 0, true);
    scheduleSnap();
  };
  stage.addEventListener('wheel', onWheel, { passive: false });

  return {
    goTo: (index) => scrollTo(scrollFor(clamp(index, 0, count - 1))),
    wraps: false,
    destroy: () => {
      window.clearTimeout(snapTimer);
      unbindDrag();
      stage.removeEventListener('wheel', onWheel);
      trigger.kill();
    },
  };
}

/** Modo deslizar: o anel gira sozinho (arrasto com inércia), sem prender a rolagem. */
function swipeMode({ gsap, stage, cards, count, render, getCurrent, tap }) {
  const step = 360 / count;
  const state = { angle: -Math.max(0, getCurrent()) * step };
  let tween = null;

  const apply = () => {
    const index = mod(Math.round(-state.angle / step), count);
    render(state.angle, progressForIndex(index, count));
  };

  const snapTo = (angle) => {
    tween?.kill();
    tween = gsap.to(state, { angle, duration: 0.8, ease: 'power3.out', onUpdate: apply });
  };

  /* escolhe o caminho mais curto e deixa o anel dar a volta (do 08 para o 01) */
  const goTo = (index) => {
    const now = Math.round(-state.angle / step);
    let delta = mod(index - now, count);
    if (delta > count / 2) delta -= count;
    snapTo(-(now + delta) * step);
  };

  let startAngle = 0;
  const unbindDrag = bindDrag(stage, {
    canStart: () => true,
    onStart: () => {
      tween?.kill();
      startAngle = state.angle;
    },
    onMove: (dx) => {
      state.angle = startAngle + (dx / (cards[0].offsetWidth || 300)) * step;
      apply();
    },
    onEnd: (velocity) => {
      /* o arrasto decide quantos projetos andar; um gesto curto e rápido anda um */
      const dragged = (state.angle - startAngle) / step;
      const flick = clamp((velocity * FLICK_MS) / (cards[0].offsetWidth || 300), -1, 1);
      let moves = Math.round(dragged);
      if (moves === 0 && Math.abs(dragged + flick) > 0.25) moves = Math.sign(dragged + flick);
      snapTo((Math.round(startAngle / step) + moves) * step);
    },
    onTap: tap,
  });

  apply();

  return {
    goTo,
    wraps: true,
    destroy: () => {
      tween?.kill();
      unbindDrag();
    },
  };
}

/**
 * Portfólio em anel 3D. Com movimento reduzido (ou sem GSAP) continua como grade.
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

  /* o anel vira só visual; o painel traz os links acessíveis */
  section.classList.add('is-ring');
  ring.setAttribute('aria-hidden', 'true');
  cards.forEach((card) => card.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1')));
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-roledescription', 'carrossel');

  let current = -1;
  let announceNext = false;
  let mode = null;

  const layout = () => {
    const width = cards[0].offsetWidth || 400;
    ring.style.setProperty('--r', `${ringRadius(width, count, GAP)}px`);
    cards.forEach((card, i) => card.style.setProperty('--ry', `${(i * 360) / count}deg`));
  };

  function updateButtons() {
    const wraps = mode?.wraps ?? false;
    if (panel.prev) panel.prev.disabled = !wraps && current <= 0;
    if (panel.next) panel.next.disabled = !wraps && current >= count - 1;
  }

  const setActive = (index) => {
    if (index === current) return;
    cards[current]?.classList.remove('is-active');
    current = index;
    cards[index].classList.add('is-active');

    const item = data[index];
    if (panel.num) panel.num.textContent = String(index + 1).padStart(2, '0');
    if (panel.name) panel.name.textContent = item.title;
    if (panel.type) panel.type.textContent = item.type;
    if (panel.desc) panel.desc.textContent = item.desc;
    panel.stack?.replaceChildren(
      ...item.stack.map((tech) => {
        const li = document.createElement('li');
        li.textContent = tech;
        return li;
      }),
    );
    setLink(panel.live, item.live, `Ver ${item.title} ao vivo (abre em nova aba)`);
    setLink(panel.repo, item.repo, `Código de ${item.title} no GitHub (abre em nova aba)`);
    if (announceNext && panel.status) panel.status.textContent = `Projeto ${index + 1} de ${count}: ${item.title}. ${item.desc}`;
    updateButtons();

    gsap.fromTo(
      panel.animated,
      { y: 14, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.04, ease: 'power3.out', overwrite: true },
    );
  };

  const render = (angle, progress) => {
    ring.style.setProperty('--angle', `${angle.toFixed(3)}deg`);
    cards.forEach((card, i) => card.style.setProperty('--focus', focusFor(i, angle, count).toFixed(3)));
    if (panel.bar) panel.bar.style.transform = `scaleX(${progress.toFixed(4)})`;
    setActive(activeIndex(angle, count));
  };

  /* último destino pedido: toques rápidos em sequência se acumulam
     (sem isso, 3 toques em "anterior" durante a animação andavam só 1) */
  let lastGo = { index: 0, time: 0 };

  const go = (index) => {
    announceNext = true;
    window.setTimeout(() => {
      announceNext = false;
    }, 1300);
    lastGo = { index, time: performance.now() };
    mode?.goTo(index);
  };

  const goBy = (delta) => {
    const base = performance.now() - lastGo.time < 900 ? lastGo.index : current;
    const raw = base + delta;
    go(mode?.wraps ? mod(raw, count) : clamp(raw, 0, count - 1));
  };

  /* clique/toque: no cartão da frente abre o site; num lateral, gira até ele */
  const tap = (event) => {
    const card = event.target instanceof Element ? event.target.closest('[data-ring-card]') : null;
    const index = cards.indexOf(card);
    if (index === -1) return;
    if (index === current && data[index].live) openInNewTab(data[index].live);
    else go(index);
  };

  panel.prev?.addEventListener('click', () => goBy(-1));
  panel.next?.addEventListener('click', () => goBy(1));
  stage.addEventListener('keydown', (event) => {
    const actions = {
      ArrowLeft: () => goBy(-1),
      ArrowRight: () => goBy(1),
      Home: () => go(0),
      End: () => go(count - 1),
    };
    if (!(event.key in actions)) return;
    event.preventDefault();
    actions[event.key]();
  });
  ring.addEventListener('dragstart', (event) => event.preventDefault());

  const shared = { gsap, ScrollTrigger, lenis, section, pin, stage, cards, count, layout, render, tap, getCurrent: () => current };
  const mm = gsap.matchMedia();

  mm.add(SCROLL_MODE, () => {
    layout();
    mode = scrollMode(shared);
    updateButtons();
    return () => {
      mode?.destroy();
      mode = null;
    };
  });

  mm.add(SWIPE_MODE, () => {
    section.classList.add('is-swipe');
    layout();
    mode = swipeMode(shared);
    updateButtons();
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      section.classList.remove('is-swipe');
      mode?.destroy();
      mode = null;
    };
  });
}
