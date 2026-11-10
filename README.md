# VOXEL LAB · Catálogo Online

Catálogo online da **VOXEL LAB**, loja de impressão 3D com foco em peças de engenharia (suportes Starlink, adaptadores, reposições), utilidades para casa, gadgets e action figures.

O catálogo opera como uma **vitrine de alta conversão sem carrinho**, onde os pedidos e orçamentos são direcionados diretamente para o **WhatsApp** com mensagens estruturadas e codificadas automaticamente (`wa.me`), além de direcionamento opcional para o **Mercado Livre**.

---

## 🛠️ Stack Tecnológica

* **Backend / Servidor:** Python 3.12 + [Flask](https://flask.palletsprojects.com/) + Jinja2
* **Frontend:** Vanilla JavaScript (zero frameworks pesados, desempenho nativo)
* **Design System & Estilos:** CSS puro com variáveis mapeadas 1:1 do `design-tokens.json`
* **Tipografia:** Google Fonts com `preconnect` e `display=swap`:
  * **Unbounded** (600, 700) para títulos, preços e números
  * **IBM Plex Sans** (400, 500, 600) para corpo e botões
  * **IBM Plex Mono** (500, 600) para rótulos técnicos em caixa-alta (`letter-spacing: .12em`), cotas e especificações
* **Dados:** Arquivos JSON estruturados em `data/` com validação de regras de negócio (RN05 e RN09).

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Python 3.10 ou superior instalado.

### 2. Instalação das Dependências
```powershell
pip install -r requirements.txt
```

### 3. Iniciar o Servidor
```powershell
py app.py
```
Acesse no seu navegador: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🧭 Rotas Principais

| Rota | Descrição | Referência Visual |
|---|---|---|
| `/` | Página Inicial oficial (Hero, Categorias, Mais Pedidos, Sob Medida) | `1_Inicio_celular.png` / `5_Inicio_desktop.png` |
| `/catalogo` | Catálogo Completo com todas as peças e filtros | CDU02 |
| `/categoria/[slug]` | Listagem filtrada por categoria (`engenharia`, `casa`, `gadgets`, `figures`) | `2_Categoria_celular.png` / `6_Categoria_desktop.png` |
| `/produto/[slug]` | Detalhe do produto, galeria, seletores reativos e prévia de mensagem | `3_Produto_celular.png` / `7_Produto_desktop.png` |
| `/sob-medida` | Formulário de modelagem sob demanda com diagrama de cotas | `4_Sob_medida_celular.png` / `8_Sob_medida_desktop.png` |
| `/busca?q=` | Busca textual instantânea de peças | CDU02 |
| `/makerworld` | Catálogo Expandido · Modelos do MakerWorld impressos pela Voxel Lab | PROMPT_MakerWorld |
| `/styleguide` | Documentação viva de todos os tokens e 14 componentes base | Fase 1 |

---

## 🌐 6.4 Mensagens do WhatsApp · MakerWorld

### 6.4a Link colado pelo cliente
```text
Olá, Voxel Lab! Quero orçar a impressão deste modelo do MakerWorld:
{link normalizado}
Vim pela busca: "{termo}"            ← só quando existir termoBusca
Página: {url da página de origem}
```

### 6.4b Modelo da vitrine "Já impressos pela Voxel Lab"
```text
Olá, Voxel Lab! Quero este modelo do MakerWorld impresso por vocês:
• {nome} (por {autor})
• Material: {material}
• Cor: {cor, se escolhida}
{modeloUrl}
{url da página do item no site}
```

---

## ⚙️ Configuração do MakerWorld (`site_config.py`)

```python
'makerworld': {
    'ativo': True,  # Se False, oculta todas as entradas e retorna 404 em /makerworld
    'buscaUrl': 'https://makerworld.com/en/search/models?keyword=',
    'hostsAceitos': ['makerworld.com', 'www.makerworld.com'],
    'prazoDias': '3 a 5'
}
```

---

## 📝 Como Adicionar um Produto em 5 Passos

Para cadastrar uma nova peça no catálogo sem precisar alterar o código da aplicação:

1. **Abra o arquivo de dados:**
   Abra o arquivo [`data/produtos.json`](file:///c:/git/VOXEL%20LAB/data/produtos.json).
2. **Defina o identificador (`slug`) e dados básicos:**
   Insira um novo objeto com `slug` (único, em minúsculas e hífens), `nome`, `categoria` (`engenharia`, `casa`, `gadgets` ou `figures`) e `subcategoria`.
3. **Defina material e uso (Atenção à RN05):**
   * Se `uso` for `"externo"`, o material **obrigatoriamente** deve ser `"PETG-UV"`, `"PETG"` ou `"ASA"`. Peças de `"PLA"` só são permitidas para uso `"interno"`.
4. **Cadastre variações e especificações técnicas:**
   Configure a lista de `specs` (`MATERIAL`, `CAMADA`, `USO`, etc.) e as `variacoes` com suas opções padrão. Se a peça permitir medidas customizadas, adicione `"permiteOutraMedida": true`.
5. **Salve e valide:**
   Salve o arquivo. A validação em `data_service.py` garante que a peça será carregada automaticamente no catálogo e nas listagens.

---

## ✅ Checklist de Critérios de Aceite (Seção 9 do CDU e MakerWorld)

- [x] As 4 páginas principais seguem as referências visuais em celular (390px) e desktop (1440px).
- [x] Cores, fontes, cantos de 2px e malha de voxel seguem rigorosamente a seção 3 do CDU.
- [x] Os filtros funcionam dinamicamente sem reload, atualizam a URL e o estado vazio aparece quando não há resultado.
- [x] Trocar variações e cores atualiza a prévia da mensagem e o link do WhatsApp abre com o texto correto (acentos inclusos via `encodeURIComponent`).
- [x] Opção "Outra medida" leva ao formulário sob medida com a referência do produto preenchida (`?ref=slug`).
- [x] O formulário sob medida valida os campos obrigatórios e gera a mensagem oficial 6.2.
- [x] Um produto com preço nulo mostra `"R$ [preço]"` ou `"Sob consulta"`.
- [x] A barra fixa do WhatsApp no celular não cobre conteúdo (rodapé possui safe-area padding).
- [x] SEO estruturado: meta tags Open Graph, `robots.txt`, `sitemap.xml` e `schema.org/Product` em JSON-LD.
- [x] Os 12 produtos do seed e as 4 categorias oficiais estão cadastrados e validados.
- [x] Guia "como adicionar um produto em 5 passos" documentado neste README.
- [x] Clicar em "Orçar impressão" com um link válido do MakerWorld abre o WhatsApp direto com o link normalizado e sem parâmetros de rastreamento.
- [x] Link vazio ou inválido não abre nada, mostra erro acessível com `role="alert"` e devolve o foco ao campo.
- [x] Pressionar Enter dentro do campo submete o formulário com o mesmo comportamento do botão.
- [x] "Buscar no MakerWorld" abre em nova aba com o termo buscado.
- [x] A aba MakerWorld aparece no header desktop (`+ MODELOS`) e como primeiro chip no mobile, com `aria-current="page"` em `/makerworld`.
- [x] `/busca` sem resultado mostra as duas opções (Caminho 1 MakerWorld e Caminho 2 Sob Medida) e a seção "Talvez sirva".
- [x] Com `makerworld.ativo = false`, todas as entradas do MakerWorld somem do site e `/makerworld` retorna 404.
- [x] Modelos sem licença de venda permitida (`licencaPermiteVenda = false`) ou inativos não aparecem na vitrine.
- [x] Logos vêm centralizados de `static/img/makerworld/` e são referenciados via macro Jinja2 `logo_makerworld`.

---

## 📌 Lista de Itens Pendentes Marcados como `[DEFINIR]` e `[CONFERIR]`

Os seguintes dados estão centralizados em [`site_config.py`](file:///c:/git/VOXEL%20LAB/site_config.py), `data/produtos.json` e `data/makerworld.json` prontos para receber os valores de produção assim que aprovados:

1. `whatsapp`: Número oficial da Voxel Lab com DDI + DDD (`'5588921864755'`).
2. `whatsapp_formatado`: Formatação visual para texto (`'(88) 92186-4755'`).
3. `mercadoLivreLoja`: URL da página de vendedor oficial no Mercado Livre.
4. `dominio`: Domínio de produção final (atualmente configurado como `'https://voxellab.com.br'`).
5. `prazoRespostaHoras`: Tempo padrão de resposta estimado (atualmente `24` horas úteis).
6. `fotos reais`: De início, o sistema gera os placeholders com a malha de voxel, contorno isométrico e marca d'água oficial; serão substituídos pelas fotos reais em `.webp`.
7. `makerworld.buscaUrl`: `[CONFERIR]` Formato atual da URL de busca do MakerWorld (`https://makerworld.com/en/search/models?keyword=`).
8. `makerworld.prazoDias`: `[DEFINIR]` Prazo médio de impressão informado na linha técnica (atualmente `'3 a 5'` dias úteis).
9. `makerworld.json`: `[DEFINIR]` Fotos reais impressas pela Voxel Lab e preços finais para os 4 itens de exemplo da vitrine.

