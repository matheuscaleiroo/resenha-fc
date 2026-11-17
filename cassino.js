// Cassino (v1.7): caça-níquel, roleta e blackjack, só com as moedas do jogo (🪙 ou 💎, nunca misturadas).
// Não entra nem sai dinheiro de verdade. Em cima, as regras puras (rng injetado, testadas em test.js);
// embaixo, as telas. "mult" / "retorno" = quanto VOLTA pra quem apostou (0 = perdeu, a aposta = empatou).

// ---------- caça-níquel: 3 rolos, 6 símbolos com a mesma chance ----------
// Retorno médio 93,5% (test.js confere): 3 iguais pagam TRINCA, 2 iguais devolvem a aposta.
const SIMBOLOS = ['⚽', '🧤', '🟨', '🟥', '👟', '🏆'];
const TRINCA = [10, 12, 15, 20, 25, 30];
const girarSlot = rng => [0, 1, 2].map(() => Math.floor(rng() * SIMBOLOS.length));
const multSlot = ([a, b, c]) => (a === b && b === c ? TRINCA[a] : a === b || b === c || a === c ? 1 : 0);

// ---------- roleta europeia (0 a 36): retorno médio 36/37 = 97,3% em qualquer aposta ----------
const VERMELHOS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const PALPITES = { vermelho: '🔴 Vermelho', preto: '⚫ Preto', par: 'Par', impar: 'Ímpar', d1: '1 a 12', d2: '13 a 24', d3: '25 a 36' };
const girarRoleta = rng => Math.floor(rng() * 37);
// palpite: uma chave de PALPITES ou um número de 0 a 36. O zero só paga pra quem apostou nele.
function multRoleta(palpite, n) {
  if (typeof palpite === 'number') return palpite === n ? 36 : 0;
  if (n === 0) return 0;
  if (palpite === 'vermelho' || palpite === 'preto') return VERMELHOS.has(n) === (palpite === 'vermelho') ? 2 : 0;
  if (palpite === 'par' || palpite === 'impar') return (n % 2 === 0) === (palpite === 'par') ? 2 : 0;
  return Math.ceil(n / 12) === +palpite[1] ? 3 : 0;
}

// ---------- blackjack: 1 baralho por mão, banca para no 17, blackjack paga 3:2, sem dividir nem seguro ----------
const novoBaralho = rng => embaralharCom(['♠', '♥', '♦', '♣'].flatMap(n =>
  ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map(v => ({ v, n }))), rng);
function valorMao(mao) {
  let total = 0, ases = 0;
  for (const c of mao) { total += c.v === 'A' ? 11 : 'JQK'.includes(c.v) ? 10 : +c.v; if (c.v === 'A') ases++; }
  for (; total > 21 && ases > 0; ases--) total -= 10;   // ás vale 11 enquanto não estoura
  return total;
}
const ehBlackjack = mao => mao.length === 2 && valorMao(mao) === 21;
function jogarBanca(banca, baralho) {
  while (valorMao(banca) < 17) banca.push(baralho.pop());
  return banca;
}
function retornoBJ(jogador, banca, aposta) {
  const j = valorMao(jogador), b = valorMao(banca);
  if (j > 21) return 0;
  if (ehBlackjack(jogador)) return ehBlackjack(banca) ? aposta : aposta + Math.floor(aposta * 1.5);
  if (ehBlackjack(banca)) return 0;
  return b > 21 || j > b ? aposta * 2 : j === b ? aposta : 0;
}

if (typeof module !== 'undefined') module.exports = {
  SIMBOLOS, TRINCA, girarSlot, multSlot, PALPITES, girarRoleta, multRoleta, novoBaralho, valorMao, ehBlackjack, jogarBanca, retornoBJ,
};

