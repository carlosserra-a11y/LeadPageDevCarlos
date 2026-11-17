# Análise final · prompt e landing page

Revisão feita antes de publicar, como pede a seção 14 do [PROMPT.md](PROMPT.md): olhando a página como um recrutador apressado, como um dono de pizzaria no celular e como um auditor de acessibilidade.

## 1. O que foi verificado

| Verificação | Como | Resultado |
|---|---|---|
| Lógica pura (mensagem, orçamento, validação, anel 3D) | `npm test` (27 testes, Node) | 27/27 passando · 100% das linhas e 94% dos ramos de `assets/js/lib` |
| Desktop 1440 × 900 e Full HD 1920 × 1080 | navegador, seção por seção | hero, anel 3D, faixa, sobre, serviços, recrutadores, processo, FAQ, contato e rodapé ok |
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
5. **Pontos da linha do tempo não reacendiam ao voltar a rolagem.** Corrigido (depois a linha do tempo foi removida a pedido).
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

### Hero com a imagem completa (pedido seguinte)
19. **A imagem trazia o logo de outra marca ("KONTOUR STUDIOS") e links que não existem no site.** A faixa do menu foi apagada da arte e o menu real fica por cima.
20. **Textos da imagem com erros gerados pela IA** ("facedes", "usuaно", "gamblarras", "cddigo"). Apagados e reescritos por cima, corrigidos, na mesma posição.
21. **Botões da imagem não clicavam.** Áreas clicáveis alinhadas aos botões, à foto e às setas (as setas trocam os destaques de verdade), com foco visível pelo teclado.
22. **Arte ilegível no celular.** Abaixo de 901 px entra o hero em HTML feito a partir da mesma imagem; o celular nem baixa a arte grande (`<picture>` com fonte vazia).
23. **Limpeza da arte criou faixas verticais acima das setas do cartão.** A área passou a ser preenchida só com a cor de cima (fundo liso).

### Pedido seguinte: celular, WhatsApp e animações
24. **No celular o portfólio "travava"**: era preciso rolar várias telas para baixo para girar o anel. Em telas de toque o anel não fica mais preso à rolagem: gira deslizando para os lados (testado com toque real: arrasto avança 1, gesto vertical rola a página, o anel dá a volta).
25. **Gesto rápido pulava 3 projetos** (inércia sem limite). Agora o arrasto decide quantos andar e um gesto curto e rápido anda só 1.
26. **Toques rápidos em "anterior/próximo" se perdiam** (cada toque partia do projeto ainda na tela). Agora se acumulam a partir do último destino pedido.
27. **Trackpad horizontal não girava o anel no computador.** Deslizar dois dedos para os lados agora gira.
28. **Botão flutuante cobriria as setas do portfólio e o botão do formulário.** Ele some enquanto essas seções ocupam a tela.
29. Fotos pessoais do "Sobre" e a linha do tempo removidas a pedido; textos sem datas que reduzem a experiência.

### Pedido seguinte: hero em Full HD, nome inteiro e projetos logo depois do hero
30. **Hero borrado em telas grandes** (a arte veio de um print de 1024 px). O fundo foi ampliado 4× com IA no próprio PC (Swin2SR) e exportado em 2560 px; a pessoa foi para uma camada própria, recortada da mesma ampliação.
31. **Letras do "CARLOS" serrilhadas e cortadas embaixo.** As letras foram apagadas da imagem e o nome voltou como **texto vetorial** (SVG, Montserrat), inteiro e nítido em qualquer resolução.
32. **Degradê terminava seco na base do hero.** A imagem foi prolongada para baixo e o degradê continua até o fim da moldura.
33. **Emenda escura na extensão.** A última linha da ampliação vem escura; a extensão passou a partir da média de uma faixa acima da borda, com as últimas linhas fundidas, sem linha visível.
34. **Celular: o "S" do CARLOS passava da borda da moldura** (o nome tinha 103% da largura). Fonte recalculada para 18% da largura útil: o nome cabe inteiro, com folga, de 320 a 900 px.
35. **Capturas dos projetos suaves em telas Retina/Full HD.** Recapturadas em 2× e servidas em 960 e 1600 px (`srcset`).
36. **Projetos ficavam no meio da página.** O portfólio subiu para logo depois do hero (menu e numeração das seções acompanharam).
37. **Hero com mais vida:** entrada em sequência por camadas, brilho que percorre o nome, luz que respira atrás da pessoa e profundidade com o mouse por camada (sem mexer na imagem nem no fundo).

### Pedido seguinte: frase nova, foto, serviços, recrutadores e orçamento
38. **Frase do hero trocada** por "Código que vira cliente." com a palavra final girando (pedido, venda, resultado). A frase antiga foi apagada da imagem por difusão (sem riscos) e a nova entra como texto nítido.
39. **Foto do cartão trocada** pela foto de terno, com fundo removido no PC e posta sobre o laranja do site (no celular e por cima da arte no computador).
40. **Serviços viraram vitrine**: lista numerada que abre um por vez com projeto real, "Você recebe", prazo e botão que já marca o serviço no orçamento.
41. **Recrutadores logo depois dos projetos**, com destaque "Especialista em Claude Code".
42. **Frase "Bonito é bom…" removida** do Sobre.
43. **Formulário confuso** (campos soltos, mensagem obrigatória): virou orçamento em 4 etapas com cartões de escolha, validação por etapa e prévia da mensagem antes de enviar. Lógica nova coberta por testes (27 no total).
44. **Rótulo do topo quebrava em duas linhas no celular**: "Especialista em Claude Code" virou um selo.

