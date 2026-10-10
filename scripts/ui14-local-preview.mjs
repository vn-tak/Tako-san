import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createServer as createViteServer } from 'vite';
import { isolatedPreviewHtml } from './isolated-preview-html.mjs';
import {
  createPreviewCache,
  createPreviewControls,
  seedPlannerPreview,
} from './planner-preview-fixtures.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));
const root = await realpath(resolve(repo, process.env.UI14_BUILD_ROOT ?? 'dist/client'));
const port = Number(process.env.UI14_PORT ?? 5216);
const origin = `http://127.0.0.1:${port}`;
const vite = await createViteServer({
  root: repo,
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    {
      name: 'ui14-isolated-email',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'cloudflare:email') return '\0ui14-isolated-email';
      },
      load(id) {
        if (id === '\0ui14-isolated-email') return 'export class EmailMessage {}';
      },
    },
  ],
  server: { middlewareMode: true },
});
const { SqliteD1 } = await vite.ssrLoadModule('/tests/helpers/sqlite-d1.ts');
const { default: worker } = await vite.ssrLoadModule('/src/worker/index.ts');
let db = new SqliteD1();
seedPlannerPreview(db);
const env = {
  DB: db,
  CACHE: createPreviewCache(),
  ENVIRONMENT: 'development',
  APP_URL: origin,
  JWT_SECRET: 'isolated-local-preview-jwt-secret-no-production-use',
  OTP_HASH_SECRET: 'isolated-local-preview-otp-secret-no-production-use',
  AI_MOCK_MODE: 'true',
  SCAN_QUEUE_MODE: 'sync',
  MEAL_PLANNER_ENABLED: 'false',
  MEAL_COMPOSITION_V2_ENABLED: 'false',
};
const controls = createPreviewControls({
  getDatabase: () => db,
  resetDatabase: () => {
    const fresh = new SqliteD1();
    seedPlannerPreview(fresh);
    const previous = db;
    db = fresh;
    env.DB = fresh;
    env.CACHE = createPreviewCache();
    previous.close();
  },
});
globalThis.fetch = async () => {
  throw new Error('External network disabled in UI14 isolated Worker');
};
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};
const cache = new Map();
let queue = Promise.resolve();
const server = createServer((request, response) => {
  queue = queue.then(async () => {
    try {
      const url = new URL(request.url, origin);
      if (url.pathname === '/__preview/ready' && request.method === 'GET') {
        response.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        response.end(
          '<!doctype html><html lang=vi><title>Local fixture ready</title><p>Cookie session ready for local browser measurement.</p></html>',
        );
        return;
      }
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/__preview')) {
        const parts = [];
        for await (const chunk of request) parts.push(chunk);
        const req = new Request(url, {
          method: request.method,
          headers: request.headers,
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : Buffer.concat(parts),
        });
        const result =
          (await controls(req)) ||
          (await worker.fetch(req, env, {
            waitUntil(p) {
              p.catch(console.error);
            },
            passThroughOnException() {},
          }));
        response.writeHead(result.status, Object.fromEntries(result.headers));
        response.end(Buffer.from(await result.arrayBuffer()));
        return;
      }
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405);
        response.end();
        return;
      }
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.includes('\0') || pathname.includes('\\')) {
        response.writeHead(400);
        response.end();
        return;
      }
      if (!extname(pathname)) pathname = '/index.html';
      if (!cache.has(pathname)) {
        const path = await realpath(resolve(root, '.' + pathname));
        if (!path.startsWith(root + '/')) {
          response.writeHead(404);
          response.end();
          return;
        }
        const original = await readFile(path);
        const bytes =
          pathname === '/index.html'
            ? Buffer.from(isolatedPreviewHtml(original.toString()))
            : original;
        const type = types[extname(pathname)] ?? 'application/octet-stream';
        cache.set(pathname, { bytes, gzip: gzipSync(bytes), type });
      }
      const item = cache.get(pathname);
      const compressed =
        /\bgzip\b/.test(request.headers['accept-encoding'] ?? '') &&
        /javascript|css|html|json|svg/.test(item.type);
      const bytes = compressed ? item.gzip : item.bytes;
      response.writeHead(200, {
        'Content-Type': item.type,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': pathname.startsWith('/assets/')
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
        'Content-Length': bytes.length,
        Vary: 'Accept-Encoding',
        ...(compressed ? { 'Content-Encoding': 'gzip' } : {}),
      });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch (error) {
      if (error.code === 'ENOENT') {
        response.writeHead(404);
        response.end('Not found');
      } else {
        console.error(error);
        response.writeHead(500);
        response.end('Isolated preview error');
      }
    }
  });
});
await new Promise((ok, fail) => {
  server.once('error', fail);
  server.listen(port, '127.0.0.1', ok);
});
console.log(
  `UI14 production-build preview ${origin}; gzip/cache local policy, synthetic SQLite, external Worker fetch blocked; ${root}`,
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, async () => {
    await new Promise((ok) => server.close(ok));
    await vite.close();
    db.close();
  });
