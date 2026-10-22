// Modo online (Firebase Realtime Database). v1.3: sincronizado — todo mundo passa pelas mesmas
// fases ao mesmo tempo (lobby → draft rodada a rodada com roleta ao vivo → revelação → tática →
// jogos um de cada vez), o anfitrião controla o ritmo (avança rodada/jogo), e só ele decide às
// cegas e velocidade na criação da sala. Ver DECISOES.md #20 e #23 pra decisões de arquitetura.

// ---------- pedaços que não dependem do Firebase (testáveis no Node) ----------
// Modos de jogo. porClube = quantos jogadores cada um escolhe de cada clube sorteado: o G12 tem 12
// clubes × 1, o Big Six tem 6 clubes × 2 — nos dois, 12 escolhas (11 titulares + reserva).
// vazio = quanto vale uma posição sem ninguém (repetido sem reserva). No G12 é 50, ~25 abaixo da média
// dos jogadores; no Big Six a média é ~9 mais alta, e com 50 fixo o buraco doía bem mais lá (mais gols
// e times mais desiguais nas simulações de tools/balanceamento.js). Então fica à mesma distância da média.
const mediaOvr = cs => { const o = cs.flatMap(c => c.jogadores.map(j => j.ovr)); return o.reduce((a, b) => a + b, 0) / o.length; };
const MODOS = {
  g12: { nome: 'G12', clubes: CLUBES, porClube: 1, bandeira: 'br', vazio: 50,
    resumo: 'A roleta sorteia um dos 12 grandes do Brasil e cada um escolhe 1 jogador às escondidas. Repetiu? Ninguém leva.' },
  big6: { nome: 'Big Six', clubes: CLUBES_BIG6, porClube: 2, bandeira: 'eng', vazio: Math.round(50 + mediaOvr(CLUBES_BIG6) - mediaOvr(CLUBES)),
    resumo: 'A roleta sorteia um dos 6 grandes da Inglaterra e cada um escolhe 2 jogadores às escondidas. Repetiu? Ninguém leva.' },
};
const modoDe = id => MODOS[id] || MODOS.g12;   // sala criada antes da 1.5 não tem modo: era G12
const CLUBE = Object.fromEntries([...CLUBES, ...CLUBES_BIG6].map(c => [c.id, c]));

// Escolha número k (0, 1...) do clube da rodada r fica guardada no índice r × porClube + k.
const indicePick = (r, k, porClube) => r * porClube + k;
const picksDaRodada = (p, r, porClube) =>
  Array.from({ length: porClube }, (_, k) => p.picks?.[indicePick(r, k, porClube)]).filter(x => x != null);

// As porClube escolhas de um bot num clube (a segunda nunca repete a primeira), já escaladas em t.
function picksDoBotNoClube(t, clube, futuros, nivel, porClube, jaEscolhidos = [], rng = Math.random) {
  const feitos = [];
  for (let k = 0; k < porClube; k++) {
    const restante = { ...clube, jogadores: clube.jogadores.filter(j => !feitos.some(f => f.j.id === j.id)) };
    const { j, i } = escolhaDoBot(t, restante, futuros, nivel, jaEscolhidos, rng, porClube);
    t.escalacao[i] = j;
    feitos.push({ j, i });
  }
  return feitos;
}
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const lerPref = k => { try { return localStorage.getItem(k); } catch { return null; } };
const salvarPref = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

function meuId() {
  let id = lerPref('participanteId');
  if (!id) { id = 'p' + Math.random().toString(36).slice(2, 10); salvarPref('participanteId', id); }
  return id;
}

// Sem 0/O/1/I pra não confundir quando alguém dita o código em voz alta pro grupo.
const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const gerarCodigo = () => Array.from({ length: 4 }, () => ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]).join('');

const jogadorPorId = id => CLUBE[id.split(':')[0]].jogadores.find(j => j.id === id);

// Reconstrói um time a partir do que veio da sala: cada "pick" é {jogador, slot}, uma
// entrada por rodada de draft. data.js é igual no aparelho de todo mundo, então o id basta —
// mandar o objeto do jogador inteiro pela rede seria redundante.
function timeDaSala(p, formacao, modo) {
  const t = novoTime(p.nome, formacao);
  t.vazio = modoDe(modo).vazio;
  Object.values(p.picks || {}).forEach(pick => { t.escalacao[pick.slot] = jogadorPorId(pick.jogador); });
  t.tatica = p.tatica || 'neutro';
  t.bot = p.bot || null;
  return t;
}

// Bot online: draft tudo de uma vez, sem ver ninguém (não tem "ver a rodada dos outros" pra um
// bot — ele não está numa sala de espera). A sabotagem do Impossível não tem o que sabotar aqui;
// o bônus explícito na partida continua valendo do mesmo jeito. Devolve o time (pra uso local) e
// o mapa de picks por rodada, no formato que a sala guarda.
function draftarBotOnline(p, clubesOrdem, formacao, porClube = 1) {
  const t = novoTime(p.nome, formacao);
  const picks = {};
  clubesOrdem.forEach((clubeId, r) => {
    const futuros = clubesOrdem.slice(r + 1).map(id => CLUBE[id]);
    picksDoBotNoClube(t, CLUBE[clubeId], futuros, p.bot, porClube)
      .forEach(({ j, i }, k) => { picks[indicePick(r, k, porClube)] = { jogador: j.id, slot: i }; });
  });
  return { t, picks };
}

