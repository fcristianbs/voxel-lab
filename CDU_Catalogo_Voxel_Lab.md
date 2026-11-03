# Voxel Lab · Catálogo online
## Documento de especificação e casos de uso (CDU)
*Versão 1.0, 03/11/2026. Responsável: Roberto Gomes.*

---

## 1. Visão geral

### 1.1 Objetivo
O catálogo online da Voxel Lab é uma loja de impressão 3D focada em peças de engenharia (suportes, adaptadores, reposições), com linhas complementares de casa, gadgets e action figures. Ele funciona como **vitrine**: o cliente navega, escolhe o produto e a variação e **fecha o pedido pelo WhatsApp**, com uma mensagem já preenchida. O diferencial da marca, a **modelagem sob demanda**, tem uma página e um fluxo próprios de orçamento.

### 1.2 Público e contexto de uso
- **Origem do tráfego:** principalmente o link da bio do Instagram (@voxellab.3d), por isso o projeto é **mobile-first**.
- **Perfis de cliente:** donos de antena Starlink (rural, agro, náutico, motorhome), pessoas que precisam de uma peça de reposição que não acham para comprar, entusiastas de setup e gadgets, colecionadores e clientes B2B (instaladores).

### 1.3 Escopo
**Dentro do escopo (v1):**
- Página inicial, listagem por categoria, página de produto, página sob medida, busca, página 404.
- Filtros (subcategoria, material, uso) e ordenação.
- Seleção de variações com a mensagem do WhatsApp gerada automaticamente.
- Link opcional para o anúncio do mesmo produto no Mercado Livre.
- Formulário sob medida que monta uma mensagem estruturada para o WhatsApp.
- Catálogo mantido em arquivos de dados (JSON ou Markdown), sem banco de dados.
- SEO básico, Open Graph e eventos de analytics.

**Fora do escopo (v1):** carrinho, checkout, pagamento online, cálculo de frete, login de cliente, painel administrativo com autenticação e upload de arquivos para servidor próprio.

### 1.4 Premissas
- O número de WhatsApp, o domínio, os preços, os prazos e as fotos reais serão definidos depois. No código, devem ficar como **configuração centralizada** (`site.config`) e como campos no arquivo de produtos.
- Fotos de produto: entram de início como placeholders com a malha de voxel. Depois são substituídas pelas fotos reais, em `.webp`.

---

## 2. Arquitetura recomendada

| Item | Recomendação | Motivo |
|---|---|---|
| Framework | **Astro 4+** com TypeScript (alternativa: Next.js 14 com `output: 'export'`) | Site estático, rápido e com bom SEO; o catálogo cabe em content collections |
| Estilo | CSS com variáveis (design tokens) + CSS Modules ou Tailwind configurado com os tokens | Mantém a identidade exata da marca |
| Dados | `src/content/produtos/*.md` (frontmatter) ou `src/data/produtos.json`, validados com Zod | O Roberto edita os produtos sem mexer em código |
| Interatividade | Ilhas pequenas em JS puro ou Preact: filtros, variações, formulário | Mantém o site leve |
| Imagens | `astro:assets` / `<Image>` gerando `.webp` responsivo, com lazy load | Desempenho em celular |
| Hospedagem | Vercel, Netlify ou Cloudflare Pages (plano gratuito) | Deploy automático pelo Git |
| Analytics | Plausible, Umami ou GA4 | Eventos de clique no WhatsApp |
| Edição sem código (opcional, v1.1) | Decap CMS em `/admin` sobre o repositório Git | Permite cadastrar produtos pelo navegador |

### 2.1 Rotas
| Rota | Página | Referência visual |
|---|---|---|
| `/` | Início | `1_Inicio_celular.png`, `5_Inicio_desktop.png` |
| `/categoria/[slug]` | Listagem por categoria (engenharia, casa, gadgets, figures) | `2_Categoria_celular.png`, `6_Categoria_desktop.png` |
| `/produto/[slug]` | Página de produto | `3_Produto_celular.png`, `7_Produto_desktop.png` |
| `/sob-medida` | Orçamento sob medida | `4_Sob_medida_celular.png`, `8_Sob_medida_desktop.png` |
| `/busca?q=` | Resultado de busca (mesmo layout da categoria) | Derivada da categoria |
| `/404` | Página não encontrada, com links para o catálogo e o sob medida | Derivada da identidade |

