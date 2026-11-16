const lista = document.getElementById('lista')
const resumo = document.getElementById('resumo')

function desenhar() {
  if (habitos.length === 0) {
    lista.innerHTML = '<p>Nenhum hábito ainda. <a href="novo.html">Crie o primeiro!</a></p>'
    resumo.textContent = ''
    barra.style.width = '0%'
    return
    
  }
  
  

  lista.innerHTML = habitos.map(h => {
    const feito = feitoHoje(h)
    const seq = sequencia(h)
    return `
      <div class="habito ${feito ? 'feito' : ''}">
        <input type="checkbox" class="form-check-input" id="h${h.id}"
               ${feito ? 'checked' : ''} onchange="alternar(${h.id})">
        <label for="h${h.id}">${esc(h.nome)}
          <span class="badge badge-cat">${esc(nomeCategoria(h))}</span></label>
        <span>${seq} ${seq === 1 ? 'dia seguido' : 'dias seguidos'}</span>
      </div>`
      
  }).join('')

  const feitos = habitos.filter(feitoHoje).length
  resumo.textContent = `${feitos} de ${habitos.length} concluídos hoje`
  const barra = document.getElementById('barra');
const pct = Math.round(feitos / habitos.length * 100);
barra.style.width = pct + '%';
barra.setAttribute('aria-valuenow', pct);
}

function alternar(id) {
  const h = habitos.find(x => x.id === id);

  if (feitoHoje(h)) {
    
    registros = registros.filter(r => !(r.habitoId === id && r.data === hoje()));
  } else {
   
    registros.push({ id: Date.now(), habitoId: id, data: hoje() });
  }

  salvar();
  desenhar();
}


desenhar()
