# WebAssembly e a Democratização dos Jogos no Navegador

**Compilação, compressão, distribuição e desempenho na execução de aplicações interativas**

Trabalho de Conclusão de Curso em **Sistemas de Informação** pelo **Centro Universitário Internacional UNINTER**, entregue como um site interativo em um único arquivo HTML.

[![Acessar o TCC](https://img.shields.io/badge/Acessar_o_TCC-online-6a5cf0?style=for-the-badge)](https://gabrielvelosodev.github.io/tcc-webassembly/)
![Status](https://img.shields.io/badge/status-em_desenvolvimento-f2b860?style=for-the-badge)
![Arquivo único](https://img.shields.io/badge/HTML-arquivo_único-5fd0e3?style=for-the-badge)
![Referências](https://img.shields.io/badge/referências-93_(ABNT)-6fd19a?style=for-the-badge)

> **Versão preliminar.** O trabalho está em desenvolvimento. Os experimentos de compressão (E1 e E1-B) foram executados; o protocolo de desempenho (E2) foi executado em versão reduzida em um único motor de navegador (E2-R); o E2 completo e o experimento com jogo completo (E3) estão em andamento.

---

## Sumário

- [Sobre o trabalho](#sobre-o-trabalho)
- [Destaques](#destaques)
- [Principais resultados](#principais-resultados)
- [Estrutura do trabalho](#estrutura-do-trabalho)
- [Recursos do site](#recursos-do-site)
- [Como acessar](#como-acessar)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Reproduzir os experimentos](#reproduzir-os-experimentos)
- [Níveis de evidência](#níveis-de-evidência)
- [Limitações](#limitações)
- [Tecnologias](#tecnologias)
- [Principais referências](#principais-referências)
- [Histórico de versões](#histórico-de-versões)
- [Autoria](#autoria) · [Licença](#licença)

## Sobre o trabalho

Como um jogo escrito em C, C++ ou Rust consegue rodar dentro do navegador, a partir de um link, sem instalação? À primeira vista parece uma espécie de "mágica programacional". Este TCC desmonta essa mágica camada por camada: compiladores, formato binário, navegador, protocolos de rede, compressão e APIs gráficas.

**Problema de pesquisa:** em que medida o WebAssembly, combinado com técnicas modernas de compressão, compilação e distribuição de conteúdo, pode viabilizar a execução de jogos complexos diretamente em navegadores, reduzindo barreiras de instalação, compatibilidade e acesso sem comprometer excessivamente o desempenho e a experiência do usuário?

**Hipótese de trabalho:** o WebAssembly é condição *necessária, mas não suficiente*; a experiência final depende predominantemente de fatores externos a ele — formato dos ativos, codificação de transferência, estratégia de carregamento e API gráfica.

**Metodologia:** pesquisa bibliográfica e documental, de abordagem analítica e comparativa, fundamentada em especificações oficiais (W3C, IETF, Khronos, WHATWG) e em artigos revisados por pares. Ela é complementada por experimentos próprios (E1, E1-B e E2-R), por um protocolo experimental completo e reproduzível (E2) e por dados de acesso à internet e de consumo de jogos no Brasil.

## Destaques

- **Dois experimentos de compressão (E1 e E1-B):** gzip, Brotli e Zstandard aplicados a 13 binários WebAssembly reais, com decomposição por seção do binário e tempos de compressão e descompressão.
- **Execução reduzida do protocolo de desempenho (E2-R):** JavaScript × WebAssembly × C nativo no Node.js e no Chrome (motor V8), com 30 repetições por célula, rede móvel emulada e análise estatística (bootstrap, Mann-Whitney, delta de Cliff e correção de Holm).
- **Protocolo experimental completo (E2):** desenho fatorial para três navegadores e vários dispositivos, com coleta automatizada via Playwright e análise em Python.
- **Estudo de caso de 2026:** porte não oficial de *GTA V* que, segundo a imprensa, começava no navegador após cerca de 700 MB de um jogo que exige mais de 100 GB no PC.
- **Contexto brasileiro:** dados da TIC Domicílios 2025 e da Pesquisa Game Brasil confrontam a ideia de democratização com a realidade de acesso (65% dos usuários acessam a internet só pelo celular; 87% nas classes D e E).
- **Trabalhos relacionados e adoção na Web:** revisão de estudos sobre desempenho, energia, segurança e compiladores, e dados do Web Almanac 2025 sobre uso real de WebAssembly.
- **Guia prático de publicação:** roteiro de compilação, *build*, servidor e cliente, com exemplo de configuração de nginx e script de diagnóstico.
- **Rigor nas fontes:** 93 referências em ABNT. Cada afirmação é classificada como fato documentado, pesquisa anterior, experimento deste trabalho, exemplo hipotético ou interpretação do autor.
- **Laboratório ao vivo:** um módulo WebAssembly real de 84 bytes é validado, compilado e executado no navegador de quem lê.

## Principais resultados

### E1 — compressão de binários usados em jogos

Tamanho transferível após compressão (bytes) e redução em relação ao arquivo original.

| Binário | Função | Original | gzip 9 | Brotli 11 |
|---|---|---:|---:|---:|
| `Box2D.wasm` | Física 2D | 161.347 | 74.779 (−53,7%) | 61.360 (−62,0%) |
| `draco_decoder.wasm` | Decodificação de malhas | 285.747 | 88.507 (−69,0%) | 66.140 (−76,9%) |
| `basis_transcoder.wasm` | Transcodificação de texturas | 527.333 | 247.535 (−53,1%) | 203.605 (−61,4%) |
| `ammo.wasm.wasm` | Física 3D (Bullet) | 651.386 | 253.444 (−61,1%) | 191.652 (−70,6%) |
| `sql-wasm.wasm` | SQLite (controle) | 652.953 | 319.744 (−51,0%) | 275.852 (−57,8%) |
| `rapier_wasm3d_bg.wasm` | Física 3D (Rust) | 1.440.227 | 531.181 (−63,1%) | 394.954 (−72,6%) |
| `esbuild.wasm` | Empacotador (controle) | 11.894.007 | 3.153.033 (−73,5%) | 2.267.179 (−80,9%) |

Node.js v22.22.0 (zlib 1.3.1, Brotli 1.1.0, Zstandard 1.5.7), outubro de 2026. O Brotli 11 gerou arquivos de 13,7% a 28,1% menores que o gzip 9 em todos os casos.

### E1-B — ampliação, anatomia e custo de compressão

Seis binários adicionais (codecs de imagem, interpretador de scripts, gestão de cor e processamento de imagens).

| Binário | Função | Original | Brotli 11 | Comprimir (br 11) | Descomprimir (br 11) |
|---|---|---:|---:|---:|---:|
| `qcms_bg.wasm` | Gestão de cor (Rust) | 96.589 | 29.090 (−69,9%) | 189 ms | 0,46 ms |
| `jbig2.wasm` | Imagens JBIG2 | 104.852 | 32.420 (−69,1%) | 177 ms | 0,48 ms |
| `openjpeg.wasm` | Imagens JPEG 2000 | 252.032 | 68.190 (−72,9%) | 460 ms | 1,01 ms |
| `quickjs-eval.wasm` | Interpretador de scripts | 469.105 | 187.051 (−60,1%) | 1.204 ms | 2,62 ms |
| `webp_codec.wasm` | Codec WebP | 565.369 | 141.665 (−74,9%) | 1.345 ms | 2,22 ms |
| `sharp-wasm32.wasm` | Processamento de imagens (libvips) | 8.991.731 | 2.824.175 (−68,6%) | 29,4 s | 47,0 ms |

- A seção de código ocupa 77–95% dos bytes e é a parte mais compressível (redução de 64–77%).
- Comprimir com Brotli 11 foi 49 a 93 vezes mais lento que com Brotli 5 — viável apenas como pré-compressão no *build*.
- Descomprimir levou no máximo 47 ms. Com isso, a compressão só deixaria de compensar em redes acima de **~0,86 a 1,5 Gbit/s** (largura de banda de equilíbrio, derivada da Equação 5 do trabalho).

### E2-R — execução reduzida do protocolo de desempenho (motor V8)

Núcleo de simulação N-corpos (`simulate(512, 200)`), mediana de 30 repetições; todas as implementações produziram a mesma soma de verificação, bit a bit.

| Ambiente | Implementação | Tempo aquecido | ÷ nativo clang | 1ª chamada ÷ aquecida |
|---|---|---:|---:|---:|
| Nativo | gcc -O3 | 94,5 ms | 0,53 | 1,00 |
| Nativo | clang -O3 | 178,3 ms | 1,00 | 1,01 |
| Node.js 22 | JavaScript | 207,2 ms | 1,16 | 1,08 |
| Node.js 22 | Wasm -O3 | 186,0 ms | 1,04 | 1,33 |
| Chrome 153 | JavaScript | 204,7 ms | 1,15 | 1,25 |
| Chrome 153 | Wasm -O3 | 185,0 ms | 1,04 | 1,54 |

- O Wasm levou **3,7–4,3% mais tempo** que o nativo do mesmo compilador; o JavaScript, **~11% mais** que o Wasm.
- O mesmo C compilado com gcc foi **1,9× mais rápido** que com clang: a "distância até o nativo" depende do compilador de referência.
- A **primeira chamada** ao Wasm foi 33–54% mais lenta que as seguintes (compilação preguiçosa do V8) — recomenda-se aquecer os sistemas críticos na tela de carregamento.
- **Carregamento** do binário de 9 MB em rede móvel emulada (5 Mbit/s, +150 ms): 14,6 s sem compressão → 4,7 s com Brotli 11. Em rede local sem limitação, o mesmo binário ficou *mais lento* com Brotli 11 (148 ms contra 103 ms), confirmando na prática a largura de banda de equilíbrio do E1-B.
- **Fronteira JS↔Wasm:** chamar uma função JavaScript a partir do Wasm a cada passo custou cerca de 6 vezes mais que uma chamada interna.

> Ambiente do E1-B e do E2-R: máquina virtual Linux x86-64 de nuvem (2 vCPUs), Node.js v22.23.5, Chrome 153 *headless*, clang 18.1.3 e gcc 13.3.0, novembro de 2026. Detalhes, desvios do protocolo e tabelas completas no Capítulo 7.

## Estrutura do trabalho

| Parte | Conteúdo |
|---|---|
| Pré-textuais | Capa, folha de rosto, resumo, abstract, sumário, listas de figuras (17) e tabelas (29) |
| Cap. 1 | Introdução, problema, objetivos e metodologia |
| Cap. 2 | Fundamentos: navegador, JIT, x86-64/ARM, memória linear, isolamento |
| Cap. 3 | WebAssembly em profundidade: formato binário, Emscripten, LLVM, Rust e **trabalhos relacionados** |
| Cap. 4 | Compressão e distribuição: gzip, Brotli, zstd, texturas, cache, CDN, largura de banda de equilíbrio |
| Cap. 5 | Arquitetura de um jogo web: WebGL, WebGPU, Workers, áudio e **guia prático de publicação** |
| Cap. 6 | Desempenho: métricas, fórmulas, gargalos e compilação preguiçosa |
| Cap. 7 | Experimentos **E1** e **E1-B**, protocolo **E2**, execução reduzida **E2-R** e laboratório ao vivo |
| Cap. 8 | Segurança, limitações e desafios |
| Cap. 9 | Aplicações reais, estudo de caso *GTA V*, **adoção na Web**, **caso brasileiro** e perspectivas |
| Cap. 10–11 | Discussão dos resultados e conclusão |
| Pós-textuais | Referências, apêndices com todo o código, glossário pesquisável, siglas |

Em formatação ABNT (Times 12, entrelinha 1,5, margens 3/2 cm), a parte textual ocupa cerca de 90 páginas.

## Recursos do site

- Sumário lateral com indicação do capítulo atual e barra de progresso de leitura
- **Modo apresentação** em tela cheia (tecla `P`, setas para navegar, `Esc` para sair)
- Tema claro e escuro (tecla `T`)
- Glossário pesquisável (tecla `/`)
- Diagramas interativos, gráficos do E1, E1-B e E2-R e calculadora de tempo de transferência com os 13 binários medidos
- Exportação para PDF pelo navegador, com layout A4 nas margens da ABNT
- Responsivo, navegável por teclado e compatível com a preferência por movimento reduzido

## Como acessar

**Online:** [gabrielvelosodev.github.io/tcc-webassembly](https://gabrielvelosodev.github.io/tcc-webassembly/)

**Localmente:** baixe o `index.html` e abra-o em um navegador moderno (Chrome, Edge, Firefox ou Safari). Não há dependências: estilos, scripts, dados e o módulo WebAssembly estão embutidos no arquivo. Sem internet, apenas as fontes tipográficas são substituídas pelas do sistema.

## Estrutura do repositório

```
tcc-webassembly/
├── index.html              # o TCC completo (site interativo, arquivo único)
├── README.md
└── experimentos/           # scripts e dados brutos do E1-B e do E2-R
    ├── README.md           # passo a passo para repetir a coleta
    ├── anatomy.mjs         # decomposição dos binários por seção
    ├── e1b_timing.mjs      # tamanhos e tempos de compressão/descompressão
    ├── nbody.c · nbody.mjs · native_main.c
    ├── exec_node*.mjs · exec_native.sh            # bancadas de execução
    ├── server.mjs · precompress.mjs · run_chrome.py · public/   # bancadas no Chrome
    ├── boundary.c · boundary.mjs                  # custo da fronteira JS↔Wasm
    ├── analyze_e2r.py      # análise estatística
    ├── *.json · *.jsonl    # resultados brutos (uma linha por repetição)
    └── sha256.txt          # hashes dos binários analisados
```

## Reproduzir os experimentos

**E1:**

```bash
npm i three@0.170.0 @dimforge/rapier3d@0.14.0 box2d-wasm@7.0.0 sql.js@1.12.0 esbuild-wasm@0.24.0
node e1_compress.mjs node_modules/box2d-wasm/dist/es/Box2D.wasm   # e demais binários
```

O script `e1_compress.mjs` e o código do protocolo E2 (`nbody.c`, `nbody.mjs`, `build.sh`, `server.mjs`, `bench.html`, `run.mjs`, `analyze.py`) estão no **Apêndice A** do site, com botão de copiar.

**E1-B e E2-R:** os scripts e os dados brutos estão na pasta [`experimentos/`](experimentos/). Em resumo:

```bash
npm i pdfjs-dist@6.2.108 playwright-core@1.63.0 @img/sharp-wasm32@0.35.4   # binários do E1-B
node anatomy.mjs corpus/*.wasm > anatomy.json
node e1b_timing.mjs corpus/*.wasm > e1b_timing.json
./exec_native.sh 30 && node exec_node.mjs 30                          # execução
node server.mjs & python3 run_chrome.py exec 30 && python3 run_chrome.py load 30
python3 analyze_e2r.py                                                # análise
```

O passo a passo completo (compilação com clang para `wasm32`, certificado local, pré-compressão) está em [`experimentos/README.md`](experimentos/README.md). Os tempos dependem do *hardware*; recomenda-se registrar o ambiente de cada coleta.

## Níveis de evidência

| Marcação | Significado |
|---|---|
| Fato documentado | Comportamento definido em especificação ou documentação oficial |
| Pesquisa anterior | Resultado empírico publicado por outros autores, com as condições em que foi obtido |
| Experimento deste trabalho | Dado efetivamente medido neste TCC (E1, E1-B e E2-R) |
| Exemplo hipotético | Valores assumidos para fins didáticos; não são medições |
| Interpretação do autor | Inferência, hipótese ou juízo analítico deste trabalho |

## Limitações

- O E2-R usa um único motor (V8), uma máquina virtual de servidor e o compilador clang em vez do Emscripten; não substitui o E2 completo em Firefox, Safari e celulares de entrada.
- Os tempos do E1-B foram medidos em uma única máquina; os tamanhos são determinísticos.
- A análise de desempenho em múltiplos navegadores se apoia em estudos de terceiros com versões de 2017 a 2021.
- Parte dos dados sobre o Brasil e o estudo de caso *GTA V* provêm de divulgações da imprensa.
- O estado de implementação dos recursos foi verificado até outubro de 2026.

## Tecnologias

WebAssembly · JavaScript · HTML/CSS · SVG · C · Rust · Python (pandas, NumPy, SciPy) · Node.js · Playwright · Chrome DevTools Protocol · Emscripten · LLVM/clang · WABT

## Principais referências

- HAAS, A. *et al.* Bringing the web up to speed with WebAssembly. **PLDI**, 2017. DOI: [10.1145/3062341.3062363](https://doi.org/10.1145/3062341.3062363)
- JANGDA, A. *et al.* Not so fast: analyzing the performance of WebAssembly vs. native code. **USENIX ATC**, 2019.
- LEHMANN, D.; KINDER, J.; PRADEL, M. Everything old is new again: binary security of WebAssembly. **USENIX Security**, 2020.
- HILBIG, A.; LEHMANN, D.; PRADEL, M. An empirical study of real-world WebAssembly binaries. **WWW**, 2021. DOI: [10.1145/3442381.3450138](https://doi.org/10.1145/3442381.3450138)
- WANG, W. Empowering web applications with WebAssembly: are we there yet? **ASE**, 2021.
- POCKSTALLER, D.; HUBER, S.; DEMETZ, L. Comparing the energy consumption of WebAssembly and JavaScript in mobile browsers. **WEBIST**, 2023. DOI: [10.5220/0012205600003584](https://doi.org/10.5220/0012205600003584)
- ROSSBERG, A. [Wasm 3.0 completed](https://webassembly.org/news/2025-09-17-wasm-3.0/). WebAssembly, 2025.
- VADGAMA, N. [WebAssembly](https://almanac.httparchive.org/en/2025/webassembly). *In*: HTTP ARCHIVE. **Web Almanac 2025**, 2026.
- NIC.br. [TIC Domicílios 2025](https://www.cetic.br/media/docs/publicacoes/2/pt-br/20260511173151/tic_domicilios_2025_resumoexecutivo%20pt.pdf): resumo executivo. CGI.br, 2026.

A lista completa (93 referências, ABNT NBR 6023) está no site.

## Histórico de versões

| Data | Alterações |
|---|---|
| Nov. 2026 | Experimentos E1-B e E2-R executados (scripts e dados em `experimentos/`); novas seções de trabalhos relacionados (3.8), guia prático de publicação (5.6), adoção na Web (9.5) e caso brasileiro (9.8); 14 novas referências; tabelas e figuras renumeradas (29 e 17) |
| Out. 2026 | Versão preliminar com o experimento E1, o protocolo E2 e o estudo de caso *GTA V* |

## Autoria

**Gabriel Gonçalves Veloso** — Sistemas de Informação, UNINTER
Orientação: Prof. Wagner Meira Júnior e Prof.ª Regiane Moreno
Montes Claros, 2026

[![GitHub](https://img.shields.io/badge/GitHub-GabrielVelosoDEV-181717?logo=github)](https://github.com/GabrielVelosoDEV)

## Licença

© 2026 Gabriel Gonçalves Veloso. Todos os direitos reservados. O conteúdo pode ser lido e citado com a devida referência, conforme a ABNT; a reprodução integral depende de autorização do autor.
