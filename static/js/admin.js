/**
 * ==============================================================================
 * VOXEL LAB - ADMIN PANEL JS (Registro de Vendas & Integração Google Sheets)
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const formVenda = document.getElementById('form-venda');
  const selectProduto = document.getElementById('venda-produto');
  const inputQtd = document.getElementById('venda-qtd');
  const inputValorUnitario = document.getElementById('venda-valor-unitario');
  const displayTotal = document.getElementById('display-total');
  const previewBox = document.getElementById('produto-preview-box');
  const previewImg = document.getElementById('preview-img');
  const previewNome = document.getElementById('preview-nome');
  const previewSpecs = document.getElementById('preview-specs');
  const selectCor = document.getElementById('venda-cor');
  const btnSubmit = document.getElementById('btn-registrar-venda');
  const alertContainer = document.getElementById('admin-alert-container');
  const historyList = document.getElementById('admin-history-list');
  const inputWebhook = document.getElementById('sheets-webhook-url');
  const btnSalvarWebhook = document.getElementById('btn-salvar-webhook');
  const btnTestarConexao = document.getElementById('btn-testar-conexao');
  const statusIndicator = document.getElementById('status-webhook-indicator');
  const btnCopiarScript = document.getElementById('btn-copiar-script');

  // Recupera URL do Webhook do localStorage caso exista
  const savedWebhook = localStorage.getItem('voxel_sheets_webhook_url');
  if (savedWebhook && inputWebhook && !inputWebhook.value) {
    inputWebhook.value = savedWebhook;
  }
  atualizarStatusWebhook();

  // Histórico de vendas da sessão (em memória/localStorage)
  let historicoSessao = [];
  try {
    const rawHist = sessionStorage.getItem('voxel_admin_recent_sales');
    if (rawHist) historicoSessao = JSON.parse(rawHist);
  } catch (e) {}
  renderHistorico();

  // 1. Atualização do Produto Selecionado
  if (selectProduto) {
    selectProduto.addEventListener('change', () => {
      const selectedOption = selectProduto.options[selectProduto.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        if (previewBox) previewBox.style.display = 'none';
        if (inputValorUnitario) inputValorUnitario.value = '';
        recalcularTotal();
        return;
      }

      const preco = parseFloat(selectedOption.getAttribute('data-preco')) || 0;
      const nome = selectedOption.getAttribute('data-nome') || selectedOption.text;
      const img = selectedOption.getAttribute('data-img') || '';
      const material = selectedOption.getAttribute('data-material') || '';
      const categoria = selectedOption.getAttribute('data-categoria') || '';
      const coresRaw = selectedOption.getAttribute('data-cores') || '';

      // Atualiza valor unitário
      if (inputValorUnitario) {
        inputValorUnitario.value = preco.toFixed(2);
      }

      // Atualiza preview
      if (previewBox) {
        previewBox.style.display = 'flex';
        if (previewImg) {
          previewImg.src = img || '/static/img/logo/voxel-icone-mono-branco.svg';
          previewImg.alt = nome;
        }
        if (previewNome) previewNome.textContent = nome;
        if (previewSpecs) {
          previewSpecs.textContent = `${categoria.toUpperCase()} · ${material.toUpperCase()} · R$ ${preco.toFixed(2).replace('.', ',')}`;
        }
      }

      // Atualiza opções de cor / variação
      if (selectCor) {
        selectCor.innerHTML = '<option value="">Padrão da loja / Não especificada</option>';
        if (coresRaw) {
          try {
            const cores = JSON.parse(coresRaw);
            cores.forEach(c => {
              const opt = document.createElement('option');
              opt.value = c.nome;
              opt.textContent = c.nome + (c.padrao ? ' (Padrão)' : '');
              selectCor.appendChild(opt);
            });
          } catch (e) {}
        }
      }

      recalcularTotal();
    });
  }

  // 2. Recálculo Dinâmico do Total
  function recalcularTotal() {
    const qtd = parseInt(inputQtd ? inputQtd.value : 1, 10) || 1;
    const unit = parseFloat(inputValorUnitario ? inputValorUnitario.value : 0) || 0;
    const total = qtd * unit;
    if (displayTotal) {
      displayTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
  }

  if (inputQtd) inputQtd.addEventListener('input', recalcularTotal);
  if (inputValorUnitario) inputValorUnitario.addEventListener('input', recalcularTotal);

  // 3. Envio do Formulário de Registro de Venda
  if (formVenda) {
    formVenda.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selectedOption = selectProduto.options[selectProduto.selectedIndex];
      if (!selectedOption || !selectedOption.value) {
        showAlert('Selecione um produto da loja para continuar.', 'error');
        selectProduto.focus();
        return;
      }

      const clienteNome = (document.getElementById('venda-cliente-nome')?.value || '').trim();
      if (!clienteNome) {
        showAlert('Preencha o nome do cliente.', 'error');
        document.getElementById('venda-cliente-nome')?.focus();
        return;
      }

      const webhookUrl = (inputWebhook ? inputWebhook.value : '').trim();
      if (!webhookUrl) {
        showAlert('Por favor, informe a URL do Webhook do Google Apps Script antes de registrar a venda.', 'error');
        inputWebhook?.focus();
        return;
      }

      const qtd = parseInt(inputQtd.value, 10) || 1;
      const unitario = parseFloat(inputValorUnitario.value) || 0;
      const total = qtd * unitario;

      const payload = {
        webhook_url: webhookUrl,
        cliente_nome: clienteNome,
        cliente_whatsapp: (document.getElementById('venda-cliente-whatsapp')?.value || '').trim(),
        cliente_cidade: (document.getElementById('venda-cliente-cidade')?.value || '').trim(),
        canal_venda: document.getElementById('venda-canal')?.value || 'WhatsApp',
        produto_slug: selectedOption.value,
        produto_nome: selectedOption.getAttribute('data-nome') || selectedOption.text,
        variacao_cor: (selectCor ? selectCor.value : '') || '',
        quantidade: qtd,
        valor_unitario: unitario,
        valor_total: total,
        forma_pagamento: document.getElementById('venda-pagamento')?.value || 'Pix',
        prazo: (document.getElementById('venda-prazo')?.value || '').trim(),
        status: document.getElementById('venda-status')?.value || 'Em Produção',
        observacoes: (document.getElementById('venda-observacoes')?.value || '').trim(),
        data_hora: new Date().toLocaleString('pt-BR')
      };

      // Feedback de envio
      setLoading(true);
      showAlert('Enviando dados para a planilha Google...', 'info');

      try {
        const res = await fetch('/admin/api/registrar-venda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showAlert(`✓ ${data.message || 'Venda registrada com sucesso no Google Sheets!'}`, 'success');
          
          // Adiciona ao histórico da sessão
          historicoSessao.unshift({
            cliente: payload.cliente_nome,
            produto: payload.produto_nome,
            qtd: payload.quantidade,
            total: payload.valor_total,
            status: payload.status,
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          });
          sessionStorage.setItem('voxel_admin_recent_sales', JSON.stringify(historicoSessao));
          renderHistorico();

          // Limpa campos do cliente e observações
          document.getElementById('venda-cliente-nome').value = '';
          document.getElementById('venda-cliente-whatsapp').value = '';
          document.getElementById('venda-cliente-cidade').value = '';
          document.getElementById('venda-observacoes').value = '';
          if (selectCor) selectCor.value = '';
          inputQtd.value = '1';
          recalcularTotal();
        } else {
          showAlert(`Erro: ${data.message || 'Falha ao comunicar com o Google Sheets.'}`, 'error');
        }
      } catch (err) {
        showAlert(`Falha na requisição: ${err.message}`, 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  // 4. Salvar Webhook URL no LocalStorage
  if (btnSalvarWebhook) {
    btnSalvarWebhook.addEventListener('click', () => {
      const url = (inputWebhook ? inputWebhook.value : '').trim();
      if (!url) {
        showAlert('Digite ou cole a URL do Google Apps Script antes de salvar.', 'error');
        return;
      }
      localStorage.setItem('voxel_sheets_webhook_url', url);
      showAlert('URL da planilha salva no seu navegador com sucesso!', 'success');
      atualizarStatusWebhook();
    });
  }

  // 5. Testar Conexão com Google Sheets
  if (btnTestarConexao) {
    btnTestarConexao.addEventListener('click', async () => {
      const url = (inputWebhook ? inputWebhook.value : '').trim();
      if (!url) {
        showAlert('Informe a URL do Webhook do Google Apps Script para testar.', 'error');
        inputWebhook?.focus();
        return;
      }

      btnTestarConexao.disabled = true;
      btnTestarConexao.textContent = 'Testando...';
      showAlert('Enviando sinal de teste (ping) para a planilha...', 'info');

      try {
        const res = await fetch('/admin/api/testar-planilha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhook_url: url })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showAlert(`✓ Conexão bem-sucedida! ${data.message}`, 'success');
          localStorage.setItem('voxel_sheets_webhook_url', url);
          atualizarStatusWebhook();
        } else {
          showAlert(`Falha no teste: ${data.message || 'Verifique se a permissão foi definida como Qualquer pessoa (Anyone).'}`, 'error');
        }
      } catch (err) {
        showAlert(`Erro de conexão: ${err.message}`, 'error');
      } finally {
        btnTestarConexao.disabled = false;
        btnTestarConexao.textContent = 'Testar Conexão';
      }
    });
  }

  // 6. Copiar Script do Apps Script
  if (btnCopiarScript) {
    btnCopiarScript.addEventListener('click', () => {
      const codeElement = document.getElementById('google-apps-script-code');
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.textContent).then(() => {
          const originalText = btnCopiarScript.textContent;
          btnCopiarScript.textContent = '✓ Código Copiado!';
          setTimeout(() => { btnCopiarScript.textContent = originalText; }, 2500);
        });
      }
    });
  }

  // Funções Auxiliares
  function setLoading(isLoading) {
    if (btnSubmit) {
      btnSubmit.disabled = isLoading;
      btnSubmit.innerHTML = isLoading 
        ? `<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 0.8s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg> Registrando...` 
        : `Salvar e Enviar para Planilha →`;
    }
  }

  function showAlert(msg, type = 'info') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="admin-alert admin-alert-${type}">
        <span>${msg}</span>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function atualizarStatusWebhook() {
    if (!statusIndicator) return;
    const url = (inputWebhook ? inputWebhook.value : '').trim();
    if (url && url.startsWith('https://script.google.com')) {
      statusIndicator.innerHTML = `<span class="admin-status-dot online"></span> Webhook Configurado`;
      statusIndicator.style.color = 'var(--ok)';
    } else {
      statusIndicator.innerHTML = `<span class="admin-status-dot offline"></span> Não Configurado`;
      statusIndicator.style.color = '#ff5c5c';
    }
  }

  function renderHistorico() {
    if (!historyList) return;
    if (historicoSessao.length === 0) {
      historyList.innerHTML = `<p style="color: var(--ink-muted); font-size: 12px; margin: 0;">Nenhuma venda registrada nesta sessão ainda.</p>`;
      return;
    }

    historyList.innerHTML = historicoSessao.map(item => `
      <div class="admin-history-item">
        <div class="admin-history-item-info">
          <h5>${escapeHtml(item.cliente)} · <span style="font-weight: 400; color: var(--ink-muted);">${escapeHtml(item.produto)} (${item.qtd}x)</span></h5>
          <p>${item.hora} · Status: ${escapeHtml(item.status)}</p>
        </div>
        <div class="admin-history-item-price">
          R$ ${item.total.toFixed(2).replace('.', ',')}
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});

// Animação CSS para o spinner inline
const style = document.createElement('style');
style.textContent = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
