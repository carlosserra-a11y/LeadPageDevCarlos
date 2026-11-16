# Prompt mestre · Landing page de Carlos Serra

> Cole este prompt inteiro numa IA de código (Claude Code, Cursor, Lovable, v0, Bolt…) junto com as fotos e as imagens de referência. Ele foi escrito para gerar, de primeira, uma página profissional, animada e sem bugs. A versão construída a partir dele está neste repositório.

---

## 1. Papel e missão

Você é um(a) **diretor(a) de arte e engenheiro(a) front-end sênior**, com experiência em sites premiados (Awwwards, FWA) e em performance web. Sua missão é criar a **landing page pessoal de Carlos Alberto Araújo Serra Nunes ("Carlos Serra")**, desenvolvedor Full Stack Júnior de Palhoça/SC, com dois objetivos medíveis:

1. **Conseguir uma vaga de Desenvolvedor Full Stack Júnior até junho de 2027** (qualquer modalidade: presencial, híbrido ou remoto).
2. **Captar donos de pequenos negócios** que precisam de site, cardápio digital ou sistema com pedido pelo WhatsApp.

Cada decisão de design, texto e código precisa servir a um desses dois objetivos. Nada de enfeite que atrapalhe a leitura, o desempenho ou a acessibilidade.

## 2. Quem é o Carlos (use só estes fatos; não invente números)

- Nome completo: **Carlos Alberto Araújo Serra Nunes**. Nome de exibição: **Carlos Serra**.
- Cargo-alvo: **Desenvolvedor Full Stack Júnior**. Estuda **Análise e Desenvolvimento de Sistemas na FMP (Palhoça)**.
- Base: **Palhoça, Grande Florianópolis (SC)**. Aceita qualquer modalidade de trabalho.
- GitHub: `https://github.com/carlosserra-a11y` (primeiro repositório público em ago/2026).
- Trabalha como freelancer criando sites, cardápios digitais e materiais comerciais para negócios locais (pizzaria, hamburgueria, chef de eventos, parrilla, vídeomaker).
- Diferenciais comprovados pelos projetos: foco em conversão (o site termina num pedido pronto no WhatsApp), identidade visual própria para cada cliente, guia "Como editar" em português simples, cuidado com segurança, LGPD, acessibilidade, desempenho e testes.
- Condições comerciais: valor fechado com contrato, **50% de sinal + 50% na entrega**, prazo médio de **1 a 2 semanas**, hospedagem e domínio pagos pelo cliente, alterações depois da entrega orçadas à parte, atendimento das **8h às 20h**. **Não faz tráfego pago.**
- Stack: HTML, CSS, JavaScript, TypeScript, React 19, Vite, Tailwind, Node.js, Express, Three.js/WebGL, GSAP, Zustand, Recharts, integração com IA (Google Gemini), Git/GitHub, GitHub Pages, Netlify, Railway/Render.

## 3. Os dois públicos e o que cada um precisa ver

| Público | Pergunta na cabeça | A página responde com |
|---|---|---|
| Recrutador(a) / tech lead | "Ele sabe programar de verdade? Aprende rápido? Vai dar trabalho?" | Projetos reais no ar com código aberto, stack clara, cuidados de qualidade (testes, acessibilidade, segurança), disponibilidade e modalidade. |
| Dono(a) de pequeno negócio | "Isso vai me trazer pedido? Quanto tempo? Vou conseguir mexer?" | Serviços em linguagem simples, resultados visíveis, processo em 5 passos, prazo, forma de pagamento, FAQ honesto e um botão que abre o WhatsApp com a mensagem pronta. |

O contato tem um seletor **"Sou recrutador(a)" / "Tenho um negócio"** que muda os campos e o texto da mensagem.

## 4. Direção de arte

**Referência principal do hero (seguir a composição fielmente):** a tela "Kontour Studios": fundo preto, brilho **laranja-avermelhado** que nasce do canto superior esquerdo e de trás da pessoa, retrato de perfil **com óculos em contraluz** (rosto quase em silhueta, contorno iluminado), nome **CARLOS** gigante em branco na base da tela, **atrás** do corpo; à esquerda o rótulo, o título e dois botões em pílula; à direita um cartão com miniatura quadrada laranja, setas de carrossel e dois números grandes com legenda.

