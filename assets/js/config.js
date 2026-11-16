/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CONFIGURAÇÃO DO SITE — edite só este bloco para mudar os contatos ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Campo vazio ('') = botão escondido. Nenhum link quebrado aparece.
 * Exemplos de preenchimento:
 *   whatsapp: '48999990000'            (DDD + número, com ou sem espaços)
 *   email:    'seuemail@exemplo.com'
 *   linkedin: 'https://www.linkedin.com/in/seu-perfil'
 */
export const CONFIG = Object.freeze({
  contact: Object.freeze({
    whatsapp: '',
    email: '',
    linkedin: '',
    instagram: '',
    github: 'https://github.com/carlosserra-a11y',
  }),

  /* Assunto do e-mail quando o visitante escolhe "Enviar por e-mail". */
  emailSubject: Object.freeze({
    negocio: 'Orçamento pelo site — Carlos Serra',
    recrutador: 'Vaga Full Stack Júnior — Carlos Serra',
  }),

  /* Tempo (ms) de cada destaque no cartão do hero. */
  heroCardInterval: 5500,
});