### 2.2 Configuração central (`src/site.config.ts`)
```ts
export const site = {
  nome: 'Voxel Lab',
  slogan: 'A peça que não existe na loja.',
  whatsapp: '55XXXXXXXXXXX',        // [DEFINIR] DDI + DDD + número, só dígitos
  instagram: 'https://instagram.com/voxellab.3d',
  mercadoLivreLoja: '',              // [DEFINIR] URL da loja no ML
  dominio: 'https://voxellab.com.br',// [DEFINIR]
  prazoRespostaHoras: 24,            // [DEFINIR]
  mostrarPrecos: true,               // se false, exibe "Sob consulta"
};
```

---

## 3. Identidade visual (design system)

Os valores oficiais estão em `assets/design-tokens.json`. Use-os como variáveis CSS com os mesmos nomes.

### 3.1 Cores (tema escuro, padrão do site)
| Token | Hex | Uso |
|---|---|---|
| `--surface` | `#0C1014` | Fundo da página |
| `--surface-raised` | `#151B22` | Cartões, painéis, área de foto |
| `--grid` | `#1C242D` | Malha de voxel do fundo (linhas de 1px a cada 16px) |
| `--line` | `#2A343F` | Bordas e divisórias de 1px |
| `--ink` | `#E8EDF2` | Texto principal |
| `--ink-muted` | `#8C99A6` | Texto secundário e dados técnicos |
| `--nozzle` | `#FF6B2C` | Laranja Bico Quente: CTA principal, preço, destaque de produto |
| `--nozzle-soft` | `#3A1A0B` | Fundo de selos laranja ("MAIS VENDIDO", filtro ativo) |
| `--on-nozzle` | `#0C1014` | Texto sobre laranja |
| `--cad` | `#33D1E0` | Ciano CAD: tudo que é sob medida ou projeto |
| `--cad-soft` | `#0B2D33` | Fundo de blocos sob medida |
| `--on-cad` | `#0C1014` | Texto sobre ciano |

**Regra de cor:** laranja indica produto pronto e compra. Ciano indica projeto e sob medida. As duas cores nunca competem no mesmo botão.

### 3.2 Tipografia (Google Fonts)
| Papel | Fonte | Uso |
|---|---|---|
| Display | **Unbounded** 600/700, `letter-spacing: -0.02em` | Títulos, preços, numeração de etapas (01, 02…) |
| Texto | **IBM Plex Sans** 400/500/600 | Corpo, botões, nomes de produto |
| Técnico | **IBM Plex Mono** 500/600 | Rótulos em caixa-alta (`letter-spacing: .12em`, 11px), ficha técnica, breadcrumbs, metadados |

Escala no celular: H1 34px, H2 24px, nome de produto 14–15px, corpo 15–16px, rótulo 11px. No desktop: H1 56px, H2 30px.

### 3.3 Forma e espaçamento
- Grid de 8px. Margem lateral de 20px no celular e 32px no desktop. Container de no máximo 1280px.
- **Cantos vivos:** `border-radius: 2px` em botões, cartões e campos. Círculo só em amostras de cor.
- Sem sombras e sem gradientes. A profundidade vem de borda + `surface-raised`.
- Fundo com malha de voxel (classe `.grid-bg`) só em hero, área de foto e cabeçalhos de seção.

