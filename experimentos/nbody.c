#if defined(__wasm__) && !defined(__EMSCRIPTEN__)
#define sqrt __builtin_sqrt                 /* clang puro, sem libc: vira a instrução f64.sqrt */
#define EXPORT __attribute__((export_name("simulate")))
#elif defined(__EMSCRIPTEN__)
#include <math.h>
#include <emscripten/emscripten.h>
#define EXPORT EMSCRIPTEN_KEEPALIVE
#else
#include <math.h>
#define EXPORT
#endif
#define MAXN 4096
static double px[MAXN], py[MAXN], pz[MAXN], vx[MAXN], vy[MAXN], vz[MAXN], m[MAXN];
static unsigned int seed;
static double rnd(void) { seed = seed * 1664525u + 1013904223u; return (seed >> 8) / 16777216.0; }

EXPORT
double simulate(int n, int steps) {
  if (n > MAXN) n = MAXN;
  seed = 42u;
  for (int i = 0; i < n; i++) {
    px[i] = rnd() * 2 - 1; py[i] = rnd() * 2 - 1; pz[i] = rnd() * 2 - 1;
    vx[i] = vy[i] = vz[i] = 0; m[i] = 0.5 + rnd();
  }
  const double dt = 1e-3, eps2 = 1e-4;
  for (int s = 0; s < steps; s++) {
    for (int i = 0; i < n; i++) {
      double ax = 0, ay = 0, az = 0;
      for (int j = 0; j < n; j++) {
        double dx = px[j] - px[i], dy = py[j] - py[i], dz = pz[j] - pz[i];
        double d2 = dx * dx + dy * dy + dz * dz + eps2;
        double inv = 1.0 / (d2 * sqrt(d2));
        ax += m[j] * dx * inv; ay += m[j] * dy * inv; az += m[j] * dz * inv;
      }
      vx[i] += ax * dt; vy[i] += ay * dt; vz[i] += az * dt;
    }
    for (int i = 0; i < n; i++) { px[i] += vx[i] * dt; py[i] += vy[i] * dt; pz[i] += vz[i] * dt; }
  }
  double c = 0;
  for (int i = 0; i < n; i++) c += px[i] + py[i] + pz[i];
  return c;
}
