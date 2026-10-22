// Telas e fluxo (DOM). Regras ficam em logic.js. Modo online fica em online.js (Firebase) —
// CLUBE, esc, lerPref e salvarPref são definidos lá (carrega antes deste arquivo).
const $app = document.getElementById('app');
const $ = id => document.getElementById(id);
const sortear = a => a[Math.floor(Math.random() * a.length)];
const embaralhar = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
let S = {}, SO = {}, relogio, oDesinscrever;

// ---------- preferências (tema, turbo, às cegas) ----------
// O tema salvo é aplicado já no index.html (antes de tudo carregar), pra não piscar o tema errado.
const raiz = document.documentElement;
const opcoes = { turbo: lerPref('turbo') === '1', cego: lerPref('cego') === '1', velocidade: lerPref('velocidade') || 'normal' };
function alternarOpcao(k) { opcoes[k] = !opcoes[k]; salvarPref(k, opcoes[k] ? '1' : '0'); }
// Velocidade da partida: ms de intervalo real por minuto simulado (90 minutos no total).
const VELOCIDADES = { lenta: 180, normal: 90, rapida: 40 };
const NOME_VELOCIDADE = { lenta: '🐢 Lenta', normal: '⚽ Normal', rapida: '⚡ Rápida' };
function escolherVelocidade(v) { S.participantes = lerParticipantes(); opcoes.velocidade = v; salvarPref('velocidade', v); telaSetup(); }
// 'sistema' segue o aparelho (sem data-theme); 'light'/'dark' forçam. Dia = claro, noite = escuro.
const TEMAS = { sistema: '📱 Do aparelho', light: '☀️ Dia', dark: '🌙 Noite' };
function definirTema(t) {
  if (t === 'sistema') delete raiz.dataset.theme; else raiz.dataset.theme = t;
  salvarPref('tema', t === 'sistema' ? '' : t);
  abrirConfig();
}

