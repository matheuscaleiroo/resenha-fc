# Resenha FC: decisões, acertos e erros

## Como rodar
Abrir `index.html` no navegador (duplo clique). Não tem build nem servidor. Teste das regras: `node test.js`.
ode.exe' test.js` (PowerShell). Atualizar elencos e escudos: `node tools/atualizar-elencos.js`.

## Arquivos
- `data.js`: elencos do G12, **gerado** pelo script (uma linha por jogador: `POS OVERALL Nome`). Dá pra editar à mão, mas rodar o script de novo sobrescreve.
- `tools/atualizar-elencos.js`: baixa o elenco atual e os escudos do Transfermarkt.
- `escudos/`: PNG de cada clube (`FLA.png`...).
- `logic.js`: regras puras (duplicados, força do time, simulação). Sem DOM, por isso dá pra testar no Node.
- `app.js`: telas e fluxo.
- `index.html`: layout e tema (tokens de cor no `:root`).

## Decisões (e o que me faria mudar)
1. **Todos no mesmo aparelho, passando de mão em mão.** Tela "Passe o aparelho para X" esconde a escolha dos outros. Não precisa de servidor.
   Mudaria se: o pessoal quiser jogar cada um no seu celular → aí entra servidor (salas com código, WebSocket).
2. **Formações**: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3 e 5-3-2, escolhidas no setup e **iguais pra todos**. Sempre 11 titulares + 1 reserva (índice 11). Ala no 3-5-2/3-4-3 conta como LAT. Posições continuam 5 (GOL/LAT/ZAG/MEI/ATA): volante e meia-atacante são MEI; pontas e centroavante são ATA.
   Mudaria se: quiserem formação diferente por jogador (a lógica já aceita, cada time tem seus `slots`), ou posições finas (LD/LE, VOL).
3. **Cada clube sai uma vez só na roleta** (12 rodadas = 12 clubes). Consequência: só dá pra repetir jogador escolhendo do mesmo clube na mesma rodada.
4. **Repetidos são revelados só no final** (confirmado pelo usuário) e saem de todos os times que os escolheram.
5. **Reserva cobre buraco**: se perdeu titular por repetição, a reserva entra (primeiro na mesma posição; senão no primeiro buraco, com −8 de overall). Posição vazia vale 35.
6. **Simulação**: gols por minuto com chance `1,3·exp((ataque − defesa − desnível)/10)`. Ataque = média de MEI+ATA; defesa = média de LAT+ZAG com o goleiro valendo em dobro. **Desnível** = diferença média entre ataque e defesa dos dois times. Sem descontar isso, o jogo dava 4,5 gols por jogo, porque o mercado paga mais por atacante e todo ataque ficava "melhor" que toda defesa (o 4×0 com OVR 76×74 que o usuário reclamou). Agora: 2,6 gols por jogo; favorito por 2 de OVR vence 49%; goleada de 3+ em ~12% (o que o Poisson dá naturalmente). Posição vazia vale 50 (antes 35). Medido com 3000 drafts reais × 10 jogos.
7. **2 jogadores = final** (empate vai pros pênaltis). **3 a 6 = pontos corridos** (todos contra todos), e o campeão é o líder da tabela.
8. **Escudos oficiais** (PNG do Transfermarkt, salvos em `escudos/`). Uso liberado pelo usuário porque é só entre amigos. **Se um dia for público, trocar.**
9. **Elencos = Transfermarkt, não Sofascore.** O Sofascore bloqueia acesso automático (HTTP 403 na API). O Transfermarkt traz o elenco atual com posição e valor de mercado.
10. **Overall é estimado**: `68 + 3,3·log2(valor em € mi)` + até +6 de bônus pra quem tem mais de 29 anos (o valor de mercado despenca com a idade). Ficam no jogo os melhores por posição: 2 GOL, 4 LAT, 4 ZAG, 6 MEI, 5 ATA (21 por clube). Lendas veteranas, que a fórmula subestima, vão em `AJUSTES` no script (hoje só Thiago Silva = 79, que a fórmula dava 71).
11. **Cores**: off-white `#F6F1E7` e bordô `#7A1F2E` (no escuro, bordô mais claro `#B23A4E` pra manter contraste). Tema segue o sistema, e o botão ◐ troca e lembra a escolha.
12. **Bots** (Fácil/Médio/Difícil/Impossível; o usuário falou "três modos" mas listou quatro, fiz os quatro). Humanos escolhem antes, bots depois. Nota do bot = (overall − k-ésimo melhor que ainda pode vir na posição, sendo k as vagas abertas) × peso da posição na força. Fácil: aleatório. Médio: ruído. Difícil: evita o craque óbvio. Impossível: vê a rodada e **sabota** (copia sua escolha quando ela vale bem mais que a opção dele).
    **Descoberta**: o draft quase não premia habilidade. Sem colisão, o bot e um "pega sempre o maior overall" montam times iguais (atq+def 160,1 × 160,5), e quem escolhe primeiro leva o craque. Por isso a dificuldade também vem de **bônus explícito na partida**, mostrado no placar: −1 / +1 / +3 / +6. Contra um humano que escolhe entre os 3 melhores, o bot vence ~11% / 37% / 58% / 80%.
    Mudaria se: o bônus parecer roubado demais. Aí reduzir em `BONUS_BOT`.
