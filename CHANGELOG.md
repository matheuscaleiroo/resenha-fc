# Changelog

Resumo do que mudou em cada versão, pra quem joga (não é o histórico técnico — isso fica no `DECISOES.md`).

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
