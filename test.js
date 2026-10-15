// node test.js
const assert = require('assert');
const L = require('./logic.js');

const j = (id, pos, ovr) => ({ id, nome: id, pos, ovr, clube: 'X' });
const time = (nome, prefixo, ovr, formacao = '4-3-3') => {
  const t = L.novoTime(nome, formacao);
  t.escalacao = t.slots.map((s, i) => j(prefixo + i, s === 'RES' ? 'ATA' : s, ovr));
  return t;
};

// toda formação tem 11 titulares (1 goleiro) + reserva no índice 11
for (const [nome, linhas] of Object.entries(L.FORMACOES)) {
  assert.equal(linhas.flat().length, 11, nome);
  assert.equal(linhas.flat().filter(p => p === 'GOL').length, 1, nome);
  assert.equal(L.novoTime('x', nome).slots[L.RES], 'RES', nome);
}

// repetido sai dos dois times e a reserva (ATA) cobre o buraco de MEI, com penalidade da matriz
const A = time('A', 'a', 75), B = time('B', 'b', 75);
const meiA = A.slots.indexOf('MEI'), meiB = B.slots.lastIndexOf('MEI');
const craque = j('craque', 'MEI', 90);
A.escalacao[meiA] = craque; B.escalacao[meiB] = craque;
const rep = L.resolverDuplicados([A, B]);
assert.deepStrictEqual(rep.map(r => r.times), [['A', 'B']]);
assert.equal(A.escalacao[meiA].id, 'a11');
assert.equal(A.escalacao[L.RES], null);
assert.equal(L.ovrEfetivo(A, meiA), 75 - L.penalidade('ATA', 'MEI'));
assert.equal(B.escalacao[meiB].id, 'b11');

// reservaCobre: com dois buracos abertos, a reserva vai pro que a pessoa escolheu, mesmo contra o
// que o fallback automático escolheria por conta própria (aqui o fallback preferiria LAT, não ZAG,
// porque dói menos pra um MEI — ver PENALIDADE.MEI).
const C = time('C', 'c', 75), D = time('D', 'd', 75);
C.escalacao[C.slots.indexOf('RES')] = j('cres', 'MEI', 75);           // reserva é MEI, não ATA
const craqueZ = j('craqueZ', 'ZAG', 90), craqueL = j('craqueL', 'LAT', 90);
const zagC = C.slots.indexOf('ZAG'), zagD = D.slots.lastIndexOf('ZAG');
const latC = C.slots.indexOf('LAT'), latD = D.slots.lastIndexOf('LAT');
C.escalacao[zagC] = craqueZ; D.escalacao[zagD] = craqueZ;
C.escalacao[latC] = craqueL; D.escalacao[latD] = craqueL;
assert(L.penalidade('MEI', 'LAT') < L.penalidade('MEI', 'ZAG'), 'premissa do teste: fallback preferiria LAT');
C.reservaCobre = 'ZAG';
L.resolverDuplicados([C, D]);
assert.equal(C.escalacao[zagC]?.id, 'cres', 'reservaCobre não foi respeitado (foi pro que dói menos, não pro escolhido)');
assert.equal(C.escalacao[latC], null, 'buraco de LAT devia continuar vazio');
assert.equal(L.ovrEfetivo(C, zagC), 75 - L.penalidade('MEI', 'ZAG'));

// coberturas: ordenadas da que dói menos pra que dói mais (matriz é a fonte da verdade)
const ordemLAT = L.coberturas(L.novoTime('x', '4-3-3'), 'LAT');
assert.equal(ordemLAT[0], 'LAT');
assert.deepStrictEqual([...ordemLAT].sort((a, b) => L.penalidade('LAT', a) - L.penalidade('LAT', b)), ordemLAT);

// tática: ofensivo tira de defesa e põe em ataque (saldo zero), defensivo o contrário, neutro não altera
for (const [nome, sinal] of [['ofensivo', 1], ['defensivo', -1], ['neutro', 0]]) {
  const t = L.TATICAS[nome];
  assert.equal(t.ataque, -t.defesa, `${nome}: tática devia ter saldo zero`);
  assert.equal(Math.sign(t.ataque), sinal, nome);
}

// slots livres: reserva aceita qualquer posição
assert.deepStrictEqual(L.slotsLivres(L.novoTime('x', '4-3-3'), 'GOL'), [10, 11]);
assert.equal(L.slotsLivres(L.novoTime('x', '3-5-2'), 'ZAG').length, 4);

// time forte ganha a maioria; mata-mata sempre tem vencedor
const forte = time('F', 'f', 88, '3-4-3'), fraco = time('W', 'w', 65, '5-3-2');
let vitorias = 0;
for (let k = 0; k < 2000; k++) {
  const r = L.simular(forte, fraco, true);
  assert.notEqual(r.vencedor, null);
  assert.equal(r.eventos.length, r.gols[0] + r.gols[1]);
  if (r.vencedor === 0) vitorias++;
}
assert(vitorias > 1500, `forte venceu só ${vitorias}/2000`);
// bots com os elencos reais: preenchem os 12 slots; impossível só repete de propósito (titular, sabotagem); nível alto monta time melhor
eval(require('fs').readFileSync(__dirname + '/data.js', 'utf8').replace('const CLUBES', 'globalThis.CLUBES'));

