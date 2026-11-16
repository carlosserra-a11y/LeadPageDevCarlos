import {
  LIMITS,
  buildMessage,
  isValidEmail,
  mailtoUrl,
  normalizePhone,
  safeHttpUrl,
  validateContact,
  whatsappUrl,
} from '../lib/message.js';

const SEND_LOCK_MS = 1500;

function formatPhone(digits) {
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  const split = rest.length === 9 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** Abre um link numa nova aba sem expor esta página (noopener). */
function openExternal(url) {
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
}

/** Mostra só os canais configurados (WhatsApp, e-mail, LinkedIn…) em toda a página. */
function renderChannels(links, labels) {
  document.querySelectorAll('[data-channel]').forEach((anchor) => {
    const key = anchor.dataset.channel;
    const href = links[key];
    const holder = anchor.closest('li') ?? anchor;
    holder.hidden = !href;
    if (!href) return;
    anchor.href = href;
    const value = anchor.querySelector('[data-channel-value]');
    if (value && labels[key]) value.textContent = labels[key];
  });
}

function togglePerfil(form, perfil) {
  form.querySelectorAll('[data-perfil-group]').forEach((group) => {
    const on = group.dataset.perfilGroup === perfil;
    group.hidden = !on;
    group.querySelectorAll('input, select, textarea').forEach((field) => {
      field.disabled = !on;
    });
  });
}

function showErrors(form, errors) {
  form.querySelectorAll('.field').forEach((field) => {
    const input = field.querySelector('input, select, textarea');
    const slot = field.querySelector('.field__error');
    const message = input ? errors[input.name] : '';
    field.classList.toggle('is-invalid', Boolean(message));
    if (input) input.setAttribute('aria-invalid', String(Boolean(message)));
    if (slot) slot.textContent = message || '';
  });
}

/**
 * Contato: canais vindos do config.js e formulário que monta a mensagem
 * e abre o WhatsApp ou o e-mail. Nada é salvo nem enviado a servidor.
 * @param {{ whatsapp: string, email: string, linkedin: string, instagram: string, github: string }} contact
 * @param {{ negocio: string, recrutador: string }} subjects
 */
export function initContact(contact, subjects) {
  const phone = normalizePhone(contact.whatsapp);
  const email = isValidEmail(contact.email) ? String(contact.email) : '';
  const links = {
    whatsapp: phone ? `https://wa.me/${phone}` : '',
    email: email ? `mailto:${email}` : '',
    linkedin: safeHttpUrl(contact.linkedin),
    instagram: safeHttpUrl(contact.instagram),
    github: safeHttpUrl(contact.github),
  };
  const labels = {
    whatsapp: phone ? formatPhone(phone) : '',
    email,
    linkedin: 'Ver perfil',
    instagram: 'Ver perfil',
    github: 'carlosserra-a11y',
  };
  renderChannels(links, labels);

  const form = document.querySelector('[data-contact-form]');
  const empty = document.querySelector('[data-contact-empty]');
  if (!form) return;

  const canSend = Boolean(phone || email);
  form.hidden = !canSend;
  if (empty) empty.hidden = canSend;
  if (!canSend) {
    console.warn('[contato] Preencha whatsapp ou email em assets/js/config.js para ativar o formulário.');
    return;
  }

  const sendWhats = form.querySelector('[data-send="whatsapp"]');
  const sendEmail = form.querySelector('[data-send="email"]');
  if (sendWhats) sendWhats.hidden = !phone;
  if (sendEmail) sendEmail.hidden = !email;

  const status = form.querySelector('[data-form-status]');
  const message = form.querySelector('textarea[name="mensagem"]');
  const counter = form.querySelector('[data-count]');
  const perfilInputs = Array.from(form.querySelectorAll('input[name="perfil"]'));

  const currentPerfil = () => perfilInputs.find((input) => input.checked)?.value ?? 'negocio';
  togglePerfil(form, currentPerfil());
  perfilInputs.forEach((input) => input.addEventListener('change', () => togglePerfil(form, currentPerfil())));

  /* links "Falar sobre uma vaga" já escolhem o perfil */
  document.querySelectorAll('[data-set-perfil]').forEach((link) => {
    link.addEventListener('click', () => {
      const input = perfilInputs.find((item) => item.value === link.dataset.setPerfil);
      if (!input) return;
      input.checked = true;
      togglePerfil(form, input.value);
    });
  });

  if (message && counter) {
    message.maxLength = LIMITS.mensagem;
    const update = () => {
      counter.textContent = `${message.value.length}/${LIMITS.mensagem}`;
    };
    message.addEventListener('input', update);
    update();
  }

  let locked = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (locked) return;

    const channel = event.submitter?.dataset.send || (phone ? 'whatsapp' : 'email');
    const data = Object.fromEntries(new FormData(form));
    const { ok, errors } = validateContact(data);
    showErrors(form, errors);

    if (!ok) {
      if (status) status.textContent = 'Confira os campos destacados.';
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const text = buildMessage(data);
    const url =
      channel === 'email' ? mailtoUrl(email, subjects[data.perfil] ?? 'Contato pelo site', text) : whatsappUrl(phone, text);
    if (!url) {
      if (status) status.textContent = 'Este canal não está disponível agora. Tente o outro botão.';
      return;
    }

    locked = true;
    window.setTimeout(() => {
      locked = false;
    }, SEND_LOCK_MS);

    if (channel === 'email') {
      window.location.href = url;
      if (status) status.textContent = 'Abrimos o seu e-mail com a mensagem pronta. É só enviar.';
    } else {
      openExternal(url);
      if (status) status.textContent = 'Abrimos o WhatsApp com a mensagem pronta. É só tocar em enviar.';
    }
  });
}