**Referências de apoio** (seções internas): "Rayhan Aditya" (vermelho e preto, caixa alta condensada), "FORMA" (tipografia expandida gigante), "EGO Lab" (cartazes vermelhos com grão), "LEAFTECH" (grade técnica, rótulos entre colchetes) e a paleta "Clean · Premium · Timeless".

**Conceito:** *"Clareza primeiro. Depois o sistema."* Estúdio noturno: fundo quase preto, uma única fonte de luz quente que respira, tipografia enorme e precisa, detalhes técnicos discretos (rótulos `[ 01 ]`, linhas de grade).

**Tokens de cor** (contraste conferido para WCAG AA):

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `#0B0B0B` | fundo principal |
| `--ink-2` / `--ink-3` | `#121212` / `#1A1A1A` | superfícies e cartões |
| `--paper` | `#F5F2ED` | texto principal e botão primário (≈18:1 sobre `--ink`) |
| `--muted` | `#A39E98` | texto secundário (≈7,5:1) |
| `--crimson` | `#8B0D1A` | fundos, faixas, brilho profundo (nunca texto pequeno sobre preto) |
| `--ember` | `#FF4D1A` | luz do hero e detalhes quentes |
| `--red` | `#FF3347` | destaques de texto, foco, ícones (≈5,4:1) |
| `--line` | `rgba(245,242,237,.12)` | divisórias e bordas |

**Tipografia** (auto-hospedada em WOFF2, `font-display: swap`):
- Display: **Archivo Variable** (eixos `wdth` 62–125 e `wght` 100–900). Nome gigante em `wdth 125` e peso médio (como no Kontour), títulos em `wdth 100–112`, entreletra negativa.
- Texto: **Inter Variable** 400–600, 16–18 px, entrelinha 1,6.
- Acento: **Instrument Serif itálico** só em palavras de destaque.
- Escala fluida com `clamp()`; o nome do hero ocupa ~100% da largura útil.

**Textura e luz:** grão SVG fixo em 4–6% de opacidade, brilho radial `--ember` + `--crimson` atrás do retrato e no canto superior esquerdo (respira devagar), linhas de grade finas em seções técnicas, cantos de 20–28 px, bordas de 1 px em `--line`. O hero fica dentro de uma "moldura" de cantos arredondados, como na referência.

## 5. Arquitetura da página (ordem, conteúdo e comportamento)

