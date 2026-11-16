// Montagem e validação da mensagem de contato. Funções puras, sem DOM.
// Nada é enviado a servidor: o texto só vira um link do WhatsApp ou de e-mail.

/** Tamanho máximo de cada campo (caracteres). */
export const LIMITS = Object.freeze({
  nome: 80,
  negocio: 100,
  empresa: 100,
  projeto: 80,
  vaga: 120,
  mensagem: 600,
});

export const PERFIS = Object.freeze(['negocio', 'recrutador']);

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Limpa um texto digitado: remove caracteres de controle, junta espaços
 * repetidos, limita quebras de linha e corta no tamanho máximo.
 * @param {unknown} text
 * @param {number} max
 * @returns {string}
 */
export function clean(text, max) {
  return String(text ?? '')
    .replace(CONTROL_CHARS, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/**
 * Deixa só os dígitos e garante o código do Brasil (55).
 * Retorna '' quando o número não parece válido.
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizePhone(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  return digits.length >= 12 && digits.length <= 13 ? digits : '';
}

/**
 * @param {unknown} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email ?? ''));
}

/**
 * Aceita só links http(s); qualquer outra coisa vira ''.
 * @param {unknown} url
 * @returns {string}
 */
export function safeHttpUrl(url) {
  try {
    const parsed = new URL(String(url ?? ''));
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

/**
 * @typedef {{ perfil: string, nome?: string, negocio?: string, projeto?: string,
 *   empresa?: string, vaga?: string, mensagem?: string }} ContactData
 */

/**
 * @param {ContactData} data
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateContact(data) {
  const errors = {};
  if (!PERFIS.includes(data?.perfil)) errors.perfil = 'Escolha se você tem um negócio ou é recrutador(a).';
  if (clean(data?.nome, LIMITS.nome).length < 2) errors.nome = 'Digite seu nome.';
  if (clean(data?.mensagem, LIMITS.mensagem).length < 10) errors.mensagem = 'Conte um pouco mais (mínimo de 10 caracteres).';
  return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Texto final da mensagem, já organizado para o WhatsApp.
 * @param {ContactData} data
 * @returns {string}
 */
export function buildMessage(data) {
  const isRecruiter = data.perfil === 'recrutador';
  const opening = isRecruiter
    ? 'Olá, Carlos! Vi seu portfólio e quero conversar sobre uma vaga.'
    : 'Olá, Carlos! Vim pelo seu site e quero um orçamento.';

  const fields = isRecruiter
    ? [
        ['Nome', clean(data.nome, LIMITS.nome)],
        ['Empresa', clean(data.empresa, LIMITS.empresa)],
        ['Vaga', clean(data.vaga, LIMITS.vaga)],
      ]
    : [
        ['Nome', clean(data.nome, LIMITS.nome)],
        ['Negócio', clean(data.negocio, LIMITS.negocio)],
        ['Projeto', clean(data.projeto, LIMITS.projeto)],
      ];

  const lines = fields.filter(([, value]) => value).map(([label, value]) => `*${label}:* ${value}`);
  const body = clean(data.mensagem, LIMITS.mensagem);

  return [opening, '', ...lines, '', '*Mensagem:*', body].join('\n');
}

/**
 * @param {unknown} phone
 * @param {string} text
 * @returns {string}
 */
export function whatsappUrl(phone, text) {
  const digits = normalizePhone(phone);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : '';
}

/**
 * @param {unknown} email
 * @param {string} subject
 * @param {string} body
 * @returns {string}
 */
export function mailtoUrl(email, subject, body) {
  if (!isValidEmail(email)) return '';
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
