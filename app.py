import os
from flask import Flask, render_template, redirect, url_for, request, abort, send_from_directory, jsonify, session
from site_config import site, get_whatsapp_url

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, 'static'),
    template_folder=os.path.join(BASE_DIR, 'templates')
)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'voxel-lab-secret-dev-key')

from data_service import get_mais_pedidos, get_categorias, get_produtos, get_produto_by_slug, get_categoria_by_slug, filtrar_produtos

# Registra globals no ambiente Jinja2 para estarem disponíveis dentro de macros importadas
app.jinja_env.globals['site'] = site
app.jinja_env.globals['site_whatsapp_url'] = get_whatsapp_url("Olá, Voxel Lab! Vim pelo site e quero tirar uma dúvida.")
app.jinja_env.globals['get_whatsapp_url'] = get_whatsapp_url

@app.context_processor
def inject_global_context():
    """Disponibiliza as variáveis globais de contexto em todos os templates Jinja2."""
    active_slug = request.view_args.get('slug') if request.view_args and 'slug' in request.view_args else ''
    return {
        'site': site,
        'site_whatsapp_url': get_whatsapp_url("Olá, Voxel Lab! Vim pelo site e quero tirar uma dúvida."),
        'active_page': request.endpoint or '',
        'active_categoria': active_slug,
        'todas_categorias': get_categorias()
    }

@app.route('/static/<path:filename>')
def serve_static_file(filename):
    """Garante que assets estáticos sejam servidos com segurança tanto localmente quanto no Vercel."""
    for folder in [os.path.join(BASE_DIR, 'public', 'static'), os.path.join(BASE_DIR, 'static')]:
        if os.path.exists(os.path.join(folder, filename)):
            return send_from_directory(folder, filename)
    abort(404)

from data_service import get_mais_pedidos, get_categorias, get_produtos, get_produto_by_slug, get_categoria_by_slug, filtrar_produtos
from flask import abort   

@app.route('/')
def index():
    """Página Inicial do Catálogo Online (CDU01)."""
    mais_pedidos = get_mais_pedidos(4)
    categorias = get_categorias()
    return render_template('pages/index.html', mais_pedidos=mais_pedidos, categorias=categorias)

@app.route('/catalogo')
def catalogo():
    """Catálogo Completo com todas as categorias e peças."""
    produtos = get_produtos()
    return render_template('pages/categoria.html', categoria=None, produtos=produtos, active_page='catalogo')

@app.route('/categoria/<slug>')
def categoria_page(slug):
    """Página de Categoria com filtros e ordenação (CDU02)."""
    cat = get_categoria_by_slug(slug)
    if not cat:
        abort(404)
    produtos = filtrar_produtos(categoria=slug)
    return render_template('pages/categoria.html', categoria=cat, produtos=produtos, active_page=slug)

@app.route('/busca')
def busca_page():
    """Página de Busca de Produtos (CDU02)."""
    q = request.args.get('q', '').strip()
    produtos = filtrar_produtos(busca=q)
    return render_template('pages/categoria.html', categoria=None, produtos=produtos, busca_query=q, active_page='busca')

@app.route('/produto/<slug>')
def produto_page(slug):
    """Página de Detalhes do Produto (CDU03 / CDU04)."""
    produto = get_produto_by_slug(slug)
    if not produto:
        abort(404)
    
    # Carrega produtos relacionados
    relacionados = []
    if produto.get('relacionados'):
        for rel_slug in produto.get('relacionados'):
            p_rel = get_produto_by_slug(rel_slug)
            if p_rel:
                relacionados.append(p_rel)
    if not relacionados:
        p_cats = set(produto.get('categorias', [produto.get('categoria')]))
        relacionados = [
            p for p in get_produtos()
            if (p.get('categoria') in p_cats or any(c in p_cats for c in p.get('categorias', [])))
            and p.get('slug') != produto.get('slug')
        ][:4]

    return render_template('pages/produto.html', produto=produto, relacionados=relacionados, active_page=produto.get('categoria', ''))

@app.route('/sob-medida')
def sob_medida_page():
    """Página de Orçamento Sob Medida (CDU05)."""
    ref_slug = request.args.get('ref', '').strip()
    ref_produto = get_produto_by_slug(ref_slug) if ref_slug else None
    return render_template('pages/sob_medida.html', ref_produto=ref_produto, active_page='sob-medida')

@app.route('/api/categorias')
def api_categorias():
    """Endpoint JSON público com todas as categorias e subcategorias."""
    return jsonify(get_categorias())

@app.route('/api/produtos')
def api_produtos():
    """Endpoint JSON público com todos os produtos do catálogo."""
    return jsonify(get_produtos())

@app.route('/robots.txt')
def robots_txt():
    """Arquivo robots.txt para SEO (RNF04)."""
    dominio = site.get('dominio', 'https://voxel-lab-black.vercel.app').rstrip('/')
    content = f"User-agent: *\nDisallow: /admin\nAllow: /\nSitemap: {dominio}/sitemap.xml\n"
    return content, 200, {'Content-Type': 'text/plain'}

