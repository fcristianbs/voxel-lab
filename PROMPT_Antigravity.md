# Prompt para o Antigravity · Catálogo Voxel Lab

> **Como usar:** abra a pasta `07_Especificacao_Catalogo` como workspace no Antigravity (ou copie-a para dentro do projeto) e cole o prompt abaixo no agente. Ele foi escrito para ser executado em etapas: confira o resultado de cada fase antes de liberar a próxima.

---

```
Você é um desenvolvedor front-end sênior. Construa o catálogo online da VOXEL LAB, uma loja de impressão 3D com foco em peças de engenharia (suportes Starlink, adaptadores, reposições), além de casa, gadgets e action figures.

FONTES DE VERDADE (leia antes de começar):
1. CDU_Catalogo_Voxel_Lab.md: especificação completa (escopo, rotas, design system, modelo de dados, regras de negócio, mensagens de WhatsApp, casos de uso, requisitos e critérios de aceite). Siga esse documento à risca. Se algo não estiver nele, escolha a opção mais simples e anote no README.
2. referencias_visuais/*.png: as 8 telas de referência (1–4 celular, 5–8 desktop). Reproduza layout, hierarquia, textos e espaçamentos com fidelidade.
3. assets/design-tokens.json: cores, tipografia, espaçamento e raios. Converta em variáveis CSS com os mesmos nomes (--surface, --nozzle, --cad, etc.).
4. assets/logo/: use voxel-icone.svg no header e no favicon, e voxel-icone-mono-branco.svg como marca d'água nas fotos.

MODELO DE NEGÓCIO: é uma vitrine, sem carrinho e sem pagamento. Todo pedido sai por um link wa.me com mensagem pré-preenchida (modelos na seção 6 do CDU). O link do Mercado Livre é opcional por produto.

STACK:
- Astro (última versão estável) + TypeScript, com saída estática.
- Produtos em content collections (src/content/produtos/*.md) com schema Zod, conforme a seção 4 do CDU.
- CSS puro com variáveis + CSS Modules, ou Tailwind configurado SOMENTE com os tokens da marca. Nada de cores fora dos tokens.
- Interatividade com ilhas mínimas (JS puro ou Preact): filtros, seletor de variações, galeria e formulário sob medida.
- Fontes via Google Fonts: Unbounded (600, 700), IBM Plex Sans (400, 500, 600), IBM Plex Mono (500, 600), com display=swap e preconnect.
- Configuração central em src/site.config.ts (número do WhatsApp, links, mostrarPrecos), com placeholders marcados [DEFINIR].
- Deploy-ready para Vercel ou Netlify.

REGRAS VISUAIS INEGOCIÁVEIS:
- Tema escuro: fundo #0C1014, cartões #151B22, bordas de 1px #2A343F.
- Laranja #FF6B2C = produto, preço e CTA de compra. Ciano #33D1E0 = sob medida e projeto. Nunca misture os dois no mesmo botão.
- Cantos de 2px, sem sombras e sem gradientes. Malha de voxel (linhas de 1px #1C242D a cada 16px) só no hero, nas áreas de foto e nos cabeçalhos de seção.
- Títulos e preços em Unbounded. Rótulos, ficha técnica e metadados em IBM Plex Mono, em caixa-alta com letter-spacing .12em.
- Mobile-first. No celular, barra fixa "Pedir pelo WhatsApp" no rodapé, com safe-area.
- Sem emoji como ícone. Ícones de traço de 2px (Lucide, se precisar).

FASES (pare ao final de cada uma, mostre o resultado e espere minha confirmação):
Fase 1: Setup e design system. Projeto Astro, tokens em CSS, fontes, componentes base (Header, Footer, BotaoPrimario, BotaoSobMedida, SpecTag, Chip, CardProduto, LinhaProduto, FichaTecnica, SeletorOpcao, SeletorCor, CardNaoAchou, EtapasSobMedida, BarraWhatsAppFixa) e uma página /styleguide mostrando todos eles.
Fase 2: Dados. Schema Zod, src/data/categorias.json e os 12 produtos do seed (seção 4.3 do CDU) com preco: null e imagens placeholder (malha de voxel + contorno de cubo isométrico + rótulo "FOTO DA PEÇA").
Fase 3: Páginas. / (CDU01), /categoria/[slug] com filtros, ordenação, URL compartilhável e estado vazio (CDU02), /produto/[slug] com galeria, variações, ficha, instalação e relacionados (CDU03), e /busca e /404.
Fase 4: Pedidos. Geração das mensagens do WhatsApp (6.1, 6.2, 6.3) com encodeURIComponent e prévia ao vivo na página de produto (CDU04), botão do Mercado Livre (CDU06) e página /sob-medida com formulário validado, ?ref= e a seção de casos escondida quando estiver vazia (CDU05).
Fase 5: Qualidade. SEO (meta, Open Graph, schema.org Product, sitemap, robots), acessibilidade (foco visível ciano, labels, alvos de 44px), eventos de analytics (whatsapp_pedido, whatsapp_sob_medida, ml_click) com Plausible por padrão, Lighthouse no celular ≥ 90/95/95 e um README com "como adicionar um produto em 5 passos".

ENTREGA FINAL: repositório funcionando com `npm run dev` e `npm run build`, checklist da seção 9 do CDU preenchido no README e a lista de tudo que ficou como [DEFINIR].
```

---

## Prompts de apoio (use quando precisar)

**Para revisar a fidelidade visual:**
```
Compare a página atual com referencias_visuais/<arquivo>.png em 390px e 1440px. Liste as diferenças de layout, espaçamento, tipografia e cor, e corrija todas, sem alterar nada que já esteja igual.
```

**Para cadastrar um produto novo:**
```
Crie o produto "<nome>" na categoria <categoria>/<subcategoria>, material <material>, uso <interno|externo>, com as variações <lista> e a ficha técnica <lista>. Siga o schema da seção 4.1 do CDU e valide com a RN05.
```

**Para ativar a edição sem código (v1.1):**
```
Adicione o Decap CMS em /admin com Git Gateway (Netlify Identity) ou GitHub backend, configurado para a collection de produtos e de casos, com os mesmos campos e validações do schema Zod.
```