13. **Revelação**: tela de suspense, depois clube por clube em ordem aleatória (cartas viram uma a uma, repetidos levam carimbo), ou tudo de uma vez. Repetidos só são resolvidos no fim, na tela "Os times".
14. **Às cegas** esconde os overalls na escolha e no próprio time durante o draft; eles voltam na revelação. Bots enxergam os overalls mesmo assim.
15. **Turbo**: roleta de 1,2 s (normal 5 s), com menos cartas. Turbo e às cegas ficam salvos no navegador.
16. **Fora de posição**: chip com borda âmbar, "⚠ posição real" e o overall reduzido ao lado do original riscado.

## Verificado e como
- `node test.js`: repetido sai dos dois times, reserva cobre buraco com penalidade, mata-mata sempre tem vencedor, time 88 vence time 65.
- Calibragem (5000 jogos cada): 76×76 → 2,6 gols/jogo, 26% empates; 78×75 → favorito vence 56%; 80×74 → 75%.
- `node --check app.js` (só sintaxe) (antes das formações). Elencos gerados: 12 clubes, 21 jogadores cada, IDs do Transfermarkt conferidos pelo título da página (ex.: 614 → "CR Flamengo").

17. **Mobile = PWA no GitHub Pages**, não app da App Store (sem Mac/Xcode/US$ 99, abre por link, funciona offline). Detalhes e próximas fases em `PLANO-MOBILE.md`.
18. **Repositório público** (`matheuscaleiroo/resenha-fc`): o GitHub Pages grátis exige repo público. Isso deixa escudos e dados do Transfermarkt visíveis publicamente, um risco aceito porque é só pra brincar. Se incomodar: repo privado + outro host estático.
19. **Service worker busca na rede primeiro** (versão sempre nova com internet) e usa o cache offline. O nome do cache é fixo, então não há versão pra lembrar de atualizar.

## Verificado (sessão 4)
- Edge sem interface, com o jogo servido em `http://127.0.0.1`: o service worker instalou e baixou todos os arquivos do cache (index, scripts, manifest, 3 ícones, 12 escudos; conferido no log do servidor).
- Telas em 390 px (largura de iPhone) por capturas: o setup estourava a largura (corrigido; depois da correção ficou em 375 px, sem rolagem lateral).
- **Não testado:** modo avião de verdade, instalação no iPhone, notch e teclado.

