import os
import sys

# Adiciona o diretório raiz ao sys.path para importação de módulos e dados
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app import app

# Ponto de entrada WSGI para o Vercel Python Runtime
app = app
