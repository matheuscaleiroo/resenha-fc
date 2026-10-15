// Modo online (Firebase Realtime Database). Decisão de design (ver DECISOES.md #20):
// cada pessoa faz o PRÓPRIO draft no PRÓPRIO aparelho, na mesma sequência de clubes da sala
// (ninguém vê a escolha de ninguém até todo mundo terminar — como no modo local, só que sem
// precisar passar o aparelho). No final, cada time vira um punhado de IDs de jogador (strings),
// e a simulação das partidas usa uma semente compartilhada (rngDe, de logic.js) — assim todo
// aparelho calcula o MESMO resultado sem precisar sincronizar gol a gol pela rede.

// ---------- pedaços que não dependem do Firebase (testáveis no Node) ----------
const CLUBE = Object.fromEntries(CLUBES.map(c => [c.id, c]));
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

// Time -> só os IDs dos jogadores por slot (data.js é igual no aparelho de todo mundo, então o
// ID basta; mandar o objeto inteiro pela rede seria redundante).
const serializarTime = t => t.escalacao.map(j => j && j.id);
const jogadorPorId = id => CLUBE[id.split(':')[0]].jogadores.find(j => j.id === id);

// Reconstrói um time a partir do que veio da sala (participante salvo no Firebase).
function timeDaSala(p, formacao) {
  const t = novoTime(p.nome, formacao);
  t.escalacao = (p.escalacao || t.escalacao).map(id => (id ? jogadorPorId(id) : null));
  t.reservaCobre = p.reservaCobre || null;
  t.tatica = p.tatica || 'neutro';
  t.bot = p.bot || null;
  return t;
}

// Bot online: draft tudo de uma vez, sem ver ninguém (no online não existe "ver a rodada dos
// outros em tempo real" — cada humano joga no próprio tempo). A sabotagem do Impossível não
// tem o que sabotar aqui; o bônus explícito na partida continua valendo do mesmo jeito.
function draftarBotOnline(p, clubesOrdem, formacao) {
  const t = novoTime(p.nome, formacao);
  clubesOrdem.forEach((clubeId, r) => {
    const futuros = clubesOrdem.slice(r + 1).map(id => CLUBE[id]);
    const { j, i, cobre } = escolhaDoBot(t, CLUBE[clubeId], futuros, p.bot, [], Math.random);
    t.escalacao[i] = j;
    if (i === RES && cobre) t.reservaCobre = cobre;
  });
  return t;
}

if (typeof module !== 'undefined') module.exports = {
  meuId, gerarCodigo, serializarTime, jogadorPorId, timeDaSala, draftarBotOnline, lerPref, salvarPref,
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

async function criarSalaOnline(nome, formacao) {
  const db = conectarFirebase();
  const codigo = gerarCodigo();
  const id = meuId();
  const clubesOrdem = embaralharCom(CLUBES.map(c => c.id), Math.random);
  await db.ref(`salas/${codigo}`).set({
    criada: Date.now(), formacao, clubesOrdem, semente: novaSemente(), estado: 'draft', anfitriao: id,
    participantes: { [id]: { nome, bot: null, pronto: false, taticaPronto: false, escalacao: null, reservaCobre: null, tatica: null } },
  });
  return codigo;
}

async function entrarSalaOnline(codigo, nome) {
  const db = conectarFirebase();
  const ref = db.ref(`salas/${codigo}`);
  const snap = await ref.once('value');
  if (!snap.exists()) throw new Error('Sala não encontrada. Confere o código com quem criou.');
  const sala = snap.val();
  if (Object.keys(sala.participantes || {}).length >= 6) throw new Error('Essa sala já tem 6 jogadores (o máximo).');
  const id = meuId();
  if (!sala.participantes[id]) {
    await ref.child(`participantes/${id}`).set({ nome, bot: null, pronto: false, taticaPronto: false, escalacao: null, reservaCobre: null, tatica: null });
  }
  return sala;
}

async function adicionarBotOnline(codigo, nivel) {
  const db = conectarFirebase();
  const id = 'bot' + Math.random().toString(36).slice(2, 8);
  const sala = (await db.ref(`salas/${codigo}`).once('value')).val();
  const t = draftarBotOnline({ nome: `Bot ${NIVEIS[nivel]}`, bot: nivel }, sala.clubesOrdem, sala.formacao);
  await db.ref(`salas/${codigo}/participantes/${id}`).set({
    nome: `Bot ${NIVEIS[nivel]}`, bot: nivel, pronto: true, taticaPronto: true,
    escalacao: serializarTime(t), reservaCobre: t.reservaCobre, tatica: null,
  });
  return id;
}

function ouvirSala(codigo, cb) {
  const db = conectarFirebase();
  const ref = db.ref(`salas/${codigo}`);
  ref.on('value', snap => cb(snap.val()));
  return () => ref.off('value');
}

function salvarEscalacaoOnline(codigo, time) {
  const db = conectarFirebase();
  return db.ref(`salas/${codigo}/participantes/${meuId()}`).update({
    escalacao: serializarTime(time), reservaCobre: time.reservaCobre, pronto: true,
  });
}

function salvarTaticaOnline(codigo, tatica) {
  const db = conectarFirebase();
  return db.ref(`salas/${codigo}/participantes/${meuId()}`).update({ tatica, taticaPronto: true });
}

function avancarEstadoOnline(codigo, estado) {
  return conectarFirebase().ref(`salas/${codigo}/estado`).set(estado);
}
