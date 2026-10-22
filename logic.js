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
const VAZIO = 50;              // "overall" de uma posição sem ninguém (jogar com 10 dói, mas não é W.O.).
                               // É o do G12; cada modo pode ter o seu em t.vazio (ver MODOS em online.js).
const SENSIBILIDADE = 10;      // ajuste fino: menor = overall pesa mais no placar
const PESO_GOL = { GOL: 0.02, LAT: 0.6, ZAG: 0.5, MEI: 2, ATA: 5 };
const POSICOES = ['GOL', 'LAT', 'ZAG', 'MEI', 'ATA'];

// Fora de posição: linha = posição de verdade, coluna = onde foi escalado. Posição vizinha dói pouco
// (lateral vira zagueiro), extremo dói muito, e qualquer um da linha no gol é desastre.
const PENALIDADE = {
  GOL: { GOL: 0, LAT: 16, ZAG: 14, MEI: 20, ATA: 20 },
  LAT: { GOL: 24, LAT: 0, ZAG: 4, MEI: 5, ATA: 9 },
  ZAG: { GOL: 22, LAT: 4, ZAG: 0, MEI: 7, ATA: 12 },
  MEI: { GOL: 26, LAT: 5, ZAG: 7, MEI: 0, ATA: 4 },
  ATA: { GOL: 26, LAT: 9, ZAG: 12, MEI: 4, ATA: 0 },
};
// 'RES' (banco) não é posição de campo: no banco ninguém joga, então não há penalidade.
const penalidade = (real, slot) => PENALIDADE[real]?.[slot] ?? 0;

// Postura escolhida depois de ver o time montado. Trocar ataque por defesa muda o número de gols:
// jogo aberto premia o time melhor (mais gols = menos sorte), jogo travado abre espaço pra zebra.
const TATICAS = {
  ofensivo: { nome: 'Ofensivo', icone: '⚔️', ataque: 3, defesa: -3, dica: 'Time todo na frente. Chove gol dos dois lados, e jogo aberto premia quem tem o melhor time.' },
  neutro: { nome: 'Neutro', icone: '⚖️', ataque: 0, defesa: 0, dica: 'Sem bônus e sem risco. O jogo sai como o time é.' },
  defensivo: { nome: 'Defensivo', icone: '🛡️', ataque: -3, defesa: 3, dica: 'Fecha atrás e segura. Placar magro, muito empate — é a chance da zebra.' },
};
const tatica = t => TATICAS[t?.tatica] ?? TATICAS.neutro;