// online.js é script clássico (sem require/import): expõe as funções puras como globais, que é o
// que ele espera encontrar (CLUBES, novoTime, RES etc. já são globais pelas linhas acima/por L).
global.RES = L.RES; global.NIVEIS = L.NIVEIS; global.novoTime = L.novoTime;
global.embaralharCom = L.embaralharCom; global.escolhaDoBot = L.escolhaDoBot;
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
const O = require('./online.js');

// gerarCodigo: 4 caracteres, sempre do alfabeto sem 0/O/1/I (pra não confundir ditando em voz alta)
for (let k = 0; k < 50; k++) assert.match(O.gerarCodigo(), /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);

// meuId: gera uma vez e lembra (mesmo "aparelho" continua sendo reconhecido depois de recarregar)
const id1 = O.meuId(), id2 = O.meuId();
assert.equal(id1, id2, 'meuId devia ser estável entre chamadas (mesmo "aparelho")');

// serializarTime/jogadorPorId/timeDaSala: ida e volta sem perder informação (precisa de ids reais
// no formato "CLUBE:Nome" do data.js, por isso usa um time draftado de verdade, não o `time()` sintético)
const timeOriginal = O.draftarBotOnline({ nome: 'Sala', bot: 'dificil' }, [...CLUBES].map(c => c.id), '4-3-3');
const ids = O.serializarTime(timeOriginal);
assert(ids.every(id => typeof id === 'string'), 'todo slot preenchido devia virar um id (string)');
const reconstruido = O.timeDaSala({ nome: 'Sala', escalacao: ids, reservaCobre: 'ZAG', tatica: 'ofensivo' }, '4-3-3');
assert.deepStrictEqual(reconstruido.escalacao.map(j => j.id), timeOriginal.escalacao.map(j => j.id));
assert.equal(reconstruido.reservaCobre, 'ZAG');
assert.equal(reconstruido.tatica, 'ofensivo');

// draftarBotOnline: preenche os 12 slots sem ver ninguém (sem sabotagem possível, já que jaEscolhidos é sempre [])
const ordemOnline = [...CLUBES].sort(() => Math.random() - 0.5).map(c => c.id);
const botOnline = O.draftarBotOnline({ nome: 'Bot', bot: 'impossivel' }, ordemOnline, '3-5-2');
assert(botOnline.escalacao.every(Boolean), 'bot online devia preencher os 12 slots');
const mediaOvr = {};
let sabotagens = 0;
for (const nivel of Object.keys(L.NIVEIS)) {
  let soma = 0;
  for (let k = 0; k < 200; k++) {
    const humano = L.novoTime('H', '3-5-2'), bot = L.novoTime('B', '3-5-2');
    const ordem = [...CLUBES].sort(() => Math.random() - 0.5);
    ordem.forEach((c, r) => {
      const h = L.escolhaDoBot(humano, c, ordem.slice(r + 1), 'dificil');   // "humano" esperto escolhe antes
      humano.escalacao[h.i] = h.j;
      const b = L.escolhaDoBot(bot, c, ordem.slice(r + 1), nivel, [h.j.id]);
      bot.escalacao[b.i] = b.j;
      if (nivel === 'impossivel' && b.j.id === h.j.id) { assert.notEqual(b.i, L.RES); sabotagens++; }
    });
    assert(bot.escalacao.every(Boolean), `${nivel}: slot vazio`);
    assert(bot.escalacao.every((j, i) => i === L.RES || j.pos === bot.slots[i]), `${nivel}: fora de posição`);
    soma += L.forca(bot).geral;
  }
  mediaOvr[nivel] = soma / 200;
}
assert(mediaOvr.facil < mediaOvr.medio, JSON.stringify(mediaOvr));
assert(sabotagens > 0, 'impossível nunca sabotou');

// RNG com semente: mesma semente = mesma partida em qualquer aparelho (necessário pro modo online)
const semente = L.novaSemente();
const r1 = L.simular(forte, fraco, false, L.rngDe(semente));
const r2 = L.simular(forte, fraco, false, L.rngDe(semente));
assert.deepStrictEqual(r1.gols, r2.gols, 'mesma semente devia dar o mesmo placar');
assert.deepStrictEqual(r1.eventos.map(e => e.min), r2.eventos.map(e => e.min), 'mesma semente devia dar os mesmos minutos de gol');
assert.notEqual(L.rngDe(1)(), L.rngDe(2)(), 'sementes diferentes deviam gerar sequências diferentes');

// tática do bot: só joga ofensivo quando está bem melhor, defensivo quando está bem pior, senão neutro
const base = time('T', 't', 75), melhor = time('M', 'm', 85), pior = time('P', 'p', 65), igual = time('I', 'i', 75);
assert.equal(L.taticaDoBot(base, [base, igual]), 'neutro');
assert.equal(L.taticaDoBot(melhor, [melhor, base]), 'ofensivo');
assert.equal(L.taticaDoBot(pior, [pior, base]), 'defensivo');

console.log(`ok (forte venceu ${vitorias}/2000; OVR médio dos bots ${JSON.stringify(mediaOvr)}; sabotagens do impossível em 200 drafts: ${sabotagens})`);
