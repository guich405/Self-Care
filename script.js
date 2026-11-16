
console.log(habitos)

const btnSalvar = document.getElementById('btnSalvar')

function criarHabito() {
  const nome = document.getElementById('#nome').value
  const categoria = document.getElementById('#categoria').value
  const meta = document.getElementById('#meta').value

  const novoHabito = {
    id: Date.now(),
    nome: nome,
    meta: meta,
    categoriaId: Number(categoria)
  };

  habitos.push(novoHabito);
  salvar();
}

btnSalvar.addEventListener('click', criarHabito)


