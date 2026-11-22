// precompress.mjs — gera variantes .gz (gzip 9), .br (Brotli 11) e .zst (zstd 19) dos arquivos de public/
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import z from 'node:zlib';
const C = z.constants;
for (const f of readdirSync('public').filter(n => /\.(wasm|mjs)$/.test(n))) {
  const b = readFileSync('public/' + f);
  writeFileSync('public/' + f + '.gz', z.gzipSync(b, { level: 9 }));
  writeFileSync('public/' + f + '.br', z.brotliCompressSync(b, { params: { [C.BROTLI_PARAM_QUALITY]: 11, [C.BROTLI_PARAM_SIZE_HINT]: b.length } }));
  writeFileSync('public/' + f + '.zst', z.zstdCompressSync(b, { params: { [C.ZSTD_c_compressionLevel]: 19 } }));
}
