/**
 * Voxel Lab — Main Vanilla JS (main.js)
 * Utilitários globais, navegação mobile e acessibilidade
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa o menu mobile
  initMobileNav();
  // Inicializa o dropdown de categorias no desktop
  initNavDropdown();
});

/**
 * Inicializa abertura/fechamento do dropdown de categorias extras no desktop
 */
function initNavDropdown() {
  const dropdown = document.getElementById('nav-dropdown-categorias');
  if (!dropdown) return;

  const btn = dropdown.querySelector('.vl-nav-dropdown-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Fechar ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Inicializa abertura/fechamento do menu mobile e busca
 */
function initMobileNav() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('open');
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    });

    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        mobileDrawer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }
}

