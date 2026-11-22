// boundary.mjs — custo de cruzar a fronteira JS↔Wasm (Node.js/V8). Uso: node boundary.mjs [reps]
import { readFileSync } from 'node:fs';
const N = 10_000_000, REPS = +(process.argv[2] ?? 30);
const js_step = (s, i) => (Math.imul(s, 31) + i) | 0;
const { instance } = await WebAssembly.instantiate(readFileSync('boundary.wasm'), { env: { js_step } });
const { step, loop_internal, loop_import } = instance.exports;
const cases = {
  'js→js (referência)':  () => { let s = 0; for (let i = 0; i < N; i++) s = js_step(s, i); return s; },
  'wasm interno':        () => loop_internal(N),
  'js→wasm por passo':   () => { let s = 0; for (let i = 0; i < N; i++) s = step(s, i); return s; },
  'wasm→js por passo':   () => loop_import(N),
};
const ref = cases['js→js (referência)']();
for (const [k, f] of Object.entries(cases)) if (f() !== ref) throw new Error('resultado divergente em ' + k);
for (let w = 0; w < 3; w++) for (const f of Object.values(cases)) f();          // aquecimento
const out = Object.fromEntries(Object.keys(cases).map(k => [k, []]));
for (let r = 0; r < REPS; r++) for (const [k, f] of Object.entries(cases)) { const a = performance.now(); f(); out[k].push(performance.now() - a); }
const med = a => [...a].sort((x, y) => x - y)[a.length >> 1];
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
console.log(JSON.stringify({ node: process.version, N, REPS, checksum: ref, results: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { med_ms: +med(v).toFixed(3), q1: +q(v, .25).toFixed(3), q3: +q(v, .75).toFixed(3), ns_per_step: +(med(v) * 1e6 / N).toFixed(3) }])) }, null, 1));
