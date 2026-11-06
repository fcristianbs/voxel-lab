"""
Configuração central do site Voxel Lab.
Conforme especificação na seção 2.2 do CDU.
Valores pendentes estão marcados como [DEFINIR].
"""

import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

site = {
    'nome': 'Voxel Lab',
    'slogan': 'Precisão em cada camada.',
    'whatsapp': '5588921864755',             # DDI + DDD + número: +55 88 92186-4755
    'whatsapp_formatado': '(88) 92186-4755', # Exibição amigável
    'instagram': 'https://instagram.com/1voxellab.3d',
    'instagram_handle': '@1voxellab.3d',
    'mercadoLivreLoja': '',                  # [DEFINIR] URL da loja no ML (ex: https://lista.mercadolivre.com.br/_CustId_...)
    'dominio': 'https://voxel-lab-black.vercel.app',    # Domínio oficial Vercel
    'prazoRespostaHoras': 24,                # [DEFINIR] Tempo estimado de resposta para orçamentos
    'mostrarPrecos': True,                   # Se False, exibe "Sob consulta" para todos os produtos
    
    # Painel Administrativo e Integração Google Sheets
    'admin_user': os.environ.get('ADMIN_USER', 'admin'),
    'admin_password': os.environ.get('ADMIN_PASSWORD', 'voxel2026'),
    'google_sheets_webhook_url': os.environ.get(
        'GOOGLE_SHEETS_WEBHOOK_URL',
        'https://script.google.com/macros/s/AKfycbyAyMmGnc56ZaCx11742woUJkW7MkkJFbIjf99AygHoL_sIkpDMLnxhIgAJtz29RXFd/exec'
    ),
}

def get_whatsapp_url(text: str = '') -> str:
    """Gera o link universal wa.me com encodeURIComponent/quote da mensagem."""
    import urllib.parse
    num = site.get('whatsapp', '5588921864755')
    if text:
        encoded = urllib.parse.quote(text)
        return f"https://wa.me/{num}?text={encoded}"
    return f"https://wa.me/{num}"

