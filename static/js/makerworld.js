/**
 * ==============================================================================
 * VOXEL LAB - INTEGRAÇÃO MAKERWORLD
 * Conforme especificação em docs/makerworld/PROMPT_Antigravity_MakerWorld.md
 * ==============================================================================
 */

(function () {
  'use strict';

  /**
   * Normaliza o link colado pelo usuário:
   * 1. Trim
   * 2. Se não tiver protocolo, prefixar https://
   * 3. Host em minúsculas
   * 4. Remove query string (?...) e fragmento (#...)
   */
  function normalizarLinkMakerWorld(input) {
    if (!input) return '';
    let str = input.trim();
    if (!str) return '';
    if (!/^https?:\/\//i.test(str)) {
      str = 'https://' + str;
    }
    try {
      const url = new URL(str);
      url.host = url.host.toLowerCase();
      url.search = '';
      url.hash = '';
      return url.toString().replace(/\/$/, '');
    } catch (e) {
      return '';
    }
  }

  /**
   * Valida o link do MakerWorld:
   * - Host deve ser makerworld.com ou subdomínio direto (ex: www.makerworld.com)
   * - Caminho deve conter /models/<número>
   */
  function validarLinkMakerWorld(normalizedUrl) {
    if (!normalizedUrl) return false;
    try {
      const url = new URL(normalizedUrl);
      const host = url.hostname.toLowerCase();
      const hostsAceitos = (window.VoxelConfig && window.VoxelConfig.makerworld && window.VoxelConfig.makerworld.hostsAceitos) 
        || ['makerworld.com', 'www.makerworld.com'];

      const isHostValido = hostsAceitos.includes(host) || host === 'makerworld.com' || host.endsWith('.makerworld.com');
      if (!isHostValido) return false;

      // Caminho deve conter /models/<número>
      const pathname = url.pathname;
      const modelRegex = /\/models\/\d+/i;
      return modelRegex.test(pathname);
    } catch (e) {
      return false;
    }
  }

  /**
   * Dispara evento de analytics
   */
  function trackEvent(name, payload) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, payload);
      }
    } catch (e) {}
    try {
      const customEvent = new CustomEvent('voxel_analytics', { detail: { event: name, ...payload } });
      window.dispatchEvent(customEvent);
    } catch (e) {}
  }

  /**
   * Monta e abre a mensagem do WhatsApp (6.4a)
   */
  function abrirOrcamentoMakerWorld(linkNormalizado, termoBusca, origem) {
    const whatsappNum = (window.VoxelConfig && window.VoxelConfig.whatsapp) || '5588921864755';
    const origemUrl = window.location.href;

    // Mensagem oficial 6.4a
    let mensagem = `Olá, Voxel Lab! Quero orçar a impressão deste modelo do MakerWorld:\n${linkNormalizado}`;
    if (termoBusca && termoBusca.trim()) {
      mensagem += `\nVim pela busca: "${termoBusca.trim()}"`;
    }
    mensagem += `\nPágina: ${origemUrl}`;

    trackEvent('whatsapp_makerworld', {
      origem: origem || 'desconhecido',
      temTermo: Boolean(termoBusca && termoBusca.trim())
    });

    const urlWa = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(mensagem)}`;

    // Detecção mobile vs desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = urlWa;
    } else {
      window.open(urlWa, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Inicializa formulários de link do MakerWorld (FormLinkMakerWorld)
   */
  function initFormLinkMakerWorld(container) {
    const form = container.querySelector('form.mw-link-form');
    if (!form) return;

    const input = form.querySelector('input[type="text"], input[type="url"]');
    const errorEl = form.querySelector('.mw-form-error');
    const termoBusca = form.getAttribute('data-termo-busca') || '';
    const origem = form.getAttribute('data-origem') || 'geral';

    function showError(msg) {
      if (!errorEl) return;
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
      }
    }

    function clearError() {
      if (!errorEl) return;
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      if (input) {
        input.removeAttribute('aria-invalid');
      }
    }

    if (input) {
      input.addEventListener('input', clearError);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearError();

      const rawVal = input ? input.value : '';
      if (!rawVal || !rawVal.trim()) {
        showError('Cole o link do modelo antes de orçar.');
        return;
      }

      const normalized = normalizarLinkMakerWorld(rawVal);
      const isValid = validarLinkMakerWorld(normalized);

      if (!isValid) {
        trackEvent('makerworld_link_invalido', { origem });
        showError('Esse link não parece ser de um modelo do MakerWorld.');
        return;
      }

      abrirOrcamentoMakerWorld(normalized, termoBusca, origem);
    });
  }

  /**
   * Dispara abertura do MakerWorld em busca externa com analytics
   */
  function setupMakerWorldLinks() {
    document.querySelectorAll('a[data-mw-search]').forEach(link => {
      link.addEventListener('click', function () {
        const termo = this.getAttribute('data-mw-search') || '';
        const origem = this.getAttribute('data-mw-origem') || 'link';
        trackEvent('makerworld_busca', { termo, origem });
      });
    });
  }

  /**
   * Sugestões da Busca do Header (Ponto F)
   * Enquanto digita, mostra produtos próprios e a última linha fixa:
   * "Buscar “{termo}” no MakerWorld ↗"
   */
  let produtosCatalogoCache = null;

  function initHeaderSearchMakerWorld() {
    const searchForms = document.querySelectorAll('.vl-search-form');
    if (!searchForms.length) return;

    function carregarProdutos() {
      if (produtosCatalogoCache !== null) return Promise.resolve(produtosCatalogoCache);
      return fetch('/api/produtos')
        .then(res => res.json())
        .then(data => {
          produtosCatalogoCache = Array.isArray(data) ? data : [];
          return produtosCatalogoCache;
        })
        .catch(() => {
          produtosCatalogoCache = [];
          return [];
        });
    }

    searchForms.forEach(form => {
      const input = form.querySelector('.vl-search-input');
      if (!input) return;

      // Cria container de sugestões se não existir
      let dropdown = form.querySelector('.vl-search-suggestions');
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'vl-search-suggestions';
        dropdown.setAttribute('role', 'listbox');
        dropdown.style.display = 'none';
        form.appendChild(dropdown);
      }

      let debounceTimer = null;
      let activeIndex = -1;

      function closeDropdown() {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        activeIndex = -1;
      }

      function updateActiveItem(items) {
        items.forEach((item, idx) => {
          if (idx === activeIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
          } else {
            item.classList.remove('active');
          }
        });
      }

      input.addEventListener('focus', () => {
        carregarProdutos();
      });

      input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const termo = input.value.trim();

        if (!termo) {
          closeDropdown();
          return;
        }

        debounceTimer = setTimeout(async () => {
          const produtos = await carregarProdutos();
          const tokens = termo.toLowerCase().split(/\s+/).filter(t => t.length > 0);
          
          const filtrados = produtos.filter(p => {
            const txt = `${p.nome || ''} ${p.descricao || ''} ${p.categoria || ''} ${(p.categorias || []).join(' ')}`.toLowerCase();
            return tokens.every(token => txt.includes(token));
          }).slice(0, 4);

          const buscaUrlBase = (window.VoxelConfig && window.VoxelConfig.makerworld && window.VoxelConfig.makerworld.buscaUrl)
            || 'https://makerworld.com/en/search/models?keyword=';

          let html = '';

          // Itens próprios
          filtrados.forEach(p => {
            html += `
              <a href="/produto/${encodeURIComponent(p.slug)}" class="vl-search-suggestion-item" role="option">
                <span>${p.nome}</span>
                <span class="mono-label text-muted" style="font-size: 11px;">${p.categoria || ''}</span>
              </a>
            `;
          });

          // Última linha fixa: MakerWorld
          const mwUrl = buscaUrlBase + encodeURIComponent(termo);
          html += `
            <a href="${mwUrl}" target="_blank" rel="noopener noreferrer" class="vl-search-suggestion-item vl-search-suggestion-mw" role="option" data-mw-search="${termo.replace(/"/g, '&quot;')}" data-mw-origem="busca_header_sugestao">
              <span>Buscar “<strong>${termo}</strong>” no MakerWorld</span>
              <span class="ext-arrow">&nearr;</span>
            </a>
          `;

          dropdown.innerHTML = html;
          dropdown.style.display = 'flex';
          activeIndex = -1;

          // Wire click no MakerWorld tracking
          const mwLink = dropdown.querySelector('a[data-mw-search]');
          if (mwLink) {
            mwLink.addEventListener('click', () => {
              trackEvent('makerworld_busca', { termo, origem: 'busca_header_sugestao' });
            });
          }
        }, 120);
      });

      // Navegação por teclado
      input.addEventListener('keydown', (e) => {
        if (dropdown.style.display === 'none') return;
        const items = dropdown.querySelectorAll('.vl-search-suggestion-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIndex = (activeIndex + 1) % items.length;
          updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIndex = (activeIndex - 1 + items.length) % items.length;
          updateActiveItem(items);
        } else if (e.key === 'Enter') {
          if (activeIndex >= 0 && items[activeIndex]) {
            e.preventDefault();
            items[activeIndex].click();
          }
        } else if (e.key === 'Escape') {
          closeDropdown();
        }
      });

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!form.contains(e.target)) {
          closeDropdown();
        }
      });
    });
  }

  // Inicialização no DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.mw-link-island').forEach(initFormLinkMakerWorld);
    setupMakerWorldLinks();
    initHeaderSearchMakerWorld();
  });

  // Exposição global para testes e macros dinâmicas
  window.MakerWorld = {
    normalizarLink: normalizarLinkMakerWorld,
    validarLink: validarLinkMakerWorld,
    abrirOrcamento: abrirOrcamentoMakerWorld,
    initForm: initFormLinkMakerWorld,
    trackEvent: trackEvent
  };
})();