// ---------- telas (usa $app, $, CONTA de app.js; moverMoedas, CAMPO_MOEDA, ICONE_MOEDA de online.js) ----------
// O resultado é sorteado e o saldo gravado ANTES da animação: recarregar a página não desfaz uma derrota.
// No blackjack a aposta sai ao dar as cartas e o prêmio entra no fim (fechar no meio = perdeu a aposta).
// ponytail: sem internet a gravação fica esperando e o botão fica travado até a conexão voltar.
const CS = { moeda: 'local', aposta: 1, jogo: null, palpite: 'vermelho', ocupado: false, bj: null, timer: null };
const APOSTAS = [1, 2, 5, 10];
const JOGOS_CASSINO = {
  slot: { icone: '🎰', nome: 'Caça-níquel', dica: '3 iguais pagam de 10× a 30×. 2 iguais devolvem a aposta.' },
  roleta: { icone: '🎡', nome: 'Roleta', dica: 'Cor ou par/ímpar pagam 2×, dúzia 3×, número cheio 36×.' },
  bj: { icone: '🃏', nome: 'Blackjack', dica: 'Chegue mais perto de 21 que a banca, sem estourar.' },
};
const ERRO_SALDO = '⚠ Não consegui salvar no seu saldo (sem internet, ou as regras novas do banco ainda não foram publicadas).';
const saldoCassino = () => CONTA.perfil?.[CAMPO_MOEDA[CS.moeda]] ?? 0;
const icCassino = () => ICONE_MOEDA[CS.moeda];
const avisoCassino = t => { if ($('csMsg')) $('csMsg').textContent = t; };
const maoAberta = () => !!CS.bj && !CS.bj.fim;
function pintarSaldo() {
  Object.keys(CAMPO_MOEDA).forEach(m => { if ($('csSaldo-' + m)) $('csSaldo-' + m).textContent = `${ICONE_MOEDA[m]} ${CONTA.perfil?.[CAMPO_MOEDA[m]] ?? 0}`; });
}
async function pagarCassino(delta) {
  if (!delta) return true;
  try { await moverMoedas(CONTA.user.uid, CAMPO_MOEDA[CS.moeda], delta); return true; } catch { return false; }
}
const textoResultado = (volta, aposta) => (volta > aposta ? `🎉 Ganhou ${icCassino()} ${volta - aposta}!`
  : volta === aposta ? 'Devolveu a aposta.' : `Perdeu ${icCassino()} ${aposta}.`);

function telaCassino(jogo = null) {
  clearInterval(CS.timer);
  CS.jogo = jogo; CS.ocupado = false;
  const j = JOGOS_CASSINO[jogo], p = CONTA.perfil;
  if (!p) {
    $app.innerHTML = `
    <section class="tela">
      <button class="voltar" onclick="telaMenu()">← Menu</button>
      <h2>🎰 Cassino</h2>
      <p>O cassino usa as moedas da sua conta. Entre ou crie uma conta pra jogar.</p>
      <button class="btn" onclick="telaConta()">👤 Entrar / criar conta</button>
    </section>`;
    return;
  }
  const corpo = { slot: htmlSlot, roleta: htmlRoleta, bj: htmlBj }[jogo];
  $app.innerHTML = `
  <section class="tela tela-cassino">
    <button class="voltar" onclick="${jogo ? 'telaCassino()' : 'telaMenu()'}">← ${jogo ? 'Cassino' : 'Menu'}</button>
    <h2>${j ? `${j.icone} ${j.nome}` : '🎰 Cassino'}</h2>
    <p class="dica">${j ? j.dica : 'Só com as moedas do jogo: aqui não entra nem sai dinheiro de verdade.'} Apostou 🪙 ganha 🪙, apostou 💎 ganha 💎.</p>
    <div class="formacoes cs-barra">
      ${Object.keys(CAMPO_MOEDA).map(m => `<button class="btn${m === CS.moeda ? '' : ' sec'}" id="csSaldo-${m}" aria-pressed="${m === CS.moeda}" onclick="csMoeda('${m}')">${ICONE_MOEDA[m]} ${p[CAMPO_MOEDA[m]]}</button>`).join('')}
      <span class="dica">Aposta</span>
      ${APOSTAS.map(a => `<button class="btn${a === CS.aposta ? '' : ' sec'}" aria-pressed="${a === CS.aposta}" onclick="csAposta(${a})">${a}</button>`).join('')}
    </div>
    ${corpo ? corpo() : `<div class="modos">${Object.entries(JOGOS_CASSINO).map(([k, v]) =>
      `<button class="modo" onclick="telaCassino('${k}')"><h2>${v.icone} ${v.nome}</h2><p>${v.dica}</p></button>`).join('')}</div>`}
    <p class="premio" id="csMsg" role="status"></p>
  </section>`;
}
// moeda e aposta não mudam no meio de um giro nem de uma mão de blackjack
function csMoeda(m) { if (CS.ocupado || maoAberta()) return; CS.moeda = m; if (CS.bj) CS.bj = null; telaCassino(CS.jogo); }
function csAposta(a) { if (CS.ocupado || maoAberta()) return; CS.aposta = a; telaCassino(CS.jogo); }

