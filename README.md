# Carlos Serra · Desenvolvedor Full Stack Júnior

Landing page pessoal de **Carlos Alberto Araújo Serra Nunes**, feita para dois objetivos: conseguir uma vaga de **Desenvolvedor Full Stack Júnior** (junho de 2027, qualquer modalidade) e **captar donos de pequenos negócios** que precisam de site, cardápio digital ou sistema com pedido no WhatsApp.

**Site:** https://carlosserra-a11y.github.io/LeadPageDevCarlos/ (depois de ativar o GitHub Pages, veja abaixo)

![Prévia do hero](assets/img/og.jpg)

## O que tem na página

- **Hero** no estilo da referência "Kontour": retrato de perfil em contraluz laranja na frente do nome gigante **CARLOS**, cartão de destaques com setas, números e um **selo giratório** que acelera com a rolagem.
- **Paralaxe** no hero (rolagem e mouse), faixa de tecnologias que inverte com a direção da rolagem, manifesto que acende palavra por palavra e fotos com revelação por máscara.
- **Portfólio em anel 3D giratório**: a rolagem gira o anel com os 8 projetos reais (capturas dos sites no ar). Também gira com setas, teclado (← → Home End), clique e arrasto.
- Seções para **clientes** (serviços, processo, condições, FAQ) e para **recrutadores** (stack, diferenciais, linha do tempo).
- **Contato** que monta a mensagem e abre o WhatsApp ou o e-mail. Nada é salvo nem enviado a servidor.

## Como editar

| Quero mudar… | Mexo em… |
|---|---|
| WhatsApp, e-mail, LinkedIn, Instagram | `assets/js/config.js` (campo vazio = botão escondido) |
| Textos de qualquer seção | `index.html` (cada seção tem um comentário com o nome dela) |
| Um projeto do portfólio | `index.html`, seção `PROJETOS`: cada `<li class="ring__card">` é um projeto (título, descrição, tecnologias e links). O painel lê tudo de lá. |
| A captura de um projeto | troque a imagem em `assets/img/projects/` (960 × 600, WebP) |
| A data de disponibilidade | procure por "junho de 2027" e "JUN 2027" no `index.html` |
| Cores | variáveis no topo de `assets/css/base.css` (`--ember`, `--crimson`, `--red`…) |
| Tempo de troca do cartão do hero | `heroCardInterval` em `assets/js/config.js` |
| Prévia do link no WhatsApp/LinkedIn | `assets/img/og.jpg` (1200 × 630) e as tags `og:` no `<head>` |

## Rodar no computador

```bash
npm start
```

Abra http://localhost:5173/LeadPageDevCarlos/ (servidor sem cache, sem dependências).

```bash
npm test
```

Roda os testes da lógica pura (montagem da mensagem, validação e matemática do anel 3D) com o executor nativo do Node.

## Publicar no GitHub Pages

1. No GitHub, abra **Settings → Pages** deste repositório.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch **`main`**, pasta **`/ (root)`**, e salve.
3. Em 1 a 2 minutos o site fica em https://carlosserra-a11y.github.io/LeadPageDevCarlos/.

O arquivo `.nojekyll` já está na raiz, então o GitHub serve tudo como está.

## Confira antes de divulgar

- [ ] Preencher `whatsapp` e `email` em `assets/js/config.js` (sem eles, o formulário fica oculto e só o GitHub aparece no contato).
- [ ] Preencher `linkedin` (recrutadores procuram).
- [ ] Confirmar a data "junho de 2027"; se puder começar antes, trocar por "Disponível agora".
- [ ] Ativar o GitHub Pages e testar o link no WhatsApp (a prévia deve mostrar o hero).
- [ ] Conferir se todos os 8 projetos continuam no ar.

## Tecnologia

HTML, CSS e JavaScript puros (módulos ES), **sem etapa de build**. Animações com **GSAP 3 + ScrollTrigger** e rolagem suave com **Lenis**, servidos pelo próprio site (`assets/vendor/`). Fontes auto-hospedadas. CSP estrita (sem script ou estilo inline), respeito a `prefers-reduced-motion`, funciona sem JavaScript.

```
index.html            página
404.html              página de erro do GitHub Pages
assets/css/           base, hero, seções, portfólio, contato
assets/js/boot.js     marca JS/movimento reduzido antes de pintar
assets/js/config.js   contatos e ajustes editáveis
assets/js/main.js     liga cada parte, isolando falhas
assets/js/modules/    hero, anel 3D, rolagem, navegação, contato, efeitos
assets/js/lib/        lógica pura testada (mensagem, matemática do anel)
tests/                testes (node --test)
scripts/serve.mjs     servidor local sem cache
PROMPT.md             o prompt mestre usado para criar a página
ANALISE.md            análise final: bugs corrigidos e melhorias sugeridas
```

## Créditos

- [GSAP](https://gsap.com) (licença padrão GreenSock, gratuita) · [Lenis](https://github.com/darkroomengineering/lenis) (MIT)
- Fontes: Archivo, Inter e Instrument Serif (SIL Open Font License)
- Fotos: do próprio Carlos. Capturas: dos sites dos projetos, feitas por ele.

© 2026 Carlos Alberto Araújo Serra Nunes. Código e imagens deste repositório não podem ser reutilizados sem autorização.