### Pedido seguinte: revisão completa, intro, nitidez e contatos
45. **Portfólio "embaralhava" com a seção de baixo ao rolar** (barra de rolagem ou teclado fazem o navegador mover a página antes do script soltar o portfólio fixado). O portfólio fixado ganhou fundo sólido e fica por cima: a seção seguinte passa por baixo, sem misturar textos. Testado com roda do mouse, menu, rolagem rápida e redimensionamento.
46. **Letras borradas no hero em tela cheia**: rótulo, botões "Iniciar um projeto"/"Ver meus trabalhos", 100%/360° e setas do cartão eram parte da imagem. Foram apagados da arte (difusão, sem tocar na pessoa nem no fundo) e viraram texto e botões reais. A entrada do hero também passou a terminar em escala 1 (antes 1,02, que deixava o texto levemente suave).
47. **Claude Code**: saiu do topo do site (selo e cartão do hero) e da frase "Este site foi feito assim"; fica só na seção de recrutadores.
48. **Disponibilidade**: "junho de 2027" trocado por **início imediato** em todo o site (cartão, selo giratório, recrutadores, FAQ, rodapé, menu e metadados).
49. **Botão do WhatsApp** agora fica visível na página inteira; no celular o rodapé ganhou espaço para ele.
50. **E-mail e Instagram** ligados (botão "Enviar por e-mail" e canais no contato e no rodapé).
51. **Ícone da aba** trocado: era só "CS"; agora é a foto do Carlos sobre o laranja do site (aba, celular e app).
52. **Abertura nova**: terminal digitando, nome que decodifica, contador e anel que abre o hero. A abertura completa dura ~3 s (antes ~2,3 s).
53. **Varredura automática** em 9 larguras (320 a 1920 px): sem rolagem lateral, sem erros no console, sem imagens faltando, sem âncoras quebradas, sem ids repetidos.

### Pedido seguinte: números reais, pacotes, currículo, Google e ícone
54. **Números genéricos** (100% e 360°) trocados por dados reais: **30+ sites feitos** e **5 no ar com clientes usando**.
55. **Pacotes a partir de R$ 500**, com **30 dias de garantia** e **demonstração ao vivo**, também no processo, nas condições e no FAQ ("E se der algum problema depois da entrega?").
56. **Currículo novo** (Full Stack Júnior, especialista em Claude Code, números reais, disponível já), em PDF de 1 página com botão de download.
57. **Google Analytics 4 com consentimento (LGPD)**: nada carrega sem o ID no `config.js`; com ID, aparece o aviso e o Analytics só liga depois do "Aceitar". Eventos: WhatsApp, e-mail, Instagram, currículo, pacotes, serviços, orçamento enviado e avaliação. A CSP libera só os domínios do Google.
58. **Avaliações no Google**: bloco "Já fez um site comigo?" e link no rodapé, que aparecem quando o link do Perfil da Empresa for colocado no `config.js`.
59. **Ícone** trocado pelo perfil de óculos com o brilho laranja do site; endereços com `?v=3` para o navegador não mostrar o "CS" antigo guardado em cache.
60. Testes: 31 unitários (pacote no orçamento e regras do Analytics com testes escritos antes do código).

## 3. Análise do prompt

**Pontos fortes:** objetivo duplo claro (vaga + clientes), fatos reais do Carlos (sem números inventados), tokens de cor com contraste conferido, especificação detalhada do portfólio em anel com "uma única fonte de verdade" (a rolagem), lista de bugs conhecidos e critérios de aceite testáveis.

**O que mudou durante a construção (e já está no prompt):**
- O hero passou a seguir a referência Kontour à risca, com o retrato de perfil em contraluz que você enviou, e depois virou uma versão Full HD em camadas (fundo ampliado com IA, nome vetorial, pessoa recortada).
- Foram acrescentadas as armadilhas reais encontradas (Lenis com `scroll-padding`, limite do Lenis depois do pin, `batch` após salto por âncora).

**Lacunas que só você pode preencher:** WhatsApp, e-mail e LinkedIn; confirmação da data de disponibilidade; depoimentos e números reais de clientes.

## 4. Melhorias recomendadas

### Alta prioridade (antes de mandar o link)
1. ~~Preencher o WhatsApp~~ — feito: (48) 99617-0281, com botão flutuante. Falta só o e-mail (opcional).
2. ~~Ativar o GitHub Pages~~ — feito: publicado pela branch `gh-pages` em https://carlosserra-a11y.github.io/LeadPageDevCarlos/.
3. **Currículo em PDF** com botão "Baixar currículo" na seção de recrutadores: é a primeira coisa que o RH pede.
4. **LinkedIn** com o mesmo título e a mesma foto, e o link dele no `config.js`.
5. ~~Arte em alta resolução~~ — feito: fundo ampliado 4× com IA (2560 px), nome vetorial e pessoa em camada própria. Se um dia tiver o arquivo original da edição, dá para trocar o fundo sem mexer no resto.
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
- [x] Sem rolagem horizontal de 320 a 1920 px (9 larguras testadas)
- [x] Nome "CARLOS" inteiro no computador e no celular (320–900 px)
- [x] Âncoras chegam à seção certa
- [x] Anel gira com rolagem, botões, teclado, arrasto e clique; o painel acompanha
- [x] Movimento reduzido: sem pré-carregador, sem pin, tudo legível
- [x] Sem JavaScript: conteúdo legível
- [x] Formulário valida e monta a mensagem certa para cada público
- [x] `npm test` passa
- [ ] Testar em Safari (iPhone) e Firefox depois de publicar
- [ ] Lighthouse no endereço publicado (meta: ≥ 90 em desempenho, 100 nos demais)