// Começa uma rodada de giro (slot/roleta): trava os botões e grava o saldo líquido. false = não rolou.
async function csApostar(volta) {
  if (CS.ocupado) return false;
  if (saldoCassino() < CS.aposta) { avisoCassino(`Saldo insuficiente: você tem ${icCassino()} ${saldoCassino()}.`); return false; }
  CS.ocupado = true;
  $('csBtn').disabled = true;
  avisoCassino('');
  if (await pagarCassino(volta - CS.aposta)) return true;
  csFim(ERRO_SALDO);
  return false;
}
function csFim(texto) {
  CS.ocupado = false;
  if ($('csBtn')) $('csBtn').disabled = false;
  pintarSaldo();
  avisoCassino(texto);
}
// Troca o que aparece a cada 70 ms; quadro(k) devolve true quando acabou. Sem animação = só o último quadro.
function csAnimar(passos, quadro, fim) {
  let k = matchMedia('(prefers-reduced-motion: reduce)').matches ? passos : 0;
  clearInterval(CS.timer);
  CS.timer = setInterval(() => {
    quadro(++k);
    if (k >= passos) { clearInterval(CS.timer); fim(); }
  }, 70);
}

// ---------- caça-níquel ----------
const htmlSlot = () => `
  <div class="cs-rolos" aria-live="polite">${[5, 0, 5].map((s, i) => `<span class="cs-rolo" id="csR${i}">${SIMBOLOS[s]}</span>`).join('')}</div>
  <div class="acoes centralizado"><button class="btn" id="csBtn" onclick="csGirarSlot()">Girar</button></div>
  <details class="dica"><summary>Quanto paga</summary>${SIMBOLOS.map((s, i) => `${s}${s}${s} ${TRINCA[i]}×`).join(' · ')} · 2 iguais devolvem a aposta.</details>`;
async function csGirarSlot() {
  const rolos = girarSlot(Math.random), aposta = CS.aposta, volta = aposta * multSlot(rolos);
  if (!await csApostar(volta)) return;
  const para = [8, 13, 18];   // cada rolo para num quadro diferente
  csAnimar(para[2], k => rolos.forEach((r, i) => {
    if ($('csR' + i)) $('csR' + i).textContent = SIMBOLOS[k >= para[i] ? r : Math.floor(Math.random() * SIMBOLOS.length)];
  }), () => csFim(textoResultado(volta, aposta)));
}

// ---------- roleta ----------
const corRoleta = n => (n === 0 ? 'verde' : VERMELHOS.has(n) ? 'verm' : 'preto');
const htmlRoleta = () => `
  <div class="cs-numero" id="csNum" aria-live="polite">?</div>
  <div class="formacoes centralizado">${Object.entries(PALPITES).map(([k, v]) =>
    `<button class="btn${CS.palpite === k ? '' : ' sec'}" aria-pressed="${CS.palpite === k}" onclick="csPalpite('${k}')">${v}</button>`).join('')}
    <label class="cs-cheio${typeof CS.palpite === 'number' ? ' sel' : ''}">Número cheio
      <input id="csN" type="number" min="0" max="36" inputmode="numeric" placeholder="0 a 36" value="${typeof CS.palpite === 'number' ? CS.palpite : ''}" onchange="csPalpite(this.value === '' ? NaN : +this.value)"></label>
  </div>
  <div class="acoes centralizado"><button class="btn" id="csBtn" onclick="csGirarRoleta()">Girar</button></div>`;
function csPalpite(p) {
  if (CS.ocupado) return;
  if (typeof p === 'number' && !(Number.isInteger(p) && p >= 0 && p <= 36)) return telaCassino('roleta');   // número inválido: volta ao que estava
  CS.palpite = p;
  telaCassino('roleta');
}
async function csGirarRoleta() {
  const n = girarRoleta(Math.random), aposta = CS.aposta, volta = aposta * multRoleta(CS.palpite, n);
  if (!await csApostar(volta)) return;
  csAnimar(16, k => {
    const el = $('csNum'), v = k >= 16 ? n : Math.floor(Math.random() * 37);
    if (el) { el.textContent = v; el.className = `cs-numero ${corRoleta(v)}`; }
  }, () => csFim(`Saiu ${n}. ${textoResultado(volta, aposta)}`));
}

