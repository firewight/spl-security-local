const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'public');
const submissions = path.join(__dirname, 'submissions.json');
const port = Number(process.env.PORT || 8080);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'POST' && url.pathname === '/api/enquiries') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 20000) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.name || !data.phone || !data.message) return send(res, 400, JSON.stringify({ error: 'Name, phone and message are required.' }), 'application/json');
        const current = fs.existsSync(submissions) ? JSON.parse(fs.readFileSync(submissions, 'utf8')) : [];
        current.push({ id: Date.now(), receivedAt: new Date().toISOString(), name: String(data.name).slice(0, 120), phone: String(data.phone).slice(0, 50), email: String(data.email || '').slice(0, 160), service: String(data.service || '').slice(0, 100), message: String(data.message).slice(0, 3000) });
        fs.writeFileSync(submissions, JSON.stringify(current, null, 2));
        send(res, 201, JSON.stringify({ ok: true }), 'application/json');
      } catch { send(res, 400, JSON.stringify({ error: 'Please check the form and try again.' }), 'application/json'); }
    });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  const pathname = url.pathname === '/' ? '/index.html' : path.normalize(url.pathname).replace(/^([.]{2}[\\/])+/, '');
  const filename = path.join(root, pathname);
  if (!filename.startsWith(root) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) return send(res, 404, 'Not found');
  const content = fs.readFileSync(filename);
  res.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
  res.end(req.method === 'HEAD' ? undefined : content);
}).listen(port, '0.0.0.0', () => console.log(`SPL local site is running on http://0.0.0.0:${port}`));
