// Joga drafts e partidas completos (sem tela) pra comparar o balanceamento dos modos.
// Uso: node tools/balanceamento.js [drafts por cenário, padrão 3000]
// Mesmo fluxo do jogo local: clubes em ordem aleatória, humanos escolhem antes dos bots (o Impossível
// vê o que eles pegaram), repetidos saem, reserva no buraco que dói menos, tática de cada um pelo
// taticaDoBot, partida com simular(). O "humano" é simulado com a cabeça do bot sem o bônus de bot:
// "esperto" = escolhe como o Difícil, "casual" = como o Médio (bom, com erros).
const fs = require('fs');
const path = require('path');
const L = require('../logic.js');
const raiz = path.join(__dirname, '..');
eval(fs.readFileSync(path.join(raiz, 'data.js'), 'utf8').replace('const CLUBES', 'globalThis.CLUBES'));
eval(fs.readFileSync(path.join(raiz, 'data-big6.js'), 'utf8').replace('const CLUBES_BIG6', 'globalThis.CLUBES_BIG6'));
Object.assign(global, { RES: L.RES, NIVEIS: L.NIVEIS, novoTime: L.novoTime, embaralharCom: L.embaralharCom, escolhaDoBot: L.escolhaDoBot });
global.localStorage = { getItem: () => null, setItem() {} };
const O = require('../online.js');

const N = +process.argv[2] || 3000;
const embaralhar = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
const formacoes = Object.keys(L.FORMACOES);
const pct = x => `${(100 * x).toFixed(0)}%`.padStart(4);

// participantes: [{ nome, cabeca: nível usado pra escolher, bot: nível do bônus ou null }]
function draft(modo, participantes, formacao) {
  const { clubes, porClube } = O.MODOS[modo];
  const times = participantes.map(p => Object.assign(L.novoTime(p.nome, formacao), { bot: p.bot, cabeca: p.cabeca, vazio: O.MODOS[modo].vazio }));
  const ordem = embaralhar(clubes);
  ordem.forEach((clube, r) => {
    const futuros = ordem.slice(r + 1), escolhidos = [];
    for (const t of times) {   // humanos vêm primeiro na lista, como no jogo
      O.picksDoBotNoClube(t, clube, futuros, t.cabeca, porClube, t.bot === 'impossivel' ? escolhidos : [])
        .forEach(({ j }) => escolhidos.push(j.id));
    }
  });
  const repetidos = L.resolverDuplicados(times);
  const buracos = times.reduce((s, t) => s + t.escalacao.filter((j, i) => i !== L.RES && !j).length, 0);
  times.forEach(t => L.moverReserva(t, L.reservaPadrao(t)));
  const aindaBuraco = times.reduce((s, t) => s + t.escalacao.filter((j, i) => i !== L.RES && !j).length, 0);
  times.forEach(t => { t.tatica = L.taticaDoBot(t, times); });
  return { times, repetidos: repetidos.length, buracos, aindaBuraco };
}

function cenario(modo, humano, nivel) {
  let v = 0, e = 0, gols = 0, ovrH = 0, ovrB = 0;
  for (let k = 0; k < N; k++) {
    const { times: [h, b] } = draft(modo, [{ nome: 'H', cabeca: humano, bot: null }, { nome: 'B', cabeca: nivel, bot: nivel }], formacoes[k % formacoes.length]);
    const r = L.simular(h, b, false);
    if (r.gols[1] > r.gols[0]) v++; else if (r.gols[0] === r.gols[1]) e++;
    gols += r.gols[0] + r.gols[1];
    ovrH += L.forca(h).geral; ovrB += L.forca(b).geral;
  }
  return { bot: v / N, empate: e / N, gols: gols / N, ovrH: ovrH / N, ovrB: ovrB / N };
}

// Grupo de 4 humanos casuais: quanto bate (repetidos) e quanto buraco sobra — com 2 por clube, o
// Big Six tem menos opção por rodada, então é onde mais pode sair do controle.
function grupo(modo) {
  let rep = 0, bur = 0, sobra = 0, spread = 0, gols = 0, jogos = 0, zebra = 0;
  for (let k = 0; k < N / 2; k++) {
    const ps = ['A', 'B', 'C', 'D'].map(nome => ({ nome, cabeca: 'medio', bot: null }));
    const { times, repetidos, buracos, aindaBuraco } = draft(modo, ps, formacoes[k % formacoes.length]);
    rep += repetidos; bur += buracos; sobra += aindaBuraco;
    const ovrs = times.map(t => L.forca(t).geral);
    spread += Math.max(...ovrs) - Math.min(...ovrs);
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      const r = L.simular(times[a], times[b], false);
      gols += r.gols[0] + r.gols[1]; jogos++;
      const fav = ovrs[a] >= ovrs[b] ? 0 : 1;
      if (ovrs[a] !== ovrs[b] && r.vencedor === 1 - fav) zebra++;
    }
  }
  const n = N / 2;
  return { rep: rep / n, bur: bur / n, sobra: sobra / n, spread: spread / n, gols: gols / jogos, zebra: zebra / jogos };
}

console.log(`${N} drafts por cenário (humano × bot, 1 contra 1, formações alternando)\n`);
for (const humano of ['dificil', 'medio']) {
  console.log(`Humano ${humano === 'dificil' ? 'esperto' : 'casual'} contra cada bot — % de vitória do BOT (empates) · gols/jogo · OVR humano × bot`);
  for (const nivel of Object.keys(L.NIVEIS)) {
    const linha = ['g12', 'big6'].map(m => {
      const x = cenario(m, humano, nivel);
      return `${m.padEnd(4)} ${pct(x.bot)} (${pct(x.empate)}) · ${x.gols.toFixed(2)} · ${x.ovrH.toFixed(1)}×${x.ovrB.toFixed(1)}`;
    });
    console.log(`  ${L.NIVEIS[nivel].padEnd(10)} ${linha.join('   |   ')}`);
  }
  console.log();
}
console.log('Grupo de 4 humanos casuais, liga entre eles:');
for (const m of ['g12', 'big6']) {
  const x = grupo(m);
  console.log(`  ${m.padEnd(4)} repetidos/draft ${x.rep.toFixed(2)} · buracos ${x.bur.toFixed(2)} → ${x.sobra.toFixed(2)} depois da reserva · ` +
    `diferença de OVR entre melhor e pior ${x.spread.toFixed(1)} · gols/jogo ${x.gols.toFixed(2)} · zebra ${pct(x.zebra)}`);
}
