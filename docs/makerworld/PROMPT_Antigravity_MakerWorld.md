# Prompt para o Antigravity · Integração MakerWorld

> **Como usar:** este prompt é uma extensão do catálogo descrito em `07_Especificacao_Catalogo`. Abra o projeto do catálogo no Antigravity, copie a pasta `09_MakerWorld` para dentro dele (por exemplo, em `docs/makerworld/`) e cole o prompt abaixo no agente. Antes, exporte as telas do canvas "Voxel Lab · Redirecionamento MakerWorld" como PNG para `09_MakerWorld/referencias_visuais/` (nomes sugeridos na lista de referências do prompt).
>
> **Antes de publicar:** troque os logos de `assets/` pelo arquivo oficial em SVG e tenha a autorização de uso da marca MakerWorld/Bambu Lab. Os PNGs desta pasta foram gerados a partir de imagens públicas, só para o concept.

---

```
Você é um desenvolvedor front-end sênior trabalhando no catálogo da VOXEL LAB (Astro + TypeScript, saída estática), já especificado em CDU_Catalogo_Voxel_Lab.md. Sua tarefa agora é adicionar a integração com o MakerWorld, que funciona como uma EXPANSÃO DO CATÁLOGO: quando o cliente não encontra uma peça, ele busca o modelo no MakerWorld, cola o link no site e é levado direto ao WhatsApp com a mensagem pronta. A Voxel Lab confere a licença, imprime e envia.

FONTES DE VERDADE:
1. CDU_Catalogo_Voxel_Lab.md: continua valendo para design system, stack, regras de cor, acessibilidade e desempenho. Não quebre nada do que já existe.
2. Este prompt: define tudo o que é novo. Se algo não estiver aqui nem no CDU, escolha a opção mais simples e anote no README.
3. referencias_visuais/*.png (exportadas do canvas):
   - mw_1_busca_sem_resultado_desktop.png
   - mw_2_aba_makerworld_desktop.png
   - mw_3_fim_da_categoria_celular.png
   - mw_4_pontos_de_entrada.png (sugestões da busca, card lateral, faixa da home)
4. assets/makerworld-logo-horizontal-branco.png (símbolo + "Maker World", branco, fundo transparente, 720×246) e assets/makerworld-icone-branco.png (só o símbolo, branco, 512×512). Coloque-os em src/assets/makerworld/ e use via astro:assets. Sempre com alt="MakerWorld" (ou alt="" quando o texto "MakerWorld" já estiver ao lado). Nunca recolorir, distorcer ou colocar sobre fundo laranja. Deixe o caminho centralizado para trocar depois pelo SVG oficial.

COMPORTAMENTO PRINCIPAL (o mais importante):
Ao clicar em "Orçar impressão" (ou "Orçar"), o cliente vai DIRETO para o WhatsApp, sem tela intermediária nem formulário.
1. Ler o link colado no campo.
2. Normalizar: trim; se não tiver protocolo, prefixar https://; host em minúsculas; remover query string e #hash (parâmetros de rastreamento).
3. Validar: o host deve ser makerworld.com ou um subdomínio dele (www.makerworld.com etc.), e o caminho deve conter /models/<número> (ex.: https://makerworld.com/en/models/408321 ou /models/499957-nome-do-modelo). Use new URL() em try/catch.
4. Se o campo estiver vazio: não abrir nada, mostrar "Cole o link do modelo antes de orçar." e levar o foco ao campo.
   Se for inválido: não abrir nada, mostrar "Esse link não parece ser de um modelo do MakerWorld." A mensagem de erro fica abaixo do campo, com role="alert" e aria-describedby no input, em --nozzle sobre --surface-raised.
5. Se for válido: montar a mensagem 6.4a, codificar com encodeURIComponent, registrar o evento whatsapp_makerworld e abrir https://wa.me/<site.whatsapp>?text=<mensagem>. Desktop: nova aba (window.open com noopener). Celular: mesma aba (location.href), para abrir o app.
6. Enter dentro do campo faz o mesmo que clicar no botão (use <form> com onsubmit + preventDefault).
7. Implemente como UMA ilha reutilizável (JS puro ou Preact, < 3 KB): FormLinkMakerWorld, com props: variante ("grande" | "compacto"), termoBusca?: string, origem: string.

MENSAGENS DO WHATSAPP (adicione como seção 6.4 no README):
6.4a Link colado pelo cliente:
Olá, Voxel Lab! Quero orçar a impressão deste modelo do MakerWorld:
{link normalizado}
Vim pela busca: "{termo}"            ← só quando existir termoBusca
Página: {url da página de origem}

6.4b Modelo da vitrine "Já impressos pela Voxel Lab":
Olá, Voxel Lab! Quero este modelo do MakerWorld impresso por vocês:
• {nome} (por {autor})
• Material: {material}
• Cor: {cor, se escolhida}
{modeloUrl}
{url da página do item no site}

CONFIGURAÇÃO (src/site.config.ts, acrescentar):
makerworld: {
  ativo: true,                                              // false esconde tudo (aba, cards, faixa, sugestão)
  buscaUrl: 'https://makerworld.com/en/search/models?keyword=', // [CONFERIR] formato atual da busca do MakerWorld
  hostsAceitos: ['makerworld.com'],
  prazoDias: null,                                          // [DEFINIR]
}
Tudo o que é MakerWorld deve sumir do site quando ativo = false.

BUSCA NO MAKERWORLD:
- Link "Buscar ... no MakerWorld" = buscaUrl + encodeURIComponent(termo). Sem termo, abrir https://makerworld.com.
- Sempre target="_blank" rel="noopener noreferrer", com ícone de seta externa e texto auxiliar "Abre em nova aba".
- Registrar o evento makerworld_busca com {termo, origem}.
- Não usar iframe nem tentar ler dados do MakerWorld (sem scraping, sem fetch de outra origem).

ONDE APARECE (siga as referências visuais):
A. Header (desktop): depois de "Sob medida", um divisor vertical de 1px (--line) e a aba MakerWorld: logo horizontal com 22px de altura + rótulo "+ MODELOS" em IBM Plex Mono 10px, --nozzle. Fundo --nozzle-soft, borda 1px --nozzle, 2px de raio. Ativa (rota /makerworld): borda de 2px e aria-current="page". Link para /makerworld.
B. Celular: primeiro chip da linha de categorias, com o logo horizontal de 20px de altura + "+", mesmo estilo da aba.
C. /busca sem resultado: substitui o estado vazio atual. Título "Nenhuma peça para “{termo}”", texto de apoio e duas colunas:
   - Caminho 1 · Modelo pronto (maior, --surface-raised): selo "CAMINHO 1 · MODELO PRONTO", logo horizontal de 34px à direita, título "Não encontrou o que queria? Busque no MakerWorld e a gente imprime." (só "a gente imprime." em --nozzle), botão contorno "Buscar “{termo}” no MakerWorld ↗", FormLinkMakerWorld variante grande com termoBusca, 3 passos (Busque o modelo / Cole o link / A gente imprime) e linha técnica "PLA · PETG · TPU · prazo {prazoDias} dias úteis · envio para todo o Brasil".
   - Caminho 2 · Sob medida (--cad-soft, borda --cad): o CardNaoAchou atual, com "Orçar sob medida →" levando a /sob-medida?ref=busca:{termo}.
   - Abaixo, "Talvez sirva": até 4 produtos do catálogo com a mesma categoria ou palavras parecidas (busca simples por tokens).
D. Fim da lista de cada categoria (celular e desktop): card com borda --nozzle, selo "MODELO PRONTO", logo de 28px, título "Não achou? Busque no MakerWorld e a gente imprime.", botão "Abrir o MakerWorld ↗", FormLinkMakerWorld compacto e o link "Nem lá existe? Orçar sob medida →".
E. Lateral de filtros da categoria (desktop): o CardNaoAchou vira um card com duas linhas clicáveis: "JÁ EXISTE UM MODELO · Busque no MakerWorld e a gente imprime ↗" (rótulo em --nozzle) e "PRECISA PROJETAR · Mande a medida, a gente modela →" (fundo --cad-soft, rótulo em --cad).
F. Sugestões da busca do header (enquanto digita): última linha fixa "Buscar “{termo}” no MakerWorld ↗", sempre abaixo dos produtos próprios, navegável por teclado (setas + Enter).
G. Página inicial: faixa entre "Mais pedidos" e "Sob medida", com título "Viu no MakerWorld? A gente imprime." e FormLinkMakerWorld compacto + link "Ainda não escolheu? Abrir o MakerWorld ↗".

NOVA ROTA /makerworld (aba "catálogo expandido"):
1. Hero com malha de voxel: selo "CATÁLOGO EXPANDIDO", assinatura "VOXEL LAB × [logo MakerWorld 52px]", H1 "Milhares de modelos. A gente imprime." (segunda frase em --nozzle), texto de apoio, painel com busca grande (campo + botão laranja "Buscar no MakerWorld ↗") e, abaixo de uma linha tracejada, "JÁ ESCOLHEU? COLE O LINK" com FormLinkMakerWorld (botão em contorno laranja, para não competir com a busca).
2. "Explore por tema": 6 cartões que abrem buscas prontas (Setup de mesa, Suportes de controle, Luminárias, Organização, Figures e decoração, Casa e cozinha). Os termos ficam em src/data/makerworld-temas.json.
3. "Já impressos pela Voxel Lab": grade com os itens da collection makerworld (abaixo). Cada card: foto da peça impressa pela Voxel Lab, selo "via MakerWorld" com o ícone de 14px, nome, "por @autor · material", preço (regras do CDU: null = "Sob consulta") e botão "Pedir" que abre o WhatsApp com a mensagem 6.4b. A seção some quando a collection estiver vazia.
4. "Como funciona": 4 passos (Escolha no MakerWorld / Cole o link aqui / A gente confere: licença, tamanho e se imprime bem / Imprime e envia).
5. Nota de rodapé: "MakerWorld é uma marca de terceiros, usada aqui para indicar onde estão os modelos. Só imprimimos modelos cuja licença permite a venda de impressões, ou com autorização do autor, e o crédito ao autor vai junto com a peça."
SEO: title "Catálogo expandido · modelos do MakerWorld impressos pela Voxel Lab", description própria, sem schema.org Product para os modelos de terceiros.

DADOS (content collection src/content/makerworld/*.md, schema Zod):
nome: string; autor: string; autorUrl: url; modeloUrl: url (validar host makerworld.com e /models/<n>); licenca: string; licencaPermiteVenda: boolean; material: 'PLA'|'PETG'|'TPU'; cores?: string[]; preco: number|null; foto: image (foto PRÓPRIA da peça impressa, nunca a imagem do MakerWorld); ordem: number; ativo: boolean.
Regra: itens com licencaPermiteVenda = false ou ativo = false não aparecem. Crie 4 itens de exemplo com preco: null, foto placeholder (malha de voxel + rótulo "FOTO DA PEÇA") e marcados [DEFINIR].

REGRAS DE NEGÓCIO NOVAS:
RN10 · Pedido de modelo do MakerWorld sai sempre pelo WhatsApp (6.4a/6.4b). Não há upload, cadastro nem envio para servidor (mantém a RN06/LGPD).
RN11 · O site nunca hospeda nem exibe arquivos, imagens ou descrições copiadas do MakerWorld. Só o link, o nome do modelo e o nome do autor.
RN12 · Todo item da vitrine mostra o autor com link para o perfil dele.
RN13 · Cor: laranja = modelo pronto/compra; ciano = sob medida. O MakerWorld é "modelo pronto", então usa laranja. Nunca coloque o logo do MakerWorld sobre fundo laranja.

ANALYTICS (mesmo provedor do CDU): makerworld_busca {termo, origem}, whatsapp_makerworld {origem, temTermo}, whatsapp_makerworld_vitrine {slug}, makerworld_link_invalido {origem}. Nunca envie o link colado nem dados pessoais para o analytics.

ACESSIBILIDADE E DESEMPENHO: tudo do CDU continua (foco ciano, alvos ≥ 44px, labels reais, contraste AA). O <label> do campo é "Link do modelo no MakerWorld" (pode ser visualmente oculto só onde a referência não mostra rótulo). Logos com width/height definidos para não causar CLS.

FASES (pare ao final de cada uma, mostre o resultado e espere minha confirmação):
Fase 1: config, assets, LogoMakerWorld, FormLinkMakerWorld (com testes unitários da normalização/validação: links válidos com e sem https, com locale, com slug, com query; inválidos: outro domínio, makerworld.com sem /models/, texto solto, makerworld.com.evil.com) e as mensagens 6.4a/6.4b. Adicione tudo ao /styleguide.
Fase 2: pontos de entrada A, B, C, D, E, F e G.
Fase 3: rota /makerworld, collection e temas.
Fase 4: analytics, SEO, flag ativo=false testada, Lighthouse sem regressão e README atualizado.

CRITÉRIOS DE ACEITE:
- [ ] Clicar em "Orçar impressão" com um link válido abre o WhatsApp direto, com o link normalizado (sem query) e, na busca, o termo digitado. Acentos e aspas corretos.
- [ ] Link vazio ou inválido não abre nada, mostra o erro e leva o foco ao campo.
- [ ] Enter no campo funciona igual ao botão.
- [ ] "Buscar no MakerWorld" abre em nova aba com o termo da busca.
- [ ] A aba MakerWorld aparece no header (desktop) e como primeiro chip (celular), com aria-current na rota /makerworld.
- [ ] /busca sem resultado mostra os dois caminhos e "Talvez sirva".
- [ ] Com makerworld.ativo = false, nada relacionado ao MakerWorld aparece e /makerworld responde 404.
- [ ] Itens sem licença de venda não aparecem na vitrine.
- [ ] Os logos vêm de um único lugar (src/assets/makerworld/) e trocar o arquivo atualiza o site inteiro.
- [ ] Lighthouse no celular continua ≥ 90/95/95.

ENTREGA: as mudanças funcionando com npm run dev e npm run build, o checklist acima preenchido no README e a lista de tudo que ficou como [DEFINIR] ou [CONFERIR].
```

---

## Prompts de apoio

**Para trocar pelo logo oficial:**
```
Substitua os arquivos de src/assets/makerworld/ pelo SVG oficial do MakerWorld que está em <caminho>. Mantenha alturas, alt e espaçamentos. Confira o contraste sobre --surface e --surface-raised.
```

**Para cadastrar um modelo na vitrine:**
```
Crie um item na collection makerworld: nome "<nome>", autor "<autor>" (<url do perfil>), modelo <url do MakerWorld>, licença "<licença>", licencaPermiteVenda true, material <PLA|PETG|TPU>, preço <valor ou null> e a foto <arquivo da peça impressa>. Valide pelo schema.
```
