// anatomy.mjs — decompõe binários Wasm em seções e mede a compressibilidade de cada uma
// Uso: node anatomy.mjs arq1.wasm arq2.wasm ...   (saída JSON)
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import zlib from 'node:zlib';
const C = zlib.constants;
const NAMES = ['custom','type','import','function','table','memory','global','export','start','element','code','data','datacount','tag'];
function leb(buf, p) { let r = 0, s = 0, b; do { b = buf[p++]; r |= (b & 0x7f) << s; s += 7; } while (b & 0x80); return [r >>> 0, p]; }
function str(buf, p) { let n; [n, p] = leb(buf, p); return [buf.subarray(p, p + n).toString('utf8'), p + n]; }
const br11 = b => b.length ? zlib.brotliCompressSync(b, { params: { [C.BROTLI_PARAM_QUALITY]: 11, [C.BROTLI_PARAM_SIZE_HINT]: b.length } }).length : 0;
const out = [];
for (const f of process.argv.slice(2)) {
  const buf = readFileSync(f);
  if (buf.readUInt32BE(0) !== 0x0061736d) throw new Error(f + ': não é Wasm');
  let p = 8; const groups = {}; const customs = []; let nFuncs = 0, nImports = 0, nImportFuncs = 0, nExports = 0, producers = null, dataSegs = 0;
  while (p < buf.length) {
    const id = buf[p++]; let size; [size, p] = leb(buf, p);
    const start = p, end = p + size, body = buf.subarray(start, end);
    let key = NAMES[id] ?? 'id' + id;
    if (id === 0) {
      const [name] = str(buf, start); customs.push({ name, bytes: size });
      key = name === 'name' ? 'custom:name' : (name.startsWith('.debug') ? 'custom:debug' : 'custom:outros');
      if (name === 'producers') { let q = start; [, q] = str(buf, q); let nf; [nf, q] = leb(buf, q); producers = {};
        for (let i = 0; i < nf; i++) { let fname, nv; [fname, q] = str(buf, q); [nv, q] = leb(buf, q); producers[fname] = [];
          for (let k = 0; k < nv; k++) { let a, b; [a, q] = str(buf, q); [b, q] = str(buf, q); producers[fname].push(a + (b ? ' ' + b : '')); } } }
    }
    if (id === 2) { let q = start, n; [n, q] = leb(buf, q); nImports = n;
      for (let i = 0; i < n; i++) { [, q] = str(buf, q); [, q] = str(buf, q); const kind = buf[q++];
        if (kind === 0) { nImportFuncs++; [, q] = leb(buf, q); }
        else if (kind === 1) { q++; const fl = buf[q++]; [, q] = leb(buf, q); if (fl & 1) [, q] = leb(buf, q); }
        else if (kind === 2) { const fl = buf[q++]; [, q] = leb(buf, q); if (fl & 1) [, q] = leb(buf, q); }
        else if (kind === 3) { q += 2; } else if (kind === 4) { q++; [, q] = leb(buf, q); } } }
    if (id === 3) [nFuncs] = leb(buf, start);
    if (id === 7) [nExports] = leb(buf, start);
    if (id === 11) [dataSegs] = leb(buf, start);
    groups[key] ??= []; groups[key].push(body);
    p = end;
  }
  const sections = {};
  for (const [k, parts] of Object.entries(groups)) { const b = Buffer.concat(parts); sections[k] = { bytes: b.length, br11: br11(b) }; }
  out.push({ file: basename(f), bytes: buf.length, funcs: nFuncs, imports: nImports, import_funcs: nImportFuncs, exports: nExports, data_segments: dataSegs, producers, customs, sections });
}
console.log(JSON.stringify(out, null, 1));
