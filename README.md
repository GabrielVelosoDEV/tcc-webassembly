# WebAssembly e a Democratização dos Jogos no Navegador

**Compilação, compressão, distribuição e desempenho na execução de aplicações interativas**

Trabalho de Conclusão de Curso em **Sistemas de Informação** pelo **Centro Universitário Internacional UNINTER**, entregue como um site interativo em um único arquivo HTML.

[![Acessar o TCC](https://img.shields.io/badge/Acessar_o_TCC-online-6a5cf0?style=for-the-badge)](https://gabrielvelosodev.github.io/tcc-webassembly/)
![Status](https://img.shields.io/badge/status-em_desenvolvimento-f2b860?style=for-the-badge)
![Arquivo único](https://img.shields.io/badge/HTML-arquivo_único-5fd0e3?style=for-the-badge)

> **Versão preliminar.** O trabalho está em desenvolvimento. O experimento de compressão (E1) já foi executado; os experimentos de desempenho (E2) e de jogo completo (E3) estão em andamento.

---

## Sobre o trabalho

Como um jogo escrito em C, C++ ou Rust consegue rodar dentro do navegador, a partir de um link, sem instalação? À primeira vista parece uma espécie de "mágica programacional". Este TCC desmonta essa mágica camada por camada: compiladores, formato binário, navegador, protocolos de rede, compressão e APIs gráficas.

**Problema de pesquisa:** em que medida o WebAssembly, combinado com técnicas modernas de compressão, compilação e distribuição de conteúdo, pode viabilizar a execução de jogos complexos diretamente em navegadores, reduzindo barreiras de instalação, compatibilidade e acesso sem comprometer excessivamente o desempenho e a experiência do usuário?

**Metodologia:** pesquisa bibliográfica e documental, de abordagem analítica e comparativa, fundamentada em especificações oficiais (W3C, IETF, Khronos, WHATWG) e em artigos revisados por pares. Ela é complementada por um experimento executado e por protocolos experimentais reproduzíveis.

## Destaques

- **Experimento real de compressão (E1):** gzip, Brotli e Zstandard aplicados a 7 binários WebAssembly usados em jogos e aplicações interativas.
- **Protocolo experimental reproduzível (E2):** comparação entre JavaScript e WebAssembly em desenho fatorial, com coleta automatizada via Playwright e análise estatística em Python (bootstrap, Mann-Whitney, delta de Cliff e correção de Holm).
- **Estudo de caso de 2026:** porte não oficial de *GTA V* que, segundo a imprensa, começava no navegador após cerca de 700 MB de um jogo que exige mais de 100 GB no PC.
- **Rigor nas fontes:** 79 referências em ABNT. Cada afirmação é classificada como fato documentado, pesquisa anterior, experimento deste trabalho, exemplo hipotético ou interpretação do autor.
- **Laboratório ao vivo:** um módulo WebAssembly real de 84 bytes é validado, compilado e executado no navegador de quem lê.

## Resultados do Experimento E1

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

**Ambiente:** Node.js v22.22.0 (zlib 1.3.1, Brotli 1.1.0, Zstandard 1.5.7), Linux x86-64, outubro de 2026. O Brotli 11 gerou arquivos de 13,7% a 28,1% menores que o gzip 9 em todos os casos. Os resultados de Zstandard, as versões dos pacotes e os hashes SHA-256 estão no Capítulo 7.

## Estrutura

| Parte | Conteúdo |
|---|---|
| Pré-textuais | Capa, folha de rosto, resumo, abstract, sumário, listas de figuras e tabelas |
| Cap. 1 | Introdução, problema, objetivos e metodologia |
| Cap. 2 | Fundamentos: navegador, JIT, x86-64/ARM, memória linear, isolamento |
| Cap. 3 | WebAssembly em profundidade: formato binário, Emscripten, LLVM, Rust |
| Cap. 4 | Compressão e distribuição: gzip, Brotli, zstd, texturas, cache, CDN |
| Cap. 5 | Arquitetura de um jogo web: WebGL, WebGPU, Workers, áudio |
| Cap. 6 | Desempenho: métricas, fórmulas e gargalos |
| Cap. 7 | Experimento E1, protocolo E2 e laboratório ao vivo |
| Cap. 8 | Segurança, limitações e desafios |
| Cap. 9 | Aplicações reais, estudo de caso *GTA V* e perspectivas |
| Cap. 10–11 | Discussão dos resultados e conclusão |
| Pós-textuais | Referências, apêndices com código, glossário pesquisável, siglas |

## Recursos do site

- Sumário lateral com indicação do capítulo atual e barra de progresso de leitura
- **Modo apresentação** em tela cheia (tecla `P`, setas para navegar, `Esc` para sair)
- Tema claro e escuro (tecla `T`)
- Glossário pesquisável (tecla `/`)
- Diagramas interativos, calculadora de tempo de transferência e gráfico do E1
- Exportação para PDF pelo navegador, com layout A4 nas margens da ABNT
- Responsivo, navegável por teclado e compatível com a preferência por movimento reduzido

## Como acessar

**Online:** [gabrielvelosodev.github.io/tcc-webassembly](https://gabrielvelosodev.github.io/tcc-webassembly/)

**Localmente:** baixe o `index.html` e abra-o em um navegador moderno (Chrome, Edge, Firefox ou Safari). Não há dependências: estilos, scripts, dados e o módulo WebAssembly estão embutidos no arquivo. Sem internet, apenas as fontes tipográficas são substituídas pelas do sistema.

## Reproduzir o Experimento E1

```bash
npm i three@0.170.0 @dimforge/rapier3d@0.14.0 box2d-wasm@7.0.0 sql.js@1.12.0 esbuild-wasm@0.24.0
node e1_compress.mjs node_modules/box2d-wasm/dist/es/Box2D.wasm   # e demais binários
```

O script `e1_compress.mjs` e todo o código do protocolo E2 (`nbody.c`, `nbody.mjs`, `build.sh`, `server.mjs`, `bench.html`, `run.mjs`, `analyze.py`) estão no **Apêndice A** do site, com botão de copiar.

## Tecnologias

WebAssembly · JavaScript · HTML/CSS · SVG · C · Rust · Python (pandas, SciPy) · Node.js · Playwright · Emscripten · WABT

## Principais referências

- HAAS, A. *et al.* Bringing the web up to speed with WebAssembly. **PLDI**, 2017. DOI: [10.1145/3062341.3062363](https://doi.org/10.1145/3062341.3062363)
- JANGDA, A. *et al.* Not so fast: analyzing the performance of WebAssembly vs. native code. **USENIX ATC**, 2019.
- LEHMANN, D.; KINDER, J.; PRADEL, M. Everything old is new again: binary security of WebAssembly. **USENIX Security**, 2020.
- HILBIG, A.; LEHMANN, D.; PRADEL, M. An empirical study of real-world WebAssembly binaries. **WWW**, 2021. DOI: [10.1145/3442381.3450138](https://doi.org/10.1145/3442381.3450138)
- ROSSBERG, A. [Wasm 3.0 completed](https://webassembly.org/news/2025-09-17-wasm-3.0/). WebAssembly, 2025.

A lista completa (79 referências, ABNT NBR 6023) está no site.

## Autoria

**Gabriel Gonçalves Veloso** — Sistemas de Informação, UNINTER
Orientação: Prof. Wagner Meira Júnior e Prof.ª Regiane Moreno
Montes Claros, 2026

[![GitHub](https://img.shields.io/badge/GitHub-GabrielVelosoDEV-181717?logo=github)](https://github.com/GabrielVelosoDEV)

## Licença

© 2026 Gabriel Gonçalves Veloso. Todos os direitos reservados. O conteúdo pode ser lido e citado com a devida referência, conforme a ABNT; a reprodução integral depende de autorização do autor.
