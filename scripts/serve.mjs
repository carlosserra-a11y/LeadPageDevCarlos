// Servidor local sem cache para testar o site: `npm start` → http://localhost:5173
// Sem dependências. Só serve arquivos da pasta do projeto (bloqueia "../").
// Também responde em /LeadPageDevCarlos/ para imitar o endereço do GitHub Pages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 5173;
const BASE = '/LeadPageDevCarlos';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function resolveFile(urlPath) {
  let path = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (path === BASE || path.startsWith(`${BASE}/`)) path = path.slice(BASE.length) || '/';
  const clean = normalize(path).replace(/^([/\\])+/, '');
  const target = resolve(join(ROOT, clean));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null;
  try {
    const info = await stat(target);
    return info.isDirectory() ? join(target, 'index.html') : target;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  try {
    const file = await resolveFile(req.url || '/');
    const body = await readFile(file ?? join(ROOT, '404.html'));
    const type = TYPES[extname(file ?? '.html')] || 'application/octet-stream';
    res.writeHead(file ? 200 : 404, { ...headers, 'Content-Type': type });
    res.end(body);
  } catch (error) {
    res.writeHead(500, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro ao ler o arquivo.');
    console.error('[serve]', error.message);
  }
}).listen(PORT, () => {
  console.log(`Site em http://localhost:${PORT}${BASE}/`);
});
