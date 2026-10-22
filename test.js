// node test.js
const assert = require('assert');
const fs = require('fs');
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

// repetido sai dos dois times; a reserva NÃO entra sozinha (fica no banco até moverReserva)
const A = time('A', 'a', 75), B = time('B', 'b', 75);
const meiA = A.slots.indexOf('MEI'), meiB = B.slots.lastIndexOf('MEI');
const craque = j('craque', 'MEI', 90);
A.escalacao[meiA] = craque; B.escalacao[meiB] = craque;
const rep = L.resolverDuplicados([A, B]);
assert.deepStrictEqual(rep.map(r => r.times), [['A', 'B']]);
assert.equal(A.escalacao[meiA], null);
assert.equal(A.escalacao[L.RES].id, 'a11');
// sugestão: o único buraco; entrando lá, a reserva (ATA) joga de MEI com a penalidade da matriz
assert.equal(L.reservaPadrao(A), meiA);
L.moverReserva(A, L.reservaPadrao(A));
assert.equal(A.escalacao[meiA].id, 'a11');
assert.equal(A.escalacao[L.RES], null);
assert.equal(L.ovrEfetivo(A, meiA), 75 - L.penalidade('ATA', 'MEI'));
assert.equal(L.jogadorReserva(A).id, 'a11');

// moverReserva: pode trocar de ideia (desfaz a troca anterior) e pode entrar no lugar de um titular,
// que vai pro banco. Banco (RES) devolve tudo como estava.
const C = time('C', 'c', 75);
C.escalacao[L.RES] = j('cres', 'LAT', 80);
const original = C.escalacao.map(x => x.id);
assert.equal(L.reservaPadrao(C), L.RES, 'sem buraco, sugestão é ficar no banco');
const zagC = C.slots.indexOf('ZAG'), golC = C.slots.indexOf('GOL');
L.moverReserva(C, zagC);
assert.equal(C.escalacao[zagC].id, 'cres');
assert.equal(C.escalacao[L.RES].id, original[zagC], 'titular trocado devia ir pro banco');
assert.equal(L.ovrEfetivo(C, zagC), 80 - L.penalidade('LAT', 'ZAG'));
L.moverReserva(C, golC);
assert.equal(C.escalacao[zagC].id, original[zagC], 'trocar de ideia devia devolver o zagueiro');
assert.equal(C.escalacao[golC].id, 'cres');
assert(L.ovrEfetivo(C, golC) < L.ovrEfetivo(C, zagC) - 15, 'lateral no gol devia doer muito mais que na zaga');
L.moverReserva(C, L.RES);
assert.deepStrictEqual(C.escalacao.map(x => x.id), original, 'voltar pro banco devia desfazer tudo');

// sugestão com dois buracos: vai pro que dói menos pra posição dela (MEI: LAT dói menos que ZAG)
const E = time('E', 'e', 75);
E.escalacao[L.RES] = j('eres', 'MEI', 75);
const zagE = E.slots.indexOf('ZAG'), latE = E.slots.indexOf('LAT');
E.escalacao[zagE] = null; E.escalacao[latE] = null;
assert(L.penalidade('MEI', 'LAT') < L.penalidade('MEI', 'ZAG'));
assert.equal(L.reservaPadrao(E), latE);

// reserva repetida (null no banco): moverReserva não mexe em nada
const F = time('F', 'f', 75);
F.escalacao[L.RES] = null;
L.moverReserva(F, 0);
assert.equal(F.reservaEm, L.RES);
assert.equal(F.escalacao[0].id, 'f0');

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

// draftarBotOnline/jogadorPorId/timeDaSala: ida e volta sem perder informação (picks reconstroem
// o mesmo time a partir só dos ids — precisa de ids reais "CLUBE:Nome" do data.js, por isso usa
// um time draftado de verdade, não o `time()` sintético)
const clubesOnline = [...CLUBES].map(c => c.id);
const { t: timeOriginal, picks } = O.draftarBotOnline({ nome: 'Sala', bot: 'dificil' }, clubesOnline, '4-3-3');
assert.equal(Object.keys(picks).length, clubesOnline.length, 'uma pick por rodada/clube');
const reconstruido = O.timeDaSala({ nome: 'Sala', picks, tatica: 'ofensivo' }, '4-3-3');
assert.deepStrictEqual(reconstruido.escalacao.map(j => j?.id), timeOriginal.escalacao.map(j => j?.id));
assert.equal(reconstruido.tatica, 'ofensivo');

// draftarBotOnline: preenche os 12 slots sem ver ninguém (sem sabotagem possível, já que jaEscolhidos é sempre [])
const ordemOnline = [...CLUBES].sort(() => Math.random() - 0.5).map(c => c.id);
const { t: botOnline, picks: picksBotOnline } = O.draftarBotOnline({ nome: 'Bot', bot: 'impossivel' }, ordemOnline, '3-5-2');
assert(botOnline.escalacao.every(Boolean), 'bot online devia preencher os 12 slots');

// rodadaCompleta: só fecha quando TODOS os participantes (bots inclusive) picaram aquela rodada
const salaFake = { participantes: { h: { picks: { 0: { jogador: 'x', slot: 0 } } }, b: { bot: 'facil', picks: picksBotOnline } } };
assert.equal(O.rodadaCompleta(salaFake, 0), true, 'rodada 0: os dois picaram');
assert.equal(O.rodadaCompleta(salaFake, 1), false, 'rodada 1: só o bot picou, humano ainda não');

// taticaCompleta: bot não precisa confirmar nada, só os humanos
const salaTatica = { participantes: { h: { bot: null, taticaPronto: false }, b: { bot: 'facil' } } };
assert.equal(O.taticaCompleta(salaTatica), false, 'humano ainda não confirmou');
salaTatica.participantes.h.taticaPronto = true;
assert.equal(O.taticaCompleta(salaTatica), true, 'bot não bloqueia, só faltava o humano');
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

// versão: a do index.html (única fonte) tem que ser a primeira do CHANGELOG.md — é dali que o jogo lê as novidades
const versaoHtml = fs.readFileSync(__dirname + '/index.html', 'utf8').match(/const VERSAO = '([^']+)'/)[1];
const versaoLog = fs.readFileSync(__dirname + '/CHANGELOG.md', 'utf8').match(/^## (\S+)/m)[1];
assert.equal(versaoLog, versaoHtml, `CHANGELOG.md começa na ${versaoLog} mas o index.html diz ${versaoHtml}`);

console.log(`ok (forte venceu ${vitorias}/2000; OVR médio dos bots ${JSON.stringify(mediaOvr)}; sabotagens do impossível em 200 drafts: ${sabotagens})`);
