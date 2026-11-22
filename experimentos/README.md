# Dados e scripts dos experimentos E1-B e E2-R

Este pacote acompanha a versão ampliada do TCC "WebAssembly e a Democratização dos Jogos no Navegador".
Ele contém os scripts que foram executados e os dados brutos que geraram as Seções 7.4 e 7.5.

## Onde os dados foram medidos

As medições foram feitas em uma máquina virtual Linux x86-64 de nuvem (2 vCPUs, Intel Xeon @ 2,10 GHz),
com Node.js v22.23.5, Chrome 153 (headless, via Playwright), clang 18.1.3 e gcc 13.3.0, em novembro de 2026.
Recomenda-se repetir a coleta no seu computador (e, se possível, em um celular Android de entrada)
e substituir os números do texto pelos da sua máquina, registrando o ambiente.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `nbody.c`, `nbody.mjs`, `native_main.c` | Núcleo N-corpos (C e porte JS) e bancada nativa |
| `anatomy.mjs` | Decomposição dos binários Wasm por seção (E1-B) |
| `e1b_timing.mjs` | Tamanhos e tempos de compressão/descompressão (E1-B) |
| `exec_node_child.mjs`, `exec_node.mjs`, `exec_native.sh` | Bancadas de execução (Node.js e nativo) |
| `public/bench.html`, `public/load.html`, `server.mjs`, `precompress.mjs`, `run_chrome.py` | Bancadas no Chrome |
| `boundary.c`, `boundary.mjs` | Custo da fronteira JS↔Wasm |
| `analyze_e2r.py` | Análise estatística (mediana, IIQ, bootstrap, Cliff, Mann-Whitney, Holm) |
| `anatomy.json`, `e1b_timing.json` | Resultados brutos do E1-B |
| `exec_native.jsonl`, `exec_node.jsonl`, `exec_chrome.jsonl`, `load_chrome.jsonl`, `boundary.json` | Resultados brutos do E2-R (uma linha por repetição) |
| `e2r_summary.json` | Saída do `analyze_e2r.py` |
| `sha256.txt` | Hashes dos binários analisados |

## Como repetir

```bash
# 1) Binários do E1-B (versões fixadas)
npm i pdfjs-dist@6.2.108 playwright-core@1.63.0 @img/sharp-wasm32@0.35.4
mkdir -p corpus && N=node_modules
cp $N/pdfjs-dist/wasm/{qcms_bg,jbig2,openjpeg,quickjs-eval}.wasm corpus/
cp $N/playwright-core/lib/webp_codec.wasm corpus/
cp $N/@img/sharp-wasm32/lib/sharp-wasm32-0.35.4.node.wasm corpus/sharp-wasm32.wasm
sha256sum corpus/*            # conferir com sha256.txt
node anatomy.mjs corpus/*.wasm > anatomy.json
node e1b_timing.mjs corpus/*.wasm > e1b_timing.json

# 2) Compilação (clang com alvo wasm32 e wasm-ld instalados)
F="-ffp-contract=off -mbulk-memory -nostdlib -Wl,--no-entry"
clang --target=wasm32 -O3 $F -o nbody-wasm-o3.wasm nbody.c
clang --target=wasm32 -Oz $F -o nbody-wasm-oz.wasm nbody.c
clang --target=wasm32 -O3 -msimd128 $F -o nbody-wasm-o3-simd.wasm nbody.c
clang -O3 -ffp-contract=off -o nbody-native-clang nbody.c native_main.c -lm
gcc   -O3 -ffp-contract=off -o nbody-native-gcc   nbody.c native_main.c -lm
clang --target=wasm32 -O2 -nostdlib -Wl,--no-entry -Wl,--allow-undefined -o boundary.wasm boundary.c

# 3) Execução
./exec_native.sh 30 exec_native.jsonl
node exec_node.mjs 30 exec_node.jsonl
node boundary.mjs 30 > boundary.json

# 4) Chrome (Playwright: pip install playwright; ajuste executable_path em run_chrome.py)
mkdir -p public && cp nbody.mjs nbody-wasm-*.wasm corpus/webp_codec.wasm corpus/sharp-wasm32.wasm public/
node precompress.mjs
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 30 -subj "/CN=localhost"
node server.mjs &
python3 run_chrome.py exec 30
python3 run_chrome.py load 30

# 5) Análise
python3 analyze_e2r.py
```

Todas as implementações devem produzir a mesma soma de verificação (3.49414552970818 para N = 512 e 200 passos).
