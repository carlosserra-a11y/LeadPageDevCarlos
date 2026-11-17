import {
  LIMITS,
  buildMessage,
  isValidEmail,
  mailtoUrl,
  normalizePhone,
  safeHttpUrl,
  validateContact,
  validateStep,
  whatsappUrl,
} from '../lib/message.js';

const SEND_LOCK_MS = 1500;
const STEPS = ['servicos', 'negocio', 'detalhes', 'revisao'];
const STEP_NAMES = ['O que você precisa', 'Seu negócio', 'Detalhes do projeto', 'Conferir e enviar'];
const LIST_FIELDS = ['servicos', 'recursos', 'material'];

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
    const text = anchor.dataset.channelText;
    const href = key === 'whatsapp' && text && links.whatsapp ? `${links.whatsapp}?text=${encodeURIComponent(text)}` : links[key];
    const holder = anchor.closest('li, p') ?? anchor;
    holder.hidden = !href;
    if (!href) return;
    anchor.href = href;
    const value = anchor.querySelector('[data-channel-value]');
    if (value && labels[key]) value.textContent = labels[key];
  });
}

/** Dados do formulário, com as opções marcadas (checkboxes) como listas. */
function readForm(form) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  LIST_FIELDS.forEach((name) => {
    data[name] = formData.getAll(name);
  });
  return data;
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
    if (!input || input.disabled) return;
    const slot = field.querySelector('.field__error');
    const message = errors[input.name] || '';
    field.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (slot) slot.textContent = message;
  });
  form.querySelectorAll('[data-error]').forEach((slot) => {
    slot.textContent = errors[slot.dataset.error] || '';
  });
}

function focusFirstError(form, errors) {
  if (errors.servicos) form.querySelector('input[name="servicos"]:not(:disabled)')?.focus();
  else form.querySelector('[aria-invalid="true"]')?.focus();
}

/** Mantém o topo do orçamento visível quando a etapa muda de altura. */
function keepInView(element) {
  const top = element.getBoundingClientRect().top;
  if (top < 72) window.scrollBy(0, top - 96);
}

/**
 * Orçamento do negócio em 4 etapas: o que precisa → negócio → detalhes → conferir.
 * Cada etapa só avança com os campos obrigatórios dela preenchidos.
 * @returns {{ go: (step: number, options?: { focus?: boolean }) => void, tryNext: () => void, isLast: () => boolean } | null}
 */
function initQuote(form, onStepChange) {
  const flow = form.querySelector('[data-quote-flow]');
  if (!flow) return null;
  const steps = STEPS.map((name) => flow.querySelector(`[data-step="${name}"]`));
  if (steps.some((step) => !step)) return null;
  const dots = flow.querySelectorAll('[data-step-dot]');
  const bar = flow.querySelector('[data-quote-bar]');
  const live = flow.querySelector('[data-step-live]');
  const prev = flow.querySelector('[data-quote-prev]');
  const next = flow.querySelector('[data-quote-next]');
  const preview = flow.querySelector('[data-quote-preview]');
  let index = 0;

  const go = (target, { focus = true } = {}) => {
    index = Math.max(0, Math.min(STEPS.length - 1, target));
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-current', i === index);
      dot.classList.toggle('is-done', i < index);
    });
    if (bar) bar.style.transform = `scaleX(${(index + 1) / STEPS.length})`;
    if (prev) prev.hidden = index === 0;
    if (next) next.hidden = index === STEPS.length - 1;
    if (preview && STEPS[index] === 'revisao') preview.textContent = buildMessage(readForm(form));
    if (live) live.textContent = `Etapa ${index + 1} de ${STEPS.length}: ${STEP_NAMES[index]}`;
    onStepChange();
    if (!focus) return;
    steps[index].querySelector('.quote__q')?.focus({ preventScroll: true });
    keepInView(flow);
  };

  const tryNext = () => {
    const { ok, errors } = validateStep(STEPS[index], readForm(form));
    showErrors(form, errors);
    if (!ok) {
      focusFirstError(form, errors);
      return;
    }
    go(index + 1);
  };

  next?.addEventListener('click', tryNext);
  prev?.addEventListener('click', () => {
    showErrors(form, {});
    go(index - 1);
  });
  flow.addEventListener('change', (event) => {
    if (event.target.name === 'servicos') showErrors(form, {});
  });
  go(0, { focus: false });
  return { go, tryNext, isLast: () => index === STEPS.length - 1 };
}

