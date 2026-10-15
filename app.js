// Telas e fluxo (DOM). Regras ficam em logic.js.
const $app = document.getElementById('app');
const $ = id => document.getElementById(id);
const CLUBE = Object.fromEntries(CLUBES.map(c => [c.id, c]));
const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const sortear = a => a[Math.floor(Math.random() * a.length)];
const embaralhar = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
let S = {}, relogio;

// ---------- preferências (tema, turbo, às cegas) ----------
const raiz = document.documentElement;
const lerPref = k => { try { return localStorage.getItem(k); } catch { return null; } };
const salvarPref = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
if (lerPref('tema')) raiz.dataset.theme = lerPref('tema');
const opcoes = { turbo: lerPref('turbo') === '1', cego: lerPref('cego') === '1' };
function alternarOpcao(k) { opcoes[k] = !opcoes[k]; salvarPref(k, opcoes[k] ? '1' : '0'); }
function alternarTema() {
  const escuro = raiz.dataset.theme ? raiz.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  raiz.dataset.theme = escuro ? 'light' : 'dark';
  salvarPref('tema', raiz.dataset.theme);
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
const humanos = () => S.times.filter(t => !t.bot).length;

function placa(t, oculto) {
  const f = forca(t);
  const numeros = oculto ? 'OVR ??' : `OVR <b>${f.geral}</b> · ATQ ${Math.round(f.ataque)} · DEF ${Math.round(f.defesa)}`;
  return `<div class="placa"><h3>${nomeTime(t)}</h3><span>${t.formacao} · ${numeros}</span></div>`;
}

function campo(t, oculto) {
  const chip = i => {
    const j = t.escalacao[i];
    if (!j) return `<div class="chip vazio"><span class="pos">${t.slots[i]}</span><b>—</b></div>`;
    const fora = i !== RES && j.pos !== t.slots[i];
    const ovr = oculto ? '??' : fora ? `${ovrEfetivo(t, i)} <s>${j.ovr}</s>` : j.ovr;
    return `<div class="chip${fora ? ' fora' : ''}" ${fora ? `title="${j.pos} jogando de ${t.slots[i]}: −${FORA_DE_POSICAO}"` : ''}>
      <span class="pos">${t.slots[i]}${fora ? ` ⚠ ${j.pos}` : ''}</span><b>${esc(j.nome)}</b><span class="meta">${mini(j.clube)} ${ovr}</span></div>`;
  };
  let i = 0;
  const linhas = FORMACOES[t.formacao].map(l => `<div class="linha">${l.map(() => chip(i++)).join('')}</div>`);
  return `<div class="campo">${linhas.join('')}</div><div class="banco">${chip(RES)}</div>`;
}

// ---------- menu e setup ----------
function telaMenu() {
  clearInterval(relogio);
  $app.innerHTML = `
  <section class="tela">
    <h1 class="titulo">Escolha o modo</h1>
    <div class="modos">
      <button class="modo" onclick="telaSetup()">
        <span class="selo">12 rodadas · 2 a 6 times · com bots</span>
        <h2>G12</h2>
        <p>A roleta sorteia um dos 12 grandes. Cada um escolhe um jogador às escondidas. Repetiu? Ninguém leva.</p>
      </button>
      <div class="modo off">
        <span class="selo">Em breve</span>
        <h2>Mais modos</h2>
        <p>Brasileirão completo, times à sua escolha…</p>
      </div>
    </div>
  </section>`;
}

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
      `<button class="btn${f === S.formacao ? '' : ' sec'}" aria-pressed="${f === S.formacao}" onclick="escolherFormacao('${f}')">${f}</button>`).join('')}</div>
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
      ${res !== undefined ? `<button class="btn${tit !== undefined ? ' sec' : ''}" onclick="confirmar(${sel}, ${res})">${esc(j.nome)} no banco</button>` : ''}
    </div>`;
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
  const temFora = S.times.some(t => t.escalacao.some((j, i) => j && i !== RES && j.pos !== t.slots[i]));
  $app.innerHTML = `
  <section class="tela">
    <h2>Os times</h2>
    ${repetidos.length
      ? `<div class="alerta"><h3>Repetidos: ninguém fica com eles</h3><ul>${repetidos.map(r =>
          `<li><b>${esc(r.jogador.nome)}</b> ${mini(r.jogador.clube)}: ${r.times.map(esc).join(' e ')}</li>`).join('')}</ul>
          <p class="dica">Quem tinha reserva teve o buraco coberto.${temFora ? ` <span class="tag-fora">⚠ fora de posição</span> joga com −${FORA_DE_POSICAO}.` : ''}</p></div>`
      : '<p>Ninguém repetiu jogador. Sintonia zero… ou sorte.</p>'}
    <div class="times">${S.times.map(t => `<div>${placa(t)}${campo(t)}</div>`).join('')}</div>
    <button class="btn" onclick="telaJogos()">Bola rolando ⚽</button>
  </section>`;
}

// ---------- jogos ----------
function telaJogos() {
  S.jogos = [];
  S.times.forEach((_, a) => S.times.forEach((_, b) => a < b && S.jogos.push([a, b])));
  S.tabela = S.times.map(t => ({ nome: nomeTime(t), p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
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
  S.ultimo = { a, b, r };
  const ultimo = S.jogoAtual === S.jogos.length - 1;
  $app.innerHTML = `
  <section class="tela">
    <p class="dica">${S.jogos.length > 1 ? `Jogo ${S.jogoAtual + 1} de ${S.jogos.length}` : 'Grande final'}</p>
    <div class="placar">
      <div class="lado">${nomeTime(times[0])}<small>OVR ${forca(times[0]).geral}${bonusTxt(times[0])}</small></div>
      <div class="gols"><span id="g0">0</span> × <span id="g1">0</span><small id="min">0'</small></div>
      <div class="lado">${nomeTime(times[1])}<small>OVR ${forca(times[1]).geral}${bonusTxt(times[1])}</small></div>
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
  relogio = setInterval(tick, 70);
  $('pular').onclick = () => { while (m < 90) tick(); };
}

function telaFinal() {
  const tab = [...S.tabela].sort((x, y) => y.p - x.p || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp);
  const { a, b, r } = S.ultimo;
  const campeao = S.jogos.length === 1 ? nomeTime(S.times[[a, b][r.vencedor]]) : tab[0].nome; // ponytail: empate total na liga fica com o primeiro da ordenação
  $app.innerHTML = `
  <section class="tela">
    <div class="campeao"><p class="dica">Campeão da resenha</p><h2 class="grande">🏆 ${campeao}</h2></div>
    ${S.jogos.length > 1 ? `<table>
      <tr><th>Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>
      ${tab.map(t => `<tr><td>${t.nome}</td><td><b>${t.p}</b></td><td>${t.j}</td><td>${t.v}</td><td>${t.e}</td><td>${t.d}</td><td>${t.gp - t.gc}</td></tr>`).join('')}
    </table>` : ''}
    <div class="acoes">
      <button class="btn" onclick="iniciar(S.participantes)">Revanche</button>
      <button class="btn sec" onclick="telaMenu()">Menu</button>
    </div>
  </section>`;
}

telaMenu();

// offline (PWA): só funciona servido por http(s), não abrindo o arquivo direto
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js');