## Verificado (sessão 3)
- `node test.js`: formações, repetidos, reserva, simulação, e um draft completo com os elencos reais em cada nível de bot (12 slots preenchidos, só sabota com titular, fácil < médio).
- Calibragem do placar e dos bots com scripts descartáveis (números acima).
- **Edge sem interface** (`msedge --headless --dump-dom`) rodou uma partida inteira chamando as funções do app: setup → 12 rodadas (1 humano + Impossível, 3-5-2, às cegas) → suspense → 12 clubes revelados → times → jogo com bônus → campeão. Sem erro de JS. Destaque de fora de posição testado à parte.
- **Não testado:** a animação da roleta (no teste eu sorteei direto, sem girar), as animações das cartas, a aparência no celular e o tema escuro.

## Erros desta sessão (e correção)
- Regex `(mi|mil)` lia "€ 750 mil" como 750 milhões, e metade dos elencos ficou com overall 90. Corrigido para `(mil|mi)`.
- O Transfermarkt escreve "Ponta-Direita" com hífen, e o mapa de posições não tinha isso, então os pontas foram descartados. Corrigido.
- `&nbsp;` aparecia em nomes. Corrigido.
- A seleção por posição usava o valor de mercado puro, e o Thiago Silva ficou fora do Fluminense. Agora a seleção usa o overall com o bônus. Mesmo assim ele continuava fora (fórmula = 71). Resolvido com `AJUSTES`.

## NÃO verificado
- **Não abri a interface no navegador.** Roleta, escudos, formações, tema escuro e layout no celular não foram vistos rodando.
- **O Node do sistema (v21.2.0) passou a quebrar na inicialização** (`Fatal error ... unreachable code` em `v8::Isolate::Initialize`), em qualquer pasta, até com `node -e 1`. Funcionava no começo da sessão. O binário não mudou (data de 2023) e `NODE_OPTIONS` está vazio. **Causa não encontrada; resolvido instalando o Node 24.20.0 LTS** (`winget install OpenJS.NodeJS.LTS --source winget ...`), e o `node test.js` voltou a passar. Antes disso, com o Node do Adobe (v24), `test.js` (com formações) passou, `--check app.js` passou e os elencos foram gerados de novo.
- Elencos refletem o Transfermarkt em 2026-10-15. **Não dá pra garantir 100%**: emprestados, lesionados e a própria precisão do site ficam de fora. Os overalls são estimativa.

## Riscos aceitos
- Empate total na tabela (pontos, saldo e gols) fica com quem aparece primeiro na ordenação.
- Pênaltis simplificados: 5 cobranças de cada lado com 75% de acerto, depois alternadas até alguém errar. Não encerra antes quando a disputa já está decidida.

## Próximos passos (sugestão)
1. Jogar uma partida de verdade e ajustar o que incomodar.
2. Revisar elencos/overalls.
3. Modo "escolha seus times do Brasileirão" (o menu já está pronto pra receber).
4. ~~Multiplayer online~~ — item 20 abaixo: só a base (semente) está pronta, falta tudo (Firebase, salas).

## Sessão 5: fora de posição virou matriz, reserva escolhe onde cobre, tática, confrontos/velocidade/formação

