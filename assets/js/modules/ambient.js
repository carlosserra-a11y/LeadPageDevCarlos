const MAX_DPR = 1.5;
const AREA_PER_EMBER = 26000; // px² de tela por brasa
const MIN_EMBERS = 24;
const MAX_EMBERS = 70;

function spawn(ember, width, height, anywhere) {
  ember.x = Math.random() * width;
  ember.y = anywhere ? Math.random() * height : height + 12;
  ember.r = 0.6 + Math.random() * 1.9;
  ember.vy = 0.15 + Math.random() * 0.45;
  ember.vx = (Math.random() - 0.5) * 0.18;
  ember.life = 0;
  ember.max = 600 + Math.random() * 900;
  ember.warm = Math.random() < 0.72;
  ember.phase = Math.random() * Math.PI * 2;
  return ember;
}

/**
 * Fundo vivo do site inteiro: brasas que sobem devagar num canvas fixo,
 * mais rápidas quando a página rola. Só roda com movimento liberado.
 * @param {{ gsap: any, velocity: { boost: number } | undefined }} options
 */
export function initEmbers({ gsap, velocity }) {
  const canvas = document.querySelector('[data-bg-embers]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  const embers = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(MAX_EMBERS, Math.max(MIN_EMBERS, (width * height) / AREA_PER_EMBER)));
    while (embers.length < target) embers.push(spawn({}, width, height, true));
    embers.length = target;
  };

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 200);
  });
  resize();

  gsap.ticker.add(() => {
    const boost = 1 + (velocity?.boost ?? 0) * 0.9;
    ctx.clearRect(0, 0, width, height);
    for (const e of embers) {
      e.life += 1;
      e.phase += 0.05;
      e.y -= e.vy * boost;
      e.x += e.vx + Math.sin(e.phase * 0.3) * 0.12;
      if (e.y < -12 || e.life > e.max) spawn(e, width, height, false);

      const fade = Math.min(1, e.life / 60) * Math.min(1, (e.max - e.life) / 120);
      const alpha = Math.max(0, fade * (0.55 + Math.sin(e.phase) * 0.35) * (e.warm ? 0.8 : 0.35));
      const color = e.warm ? `255, ${Math.round(90 + e.r * 25)}, 40` : '245, 242, 237';

      if (e.r > 1.6) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${alpha * 0.12})`;
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

const WA_ENTER_DELAY_MS = 1200;

/**
 * Botão flutuante do WhatsApp: visível na página inteira. Entra com uma
 * animação logo depois da abertura do site.
 */
export function initWhatsFloat() {
  const button = document.querySelector('[data-wa-float]');
  if (!button || button.hidden) return;
  window.setTimeout(() => button.classList.add('is-visible'), WA_ENTER_DELAY_MS);
}
