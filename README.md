# Resenha FC

Draft às cegas, pra jogar com os amigos no mesmo aparelho (ou online, cada um no seu) ou contra bots. Dois modos:
- **G12**: os 12 grandes do Brasil. A roleta sorteia um clube por rodada e cada um escolhe **1** jogador dele.
- **Big Six**: Arsenal, Manchester City, Manchester United, Chelsea, Tottenham e Liverpool. 6 rodadas, e cada um escolhe **2** jogadores do clube sorteado.

Ninguém vê a escolha dos outros. Repetiu? Ninguém leva.
Depois escolhe a tática (ataque, neutro ou defesa) e os times se enfrentam numa partida simulada pelos overalls.

**Jogar:** https://matheuscaleiroo.github.io/resenha-fc/

## Jogar online (cada um no seu aparelho, sincronizado)
No menu, escolha **Online** → **Criar sala** (escolhe formação, às cegas e velocidade, e vira um código de 4 letras) e manda pros amigos, que escolhem **Entrar em sala** com esse código.
Todo mundo cai numa sala de espera; quem criou decide quando começar. Dali em diante é tudo junto: a roleta sorteia o clube ao vivo pra todo mundo, cada um escolhe seu jogador em segredo, e só passa pra próxima rodada quando todo mundo tiver escolhido. No fim do draft tem a revelação (clube por clube, igual ao modo local), depois a tática, e os jogos rolam um de cada vez — quem criou a sala libera o próximo.

## No iPhone (funciona offline)
1. Abra o link acima no **Safari** (precisa ser o Safari).
2. Toque em **Compartilhar** (quadrado com seta) → **Adicionar à Tela de Início**.
3. Abra pelo ícone uma vez com internet. Depois disso funciona no modo avião.

No Android: Chrome → menu ⋮ → **Instalar app**.

Atualizações chegam sozinhas quando você abre o app com internet.

## Rodar no computador
Dá pra abrir o `index.html` direto (duplo clique), mas aí o modo offline não liga.
Pra testar o offline: `python -m http.server` na pasta e abrir http://localhost:8000.

## Desenvolvimento
- `node test.js`: testa as regras (repetidos, reserva, simulação, bots).
- `node tools/atualizar-elencos.js [g12|big6]`: baixa elencos e escudos atuais do Transfermarkt e gera `data.js` (G12) e/ou `data-big6.js` (Big Six).
- `node tools/balanceamento.js [n]`: joga milhares de drafts e partidas sem tela e compara o balanceamento dos modos (vitória dos bots, gols, zebras, repetidos).
- Decisões, erros e o que não foi testado: [DECISOES.md](DECISOES.md). Plano mobile: [PLANO-MOBILE.md](PLANO-MOBILE.md).

Projeto de brincadeira entre amigos. Escudos e nomes pertencem aos clubes. Elencos e valores vêm do Transfermarkt, e os overalls são estimativa.
