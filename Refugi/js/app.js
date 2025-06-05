document.addEventListener("DOMContentLoaded", async () => {  
  const statusClassMap = {
    "Estável": "estável",
    "Em risco": "em-risco",
    "Crítico": "crítico"
  };

  // === SUPRIMENTOS ===
  const formSuprimento = document.getElementById("formSuprimento");
  const tabela = document.querySelector("#tabelaSuprimentos tbody");
  let linhaEditando = null;
  let editingSupplyId = null;

  // Load all data when page loads
  await loadAllData();

  // === DATA LOADING ===
  async function loadAllData() {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to load data');
      
      const data = await response.json();
      
      // Load each data type
      renderSupplies(data.supplies || []);
      renderShelterPeople(data.people || []);
      renderMessages(data.messages || []);
      
      // Update critical cards based on current supplies
      atualizarCardsCriticos();
      
      // Update shelter capacity display
      updateShelterCapacity(data.people ? data.people.length : 0);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Erro ao carregar dados. Por favor, verifique se o servidor está rodando.');
    }
  }

  // Render supplies table
  function renderSupplies(supplies) {
    if (!tabela) return;
    
    tabela.innerHTML = '';
    
    // Sort critical supplies first
    supplies.sort((a, b) => {
      if (a.status === 'Crítico' && b.status !== 'Crítico') return -1;
      if (a.status !== 'Crítico' && b.status === 'Crítico') return 1;
      return 0;
    });
    
    supplies.forEach(supply => {
      const badge = `<span class="status-badge status-${statusClassMap[supply.status]}">${supply.status}</span>`;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${supply.nome}</td>
        <td>${supply.atual}</td>
        <td>${supply.minimo}</td>
        <td>${badge}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary editar" data-id="${supply.id}">✏️</button>
          <button class="btn btn-sm btn-outline-danger remover" data-id="${supply.id}">🗑️</button>
        </td>
      `;
      tabela.appendChild(row);
    });
  }

  // Form submit handler for supplies
  formSuprimento?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = {
      nome: formSuprimento.nome.value.trim(),
      atual: formSuprimento.atual.value.trim(),
      minimo: formSuprimento.minimo.value.trim(),
      status: formSuprimento.status.value
    };
    
    // Add ID if editing, otherwise create new ID
    if (editingSupplyId) {
      formData.id = editingSupplyId;
    } else {
      formData.id = Date.now().toString();
    }
    
    try {
      const response = await fetch('/api/supplies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save supply');
      
      // Reload data to refresh view
      await loadAllData();
      
      formSuprimento.reset();
      editingSupplyId = null;
      bootstrap.Modal.getInstance(document.getElementById("modalSuprimento")).hide();
      
    } catch (error) {
      console.error('Error saving supply:', error);
      alert('Erro ao salvar suprimento.');
    }
  });

  // Handle edit and delete buttons for supplies
  tabela?.addEventListener("click", async (e) => {
    const btn = e.target;
    
    // Handle edit button
    if (btn.classList.contains("editar")) {
      const row = btn.closest("tr");
      const cells = row.querySelectorAll("td");
      editingSupplyId = btn.dataset.id;
      
      formSuprimento.nome.value = cells[0].textContent;
      formSuprimento.atual.value = cells[1].textContent;
      formSuprimento.minimo.value = cells[2].textContent;
      formSuprimento.status.value = cells[3].textContent.trim();
      
      bootstrap.Modal.getOrCreateInstance(document.getElementById("modalSuprimento")).show();
    }
    
    // Handle delete button
    if (btn.classList.contains("remover")) {
      const id = btn.dataset.id;
      
      if (confirm("Deseja remover este item?")) {
        try {
          const response = await fetch(`/api/supplies/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete supply');
          
          // Reload data to refresh view
          await loadAllData();
        } catch (error) {
          console.error('Error deleting supply:', error);
          alert('Erro ao excluir suprimento.');
        }
      }
    }
  });

  // === PESSOAS ABRIGADAS ===
  const formAbrigado = document.getElementById("formAbrigado");
  let editingPersonId = null;

  function renderShelterPeople(people) {
    const tabelaAbrigados = document.querySelector("#tabelaAbrigados tbody");
    if (!tabelaAbrigados) return;
    
    tabelaAbrigados.innerHTML = '';
    
    people.forEach(person => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${person.nome}</td>
        <td>${person.genero}</td>
        <td>${person.idade}</td>
        <td>${person.celular}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary editar-abrigado" data-id="${person.id}">✏️</button>
          <button class="btn btn-sm btn-outline-danger remover-abrigado" data-id="${person.id}">🗑️</button>
        </td>
      `;
      tabelaAbrigados.appendChild(row);
    });
  }

  formAbrigado?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = {
      nome: formAbrigado.nome.value.trim(),
      genero: formAbrigado.genero.value,
      idade: formAbrigado.idade.value.trim(),
      celular: formAbrigado.celular.value.trim()
    };
    
    // Check if we're editing or creating new
    if (editingPersonId) {
      formData.id = editingPersonId;
    } else {
      formData.id = Date.now().toString();
    }
    
    try {
      const response = await fetch('/api/people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save person');
      
      // Reload data to refresh view
      await loadAllData();
      
      formAbrigado.reset();
      editingPersonId = null; // Reset editing ID
      bootstrap.Modal.getInstance(document.getElementById("modalAbrigado")).hide();
      
    } catch (error) {
      console.error('Error saving person:', error);
      alert('Erro ao salvar pessoa abrigada.');
    }
  });

    // Handle edit button for people - add this code after the delete button handler
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("editar-abrigado")) {
      const id = e.target.dataset.id;
      
      try {
        // Fetch the person data
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to load data');
        
        const data = await response.json();
        const person = data.people.find(p => p.id === id);
        
        if (!person) {
          throw new Error('Person not found');
        }
        
        // Populate form
        formAbrigado.nome.value = person.nome;
        formAbrigado.genero.value = person.genero;
        formAbrigado.idade.value = person.idade;
        formAbrigado.celular.value = person.celular;
        
        // Set editing ID
        editingPersonId = id;
        
        // Update modal title
        const modalTitle = document.querySelector('#modalAbrigado .modal-title');
        if (modalTitle) {
          modalTitle.textContent = 'Editar Abrigado';
        }
        
        // Update submit button text
        const submitButton = document.querySelector('#formAbrigado button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'Atualizar';
        }
        
        // Show modal
        bootstrap.Modal.getOrCreateInstance(document.getElementById("modalAbrigado")).show();
      } catch (error) {
        console.error('Error loading person data:', error);
        alert('Erro ao carregar dados da pessoa.');
      }
    }
  });

    // Reset form and editing state when modal is opened for a new entry
  document.querySelector('[data-bs-target="#modalAbrigado"]')?.addEventListener('click', () => {
    formAbrigado.reset();
    editingPersonId = null;
    
    // Reset modal title
    const modalTitle = document.querySelector('#modalAbrigado .modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Novo Abrigado';
    }
    
    // Reset submit button text
    const submitButton = document.querySelector('#formAbrigado button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = 'Adicionar';
    }
  });
  
  // Reset form when modal is closed
  document.getElementById('modalAbrigado')?.addEventListener('hidden.bs.modal', () => {
    formAbrigado.reset();
    editingPersonId = null;
  });

  // Handle delete button for people
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("remover-abrigado")) {
      const id = e.target.dataset.id;
      
      if (confirm("Deseja remover esta pessoa?")) {
        try {
          const response = await fetch(`/api/people/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete person');
          
          await loadAllData();
        } catch (error) {
          console.error('Error deleting person:', error);
          alert('Erro ao excluir pessoa.');
        }
      }
    }
  });

  // Update shelter capacity visualization
  function updateShelterCapacity(peopleCount) {
    const capacityTotal = 360; // Total capacity
    const occupiedPercentage = Math.round((peopleCount / capacityTotal) * 100);
    
    // Update donut chart
    const donutChart = document.querySelector('.donut-chart-container');
    if (donutChart) {
      donutChart.style.background = `conic-gradient(#6366F1 0% ${occupiedPercentage}%, #10B981 ${occupiedPercentage}% 100%)`;
      
      // Update text
      const donutText = document.querySelector('.donut-chart-text');
      if (donutText) {
        donutText.innerHTML = `${occupiedPercentage}%<br><small>Ocupado</small>`;
      }
      
      // Update count text
      const countText = document.querySelector('.card-body p.mt-3');
      if (countText) {
        countText.innerHTML = `<strong>${peopleCount}</strong> / ${capacityTotal} pessoas`;
      }
    }
  }

  // === MENSAGENS DE ALERTA ===
  const formMensagem = document.getElementById("formMensagem");
  
  function renderMessages(messages) {
    const painelMensagens = document.getElementById("painelMensagens");
    if (!painelMensagens) return;
    
    painelMensagens.innerHTML = '';
    
    // Sort messages by timestamp (newest first)
    messages.sort((a, b) => b.timestamp - a.timestamp);
    
    messages.forEach(message => {
      const settings = {
        "Informação": {
          color: "#0d6efd",
          class: "",
          icon: "<i class='fas fa-info-circle alert-icon'></i>"
        },
        "Urgente": {
          color: "#dc3545",
          class: "urgent",
          icon: "<i class='fas fa-bell alert-icon'></i>"
        },
        "Atenção": {
          color: "#ffc107",
          class: "attention",
          icon: "<i class='fas fa-triangle-exclamation alert-icon'></i>"
        }
      };
      
      const messageDate = new Date(message.timestamp);
      const timeStr = messageDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const html = `
        <div class="alert-message ${settings[message.tipo]["class"]}" 
             style="border-left: 5px solid ${settings[message.tipo]["color"]};">
          ${settings[message.tipo]["icon"]}
          <div class="alert-content">
              <p class="mb-0 text-gray-800"><strong>${message.tipo}</strong></p>
              <p class="mb-0 text-gray-800">${message.texto}</p>
          </div>
          <small>por ${message.autor} — ${timeStr}</small>
        </div>`;
      
      painelMensagens.insertAdjacentHTML("beforeend", html);
    });
  }

  formMensagem?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = {
      id: Date.now().toString(),
      texto: formMensagem.texto.value.trim(),
      autor: formMensagem.autor.value.trim(),
      tipo: formMensagem.tipo.value,
      timestamp: Date.now()
    };
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save message');
      
      await loadAllData();
      
      formMensagem.reset();
      bootstrap.Modal.getInstance(document.getElementById("modalMensagem")).hide();
      
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Erro ao salvar mensagem.');
    }
  });

  // === CARDS CRÍTICOS ===
  function atualizarCardsCriticos() {
    const cardsContainer = document.getElementById("cardsCriticos");
    if (!cardsContainer) return;
    
    cardsContainer.innerHTML = "";
    const linhas = document.querySelectorAll("#tabelaSuprimentos tbody tr");
  
    linhas.forEach(linha => {
      const statusEl = linha.querySelector("td:nth-child(4)");
      const statusText = statusEl?.textContent?.trim();
      if (statusText === "Crítico") {
        const nome = linha.children[0].textContent;
        const atual = linha.children[1].textContent;
        const minimo = linha.children[2].textContent;
  
        const card = document.createElement("div");
        card.className = "col-12 col-md-6";
        card.innerHTML = `
          <div class="card border-danger h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-danger fw-bold mb-0">Suprimento Crítico</h6>
                <span class="badge bg-danger">ALERTA</span>
              </div>
              <p class="mb-1 fw-semibold">${nome}</p>
              <p class="mb-0"><strong>Atual:</strong> ${atual}</p>
              <p class="mb-0"><strong>Mínimo:</strong> ${minimo}</p>
            </div>
          </div>`;
        cardsContainer.appendChild(card);
      }
    });
  }

  // === SAIR ===
  document.querySelectorAll(".sair").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Tem certeza que deseja sair?")) {
        window.location.href = "index.html";
      }
    });
  });
});