function initCounters(form) {
  form.querySelectorAll('textarea[name="mensagem"]').forEach((textarea) => {
    const counter = textarea.closest('.field')?.querySelector('[data-count]');
    textarea.maxLength = LIMITS.mensagem;
    if (!counter) return;
    const update = () => {
      counter.textContent = `${textarea.value.length}/${LIMITS.mensagem}`;
    };
    textarea.addEventListener('input', update);
    update();
  });
}

/**
 * Contato: canais vindos do config.js e o orçamento (negócio, em etapas) ou a
 * mensagem para recrutadores. Monta o texto e abre o WhatsApp ou o e-mail.
 * Nada é salvo nem enviado a servidor.
 * @param {{ whatsapp: string, email: string, linkedin: string, instagram: string, github: string }} contact
 * @param {{ negocio: string, recrutador: string }} subjects
 */
export function initContact(contact, subjects) {
  const phone = normalizePhone(contact.whatsapp);
  const email = isValidEmail(contact.email) ? String(contact.email) : '';
  const googleReview = safeHttpUrl(contact.googleReview);
  renderChannels(
    {
      whatsapp: phone ? `https://wa.me/${phone}` : '',
      email: email ? `mailto:${email}` : '',
      linkedin: safeHttpUrl(contact.linkedin),
      instagram: safeHttpUrl(contact.instagram),
      github: safeHttpUrl(contact.github),
      googleReview,
    },
    {
      whatsapp: phone ? formatPhone(phone) : '',
      email,
      linkedin: 'Ver perfil',
      instagram: 'Ver perfil',
      github: 'carlosserra-a11y',
    },
  );
  /* bloco "Avaliar no Google": só aparece com o link do Perfil da Empresa */
  document.querySelectorAll('[data-review]').forEach((block) => {
    block.hidden = !googleReview;
  });

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
  const actions = form.querySelector('[data-form-actions]');
  const perfilInputs = Array.from(form.querySelectorAll('input[name="perfil"]'));
  const currentPerfil = () => perfilInputs.find((input) => input.checked)?.value ?? 'negocio';

  let quote = null;
  /* os botões de envio só aparecem na última etapa do orçamento (ou para recrutadores) */
  const syncActions = () => {
    if (actions) actions.hidden = currentPerfil() === 'negocio' && Boolean(quote) && !quote.isLast();
  };
  const setPerfil = (perfil) => {
    const input = perfilInputs.find((item) => item.value === perfil);
    if (input) input.checked = true;
    togglePerfil(form, currentPerfil());
    showErrors(form, {});
    syncActions();
  };

  togglePerfil(form, currentPerfil());
  quote = initQuote(form, syncActions);
  syncActions();
  initCounters(form);
  perfilInputs.forEach((input) => input.addEventListener('change', () => setPerfil(currentPerfil())));

  /* "Falar sobre uma vaga" já escolhe o perfil de recrutador */
  document.querySelectorAll('[data-set-perfil]').forEach((link) => {
    link.addEventListener('click', () => setPerfil(link.dataset.setPerfil));
  });

  /* "Quero um orçamento disso" (serviços) já marca a opção no orçamento */
  document.querySelectorAll('[data-quote]').forEach((link) => {
    link.addEventListener('click', () => {
      setPerfil('negocio');
      const box = Array.from(form.querySelectorAll('input[name="servicos"]')).find((input) => input.value === link.dataset.quote);
      if (box) box.checked = true;
      quote?.go(0, { focus: false });
    });
  });

  /* "Quero este" (pacotes) leva o nome do pacote junto no orçamento */
  const pacote = form.querySelector('[data-pacote]');
  document.querySelectorAll('[data-plan]').forEach((link) => {
    link.addEventListener('click', () => {
      setPerfil('negocio');
      if (pacote) pacote.value = link.dataset.plan;
      quote?.go(0, { focus: false });
    });
  });

  bindSubmit(form, { phone, email, subjects, status, quote, currentPerfil });
}

function bindSubmit(form, { phone, email, subjects, status, quote, currentPerfil }) {
  let locked = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (locked) return;

    /* Enter num campo do orçamento avança a etapa em vez de enviar */
    if (currentPerfil() === 'negocio' && quote && !quote.isLast()) {
      quote.tryNext();
      return;
    }

    const channel = event.submitter?.dataset.send || (phone ? 'whatsapp' : 'email');
    const data = readForm(form);
    const { ok, errors } = validateContact(data);
    if (!ok) {
      if (quote && data.perfil === 'negocio') quote.go(errors.servicos ? 0 : 1);
      showErrors(form, errors);
      if (status) status.textContent = 'Confira os campos destacados.';
      focusFirstError(form, errors);
      return;
    }
    showErrors(form, {});

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
