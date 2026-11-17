// Lógica do Self-Care (página única). Depende de storage.js, carregado antes.

const $ = id => document.getElementById(id);

const PAGINAS = {
  inicio: desenharInicio,
  habitos: desenharHabitos,
  progresso: desenharProgresso,
  novo: prepararNovo,
  perfil: desenharPerfil
};

// ---------- Navegação (cada página é uma <section>, escolhida pelo #hash) ----------

function paginaAtual() {
  const nome = location.hash.slice(1);
  return nome in PAGINAS ? nome : 'inicio';
}

function mostrarPagina() {
  const atual = paginaAtual();
  for (const nome in PAGINAS) {
    $('pagina-' + nome).hidden = nome !== atual;
  }
  document.querySelectorAll('[data-pagina]').forEach(link => {
    const ativo = link.dataset.pagina === atual;
    link.classList.toggle('active', ativo);
    if (ativo) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  fecharMenu();
  PAGINAS[atual]();
  window.scrollTo(0, 0);
}

// Como a página não recarrega mais, o drawer do Bootstrap precisa ser fechado ao trocar de seção.
// Só fecha quando ele está aberto como janela (celular); no desktop o menu fica na barra.
function fecharMenu() {
  const drawer = $('navbarNavAltMarkup');
  let aberto = false;
  try { aberto = drawer.matches(':modal'); } catch { aberto = drawer.open; }
  if (aberto) drawer.querySelector('[data-bs-dismiss="drawer"]').click();
}

// Fecha um <dialog> do Bootstrap usando o próprio botão de fechar dele.
function fecharDialog(dialog) {
  dialog.querySelector('[data-bs-dismiss="dialog"]').click();
}

// ---------- Utilidades de tela ----------

let timerMensagem;
function avisar(texto) {
  const caixa = $('mensagem');
  caixa.textContent = texto;
  caixa.hidden = false;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => { caixa.hidden = true; }, 3000);
}

function preencherCategorias(select, primeiraOpcao) {
  select.innerHTML = `<option value="">${primeiraOpcao}</option>` +
    categorias.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
}

// Valida nome + categoria de um formulário de hábito. Retorna os dados ou null.
function lerFormularioHabito(campoNome, campoCategoria, campoMeta, aviso) {
  const nome = campoNome.value.trim();
  const categoriaId = Number(campoCategoria.value);
  const valido = nome !== '' && categorias.some(c => c.id === categoriaId);
  aviso.hidden = valido;
  if (!valido) {
    (nome ? campoCategoria : campoNome).focus();
    return null;
  }
  return { nome, categoriaId, meta: campoMeta.value.trim() };
}

const VAZIO = '<p>Nenhum hábito ainda. <a href="#novo">Crie o primeiro!</a></p>';

// ---------- Início ----------

function desenharInicio() {
  $('ola').textContent = perfil.nome ? `Olá, ${perfil.nome}!` : '';
  $('ola').hidden = !perfil.nome;

  if (habitos.length === 0) {
    $('listaHoje').innerHTML = VAZIO;
    $('resumo').textContent = '';
    atualizarBarra(0);
    return;
  }

  $('listaHoje').innerHTML = habitos.map(h => {
    const feito = feitoHoje(h);
    const seq = sequencia(h);
    return `
      <div class="habito ${feito ? 'feito' : ''}">
        <input type="checkbox" class="form-check-input" id="h${h.id}" data-id="${h.id}" ${feito ? 'checked' : ''}>
        <label for="h${h.id}">${esc(nomeHabito(h))}
          <span class="badge badge-cat">${esc(nomeCategoria(h))}</span></label>
        <span>${seq} ${seq === 1 ? 'dia seguido' : 'dias seguidos'}</span>
      </div>`;
  }).join('');

  const feitos = habitos.filter(feitoHoje).length;
  let texto = `${feitos} de ${habitos.length} concluídos hoje`;
  if (perfil.metaDiaria) {
    texto += feitos >= perfil.metaDiaria
      ? ` · meta diária de ${perfil.metaDiaria} atingida!`
      : ` · meta diária: ${perfil.metaDiaria}`;
  }
  $('resumo').textContent = texto;
  atualizarBarra(Math.round(feitos / habitos.length * 100));
}

function atualizarBarra(pct) {
  $('barra').style.width = pct + '%';
  $('barra').parentElement.setAttribute('aria-valuenow', pct);
}

function alternar(id) {
  const h = habitos.find(x => x.id === id);
  if (!h) return;
  if (feitoHoje(h)) {
    registros = registros.filter(r => !(r.habitoId === id && r.data === hoje()));
  } else {
    registros.push({ id: Date.now(), habitoId: id, data: hoje() });
  }
  salvar();
}

$('listaHoje').addEventListener('change', e => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  alternar(id);
  desenharInicio();
});