### 3.4 Componentes
| Componente | Especificação |
|---|---|
| `Header` | Celular: 64px, com logo (ícone 28px + "VOXEL LAB", "LAB" em laranja), busca e menu. Desktop: 72px, com navegação de categorias, campo de busca e botão "WhatsApp" laranja. O item ativo fica em laranja e "Sob medida" sempre em ciano |
| `BotaoPrimario` | 48–54px de altura, fundo `--nozzle`, texto `--on-nozzle` 600 |
| `BotaoSobMedida` | Fundo `--cad` (ou contorno `--cad`), texto `--on-cad` |
| `BarraWhatsAppFixa` | Só no celular: fixa no rodapé, 52px, "Pedir pelo WhatsApp", respeitando `env(safe-area-inset-bottom)` |
| `CardProduto` | Foto 1:1 (ou 4:3) com malha, selo opcional, nome, linha técnica em mono (material · uso), preço em Unbounded laranja e botão "Pedir" contornado |
| `LinhaProduto` | Variação em lista para celular: miniatura de 104px + texto |
| `SpecTag` | Pares chave/valor em mono, separados por linhas de 1px (ex.: `MAT PETG-UV │ CAMADA 0,20 mm`) |
| `FichaTecnica` | Tabela de 2 colunas em mono, com borda `--line` e fundo `--surface-raised` |
| `SeletorOpcao` | Botões de 44px. Selecionado: borda e texto `--nozzle` com fundo `--nozzle-soft`. A opção "Outra medida" é tracejada em ciano e leva a `/sob-medida?ref=slug` |
| `SeletorCor` | Círculos de 36px; o selecionado ganha anel laranja |
| `Chip` / `FiltroAtivo` | 36–40px de altura; filtro ativo com fundo `--nozzle-soft` e um "×" para remover |
| `CardNaoAchou` | Bloco `--cad-soft` com borda ciano: "Não achou a peça? Mande a medida que a gente modela." |
| `EtapasSobMedida` | Etapas 01–04 com barra superior de 3px, as três primeiras em ciano e a última em laranja |
| `Footer` | @, "Enviamos para todo o Brasil" e links (Mercado Livre, Instagram, WhatsApp) |

### 3.5 Ícones
- Ícones em traço de 2px, desenhados no estilo da marca, com um detalhe preenchido em laranja ou ciano (veja as capas de destaque do Instagram).
- Se precisar de uma biblioteca, use **Lucide** com `stroke-width: 2`.
- Nunca use emoji como ícone.

### 3.6 Logo
- Arquivos em `assets/logo/`:
  - `voxel-icone.svg`: para fundo escuro, é o principal.
  - `voxel-icone-fundo-claro.svg`: para fundo claro.
  - `voxel-icone-mono-branco.svg`: marca d'água em fotos, com 60% de opacidade.
- Favicon: gerar a partir de `voxel-icone.svg`.
- Imagem Open Graph padrão: `og-avatar-1080.png`.

---

## 4. Modelo de dados

### 4.1 Produto (`src/content/produtos/<slug>.md`, frontmatter)
```yaml
slug: suporte-starlink-mini-tubo-1
nome: 'Suporte Starlink Mini · Tubo 1"'
categoria: engenharia            # engenharia | casa | gadgets | figures
subcategoria: starlink           # livre, usada nos filtros
resumo: Prende a antena Mini em tubo ou mastro de 1".
descricao: >
  Feito em PETG com proteção UV, para ficar no sol e na chuva sem deformar.
preco: null                      # número em reais; null = "Sob consulta"
precoParcelado: null             # texto opcional, ex.: "ou 3x no Mercado Livre"
material: PETG-UV                # PLA | PETG | PETG-UV | ASA | TPU
uso: externo                     # interno | externo | ambos
destaque: true                   # aparece em "Mais pedidos"
selo: MAIS VENDIDO               # opcional: MAIS VENDIDO | NOVO | null
ordem: 1
specs:
  - { chave: MATERIAL, valor: PETG-UV }
  - { chave: CAMADA, valor: '0,20 mm' }
  - { chave: PREENCHIMENTO, valor: '40% gyroid' }
  - { chave: USO, valor: Externo }
  - { chave: ACOMPANHA, valor: '[DEFINIR]' }
  - { chave: PRAZO, valor: '[DEFINIR] dias úteis' }
variacoes:
  - nome: Antena
    opcoes: [Mini, Standard, Gen 3]
    padrao: Mini
  - nome: Diâmetro do tubo
    opcoes: ['3/4"', '1"', '1 1/4"']
    padrao: '1"'
    permiteOutraMedida: true     # mostra a opção "Outra medida" → sob medida
cores:
  - { nome: Preto fosco, hex: '#111111', padrao: true }
  - { nome: Cinza, hex: '#6B7280' }
  - { nome: Branco, hex: '#E8EDF2' }
imagens:                          # ordem: instalada, isolada, escala, CAD
  - { src: ./img/starlink-mini-instalada.webp, alt: Suporte instalado em tubo com a antena Mini, tipo: instalada }
instalacao:
  - Encaixe as duas metades do suporte no tubo.
  - Aperte os parafusos até o suporte não girar.
  - Encaixe a antena e ajuste o ângulo pelo app.
mercadoLivreUrl: null
relacionados: [passa-cabo-parede, suporte-roteador-mini]
```
Valide com Zod. Se o build encontrar um produto sem `slug`, `nome`, `categoria` ou `material`, ele deve falhar.

