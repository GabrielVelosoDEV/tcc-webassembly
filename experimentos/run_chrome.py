"""run_chrome.py — coleta do E2-R no Chrome headless via Playwright.
Uso: python3 run_chrome.py exec 30   |   python3 run_chrome.py load 30
"""
import asyncio, json, random, sys
from playwright.async_api import async_playwright

MODE, REPS = sys.argv[1], int(sys.argv[2])
BASE = 'https://localhost:8443'
NETS = {'rapida': None, 'movel': {'offline': False, 'latency': 150, 'downloadThroughput': 5e6 / 8, 'uploadThroughput': 1e6 / 8}}
IMPLS = ['js', 'wasm-o3', 'wasm-oz', 'wasm-o3-simd']
FILES = ['nbody-wasm-o3.wasm', 'webp_codec.wasm', 'sharp-wasm32.wasm']
ENCS = ['identity', 'gzip', 'br', 'zstd']

async def one(browser, url, net):
    ctx = await browser.new_context(ignore_https_errors=True)       # contexto limpo por repetição
    page = await ctx.new_page()
    if NETS[net]:
        cdp = await ctx.new_cdp_session(page)
        await cdp.send('Network.enable')
        await cdp.send('Network.emulateNetworkConditions', NETS[net])
    await page.goto(url)
    h = await page.wait_for_function('() => window.__RESULT__', timeout=300_000)
    r = await h.json_value()
    await ctx.close()
    return r

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        out = open(f'{MODE}_chrome.jsonl', 'a')
        for rep in range(REPS):
            if MODE == 'exec':
                cells = [(i, 'rapida') for i in IMPLS]
            else:
                cells = [(f, e, n) for f in FILES for e in ENCS for n in NETS]
            random.shuffle(cells)                                    # ordem aleatória a cada repetição
            for c in cells:
                if MODE == 'exec':
                    r = await one(browser, f'{BASE}/bench.html?impl={c[0]}', 'rapida'); r.update(net='rapida')
                else:
                    r = await one(browser, f'{BASE}/load.html?file={c[0]}&enc={c[1]}', c[2]); r.update(net=c[2])
                r['rep'] = rep
                out.write(json.dumps(r) + '\n'); out.flush()
            print('rep', rep, flush=True)
        print('ua', (await (await browser.new_page()).evaluate('navigator.userAgent')))
        await browser.close()
asyncio.run(main())