0. **Pré-carregador** (máx. 1,8 s): contador 00→100 e "CARLOS SERRA"; sai com uma cortina. Não aparece com movimento reduzido, nem se o JavaScript falhar (o conteúdo nunca fica preso atrás dele; trava de segurança de 4 s).
1. **Cabeçalho** dentro da moldura do hero: à esquerda Início, Projetos, Serviços, Sobre; ao centro o logotipo "CARLOS / SERRA" empilhado; à direita Processo, Recrutadores, FAQ, Contato. Ao rolar, vira uma barra fixa compacta com desfoque, que se esconde ao descer e volta ao subir. No celular: menu em tela cheia com foco preso, `Esc` fecha, rolagem travada.
2. **Hero = a imagem de referência completa (no computador), em Full HD e em camadas**: a arte enviada pelo Carlos é o próprio hero, sem recriação, mas **funcional** e nítida em telas grandes:
   - fundo ampliado 4× com IA rodando no PC (Swin2SR) e exportado em 2560 e 1440 px; o degradê **continua para baixo** até o fim do hero, sem emenda, para o nome não ficar cortado;
   - o nome **CARLOS inteiro em vetor** (SVG com Montserrat, `textLength` fixo), entre o fundo e a pessoa: nítido em qualquer resolução;
   - a pessoa recortada (fundo removido localmente) numa camada própria, na frente do nome;
   - apagar da arte o menu e o logo de outra marca ("KONTOUR STUDIOS") e pôr por cima o menu real do site com "CARLOS SERRA";
   - apagar os textos pequenos que a IA gerou com erro ("facedes", "usuaно", "gamblarras") e reescrevê-los por cima, corrigidos, na mesma posição (posições em % e fonte em `cqw`, para acompanhar a largura da arte);
   - áreas clicáveis transparentes exatamente sobre os botões da arte ("Iniciar um Projeto" → contato, "Ver Nosso Trabalho" → projetos, botão redondo → recrutadores, foto do cartão → sobre) e as setas do cartão trocando os destaques de verdade;
   - animações: entrada em sequência (moldura abre → nome sobe → pessoa sobe → textos), brilho que percorre o nome de tempos em tempos, luz que respira atrás da pessoa, profundidade com o mouse (fundo, nome e pessoa se movem em distâncias diferentes), luz que segue o mouse e paralaxe por camada na rolagem;
   - `<picture>` com fonte vazia no celular, para o celular não baixar a arte grande.
   **No celular** a arte inteira ficaria ilegível (≈170 px de altura), então o hero é montado em HTML a partir dela:
   - Topo: rótulo "Desenvolvedor Full Stack Júnior", título **"Clareza primeiro. Depois o sistema."**, subtítulo de 2 linhas para os dois públicos, botões "Iniciar um projeto" (pílula clara com seta num círculo escuro) e "Ver meus trabalhos" (pílula escura).
   - Abaixo: **retrato do Carlos de perfil, de óculos, em contraluz laranja** (fundo removido, versão ampliada com IA), na frente do nome gigante **CARLOS**, que fica atrás do corpo. No celular, o nome sobe para a altura do rosto, aparece dos dois lados da cabeça e **cabe inteiro na moldura** (fonte = 18% da largura útil).
   - Depois do retrato: cartão com miniatura quadrada em fundo laranja (o mesmo retrato de perfil), título e texto que trocam por setas (Disponível para vaga · Sites que vendem · Código aberto), barra de progresso; abaixo, **100%** ("Projetos com código aberto no GitHub. Sem gambiarra escondida.") e **360°** ("Do briefing ao deploy: interface, API, dados e publicação.").
   - **Selo giratório** ("giro"): texto circular "DISPONÍVEL PARA VAGA • FULL STACK JÚNIOR • JUNHO 2027 •" girando sem parar; acelera com a velocidade da rolagem.
   - **Paralaxe**: ao rolar, o nome sobe mais devagar que o retrato, o retrato aproxima levemente e o brilho se desloca; o mouse move as camadas em profundidades diferentes (desligado no toque).
3. **Projetos — carrossel 3D giratório, logo depois do hero** (ver seção 6 deste prompt): quem chega dá de cara com os trabalhos.
4. **Faixa de tecnologias**: letreiro inclinado em carmim com a stack, que inverte o sentido conforme a direção da rolagem.
5. **Sobre**: frase-manifesto que acende palavra por palavra com a rolagem ("Eu transformo o que um negócio já faz bem numa vitrine digital que leva o cliente direto a pedir."), texto curto em primeira pessoa (sem datas que reduzam a experiência), fatos rápidos (formação, base, modalidade, foco) e uma frase de destaque num cartão de vidro. **Sem fotos pessoais.**
6. **Serviços (para empresas)**: 6 cartões com ícone, título e uma frase de resultado: Landing page e site institucional · Cardápio digital com pedido no WhatsApp · Painel do dono / sistema sob medida · Atendente com IA · Portfólio para criativos · Cardápio e proposta em PDF. Brilho que segue o cursor e leve inclinação 3D. Abaixo: "Todo site inclui" (SEO, prévia no WhatsApp/Instagram, LGPD, guia "Como editar", publicação).
7. **Para recrutadores**: stack em grupos (Front-end, Back-end e integrações, Qualidade, Ferramentas e deploy), "O que eu levo para o time" e botões "Falar sobre uma vaga" e "Ver meu GitHub". **Sem linha do tempo** (ela evidenciava pouco tempo de experiência).
9. **Processo**: 01 Conversa e briefing → 02 Identidade visual → 03 Desenvolvimento → 04 Conferência → 05 Publicação e guia. Condições em pílulas (contrato, 50% + 50%, 1–2 semanas, hospedagem do cliente, 8h–20h). **FAQ** em sanfona acessível (`<details>`).
10. **Contato**: título gigante "Vamos construir algo que funcione.", seletor de público, formulário curto que monta a mensagem e abre o WhatsApp (ou e-mail). Canais vêm de um arquivo de configuração (WhatsApp **(48) 99617-0281**); **canal vazio = botão escondido**, nunca link quebrado.
   **Botão flutuante do WhatsApp** (canto inferior direito, com pulso) que abre a conversa com a mensagem "Olá, Carlos! Vim pelo seu site e quero conversar."; aparece depois do topo e some sobre o portfólio e o contato para não cobrir botões.