### 4.2 Categoria (`src/data/categorias.json`)
```json
[
  {"slug":"engenharia","nome":"Engenharia","descricao":"Suportes, adaptadores e reposições feitos para uso real, dentro e fora de casa.","icone":"engrenagem","subcategorias":["starlink","suportes","adaptadores","reposicao"]},
  {"slug":"casa","nome":"Casa","descricao":"Organizadores e utilidades para o dia a dia.","icone":"casa","subcategorias":[]},
  {"slug":"gadgets","nome":"Gadgets","descricao":"Suportes de mesa, setup e acessórios tech.","icone":"monitor","subcategorias":[]},
  {"slug":"figures","nome":"Figures","descricao":"Action figures e colecionáveis sob encomenda.","icone":"figure","subcategorias":[]}
]
```

### 4.3 Produtos iniciais (seed)
Cadastre estes produtos com `preco: null` e imagens placeholder:

| slug | Nome | Categoria / Sub | Material | Uso | Destaque |
|---|---|---|---|---|---|
| suporte-starlink-mini-tubo-1 | Suporte Starlink Mini · Tubo 1" | engenharia / starlink | PETG-UV | externo | sim (MAIS VENDIDO) |
| suporte-starlink-standard-parede | Suporte Starlink Standard · Parede | engenharia / starlink | PETG-UV | externo | sim |
| suporte-starlink-gen3-mastro | Suporte Starlink Gen 3 · Mastro | engenharia / starlink | PETG-UV | externo | não |
| suporte-roteador-mini | Suporte do roteador Mini · Parede | engenharia / suportes | PETG | interno | não |
| passa-cabo-parede | Passa-cabo de parede · Externo | engenharia / suportes | PETG-UV | externo | não |
| abracadeira-mastro-par | Abraçadeira de mastro · Par | engenharia / suportes | PETG-UV | externo | não |
| adaptador-mangueira-3-4-1-2 | Adaptador de mangueira 3/4" → 1/2" | engenharia / adaptadores | PETG | externo | não |
| presilha-persiana-4 | Presilha de reposição · Persiana (4 un.) | engenharia / reposicao | PETG | interno | não |
| pe-nivelador-movel | Pé nivelador · Móvel | casa | TPU | interno | não |
| organizador-cabos-kit6 | Organizador de cabos · Kit 6 | casa | TPU | interno | sim |
| suporte-headset-mesa | Suporte de headset · Mesa | gadgets | PLA | interno | sim |
| figure-sob-encomenda | Action figure sob encomenda | figures | PLA | interno | não |

---

