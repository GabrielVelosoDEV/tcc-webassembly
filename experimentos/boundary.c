/* boundary.c — microbenchmark do custo da fronteira JS↔Wasm (E2-R, parte D) */
#define EXPORT(n) __attribute__((export_name(n)))
__attribute__((import_module("env"), import_name("js_step"))) int js_step(int s, int i);

/* um passo trivial de "trabalho": impede que o compilador elimine o laço */
__attribute__((noinline)) static int step(int s, int i) { return s * 31 + i; }

EXPORT("step") int step_export(int s, int i) { return s * 31 + i; }               /* chamado do JS a cada passo */
EXPORT("loop_internal") int loop_internal(int n) { int s = 0; for (int i = 0; i < n; i++) s = step(s, i); return s; }   /* sem cruzar a fronteira */
EXPORT("loop_import") int loop_import(int n) { int s = 0; for (int i = 0; i < n; i++) s = js_step(s, i); return s; }     /* Wasm → JS a cada passo */