20. **Multiplayer online implementado** (decisão 1 revista): Firebase Realtime Database, projeto `repetime-c9d41` criado pela pessoa. Arquivos novos: `firebase-config.js` (chave pública do projeto — não é senha, quem protege é a regra do banco) e `online.js` (tudo do modo online). SDK carregado via CDN (`firebase-app-compat.js` + `firebase-database-compat.js`, versão 9.23.0) — sem build, igual ao resto do projeto.
    **Decisão central**: em vez de sincronizar o draft rodada a rodada pela rede, **cada pessoa faz o PRÓPRIO draft no PRÓPRIO aparelho**, do começo ao fim, na mesma sequência de 12 clubes (sorteada uma vez só, guardada na sala) — ninguém vê a escolha de ninguém até terminar, igual ao modo local, só que sem precisar passar o aparelho. Isso deixa o tráfego de rede mínimo: só o time final (12 IDs de jogador) é mandado pro Firebase, não cada clique.
    A simulação das partidas usa a semente da sala (`rngDe`, de `logic.js`) — todo aparelho calcula o MESMO resultado (mesmos gols, mesmos minutos) sem precisar sincronizar nada durante o jogo. **Testado de verdade**: dois processos de Chrome headless completamente separados (um cria a sala e faz o draft, o outro só lê a sala pronta no Firebase e recalcula do zero) chegaram ao resultado byte-a-byte idêntico (`TIMES=Bot Difícil:79,Ana:77` e `RESUMO=0x1=4-1` nos dois).
    **Simplificações assumidas**: (a) bots no online draftam tudo de uma vez, sem ver ninguém jogando — a sabotagem do Impossível não acontece online (não tem o que sabotar, já que ninguém joga "ao vivo" visível pra ele); o bônus de dificuldade na partida continua normal. (b) sem roleta animada no draft online — a rodada aparece direto ("Rodada 3/12: Flamengo escolhe!"), sem o giro; a roleta com animação continua só no modo local. (c) tática escolhida depois do draft completo e dos duplicados resolvidos (cada humano vê o PRÓPRIO time final antes de escolher — bots escolhem na hora com `taticaDoBot`), com uma segunda tela de espera antes das partidas. (d) sem reconexão: se a página recarregar no meio do próprio draft, o progresso local se perde (precisa recomeçar o draft daquele aparelho — o time só é salvo na sala quando termina as 12 rodadas).
    **Risco aceito**: código da sala (4 caracteres) é gerado sem checar se já existe — colisão sobrescreveria uma sala; com ~1 milhão de combinações e grupos de amigos, o risco é mínimo (mesma lógica de risco aceito da decisão 18).
    **Regras do banco**: por padrão, o "modo de teste" do Firebase libera leitura/escrita geral por 30 dias e depois tranca tudo. Troquei a recomendação pra uma regra permanente, restrita só ao caminho `/salas` (sem autenticação — é só pra brincar entre amigos, mesmo risco aceito da decisão 18). A pessoa precisa colar isso no console (Realtime Database → Regras): `{"rules": {"salas": {"$codigo": {".read": true, ".write": true}}, "$outros": {".read": false, ".write": false}}}`. Eu não tenho como mudar as regras por fora (precisaria de uma service account, que não foi compartilhada) — só testei com o modo de teste padrão, que ainda está valendo.
21. **Fora de posição**: a penalidade fixa de −8 (`FORA_DE_POSICAO`) virou uma **matriz por par de posições** (`PENALIDADE`, em `logic.js`): lateral virando zagueiro dói pouco (−4), qualquer um da linha de frente/meio no gol é desastre (−20 a −26). Também abriu espaço pro item 22.
    Essa troca quebrou o `app.js` por um tempo (ele ainda chamava a constante antiga, removida) — `ReferenceError` toda vez que alguém jogava fora de posição. Pego e corrigido antes de implementar o resto.
22. **Reserva: a pessoa escolhe o que ela cobre** (`reservaCobre` em cada time). Na tela de escolha, ao mandar um jogador pro banco, aparecem as posições que a formação tem, ordenadas da que dói menos pra que dói mais pro overall dele (`coberturas()`), com o overall resultante em cada uma. Se um titular repetir e abrir buraco nessa posição, é ela que a reserva cobre — não automaticamente a "mais parecida" como antes. Bots (`escolhaDoBot`) também escolhem isso: cobrem a própria posição se a formação tiver, senão a que dói menos.
23. **Tática, depois de ver o time montado** (`TATICAS` em `logic.js`, tela entre "Os times" e "Bola rolando"): ofensivo (+3 ataque/−3 defesa), neutro (0/0) ou defensivo (−3/+3), sempre saldo zero. Calibrado rodando ~8.000 jogos simulados (sem Node disponível na máquina nessa hora — usei Chrome headless `--dump-dom` com um harness descartável). Primeira tentativa foi ±4/−5 (sem saldo zero): ofensivo perdia de neutro mais do que ganhava (virava escolha ruim, não tática). Com ±3 e saldo zero: time igual ganha de time igual nas três táticas em ~37–42% cada (a diferença toda fica por conta do adversário, não da tática escolhida à toa), ofensivo×ofensivo sobe pra ~4,7 gols/jogo e defensivo×defensivo cai pra ~1,4 — e o azarão jogando defensivo some menos vezes nos pênaltis do que jogando ofensivo contra um favorito. Bots escolhem sozinhos comparando o próprio overall com a média dos adversários (`taticaDoBot`).
24. **Confrontos em ordem aleatória**: `telaJogos()` antes sempre jogava 0×1, 0×2, 0×3... Agora embaralha a lista de confrontos (mesma função `embaralhar` da revelação).
25. **Velocidade da partida escolhível** (`VELOCIDADES` em `app.js`, tela de setup): Lenta (180ms/minuto), Normal (90ms — era 70, ficou um pouco mais devagar) e Rápida (40ms). Fica salva no navegador como turbo/às cegas.
26. **Sortear formação**: botão "🎲 Sortear" ao lado das formações no setup, sorteia uma das 6 e aplica pra todos (a formação continua igual pra todos — decisão 2 não mudou, só ganhou um jeito rápido de escolher).

