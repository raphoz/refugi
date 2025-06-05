document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("gridAbrig");
  const form = document.getElementById("formAbrigo");
  let editingShelterID = null;

  // Load all shelters when page loads
  await loadShelters();

  async function loadShelters() {
    try {
      const response = await fetch('/api/shelters');
      if (!response.ok) throw new Error('Failed to load shelters');
      
      const shelters = await response.json();
      renderShelters(shelters);
    } catch (error) {
      console.error('Error loading shelters:', error);
      alert('Erro ao carregar abrigos. Por favor, verifique se o servidor está rodando.');
    }
  }

  function renderShelters(shelters) {
    grid.innerHTML = "";
    
    if (shelters.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center my-5"><h4>Nenhum abrigo cadastrado</h4></div>';
      return;
    }
    
    shelters.forEach((abrigo) => {
      const card = document.createElement("div");
      card.className = "col";
  
      const ocupacao = (abrigo.ocupado / abrigo.capacidade) * 100;
      let cor = "bg-success";
      if (ocupacao > 90) cor = "bg-danger";
      else if (ocupacao > 70) cor = "bg-warning";
  
      card.innerHTML = `
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">${abrigo.nome}</h5>
            <div class="mb-2">
              <div class="d-flex justify-content-between">
                <small><strong>${abrigo.ocupado}</strong> / ${abrigo.capacidade}</small>
                <small>${ocupacao.toFixed(0)}%</small>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar ${cor}" style="width: ${ocupacao}%;"></div>
              </div>
            </div>
            <p class="mb-1"><strong>Suprimentos Críticos:</strong><br><span class="critical-supply-item">${abrigo.suprimentos}</span></p>
            <p><strong>Mensagem:</strong> ${abrigo.mensagem}</p>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary w-50 me-1 editar" data-id="${abrigo.id}">✏️ Editar</button>
            <button class="btn btn-sm btn-outline-danger w-50 ms-1 remover" data-id="${abrigo.id}">🗑️ Remover</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    
    const abrigo = {
      nome: f.nome.value,
      capacidade: parseInt(f.capacidade.value),
      ocupado: parseInt(f.ocupado.value),
      suprimentos: f.suprimentos.value,
      mensagem: f.mensagem.value
    };
    
    // Add ID if editing, otherwise create new ID
    if (editingShelterID) {
      abrigo.id = editingShelterID;
    } else {
      abrigo.id = Date.now().toString();
    }
    
    try {
      const response = await fetch('/api/shelters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(abrigo)
      });
      
      if (!response.ok) throw new Error('Failed to save shelter');
      
      // Reload shelters to refresh view
      await loadShelters();
      
      // Reset form and close modal
      form.reset();
      editingShelterID = null;
      bootstrap.Modal.getInstance(document.getElementById("modalAbrigo")).hide();
      
    } catch (error) {
      console.error('Error saving shelter:', error);
      alert('Erro ao salvar abrigo.');
    }
  });
  
  document.addEventListener("click", async (e) => {
    // Edit shelter
    if (e.target.classList.contains("editar")) {
      const id = e.target.dataset.id;
      editingShelterID = id;
      
      try {
        const response = await fetch(`/api/shelters/${id}`);
        if (!response.ok) throw new Error('Failed to load shelter');
        
        const abrigo = await response.json();
        
        // Fill form with shelter data
        form.nome.value = abrigo.nome;
        form.capacidade.value = abrigo.capacidade;
        form.ocupado.value = abrigo.ocupado;
        form.suprimentos.value = abrigo.suprimentos;
        form.mensagem.value = abrigo.mensagem;
        
        // Update modal title
        const modalTitle = document.querySelector('#modalAbrigo .modal-title');
        if (modalTitle) modalTitle.textContent = 'Editar Abrigo';
        
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalAbrigo")).show();
      } catch (error) {
        console.error('Error loading shelter:', error);
        alert('Erro ao carregar dados do abrigo.');
      }
    }
    
    // Remove shelter
    if (e.target.classList.contains("remover")) {
      const id = e.target.dataset.id;
      
      if (confirm("Deseja remover este abrigo?")) {
        try {
          const response = await fetch(`/api/shelters/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete shelter');
          
          // Reload shelters to refresh view
          await loadShelters();
        } catch (error) {
          console.error('Error deleting shelter:', error);
          alert('Erro ao excluir abrigo.');
        }
      }
    }
  });
  
  // Reset form and editing state when modal is opened for a new entry
  document.querySelector('[data-bs-target="#modalAbrigo"]')?.addEventListener('click', () => {
    form.reset();
    editingShelterID = null;
    
    // Reset modal title
    const modalTitle = document.querySelector('#modalAbrigo .modal-title');
    if (modalTitle) modalTitle.textContent = 'Novo Abrigo';
  });
  
  // Reset form when modal is closed
  document.getElementById('modalAbrigo')?.addEventListener('hidden.bs.modal', () => {
    form.reset();
    editingShelterID = null;
  });
  
  // Handle logout
  document.querySelectorAll(".sair").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Tem certeza que deseja sair?")) {
        window.location.href = "login.html";
      }
    });
  });
});