12. **Fundo vivo em todo o site**: manchas de luz carmim que flutuam devagar (CSS) e brasas que sobem num `<canvas>` fixo, acelerando com a rolagem; seções transparentes para o fundo aparecer. Desligado com movimento reduzido.
11. **Rodapé**: nome gigante em contorno, links, "voltar ao topo", ano automático e "Feito à mão com HTML, CSS, JavaScript e GSAP".

## 6. Portfólio 3D giratório (o "diferente")

- **Dois modos (via `gsap.matchMedia`)**: no computador com mouse, a seção fica fixada e **a rolagem gira o anel** (também arrastando com o mouse ou deslizando dois dedos no trackpad); **em telas de toque (celular, tablet) não há fixação**: a página rola normal e o anel **gira deslizando para os lados**, com inércia limitada a um projeto por gesto rápido, volta infinita (do 08 para o 01) e toque num cartão lateral para girar até ele. Gesto vertical sobre o anel continua rolando a página.
- Modo rolagem: seção fixada durante ~3 alturas de tela. **A rolagem gira um anel 3D** com os 8 projetos (cartões em `rotateY(i·360/n) translateZ(r)`), raio calculado pela largura do cartão: `r = (w/2) / tan(π/n) + folga`.
- O cartão da frente fica nítido e em escala 1; os de trás escurecem (opacidade calculada pelo cosseno do ângulo).
- Painel de detalhes atualiza com o projeto ativo: número `01 / 08`, nome, tipo, descrição de uma frase, chips da stack, **"Ver ao vivo ↗"** e **"Código ↗"**.
- **Uma única fonte de verdade:** o ângulo vem sempre da posição da rolagem. Setas, teclado (← →), clique num cartão lateral e arrastar com o mouse/dedo apenas **rolam a página** até a posição daquele projeto — assim o pin nunca dessincroniza.
- Cada cartão mostra a captura real do site numa moldura de navegador, em 960 e 1600 px (`srcset`, capturadas em 2×), nítida em telas Full HD e Retina.
- Barra de progresso + contador. Fundo de reserva com o nome do projeto se a imagem falhar.
- **Movimento reduzido ou sem JS:** vira uma grade normal de cartões, sem pin.

Projetos (todos públicos no GitHub, com URL ao vivo):

| # | Projeto | Tipo | Stack | Destaque |
|---|---|---|---|---|
| 01 | Figaro's Pizzaria 2.0 | Delivery com checkout | HTML, CSS, JS, Node.js, testes | 57 sabores, CEP, taxa por bairro, troco, pedido pronto no WhatsApp, visual "Futurismo Quente" |
| 02 | São Cristóvão Burger 3.0 | Cardápio com IA | React 19, TypeScript, Vite, Tailwind, Gemini | hambúrguer que "explode" em camadas na rolagem e atendente com IA com contingência |
| 03 | Smartech 3.0 | Showroom 3D industrial | JavaScript, WebGL 3D, IA | raio-X e corte das coifas, calculadora NBR 14518, consultor técnico com IA |
| 04 | Ingrid Lima | Portfólio de criativa | JavaScript, WebGL | olho interativo que segue o mouse e mergulha na câmera |
| 05 | CJR Gastronomia 3.0 | Orçamento de eventos | HTML, CSS, JS | gaveta "Meu orçamento" com pedido numerado e protocolo; LGPD completa |
| 06 | Chef Carlos Jr · Ceia de Natal | Encomendas | Vite, TypeScript | adicionais somando ao vivo, pagamento 50/50, mensagem à prova de fraude |
| 07 | Painel da Vida | Aplicação React | React 19, TypeScript, Tailwind 4, Zustand, Recharts | painéis e gráficos com dados salvos no navegador |
| 08 | Casa 6×32 | Projeto 3D navegável | Three.js | sobrado 3D com modo leve automático no celular |