// ---------- janelas (configurações, novidades) e cantos fixos ----------
$('versao').textContent = `v${VERSAO}`;
function abrirJanela(html) {
  fecharJanela();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="janela-fundo" id="janela" onclick="if (event.target === this) fecharJanela()">
      <div class="janela" role="dialog" aria-modal="true">
        <button class="fechar" onclick="fecharJanela()" aria-label="Fechar">✕</button>${html}
      </div>
    </div>`);
  $('janela').querySelector('.janela button:not(.fechar)')?.focus();
}
function fecharJanela() { $('janela')?.remove(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharJanela(); });

function abrirConfig() {
  const atual = raiz.dataset.theme || 'sistema', noMenu = !!$app.querySelector('.tv');
  abrirJanela(`
    <h2>⚙ Configurações</h2>
    <h3>Tema</h3>
    <div class="acoes">${Object.entries(TEMAS).map(([k, v]) =>
      `<button class="btn${k === atual ? '' : ' sec'}" aria-pressed="${k === atual}" onclick="definirTema('${k}')">${v}</button>`).join('')}</div>
    <h3>Jogo</h3>
    <div class="acoes">
      <button class="btn sec" onclick="abrirNovidades()">★ Novidades da v${VERSAO}</button>
      ${noMenu ? '' : '<button class="btn sec" id="irMenu" onclick="irProMenu()">Voltar ao menu</button>'}
    </div>
    <p class="dica">Resenha FC · versão ${VERSAO}</p>`);
}
// Fora do menu, sair perde a partida em andamento: pede um segundo toque pra confirmar.
function irProMenu() {
  const b = $('irMenu');
  if (!b.dataset.confirmar) { b.dataset.confirmar = '1'; b.textContent = 'Toque de novo: o jogo atual se perde'; return; }
  fecharJanela();
  telaMenu();
}

// Novidades = a primeira seção do CHANGELOG.md (a versão atual), lida do próprio arquivo pra não
// manter o texto em dois lugares. Offline ela vem do cache do sw.js; abrindo o index.html direto
// do disco o navegador não deixa ler, e aí só avisa.
async function abrirNovidades() {
  abrirJanela(`<h2>★ Novidades</h2><p class="dica">Carregando…</p>`);
  let secao;
  try {
    const md = await (await fetch(`CHANGELOG.md?v=${VERSAO}`)).text();
    secao = md.split(/^## /m)[1];
  } catch {}
  if (!$('janela')) return;
  if (!secao) return abrirJanela('<h2>★ Novidades</h2><p>Não consegui ler as novidades agora. Abra o jogo pelo link (com internet) e tente de novo.</p>');
  const [titulo, ...linhas] = secao.trim().split('\n');
  const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
  const itens = linhas.filter(l => l.trim().startsWith('- ')).map(l => `<li>${inline(l.trim().slice(2))}</li>`);
  abrirJanela(`
    <h2>★ Novidades</h2>
    <p class="selo">Versão ${esc(titulo.trim())}</p>
    <ul class="novidades">${itens.join('')}</ul>
    <div class="acoes"><button class="btn" onclick="fecharJanela()">Bora jogar</button></div>`);
}

// ---------- pedaços ----------
const rodadaAtual = () => CLUBES.length - S.restantes.length + 1;
const cabecalhoRodada = () =>
  `<div class="rodada"><span>Rodada ${rodadaAtual()}/${CLUBES.length}</span><span>${S.clube ? CLUBE[S.clube].nome : ''}</span></div>`;
const mini = id => `<img class="mini" src="${CLUBE[id].escudo}" alt="${CLUBE[id].nome}" title="${CLUBE[id].nome}">`;
const cartaoClube = id =>
  `<div class="clube"><div class="escudo" style="border-bottom-color:${CLUBE[id].bg}"><img src="${CLUBE[id].escudo}" alt=""></div>${CLUBE[id].nome}</div>`;
const nomeTime = t => `${t.bot ? '🤖 ' : ''}${esc(t.nome)}`;
const bonusTxt = t => (t.bot && BONUS_BOT[t.bot] ? ` · <span class="bonus">${BONUS_BOT[t.bot] > 0 ? '+' : ''}${BONUS_BOT[t.bot]} de bônus de bot</span>` : '');
const taticaTxt = t => ` · ${TATICAS[t.tatica].icone} ${TATICAS[t.tatica].nome}`;

// Artilheiros do campeonato: soma os gols de cada jogador (gol contra tem autor nulo — não conta
// pra ninguém, igual o placar já trata). mapa = { jogadorId: { jogador, time, gols } }.
function registrarArtilheiro(mapa, time, autor) {
  if (!autor) return;
  mapa[autor.id] ??= { jogador: autor, time, gols: 0 };
  mapa[autor.id].gols++;
}
const artilheirosHtml = mapa => {
  const lista = Object.values(mapa).sort((a, b) => b.gols - a.gols || a.jogador.nome.localeCompare(b.jogador.nome));
  if (!lista.length) return '';
  return `<h3>Artilheiros ⚽</h3><div class="tabela"><table>
    <tr><th>Jogador</th><th>Time</th><th>Gols</th></tr>
    ${lista.map(x => `<tr><td>${mini(x.jogador.clube)} ${esc(x.jogador.nome)}</td><td>${nomeTime(x.time)}</td><td><b>${x.gols}</b></td></tr>`).join('')}
  </table></div>`;
};
const humanos = () => S.times.filter(t => !t.bot).length;

function placa(t, oculto) {
  const f = forca(t);
  const numeros = oculto ? 'OVR ??' : `OVR <b>${f.geral}</b> · ATQ ${Math.round(f.ataque)} · DEF ${Math.round(f.defesa)}`;
  return `<div class="placa"><h3>${nomeTime(t)}</h3><span>${t.formacao} · ${numeros}</span></div>`;
}

// Tela de tática: botões de postura, iguais no local e no online (fn = função chamada no clique).
const opcoesTatica = (t, fn) => `<div class="taticas">${Object.entries(TATICAS).map(([k, v]) => `
  <button class="tatica-op${t.tatica === k ? ' sel' : ''}" aria-pressed="${t.tatica === k}" onclick="${fn}('${k}')">
    <span class="tatica-icone">${v.icone}</span><b>${v.nome}${t.tatica === k ? ' <span class="marca">✓ escolhida</span>' : ''}</b><small>${v.dica}</small>
  </button>`).join('')}</div>`;

// Onde a reserva joga: banco ou qualquer posição do campo (buraco aberto ou no lugar de um titular).
// O overall mostrado já tem a penalidade de fora de posição (matriz PENALIDADE em logic.js).
function painelReserva(t, fn) {
  const r = jogadorReserva(t);
  if (!r) return '<p class="dica">Sem reserva no banco (ou ela foi repetida e saiu).</p>';
  const dono = i => (i === t.reservaEm ? t.escalacao[RES] : t.escalacao[i]);   // quem está no slot sem a reserva
  const slots = t.slots.map((_, i) => i).filter(i => i !== RES)
    .sort((x, y) => !!dono(x) - !!dono(y) || penalidade(r.pos, t.slots[x]) - penalidade(r.pos, t.slots[y]) || x - y);
  const op = (i, pos, ovr, legenda) => `
    <button class="chip-cobre${(t.reservaEm ?? RES) === i ? ' sel' : ''}" aria-pressed="${(t.reservaEm ?? RES) === i}" onclick="${fn}(${i})">
      <span class="pos">${pos}</span><b>${ovr}</b><small>${legenda}</small></button>`;
  return `<div class="banco-cobre">
    <h3>Reserva: ${esc(r.nome)} ${mini(r.clube)} <small class="dica">${r.pos} · ${r.ovr}</small></h3>
    <p class="dica">Escolha onde ele joga. Posição parecida (lateral ↔ zagueiro, meia ↔ atacante) perde pouco; linha no gol é desastre.</p>
    <div class="cobre-opcoes">
      ${op(RES, 'Banco', '—', 'fica de fora')}
      ${slots.map(i => op(i, t.slots[i], r.ovr - penalidade(r.pos, t.slots[i]), dono(i) ? `sai ${esc(dono(i).nome)} (${dono(i).ovr})` : 'vaga aberta')).join('')}
    </div></div>`;
}

function campo(t, oculto) {
  const chip = i => {
    const j = t.escalacao[i];
    if (!j) return `<div class="chip vazio"><span class="pos">${t.slots[i]}</span><b>—</b></div>`;
    const fora = i !== RES && j.pos !== t.slots[i];
    const ovr = oculto ? '??' : fora ? `${ovrEfetivo(t, i)} <s>${j.ovr}</s>` : j.ovr;
    const entrou = i !== RES && i === t.reservaEm ? ' ↺' : '';   // reserva que entrou em campo
    return `<div class="chip${fora ? ' fora' : ''}" ${fora ? `title="${j.pos} jogando de ${t.slots[i]}: −${penalidade(j.pos, t.slots[i])}"` : ''}>
      <span class="pos">${t.slots[i]}${fora ? ` ⚠ ${j.pos}` : ''}${entrou}</span><b>${esc(j.nome)}</b><span class="meta">${mini(j.clube)} ${ovr}</span></div>`;
  };
  let i = 0;
  const linhas = FORMACOES[t.formacao].map(l => `<div class="linha">${l.map(() => chip(i++)).join('')}</div>`);
  return `<div class="campo">${linhas.join('')}</div><div class="banco">${chip(RES)}</div>`;
}

// ---------- menu e setup ----------
function telaMenu() {
  clearInterval(relogio);
  if (oDesinscrever) { oDesinscrever(); oDesinscrever = null; }
  // tela de título 16-bit: placar de mentira com dois clubes sorteados, igual ao HUD do ISS
  const [ca, cb] = embaralhar(CLUBES.map(c => c.id));
  $app.innerHTML = `
  <section class="tela tv">
    <div class="hud" aria-hidden="true">
      <span class="hud-placar"><img src="${CLUBE[ca].escudo}" alt=""> 0-0 <img src="${CLUBE[cb].escudo}" alt=""></span>
      <span class="hud-tempo">1º 0:00</span>
    </div>
    <h1 class="logo-retro"><span class="l1">RESENHA</span><span class="l2">FC</span></h1>
    <p class="pisca">ESCOLHA O MODO</p>
    <nav class="menu-opcoes" aria-label="Modos de jogo">
      <button class="op ativo" onclick="telaSetup()"><b>G12</b><small>12 grandes · mesmo aparelho · bots</small></button>
      <button class="op" onclick="telaOnlineMenu()"><b>ONLINE</b><small>cada um no seu aparelho</small></button>
      <button class="op" disabled><b>EM BREVE</b><small>novos modos vindo aí</small></button>
    </nav>
    <button class="link-novidades" onclick="abrirNovidades()">★ NOVIDADES DA v${VERSAO}</button>
    <p class="copy">© ${new Date().getFullYear()} RESENHA FC<br>LICENCIADO PELA RESENHA</p>
  </section>`;
}

// Menu navegável no teclado como nos consoles: ← → movem o cursor ▶, Enter/Espaço escolhem.
// Mouse/toque também move o cursor (hover/foco), pra ▶ sempre marcar o que vai ser escolhido.
function marcarOpcao(op) { $app.querySelectorAll('.menu-opcoes .op').forEach(o => o.classList.toggle('ativo', o === op)); }
$app.addEventListener('pointerover', e => { const op = e.target.closest?.('.menu-opcoes .op:not(:disabled)'); if (op) marcarOpcao(op); });
$app.addEventListener('focusin', e => { if (e.target.matches?.('.menu-opcoes .op')) marcarOpcao(e.target); });
document.addEventListener('keydown', e => {
  const ops = [...$app.querySelectorAll('.menu-opcoes .op:not(:disabled)')];
  if (!ops.length || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return;
  const atual = Math.max(0, ops.findIndex(o => o.classList.contains('ativo')));
  if (e.key === 'Enter' || e.key === ' ') {
    if (document.activeElement?.matches('.menu-opcoes .op')) return;   // botão focado já trata sozinho
    e.preventDefault(); return ops[atual].click();
  }
  e.preventDefault();
  const passo = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
  ops[(atual + passo + ops.length) % ops.length].focus();
});

function lerParticipantes() {
  return [...document.querySelectorAll('.participante')].map((el, i) => {
    const nivel = el.querySelector('select')?.value || null;
    return { nome: el.querySelector('input').value.trim() || (nivel ? `Bot ${NIVEIS[nivel]}` : `Jogador ${i + 1}`), bot: nivel };
  });
}

function telaSetup() {
  S.participantes ??= [{ nome: '', bot: null }, { nome: '', bot: null }];
  S.formacao ??= '4-3-3';
  const ps = S.participantes, cheio = ps.length >= 6;
  $app.innerHTML = `
  <section class="tela">
    <button class="voltar" onclick="telaMenu()">← Menu</button>
    <h2>G12 · Quem vai jogar?</h2>
    <p class="dica">Todo mundo no mesmo aparelho: na sua vez, os outros não olham. Bots escolhem sozinhos.</p>
    <details class="dica"><summary>Como os bots jogam</summary>
      <b>Fácil</b>: escolhe no chute (−1 na partida). <b>Médio</b>: escolhe bem, com erros (+1).
      <b>Difícil</b>: escolhe bem e evita o craque óbvio pra não bater com você (+3).
      <b>Impossível</b>: vê o que você escolheu, nunca repete sem querer e copia de propósito pra te sabotar (+6).
    </details>
    <div class="participantes">${ps.map((p, i) => `
      <div class="participante">
        <span aria-hidden="true">${p.bot ? '🤖' : '👤'}</span>
        <input maxlength="16" aria-label="Nome ${i + 1}" placeholder="${p.bot ? `Bot ${NIVEIS[p.bot]}` : `Jogador ${i + 1}`}" value="${esc(p.nome)}">
        ${p.bot ? `<select aria-label="Dificuldade do bot">${Object.entries(NIVEIS).map(([k, v]) =>
          `<option value="${k}"${k === p.bot ? ' selected' : ''}>${v}</option>`).join('')}</select>` : ''}
        <button class="icone-x" onclick="removerParticipante(${i})" ${ps.length <= 2 ? 'disabled' : ''} aria-label="Remover">✕</button>
      </div>`).join('')}</div>
    <div class="acoes">
      <button class="btn sec" onclick="adicionarParticipante(null)" ${cheio ? 'disabled' : ''}>+ Pessoa</button>
      <button class="btn sec" onclick="adicionarParticipante('medio')" ${cheio ? 'disabled' : ''}>+ Bot 🤖</button>
    </div>
    <h3>Formação (igual pra todos)</h3>
    <div class="formacoes">${Object.keys(FORMACOES).map(f =>
      `<button class="btn${f === S.formacao ? '' : ' sec'}" aria-pressed="${f === S.formacao}" onclick="escolherFormacao('${f}')">${f}</button>`).join('')}
      <button class="btn sec" onclick="escolherFormacao(sortear(Object.keys(FORMACOES)))" aria-label="Sortear formação">🎲 Sortear</button></div>
    <h3>Velocidade da partida</h3>
    <div class="formacoes">${Object.keys(VELOCIDADES).map(v =>
      `<button class="btn${v === opcoes.velocidade ? '' : ' sec'}" aria-pressed="${v === opcoes.velocidade}" onclick="escolherVelocidade('${v}')">${NOME_VELOCIDADE[v]}</button>`).join('')}</div>
    <h3>Opções</h3>
    <div class="opcoes">
      <label><input type="checkbox" ${opcoes.turbo ? 'checked' : ''} onchange="alternarOpcao('turbo')"> ⚡ Roleta turbo</label>
      <label><input type="checkbox" ${opcoes.cego ? 'checked' : ''} onchange="alternarOpcao('cego')"> 🙈 Overalls às cegas <small>(só aparecem na revelação)</small></label>
    </div>
    <button class="btn" onclick="iniciar()">Começar draft</button>
  </section>`;
}

function adicionarParticipante(bot) { S.participantes = lerParticipantes(); S.participantes.push({ nome: '', bot }); telaSetup(); }
function removerParticipante(i) { S.participantes = lerParticipantes(); S.participantes.splice(i, 1); telaSetup(); }
function escolherFormacao(f) { S.participantes = lerParticipantes(); S.formacao = f; telaSetup(); }

function iniciar(participantes = lerParticipantes(), formacao = S.formacao) {
  const nomes = participantes.map(p => p.nome);
  const times = participantes.map((p, i) => ({
    ...novoTime(nomes.indexOf(p.nome) < i ? `${p.nome} ${i + 1}` : p.nome, formacao), bot: p.bot,
  }));
  // humanos primeiro: o bot impossível precisa ver o que eles escolheram
  const ordem = [...times.keys()].sort((a, b) => !!times[a].bot - !!times[b].bot);
  S = { participantes, formacao, times, ordem, restantes: CLUBES.map(c => c.id), picks: [] };
  telaRoleta();
}

// ---------- roleta ----------
function telaRoleta() {
  $app.innerHTML = `
  <section class="tela">
    ${cabecalhoRodada()}
    <div class="roleta"><div class="marcador"></div><div class="faixa" id="faixa">${Array.from({ length: 24 }, (_, i) => cartaoClube(S.restantes[i % S.restantes.length])).join('')}</div></div>
    <div class="resultado" id="resultado">
      <button class="btn" id="girar" onclick="girar()">Girar roleta</button>
      <label class="turbo"><input type="checkbox" ${opcoes.turbo ? 'checked' : ''} onchange="alternarOpcao('turbo')"> ⚡ Turbo</label>
    </div>
    <p class="dica">Ainda na roleta: ${S.restantes.map(id => CLUBE[id].nome).join(' · ')}</p>
  </section>`;
}

function girar() {
  $('girar').disabled = true;
  const sorteado = sortear(S.restantes), ALVO = opcoes.turbo ? 14 : 44;
  const ids = Array.from({ length: ALVO + 6 }, () => sortear(S.restantes));
  ids[ALVO] = sorteado;
  const faixa = $('faixa');
  faixa.innerHTML = ids.map(cartaoClube).join('');
  const carta = faixa.children[ALVO];
  const alvo = carta.offsetLeft + carta.offsetWidth / 2 - faixa.parentElement.clientWidth / 2 + (Math.random() - 0.5) * carta.offsetWidth * 0.7;
  const duracao = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.4 : opcoes.turbo ? 1.2 : 5;
  faixa.style.transition = `transform ${duracao}s cubic-bezier(.08,.7,.12,1)`;
  faixa.style.transform = `translateX(${-alvo}px)`;
  faixa.addEventListener('transitionend', () => {
    carta.classList.add('vencedor');
    S.clube = sorteado;
    $('resultado').innerHTML = `<p>Saiu ${mini(sorteado)} <strong>${CLUBE[sorteado].nome}</strong>!</p><button class="btn" onclick="S.vez = 0; proximaVez()">Começar escolhas</button>`;
  }, { once: true });
}

// ---------- escolha às cegas ----------
const timeDaVez = () => S.times[S.ordem[S.vez]];

function registrarEscolha(t, j, slot) {
  t.escalacao[slot] = j;
  S.picks.push({ clube: S.clube, time: t, j, slot });
}

function proximaVez() {
  for (; S.vez < S.ordem.length && timeDaVez().bot; S.vez++) {
    const t = timeDaVez();
    const jaEscolhidos = S.picks.filter(p => p.clube === S.clube).map(p => p.j.id);
    const futuros = S.restantes.filter(id => id !== S.clube).map(id => CLUBE[id]);
    const { j, i } = escolhaDoBot(t, CLUBE[S.clube], futuros, t.bot, jaEscolhidos);
    registrarEscolha(t, j, i);
  }
  if (S.vez < S.ordem.length) return humanos() > 1 ? telaVez() : telaEscolha();
  S.restantes = S.restantes.filter(id => id !== S.clube);
  S.clube = null;
  S.restantes.length ? telaRoleta() : telaSuspense();
}

function telaVez() {
  $app.innerHTML = `
  <section class="tela centro">
    ${cabecalhoRodada()}
    <p class="dica">Passe o aparelho para</p>
    <h2 class="grande">${esc(timeDaVez().nome)}</h2>
    <p>O resto: não olha! 👀</p>
    <button class="btn" onclick="telaEscolha()">Sou eu, mostrar ${CLUBE[S.clube].nome}</button>
  </section>`;
}

function telaEscolha(sel) {
  const t = timeDaVez(), c = CLUBE[S.clube], j = c.jogadores[sel], cego = opcoes.cego;
  let acao = '<p class="dica">Toque num jogador pra escalar. Jogador de posição já preenchida só entra como reserva.</p>';
  if (j) {
    const livres = slotsLivres(t, j.pos);
    const tit = livres.find(i => i !== RES), res = livres.find(i => i === RES);
    acao = `<div class="acoes">
      ${tit !== undefined ? `<button class="btn" onclick="confirmar(${sel}, ${tit})">Escalar ${esc(j.nome)} (${j.pos})</button>` : ''}
      ${res !== undefined ? `<button class="btn${tit !== undefined ? ' sec' : ''}" onclick="confirmar(${sel}, ${res})">${esc(j.nome)} pro banco</button>` : ''}
    </div>${res !== undefined ? '<p class="dica">Onde a reserva vai jogar você decide depois da revelação, na tela da tática.</p>' : ''}`;
  }
  $app.innerHTML = `
  <section class="tela">
    ${cabecalhoRodada()}
    <h2>${mini(c.id)} ${esc(t.nome)}: escolha do ${c.nome}</h2>
    ${acao}
    <div class="escolha">
      <div class="lista">${c.jogadores.map((p, i) => `
        <button class="jogador${i === sel ? ' sel' : ''}" onclick="telaEscolha(${i})" ${slotsLivres(t, p.pos).length ? '' : 'disabled'}>
          <span class="pos">${p.pos}</span><span class="nome">${esc(p.nome)}</span><span class="ovr">${cego ? '??' : p.ovr}</span>
        </button>`).join('')}</div>
      <div>${placa(t, cego)}${campo(t, cego)}</div>
    </div>
  </section>`;
}

function confirmar(i, slot) {
  registrarEscolha(timeDaVez(), CLUBE[S.clube].jogadores[i], slot);
  S.vez++;
  proximaVez();
}

// ---------- online (salas pelo Firebase, ver online.js) ----------
// v1.3: sincronizado. Todo mundo passa pelas mesmas fases junto (lobby → draft rodada a rodada
// com roleta ao vivo → revelação → tática → jogos um de cada vez) e o ANFITRIÃO controla o ritmo
// (manda a rodada, revela o próximo clube, libera o próximo jogo). Só o anfitrião decide às cegas
// e velocidade, na criação — não dá mais pra cada um escolher por conta, numa sala compartilhada.
function telaOnlineMenu() {
  if (oDesinscrever) { oDesinscrever(); oDesinscrever = null; }
  $app.innerHTML = `
  <section class="tela">
    <button class="voltar" onclick="telaMenu()">← Menu</button>
    <h2>Jogar online</h2>
    <p class="dica">Cada um no seu aparelho, mas sincronizado: todo mundo vê a mesma roleta, a mesma revelação e os mesmos jogos, no mesmo momento.</p>
    <div class="modos">
      <button class="modo" onclick="telaCriarSala()"><h2>Criar sala</h2><p>Você escolhe a formação e as opções, e manda o código pros seus amigos.</p></button>
      <button class="modo" onclick="telaEntrarSala()"><h2>Entrar em sala</h2><p>Alguém já criou? Entra com o código.</p></button>
    </div>
  </section>`;
}

function telaCriarSala(nomeAtual) {
  SO.formacao ??= '4-3-3';
  SO.cego ??= opcoes.cego;
  SO.velocidade ??= opcoes.velocidade;
  const nome = nomeAtual ?? lerPref('nomeOnline') ?? '';
  $app.innerHTML = `
  <section class="tela">
    <button class="voltar" onclick="telaOnlineMenu()">← Online</button>
    <h2>Criar sala</h2>
    <div class="nomes"><input id="oNome" maxlength="16" placeholder="Seu nome" value="${esc(nome)}"></div>
    <h3>Formação (igual pra todos)</h3>
    <div class="formacoes">${Object.keys(FORMACOES).map(f =>
      `<button class="btn${f === SO.formacao ? '' : ' sec'}" aria-pressed="${f === SO.formacao}" onclick="SO.formacao='${f}'; telaCriarSala($('oNome').value)">${f}</button>`).join('')}
      <button class="btn sec" onclick="SO.formacao = sortear(Object.keys(FORMACOES)); telaCriarSala($('oNome').value)">🎲 Sortear</button></div>
    <h3>Opções da sala <small>(só você decide — os outros seguem)</small></h3>
    <div class="opcoes">
      <label><input type="checkbox" ${SO.cego ? 'checked' : ''} onchange="SO.cego = this.checked"> 🙈 Overalls às cegas <small>(só aparecem na revelação)</small></label>
    </div>
    <div class="formacoes">${Object.keys(VELOCIDADES).map(v =>
      `<button class="btn${v === SO.velocidade ? '' : ' sec'}" aria-pressed="${v === SO.velocidade}" onclick="SO.velocidade='${v}'; telaCriarSala($('oNome').value)">${NOME_VELOCIDADE[v]}</button>`).join('')}</div>
    <p class="dica" id="oErro"></p>
    <button class="btn" id="oBtn" onclick="criarSalaClique()">Criar sala</button>
  </section>`;
}

async function criarSalaClique() {
  const nome = $('oNome').value.trim() || 'Jogador';
  salvarPref('nomeOnline', nome);
  $('oBtn').disabled = true;
  try {
    const codigo = await criarSalaOnline(nome, SO.formacao, SO.cego, SO.velocidade);
    telaSalaCriada(codigo);
  } catch (e) { $('oErro').textContent = '⚠ ' + e.message; $('oBtn').disabled = false; }
}

// Mostra o código antes de entrar na sala de espera — sem essa tela, quem cria a sala nunca via
// o código pra mandar pros amigos.
function telaSalaCriada(codigo) {
  $app.innerHTML = `
  <section class="tela centro">
    <p class="dica">Sala criada! Manda esse código pro grupo:</p>
    <h1 class="grande" id="oCodigoGrande">${esc(codigo)}</h1>
    <div class="acoes centralizado">
      <button class="btn sec" id="oCopiar" onclick="copiarCodigoClique('${codigo}')">📋 Copiar código</button>
    </div>
    <p class="dica">Cada um entra em <b>Online → Entrar em sala</b> com esse código. Quando todo mundo estiver na sala, você começa o draft pra todo mundo.</p>
    <button class="btn" onclick="entrarNaSalaLocal('${codigo}')">Ir pra sala de espera</button>
  </section>`;
}

function copiarCodigoClique(codigo) {
  navigator.clipboard?.writeText(codigo).then(
    () => { $('oCopiar').textContent = '✅ Copiado!'; setTimeout(() => { if ($('oCopiar')) $('oCopiar').textContent = '📋 Copiar código'; }, 1500); },
    () => {},
  );
}

function telaEntrarSala(codigoAtual, nomeAtual) {
  const codigo = codigoAtual ?? '', nome = nomeAtual ?? lerPref('nomeOnline') ?? '';
  $app.innerHTML = `
  <section class="tela">
    <button class="voltar" onclick="telaOnlineMenu()">← Online</button>
    <h2>Entrar em sala</h2>
    <div class="nomes">
      <input id="oCodigo" maxlength="4" placeholder="Código (ex: ABCD)" style="text-transform:uppercase" value="${esc(codigo)}">
      <input id="oNome" maxlength="16" placeholder="Seu nome" value="${esc(nome)}">
    </div>
    <p class="dica">Às cegas e velocidade já vêm decididos por quem criou a sala.</p>
    <p class="dica" id="oErro"></p>
    <button class="btn" id="oBtn" onclick="entrarSalaClique()">Entrar</button>
  </section>`;
}

async function entrarSalaClique() {
  const codigo = $('oCodigo').value.trim().toUpperCase(), nome = $('oNome').value.trim() || 'Jogador';
  salvarPref('nomeOnline', nome);
  $('oBtn').disabled = true;
  try {
    await entrarSalaOnline(codigo, nome);
    entrarNaSalaLocal(codigo);
  } catch (e) { $('oErro').textContent = '⚠ ' + e.message; $('oBtn').disabled = false; }
}

// Ponteiro do que este aparelho já renderizou por último — só re-renderiza sozinho quando a fase
// (ou a rodada/revelação/jogo dentro da fase) realmente muda, ou quando a pessoa já está numa tela
// de espera (aí o contador "X/Y" precisa atualizar ao vivo). Nunca interrompe quem está no meio de
// uma escolha (draft, tática) só porque outra pessoa fez algo em paralelo.
function entrarNaSalaLocal(codigo) {
  SO.codigo = codigo;
  if (oDesinscrever) oDesinscrever();
  let primeira = true;
  oDesinscrever = ouvirSala(codigo, sala => {
    SO.sala = sala;
    if (primeira) { primeira = false; return roteirarOnline(); }
    const eu = sala.participantes?.[meuId()];
    if (!eu) return;
    const u = SO._ultimo || {};
    const mudouFase = sala.estado !== u.estado;
    const mudouRodada = sala.estado === 'draft' && sala.rodadaAtual !== u.rodadaAtual;
    const mudouRevel = sala.estado === 'revelacao' && sala.revelAtual !== u.revelAtual;
    const mudouJogo = sala.estado === 'jogos' && sala.jogoAtual !== u.jogoAtual;
    const jaFiz = sala.estado === 'draft' ? eu.picks?.[sala.rodadaAtual] != null
      : sala.estado === 'tatica' ? (!!eu.bot || !!eu.taticaPronto) : false;
    const naTelaEspera = !!($app.querySelector('.espera-lista') || $app.querySelector('.espera-rodada'));
    if (mudouFase || mudouRodada || mudouRevel || mudouJogo || (jaFiz && naTelaEspera)) roteirarOnline();
  });
}

function roteirarOnline() {
  const sala = SO.sala, eu = sala?.participantes?.[meuId()];
  if (!sala || !eu) return;
  SO._ultimo = { estado: sala.estado, rodadaAtual: sala.rodadaAtual, revelAtual: sala.revelAtual, jogoAtual: sala.jogoAtual };
  if (sala.estado === 'lobby') return telaLobbyOnline();
  if (sala.estado === 'draft') return (eu.picks?.[sala.rodadaAtual] != null) ? telaEsperaRodadaOnline() : telaRoletaVivaOnline();
  if (sala.estado === 'revelacao') return telaRevelacaoOnline();
  if (sala.estado === 'tatica') return (!eu.bot && !eu.taticaPronto) ? telaEscolhaTaticaOnline() : telaEsperaTaticaOnline();
  if (sala.estado === 'jogos') return telaJogoOnline();
  if (sala.estado === 'fim') return telaFinalOnline();
}

// ---------- lobby ----------
function telaLobbyOnline() {
  const sala = SO.sala, participantes = Object.values(sala.participantes), souAnfitriao = sala.anfitriao === meuId();
  $app.innerHTML = `
  <section class="tela centro">
    <p class="dica">Sala <b>${esc(SO.codigo)}</b> · manda esse código pros seus amigos</p>
    <h2 class="grande">Sala de espera</h2>
    <ul class="espera-lista">${participantes.map(p => `<li>${p.bot ? '🤖' : '👤'} ${esc(p.nome)}</li>`).join('')}</ul>
    <p class="dica">${sala.formacao} · ${sala.cego ? '🙈 às cegas' : '👀 overalls visíveis'} · ${NOME_VELOCIDADE[sala.velocidade]}</p>
    ${souAnfitriao ? `
      <div class="acoes centralizado">${Object.keys(NIVEIS).map(n => `<button class="btn sec" onclick="adicionarBotClique('${n}')">+ ${NIVEIS[n]} 🤖</button>`).join('')}</div>
      <button class="btn" ${participantes.length < 2 ? 'disabled' : ''} onclick="comecarDraftClique()">Começar o draft pra todo mundo 🎲</button>
    ` : '<p class="dica">Esperando o anfitrião começar o draft...</p>'}
  </section>`;
}
async function adicionarBotClique(nivel) { await adicionarBotOnline(SO.codigo, nivel); }
async function comecarDraftClique() { await iniciarDraftOnline(SO.codigo); }

// ---------- draft (rodada a rodada, roleta ao vivo) ----------
const meuTimeParcial = sala => timeDaSala(sala.participantes[meuId()], sala.formacao);

function telaRoletaVivaOnline() {
  const sala = SO.sala, alvo = sala.clubesOrdem[sala.rodadaAtual];
  $app.innerHTML = `
  <section class="tela">
    <div class="rodada"><span>Sala ${esc(SO.codigo)} · Rodada ${sala.rodadaAtual + 1}/${sala.clubesOrdem.length}</span><span></span></div>
    <div class="roleta"><div class="marcador"></div><div class="faixa" id="faixaO"></div></div>
    <div class="resultado" id="resultadoO"></div>
  </section>`;
  const ALVO = 24;
  const ids = Array.from({ length: ALVO + 6 }, () => sortear(sala.clubesOrdem));
  ids[ALVO] = alvo;
  const faixa = $('faixaO');
  faixa.innerHTML = ids.map(cartaoClube).join('');
  const carta = faixa.children[ALVO];
  requestAnimationFrame(() => {
    const alvoPx = carta.offsetLeft + carta.offsetWidth / 2 - faixa.parentElement.clientWidth / 2;
    const duracao = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.4 : 2.2;
    faixa.style.transition = `transform ${duracao}s cubic-bezier(.08,.7,.12,1)`;
    faixa.style.transform = `translateX(${-alvoPx}px)`;
    faixa.addEventListener('transitionend', () => {
      carta.classList.add('vencedor');
      $('resultadoO').innerHTML = `<p>Saiu ${mini(alvo)} <strong>${CLUBE[alvo].nome}</strong>!</p><button class="btn" onclick="telaEscolherRodadaOnline()">Escolher meu jogador</button>`;
    }, { once: true });
  });
}

function telaEscolherRodadaOnline(sel) {
  const sala = SO.sala, rodada = sala.rodadaAtual, c = CLUBE[sala.clubesOrdem[rodada]], cego = sala.cego;
  const meuTime = meuTimeParcial(sala);
  let acao = '<p class="dica">Toque num jogador pra escalar. Jogador de posição já preenchida só entra como reserva.</p>';
  if (sel != null) {
    const j = c.jogadores[sel], livres = slotsLivres(meuTime, j.pos);
    const tit = livres.find(i => i !== RES), res = livres.find(i => i === RES);
    acao = `<div class="acoes">
      ${tit !== undefined ? `<button class="btn" onclick="confirmarPickOnline(${sel}, ${tit})">Escalar ${esc(j.nome)} (${j.pos})</button>` : ''}
      ${res !== undefined ? `<button class="btn${tit !== undefined ? ' sec' : ''}" onclick="confirmarPickOnline(${sel}, ${res})">${esc(j.nome)} pro banco</button>` : ''}
    </div>${res !== undefined ? '<p class="dica">Onde a reserva vai jogar você decide depois da revelação, na tela da tática.</p>' : ''}`;
  }
  $app.innerHTML = `
  <section class="tela">
    <div class="rodada"><span>Sala ${esc(SO.codigo)} · Rodada ${rodada + 1}/${sala.clubesOrdem.length}</span><span>${c.nome}</span></div>
    ${acao}
    <div class="escolha">
      <div class="lista">${c.jogadores.map((p, i) => `
        <button class="jogador${i === sel ? ' sel' : ''}" onclick="telaEscolherRodadaOnline(${i})" ${slotsLivres(meuTime, p.pos).length ? '' : 'disabled'}>
          <span class="pos">${p.pos}</span><span class="nome">${esc(p.nome)}</span><span class="ovr">${cego ? '??' : p.ovr}</span></button>`).join('')}</div>
      <div>${placa(meuTime, cego)}${campo(meuTime, cego)}</div>
    </div>
  </section>`;
}

async function confirmarPickOnline(i, slot) {
  const sala = SO.sala, rodada = sala.rodadaAtual, j = CLUBE[sala.clubesOrdem[rodada]].jogadores[i];
  await registrarPickOnline(SO.codigo, rodada, slot, j.id);
  SO.sala.participantes[meuId()].picks ??= {};
  SO.sala.participantes[meuId()].picks[rodada] = { jogador: j.id, slot };   // atualização local otimista
  roteirarOnline();
}

function telaEsperaRodadaOnline() {
  const sala = SO.sala, participantes = Object.values(sala.participantes);
  const prontos = participantes.filter(p => p.picks?.[sala.rodadaAtual] != null).length;
  const todosProntos = prontos === participantes.length, souAnfitriao = sala.anfitriao === meuId();
  const ultimaRodada = sala.rodadaAtual === sala.clubesOrdem.length - 1;
  $app.innerHTML = `
  <section class="tela centro espera-rodada">
    <p class="dica">Rodada ${sala.rodadaAtual + 1}/${sala.clubesOrdem.length}</p>
    <h2 class="grande">${prontos}/${participantes.length} escolheram</h2>
    <ul class="espera-lista">${participantes.map(p => `<li>${p.picks?.[sala.rodadaAtual] != null ? '✅' : '⏳'} ${esc(p.nome)}${p.bot ? ' 🤖' : ''}</li>`).join('')}</ul>
    ${souAnfitriao
      ? `<button class="btn" ${todosProntos ? '' : 'disabled'} onclick="${ultimaRodada ? 'irPraRevelacaoClique()' : 'proximaRodadaClique()'}">${ultimaRodada ? 'Todo mundo pronto! Ver a revelação 🎭' : 'Todo mundo pronto! Próxima rodada 🎲'}</button>`
      : '<p class="dica">Só quem criou a sala avança a rodada.</p>'}
  </section>`;
}
async function proximaRodadaClique() { await avancarRodadaOnline(SO.codigo, SO.sala.rodadaAtual + 1); }
async function irPraRevelacaoClique() {
  const revelOrdem = embaralharCom(SO.sala.clubesOrdem.slice(), Math.random);
  await iniciarRevelacaoOnline(SO.codigo, revelOrdem);
}

// ---------- revelação (clube a clube, ao vivo) ----------
function telaRevelacaoOnline() {
  const sala = SO.sala, id = sala.revelOrdem[sala.revelAtual], ultimo = sala.revelAtual === sala.revelOrdem.length - 1;
  const souAnfitriao = sala.anfitriao === meuId(), slotsFormacao = novoTime('', sala.formacao).slots;
  const rodadaDesseClube = sala.clubesOrdem.indexOf(id);
  const picks = embaralhar(Object.values(sala.participantes)
    .map(p => ({ p, pick: p.picks?.[rodadaDesseClube] })).filter(x => x.pick));
  const conta = {};
  picks.forEach(x => (conta[x.pick.jogador] = (conta[x.pick.jogador] || 0) + 1));
  const bateu = picks.some(x => conta[x.pick.jogador] > 1);
  const passo = 0.7;
  $app.innerHTML = `
  <section class="tela centro">
    <p class="dica">Clube ${sala.revelAtual + 1} de ${sala.revelOrdem.length}</p>
    <img class="escudo-grande" src="${CLUBE[id].escudo}" alt="">
    <h2>${CLUBE[id].nome}</h2>
    <div class="cartas">${picks.map((x, k) => { const j = jogadorPorId(x.pick.jogador); return `
      <div class="carta${conta[x.pick.jogador] > 1 ? ' repetido' : ''}" style="animation-delay:${k * passo}s">
        <small>${x.p.bot ? '🤖 ' : ''}${esc(x.p.nome)}</small>
        <b>${esc(j.nome)}</b>
        <span>${x.pick.slot === RES ? 'Banco' : slotsFormacao[x.pick.slot]} · ${j.ovr}</span>
        ${conta[x.pick.jogador] > 1 ? `<em style="animation-delay:${picks.length * passo}s">REPETIDO</em>` : ''}
      </div>`; }).join('')}</div>
    <p class="veredito" style="animation-delay:${picks.length * passo}s">${bateu ? '💥 Bateram! Ninguém leva.' : 'Cada um na sua.'}</p>
    ${souAnfitriao ? `
      <div class="acoes centralizado">
        <button class="btn" onclick="${ultimo ? 'irPraTaticaClique()' : 'proximoRevelClique()'}">${ultimo ? 'Ver os times e a tática' : 'Próximo clube'}</button>
        ${ultimo ? '' : `<button class="btn sec" onclick="irPraTaticaClique()">Pular o resto</button>`}
      </div>` : '<p class="dica">Esperando o anfitrião avançar...</p>'}
  </section>`;
}
async function proximoRevelClique() { await avancarRevelacaoOnline(SO.codigo, SO.sala.revelAtual + 1); }
async function irPraTaticaClique() { await iniciarTaticaOnline(SO.codigo); }

// ---------- tática (só depois da revelação, time já definitivo) ----------
// O time é remontado da sala a cada render, então a escolha (tática + onde a reserva joga) mora em
// SO.escolhaTatica e é reaplicada por cima. Antes ela era gravada no time remontado e se perdia no
// próprio re-render do clique — por isso a tática nunca saía do Neutro no online.
function telaEscolhaTaticaOnline() {
  const meu = montarTimesOnline(SO.sala)[meuId()];
  if (SO.escolhaTatica?.codigo !== SO.codigo) SO.escolhaTatica = { codigo: SO.codigo, tatica: 'neutro', reservaEm: meu.reservaEm };
  meu.tatica = SO.escolhaTatica.tatica;
  moverReserva(meu, SO.escolhaTatica.reservaEm);
  $app.innerHTML = `
  <section class="tela">
    <h2>${esc(meu.nome)}: qual vai ser a postura?</h2>
    ${opcoesTatica(meu, 'escolherTaticaOnline')}
    ${painelReserva(meu, 'escolherReservaOnline')}
    ${placa(meu)}${campo(meu)}
    <button class="btn" onclick="confirmarTaticaOnline()">Confirmar e esperar os outros</button>
  </section>`;
}
function escolherTaticaOnline(k) { SO.escolhaTatica.tatica = k; telaEscolhaTaticaOnline(); }
function escolherReservaOnline(slot) { SO.escolhaTatica.reservaEm = slot; telaEscolhaTaticaOnline(); }
async function confirmarTaticaOnline() {
  await salvarTaticaOnline(SO.codigo, SO.escolhaTatica.tatica, SO.escolhaTatica.reservaEm);
  SO.sala.participantes[meuId()].taticaPronto = true;   // atualização local otimista
  roteirarOnline();
}
function telaEsperaTaticaOnline() {
  const sala = SO.sala, participantes = Object.values(sala.participantes);
  const humanos = participantes.filter(p => !p.bot);
  const prontos = humanos.filter(p => p.taticaPronto).length, todosProntos = prontos === humanos.length;
  const souAnfitriao = sala.anfitriao === meuId();
  $app.innerHTML = `
  <section class="tela centro espera-rodada">
    <p class="dica">Sala ${esc(SO.codigo)}</p>
    <h2 class="grande">${prontos}/${humanos.length} escolheram a tática</h2>
    <ul class="espera-lista">${participantes.map(p => `<li>${(p.bot || p.taticaPronto) ? '✅' : '⏳'} ${esc(p.nome)}${p.bot ? ' 🤖' : ''}</li>`).join('')}</ul>
    ${souAnfitriao
      ? `<button class="btn" ${todosProntos ? '' : 'disabled'} onclick="comecarJogosClique()">Todo mundo pronto! Bola rolando ⚽</button>`
      : '<p class="dica">Só quem criou a sala inicia as partidas.</p>'}
  </section>`;
}
async function comecarJogosClique() {
  const sala = SO.sala, ids = Object.keys(sala.participantes), pares = [];
  ids.forEach((a, i) => ids.forEach((b, j) => i < j && pares.push([a, b])));
  const jogosOrdem = embaralharCom(pares, rngDe(sala.semente));
  await iniciarJogosOnline(SO.codigo, jogosOrdem);
}

// ---------- jogos (um de cada vez, anfitrião libera o próximo) ----------
// Tudo recalculado do zero a cada render (times + tabela até aqui), nunca guardado só na memória
// local — assim funciona igual pra quem acompanhou desde o início e pra quem recarregou a página.
// Como registrar() (local), mas recebe as próprias linhas da tabela, não índices em S.tabela
// (não existe S.tabela no online — os times vêm de montarTimesOnline, recalculados do zero).
function registrarTabelaOnline(A, B, [ga, gb]) {
  A.j++; B.j++; A.gp += ga; A.gc += gb; B.gp += gb; B.gc += ga;
  if (ga > gb) { A.v++; A.p += 3; B.d++; } else if (gb > ga) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
}

function montarTimesOnline(sala) {
  const times = Object.fromEntries(Object.entries(sala.participantes).map(([id, p]) => [id, Object.assign(timeDaSala(p, sala.formacao), { _id: id })]));
  const todos = Object.values(times);
  resolverDuplicados(todos);
  // reserva: onde a pessoa mandou na tela de tática; sem escolha gravada (bots), o buraco que dói menos
  todos.forEach(t => moverReserva(t, sala.participantes[t._id].reservaEm ?? reservaPadrao(t)));
  todos.forEach(t => { if (t.bot) t.tatica = taticaDoBot(t, todos); });
  return times;
}

function telaJogoOnline() {
  clearInterval(relogio);
  const sala = SO.sala, times = montarTimesOnline(sala);
  const [idA, idB] = sala.jogosOrdem[sala.jogoAtual], a = times[idA], b = times[idB];
  const mataMata = sala.jogosOrdem.length === 1;
  const r = simular(a, b, mataMata, rngDe(sala.semente + sala.jogoAtual + 1));
  const souAnfitriao = sala.anfitriao === meuId(), ultimo = sala.jogoAtual === sala.jogosOrdem.length - 1;
  $app.innerHTML = `
  <section class="tela">
    <p class="dica">Sala ${esc(SO.codigo)} · ${sala.jogosOrdem.length > 1 ? `Jogo ${sala.jogoAtual + 1} de ${sala.jogosOrdem.length}` : 'Grande final'}</p>
    <div class="placar">
      <div class="lado">${nomeTime(a)}<small>OVR ${forca(a).geral}${bonusTxt(a)}${taticaTxt(a)}</small></div>
      <div class="gols"><span id="g0">0</span> × <span id="g1">0</span><small id="min">0'</small></div>
      <div class="lado">${nomeTime(b)}<small>OVR ${forca(b).geral}${bonusTxt(b)}${taticaTxt(b)}</small></div>
    </div>
    <div class="acoes" id="fim"><button class="btn sec" id="pular">Pular</button></div>
    <ol class="lances" id="lances"></ol>
  </section>`;
  let m = 0;
  const gols = [0, 0];
  const fimAnim = () => {
    clearInterval(relogio);
    $('min').textContent = 'Fim de jogo';
    if (r.penaltis) $('lances').insertAdjacentHTML('afterbegin', `<li class="pen">Pênaltis: ${r.penaltis[0]} × ${r.penaltis[1]}</li>`);
    if (!r.eventos.length && !r.penaltis) $('lances').innerHTML = '<li>Zero a zero. Jogo de compadres.</li>';
    $('fim').innerHTML = souAnfitriao
      ? `<button class="btn" onclick="${ultimo ? 'finalizarClique()' : 'proximoJogoClique()'}">${ultimo ? 'Ver campeão 🏆' : 'Próximo jogo'}</button>`
      : '<p class="dica">Esperando o anfitrião avançar...</p>';
  };
  const tick = () => {
    m++;
    r.eventos.filter(e => e.min === m).forEach(e => {
      $('g' + e.lado).textContent = ++gols[e.lado];
      $('lances').insertAdjacentHTML('afterbegin',
        `<li><b>${e.min}'</b> ⚽ ${e.autor ? `${esc(e.autor.nome)} ${mini(e.autor.clube)}` : 'Gol contra'} · <small>${nomeTime(e.lado === 0 ? a : b)}</small></li>`);
    });
    $('min').textContent = `${m}'`;
    if (m >= 90) fimAnim();
  };
  relogio = setInterval(tick, VELOCIDADES[sala.velocidade] ?? VELOCIDADES.normal);
  $('pular').onclick = () => { while (m < 90) tick(); };
}
async function proximoJogoClique() { await avancarJogoOnline(SO.codigo, SO.sala.jogoAtual + 1); }
async function finalizarClique() { await finalizarOnline(SO.codigo); }

