"""
Configuração central do site Voxel Lab.
Conforme especificação na seção 2.2 do CDU.
Valores pendentes estão marcados como [DEFINIR].
"""

site = {
    'nome': 'Voxel Lab',
    'slogan': 'A peça que não existe na loja.',
    'whatsapp': '5588921864755',             # DDI + DDD + número: +55 88 92186-4755
    'whatsapp_formatado': '(88) 92186-4755', # Exibição amigável
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
    num = site.get('whatsapp', '5588921864755')
    if text:
        encoded = urllib.parse.quote(text)
        return f"https://wa.me/{num}?text={encoded}"
    return f"https://wa.me/{num}"

