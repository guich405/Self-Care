const CHAVE = 'habitos';

// lê a lista salva (ou começa vazia)
let habitos = JSON.parse(localStorage.getItem(CHAVE)) || [];

// grava a lista no localStorage
function salvar() {
  localStorage.setItem(CHAVE, JSON.stringify(habitos));
}

// devolve a data de hoje no formato '2026-11-15'
function hoje() {
  return new Date().toLocaleDateString('sv-SE');
}

// protege contra HTML digitado pelo usuário
function esc(t) {
  return String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// data de N dias atrás, no formato AAAA-MM-DD
function diasAtras(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE');
}

// quantos dias seguidos o hábito foi cumprido
function sequencia(h) {
  let n = h.dias.includes(hoje()) ? 0 : 1;   // se hoje ainda não foi feito, conta a partir de ontem
  let total = 0;
  while (h.dias.includes(diasAtras(n))) {
    total++;
    n++;
  }
  return total;
}