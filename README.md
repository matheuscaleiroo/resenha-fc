# Resenha FC

Draft às cegas dos 12 grandes do Brasil, pra jogar com os amigos no mesmo aparelho (ou contra bots).
A roleta sorteia um clube, cada um escolhe um jogador sem ver o dos outros. Repetiu? Ninguém leva.
No fim os times se enfrentam numa partida simulada pelos overalls.

**Jogar:** https://matheuscaleiroo.github.io/resenha-fc/

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
- `node tools/atualizar-elencos.js`: baixa elencos e escudos atuais do Transfermarkt e gera `data.js`.
- Decisões, erros e o que não foi testado: [DECISOES.md](DECISOES.md). Plano mobile: [PLANO-MOBILE.md](PLANO-MOBILE.md).

Projeto de brincadeira entre amigos. Escudos e nomes pertencem aos clubes. Elencos e valores vêm do Transfermarkt, e os overalls são estimativa.
