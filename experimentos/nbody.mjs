// nbody.mjs — porte JavaScript fiel de nbody.c (mesma ordem de operações e mesmo gerador)
const MAXN = 4096;
const px = new Float64Array(MAXN), py = new Float64Array(MAXN), pz = new Float64Array(MAXN);
const vx = new Float64Array(MAXN), vy = new Float64Array(MAXN), vz = new Float64Array(MAXN);
const m = new Float64Array(MAXN);
let seed = 0;
function rnd() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) / 16777216; }

export function simulate(n, steps) {
  if (n > MAXN) n = MAXN;
  seed = 42;
  for (let i = 0; i < n; i++) {
    px[i] = rnd() * 2 - 1; py[i] = rnd() * 2 - 1; pz[i] = rnd() * 2 - 1;
    vx[i] = vy[i] = vz[i] = 0; m[i] = 0.5 + rnd();
  }
  const dt = 1e-3, eps2 = 1e-4;
  for (let s = 0; s < steps; s++) {
    for (let i = 0; i < n; i++) {
      let ax = 0, ay = 0, az = 0;
      for (let j = 0; j < n; j++) {
        const dx = px[j] - px[i], dy = py[j] - py[i], dz = pz[j] - pz[i];
        const d2 = dx * dx + dy * dy + dz * dz + eps2;
        const inv = 1.0 / (d2 * Math.sqrt(d2));
        ax += m[j] * dx * inv; ay += m[j] * dy * inv; az += m[j] * dz * inv;
      }
      vx[i] += ax * dt; vy[i] += ay * dt; vz[i] += az * dt;
    }
    for (let i = 0; i < n; i++) { px[i] += vx[i] * dt; py[i] += vy[i] * dt; pz[i] += vz[i] * dt; }
  }
  let c = 0;
  for (let i = 0; i < n; i++) c += px[i] + py[i] + pz[i];
  return c;
}
