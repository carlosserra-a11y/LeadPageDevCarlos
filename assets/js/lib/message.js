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
  segmento: 60,
  cidade: 60,
  link: 120,
  prazo: 40,
  item: 60,
  itens: 10,
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
 *   empresa?: string, vaga?: string, mensagem?: string, segmento?: string, cidade?: string,
 *   link?: string, prazo?: string, servicos?: string[] | string, recursos?: string[] | string,
 *   material?: string[] | string }} ContactData
 */

/**
 * Limpa uma lista de opções marcadas (checkboxes): cada item limpo,
 * sem vazios nem repetidos, e no máximo `maxItems` itens.
 * @param {unknown} list
 * @param {number} maxItem
 * @param {number} maxItems
 * @returns {string[]}
 */
export function cleanList(list, maxItem, maxItems) {
  const items = Array.isArray(list) ? list : list == null ? [] : [list];
  const out = [];
  for (const item of items) {
    const value = clean(item, maxItem);
    if (value && !out.includes(value)) out.push(value);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** O que o negócio precisa: as opções marcadas ou, no formulário antigo, o campo único. */
function servicesOf(data) {
  const list = cleanList(data?.servicos, LIMITS.item, LIMITS.itens);
  return list.length ? list : cleanList(data?.projeto, LIMITS.projeto, 1);
}

const ERRORS = Object.freeze({
  perfil: 'Escolha se você tem um negócio ou é recrutador(a).',
  nome: 'Digite seu nome.',
  servicos: 'Escolha pelo menos uma opção.',
  mensagem: 'Conte um pouco mais (mínimo de 10 caracteres).',
});

const result = (errors) => ({ ok: Object.keys(errors).length === 0, errors });

/**
 * Valida uma etapa do orçamento do negócio: "servicos", "negocio", "detalhes" ou "revisao".
 * @param {string} step
 * @param {ContactData} data
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateStep(step, data) {
  const errors = {};
  const checkAll = step === 'revisao';
  if ((checkAll || step === 'servicos') && servicesOf(data).length === 0) errors.servicos = ERRORS.servicos;
  if ((checkAll || step === 'negocio') && clean(data?.nome, LIMITS.nome).length < 2) errors.nome = ERRORS.nome;
  return result(errors);
}

/**
 * Negócio: nome e pelo menos uma opção do que precisa (a mensagem é opcional).
 * Recrutador: nome e mensagem.
 * @param {ContactData} data
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateContact(data) {
  if (!PERFIS.includes(data?.perfil)) return result({ perfil: ERRORS.perfil });
  if (data.perfil === 'negocio') return validateStep('revisao', data);
  const errors = {};
  if (clean(data.nome, LIMITS.nome).length < 2) errors.nome = ERRORS.nome;
  if (clean(data.mensagem, LIMITS.mensagem).length < 10) errors.mensagem = ERRORS.mensagem;
  return result(errors);
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

  const list = (value) => cleanList(value, LIMITS.item, LIMITS.itens).join(', ');
  const legacy = !isRecruiter && cleanList(data.servicos, LIMITS.item, 1).length === 0;
  const fields = isRecruiter
    ? [
        ['Nome', clean(data.nome, LIMITS.nome)],
        ['Empresa', clean(data.empresa, LIMITS.empresa)],
        ['Vaga', clean(data.vaga, LIMITS.vaga)],
      ]
    : [
        ['Nome', clean(data.nome, LIMITS.nome)],
        ['Negócio', clean(data.negocio, LIMITS.negocio)],
        ['Segmento', clean(data.segmento, LIMITS.segmento)],
        ['Cidade', clean(data.cidade, LIMITS.cidade)],
        ['Site ou Instagram', clean(data.link, LIMITS.link)],
        [legacy ? 'Projeto' : 'Preciso de', servicesOf(data).join(', ')],
        ['Recursos', list(data.recursos)],
        ['Prazo', clean(data.prazo, LIMITS.prazo)],
        ['Já tenho', list(data.material)],
      ];

  const lines = fields.filter(([, value]) => value).map(([label, value]) => `*${label}:* ${value}`);
  const body = clean(data.mensagem, LIMITS.mensagem);
  const heading = isRecruiter || legacy ? '*Mensagem:*' : '*Sobre o projeto:*';
  const tail = body ? ['', heading, body] : [];

  return [opening, '', ...lines, ...tail].join('\n');
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
