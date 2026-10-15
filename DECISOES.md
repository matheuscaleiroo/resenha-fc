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
4. Multiplayer online, se o mesmo aparelho não bastar.
