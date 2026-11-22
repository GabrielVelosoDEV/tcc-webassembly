// e1b_timing.mjs — E1-B: tamanho, tempo de compressão e tempo de descompressão (Node.js zlib)
// Uso: node e1b_timing.mjs arq1.wasm ...   (saída JSON)
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import zlib from 'node:zlib';
const C = zlib.constants;
const codecs = {
  'gzip-6':  [b => zlib.gzipSync(b, { level: 6 }), b => zlib.gunzipSync(b)],
  'gzip-9':  [b => zlib.gzipSync(b, { level: 9 }), b => zlib.gunzipSync(b)],
  'br-5':    [b => zlib.brotliCompressSync(b, { params: { [C.BROTLI_PARAM_QUALITY]: 5,  [C.BROTLI_PARAM_SIZE_HINT]: b.length } }), b => zlib.brotliDecompressSync(b)],
  'br-11':   [b => zlib.brotliCompressSync(b, { params: { [C.BROTLI_PARAM_QUALITY]: 11, [C.BROTLI_PARAM_SIZE_HINT]: b.length } }), b => zlib.brotliDecompressSync(b)],
  'zstd-3':  [b => zlib.zstdCompressSync(b, { params: { [C.ZSTD_c_compressionLevel]: 3 } }),  b => zlib.zstdDecompressSync(b)],
  'zstd-19': [b => zlib.zstdCompressSync(b, { params: { [C.ZSTD_c_compressionLevel]: 19 } }), b => zlib.zstdDecompressSync(b)],
};
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const ns = () => Number(process.hrtime.bigint()) / 1e6;
const rows = [];
for (const f of process.argv.slice(2)) {
  const buf = readFileSync(f); const row = { file: basename(f), bytes: buf.length };
  for (const [name, [comp, dec]] of Object.entries(codecs)) {
    const slow = buf.length > 2e6 && /11|19/.test(name);
    const reps = slow ? 3 : 5; const tc = []; let out;
    for (let i = 0; i < reps; i++) { const a = ns(); out = comp(buf); tc.push(ns() - a); }
    for (let i = 0; i < 3; i++) dec(out);                     // aquecimento
    const td = [];
    for (let i = 0; i < 21; i++) { const a = ns(); const d = dec(out); td.push(ns() - a); if (d.length !== buf.length) throw new Error('falha na verificação'); }
    row[name] = { bytes: out.length, comp_ms: +med(tc).toFixed(3), decomp_ms: +med(td).toFixed(3) };
  }
  rows.push(row); process.stderr.write('ok ' + row.file + '\n');
}
console.log(JSON.stringify({ node: process.version, zlib: process.versions.zlib, brotli: process.versions.brotli, zstd: process.versions.zstd, cpu: (await import('node:os')).cpus()[0].model, rows }, null, 1));
