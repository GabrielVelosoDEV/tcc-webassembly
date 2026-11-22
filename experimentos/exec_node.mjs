// exec_node.mjs — 30 repetições × 4 implementações, ordem embaralhada a cada repetição
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
const IMPLS = ['js', 'wasm-o3', 'wasm-oz', 'wasm-o3-simd'], REPS = +(process.argv[2] ?? 30), OUT = process.argv[3] ?? 'exec_node.jsonl';
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
for (let rep = 0; rep < REPS; rep++) for (const impl of shuffle([...IMPLS])) {
  const r = JSON.parse(execFileSync(process.execPath, ['exec_node_child.mjs', impl], { encoding: 'utf8' }));
  appendFileSync(OUT, JSON.stringify({ ...r, rep }) + '\n');
}
