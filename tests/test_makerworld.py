import unittest
import re
from urllib.parse import urlparse
from app import app
from site_config import site
from data_service import get_makerworld_temas, get_makerworld_vitrine

def normalizar_link_makerworld(url_input: str) -> str:
    if not url_input:
        return ''
    s = url_input.strip()
    if not s:
        return ''
    if not re.match(r'^https?://', s, re.IGNORECASE):
        s = 'https://' + s
    try:
        p = urlparse(s)
        host = p.netloc.lower()
        path = p.path.rstrip('/')
        return f"{p.scheme}://{host}{path}"
    except Exception:
        return ''

def validar_link_makerworld(normalized_url: str) -> bool:
    if not normalized_url:
        return False
    try:
        p = urlparse(normalized_url)
        host = p.netloc.lower()
        hosts_aceitos = site.get('makerworld', {}).get('hostsAceitos', ['makerworld.com', 'www.makerworld.com'])
        is_host_valido = host in hosts_aceitos or host == 'makerworld.com' or host.endswith('.makerworld.com')
        if not is_host_valido:
            return False
        return bool(re.search(r'/models/\d+', p.path, re.IGNORECASE))
    except Exception:
        return False

class TestMakerWorldIntegration(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()
        self.app_ctx = app.app_context()
        self.app_ctx.push()

    def tearDown(self):
        self.app_ctx.pop()
        site['makerworld']['ativo'] = True

    def test_url_normalization_and_validation(self):
        # Casos Válidos
        validos = [
            ("https://makerworld.com/en/models/408321", "https://makerworld.com/en/models/408321"),
            ("makerworld.com/models/12345?ref=track#anchor", "https://makerworld.com/models/12345"),
            ("https://www.makerworld.com/pt/models/999-slug-do-modelo?utm_source=xyz", "https://www.makerworld.com/pt/models/999-slug-do-modelo"),
            ("http://makerworld.com/models/555/", "http://makerworld.com/models/555"),
        ]
        for raw, expected in validos:
            norm = normalizar_link_makerworld(raw)
            self.assertEqual(norm, expected, f"Falha na normalização de: {raw}")
            self.assertTrue(validar_link_makerworld(norm), f"Deveria ser válido: {norm}")

        # Casos Inválidos
        invalidos = [
            "https://makerworld.com/en/search",
            "https://makerworld.com.evil.com/models/12345",
            "https://outrosite.com/models/12345",
            "makerworld sem url nenhuma",
            "",
            "   ",
            "https://makerworld.com/models/abc-sem-numero",
        ]
        for raw in invalidos:
            norm = normalizar_link_makerworld(raw)
            self.assertFalse(validar_link_makerworld(norm), f"Deveria ser inválido: {raw}")

    def test_routes_with_makerworld_active(self):
        site['makerworld']['ativo'] = True

        # Home
        res_home = self.client.get('/')
        self.assertEqual(res_home.status_code, 200)
        self.assertIn(b'Viu no MakerWorld?', res_home.data)
        self.assertIn(b'mw-home-banner', res_home.data)

        # Catálogo
        res_cat = self.client.get('/catalogo')
        self.assertEqual(res_cat.status_code, 200)
        self.assertIn(b'mw-category-end-card', res_cat.data)
        self.assertIn(b'mw-header-tab', res_cat.data)

        # Categoria Específica
        res_eng = self.client.get('/categoria/engenharia')
        self.assertEqual(res_eng.status_code, 200)
        self.assertIn(b'mw-category-end-card', res_eng.data)
        self.assertIn(b'mw-mobile-chip', res_eng.data)
        self.assertIn(b'mw-sidebar-option-mw', res_eng.data)

        # Busca sem resultado (Ponto C)
        res_busca_vazia = self.client.get('/busca?q=termoinexistente999')
        self.assertEqual(res_busca_vazia.status_code, 200)
        self.assertIn(b'CAMINHO 1', res_busca_vazia.data)
        self.assertIn(b'CAMINHO 2', res_busca_vazia.data)
        self.assertIn(b'Talvez sirva', res_busca_vazia.data)

        # Página dedicada /makerworld
        res_mw = self.client.get('/makerworld')
        self.assertEqual(res_mw.status_code, 200)
        self.assertIn(b'Milhares de modelos', res_mw.data)
        self.assertIn(b'EXPLORE POR TEMA', res_mw.data)
        self.assertIn(b'J\xc3\x81 IMPRESSOS PELA VOXEL LAB', res_mw.data)
        self.assertIn(b'Como funciona', res_mw.data)

    def test_routes_with_makerworld_inactive(self):
        site['makerworld']['ativo'] = False

        # /makerworld deve retornar 404
        res_mw = self.client.get('/makerworld')
        self.assertEqual(res_mw.status_code, 404)

        # Home não deve ter a faixa
        res_home = self.client.get('/')
        self.assertEqual(res_home.status_code, 200)
        self.assertNotIn(b'mw-home-banner', res_home.data)

        # Catálogo não deve ter a aba nem o card de fim de categoria
        res_cat = self.client.get('/catalogo')
        self.assertEqual(res_cat.status_code, 200)
        self.assertNotIn(b'mw-header-tab', res_cat.data)
        self.assertNotIn(b'mw-category-end-card', res_cat.data)

    def test_data_service_vitrine_and_temas(self):
        temas = get_makerworld_temas()
        self.assertEqual(len(temas), 6)
        
        vitrine = get_makerworld_vitrine()
        self.assertGreaterEqual(len(vitrine), 1)
        for item in vitrine:
            self.assertTrue(item.get('ativo', True))
            self.assertTrue(item.get('licencaPermiteVenda', True))

if __name__ == '__main__':
    unittest.main()

