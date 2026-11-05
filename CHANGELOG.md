# Changelog

Resumo do que mudou em cada versão, pra quem joga (não é o histórico técnico — isso fica no `DECISOES.md`).

## 1.6 — 2026-11-05
- **Conta** (só usuário e senha), no menu: guarda suas moedas e te coloca no ranking. Continua dando pra jogar sem conta.
- **Moedas**: em campeonato com 3 ou mais times, a colocação paga: 1º 10, 2º 5, 3º 4, 4º 3, 5º 2 e 6º 1 (se fez pelo menos 1 ponto). **🪙 Moedas** no local, só quando é você sozinho contra 2 ou mais bots (com mais gente no mesmo aparelho não vale). **💎 Diamantes** no online. São duas moedas separadas porque no futuro vão valer coisas diferentes.
- **Ranking do online**, público: jogadores com mais vitórias (e títulos), jogadores de futebol mais escolhidos e artilheiros. Só conta o online.
- **Reserva mais simples na tática**: com o time completo, o reserva só pode trocar com o titular da mesma posição. Se abriu buraco (repetido), ele só pode entrar num buraco, sem tirar ninguém que está na posição certa. Cada opção mostra quanto ele perde ali.
- **Às cegas de verdade**: com a opção ligada, o overall não aparece mais na revelação, nos times, na tática nem nos jogos. Do reserva aparece só quanto ele perde em cada posição.

## 1.5.2 — 2026-11-05
- **Elencos completos**: todos os jogadores de cada clube estão no jogo, nos 12 do G12 e nos 6 do Big Six (de 24 a 40 por clube, antes eram 21). Voltaram nomes como Hulk, Germán Cano, Ganso, Soteldo, Maguire, Merino, Rico Lewis, Maddison e Richarlison. Elencos atualizados do Transfermarkt (novembro de 2026).
- Correção: o Alisson do Fluminense ganhava o overall do Alisson do Liverpool (o ajuste manual era só pelo nome). Agora cada ajuste vale só para o clube certo.
- O Botafogo tem dois Danilo: o atacante aparece como **Danilo (ATA)**.
- **Bot Fácil** continua escolhendo no chute, mas só entre os 21 melhores do clube, pra não ficar fraco demais com os garotos da base. O equilíbrio foi conferido em milhares de partidas simuladas e ficou igual ao da 1.5.1.

## 1.5.1 — 2026-11-05
- **Confirmar a escolha sem rolar a tela**: ao tocar num jogador, os botões "Escalar" / "pro banco" aparecem grudados no pé da tela. Antes ficavam lá em cima e, no celular, era preciso subir a lista inteira.
- **Correção: sala online**: quem cria a sala agora vê na sala de espera, na hora, cada amigo que entra. Antes só aparecia quem já estava lá quando o anfitrião abriu a tela.
- **Versões antigas nas novidades**: botão "📜 Versões antigas" mostra tudo que já mudou no jogo, desde a 1.2.

## 1.5.0 — 2026-10-22
- **Modo novo: Big Six**. Os 6 grandes da Inglaterra (Arsenal, Manchester City, Manchester United, Chelsea, Tottenham e Liverpool). Mesmo esquema do G12, mas são 6 rodadas e em cada uma você escolhe **2 jogadores** do clube sorteado. Repetiu? Ninguém leva, igual.
- Funciona no **local** (com bots) e no **online**: quem cria a sala define o modo, e quem entra pelo código já cai no modo certo.
- **Elencos atuais do Transfermarkt** (outubro de 2026). A Premier tem uma régua de overall própria: os valores de mercado lá são muito mais altos e parecidos entre si, e com a régua do Brasil quase todo mundo ficava entre 85 e 90. Promessa muito nova perde um pouco (o mercado paga pelo futuro), e alguns veteranos e goleiros de elite foram ajustados à mão (Van Dijk, Alisson, Donnarumma, Emiliano Martínez, Bruno Fernandes, Robertson).
- **Balanceado com milhares de partidas simuladas**: contra os bots o Big Six fica igual ao G12, e entre amigos a diferença entre o melhor e o pior time, os gols por jogo e as zebras também. Pra isso, posição vazia (repetido sem reserva) no Big Six vale 59 em vez de 50, pra doer o mesmo tanto que no G12.
- **Bandeiras** no menu: a do Brasil no G12 e a da Inglaterra no Big Six.

