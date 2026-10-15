# Plano: versão mobile (iPhone, só com link, offline)

**Caminho escolhido: PWA (site instalável), não app da App Store.** O Safari abre o link, você usa
"Adicionar à Tela de Início", e o jogo abre em tela cheia com ícone próprio e funcionando sem internet.
Não precisa de Mac, Xcode, conta de desenvolvedor da Apple (US$ 99/ano) nem revisão da loja.
Mudaria se: precisarmos de algo que o Safari não dá (notificação com o app fechado, vibração, Game Center).

## Fase 0: base offline (FEITO, falta testar no aparelho)
- [x] `manifest.webmanifest` (nome, cor bordô, tela cheia) + ícones 180/192/512.
- [x] `sw.js`: guarda todos os arquivos e escudos no primeiro acesso. Com internet busca a versão nova; sem internet usa o cache.
- [x] Área segura do iPhone: o cabeçalho bordô fica por baixo do relógio/notch e o conteúdo não fica sob a barrinha de baixo.
- [x] Bug: na tela de jogadores, os campos passavam da borda em 390 px (o grid crescia até 454 px). Corrigido.
- [x] Bug: na última rodada a roleta mostrava só 2 escudos. Agora sempre preenche a largura.
- [x] Publicado no GitHub Pages (https é obrigatório pro offline funcionar).

## Fase 1: teste no iPhone de verdade (você)
Coisas que eu não consigo verificar daqui:
- [ ] Instalar pela Tela de Início e abrir: aparece o ícone "R FC"? Abre sem a barra do Safari?
- [ ] **Modo avião** depois de abrir uma vez com internet: o jogo abre e uma partida inteira funciona?
- [ ] A roleta gira suave? (é animação CSS, deve ir bem)
- [ ] O teclado cobre o campo de nome na tela de jogadores?
- [ ] Tema escuro do iPhone e o botão ◐.
- [ ] O cabeçalho fica bem posicionado com o notch / Dynamic Island?

## Fase 2: experiência de celular (proposta, em ordem de prioridade)
1. **Salvar a partida em andamento.** O iOS fecha PWAs em segundo plano sem aviso; se alguém atender uma ligação no meio do draft, perde tudo. Salvar o estado a cada escolha (`localStorage`) e oferecer "Continuar partida" no menu. *Maior risco real.*
2. **Botão de confirmar no rodapé, fixo.** Hoje o "Escalar" aparece em cima da lista e, depois de rolar 21 jogadores, você precisa voltar pra cima. No celular a ação principal deve ficar no alcance do polegar.
3. **Filtro por posição** na escolha (GOL · LAT · ZAG · MEI · ATA) pra não rolar a lista inteira, e já esconder as posições que você não pode mais escalar.
4. **Nome curto no campo** (sobrenome ou apelido): na linha de 4–5 defensores os nomes cortam em 390 px.
5. **Tela não apaga** enquanto o aparelho passa de mão em mão (Wake Lock API; Safari 16.4+).
6. **Compartilhar o resultado** (placar + escalação) no grupo do WhatsApp pelo botão nativo de compartilhar (`navigator.share`).
7. `touch-action: manipulation` pra evitar zoom com dois toques nos botões.
8. Sons opcionais (tique da roleta, apito do gol), desligados por padrão.

Fora do plano por enquanto:
- **Cada um no seu celular**: precisa de servidor e internet, o que vai contra o "tudo offline". Se quiserem, vira um modo separado.
- **Vibração**: o Safari do iPhone não suporta `navigator.vibrate`.

## Limitações do iPhone pra saber
- Tem que instalar pelo **Safari** (outros navegadores no iOS usam o motor dele, mas o "Adicionar à Tela de Início" é mais confiável lá).
- Se você usar só pelo Safari sem instalar, o iOS pode apagar os dados do site depois de ~7 dias sem uso. Instalado na Tela de Início, isso não acontece.
- Atualização: o app pega a versão nova quando é aberto com internet. Se algo ficar estranho depois de uma atualização, fechar e abrir de novo.
