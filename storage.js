// Camada de dados do Self-Care: tudo fica salvo no localStorage do navegador.

// Categorias fixas do app. Os ids são o que fica gravado em cada hábito (categoriaId).
const categorias = [
  { id: 1, nome: 'Saúde' },
  { id: 2, nome: 'Estudo' },
  { id: 3, nome: 'Livrar-se de um mau hábito' },
  { id: 4, nome: 'Treino' },
  { id: 5, nome: 'Alimentação' }
];

// Lê uma chave do localStorage; se não existir ou estiver corrompida, usa o padrão.
function carregar(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor ?? padrao;
  } catch {
    return padrao;
  }
}

let habitos   = carregar('habitos', []);
let registros = carregar('registros', []);   // { id, habitoId, data: 'AAAA-MM-DD' }
let perfil    = carregar('perfil', { nome: '', metaDiaria: null });

// A versão antiga gravava as categorias no localStorage (e com nomes diferentes dos
// formulários). Agora elas são fixas no código, então a chave antiga é descartada.
try { localStorage.removeItem('categorias'); } catch { /* sem acesso ao storage */ }

function salvar() {
  try {
    localStorage.setItem('habitos', JSON.stringify(habitos));
    localStorage.setItem('registros', JSON.stringify(registros));
    localStorage.setItem('perfil', JSON.stringify(perfil));
  } catch {
    alert('Não foi possível salvar os dados neste navegador.');
  }
}

// ---------- Datas (sempre no formato AAAA-MM-DD, no fuso local) ----------

function hoje() {
  return new Date().toLocaleDateString('sv-SE');
}

function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE');
}

function diaSeguinte(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return new Date(ano, mes - 1, dia + 1).toLocaleDateString('sv-SE');
}

function formatarData(data) {
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}

// ---------- Consultas ----------

function nomeHabito(h) {
  return h.nome || 'Hábito sem nome';
}

function nomeCategoria(h) {
  const c = categorias.find(c => c.id === h.categoriaId);
  return c ? c.nome : 'Sem categoria';
}

function datasDe(h) {
  return registros.filter(r => r.habitoId === h.id).map(r => r.data);
}

function feitoHoje(h) {
  return datasDe(h).includes(hoje());
}

// Dias seguidos até hoje. Se hoje ainda não foi feito, conta a partir de ontem.
function contarSequencia(datas) {
  let n = datas.includes(hoje()) ? 0 : 1;
  let total = 0;
  while (datas.includes(diasAtras(n))) {
    total++;
    n++;
  }
  return total;
}

function sequencia(h) {
  return contarSequencia(datasDe(h));
}

// Maior sequência de dias consecutivos já registrada.
function melhorSequencia(datas) {
  const ordenadas = [...new Set(datas)].sort();
  let melhor = 0;
  let atual = 0;
  let anterior = null;
  for (const d of ordenadas) {
    atual = anterior && diaSeguinte(anterior) === d ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
    anterior = d;
  }
  return melhor;
}

// Datas (sem repetição) em que pelo menos um hábito foi feito.
function diasRegistrados() {
  return [...new Set(registros.map(r => r.data))].sort();
}

// Escapa texto do usuário antes de colocar em innerHTML.
function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
