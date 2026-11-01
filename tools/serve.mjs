import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 8137);
const withoutScripts = process.argv.includes('--no-js');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4','.xml':'application/xml; charset=utf-8'};
http.createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) {res.writeHead(403);res.end();return;}
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let bytes = await readFile(file);
    if (withoutScripts && path.extname(file) === '.html') bytes = Buffer.from(bytes.toString('utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
    const headers = {'Content-Type': types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      if (start > end || start >= bytes.length) {res.writeHead(416, {'Content-Range': `bytes */${bytes.length}`});res.end();return;}
      res.writeHead(206, {...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':end-start+1});
      res.end(req.method === 'HEAD' ? undefined : bytes.subarray(start,end+1));
      return;
    }
    res.writeHead(200, {...headers,'Content-Length':bytes.length});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