## Verificado (sessão 5)
- `node test.js`: testes novos pra `reservaCobre` (inclusive um cenário onde a escolha da pessoa vai contra o que o sistema escolheria sozinho, pra provar que é respeitada), `coberturas()`, saldo zero das táticas, RNG com semente (mesma semente = mesmo placar e mesmos minutos; sementes diferentes = sequências diferentes), `taticaDoBot`, e as funções puras do `online.js` (`gerarCodigo`, `meuId`, ida e volta de `serializarTime`/`jogadorPorId`/`timeDaSala`, `draftarBotOnline`).
- **Fluxo completo em Chrome headless** (`--dump-dom`, chamando as funções do `app.js` direto, sem a animação da roleta): 2 cenários — (1) 2 humanos + 2 bots (fácil e impossível), 3-5-2, 12 rodadas, um humano escolhendo o banco pela 2ª opção de cobertura, tática escolhida por todos, liga de 6 jogos até o campeão; (2) 2 humanos só, 4-4-2, mata-mata direto (testa a tela "passe o aparelho" tanto no draft quanto na tática) até a final com pênaltis. Os dois sem erro de JS e com todas as conferências passando.
- **Online, contra o Firebase real do projeto**: conectividade confirmada por REST (li, escrevi e apaguei um registro de teste). Depois, **dois processos de Chrome headless totalmente separados** — um criando a sala, adicionando um bot, fazendo o draft, escolhendo tática e avançando até "jogos"; o outro só lendo a sala pronta e recalculando tudo do zero, sem tocar em nada do primeiro — chegaram a resultados idênticos. Único jeito de rodar isso: `--headless=new` em segundo plano (sem `--dump-dom`/`--virtual-time-budget`, que não combinam com a conexão em tempo real do SDK — trava sem erro, fica "rodando…" pra sempre), lendo o resultado final pelo REST depois de um tempo real de espera.
- **Não testado**: a tela nova de tática e de escolha de cobertura da reserva *visualmente* (só por DOM/lógica, não vi a aparência). Layout no celular dessas telas novas. A animação do botão "🎲 Sortear". **O fluxo online com dois navegadores reais clicando na UI** (testei a lógica e a sincronização de dados, não a experiência de usar os botões/telas de sala, lobby e espera). Reconexão após recarregar a página no meio do próprio draft (não tem — ver decisão 20d). As regras definitivas do banco (ainda não coladas pela pessoa; testei com o modo de teste padrão do Firebase).

## Ambiente desta sessão
- Essa máquina **não tinha Node, git nem GitHub CLI**. Instalei o Node 24.20.0 LTS via `winget install OpenJS.NodeJS.LTS`. Cada chamada de terminal começa uma sessão nova do PowerShell (o PATH do instalador não "pega" sozinho); recarrego com `$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")` antes de usar `node`. Git e `gh` (GitHub CLI) ainda **não instalados** — a pasta também não é um repositório git (sem `.git`). Fica pra quando for publicar.
