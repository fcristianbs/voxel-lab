/**
 * ==============================================================================
 * VOXEL LAB - SCRIPT DE INTEGRAÇÃO GOOGLE SHEETS
 * ==============================================================================
 * 
 * Como instalar no Google Sheets:
 * 1. Abra sua planilha do Google Sheets (crie uma em branco se preferir).
 * 2. No menu superior, clique em "Extensões" > "Apps Script".
 * 3. Apague o código padrão que estiver lá e cole todo este código.
 * 4. Clique em "Implantar" (botão azul no canto superior direito) > "Nova implantação".
 * 5. Na engrenagem de tipo, selecione "App da Web".
 * 6. Configure:
 *    - Descrição: Integração Voxel Lab
 *    - Executar como: Eu (seu e-mail)
 *    - Quem pode acessar: Qualquer pessoa (Anyone)  <-- IMPORTANTE!
 * 7. Clique em "Implantar" e conceda as permissões solicitadas.
 * 8. Copie o "URL do app da Web" gerado e cole no painel /admin do Voxel Lab.
 * ==============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Evita concorrência ao inserir linhas

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Tenta encontrar uma aba chamada "Vendas", senão usa a aba ativa
    var vendasSheet = ss.getSheetByName("Vendas");
    if (vendasSheet) {
      sheet = vendasSheet;
    }

    var payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    // Se for um teste de conexão (ping)
    if (payload.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Conexão com a planilha Google estabelecida com sucesso!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Se a planilha estiver vazia, cria o cabeçalho formatado
    if (sheet.getLastRow() === 0) {
      var cabecalhos = [
        "Data/Hora",
        "Cliente",
        "WhatsApp",
        "Cidade/UF",
        "Canal de Venda",
        "Produto",
        "Variação/Cor",
        "Qtd",
        "Valor Unitário (R$)",
        "Valor Total (R$)",
        "Forma de Pagamento",
        "Prazo Acordado",
        "Status",
        "Observações"
      ];
      sheet.appendRow(cabecalhos);
      
      // Formatação básica do cabeçalho
      var headerRange = sheet.getRange(1, 1, 1, cabecalhos.length);
      headerRange.setBackground("#151b22");
      headerRange.setFontColor("#ff6b2c");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var dataHora = payload.data_hora || Utilities.formatDate(new Date(), "America/Fortaleza", "dd/MM/yyyy HH:mm");
    var clienteNome = payload.cliente_nome || "";
    var clienteWhatsApp = payload.cliente_whatsapp || "";
    var clienteCidade = payload.cliente_cidade || "";
    var canalVenda = payload.canal_venda || "WhatsApp";
    var produtoNome = payload.produto_nome || "";
    var variacao = payload.variacao_cor || "";
    var quantidade = Number(payload.quantidade) || 1;
    var valorUnitario = Number(payload.valor_unitario) || 0;
    var valorTotal = Number(payload.valor_total) || (quantidade * valorUnitario);
    var formaPagamento = payload.forma_pagamento || "Pix";
    var prazo = payload.prazo || "";
    var status = payload.status || "Em Produção";
    var observacoes = payload.observacoes || "";

    // Adiciona a nova linha de venda
    sheet.appendRow([
      dataHora,
      clienteNome,
      clienteWhatsApp,
      clienteCidade,
      canalVenda,
      produtoNome,
      variacao,
      quantidade,
      valorUnitario,
      valorTotal,
      formaPagamento,
      prazo,
      status,
      observacoes
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Venda registrada com sucesso na planilha!",
      dataHora: dataHora,
      cliente: clienteNome
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Erro no script: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Endpoint de integração Voxel Lab Google Sheets ativo. Use POST para registrar vendas."
  })).setMimeType(ContentService.MimeType.JSON);
}
