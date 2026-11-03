"""
Configuração central do site Voxel Lab.
Conforme especificação na seção 2.2 do CDU.
Valores pendentes estão marcados como [DEFINIR].
"""

site = {
    'nome': 'Voxel Lab',
    'slogan': 'A peça que não existe na loja.',
    'whatsapp': '55XXXXXXXXXXX',             # [DEFINIR] DDI + DDD + número, só dígitos (ex: 5511999999999)
    'whatsapp_formatado': '(XX) 9XXXX-XXXX', # [DEFINIR] Exibição amigável
    'instagram': 'https://instagram.com/voxellab.3d',
    'instagram_handle': '@voxellab.3d',
    'mercadoLivreLoja': '',                  # [DEFINIR] URL da loja no ML (ex: https://lista.mercadolivre.com.br/_CustId_...)
    'dominio': 'https://voxellab.com.br',    # [DEFINIR] Domínio oficial de produção
    'prazoRespostaHoras': 24,                # [DEFINIR] Tempo estimado de resposta para orçamentos
    'mostrarPrecos': True,                   # Se False, exibe "Sob consulta" para todos os produtos
}

def get_whatsapp_url(text: str = '') -> str:
    """Gera o link universal wa.me com encodeURIComponent/quote da mensagem."""
    import urllib.parse
    num = site.get('whatsapp', '55XXXXXXXXXXX')
    if text:
        encoded = urllib.parse.quote(text)
        return f"https://wa.me/{num}?text={encoded}"
    return f"https://wa.me/{num}"

