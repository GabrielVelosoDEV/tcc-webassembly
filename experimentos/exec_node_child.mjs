// exec_node_child.mjs — uma repetição da bancada de execução no Node.js (processo novo a cada repetição)
import { readFileSync } from 'node:fs';
const [impl, N = '512', STEPS = '200'] = process.argv.slice(2);
const n = +N, steps = +STEPS, WARMUP = 5, RUNS = 10;
let run;
if (impl === 'js') { const m = await import('./nbody.mjs'); run = () => m.simulate(n, steps); }
else { const { instance } = await WebAssembly.instantiate(readFileSync(`nbody-${impl}.wasm`), {}); run = () => instance.exports.simulate(n, steps); }
const warm = []; let checksum = 0;
for (let i = 0; i < WARMUP; i++) { const a = performance.now(); checksum = run(); warm.push(+(performance.now() - a).toFixed(4)); }  // warm[0] = 1ª chamada (fria)
const exec = []; for (let i = 0; i < RUNS; i++) { const a = performance.now(); checksum = run(); exec.push(+(performance.now() - a).toFixed(4)); }
console.log(JSON.stringify({ env: 'node', impl, n, steps, checksum, warmup_ms: warm, exec_ms: exec }));
