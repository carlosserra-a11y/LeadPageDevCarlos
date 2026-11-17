import { CONSENT_KEY, isValidGaId, readConsent, shouldLoadAnalytics } from '../lib/analytics.js';

/** localStorage pode estar bloqueado (aba anônima, cookies desligados). */
function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function saveConsent(choice) {
  try {
    storage()?.setItem(CONSENT_KEY, choice);
  } catch {
    /* sem armazenamento: a escolha vale só para esta visita */
  }
}

let loaded = false;

/** Carrega o gtag.js do Google uma única vez (somente após o "Aceitar"). */
function loadGtag(id) {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
  };
  window.gtag('js', new Date());
  window.gtag('config', id, { anonymize_ip: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
}

function track(name, params = {}) {
  if (loaded && typeof window.gtag === 'function') window.gtag('event', name, params);
}

/** Eventos que importam para o negócio: contato, orçamento, currículo e avaliação. */
function bindEvents() {
  document.addEventListener('click', (event) => {
    const el = event.target.closest('a, button');
    if (!el) return;
    const channel = el.dataset.channel;
    if (channel === 'whatsapp') track('contato_whatsapp', { local: el.closest('section, footer')?.id || 'flutuante' });
    else if (channel === 'email') track('contato_email');
    else if (channel === 'instagram') track('abrir_instagram');
    else if (channel === 'googleReview') track('avaliar_no_google');
    else if (el.hasAttribute('data-cv')) track('baixar_curriculo');
    else if (el.dataset.plan) track('interesse_pacote', { pacote: el.dataset.plan });
    else if (el.dataset.quote) track('interesse_servico', { servico: el.dataset.quote });
    else if (el.dataset.send) track('orcamento_enviado', { canal: el.dataset.send });
  });
}

/**
 * Google Analytics 4 com consentimento (LGPD): sem ID configurado, nada
 * aparece nem carrega. Com ID, mostra o aviso de cookies; o Analytics só
 * liga depois do "Aceitar" e a escolha fica salva no navegador.
 * @param {string} id ID da métrica (G-XXXXXXX), vindo do config.js
 */
export function initAnalytics(id) {
  if (!isValidGaId(id)) return;
  const banner = document.querySelector('[data-consent]');
  const reopen = document.querySelector('[data-consent-open]');
  if (reopen) reopen.closest('li').hidden = false;

  const choice = readConsent(storage());
  if (shouldLoadAnalytics(id, choice)) loadGtag(id);
  else if (choice === null && banner) banner.hidden = false;
  bindEvents();

  banner?.querySelector('[data-consent-accept]')?.addEventListener('click', () => {
    saveConsent('granted');
    banner.hidden = true;
    loadGtag(id);
  });
  banner?.querySelector('[data-consent-deny]')?.addEventListener('click', () => {
    saveConsent('denied');
    banner.hidden = true;
  });
  reopen?.addEventListener('click', () => {
    if (banner) banner.hidden = false;
  });
}