// ---------- Hábitos (lista, busca, filtros, edição, exclusão) ----------

function desenharHabitos() {
  const busca = $('busca').value.trim().toLowerCase();
  const categoria = Number($('filtroCategoria').value);
  const status = $('filtroStatus').value;

  const filtrados = habitos.filter(h => {
    if (busca && !nomeHabito(h).toLowerCase().includes(busca)) return false;
    if (categoria && h.categoriaId !== categoria) return false;
    if (status === 'feito' && !feitoHoje(h)) return false;
    if (status === 'pendente' && feitoHoje(h)) return false;
    return true;
  });

  $('contador').textContent = `${filtrados.length} de ${habitos.length} ${habitos.length === 1 ? 'hábito' : 'hábitos'}`;

  const lista = $('listaHabitos');
  if (habitos.length === 0) {
    lista.innerHTML = VAZIO;
    return;
  }
  if (filtrados.length === 0) {
    lista.innerHTML = '<p>Nenhum hábito encontrado com esses filtros.</p>';
    return;
  }
  lista.innerHTML = filtrados.map(h => `
    <div class="habito ${feitoHoje(h) ? 'feito' : ''}">
      <div class="habito-info">
        <strong>${esc(nomeHabito(h))}</strong>
        <span class="badge badge-cat">${esc(nomeCategoria(h))}</span>
        ${h.meta ? `<small class="d-block">${esc(h.meta)}</small>` : ''}
      </div>
      <button type="button" class="btn btn-verde btn-sm" data-editar="${h.id}"
              data-bs-toggle="dialog" data-bs-target="#modalEditar">Editar</button>
      <button type="button" class="btn btn-perigo btn-sm" data-excluir="${h.id}">Excluir</button>
    </div>`).join('');
}

['busca', 'filtroCategoria', 'filtroStatus'].forEach(id => $(id).addEventListener('input', desenharHabitos));

$('limparFiltros').addEventListener('click', () => {
  $('busca').value = '';
  $('filtroCategoria').value = '';
  $('filtroStatus').value = '';
  desenharHabitos();
});

$('listaHabitos').addEventListener('click', e => {
  const editar = e.target.closest('[data-editar]');
  const excluir = e.target.closest('[data-excluir]');
  if (editar) abrirEdicao(Number(editar.dataset.editar));
  if (excluir) excluirHabito(Number(excluir.dataset.excluir));
});

let editandoId = null;

// Quem abre a janela é o Bootstrap (data-bs-toggle="dialog" no botão Editar);
// aqui só preenchemos os campos.
function abrirEdicao(id) {
  const h = habitos.find(x => x.id === id);
  if (!h) return;
  editandoId = id;
  $('editNome').value = h.nome || '';
  $('editCategoria').value = categorias.some(c => c.id === h.categoriaId) ? h.categoriaId : '';
  $('editMeta').value = h.meta || '';
  $('avisoEditar').hidden = true;
}

$('salvarEdicao').addEventListener('click', () => {
  const dados = lerFormularioHabito($('editNome'), $('editCategoria'), $('editMeta'), $('avisoEditar'));
  if (!dados) return;
  const h = habitos.find(x => x.id === editandoId);
  if (h) Object.assign(h, dados);
  salvar();
  fecharDialog($('modalEditar'));
  desenharHabitos();
  avisar('Hábito atualizado.');
});

