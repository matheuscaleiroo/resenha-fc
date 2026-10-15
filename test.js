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

// repetido sai dos dois times e a reserva (ATA) cobre o buraco de MEI, com penalidade
const A = time('A', 'a', 75), B = time('B', 'b', 75);
const meiA = A.slots.indexOf('MEI'), meiB = B.slots.lastIndexOf('MEI');
const craque = j('craque', 'MEI', 90);
A.escalacao[meiA] = craque; B.escalacao[meiB] = craque;
const rep = L.resolverDuplicados([A, B]);
assert.deepStrictEqual(rep.map(r => r.times), [['A', 'B']]);
assert.equal(A.escalacao[meiA].id, 'a11');
assert.equal(A.escalacao[L.RES], null);
assert.equal(L.ovrEfetivo(A, meiA), 67);
assert.equal(B.escalacao[meiB].id, 'b11');

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

console.log(`ok (forte venceu ${vitorias}/2000; OVR médio dos bots ${JSON.stringify(mediaOvr)}; sabotagens do impossível em 200 drafts: ${sabotagens})`);
