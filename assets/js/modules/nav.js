const HEADER_SPACE = 96;
const DESKTOP = '(min-width: 961px)';

function focusable(container) {
  return Array.from(container.querySelectorAll('a[href], button:not([disabled])'));
}

/**
 * Cabeçalho (estado ao rolar), menu do celular, âncoras suaves e link ativo.
 * Funciona com ou sem Lenis/ScrollTrigger.
 * @param {{ lenis: any, ScrollTrigger: any, reduced: boolean }} options
 */
export function initNav({ lenis, ScrollTrigger, reduced }) {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const menuLabel = menuBtn?.querySelector('.sr-only');
  let menuOpen = false;

  /* ---------- rolagem até uma seção ---------- */
  const scrollToTarget = (target, { immediate = false } = {}) => {
    const offset = target.matches('section, [data-anchor-flush]') ? 0 : -HEADER_SPACE;
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(target, { offset, duration: immediate ? 0 : 1.3, immediate, force: true });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: reduced || immediate ? 'auto' : 'smooth' });
    }
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    if (menuOpen) closeMenu(false);
    scrollToTarget(target);
    history.replaceState(null, '', hash);
  });

  /* ---------- cabeçalho: compacto ao rolar, some ao descer ---------- */
  let lastY = window.scrollY;
  const updateHeader = (y, direction) => {
    if (!header) return;
    header.classList.toggle('is-scrolled', y > 40);
    const focusInside = header.contains(document.activeElement);
    const hide = direction > 0 && y > window.innerHeight * 0.7 && !menuOpen && !focusInside;
    header.classList.toggle('is-hidden', hide);
  };

  if (ScrollTrigger) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => updateHeader(self.scroll(), self.direction),
    });
  } else {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          updateHeader(y, y > lastY ? 1 : -1);
          lastY = y;
          ticking = false;
        });
      },
      { passive: true },
    );
  }
  updateHeader(window.scrollY, -1);
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  /* ---------- menu do celular ---------- */
  const onMenuKeydown = (event) => {
    if (event.key === 'Escape') {
      closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = [menuBtn, ...focusable(menu)];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  function openMenu() {
    if (!menu || !menuBtn) return;
    menuOpen = true;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    if (menuLabel) menuLabel.textContent = 'Fechar menu';
    root.classList.add('menu-open');
    header?.classList.remove('is-hidden');
    lenis?.stop();
    document.addEventListener('keydown', onMenuKeydown);
    focusable(menu)[0]?.focus();
  }

  function closeMenu(restoreFocus) {
    if (!menu || !menuBtn || !menuOpen) return;
    menuOpen = false;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    if (menuLabel) menuLabel.textContent = 'Abrir menu';
    root.classList.remove('menu-open');
    lenis?.start();
    document.removeEventListener('keydown', onMenuKeydown);
    if (restoreFocus) menuBtn.focus();
  }

  menuBtn?.addEventListener('click', () => (menuOpen ? closeMenu(true) : openMenu()));
  window.matchMedia(DESKTOP).addEventListener('change', (event) => {
    if (event.matches) closeMenu(false);
  });

  /* ---------- link ativo no menu ---------- */
  const links = Array.from(document.querySelectorAll('.nav__group a[href^="#"]'));
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const on = link.getAttribute('href') === `#${entry.target.id}`;
            if (on) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- abriu com #ancora na URL ---------- */
  const goToInitialHash = () => {
    if (location.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) scrollToTarget(target, { immediate: true });
  };

  return { goToInitialHash, closeMenu };
}
