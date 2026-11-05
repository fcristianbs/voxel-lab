/**
 * Voxel Lab — Catálogo & Filtros Reativos (Vanilla JS)
 * Implementa CDU02: filtragem instantânea sem reload, sincronização de URL e estado vazio
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('catalogo-wrapper');
  if (!container) return;

  const productCards = Array.from(container.querySelectorAll('.card-produto-item'));
  const activeChipsContainer = document.getElementById('catalogo-chips-ativos');
  const countDisplay = document.getElementById('catalogo-count-display');
  const emptyState = document.getElementById('catalogo-empty-state');
  const sortSelect = document.getElementById('catalogo-sort-select');
  const clearFiltersBtn = document.getElementById('btn-limpar-filtros');

  // Lê parâmetros iniciais da URL
  const urlParams = new URLSearchParams(window.location.search);

  // Inicializa inputs com valores da URL
  initInputsFromUrl(urlParams);

  // Escuta mudanças nos inputs de filtro
  const filterInputs = document.querySelectorAll('.filtro-catalogo-input');
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      clearAllFilters();
    });
  }

  // Aplica filtros logo ao carregar
  applyFiltersAndSort(false);

  function initInputsFromUrl(params) {
    const sub = params.getAll('sub');
    const mat = params.getAll('material');
    const uso = params.get('uso');
    const ordem = params.get('ordem');

    if (sub.length > 0) {
      document.querySelectorAll('input[name="subcategoria"]').forEach(cb => {
        if (sub.includes(cb.value.toLowerCase())) cb.checked = true;
      });
    }

    if (mat.length > 0) {
      document.querySelectorAll('input[name="material"]').forEach(cb => {
        if (mat.includes(cb.value.toLowerCase())) cb.checked = true;
      });
    }

    if (uso) {
      const radio = document.querySelector(`input[name="uso"][value="${uso.toLowerCase()}"]`);
      if (radio) radio.checked = true;
    }

    if (ordem && sortSelect) {
      sortSelect.value = ordem;
    }
  }

  function getActiveFilterValues() {
    const subs = Array.from(document.querySelectorAll('input[name="subcategoria"]:checked')).map(cb => cb.value.toLowerCase());
    const mats = Array.from(document.querySelectorAll('input[name="material"]:checked')).map(cb => cb.value.toLowerCase());
    const usoRadio = document.querySelector('input[name="uso"]:checked');
    const uso = usoRadio ? usoRadio.value.toLowerCase() : '';
    const ordem = sortSelect ? sortSelect.value : 'mais_pedidos';

    return { subs, mats, uso, ordem };
  }

  function updateUrl(filters) {
    const params = new URLSearchParams();

    filters.subs.forEach(s => params.append('sub', s));
    filters.mats.forEach(m => params.append('material', m));
    if (filters.uso && filters.uso !== 'todos') {
      params.set('uso', filters.uso);
    }
    if (filters.ordem && filters.ordem !== 'mais_pedidos') {
      params.set('ordem', filters.ordem);
    }

    const newQuery = params.toString();
    const newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState({}, '', newUrl);
  }

  function renderActiveChips(filters) {
    if (!activeChipsContainer) return;
    activeChipsContainer.innerHTML = '';

    const addChip = (label, onRemove) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'vl-chip active';
      chip.innerHTML = `<span>${label}</span><span class="vl-chip-remove" aria-label="Remover">&times;</span>`;
      chip.addEventListener('click', onRemove);
      activeChipsContainer.appendChild(chip);
    };

    filters.subs.forEach(sub => {
      const input = document.querySelector(`input[name="subcategoria"][value="${sub}"]`);
      const label = input ? input.closest('.filtro-label').textContent.trim() : sub;
      addChip(label, () => {
        if (input) input.checked = false;
        applyFiltersAndSort();
      });
    });

    filters.mats.forEach(mat => {
      const input = document.querySelector(`input[name="material"][value="${mat}"]`);
      const label = input ? input.closest('.filtro-label').textContent.trim() : mat.toUpperCase();
      addChip(label, () => {
        if (input) input.checked = false;
        applyFiltersAndSort();
      });
    });

    if (filters.uso && filters.uso !== 'todos') {
      const input = document.querySelector(`input[name="uso"][value="${filters.uso}"]`);
      const label = input ? input.closest('.filtro-label').textContent.trim() : (filters.uso === 'externo' ? 'Externo' : 'Interno');
      addChip(label, () => {
        const todosRadio = document.querySelector('input[name="uso"][value="todos"]');
        if (todosRadio) todosRadio.checked = true;
        else if (input) input.checked = false;
        applyFiltersAndSort();
      });
    }
  }

  function applyFiltersAndSort(updateHistory = true) {
    const filters = getActiveFilterValues();

    if (updateHistory) {
      updateUrl(filters);
    }

    renderActiveChips(filters);

    let visibleCount = 0;

    // Filtra cards
    productCards.forEach(card => {
      const pSubRaw = (card.getAttribute('data-subcategoria') || '').toLowerCase();
      const pSubs = pSubRaw.split(/[,\s]+/).filter(Boolean);
      const pMat = (card.getAttribute('data-material') || '').toLowerCase();
      const pUso = (card.getAttribute('data-uso') || '').toLowerCase();

      // Critério Subcategoria: se selecionado, produto deve ter uma das subs
      const matchSub = filters.subs.length === 0 || filters.subs.some(s => pSubs.includes(s) || pSubRaw === s);

      // Critério Material: se selecionado, deve conter um dos materiais
      const matchMat = filters.mats.length === 0 || filters.mats.some(m => pMat.includes(m));

      // Critério Uso
      const matchUso = !filters.uso || filters.uso === 'todos' || pUso === filters.uso || pUso === 'ambos';

      const isVisible = matchSub && matchMat && matchUso;

      if (isVisible) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Ordenação dos itens visíveis
    sortProducts(filters.ordem);

    // Atualiza contador
    if (countDisplay) {
      countDisplay.textContent = `Mostrando ${visibleCount} de ${productCards.length} peças`;
    }

    // Gerencia estado vazio
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.add('visible');
      } else {
        emptyState.classList.remove('visible');
      }
    }
  }

  function sortProducts(criteria) {
    const grid = document.getElementById('catalogo-produtos-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.card-produto-item'));

    cards.sort((a, b) => {
      if (criteria === 'nome') {
        const nameA = a.getAttribute('data-nome') || '';
        const nameB = b.getAttribute('data-nome') || '';
        return nameA.localeCompare(nameB);
      } else if (criteria === 'menor_preco') {
        const priceA = parseFloat(a.getAttribute('data-preco')) || 999999;
        const priceB = parseFloat(b.getAttribute('data-preco')) || 999999;
        return priceA - priceB;
      } else {
        // mais_pedidos
        const orderA = parseInt(a.getAttribute('data-ordem')) || 999;
        const orderB = parseInt(b.getAttribute('data-ordem')) || 999;
        return orderA - orderB;
      }
    });

    cards.forEach(c => grid.appendChild(c));
  }

  function clearAllFilters() {
    document.querySelectorAll('.filtro-catalogo-input').forEach(input => {
      if (input.type === 'checkbox') input.checked = false;
      if (input.type === 'radio') {
        input.checked = input.value === 'todos';
      }
    });
    if (sortSelect) sortSelect.value = 'mais_pedidos';
    applyFiltersAndSort();
  }
});

