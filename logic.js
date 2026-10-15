// Regras puras do jogo (sem DOM) — testadas em test.js
// Formação = linhas do ataque pro gol. Slots = essas linhas achatadas + reserva (sempre no índice 11).
const FORMACOES = {
  '4-3-3': [['ATA', 'ATA', 'ATA'], ['MEI', 'MEI', 'MEI'], ['LAT', 'ZAG', 'ZAG', 'LAT'], ['GOL']],
  '4-4-2': [['ATA', 'ATA'], ['MEI', 'MEI', 'MEI', 'MEI'], ['LAT', 'ZAG', 'ZAG', 'LAT'], ['GOL']],
  '4-2-3-1': [['ATA'], ['MEI', 'MEI', 'MEI'], ['MEI', 'MEI'], ['LAT', 'ZAG', 'ZAG', 'LAT'], ['GOL']],
  '3-5-2': [['ATA', 'ATA'], ['LAT', 'MEI', 'MEI', 'MEI', 'LAT'], ['ZAG', 'ZAG', 'ZAG'], ['GOL']],
  '3-4-3': [['ATA', 'ATA', 'ATA'], ['LAT', 'MEI', 'MEI', 'LAT'], ['ZAG', 'ZAG', 'ZAG'], ['GOL']],
  '5-3-2': [['ATA', 'ATA'], ['MEI', 'MEI', 'MEI'], ['LAT', 'ZAG', 'ZAG', 'ZAG', 'LAT'], ['GOL']],
};
const RES = 11;
const VAZIO = 50;              // "overall" de uma posição sem ninguém (jogar com 10 dói, mas não é W.O.)
const FORA_DE_POSICAO = 8;     // penalidade da reserva jogando fora da posição
const SENSIBILIDADE = 10;      // ajuste fino: menor = overall pesa mais no placar
const PESO_GOL = { GOL: 0.02, LAT: 0.6, ZAG: 0.5, MEI: 2, ATA: 5 };

const novoTime = (nome, formacao) => {
  const slots = [...FORMACOES[formacao].flat(), 'RES'];
  return { nome, formacao, slots, escalacao: Array(slots.length).fill(null) };
};

const slotsLivres = (t, pos) =>
  t.slots.map((_, i) => i).filter(i => !t.escalacao[i] && (t.slots[i] === pos || i === RES));

const ovrEfetivo = (t, i) => {
  const j = t.escalacao[i];
  return i === RES || t.slots[i] === j.pos ? j.ovr : j.ovr - FORA_DE_POSICAO;
};

// Jogador escolhido por 2+ pessoas sai de todos os times; a reserva cobre um buraco.
function resolverDuplicados(times) {
  const quem = {};
  times.forEach(t => t.escalacao.forEach(j => j && (quem[j.id] ??= { jogador: j, times: [] }).times.push(t.nome)));
  const repetidos = Object.values(quem).filter(q => q.times.length > 1);
  const ids = new Set(repetidos.map(q => q.jogador.id));
  times.forEach(t => {
    t.escalacao = t.escalacao.map(j => (j && ids.has(j.id) ? null : j));
    const reserva = t.escalacao[RES];
    if (!reserva) return;
    const buracos = t.slots.map((_, i) => i).filter(i => i !== RES && !t.escalacao[i]);
    const buraco = buracos.find(i => t.slots[i] === reserva.pos) ?? buracos[0];
    if (buraco !== undefined) { t.escalacao[buraco] = reserva; t.escalacao[RES] = null; }
  });
  return repetidos;
}

function forca(t) {
  const media = a => a.reduce((x, y) => x + y, 0) / a.length;
  const v = i => (t.escalacao[i] ? ovrEfetivo(t, i) : VAZIO);
  const idx = pos => t.slots.map((p, i) => (pos.includes(p) && i !== RES ? i : -1)).filter(i => i >= 0);
  const goleiro = idx(['GOL']).map(v);
  return {
    geral: Math.round(media(idx(['GOL', 'LAT', 'ZAG', 'MEI', 'ATA']).map(v))),
    ataque: media(idx(['MEI', 'ATA']).map(v)),
    defesa: media([...goleiro, ...goleiro, ...idx(['LAT', 'ZAG']).map(v)]),
  };
}

function artilheiro(t, rng) {
  const c = t.escalacao.slice(0, RES).map((j, i) => j && [j, PESO_GOL[t.slots[i]]]).filter(Boolean);
  let r = rng() * c.reduce((s, [, p]) => s + p, 0);
  for (const [j, p] of c) if ((r -= p) <= 0) return j;
  return c.at(-1)?.[0];
}

function disputaPenaltis(rng) {
  const p = [0, 0];
  for (let k = 0; k < 5; k++) { p[0] += rng() < 0.75; p[1] += rng() < 0.75; }
  while (p[0] === p[1]) { p[0] += rng() < 0.75; p[1] += rng() < 0.75; }
  return p;
}