## 7. Tratamento das fotos

- **Hero no computador (Full HD):** a imagem de referência completa (1024 px) → limpar menu, logo, textos com erro **e as letras do CARLOS** (preenchidas com o próprio fundo) → ampliar 4× com IA no PC (Swin2SR, em blocos com sobreposição) → recortar dentro da moldura, prolongar o degradê para baixo (média de uma faixa acima da borda, fusão das últimas linhas e escurecimento suave até a cor da moldura) e exportar o fundo em 2560 e 1440 px (WebP < 80 KB). A pessoa sai da mesma ampliação, com fundo removido localmente, numa camada separada (1400 e 800 px).
- **Hero no celular:** retrato de perfil, de óculos, em contraluz laranja (a própria imagem de referência editada com o rosto do Carlos) → recortar a pessoa, remover o fundo localmente (WebP com transparência), limpar resíduos das letras do fundo e reforçar o brilho de contorno via `drop-shadow`. Duas larguras (`srcset`), < 60 KB cada.
- **Cartão do hero:** o mesmo retrato, cabeça e ombros, sobre quadrado laranja em gradiente (como a miniatura do Kontour).
- Todas as imagens com `width`/`height` definidos (sem CLS), `alt` descritivo e `decoding="async"`.

## 8. Stack técnica e estrutura

