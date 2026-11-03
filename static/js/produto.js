/**
 * Voxel Lab — Interatividade da Página de Produto (Vanilla JS)
 * Implementa CDU03 & CDU04: galeria, seletores, montagem da mensagem 6.1 do WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  const produtoContainer = document.getElementById('produto-detalhe-wrapper');
  if (!produtoContainer) return;

  const produtoNome = produtoContainer.getAttribute('data-produto-nome') || '';
  const produtoSlug = produtoContainer.getAttribute('data-produto-slug') || '';
  const whatsappNumero = produtoContainer.getAttribute('data-whatsapp-numero') || '55XXXXXXXXXXX';
  const produtoUrl = window.location.href.split('?')[0];

  // Estado das seleções
  const estado = {
    variacoes: {},
    cor: ''
  };

  // Inicializa estado com os seletores padrões
  document.querySelectorAll('.seletor-grupo-opcoes').forEach(group => {
    const groupName = group.getAttribute('data-group') || '';
    const selectedBtn = group.querySelector('.opcao-btn.selected');
    if (selectedBtn) {
      estado.variacoes[groupName] = selectedBtn.textContent.trim();
    }
  });

  const corSelecionadaSwatch = document.querySelector('.cor-swatch.selected');
  if (corSelecionadaSwatch) {
    estado.cor = corSelecionadaSwatch.getAttribute('data-nome') || '';
  }

  // Elementos de UI para atualização
  const livePreview = document.getElementById('produto-live-msg');
  const btnWhatsapp = document.getElementById('btn-pedir-whatsapp');
  const btnWhatsappMobile = document.getElementById('barra-whatsapp-fixa-btn');

  function atualizarMensagemWhatsApp() {
    let msg = `Olá, Voxel Lab! Quero este produto:\n• ${produtoNome}`;

    for (const [varName, varVal] of Object.entries(estado.variacoes)) {
      msg += `\n• ${varName}: ${varVal}`;
    }

    if (estado.cor) {
      msg += `\n• Cor: ${estado.cor}`;
    }

    msg += `\n${produtoUrl}`;

    const encoded = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${whatsappNumero}?text=${encoded}`;

    if (btnWhatsapp) {
      btnWhatsapp.href = waUrl;
    }
    if (btnWhatsappMobile) {
      btnWhatsappMobile.href = waUrl;
    }

    if (livePreview) {
      // Prévia simplificada de 1 linha conforme 7_Produto_desktop.png
      const resumoVars = Object.values(estado.variacoes).join(' · ');
      livePreview.textContent = `Mensagem: "Quero o ${produtoNome}${resumoVars ? ' · ' + resumoVars : ''}${estado.cor ? ' · ' + estado.cor : ''}"`;
    }
  }

  // Escuta mudanças de variações
  document.addEventListener('vl:change', (e) => {
    estado.variacoes[e.detail.groupName] = e.detail.value;
    atualizarMensagemWhatsApp();
  });

  // Escuta mudanças de cor
  document.addEventListener('vl:color-change', (e) => {
    estado.cor = e.detail.color;
    atualizarMensagemWhatsApp();
  });

  // Analytics de clique no WhatsApp (CDU04)
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      console.log('[Analytics] whatsapp_pedido', {
        slug: produtoSlug,
        variacoes: estado.variacoes,
        cor: estado.cor
      });
    });
  }

  // Analytics de clique no Mercado Livre (CDU06)
  const btnMl = document.getElementById('btn-comprar-ml');
  if (btnMl) {
    btnMl.addEventListener('click', () => {
      console.log('[Analytics] ml_click', { slug: produtoSlug });
    });
  }

  // Galeria de Fotos: troca de abas e fotos
  const thumbBtns = document.querySelectorAll('.produto-thumb-btn');
  const captionDisplay = document.getElementById('produto-foto-caption');
  const counterDisplay = document.getElementById('produto-foto-counter');

  const captions = {
    'instalada': 'FOTO · PEÇA INSTALADA NO TUBO, LUZ LATERAL',
    'isolada': 'FOTO · PEÇA ISOLADA EM FUNDO GRAFITE',
    'escala': 'FOTO · PEÇA COM ESCALA E COTA MILIMÉTRICA',
    'cad': 'PROJETO · VISTA ISOMÉTRICA WIREFRAME CAD'
  };

  thumbBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tipo = btn.getAttribute('data-tipo') || 'instalada';
      if (captionDisplay && captions[tipo]) {
        captionDisplay.textContent = captions[tipo];
      }
      if (counterDisplay) {
        counterDisplay.textContent = `${index + 1} / ${thumbBtns.length}`;
      }
    });
  });

  // Atualização inicial
  atualizarMensagemWhatsApp();
});

