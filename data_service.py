"""
Serviço de acesso e validação dos dados de catálogo da Voxel Lab.
Garante RN05 e RN09 do CDU.
"""

import json
import os
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

def load_json(filename: str):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def validar_produto(p: Dict[str, Any]):
    """Valida produto de acordo com regras de negócio, incluindo RN05."""
    assert p.get('slug'), "Produto sem slug"
    assert p.get('nome'), f"Produto {p.get('slug')} sem nome"
    assert p.get('categoria'), f"Produto {p.get('slug')} sem categoria"
    assert p.get('material'), f"Produto {p.get('slug')} sem material"

    # RN05: Peças com uso: externo só podem ter os materiais PETG-UV, PETG ou ASA
    if p.get('uso') == 'externo':
        mat = p.get('material', '').upper()
        materiais_permitidos = ['PETG-UV', 'PETG', 'ASA']
        if mat not in materiais_permitidos:
            raise ValueError(
                f"Violação RN05 no produto '{p.get('slug')}': "
                f"material '{mat}' não permitido para uso externo. Permitidos: {materiais_permitidos}"
            )

def get_produtos() -> List[Dict[str, Any]]:
    produtos = load_json('produtos.json')
    for p in produtos:
        validar_produto(p)
    return produtos

def get_mais_pedidos(limite: int = 4) -> List[Dict[str, Any]]:
    """RN09: 'Mais pedidos' lista produtos com destaque: true em ordem crescente de ordem até 4 itens."""
    prods = [p for p in get_produtos() if p.get('destaque') is True]
    prods.sort(key=lambda x: x.get('ordem', 999))
    return prods[:limite]

def get_produto_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    for p in get_produtos():
        if p.get('slug') == slug:
            return p
    return None

def get_categorias() -> List[Dict[str, Any]]:
    return load_json('categorias.json')

def get_categoria_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    for c in get_categorias():
        if c.get('slug') == slug:
            return c
    return None

import unicodedata

def normalizar_texto(texto: str) -> str:
    """Remove acentos e converte para minúsculas para busca insensível."""
    if not texto:
        return ''
    return ''.join(
        c for c in unicodedata.normalize('NFD', texto.lower())
        if unicodedata.category(c) != 'Mn'
    )

def filtrar_produtos(
    categoria: Optional[str] = None,
    subcategorias: Optional[List[str]] = None,
    materiais: Optional[List[str]] = None,
    uso: Optional[str] = None,
    busca: Optional[str] = None,
    ordenacao: str = 'mais_pedidos'
) -> List[Dict[str, Any]]:
    """Filtra e ordena produtos de acordo com os critérios fornecidos."""
    prods = get_produtos()

    # Filtro por Categoria (slug)
    if categoria and categoria != 'todas':
        prods = [p for p in prods if p.get('categoria') == categoria]

    # Filtro por Subcategoria (múltipla)
    if subcategorias:
        subs_norm = [s.lower() for s in subcategorias]
        prods = [p for p in prods if p.get('subcategoria', '').lower() in subs_norm]

    # Filtro por Material
    if materiais:
        mats_norm = [m.lower() for m in materiais]
        def match_mat(p_mat: str) -> bool:
            p_m = p_mat.lower()
            return any(m in p_m for m in mats_norm)
        prods = [p for p in prods if match_mat(p.get('material', ''))]

    # Filtro por Uso (interno ou externo)
    if uso and uso != 'todos':
        prods = [p for p in prods if p.get('uso') == uso or p.get('uso') == 'ambos']

    # Filtro por Busca textual
    if busca:
        q_norm = normalizar_texto(busca)
        def match_busca(p: Dict[str, Any]) -> bool:
            campos = [
                p.get('nome', ''),
                p.get('resumo', ''),
                p.get('descricao', ''),
                p.get('categoria', ''),
                p.get('subcategoria', ''),
                p.get('material', '')
            ]
            return any(q_norm in normalizar_texto(c) for c in campos)
        prods = [p for p in prods if match_busca(p)]

    # Ordenação
    if ordenacao == 'nome':
        prods.sort(key=lambda x: normalizar_texto(x.get('nome', '')))
    elif ordenacao == 'menor_preco':
        # Produtos com preço null vão para o final
        prods.sort(key=lambda x: (x.get('preco') is None, x.get('preco') or 0))
    else:  # mais_pedidos (default)
        prods.sort(key=lambda x: (not x.get('destaque', False), x.get('ordem', 999)))

    return prods