// RNG com semente: a mesma semente dá o mesmo jogo em todos os aparelhos (necessário no modo online).
// Cada uso ganha uma semente derivada própria, pra que pular uma tela num aparelho não desalinhe o resto.
function rngDe(semente) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const novaSemente = () => Math.floor(Math.random() * 2 ** 31);
const embaralharCom = (a, rng) => a.map(x => [rng(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

const novoTime = (nome, formacao) => {
  const slots = [...FORMACOES[formacao].flat(), 'RES'];
  return { nome, formacao, slots, escalacao: Array(slots.length).fill(null), reservaEm: null, tatica: 'neutro' };
};

const slotsLivres = (t, pos) =>
  t.slots.map((_, i) => i).filter(i => !t.escalacao[i] && (t.slots[i] === pos || i === RES));

const ovrEfetivo = (t, i) => {
  const j = t.escalacao[i];
  return j.ovr - penalidade(j.pos, t.slots[i]);
};

// Jogador escolhido por 2+ pessoas sai de todos os times. A reserva NÃO entra sozinha aqui: onde ela
// joga é decidido depois, na tela de tática (moverReserva), com reservaPadrao como sugestão.
function resolverDuplicados(times) {
  const quem = {};
  times.forEach(t => t.escalacao.forEach(j => j && (quem[j.id] ??= { jogador: j, times: [] }).times.push(t.nome)));
  const repetidos = Object.values(quem).filter(q => q.times.length > 1);
  const ids = new Set(repetidos.map(q => q.jogador.id));
  times.forEach(t => { t.escalacao = t.escalacao.map(j => (j && ids.has(j.id) ? null : j)); });
  return repetidos;
}

// Reserva em campo: troca o banco com o slot escolhido (quem estava lá, titular ou buraco, vai pro banco).
// reservaEm = slot onde ela está jogando; RES = ficou no banco; null = ainda não decidido.
// Trocar duas vezes desfaz, então mudar de ideia é: desfaz a troca anterior e faz a nova.
function moverReserva(t, slot) {
  const troca = s => { [t.escalacao[s], t.escalacao[RES]] = [t.escalacao[RES], t.escalacao[s]]; };
  if (t.reservaEm != null) troca(t.reservaEm);
  t.reservaEm = t.escalacao[RES] ? slot : RES;   // sem reserva (foi repetida), nada se move
  troca(t.reservaEm);
}
const jogadorReserva = t => t.escalacao[t.reservaEm ?? RES];

// Sugestão (e escolha dos bots): o buraco onde a reserva perde menos overall; sem buraco, fica no banco.
function reservaPadrao(t) {
  const r = t.escalacao[RES];
  const buracos = t.slots.map((_, i) => i).filter(i => i !== RES && !t.escalacao[i]);
  if (!r || !buracos.length) return RES;
  return buracos.sort((x, y) => penalidade(r.pos, t.slots[x]) - penalidade(r.pos, t.slots[y]) || x - y)[0];
}

function forca(t) {
  const media = a => a.reduce((x, y) => x + y, 0) / a.length;
  const v = i => (t.escalacao[i] ? ovrEfetivo(t, i) : t.vazio ?? VAZIO);
  const idx = pos => t.slots.map((p, i) => (pos.includes(p) && i !== RES ? i : -1)).filter(i => i >= 0);
  const goleiro = idx(['GOL']).map(v);
  return {
    geral: Math.round(media(idx(POSICOES).map(v))),
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

// porClube: quantos jogadores cada clube futuro ainda vai render (G12 = 1, Big Six = 2).
function escolhaDoBot(t, clube, futuros, nivel, jaEscolhidos = [], rng = Math.random, porClube = 1) {
  const opcoes = clube.jogadores.flatMap(j => slotsLivres(t, j.pos).map(i => ({ j, i })));
  if (nivel === 'facil') return opcoes[Math.floor(rng() * opcoes.length)];
  // referência: com k vagas abertas na posição, o k-ésimo melhor que ainda pode vir dos próximos clubes
  // (cada clube pode render até porClube jogadores dessa posição)
  const vagas = pos => t.slots.filter((p, i) => p === pos && i !== RES && !t.escalacao[i]).length;
  const referencia = pos => futuros.flatMap(c => {
    const ovrs = c.jogadores.filter(j => j.pos === pos).map(j => j.ovr).sort((a, b) => b - a);
    return Array.from({ length: porClube }, (_, k) => ovrs[k] ?? 0);
  }).sort((a, b) => b - a)[vagas(pos) - 1] ?? 0;
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

// Bot escolhe a postura comparando-se com os adversários: pior que a média fecha atrás (zebra),
// melhor que a média abre o jogo (mais gols favorecem quem é melhor).
function taticaDoBot(t, times) {
  const meu = forca(t).geral;
  const outros = times.filter(x => x !== t).map(x => forca(x).geral);
  const media = outros.reduce((a, b) => a + b, 0) / (outros.length || 1);
  return meu - media > 1.5 ? 'ofensivo' : meu - media < -1.5 ? 'defensivo' : 'neutro';
}

// Gols por minuto: chance proporcional a ataque de um vs defesa do outro.
function simular(a, b, mataMata, rng = Math.random) {
  const bonus = t => BONUS_BOT[t.bot] ?? 0;
  const fa = forca(a), fb = forca(b);
  // Ataques tendem a ter overall maior que defesas (mercado paga mais por atacante); descontar a
  // diferença média dos dois times deixa ~2,6 gols por jogo e o placar decidido pela diferença entre eles.
  // Calculado sobre a força crua, sem tática nem bônus, pra que esses dois mexam no placar de verdade.
  const desnivel = (fa.ataque + fb.ataque - fa.defesa - fb.defesa) / 2;
  const atq = (t, f) => f.ataque + bonus(t) + tatica(t).ataque;
  const def = (t, f) => f.defesa + bonus(t) + tatica(t).defesa;
  const lambda = (ataque, defesa) => 1.3 * Math.exp((ataque - defesa - desnivel) / SENSIBILIDADE);
  const chances = [lambda(atq(a, fa), def(b, fb)), lambda(atq(b, fb), def(a, fa))];
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

if (typeof module !== 'undefined') module.exports = {
  FORMACOES, RES, POSICOES, VAZIO, PENALIDADE, TATICAS, NIVEIS, BONUS_BOT, penalidade,
  rngDe, novaSemente, embaralharCom, escolhaDoBot, taticaDoBot, novoTime, slotsLivres,
  ovrEfetivo, resolverDuplicados, moverReserva, jogadorReserva, reservaPadrao, forca, simular,
};
