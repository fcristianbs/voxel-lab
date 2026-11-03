/**
 * Voxel Lab — Interatividade de Componentes (Vanilla JS)
 * Gerenciamento de seletores de variação, cor, chips e prévias
 */

document.addEventListener('DOMContentLoaded', () => {
  initOptionSelectors();
  initColorSelectors();
  initChips();
});

/**
 * Inicializa seletores de opção (SeletorOpcao)
 */
function initOptionSelectors() {
  document.querySelectorAll('.seletor-grupo-opcoes').forEach((group) => {
    const buttons = group.querySelectorAll('.opcao-btn:not(.opcao-outra-medida)');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        buttons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Dispara evento customizado
        group.dispatchEvent(new CustomEvent('vl:change', {
          detail: {
            value: btn.getAttribute('data-value') || btn.textContent.trim(),
            groupName: group.getAttribute('data-group') || ''
          },
          bubbles: true
        }));
      });
    });
  });
}

/**
 * Inicializa seletores de cor (SeletorCor)
 */
function initColorSelectors() {
  document.querySelectorAll('.seletor-grupo-cores').forEach((group) => {
    const swatches = group.querySelectorAll('.cor-swatch');
    const labelSpan = group.querySelector('.cor-nome-selecionada');

    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        swatches.forEach((s) => s.classList.remove('selected'));
        swatch.classList.add('selected');

        const colorName = swatch.getAttribute('data-nome') || '';
        if (labelSpan) {
          labelSpan.textContent = colorName;
        }

        group.dispatchEvent(new CustomEvent('vl:color-change', {
          detail: {
            color: colorName,
            hex: swatch.getAttribute('data-hex') || ''
          },
          bubbles: true
        }));
      });
    });
  });
}

/**
 * Inicializa chips interativos
 */
function initChips() {
  document.querySelectorAll('.vl-chip-interactive').forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });
}