## 5. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Todo pedido é concluído fora do site, pelo WhatsApp (`https://wa.me/<numero>?text=<mensagem codificada>`) ou pelo Mercado Livre, quando existir `mercadoLivreUrl`. |
| RN02 | Se `preco` for `null` ou `site.mostrarPrecos` for `false`, o preço aparece como **"Sob consulta"**, e o botão continua sendo "Pedir pelo WhatsApp". |
| RN03 | A mensagem do WhatsApp sempre traz o nome do produto, as variações escolhidas, a cor e o link da página do produto (modelo em 6.1). |
| RN04 | A opção "Outra medida" de uma variação leva a `/sob-medida?ref=<slug>`, e o formulário abre já com a referência preenchida. |
| RN05 | Peças com `uso: externo` mostram o selo técnico "UV" ou "Externo" e só podem ter os materiais PETG-UV, PETG ou ASA. Um PLA com uso externo é bloqueado na validação de dados. |
| RN06 | O site não guarda dados pessoais. O formulário sob medida só monta a mensagem e abre o WhatsApp, sem enviar nada a um servidor (LGPD). |
| RN07 | Fotos não são enviadas pelo link do WhatsApp. Depois de abrir a conversa, o site orienta o cliente a anexar as fotos no próprio WhatsApp. |
| RN08 | O preço do sob medida é sempre apresentado em duas partes: projeto em CAD + impressão por peça. |
| RN09 | "Mais pedidos" na página inicial lista os produtos com `destaque: true`, em ordem crescente de `ordem`, até 4 itens. |

---

## 6. Mensagens do WhatsApp

### 6.1 Pedido de produto
```
Olá, Voxel Lab! Quero este produto:
• {nome}
• {variação 1}: {opção}
• {variação 2}: {opção}
• Cor: {cor}
{url do produto}
```

### 6.2 Orçamento sob medida
```
Olá, Voxel Lab! Quero um orçamento sob medida.
• Tipo de peça: {tipo}
• O que preciso: {descrição}
• Medidas (mm): A {a} · B {b} · C {c}
• Uso: {interno|externo}
• Quantidade: {qtd}
• Nome: {nome}
{Referência: {url do produto}, se veio de um produto}
Vou enviar as fotos na sequência.
```

### 6.3 Contato geral (botão do cabeçalho ou barra fixa fora da página de produto)
```
Olá, Voxel Lab! Vim pelo site e quero tirar uma dúvida.
```
Codifique com `encodeURIComponent`. Em computador, `wa.me` abre o WhatsApp Web, o que é aceitável.

---

## 7. Casos de uso

### Atores
- **Cliente (visitante):** navega e faz pedidos pelo WhatsApp.
- **Administrador (Roberto):** mantém produtos, preços e fotos nos arquivos de dados.
- **WhatsApp e Mercado Livre:** sistemas externos.

---

### CDU01 · Navegar pelo catálogo
**Ator:** Cliente. **Pré-condição:** nenhuma.
**Fluxo principal:**
1. O cliente acessa `/`.
2. O sistema exibe o hero (rótulo "Impressão 3D · Engenharia sob medida", H1 "A peça que **não existe** na loja.", subtítulo, botões "Ver catálogo" e "Orçar sob medida" e a faixa técnica PETG · ASA · TPU │ Envio Brasil │ Orçamento 24h).
3. O sistema exibe as 4 categorias como cartões com ícone.
4. O sistema exibe "Mais pedidos" (RN09).
5. O sistema exibe o bloco Sob medida em 3 passos e o guia de materiais (PLA, PETG, TPU).
6. O cliente toca uma categoria e o sistema abre `/categoria/[slug]`.

**Fluxos alternativos:**
- 6a. O cliente toca "Orçar sob medida" e segue para o CDU05.
- 6b. O cliente toca um produto e segue para o CDU03.

**Pós-condição:** o cliente está em uma listagem ou em um produto.

---

### CDU02 · Filtrar, ordenar e buscar produtos
**Ator:** Cliente. **Pré-condição:** o cliente está em `/categoria/[slug]` ou `/busca`.
**Fluxo principal:**
1. O sistema exibe o cabeçalho da categoria (rótulo, H1, descrição) com a malha de fundo.
2. O sistema exibe os chips de subcategoria ("Todos" selecionado) e a ordenação ("Mais pedidos", "Nome", "Menor preço").
3. O cliente seleciona uma subcategoria ou um material ou uso. No desktop isso fica na lateral, com checkboxes.
4. O sistema filtra no cliente, sem recarregar a página, e mostra os filtros ativos como chips removíveis.
5. O sistema atualiza a URL (`?sub=starlink&material=petg`) para que o link possa ser compartilhado.
6. No meio da lista, depois do 3º item, o sistema mostra o `CardNaoAchou`.