// Uma rodada só avança quando TODO MUNDO (bots inclusive, mas eles já nascem com os picks prontos)
// fez todas as escolhas daquele clube. Pura — só olha o estado da sala.
const fezRodada = (sala, p, rodada) => picksDaRodada(p, rodada, modoDe(sala.modo).porClube).length === modoDe(sala.modo).porClube;
const rodadaCompleta = (sala, rodada) => Object.values(sala.participantes).every(p => fezRodada(sala, p, rodada));

// Tática: só os humanos precisam confirmar (bot não escolhe sozinho até aqui — ver taticaDoBot,
// calculado na hora de montar os jogos, sem precisar gravar nada na sala).
const taticaCompleta = sala => Object.values(sala.participantes).every(p => p.bot || p.taticaPronto);

if (typeof module !== 'undefined') module.exports = {
  MODOS, modoDe, CLUBE, indicePick, picksDaRodada, picksDoBotNoClube, fezRodada,
  meuId, gerarCodigo, jogadorPorId, timeDaSala, draftarBotOnline, rodadaCompleta, taticaCompleta,
  lerPref, salvarPref,
};

// ---------- Firebase (só existe no navegador, com o SDK carregado) ----------
let dbOnline;
function conectarFirebase() {
  if (dbOnline) return dbOnline;
  if (typeof firebase === 'undefined') throw new Error('Não consegui carregar o Firebase (sem internet?).');
  firebase.initializeApp(FIREBASE_CONFIG);
  dbOnline = firebase.database();
  return dbOnline;
}

async function criarSalaOnline(nome, formacao, cego, velocidade, modo = 'g12') {
  const db = conectarFirebase();
  const codigo = gerarCodigo();
  const id = meuId();
  const clubesOrdem = embaralharCom(modoDe(modo).clubes.map(c => c.id), Math.random);
  await db.ref(`salas/${codigo}`).set({
    criada: Date.now(), modo, formacao, clubesOrdem, semente: novaSemente(), anfitriao: id,
    cego: !!cego, velocidade: velocidade || 'normal',
    estado: 'lobby', rodadaAtual: 0,
    participantes: { [id]: { nome, bot: null, picks: {}, tatica: null, taticaPronto: false } },
  });
  return codigo;
}

async function entrarSalaOnline(codigo, nome) {
  const db = conectarFirebase();
  const ref = db.ref(`salas/${codigo}`);
  const snap = await ref.once('value');
  if (!snap.exists()) throw new Error('Sala não encontrada. Confere o código com quem criou.');
  const sala = snap.val();
  if (sala.estado !== 'lobby') throw new Error('Essa sala já começou — pede pra quem criou abrir outra.');
  const id = meuId();
  if (!sala.participantes[id] && Object.keys(sala.participantes).length >= 6) throw new Error('Essa sala já tem 6 jogadores (o máximo).');
  if (!sala.participantes[id]) {
    await ref.child(`participantes/${id}`).set({ nome, bot: null, picks: {}, tatica: null, taticaPronto: false });
  }
  return sala;
}

async function adicionarBotOnline(codigo, nivel) {
  const db = conectarFirebase();
  const id = 'bot' + Math.random().toString(36).slice(2, 8);
  const sala = (await db.ref(`salas/${codigo}`).once('value')).val();
  const { picks } = draftarBotOnline({ nome: `Bot ${NIVEIS[nivel]}`, bot: nivel }, sala.clubesOrdem, sala.formacao, modoDe(sala.modo).porClube);
  await db.ref(`salas/${codigo}/participantes/${id}`).set({
    nome: `Bot ${NIVEIS[nivel]}`, bot: nivel, picks, tatica: null, taticaPronto: false,
  });
  return id;
}

function ouvirSala(codigo, cb) {
  const db = conectarFirebase();
  const ref = db.ref(`salas/${codigo}`);
  ref.on('value', snap => cb(snap.val()));
  return () => ref.off('value');
}

const iniciarDraftOnline = codigo => conectarFirebase().ref(`salas/${codigo}/estado`).set('draft');

// indice = indicePick(rodada, k, porClube): no Big Six cada rodada tem duas escolhas
function registrarPickOnline(codigo, indice, slot, jogadorId) {
  return conectarFirebase().ref(`salas/${codigo}/participantes/${meuId()}/picks/${indice}`)
    .set({ jogador: jogadorId, slot });
}

const avancarRodadaOnline = (codigo, rodada) => conectarFirebase().ref(`salas/${codigo}/rodadaAtual`).set(rodada);

const iniciarRevelacaoOnline = (codigo, revelOrdem) =>
  conectarFirebase().ref(`salas/${codigo}`).update({ estado: 'revelacao', revelOrdem, revelAtual: 0 });

const avancarRevelacaoOnline = (codigo, i) => conectarFirebase().ref(`salas/${codigo}/revelAtual`).set(i);

const iniciarTaticaOnline = codigo => conectarFirebase().ref(`salas/${codigo}/estado`).set('tatica');

// reservaEm: slot onde a reserva joga (RES = banco). Sem isso gravado, vale reservaPadrao (bots).
const salvarTaticaOnline = (codigo, tatica, reservaEm) =>
  conectarFirebase().ref(`salas/${codigo}/participantes/${meuId()}`).update({ tatica, reservaEm, taticaPronto: true });

const iniciarJogosOnline = (codigo, jogosOrdem) =>
  conectarFirebase().ref(`salas/${codigo}`).update({ estado: 'jogos', jogosOrdem, jogoAtual: 0 });

const avancarJogoOnline = (codigo, i) => conectarFirebase().ref(`salas/${codigo}/jogoAtual`).set(i);

const finalizarOnline = codigo => conectarFirebase().ref(`salas/${codigo}/estado`).set('fim');