// ---------- blackjack ----------
const cartaBj = c => `<span class="cs-carta${c && '♥♦'.includes(c.n) ? ' verm' : ''}">${c ? c.v + c.n : '?'}</span>`;
function htmlBj() {
  const b = CS.bj;
  if (!b) return `<div class="acoes centralizado"><button class="btn" id="csBtn" onclick="csBjDar()">Dar as cartas</button></div>
    <details class="dica"><summary>Regras</summary>Figuras valem 10 e o ás vale 11 ou 1. A banca compra até 17. Ganhar paga 2×, blackjack (ás + 10 nas duas primeiras cartas) paga 2,5×, empate devolve a aposta. Dobrar: dobra a aposta, recebe só mais uma carta e para.</details>`;
  const podeDobrar = b.jogador.length === 2 && saldoCassino() >= b.aposta;
  return `
  <div class="cs-mesa">
    <p><b>Banca</b> ${b.fim ? `· ${valorMao(b.banca)}` : ''}</p>
    <div class="cs-mao">${b.banca.map((c, i) => cartaBj(b.fim || i === 0 ? c : null)).join('')}</div>
    <p><b>Você</b> · ${valorMao(b.jogador)} <small class="dica">(aposta ${ICONE_MOEDA[CS.moeda]} ${b.aposta})</small></p>
    <div class="cs-mao">${b.jogador.map(cartaBj).join('')}</div>
  </div>
  <div class="acoes centralizado">${b.fim
    ? '<button class="btn" id="csBtn" onclick="csBjDar()">Nova mão</button>'
    : `<button class="btn" onclick="csBjPedir()">Pedir carta</button>
       <button class="btn sec" onclick="csBjFim()">Parar</button>
       ${podeDobrar ? '<button class="btn sec" onclick="csBjDobrar()">Dobrar</button>' : ''}`}</div>`;
}
async function csBjDar() {
  if (CS.ocupado || maoAberta()) return;
  if (saldoCassino() < CS.aposta) return avisoCassino(`Saldo insuficiente: você tem ${icCassino()} ${saldoCassino()}.`);
  CS.ocupado = true;
  if (!await pagarCassino(-CS.aposta)) { CS.ocupado = false; return avisoCassino(ERRO_SALDO); }
  const baralho = novoBaralho(Math.random);
  CS.bj = { baralho, jogador: [baralho.pop(), baralho.pop()], banca: [baralho.pop(), baralho.pop()], aposta: CS.aposta };
  CS.ocupado = false;
  if (ehBlackjack(CS.bj.jogador)) return csBjFim();
  telaCassino('bj');
}
function csBjPedir() {
  if (CS.ocupado || !maoAberta()) return;
  CS.bj.jogador.push(CS.bj.baralho.pop());
  if (valorMao(CS.bj.jogador) >= 21) return csBjFim();
  telaCassino('bj');
}
async function csBjDobrar() {
  const b = CS.bj;
  if (CS.ocupado || !maoAberta() || b.jogador.length !== 2 || saldoCassino() < b.aposta) return;
  CS.ocupado = true;
  if (!await pagarCassino(-b.aposta)) { CS.ocupado = false; return avisoCassino(ERRO_SALDO); }
  CS.ocupado = false;
  b.aposta *= 2;
  b.jogador.push(b.baralho.pop());
  csBjFim();
}
async function csBjFim() {
  const b = CS.bj;
  if (CS.ocupado || !maoAberta()) return;
  CS.ocupado = true;
  b.fim = true;
  if (valorMao(b.jogador) <= 21 && !ehBlackjack(b.jogador)) jogarBanca(b.banca, b.baralho);
  const volta = retornoBJ(b.jogador, b.banca, b.aposta);
  const ok = await pagarCassino(volta);
  if (CS.jogo !== 'bj') return;   // saiu da mesa enquanto gravava
  telaCassino('bj');
  avisoCassino(ok ? `${ehBlackjack(b.jogador) && volta > b.aposta ? 'Blackjack! ' : ''}${textoResultado(volta, b.aposta)}` : ERRO_SALDO);
}