**Fluxos alternativos:**
- 3a. **Busca:** o cliente digita no campo de busca e o sistema procura em nome, subcategoria, material e tags, sem diferenciar acentos nem maiúsculas.
- 4a. **Nenhum resultado:** o sistema mostra "Nenhuma peça com esses filtros. Limpe os filtros ou peça sob medida.", com os botões "Limpar filtros" e "Orçar sob medida".

**Pós-condição:** a lista reflete os filtros escolhidos.

---

### CDU03 · Ver produto e escolher variação
**Ator:** Cliente. **Pré-condição:** o produto existe.
**Fluxo principal:**
1. O sistema exibe o breadcrumb (Início / Categoria / Subcategoria).
2. O sistema exibe a galeria (até 4 imagens: instalada, isolada, escala, CAD), com contador "1/4", selo e marca d'água. No celular a galeria é deslizável; no desktop tem miniaturas na vertical.
3. O sistema exibe o nome (H1), o resumo, o preço (RN02) e o parcelamento opcional.
4. O sistema exibe as variações já com os valores padrão selecionados e o seletor de cor.
5. O cliente altera as opções, e o sistema atualiza o estado e o texto de prévia da mensagem do WhatsApp.
6. O sistema exibe a ficha técnica, o passo a passo de instalação, o bloco "Seu tubo tem outra medida? A gente adapta." e "Combina com" (relacionados).

**Fluxos alternativos:**
- 5a. O cliente escolhe "Outra medida" e o sistema o leva ao CDU05 (RN04).
- 1a. **Slug inexistente:** o sistema mostra a página 404.

**Pós-condição:** as variações estão escolhidas e o cliente segue para o CDU04 ou o CDU06.

---

### CDU04 · Pedir produto pelo WhatsApp
**Ator:** Cliente. **Pré-condição:** o cliente está em um produto.
**Fluxo principal:**
1. O cliente toca "Pedir pelo WhatsApp": na barra fixa no celular, no bloco de compra no desktop.
2. O sistema monta a mensagem 6.1 com as escolhas atuais.
3. O sistema registra o evento `whatsapp_pedido` com `{slug, variacoes, cor}`.
4. O sistema abre `wa.me` em uma nova aba ou no app.

**Pós-condição:** a conversa do WhatsApp está aberta com a mensagem preenchida.

---

### CDU05 · Solicitar orçamento sob medida
**Ator:** Cliente. **Pré-condição:** nenhuma (pode vir com `?ref=slug`).
**Fluxo principal:**
1. O sistema exibe o hero ("Seu desenho. Nosso **CAD**. Sua **peça**.", com CAD em ciano e peça em laranja), as etapas 01–04 e o bloco "Como funciona o preço" (RN08).
2. O sistema exibe o formulário:

| Campo | Tipo | Obrigatório |
|---|---|---|
| Tipo de peça | chips de seleção única: Reposição, Suporte, Adaptador, Figure, Outro | sim |
| Conte o que precisa | textarea, até 500 caracteres | sim |
| Medidas A, B e C (mm) | número com decimal por vírgula ou ponto, com desenho de cotas ao lado | A e B recomendados |
| Fotos | só uma instrução: "Você envia as fotos no WhatsApp depois" (RN07) | não |
| Uso | Interno ou Externo | sim |
| Quantidade | número ≥ 1 | sim, padrão 1 |
| Seu nome | texto | sim |

3. O cliente preenche e toca "Enviar pelo WhatsApp".
4. O sistema valida o formulário e mostra os erros abaixo de cada campo.
5. O sistema monta a mensagem 6.2, registra o evento `whatsapp_sob_medida` e abre `wa.me`.

**Fluxos alternativos:**
- 1a. **Com `?ref=`:** o sistema mostra "Referência: {nome do produto}" e inclui o link do produto na mensagem.
- 4a. **Dados inválidos:** o sistema não abre o WhatsApp e leva o foco ao primeiro erro.

