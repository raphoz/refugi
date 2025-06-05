document.addEventListener('DOMContentLoaded', async () => {
  // Initialize variables
  const formColaborador = document.getElementById('formColaborador');
  const tabelaColaboradores = document.querySelector('.table tbody');
  let editingCollaboratorId = null;
  
  // Load collaborators when page loads
  await loadCollaborators();
  
  // Load all collaborators
  async function loadCollaborators() {
    try {
      const response = await fetch('/api/collaborators');
      if (!response.ok) throw new Error('Failed to load collaborators');
      
      const collaborators = await response.json();
      renderCollaborators(collaborators);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      alert('Erro ao carregar colaboradores. Por favor, verifique se o servidor está rodando.');
    }
  }
  
  // Render collaborators table
  function renderCollaborators(collaborators) {
    if (!tabelaColaboradores) return;
    
    tabelaColaboradores.innerHTML = '';
    
    if (collaborators.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="5" class="text-center">Nenhum colaborador cadastrado</td>';
      tabelaColaboradores.appendChild(row);
      return;
    }
    
    collaborators.forEach(collaborator => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${collaborator.nome}</td>
        <td>${collaborator.funcao}</td>
        <td>${collaborator.email}</td>
        <td>${collaborator.telefone}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary editar-colaborador" data-id="${collaborator.id}">✏️</button>
          <button class="btn btn-sm btn-outline-danger remover-colaborador" data-id="${collaborator.id}">🗑️</button>
        </td>
      `;
      tabelaColaboradores.appendChild(row);
    });
  }
  
  // Form submit handler
  formColaborador?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      nome: formColaborador.nome.value.trim(),
      funcao: formColaborador.funcao.value.trim(),
      email: formColaborador.email.value.trim(),
      telefone: formColaborador.telefone.value.trim()
    };
    
    // Add ID if editing, otherwise create new ID
    if (editingCollaboratorId) {
      formData.id = editingCollaboratorId;
    } else {
      formData.id = Date.now().toString();
    }
    
    try {
      const response = await fetch('/api/collaborators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save collaborator');
      
      // Reload collaborators to refresh view
      await loadCollaborators();
      
      // Reset form and close modal
      formColaborador.reset();
      editingCollaboratorId = null;
      bootstrap.Modal.getInstance(document.getElementById('modalColaborador')).hide();
      
    } catch (error) {
      console.error('Error saving collaborator:', error);
      alert('Erro ao salvar colaborador.');
    }
  });
  
  // Handle edit and delete buttons
  document.addEventListener('click', async (e) => {
    // Handle edit button
    if (e.target.classList.contains('editar-colaborador')) {
      const id = e.target.dataset.id;
      
      try {
        const response = await fetch(`/api/collaborators/${id}`);
        if (!response.ok) throw new Error('Failed to load collaborator');
        
        const collaborator = await response.json();
        
        // Populate form
        formColaborador.nome.value = collaborator.nome;
        formColaborador.funcao.value = collaborator.funcao;
        formColaborador.email.value = collaborator.email;
        formColaborador.telefone.value = collaborator.telefone;
        
        // Set editing ID
        editingCollaboratorId = id;
        
        // Update modal title
        const modalTitle = document.querySelector('#modalColaborador .modal-title');
        if (modalTitle) {
          modalTitle.textContent = 'Editar Colaborador';
        }
        
        // Open modal
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalColaborador')).show();
      } catch (error) {
        console.error('Error loading collaborator data:', error);
        alert('Erro ao carregar dados do colaborador.');
      }
    }
    
    // Handle delete button
    if (e.target.classList.contains('remover-colaborador')) {
      const id = e.target.dataset.id;
      
      if (confirm('Deseja remover este colaborador?')) {
        try {
          const response = await fetch(`/api/collaborators/${id}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) throw new Error('Failed to delete collaborator');
          
          // Reload collaborators to refresh view
          await loadCollaborators();
        } catch (error) {
          console.error('Error deleting collaborator:', error);
          alert('Erro ao excluir colaborador.');
        }
      }
    }
  });
  
  // Reset form when modal is opened for a new entry
  document.querySelector('[data-bs-target="#modalColaborador"]')?.addEventListener('click', () => {
    formColaborador.reset();
    editingCollaboratorId = null;
    
    // Reset modal title
    const modalTitle = document.querySelector('#modalColaborador .modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Novo Colaborador';
    }
  });
  
  // Reset form when modal is closed
  document.getElementById('modalColaborador')?.addEventListener('hidden.bs.modal', () => {
    formColaborador.reset();
    editingCollaboratorId = null;
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