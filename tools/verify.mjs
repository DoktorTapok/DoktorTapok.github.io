import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const bytes = await readFile(path.join(dist, 'app-ads.txt'));
const expectedHash = (await readFile(path.join(root, 'app-ads.sha256'), 'utf8')).trim();
const hash = createHash('sha256').update(bytes).digest('hex');
assert.equal(hash, expectedHash, 'app-ads.txt differs from the explicitly recorded source file.');
const adsText = new TextDecoder('utf-8', {fatal:true}).decode(bytes);
assert(!adsText.includes('<'), 'app-ads.txt must be plain text.');
const records = adsText.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'));
for (const line of records) assert(/^[a-z0-9.-]+\s*,\s*[^,\s]+\s*,\s*(DIRECT|RESELLER)(\s*,\s*[^,\s]+)?\s*$/i.test(line), `Invalid seller record: ${line}`);
assert(records.some(line => line.startsWith('yandex.com,') && line.includes('DIRECT')), 'Missing Yandex direct seller.');

const sourceArg = process.argv.find(arg => arg.startsWith('--original='));
if (sourceArg) assert(bytes.equals(await readFile(sourceArg.slice('--original='.length))), 'File differs from the owner-provided original.');

for (const [file, lang] of [['index.html','ru'],['en/index.html','en']]) {
  const html = await readFile(path.join(dist, file), 'utf8');
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/class="game game--/g) || []).length, 3, 'Exactly three game sections required.');
  assert.equal((html.match(/class="screenshot-link"/g) || []).length, 12, 'Four screenshot links per game required.');
  assert.equal((html.match(/https:\/\/www\.rustore\.ru\/catalog\/app\//g) || []).length, 3);
  assert.equal((html.match(/https:\/\/appgallery\.huawei\.com\/app\//g) || []).length, 3);
  assert(html.includes('href="/app-ads.txt"'));
  assert(html.includes('Content-Security-Policy'));
  assert(!/<script\b[^>]*>\s*[^<\s]/.test(html), 'Inline scripts are forbidden.');
  assert(!/\son[a-z]+\s*=/.test(html), 'Inline handlers are forbidden.');
  assert(!/<(?:iframe|form)\b/i.test(html), 'No embedded apps or forms.');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate element IDs.');
  for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (value.startsWith('#')) {assert(ids.includes(value.slice(1)), `Unknown anchor ${value}`);continue;}
    if (/^(https:|mailto:)/.test(value)) continue;
    const resolved = path.join(dist, value);
    assert((await stat(resolved)).isFile() || (await stat(path.join(resolved, 'index.html'))).isFile(), `Missing resource ${value}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\balt="/.test(match[0]), 'Every image needs alternate text.');
    const src = match[0].match(/\bsrc="([^"]+)"/);
    if (src) assert(src[1].startsWith('/assets/'), 'All images must be hosted locally.');
  }
  const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)];
  assert(scripts.every(match => match[1].startsWith('/assets/')), 'No external JavaScript.');
}
for (const file of ['robots.txt','sitemap.xml','404.html','.nojekyll']) await stat(path.join(dist, file));
console.log(`PASS: RU/EN, 3 games, 24 screenshot links, 6 store links per language, local assets and plain-text app-ads.txt (${records.length} seller records).`);
console.log(`app-ads.txt SHA-256: ${hash}`);
