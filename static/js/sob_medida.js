/**
 * Voxel Lab — Formulário Sob Medida (Vanilla JS)
 * Implementa CDU05 & Mensagem WhatsApp 6.2
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-sob-medida');
  if (!form) return;

  const whatsappNumero = form.getAttribute('data-whatsapp') || '5588921864755';
  const refProduto = form.getAttribute('data-ref-produto') || '';
  const refUrl = form.getAttribute('data-ref-url') || '';

  // Seleção de Tipo de Peça (Chips)
  const tipoChips = form.querySelectorAll('.tipo-chip-btn');
  let tipoSelecionado = 'Reposição';

  tipoChips.forEach(btn => {
    btn.addEventListener('click', () => {
      tipoChips.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      tipoSelecionado = btn.getAttribute('data-tipo') || btn.textContent.trim();
    });
  });

  // Toggle de Uso (Interno / Externo)
  const usoBtns = form.querySelectorAll('.toggle-uso-btn');
  let usoSelecionado = 'Externo';

  usoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      usoBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      usoSelecionado = btn.getAttribute('data-uso') || btn.textContent.trim();
    });
  });

  // Submissão e Validação do Formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let hasError = false;

    // Campos
    const descInput = document.getElementById('campo-descricao');
    const nomeInput = document.getElementById('campo-nome');
    const qtdInput = document.getElementById('campo-quantidade');
    const medidaA = document.getElementById('medida-a').value.trim() || '-';
    const medidaB = document.getElementById('medida-b').value.trim() || '-';
    const medidaC = document.getElementById('medida-c').value.trim() || '-';

    // Valida descrição
    const erroDesc = document.getElementById('erro-descricao');
    if (!descInput.value.trim()) {
      if (erroDesc) erroDesc.style.display = 'block';
      descInput.focus();
      hasError = true;
    } else {
      if (erroDesc) erroDesc.style.display = 'none';
    }

    // Valida nome
    const erroNome = document.getElementById('erro-nome');
    if (!nomeInput.value.trim()) {
      if (erroNome) erroNome.style.display = 'block';
      if (!hasError) nomeInput.focus();
      hasError = true;
    } else {
      if (erroNome) erroNome.style.display = 'none';
    }

    if (hasError) return;

    // Monta Mensagem 6.2 do CDU
    let msg = `Olá, Voxel Lab! Quero um orçamento sob medida.\n`;
    msg += `• Tipo de peça: ${tipoSelecionado}\n`;
    msg += `• O que preciso: ${descInput.value.trim()}\n`;
    msg += `• Medidas (mm): A ${medidaA} · B ${medidaB} · C ${medidaC}\n`;
    msg += `• Uso: ${usoSelecionado}\n`;
    msg += `• Quantidade: ${qtdInput.value.trim() || '1'}\n`;
    msg += `• Nome: ${nomeInput.value.trim()}\n`;

    if (refUrl) {
      msg += `• Referência: ${refUrl}\n`;
    }

    msg += `Vou enviar as fotos na sequência.`;

    // Analytics de evento
    console.log('[Analytics] whatsapp_sob_medida', {
      tipo: tipoSelecionado,
      uso: usoSelecionado,
      tem_referencia: Boolean(refUrl)
    });

    // Abre o WhatsApp
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${whatsappNumero}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
});

