// server.mjs — servidor HTTPS local do E2-R: escolhe a codificação pelo parâmetro ?enc=
import { createServer } from 'node:https';
import { readFileSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
const ROOT = join(process.cwd(), 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.wasm': 'application/wasm' };
const SUFFIX = { identity: '', gzip: '.gz', br: '.br', zstd: '.zst' };
createServer({ key: readFileSync('key.pem'), cert: readFileSync('cert.pem') }, (req, res) => {
  const url = new URL(req.url, 'https://localhost');
  const rel = normalize(url.pathname === '/' ? '/bench.html' : url.pathname);
  const file = join(ROOT, rel);
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  const ext = extname(file);
  let enc = url.searchParams.get('enc') ?? 'identity';
  if (!(enc in SUFFIX) || ext === '.html') enc = 'identity';
  const accepted = req.headers['accept-encoding'] ?? '';
  if (enc !== 'identity' && !accepted.split(',').map(s => s.trim().split(';')[0]).includes(enc)) {
    res.writeHead(406, { 'Content-Type': 'text/plain' }); return res.end(`codificação ${enc} não aceita: ${accepted}`);
  }
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'Vary': 'Accept-Encoding', 'Timing-Allow-Origin': '*' };
  if (enc !== 'identity') headers['Content-Encoding'] = enc;
  res.writeHead(200, headers);
  res.end(readFileSync(file + SUFFIX[enc]));
}).listen(8443, () => console.log('https://localhost:8443'));
