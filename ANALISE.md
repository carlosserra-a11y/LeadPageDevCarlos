# Análise final · prompt e landing page

Revisão feita antes de publicar, como pede a seção 14 do [PROMPT.md](PROMPT.md): olhando a página como um recrutador apressado, como um dono de pizzaria no celular e como um auditor de acessibilidade.

## 1. O que foi verificado

| Verificação | Como | Resultado |
|---|---|---|
| Lógica pura (mensagem, validação, anel 3D) | `npm test` (20 testes, Node) | 20/20 passando · 100% das linhas e 94% dos ramos de `assets/js/lib` |
| Desktop 1440 × 900 | navegador, seção por seção | hero, faixa, sobre, serviços, anel 3D, recrutadores, processo, FAQ, contato e rodapé ok |
| Celular 375 × 812 | navegador | sem rolagem horizontal; hero, anel e painel cabem na tela |
| Anel 3D | rolagem, botões, tecla End, arrasto com o mouse, âncora `#projetos` | gira, encaixa no projeto mais próximo e o painel acompanha |
| Movimento reduzido | Chrome automatizado com `prefers-reduced-motion` | sem pré-carregador, anel vira grade, nenhum bloco escondido, 0 erros |
| Sem JavaScript | Chrome automatizado com JS desligado | conteúdo, projetos e contato legíveis, 0 erros |
| Console e rede | três cenários acima | 0 erros, 0 requisições falhando |
| Formulário | contatos simulados | valida, mostra erros, monta a mensagem certa e codificada, alterna negócio/recrutador |
| Tempo até o conteúdo | Chrome automatizado | ~2,2 s com o pré-carregador completo (a entrada do hero começa por baixo da cortina) |
| Prévia de link | `assets/img/og.jpg` gerada do próprio hero | 1200 × 630 |

## 2. Bugs encontrados e corrigidos

1. **Âncoras paravam 88 px antes do destino.** O Lenis também aplica o `scroll-padding-top` do CSS, somando duas vezes. Agora o `scroll-padding` só vale quando o Lenis está desligado.
2. **A rolagem "travava" antes do contato.** O Lenis guardava a altura antiga da página; o portfólio fixado acrescenta ~3.800 px. Agora o Lenis remede a página a cada `refresh` do ScrollTrigger e antes de cada salto por âncora.
3. **Blocos invisíveis ao abrir por link direto** (ex.: `#recrutadores`). O `ScrollTrigger.batch` não disparava depois do salto. As revelações passaram a usar `IntersectionObserver`, que dispara também para o que já está na tela.
4. **Arrasto do anel não funcionava nas pontas** (no primeiro e no último projeto o ScrollTrigger não fica "ativo"). Trocado por uma checagem do intervalo de rolagem com tolerância.
5. **Pontos da linha do tempo não reacendiam ao voltar a rolagem.** Agora o estado vem da posição, nos dois sentidos.
6. **Retrato cobria quase todo o nome "CARLOS" e tinha bordas duras.** Resolvido de vez com o novo retrato de perfil (fiel à referência): "CAR" e "OS" ficam visíveis dos lados.
7. **Texto encostando no rosto em notebooks (901–1280 px).** Retrato deslocado e parágrafo mais estreito nessa faixa.
8. **Selo giratório colidia com os números em telas baixas e o texto se sobrepunha na emenda.** O selo entrou no fluxo da coluna direita, o texto foi ajustado ao círculo (`textLength`) e ele some em telas com menos de 760 px de altura.
9. **Pré-carregador demorado.** Encurtado; a entrada do hero começa enquanto a cortina sobe.
10. **Celular: retrato aparecia acima do texto.** Ordem corrigida.
11. **Celular: painel do portfólio mais largo que a tela.** A grade fixada agora usa `minmax(0, 1fr)` e os botões quebram linha.
12. **Celular: o nome sumia atrás do retrato.** No celular ele sobe para a altura do rosto e aparece dos dois lados.
13. **Celular: a paralaxe esmaecia a coluna de destaques justo quando ela entrava na tela.** Efeitos separados por tamanho de tela com `gsap.matchMedia`.
14. **O texto do cartão sumia por um instante na troca automática.** Agora é um cruzamento suave.
15. **A revelação dos cartões de serviço cancelava a inclinação 3D** (`overwrite: true`). Trocado por `overwrite: 'auto'`.
16. **6º cartão de serviço sozinho numa linha.** Grade "bento" de 12 colunas (2 grandes + 4).
17. **Nome do rodapé estourando a largura.** Tamanho recalculado.
18. **Leitores de tela ignoravam o rótulo do carrossel.** O palco ganhou `role="group"` e `aria-roledescription="carrossel"`.