function telaFinalOnline() {
  clearInterval(relogio);
  const sala = SO.sala, times = montarTimesOnline(sala);
  const tabela = Object.values(times).map(t => ({ id: t._id, nome: nomeTime(t), p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
  const porId = Object.fromEntries(tabela.map(x => [x.id, x]));
  const artilheiros = {};
  let ultimoResultado;
  sala.jogosOrdem.forEach(([ia, ib], k) => {
    const rk = simular(times[ia], times[ib], sala.jogosOrdem.length === 1, rngDe(sala.semente + k + 1));
    registrarTabelaOnline(porId[ia], porId[ib], rk.gols);
    rk.eventos.forEach(e => registrarArtilheiro(artilheiros, e.lado === 0 ? times[ia] : times[ib], e.autor));
    ultimoResultado = { ia, ib, r: rk };
  });
  const tab = [...tabela].sort((x, y) => y.p - x.p || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp);
  const campeao = sala.jogosOrdem.length === 1
    ? nomeTime(times[[ultimoResultado.ia, ultimoResultado.ib][ultimoResultado.r.vencedor]])
    : tab[0].nome;
  $app.innerHTML = `
  <section class="tela">
    <div class="campeao"><div class="trofeu" aria-hidden="true">🏆</div><p class="dica">Campeão da resenha</p><h2 class="grande">${campeao}</h2></div>
    ${sala.jogosOrdem.length > 1 ? `<div class="tabela"><table>
      <tr><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>
      ${tab.map(t => `<tr><td>${t.nome}</td><td><b>${t.p}</b></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp - t.gc}</td></tr>`).join('')}
    </table></div>` : ''}
    ${artilheirosHtml(artilheiros)}
    <div class="acoes">
      <button class="btn" onclick="telaOnlineMenu()">Nova sala</button>
      <button class="btn sec" onclick="telaMenu()">Menu</button>
    </div>
  </section>`;
}

// ---------- revelação ----------
function telaSuspense() {
  S.fila = embaralhar(CLUBES.map(c => c.id));
  S.revelados = 0;
  $app.innerHTML = `
  <section class="tela centro">
    <div class="misterio" aria-hidden="true">?</div>
    <h2 class="grande">Hora da verdade</h2>
    <p>12 rodadas, ${S.times.length} times montados no escuro.<br>Quem bateu de frente com quem?</p>
    <div class="acoes centralizado">
      <button class="btn" onclick="telaRevelaClube()">Revelar um por um</button>
      <button class="btn sec" onclick="telaTimes()">Revelar tudo de uma vez</button>
    </div>
  </section>`;
}

function telaRevelaClube() {
  const id = S.fila[S.revelados], ultimo = S.revelados === S.fila.length - 1;
  const picks = embaralhar(S.picks.filter(p => p.clube === id));
  const conta = {};
  picks.forEach(p => (conta[p.j.id] = (conta[p.j.id] || 0) + 1));
  const bateu = picks.some(p => conta[p.j.id] > 1);
  const passo = 0.7;
  $app.innerHTML = `
  <section class="tela centro">
    <p class="dica">Clube ${S.revelados + 1} de ${S.fila.length}</p>
    <img class="escudo-grande" src="${CLUBE[id].escudo}" alt="">
    <h2>${CLUBE[id].nome}</h2>
    <div class="cartas">${picks.map((p, k) => `
      <div class="carta${conta[p.j.id] > 1 ? ' repetido' : ''}" style="animation-delay:${k * passo}s">
        <small>${nomeTime(p.time)}</small>
        <b>${esc(p.j.nome)}</b>
        <span>${p.slot === RES ? 'Banco' : p.time.slots[p.slot]} · ${p.j.ovr}</span>
        ${conta[p.j.id] > 1 ? `<em style="animation-delay:${picks.length * passo}s">REPETIDO</em>` : ''}
      </div>`).join('')}</div>
    <p class="veredito" style="animation-delay:${picks.length * passo}s">${bateu ? '💥 Bateram! Ninguém leva.' : 'Cada um na sua.'}</p>
    <div class="acoes centralizado">
      <button class="btn" onclick="${ultimo ? 'telaTimes()' : 'S.revelados++; telaRevelaClube()'}">${ultimo ? 'Ver os times' : 'Próximo clube'}</button>
      ${ultimo ? '' : '<button class="btn sec" onclick="telaTimes()">Pular o resto</button>'}
    </div>
  </section>`;
}

function telaTimes() {
  const repetidos = resolverDuplicados(S.times);
  S.times.forEach(t => moverReserva(t, reservaPadrao(t)));   // sugestão; cada humano muda na tática
  const temFora = S.times.some(t => t.escalacao.some((j, i) => j && i !== RES && j.pos !== t.slots[i]));
  $app.innerHTML = `
  <section class="tela">
    <h2>Os times</h2>
    ${repetidos.length
      ? `<div class="alerta"><h3>Repetidos: ninguém fica com eles</h3><ul>${repetidos.map(r =>
          `<li><b>${esc(r.jogador.nome)}</b> ${mini(r.jogador.clube)}: ${r.times.map(esc).join(' e ')}</li>`).join('')}</ul>
          <p class="dica">Quem tinha reserva já aparece com ela (↺) no buraco que dói menos; na tela da tática dá pra mudar.${temFora ? ` <span class="tag-fora">⚠ fora de posição</span> perde overall — quanto mais estranha a posição, mais perde.` : ''}</p></div>`
      : '<p>Ninguém repetiu jogador. Sintonia zero… ou sorte.</p>'}
    <div class="times">${S.times.map(t => `<div>${placa(t)}${campo(t)}</div>`).join('')}</div>
    <button class="btn" onclick="telaTatica()">Escolher tática ⚔️</button>
  </section>`;
}

// ---------- tática ----------
function telaTatica() {
  S.times.forEach(t => { if (t.bot) t.tatica = taticaDoBot(t, S.times); });
  S.humanosTatica = S.times.map((_, i) => i).filter(i => !S.times[i].bot);
  S.vezTaticaIdx = 0;
  proximaTatica();
}

function proximaTatica() {
  if (S.vezTaticaIdx >= S.humanosTatica.length) return telaJogos();
  humanos() > 1 ? telaPassaTatica() : telaEscolhaTatica();
}

function telaPassaTatica() {
  const t = S.times[S.humanosTatica[S.vezTaticaIdx]];
  $app.innerHTML = `
  <section class="tela centro">
    <p class="dica">Passe o aparelho para</p>
    <h2 class="grande">${esc(t.nome)}</h2>
    <p>Hora de escolher a tática. O resto: não olha! 👀</p>
    <button class="btn" onclick="telaEscolhaTatica()">Sou eu, escolher tática</button>
  </section>`;
}

function telaEscolhaTatica() {
  const t = S.times[S.humanosTatica[S.vezTaticaIdx]];
  $app.innerHTML = `
  <section class="tela">
    <h2>${esc(t.nome)}: qual vai ser a postura?</h2>
    ${opcoesTatica(t, 'escolherTatica')}
    ${painelReserva(t, 'escolherReserva')}
    ${placa(t)}${campo(t)}
    <button class="btn" onclick="confirmarTatica()">Confirmar e seguir</button>
  </section>`;
}

function escolherTatica(k) { S.times[S.humanosTatica[S.vezTaticaIdx]].tatica = k; telaEscolhaTatica(); }
function escolherReserva(slot) { moverReserva(S.times[S.humanosTatica[S.vezTaticaIdx]], slot); telaEscolhaTatica(); }
function confirmarTatica() { S.vezTaticaIdx++; proximaTatica(); }

// ---------- jogos ----------
function telaJogos() {
  S.jogos = [];
  S.times.forEach((_, a) => S.times.forEach((_, b) => a < b && S.jogos.push([a, b])));
  S.jogos = embaralhar(S.jogos);   // confrontos saem em ordem aleatória, não sempre 0x1, 0x2...
  S.tabela = S.times.map(t => ({ nome: nomeTime(t), p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
  S.artilheiros = {};
  S.jogoAtual = 0;
  telaPartida();
}

function registrar(a, b, [ga, gb]) {
  const A = S.tabela[a], B = S.tabela[b];
  A.j++; B.j++; A.gp += ga; A.gc += gb; B.gp += gb; B.gc += ga;
  if (ga > gb) { A.v++; A.p += 3; B.d++; } else if (gb > ga) { B.v++; B.p += 3; A.d++; } else { A.e++; B.e++; A.p++; B.p++; }
}

function telaPartida() {
  const [a, b] = S.jogos[S.jogoAtual], times = [S.times[a], S.times[b]];
  const r = simular(times[0], times[1], S.jogos.length === 1);
  registrar(a, b, r.gols);
  r.eventos.forEach(e => registrarArtilheiro(S.artilheiros, times[e.lado], e.autor));
  S.ultimo = { a, b, r };
  const ultimo = S.jogoAtual === S.jogos.length - 1;
  $app.innerHTML = `
  <section class="tela">
    <p class="dica">${S.jogos.length > 1 ? `Jogo ${S.jogoAtual + 1} de ${S.jogos.length}` : 'Grande final'}</p>
    <div class="placar">
      <div class="lado">${nomeTime(times[0])}<small>OVR ${forca(times[0]).geral}${bonusTxt(times[0])}${taticaTxt(times[0])}</small></div>
      <div class="gols"><span id="g0">0</span> × <span id="g1">0</span><small id="min">0'</small></div>
      <div class="lado">${nomeTime(times[1])}<small>OVR ${forca(times[1]).geral}${bonusTxt(times[1])}${taticaTxt(times[1])}</small></div>
    </div>
    <div class="acoes" id="fim"><button class="btn sec" id="pular">Pular</button></div>
    <ol class="lances" id="lances"></ol>
  </section>`;
  let m = 0;
  const gols = [0, 0];
  const fim = () => {
    clearInterval(relogio);
    $('min').textContent = 'Fim de jogo';
    if (r.penaltis) $('lances').insertAdjacentHTML('afterbegin', `<li class="pen">Pênaltis: ${r.penaltis[0]} × ${r.penaltis[1]}</li>`);
    if (!r.eventos.length && !r.penaltis) $('lances').innerHTML = '<li>Zero a zero. Jogo de compadres.</li>';
    $('fim').innerHTML = `<button class="btn" onclick="${ultimo ? 'telaFinal()' : 'S.jogoAtual++; telaPartida()'}">${ultimo ? 'Ver campeão 🏆' : 'Próximo jogo'}</button>`;
  };
  const tick = () => {
    m++;
    r.eventos.filter(e => e.min === m).forEach(e => {
      $('g' + e.lado).textContent = ++gols[e.lado];
      $('lances').insertAdjacentHTML('afterbegin',
        `<li><b>${e.min}'</b> ⚽ ${e.autor ? `${esc(e.autor.nome)} ${mini(e.autor.clube)}` : 'Gol contra'} · <small>${nomeTime(times[e.lado])}</small></li>`);
    });
    $('min').textContent = `${m}'`;
    if (m >= 90) fim();
  };
  relogio = setInterval(tick, VELOCIDADES[opcoes.velocidade] ?? VELOCIDADES.normal);
  $('pular').onclick = () => { while (m < 90) tick(); };
}

function telaFinal() {
  const tab = [...S.tabela].sort((x, y) => y.p - x.p || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp);
  const { a, b, r } = S.ultimo;
  const campeao = S.jogos.length === 1 ? nomeTime(S.times[[a, b][r.vencedor]]) : tab[0].nome; // ponytail: empate total na liga fica com o primeiro da ordenação
  $app.innerHTML = `
  <section class="tela">
    <div class="campeao"><div class="trofeu" aria-hidden="true">🏆</div><p class="dica">Campeão da resenha</p><h2 class="grande">${campeao}</h2></div>
    ${S.jogos.length > 1 ? `<div class="tabela"><table>
      <tr><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>
      ${tab.map(t => `<tr><td>${t.nome}</td><td><b>${t.p}</b></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp - t.gc}</td></tr>`).join('')}
    </table></div>` : ''}
    ${artilheirosHtml(S.artilheiros)}
    <div class="acoes">
      <button class="btn" onclick="iniciar(S.participantes)">Revanche</button>
      <button class="btn sec" onclick="telaMenu()">Menu</button>
    </div>
  </section>`;
}

telaMenu();

// offline (PWA): só funciona servido por http(s), não abrindo o arquivo direto
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js');