// Bot: nota = overall − melhor da posição em média nos clubes que ainda vão sair (vale mais pegar
// onde o clube é forte). fácil = aleatório; médio = com muito ruído; difícil = evita o craque óbvio
// (humano vai nele e os dois perdem); impossível = vê as escolhas da rodada:
// nunca repete sem querer e copia de propósito quando o seu jogador é bem melhor que a opção dele.
const SABOTAGEM = 0.5;         // impossível copia quando o seu jogador vale isso a mais (overall × peso)
// O draft tem pouco espaço pra habilidade (todos escolhem do mesmo clube), então a dificuldade também
// vem de um bônus explícito na partida, mostrado na tela.
const BONUS_BOT = { facil: -1, medio: 1, dificil: 3, impossivel: 6 };  // vs humano realista: bot vence ~11% / 37% / 58% / 80%
const NIVEIS = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil', impossivel: 'Impossível' };

function escolhaDoBot(t, clube, futuros, nivel, jaEscolhidos = [], rng = Math.random) {
  const opcoes = clube.jogadores.flatMap(j => slotsLivres(t, j.pos).map(i => ({ j, i })));
  if (nivel === 'facil') return opcoes[Math.floor(rng() * opcoes.length)];
  // referência: com k vagas abertas na posição, o k-ésimo melhor que ainda pode vir dos próximos clubes
  const vagas = pos => t.slots.filter((p, i) => p === pos && i !== RES && !t.escalacao[i]).length;
  const referencia = pos => futuros.map(c => Math.max(0, ...c.jogadores.filter(j => j.pos === pos).map(j => j.ovr)))
    .sort((a, b) => b - a)[vagas(pos) - 1] ?? 0;
  // peso de cada posição na força (forca(): ataque = média de MEI+ATA; defesa = média com goleiro em dobro)
  const nAtq = t.slots.filter(p => p === 'MEI' || p === 'ATA').length, nDef = t.slots.filter(p => p === 'LAT' || p === 'ZAG').length + 2;
  const peso = { GOL: 2 / nDef, LAT: 1 / nDef, ZAG: 1 / nDef, MEI: 1 / nAtq, ATA: 1 / nAtq };
  const craque = Math.max(...clube.jogadores.map(j => j.ovr));
  const ruido = { medio: 2, dificil: 0.2, impossivel: 0 }[nivel];
  const nota = ({ j, i }) => {
    if (nivel === 'impossivel' && jaEscolhidos.includes(j.id)) return -Infinity;
    let n = (j.ovr - referencia(j.pos)) * peso[j.pos];
    if (i === RES) n = n * 0.3 - 0.5;                     // banco só conta se alguém repetir
    if (nivel === 'dificil' && j.ovr === craque) n -= 0.6;
    return n + (rng() - 0.5) * 2 * ruido;
  };
  const notas = opcoes.map(nota);
  const melhor = opcoes[notas.indexOf(Math.max(...notas))];
  if (nivel !== 'impossivel') return melhor;
  // sabotagem: se alguém pegou um jogador bem melhor que a minha melhor opção, copio e ninguém leva
  const alvo = opcoes.filter(o => o.i !== RES && jaEscolhidos.includes(o.j.id))
    .sort((a, b) => b.j.ovr * peso[b.j.pos] - a.j.ovr * peso[a.j.pos])[0];
  const ganho = o => o.j.ovr * peso[o.j.pos];
  return alvo && ganho(alvo) - ganho(melhor) > SABOTAGEM ? alvo : melhor;
}

// Gols por minuto: chance proporcional a ataque de um vs defesa do outro.
function simular(a, b, mataMata, rng = Math.random) {
  const bonus = t => BONUS_BOT[t.bot] ?? 0;
  const fa = forca(a), fb = forca(b);
  // Ataques tendem a ter overall maior que defesas (mercado paga mais por atacante); descontar a
  // diferença média dos dois times deixa ~2,6 gols por jogo e o placar decidido pela diferença entre eles.
  const desnivel = (fa.ataque + fb.ataque - fa.defesa - fb.defesa) / 2;
  const lambda = (atq, def) => 1.3 * Math.exp((atq - def - desnivel) / SENSIBILIDADE);
  const chances = [lambda(fa.ataque + bonus(a), fb.defesa + bonus(b)), lambda(fb.ataque + bonus(b), fa.defesa + bonus(a))];
  const eventos = [], gols = [0, 0];
  for (let min = 1; min <= 90; min++) {
    [a, b].forEach((t, lado) => {
      if (rng() < chances[lado] / 90) { gols[lado]++; eventos.push({ min, lado, autor: artilheiro(t, rng) }); }
    });
  }
  const penaltis = mataMata && gols[0] === gols[1] ? disputaPenaltis(rng) : null;
  const [x, y] = penaltis || gols;
  return { gols, eventos, penaltis, vencedor: x === y ? null : x > y ? 0 : 1 };
}

if (typeof module !== 'undefined') module.exports = { FORMACOES, RES, NIVEIS, BONUS_BOT, escolhaDoBot, novoTime, slotsLivres, ovrEfetivo, resolverDuplicados, forca, simular };
