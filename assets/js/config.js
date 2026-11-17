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
    whatsapp: '48996170281',
    email: 'carlosserraap55@gmail.com',
    linkedin: '',
    instagram: 'https://www.instagram.com/karlossz_/',
    github: 'https://github.com/carlosserra-a11y',
    /* Link "Pedir avaliações" do seu Perfil da Empresa no Google
       (ex.: 'https://g.page/r/XXXXXXXX/review'). Vazio = botão escondido. */
    googleReview: '',
  }),

  /* Google Analytics 4: cole o "ID da métrica" (ex.: 'G-ABC123XYZ9').
     Vazio = nada é carregado. Com ID, o visitante vê o aviso de cookies e
     o Analytics só liga depois do "Aceitar" (LGPD). */
  analytics: Object.freeze({
    googleId: 'G-CJ9GWEZBH6',
  }),

  /* Assunto do e-mail quando o visitante escolhe "Enviar por e-mail". */
  emailSubject: Object.freeze({
    negocio: 'Orçamento pelo site — Carlos Serra',
    recrutador: 'Vaga Full Stack Júnior — Carlos Serra',
  }),

  /* Tempo (ms) de cada destaque no cartão do hero. */
  heroCardInterval: 5500,
});
