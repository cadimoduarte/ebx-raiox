// Servidor local da demo: serve as aplicações, guarda um estado único e avisa as telas abertas.
// Sem dependências. Rode com: node server.mjs
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const ARQ = path.join(DIR, 'data', 'state.json');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.md': 'text/markdown; charset=utf-8' };

let estado = { rev: 0, dados: null };
try { estado = JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch { /* primeira execução */ }
const telas = new Set();

// Acesso: uma credencial fixa, conferida só aqui. O código guarda o resumo (scrypt), não a senha,
// e nada disso vai para o HTML. LOGIN_HASH troca a credencial sem mexer no código.
const LOGIN_HASH = Buffer.from(process.env.LOGIN_HASH || '1c5d2618c4cacba50fd0a5655d4fd08cf45b91e45957bb1a0c941f1e7bbfd058', 'hex');
const COOKIE = 'rx_sessao';
const sessoes = new Set(); // em memória: reiniciar o servidor pede login de novo
const LIVRES = ['/login', '/login/', '/login/app.js', '/api/login', '/shared/ebx.css', '/shared/tema.js']; // lista exata: nada de prefixos
function confere(email, senha) {
  const h = crypto.scryptSync(String(senha), 'rx:' + String(email).trim().toLowerCase(), 32);
  return h.length === LOGIN_HASH.length && crypto.timingSafeEqual(h, LOGIN_HASH);
}
function logado(req) {
  const m = new RegExp('(?:^|; *)' + COOKIE + '=([a-f0-9]+)').exec(req.headers.cookie || '');
  return !!m && sessoes.has(m[1]);
}
function cookie(valor, segundos) {
  return `${COOKIE}=${valor}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${segundos}` + (process.env.RENDER ? '; Secure' : '');
}
// Só caminhos internos, para o login não virar redirecionador para outros sites.
function destino(ir) { return typeof ir === 'string' && /^\/[^/\\]/.test(ir) ? ir : '/hub/'; }

function gravar() { fs.mkdirSync(path.dirname(ARQ), { recursive: true }); fs.writeFileSync(ARQ, JSON.stringify(estado)); }
function avisar() { for (const r of telas) { r.write(`data: ${estado.rev}\n\n`); } }
function json(res, obj, status = 200) { res.writeHead(status, { 'content-type': TIPOS['.json'], 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); }
function enderecos() {
  // Publicado no Render, o endereço é o público; não há "mesma rede" para mostrar.
  if (process.env.RENDER_EXTERNAL_URL) { return [process.env.RENDER_EXTERNAL_URL]; }
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
  if (rota === '/api/login' && req.method === 'POST') {
    let corpo = '';
    req.on('data', (c) => { corpo += c; if (corpo.length > 1e4) { req.destroy(); } });
    req.on('end', () => {
      let j = {};
      try { j = JSON.parse(corpo) || {}; } catch { /* trata como credencial errada */ }
      // A espera fixa encarece a tentativa e erro.
      setTimeout(() => {
        if (!confere(j.email || '', j.senha || '')) { return json(res, { erro: 'E-mail ou senha incorretos.' }, 401); }
        const id = crypto.randomBytes(24).toString('hex'); sessoes.add(id);
        res.setHeader('set-cookie', cookie(id, 60 * 60 * 12)); json(res, { ir: destino(j.ir) });
      }, 400);
    });
    return;
  }
  if (rota === '/sair') {
    const m = new RegExp(COOKIE + '=([a-f0-9]+)').exec(req.headers.cookie || ''); if (m) { sessoes.delete(m[1]); }
    res.writeHead(302, { location: '/login/', 'set-cookie': cookie('', 0) }); return res.end();
  }
  if (!LIVRES.includes(rota) && !logado(req)) {
    if (rota.startsWith('/api/')) { return json(res, { erro: 'sem sessão' }, 401); }
    res.writeHead(302, { location: '/login/?ir=' + encodeURIComponent(req.url) }); return res.end();
  }
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
