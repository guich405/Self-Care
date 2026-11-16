
function carregar(chave, padrao) {
  return JSON.parse(localStorage.getItem(chave)) || padrao;
}


let categorias = carregar('categorias', null);
let habitos    = carregar('habitos', []);
let registros  = carregar('registros', []);


if (!categorias) {
  categorias = [
    { id: 1, nome: 'Saúde' },
    { id: 2, nome: 'Estudo' },
    { id: 3, nome: 'Bem-estar' }
  ];
  salvar();
}


function salvar() {
  localStorage.setItem('categorias', JSON.stringify(categorias));
  localStorage.setItem('habitos', JSON.stringify(habitos));
  localStorage.setItem('registros', JSON.stringify(registros));
}


function hoje() {
  return new Date().toLocaleDateString('sv-SE');   // formato AAAA-MM-DD
}
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE');
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
function sequencia(h) {
  const datas = datasDe(h);
  let n = datas.includes(hoje()) ? 0 : 1;   // se hoje ainda não foi feito, conta a partir de ontem
  let total = 0;
  while (datas.includes(diasAtras(n))) {
    total++;
    n++;
  }
  return total;
}

function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}