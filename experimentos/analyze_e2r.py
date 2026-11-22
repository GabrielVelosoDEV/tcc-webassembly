"""analyze_e2r.py — análise do E2-R (execução reduzida do protocolo E2).
Lê exec_native.jsonl, exec_node.jsonl, exec_chrome.jsonl e load_chrome.jsonl (se existirem)
e grava e2r_summary.json. Mesmo plano estatístico do analyze.py do Apêndice A.
"""
import json, os
import numpy as np
from scipy.stats import mannwhitneyu

rng = np.random.default_rng(2026)

def jl(p):
    return [json.loads(l) for l in open(p)] if os.path.exists(p) else []

def boot_ci_ratio(a, b, n=10_000):
    a, b = np.asarray(a), np.asarray(b)
    ra = np.median(rng.choice(a, (n, a.size)), axis=1); rb = np.median(rng.choice(b, (n, b.size)), axis=1)
    return [float(x) for x in np.quantile(ra / rb, [0.025, 0.975])]

def cliffs(a, b):
    a, b = np.asarray(a)[:, None], np.asarray(b)[None, :]
    return float((a > b).mean() - (a < b).mean())

def holm(p):
    p = np.asarray(p); o = np.argsort(p); m = len(p); adj = np.empty(m); run = 0.0
    for k, i in enumerate(o):
        run = max(run, min(1.0, (m - k) * p[i])); adj[i] = run
    return adj.tolist()

def desc(x):
    x = np.asarray(x, float)
    return dict(n=int(x.size), med=float(np.median(x)), q1=float(np.quantile(x, .25)), q3=float(np.quantile(x, .75)),
                p95=float(np.quantile(x, .95)), min=float(x.min()), max=float(x.max()))

out = {}
# ---------------- Execução: uma observação por repetição = mediana das 10 medições (evita pseudorreplicação)
rows = jl('exec_native.jsonl') + jl('exec_node.jsonl') + jl('exec_chrome.jsonl')
checks = {r['checksum'] for r in rows}
out['checksums'] = sorted(checks)
cells = {}
for r in rows:
    key = f"{r['env']}|{r['impl']}"
    c = cells.setdefault(key, {'exec': [], 'first': [], 'warm_rest': []})
    c['exec'].append(float(np.median(r['exec_ms'])))
    c['first'].append(r['warmup_ms'][0])
    c['warm_rest'].append(float(np.median(r['warmup_ms'][1:])))
out['exec'] = {k: {'exec': desc(v['exec']), 'first': desc(v['first']), 'first_over_exec_med': float(np.median(np.asarray(v['first']) / np.asarray(v['exec'])))} for k, v in cells.items()}

# comparações: em cada ambiente web, JS vs cada Wasm; e cada Wasm/JS vs nativo-clang
comps = []
for env in ['node', 'chrome']:
    js = cells.get(f'{env}|js')
    if not js: continue
    for impl in ['wasm-o3', 'wasm-oz', 'wasm-o3-simd']:
        w = cells.get(f'{env}|{impl}')
        if not w: continue
        u, p = mannwhitneyu(js['exec'], w['exec'], alternative='two-sided')
        comps.append(dict(env=env, comp=f'js/{impl}', ratio=float(np.median(js['exec']) / np.median(w['exec'])),
                          ci=boot_ci_ratio(js['exec'], w['exec']), cliffs=cliffs(js['exec'], w['exec']), p=float(p)))
    # o3-simd vs o3 e oz vs o3
    for a_, b_ in [('wasm-oz', 'wasm-o3'), ('wasm-o3-simd', 'wasm-o3')]:
        a, b = cells.get(f'{env}|{a_}'), cells.get(f'{env}|{b_}')
        if a and b:
            u, p = mannwhitneyu(a['exec'], b['exec'], alternative='two-sided')
            comps.append(dict(env=env, comp=f'{a_}/{b_}', ratio=float(np.median(a['exec']) / np.median(b['exec'])),
                              ci=boot_ci_ratio(a['exec'], b['exec']), cliffs=cliffs(a['exec'], b['exec']), p=float(p)))
nat = cells.get('native|native-clang')
if nat:
    for k, v in cells.items():
        if k.startswith('native'): continue
        u, p = mannwhitneyu(v['exec'], nat['exec'], alternative='two-sided')
        comps.append(dict(env=k.split('|')[0], comp=f"{k.split('|')[1]}/native-clang", ratio=float(np.median(v['exec']) / np.median(nat['exec'])),
                          ci=boot_ci_ratio(v['exec'], nat['exec']), cliffs=cliffs(v['exec'], nat['exec']), p=float(p)))
    g = cells.get('native|native-gcc')
    if g:
        u, p = mannwhitneyu(g['exec'], nat['exec'], alternative='two-sided')
        comps.append(dict(env='native', comp='native-gcc/native-clang', ratio=float(np.median(g['exec']) / np.median(nat['exec'])),
                          ci=boot_ci_ratio(g['exec'], nat['exec']), cliffs=cliffs(g['exec'], nat['exec']), p=float(p)))
if comps:
    adj = holm([c['p'] for c in comps])
    for c, a in zip(comps, adj): c['p_holm'] = a
out['exec_comps'] = comps

# ---------------- Carregamento no Chrome
L = jl('load_chrome.jsonl')
out['load_errors'] = [r for r in L if r.get('err')]
lc = {}
for r in L:
    if r.get('err'): continue
    k = f"{r['file']}|{r['enc']}|{r['net']}"
    c = lc.setdefault(k, {f: [] for f in ['ready_ms', 'transfer_ms', 'compile_residual_ms', 'ttfb_ms']} | {'transfer_size': [], 'encoded': [], 'decoded': []})
    for f in c: c[f].append(r[f])
out['load'] = {k: {f: desc(v) for f, v in c.items()} for k, c in lc.items()}
lcomps = []
for k, c in lc.items():
    f, enc, net = k.split('|')
    if enc == 'identity': continue
    ref = lc.get(f'{f}|identity|{net}')
    if not ref: continue
    u, p = mannwhitneyu(ref['ready_ms'], c['ready_ms'], alternative='two-sided')
    lcomps.append(dict(file=f, net=net, comp=f'identity/{enc}', ratio=float(np.median(ref['ready_ms']) / np.median(c['ready_ms'])),
                       ci=boot_ci_ratio(ref['ready_ms'], c['ready_ms']), cliffs=cliffs(ref['ready_ms'], c['ready_ms']), p=float(p)))
if lcomps:
    adj = holm([c['p'] for c in lcomps])
    for c, a in zip(lcomps, adj): c['p_holm'] = a
out['load_comps'] = lcomps
json.dump(out, open('e2r_summary.json', 'w'), indent=1, ensure_ascii=False)
for k, v in out['exec'].items():
    print(f"{k:28s} exec med {v['exec']['med']:8.2f} [{v['exec']['q1']:.2f}-{v['exec']['q3']:.2f}] n={v['exec']['n']}  first med {v['first']['med']:8.2f}  first/exec {v['first_over_exec_med']:.2f}")
for c in comps:
    print(f"{c['env']:7s} {c['comp']:28s} ratio {c['ratio']:.3f} CI [{c['ci'][0]:.3f},{c['ci'][1]:.3f}] cliff {c['cliffs']:+.2f} p_holm {c.get('p_holm', c['p']):.2e}")
print('checksums', out['checksums'])
