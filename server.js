const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.md': 'text/markdown; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8'
};

function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<h1>404 Not Found</h1><p>El archivo <code>${req.url}</code> no existe.</p><a href="/">Volver al Dashboard</a>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(urlObj.pathname);

  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent path traversal
  const safePath = path.normalize(path.join(BASE_DIR, pathname));
  if (!safePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Prohibido');
    return;
  }

  serveFile(req, res, safePath);
});

function startServer(port, maxAttempts = 10) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  🌾 AgroSmart IoT - Servidor Web Activo 💧`);
    console.log(`  Local:            http://localhost:${port}`);
    console.log(`  Manual Usuario:   http://localhost:${port}/manual-usuario.html`);
    console.log(`  Directorio raíz:  ${BASE_DIR}`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.warn(`Puerto ${port} ocupado, intentando en el puerto ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error('Error al iniciar el servidor:', err);
    }
  });
}

startServer(DEFAULT_PORT);