function excluirHabito(id) {
  const h = habitos.find(x => x.id === id);
  if (!h || !confirm(`Excluir "${nomeHabito(h)}"? O histórico dele também será apagado.`)) return;
  habitos = habitos.filter(x => x.id !== id);
  registros = registros.filter(r => r.habitoId !== id);
  salvar();
  desenharHabitos();
  avisar('Hábito excluído.');
}

// ---------- Novo hábito ----------

function prepararNovo() {
  $('avisoNovo').hidden = true;
}

$('formNovo').addEventListener('submit', e => {
  e.preventDefault();
  const dados = lerFormularioHabito($('novoNome'), $('novoCategoria'), $('novoMeta'), $('avisoNovo'));
  if (!dados) return;
  habitos.push({ id: Date.now(), ...dados });
  salvar();
  $('formNovo').reset();
  avisar('Hábito criado!');
  location.hash = '#inicio';
});

$('cancelarNovo').addEventListener('click', () => {
  $('formNovo').reset();
  location.hash = '#inicio';
});

// ---------- Progresso ----------

function desenharProgresso() {
  const dias = diasRegistrados();
  $('statSequencia').textContent = contarSequencia(dias);
  $('statMelhor').textContent = melhorSequencia(dias);
  $('statTotal').textContent = dias.length;

  const ultimos = [6, 5, 4, 3, 2, 1, 0].map(diasAtras);   // do mais antigo até hoje
  if (habitos.length === 0) {
    $('ultimos7').innerHTML = VAZIO;
    return;
  }
  $('ultimos7').innerHTML = habitos.map(h => {
    const datas = datasDe(h);
    const feitos = ultimos.filter(d => datas.includes(d)).length;
    const pct = Math.round(feitos / 7 * 100);
    const quadrados = ultimos.map(d => {
      const f = datas.includes(d);
      const legenda = `${formatarData(d)}: ${f ? 'feito' : 'não feito'}`;
      return `<span class="dia ${f ? 'feito' : ''}" title="${legenda}" aria-label="${legenda}"></span>`;
    }).join('');
    return `
      <div class="habito flex-wrap">
        <strong>${esc(nomeHabito(h))}</strong>
        <div class="ms-auto d-flex gap-1">${quadrados}</div>
        <div class="progress w-100" role="progressbar" aria-label="Últimos 7 dias de ${esc(nomeHabito(h))}"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar" style="width: ${pct}%"></div>
        </div>
        <small>${feitos} de 7 dias</small>
      </div>`;
  }).join('');
}

// ---------- Perfil ----------

function desenharPerfil() {
  $('perfilNome').value = perfil.nome || '';
  $('perfilMeta').value = perfil.metaDiaria ?? '';
  $('avisoPerfil').hidden = true;

  $('totalHabitos').textContent = habitos.length;
  $('diasRegistrados').textContent = diasRegistrados().length;

  let top = null;
  let maior = 0;
  for (const h of habitos) {
    const n = new Set(datasDe(h)).size;
    if (n > maior) {
      maior = n;
      top = h;
    }
  }
  $('habitoTop').textContent = top ? nomeHabito(top) : '—';
}

$('formPerfil').addEventListener('submit', e => {
  e.preventDefault();
  const textoMeta = $('perfilMeta').value.trim();
  const meta = textoMeta === '' ? null : Number(textoMeta);
  if (meta !== null && !(Number.isInteger(meta) && meta >= 1 && meta <= 20)) {
    $('avisoPerfil').hidden = false;
    $('perfilMeta').focus();
    return;
  }
  perfil = { nome: $('perfilNome').value.trim(), metaDiaria: meta };
  salvar();
  $('avisoPerfil').hidden = true;
  avisar('Perfil salvo.');
});

// ---------- Início do app ----------

preencherCategorias($('filtroCategoria'), 'Todas');
preencherCategorias($('novoCategoria'), 'Escolha uma categoria');
preencherCategorias($('editCategoria'), 'Escolha uma categoria');

window.addEventListener('hashchange', mostrarPagina);
mostrarPagina();