@app.route('/sitemap.xml')
def sitemap_xml():
    """Sitemap XML dinâmico para SEO (RNF04)."""
    dominio = site.get('dominio', 'https://voxel-lab-black.vercel.app').rstrip('/')
    produtos = get_produtos()
    categorias = get_categorias()
    
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for path in ['/', '/catalogo', '/sob-medida']:
        xml.append(f'  <url><loc>{dominio}{path}</loc><changefreq>weekly</changefreq></url>')
    for cat in categorias:
        xml.append(f'  <url><loc>{dominio}/categoria/{cat["slug"]}</loc><changefreq>weekly</changefreq></url>')
    for p in produtos:
        xml.append(f'  <url><loc>{dominio}/produto/{p["slug"]}</loc><changefreq>weekly</changefreq></url>')
    xml.append('</urlset>')
    return '\n'.join(xml), 200, {'Content-Type': 'application/xml'}

@app.errorhandler(404)
def page_not_found(e):
    """Página de Erro 404 personalizada."""
    return render_template('pages/404.html'), 404

@app.route('/styleguide')
def styleguide():
    """Página viva de Design System & Styleguide da Fase 1."""
    return render_template('pages/styleguide.html')

# ==============================================================================
# PAINEL ADMINISTRATIVO & REGISTRO DE VENDAS (GOOGLE SHEETS)
# ==============================================================================

@app.route('/admin')
def admin_dashboard():
    """Painel de Gestão e Registro de Vendas."""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    
    produtos = get_produtos()
    produtos_ordenados = sorted(produtos, key=lambda x: x.get('nome', '').lower())
    
    return render_template(
        'admin/index.html',
        produtos=produtos_ordenados,
        webhook_url=site.get('google_sheets_webhook_url', '')
    )

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Tela e autenticação do Painel Administrativo."""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()

        admin_user = site.get('admin_user', 'admin')
        admin_pass = site.get('admin_password', 'voxel2026')

        if username == admin_user and password == admin_pass:
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            return render_template('admin/login.html', erro='Usuário ou senha incorretos.')

    if session.get('admin_logged_in'):
        return redirect(url_for('admin_dashboard'))

    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    """Encerra a sessão do administrador."""
    session.pop('admin_logged_in', None)
    return redirect(url_for('admin_login'))

@app.route('/admin/api/registrar-venda', methods=['POST'])
def admin_api_registrar_venda():
    """Envia o registro de venda para o script do Google Sheets."""
    if not session.get('admin_logged_in'):
        return jsonify({'success': False, 'message': 'Sessão expirada. Faça login novamente.'}), 401

    payload = request.get_json() or {}
    webhook_url = (payload.get('webhook_url') or site.get('google_sheets_webhook_url') or os.environ.get('GOOGLE_SHEETS_WEBHOOK_URL', '')).strip()

    if not webhook_url:
        return jsonify({
            'success': False,
            'message': 'URL da planilha não configurada. Cole o link do Webhook do Google Apps Script nas configurações.'
        }), 400

    if not payload.get('cliente_nome'):
        return jsonify({'success': False, 'message': 'Nome do cliente é obrigatório.'}), 400

    try:
        import requests
        res = requests.post(webhook_url, json=payload, timeout=20, allow_redirects=True)
        
        try:
            res_json = res.json()
            if res_json.get('success'):
                return jsonify({'success': True, 'message': res_json.get('message', 'Venda registrada com sucesso no Google Sheets!')})
            else:
                return jsonify({'success': False, 'message': res_json.get('message', 'Erro reportado pelo script do Google.')}), 400
        except Exception:
            if res.status_code == 200:
                return jsonify({'success': True, 'message': 'Venda enviada para a planilha com sucesso!'})
            return jsonify({'success': False, 'message': f'Resposta inesperada da planilha: Código {res.status_code}'}), 502

    except requests.exceptions.Timeout:
        return jsonify({'success': False, 'message': 'Tempo limite esgotado ao conectar com o Google Sheets.'}), 504
    except Exception as e:
        return jsonify({'success': False, 'message': f'Erro ao conectar com Google Sheets: {str(e)}'}), 500

@app.route('/admin/api/testar-planilha', methods=['POST'])
def admin_api_testar_planilha():
    """Envia um ping de teste para o Webhook do Google Apps Script."""
    if not session.get('admin_logged_in'):
        return jsonify({'success': False, 'message': 'Não autorizado'}), 401

    data = request.get_json() or {}
    webhook_url = (data.get('webhook_url') or site.get('google_sheets_webhook_url') or '').strip()

    if not webhook_url:
        return jsonify({'success': False, 'message': 'Informe a URL do Webhook do Apps Script.'}), 400

    try:
        import requests
        res = requests.post(webhook_url, json={'action': 'ping'}, timeout=15, allow_redirects=True)
        if res.status_code == 200:
            return jsonify({'success': True, 'message': 'Comunicação com a planilha estabelecida com sucesso!'})
        return jsonify({'success': False, 'message': f'Status recebido da planilha: {res.status_code}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Falha ao conectar: {str(e)}'}), 500

if __name__ == '__main__':
    # Roda em modo debug na porta 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
