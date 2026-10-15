// Gera data.js e escudos/ a partir do elenco atual no Transfermarkt.
// Uso: node tools/atualizar-elencos.js   (Node 18+)
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };

// id do Transfermarkt, sigla, nome, fundo da carta na roleta
const CLUBES = [
  [614, 'FLA', 'Flamengo', '#C3281E'],
  [1023, 'PAL', 'Palmeiras', '#006437'],
  [199, 'COR', 'Corinthians', '#141414'],
  [585, 'SAO', 'São Paulo', '#D50000'],
  [221, 'SAN', 'Santos', '#f4f4f4'],
  [2462, 'FLU', 'Fluminense', '#870A28'],
  [978, 'VAS', 'Vasco', '#111111'],
  [537, 'BOT', 'Botafogo', '#1a1a1a'],
  [210, 'GRE', 'Grêmio', '#0D80BF'],
  [6600, 'INT', 'Internacional', '#E30613'],
  [330, 'CAM', 'Atlético-MG', '#111111'],
  [609, 'CRU', 'Cruzeiro', '#0033A0'],
];

const POSICAO = {
  'Goleiro': 'GOL',
  'Lateral Dir.': 'LAT', 'Lateral Esq.': 'LAT',
  'Zagueiro': 'ZAG',
  'Volante': 'MEI', 'Meia Central': 'MEI', 'Meia Ofensivo': 'MEI', 'Meia Direita': 'MEI', 'Meia Esquerda': 'MEI',
  'Ponta-Direita': 'ATA', 'Ponta-Esquerda': 'ATA', 'Centroavante': 'ATA', 'Seg. Atacante': 'ATA',
};
const MAX_POR_POSICAO = { GOL: 2, LAT: 4, ZAG: 4, MEI: 6, ATA: 5 };

// Overall estimado: log do valor de mercado (€1 mi ≈ 68, €10 mi ≈ 79) + bônus pra veterano
// (valor despenca com a idade, a bola nem tanto). ponytail: heurística, ajuste os números à mão em data.js se quiser.
// Ajuste manual: o valor de mercado não enxerga lenda veterana. Nome exatamente como no Transfermarkt.
const AJUSTES = { 'Thiago Silva': 79 };

function overall(euros, idade, nome) {
  if (AJUSTES[nome]) return AJUSTES[nome];
  const base = 68 + 3.3 * Math.log2(Math.max(euros, 50e3) / 1e6);
  const veterano = Math.min(Math.max(idade - 29, 0) * 0.8, 6);
  return Math.round(Math.min(Math.max(base + veterano, 55), 90));
}

function valorEmEuros(txt) {
  const m = txt.match(/€\s*([\d.,]+)\s*(mil|mi)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(',', '.')) * (m[2] === 'mil' ? 1e3 : 1e6);
}

const texto = s => s.replace(/<[^>]+>/g, ' ').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function elenco(id, sigla) {
  const html = await (await fetch(`https://www.transfermarkt.com.br/x/kader/verein/${id}`, { headers: UA })).text();
  const titulo = texto(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]);
  const linhas = html.split(/<tr class="(?:odd|even)">/).slice(1);
  const jogadores = linhas.map(l => {
    const nome = texto(l.match(/<td class="hauptlink">\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1] || '');
    const posTxt = texto(l.match(/<\/tr>\s*<tr>\s*<td>([\s\S]*?)<\/td>/)?.[1] || '');
    const idade = parseInt(l.match(/<td class="zentriert">(\d+)<\/td>/)?.[1]) || 25;
    const euros = valorEmEuros(l.match(/rechts hauptlink">([\s\S]*?)<\/td>/)?.[1] || '');
    return { nome, pos: POSICAO[posTxt], posTxt, idade, euros };
  }).filter(j => j.nome);
  const desconhecidas = [...new Set(jogadores.filter(j => !j.pos).map(j => j.posTxt))];
  if (desconhecidas.length) console.warn(`  ${sigla}: posição ignorada: ${desconhecidas.join(', ')}`);
  const escolhidos = Object.entries(MAX_POR_POSICAO).flatMap(([pos, max]) =>
    jogadores.filter(j => j.pos === pos).sort((a, b) => overall(b.euros, b.idade, b.nome) - overall(a.euros, a.idade, a.nome)).slice(0, max));
  return { titulo, total: jogadores.length, escolhidos };
}

async function escudo(id, sigla) {
  const r = await fetch(`https://tmssl.akamaized.net/images/wappen/head/${id}.png`, { headers: UA });
  if (!r.ok) throw new Error(`escudo ${sigla}: HTTP ${r.status}`);
  fs.writeFileSync(path.join(RAIZ, 'escudos', `${sigla}.png`), Buffer.from(await r.arrayBuffer()));
}

(async () => {
  fs.mkdirSync(path.join(RAIZ, 'escudos'), { recursive: true });
  const blocos = [];
  for (const [id, sigla, nome, bg] of CLUBES) {
    const { titulo, total, escolhidos } = await elenco(id, sigla);
    await escudo(id, sigla);
    console.log(`${sigla} ← "${titulo}": ${total} no elenco, ${escolhidos.length} no jogo`);
    const linhas = escolhidos.map(j => `    ${j.pos} ${overall(j.euros, j.idade, j.nome)} ${j.nome}`).join('\n');
    blocos.push(`  { id: '${sigla}', nome: '${nome}', bg: '${bg}', elenco: \`\n${linhas}\` },`);
  }
  const hoje = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(path.join(RAIZ, 'data.js'), `// GERADO por tools/atualizar-elencos.js em ${hoje} (elencos do Transfermarkt).
// Overall = estimativa pelo valor de mercado + bônus de veterano. Pode editar à mão, mas rodar o script de novo sobrescreve.
// Uma linha por jogador: POSIÇÃO OVERALL Nome   (posições: GOL LAT ZAG MEI ATA)
const CLUBES = [
${blocos.join('\n')}
].map(c => ({
  ...c,
  escudo: \`escudos/\${c.id}.png\`,
  jogadores: c.elenco.trim().split('\\n').map(l => {
    const [pos, ovr, ...nome] = l.trim().split(/\\s+/);
    return { id: \`\${c.id}:\${nome.join(' ')}\`, nome: nome.join(' '), pos, ovr: +ovr, clube: c.id };
  }),
}));
`);
})();
