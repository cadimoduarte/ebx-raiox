// Servidor local da demo: serve as aplicações, guarda um estado único e avisa as telas abertas.
// Sem dependências. Rode com: node server.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const ARQ = path.join(DIR, 'data', 'state.json');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

let estado = { rev: 0, dados: null };
try { estado = JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch { /* primeira execução */ }
const telas = new Set();

function gravar() { fs.mkdirSync(path.dirname(ARQ), { recursive: true }); fs.writeFileSync(ARQ, JSON.stringify(estado)); }
function avisar() { for (const r of telas) { r.write(`data: ${estado.rev}\n\n`); } }
function json(res, obj, status = 200) { res.writeHead(status, { 'content-type': TIPOS['.json'], 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); }
function enderecos() {
  const lista = [`http://localhost:${PORT}`];
  for (const redes of Object.values(os.networkInterfaces())) { for (const r of redes || []) { if (r.family === 'IPv4' && !r.internal) { lista.push(`http://${r.address}:${PORT}`); } } }
  return lista;
}
function arquivo(urlPath) {
  const p = decodeURIComponent(urlPath.split('?')[0]);
  const partes = p.split('/').filter(Boolean);
  const raiz = ['shared', 'exemplos', 'docs'].includes(partes[0]) ? DIR : path.join(DIR, 'apps');
  let alvo = path.normalize(path.join(raiz, ...partes));
  if (!alvo.startsWith(raiz)) { return null; }
  if (p.endsWith('/') || (fs.existsSync(alvo) && fs.statSync(alvo).isDirectory())) { alvo = path.join(alvo, 'index.html'); }
  return alvo;
}

http.createServer((req, res) => {
  const rota = req.url.split('?')[0];
  if (rota === '/api/state' && req.method === 'GET') { return json(res, estado); }
  if (rota === '/api/state' && req.method === 'PUT') {
    let corpo = '';
    req.on('data', (c) => { corpo += c; if (corpo.length > 5e6) { req.destroy(); } });
    req.on('end', () => {
      try { estado = { rev: estado.rev + 1, dados: JSON.parse(corpo).dados }; gravar(); avisar(); json(res, { rev: estado.rev }); }
      catch { json(res, { erro: 'corpo inválido' }, 400); }
    });
    return;
  }
  if (rota === '/api/info') { return json(res, { enderecos: enderecos() }); }
  if (rota === '/api/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    res.write(`data: ${estado.rev}\n\n`); telas.add(res); req.on('close', () => telas.delete(res)); return;
  }
  // A raiz leva ao painel pelo endereço dele, para que o app.js relativo do hub carregue.
  if (rota === '/') { res.writeHead(302, { location: '/hub/' + req.url.slice(1) }); return res.end(); }
  const alvo = arquivo(req.url);
  if (!alvo || !fs.existsSync(alvo)) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado'); }
  if (!rota.endsWith('/') && alvo.endsWith(path.join(path.basename(path.dirname(alvo)), 'index.html')) && !rota.endsWith('.html')) { res.writeHead(302, { location: rota + '/' }); return res.end(); }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(alvo)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(alvo).pipe(res);
}).listen(PORT, '0.0.0.0', () => {
  console.log('EBX Raio-X: demo no ar.');
  enderecos().forEach((e, i) => console.log(i ? `  Na mesma rede (celular): ${e}` : `  Neste computador:        ${e}`));
});