**Seção extra:** "Feitos sob medida", com cartões de casos (CAD à esquerda e peça à direita, tipo, título e resumo), alimentados por `src/content/casos/*.md`. A seção fica escondida enquanto não houver casos cadastrados.

**Pós-condição:** a conversa do WhatsApp está aberta com o briefing estruturado.

---

### CDU06 · Comprar pelo Mercado Livre
**Ator:** Cliente. **Pré-condição:** o produto tem `mercadoLivreUrl`.
**Fluxo:** o cliente toca "Comprar no Mercado Livre", o sistema registra `ml_click` e abre o link em nova aba. Se o produto não tiver o link, o botão não aparece.

---

### CDU07 · Manter catálogo (administração)
**Ator:** Administrador.
**Fluxo principal:**
1. O administrador cria ou edita um arquivo em `src/content/produtos/`, ou usa o Decap CMS em `/admin` (v1.1).
2. Ele adiciona as fotos em `.jpg` ou `.png` na pasta do produto; o build converte para `.webp`.
3. O commit dispara o deploy automático.
4. O build valida os dados (seção 4.1 e RN05) e falha com uma mensagem clara se algo estiver errado.

**Pós-condição:** o produto está publicado.

---

## 8. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | **Mobile-first**: layout pensado primeiro para 360–430px, com breakpoints em 768px e 1024px. |
| RNF02 | **Desempenho:** Lighthouse ≥ 90 em Performance no celular e LCP < 2,5 s em 4G. JS total por página abaixo de 50 KB. |
| RNF03 | **Acessibilidade:** WCAG 2.1 AA, com contraste já validado nos tokens, alvos de toque ≥ 44px, foco visível (anel ciano de 2px), `alt` em todas as imagens, formulário com `<label>` e navegação completa por teclado. |
| RNF04 | **SEO:** `title` e `description` por página, Open Graph com a foto do produto, `schema.org/Product` (preço apenas quando houver), `sitemap.xml`, `robots.txt` e URLs amigáveis em português. |
| RNF05 | **Idioma:** pt-BR, com preços em `R$ 0,00` via `Intl.NumberFormat('pt-BR')`. |
| RNF06 | **Privacidade:** sem cookies de rastreamento sem consentimento (prefira Plausible ou Umami) e uma página curta de política de privacidade. |
| RNF07 | **Manutenção:** todo o conteúdo editável fica em `src/content` e `src/data`, e nenhum texto de produto fica no código. |
| RNF08 | **Movimento:** transições de no máximo 150ms, só em cor e borda, respeitando `prefers-reduced-motion`. |

---

## 9. Critérios de aceite (checklist)
- [ ] As 4 páginas principais seguem as referências visuais em celular (390px) e desktop (1440px).
- [ ] Cores, fontes, cantos de 2px e malha de voxel seguem a seção 3.
- [ ] Os filtros funcionam, atualizam a URL e o estado vazio aparece quando não há resultado.
- [ ] Trocar a variação atualiza a prévia da mensagem, e o link do WhatsApp abre com o texto correto, acentos inclusos.
- [ ] "Outra medida" leva ao sob medida com a referência preenchida.
- [ ] O formulário sob medida valida os campos e gera a mensagem 6.2.
- [ ] Um produto sem preço mostra "Sob consulta".
- [ ] A barra fixa do WhatsApp não cobre conteúdo no celular (o rodapé tem padding extra).
- [ ] Lighthouse no celular: Performance ≥ 90, Acessibilidade ≥ 95, SEO ≥ 95.
- [ ] Os 12 produtos do seed e as 4 categorias estão cadastrados.
- [ ] Um README explica como adicionar um produto em 5 passos.

---

## 10. Arquivos de apoio nesta pasta
- `assets/design-tokens.json`: tokens oficiais.
- `assets/logo/`: ícones SVG e a imagem de Open Graph.
- `referencias_visuais/`: as 8 telas do conceito (1–4 celular, 5–8 desktop).
- `PROMPT_Antigravity.md`: o prompt para iniciar o projeto.
