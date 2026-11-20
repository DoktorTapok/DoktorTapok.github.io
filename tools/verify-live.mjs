import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicOrigin = 'https://doktortapok.github.io';
const origin = new URL(process.argv[2] || publicOrigin).origin;
const publicCheck = origin === publicOrigin;
for (const [url, file, type] of [['/','index.html','text/html'],['/en/','en/index.html','text/html'],['/assets/site.css','assets/site.css','text/css'],['/assets/site.js','assets/site.js','application/javascript'],['/app-ads.txt','app-ads.txt','text/plain'],['/robots.txt','robots.txt','text/plain'],['/sitemap.xml','sitemap.xml','xml']]) {
  const response = await fetch(origin + url, {headers:{'Cache-Control':'no-cache'}, redirect:'manual', signal:AbortSignal.timeout(30000)});
  assert.equal(response.status, 200, `${url} must be publicly available.`);
  assert(!response.redirected, `${url} must not redirect to login or a challenge.`);
  const mime = response.headers.get('content-type') || '';
  assert(mime.includes(type) || (type === 'application/javascript' && mime.includes('text/javascript')), `Unexpected MIME type for ${url}: ${mime}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.equals(await readFile(path.join(root,'dist',file))), `Published ${url} differs from this checkout.`);
  console.log(`PASS ${url}: HTTP 200, ${mime}, exact local bytes (${bytes.length}).`);
  if (url === '/app-ads.txt') console.log(`SHA-256 ${createHash('sha256').update(bytes).digest('hex')}`);
}
for (const url of ['/README.md','/tools/build.mjs']) {
  const response = await fetch(origin + url, {signal:AbortSignal.timeout(30000)});
  assert.equal(response.status,404,`Source file ${url} must not be deployed.`);
  console.log(`PASS ${url}: not deployed (HTTP 404).`);
}
if (publicCheck) {
  const http = await fetch(origin.replace('https:', 'http:') + '/app-ads.txt',{redirect:'manual',signal:AbortSignal.timeout(30000)});
  assert([301,302,307,308].includes(http.status));
  assert.equal(http.headers.get('location'),origin + '/app-ads.txt');
  console.log('PASS HTTP redirects to HTTPS.');
}
const media = JSON.parse(await readFile(path.join(root, 'media-sources.json'), 'utf8'))[0];
const trailer = await fetch(origin + '/' + media.file, {signal:AbortSignal.timeout(60000)});
assert.equal(trailer.status, 200);
assert((trailer.headers.get('content-type') || '').includes('video/mp4'));
const trailerBytes = Buffer.from(await trailer.arrayBuffer());
assert.equal(createHash('sha256').update(trailerBytes).digest('hex'), media.sha256, 'Published video differs from the approved source.');
console.log(`PASS trailer: HTTP 200, video/mp4, approved source bytes (${trailerBytes.length}).`);
const partial = await fetch(origin + '/' + media.file, {headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(30000)});
assert.equal(partial.status,206,'Video seeking requires range requests.');
assert.equal((await partial.arrayBuffer()).byteLength,1024);
console.log('PASS trailer range request: HTTP 206, 1024 bytes.');