## 3. Análise do prompt

**Pontos fortes:** objetivo duplo claro (vaga + clientes), fatos reais do Carlos (sem números inventados), tokens de cor com contraste conferido, especificação detalhada do portfólio em anel com "uma única fonte de verdade" (a rolagem), lista de bugs conhecidos e critérios de aceite testáveis.

**O que mudou durante a construção (e já está no prompt):**
- O hero passou a seguir a referência Kontour à risca, com o retrato de perfil em contraluz que você enviou.
- Foram acrescentadas as armadilhas reais encontradas (Lenis com `scroll-padding`, limite do Lenis depois do pin, `batch` após salto por âncora).

**Lacunas que só você pode preencher:** WhatsApp, e-mail e LinkedIn; confirmação da data de disponibilidade; depoimentos e números reais de clientes.

## 4. Melhorias recomendadas

### Alta prioridade (antes de mandar o link)
1. **Preencher os contatos** em `assets/js/config.js`. Sem WhatsApp/e-mail o formulário fica oculto e o site perde a principal conversão. A página antiga (`leadpagecarlos`) já publica o seu WhatsApp e e-mail; se quiser os mesmos, é só colar.
2. **Ativar o GitHub Pages** (Settings → Pages → `main` / raiz).
3. **Currículo em PDF** com botão "Baixar currículo" na seção de recrutadores: é a primeira coisa que o RH pede.
4. **LinkedIn** com o mesmo título e a mesma foto, e o link dele no `config.js`.
5. **Retrato em alta resolução.** A imagem do hero veio de um print com 1024 px de largura; em telas de alta densidade fica um pouco suave. Se você tiver o arquivo original da edição, mande que eu troco.
6. **Confirmar "junho de 2027".** Se você pode começar antes, "Disponível agora" converte mais.

### Média prioridade (aumentam conversão)
7. **Depoimentos reais** (Figaro's, CJR, Ingrid…) com autorização: prova social é o gatilho mais forte para dono de negócio.
8. **Estudos de caso** de 2 ou 3 projetos (problema → solução → resultado), com números reais (pedidos pelo WhatsApp, tempo de carregamento).
9. **Domínio próprio** (ex.: `carlosserra.dev`) e e-mail profissional.
10. **Métrica de cliques no WhatsApp** com uma ferramenta de análise sem cookies (Plausible/Umami), respeitando a LGPD.
11. **Versão em inglês** para vagas remotas internacionais.
12. **Faixa de preço "a partir de"** para filtrar curiosos (decisão comercial sua).

### Ideias para depois
13. Vídeo curto (1 min) apresentando o portfólio.
14. Abrir a prévia ao vivo do projeto dentro do anel (iframe sob demanda).
15. Modo claro opcional.
16. Pré-carregador só na primeira visita (guardar a visita no navegador).

## 5. Critérios de aceite

- [x] Sem erros no console (Chrome; testes automatizados e manuais)
- [x] Sem rolagem horizontal em 375 px e 1440 px
- [x] Âncoras chegam à seção certa
- [x] Anel gira com rolagem, botões, teclado, arrasto e clique; o painel acompanha
- [x] Movimento reduzido: sem pré-carregador, sem pin, tudo legível
- [x] Sem JavaScript: conteúdo legível
- [x] Formulário valida e monta a mensagem certa para cada público
- [x] `npm test` passa
- [ ] Testar em Safari (iPhone) e Firefox depois de publicar
- [ ] Lighthouse no endereço publicado (meta: ≥ 90 em desempenho, 100 nos demais)