## 1.4.3 — 2026-10-22
- **Novidades mostram a 1.4 inteira**: a janela de novidades agora lista todas as atualizações da 1.4 (1.4, 1.4.1, 1.4.2, 1.4.3), da mais nova pra mais antiga, em vez de só a última.
- **Menu com um modo só, o G12**: ao entrar nele, o jogo pergunta se vai ser **Local** (todo mundo no mesmo aparelho, com bots) ou **Online** (cada um no seu). O botão Online saiu do menu principal.

## 1.4.2 — 2026-10-22
- **Visual 16-bit no jogo todo**: o gramado virou o fundo de todas as telas, cada tela abre numa janela com moldura de jogo antigo, e títulos e botões usam a fonte pixelada do menu.
- **Menu em tela cheia**, maior, e a logo sem a pincelada vermelha atrás do "FC".
- **Configurações (⚙)** no canto de cima: tema Dia (claro), Noite (escuro) ou o do aparelho, novidades da versão e voltar ao menu. A barra vermelha de cima saiu.
- **Versão no canto da tela** (toque nela pra ver estas novidades), e um atalho "Novidades" no menu.
- Tudo isso ajustado pro celular.

## 1.4.1 — 2026-10-22
- Correção: depois de uma atualização, o jogo podia continuar abrindo a versão antiga por até 10 minutos (o navegador reaproveitava os arquivos velhos). Agora a versão nova aparece assim que você recarrega.

## 1.4 — 2026-10-22
- **Menu novo**, com cara de jogo de futebol 16-bit (inspirado no International Superstar Soccer): gramado, logo com pincelada, placar no canto e as opções lado a lado no centro, com cursor ▶. Dá pra navegar com as setas do teclado e Enter.
- **Reserva escolhida depois da revelação**: no draft você só manda o jogador pro banco. Na tela da tática escolhe onde ele joga: num buraco que abriu por repetição, no lugar de um titular (que vai pro banco) ou fica no banco mesmo. Cada opção mostra o overall que ele teria ali — posição parecida perde pouco (lateral ↔ zagueiro, meia ↔ atacante), linha no gol é desastre. Vem pré-selecionado o buraco que dói menos; bots usam essa sugestão.
- **Correção: tática no modo online não selecionava** — clicar em Ofensivo/Defensivo redesenhava a tela e voltava pro Neutro, e era o Neutro que ia pra partida. Agora a escolha fica marcada (com selo "✓ escolhida") e é a que vale.

## 1.3.1 — 2026-10-15
- Jonathan Calleri e Luciano (São Paulo) entraram no elenco — o valor de mercado deles é baixo por conta da idade, mas os dois seguem titulares de referência. Ajuste manual, igual já era feito com o Thiago Silva.

## 1.3 — 2026-10-15
Modo online deixou de ser "cada um no seu tempo" e virou sincronizado, parecido com jogar no mesmo aparelho:
- **Sala de espera** antes do draft: todo mundo entra, o anfitrião vê quem chegou e só ele começa quando quiser.
- **Só o anfitrião decide** às cegas e velocidade (antes, cada um escolhia por conta, o que não fazia sentido numa sala compartilhada).
- **Roleta ao vivo pra todo mundo**: cada rodada sorteia o clube com a mesma animação pra todo mundo ver, não cada um descobrindo sozinho.
- **Revelação de verdade**: depois do draft, os clubes são revelados um por um (como no modo local) antes de ir pra tática — antes isso não existia no online.
- **Tática só depois da revelação**, com o time já definitivo (sem quem foi repetido).
- **Jogos um de cada vez**: o anfitrião libera o próximo jogo, todo mundo vê o mesmo placar ao mesmo tempo — antes cada aparelho assistia na própria velocidade, sem relação com os outros.
- **Artilheiros na tela final** (local e online): ranking de quem mais fez gol no campeonato.

## 1.2 — 2026-10-15
- Confrontos da liga saem em ordem aleatória (antes era sempre 0×1, 0×2...).
- Velocidade da partida escolhível (Lenta/Normal/Rápida), salva no navegador.
- Reserva: ao ir pro banco, escolhe qual posição ela cobre, vendo o overall de cada opção.
- Tática (Ofensivo/Neutro/Defensivo) escolhida depois de ver o time montado.
- Botão pra sortear a formação no setup.
- Modo online (salas por código, Firebase): nasceu nessa versão, cada um fazendo o próprio draft no próprio tempo.
- Correção: o código da sala não aparecia na tela ao criar (ia direto pro draft).
- Correção: às cegas e velocidade não valiam no modo online.