- **HTML, CSS e JavaScript puros (módulos ES), sem etapa de build** → publica direto no GitHub Pages.
- **GSAP 3 + ScrollTrigger** e **Lenis** (rolagem suave) servidos pelo próprio site em `assets/vendor/` (nada de CDN: mais rápido e compatível com CSP estrita).
- Integração obrigatória Lenis ↔ ScrollTrigger: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`.
- Conteúdo editável (contatos, disponibilidade, projetos) num único `assets/js/config.js`. O HTML traz o conteúdo principal escrito (SEO e sem-JS); o JS só enriquece.
- Lógica pura (montagem da mensagem, validação, matemática do anel) em `assets/js/lib/` com testes em `tests/` usando o executor nativo do Node (`node --test`), sem dependências.
- Arquivos: `index.html`, `404.html`, `assets/css/*`, `assets/js/{boot,config,main}.js`, `assets/js/modules/*`, `assets/js/lib/*`, `assets/fonts/*`, `assets/img/*`, `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `.nojekyll`, `README.md`.

## 9. SEO, compartilhamento, acessibilidade, LGPD e segurança

- `<title>` "Carlos Serra · Desenvolvedor Full Stack Júnior em Palhoça/SC", meta description com os dois públicos, `canonical`, Open Graph + Twitter Card com imagem 1200×630, `theme-color`, JSON-LD `Person` (jobTitle, address, alumniOf, sameAs, knowsAbout).
- Um único `h1`, hierarquia correta, `lang="pt-BR"`, link "Pular para o conteúdo", foco visível em `--red`, navegação completa por teclado, `aria-live` no painel do portfólio, textos alternativos reais.
- `prefers-reduced-motion: reduce` desliga pré-carregador, rolagem suave, pin, paralaxe, cursor e letreiros (mantém só transições de opacidade).
- Cursor personalizado só em ponteiro fino (`pointer: fine`); botões magnéticos idem.
- Formulário: nada é salvo nem enviado a servidor; o texto é limitado, limpo e codificado (`encodeURIComponent`) antes de abrir o WhatsApp/e-mail. Aviso curto de privacidade junto ao botão.
- CSP por `<meta>`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`. Proibido estilo e script inline no HTML (o GSAP altera estilos via CSSOM, o que a CSP permite).
- Links externos com `target="_blank" rel="noopener noreferrer"`.

## 10. Orçamento de performance

- LCP < 2,5 s em 4G (pré-carregar o retrato e as duas fontes principais), CLS < 0,05, JS próprio < 40 KB, primeira dobra < 900 KB.
- Animações só com `transform` e `opacity`; nada de ouvir `scroll` direto (tudo via ScrollTrigger/Lenis).
- Pausar letreiros e o selo fora da tela; desligar efeitos de mouse no toque.

## 11. Bugs conhecidos que você precisa evitar

1. **Pin pulando:** chame `ScrollTrigger.refresh()` depois de `document.fonts.ready` e do `load`; use `invalidateOnRefresh` e funções para valores dependentes do tamanho.
2. **Barra do navegador no celular redimensionando tudo:** `ScrollTrigger.config({ ignoreMobileResize: true })` e unidades `svh` com fallback em `vh`.
3. **Rolagem horizontal fantasma** por texto gigante/letreiro: `overflow-x: clip` nas seções (não `hidden` no `body`, que quebra `position: sticky`).
4. **Âncoras com Lenis:** interceptar `a[href^="#"]` e usar `lenis.scrollTo(alvo, { offset })`; com movimento reduzido, rolagem nativa + `scroll-padding-top`.
5. **Menu mobile:** travar a rolagem, devolver o foco ao botão ao fechar, fechar ao clicar num link e ao passar para desktop.
6. **Pré-carregador eterno:** trava de segurança; o conteúdo é visível sem JS.
7. **Anel 3D desalinhado:** ângulo sempre derivado da rolagem; índice ativo com módulo correto para valores negativos; recalcular raio no `resize`.
8. **Cursor preso** ao sair da janela: esconder em `mouseleave` e mostrar em `mouseenter`.
9. **Contadores repetindo:** animar uma vez.
10. **Canal de contato vazio:** esconder o botão/campo; se não houver nenhum canal, mostrar GitHub.
11. **Imagem que falhar:** fundo de reserva com o nome do projeto.
12. **CSP quebrando algo:** nada de `style="…"`, `onclick="…"` ou `<script>` inline.

## 12. Critérios de aceite (teste cada um)

- [ ] Abre sem erros no console em Chrome, Edge, Firefox e Safari (desktop e celular).
- [ ] Sem rolagem horizontal em 360 px, 768 px, 1280 px e 1920 px.
- [ ] Todas as âncoras levam à seção certa, abaixo do cabeçalho.
- [ ] O anel gira com a rolagem, setas, teclado, arrasto e clique, e o painel mostra o projeto da frente.
- [ ] Com movimento reduzido: sem pré-carregador, sem pin, tudo legível.
- [ ] Sem JavaScript: conteúdo, projetos e contato legíveis.
- [ ] Lighthouse ≥ 90 em Desempenho e 100 em Acessibilidade, Boas práticas e SEO.
- [ ] O formulário valida, monta a mensagem certa para cada público e abre o canal configurado.
- [ ] `npm test` passa.

## 13. Entregáveis

1. Site completo no repositório, pronto para o GitHub Pages.
2. `README.md` com "como editar" no formato *"Quero mudar X → mexo em Y"* e a lista "Confira antes de publicar".
3. `ANALISE.md` com a revisão final (abaixo).

## 14. Antes de entregar: análise obrigatória

Revise o resultado como um recrutador apressado (10 segundos), como um dono de pizzaria no celular e como um auditor de acessibilidade. Liste: o que quebra, o que confunde, o que pesa, o que falta para converter. Corrija tudo o que for bug ou barreira e registre as melhorias opcionais em `ANALISE.md`, por prioridade.
