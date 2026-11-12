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

const media = JSON.parse(await readFile(path.join(root, 'media-sources.json'), 'utf8'))[0];
const videoBytes = await readFile(path.join(dist, media.file));
assert.equal(createHash('sha256').update(videoBytes).digest('hex'), media.sha256, 'Trailer must match the approved gameplay source.');
assert.equal(videoBytes.length, media.bytes);
assert.equal(videoBytes.subarray(4, 8).toString(), 'ftyp', 'Trailer must be an MP4 file.');

for (const [file, lang] of [['index.html','ru'],['en/index.html','en']]) {
  const html = await readFile(path.join(dist, file), 'utf8');
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal((html.match(/class="game game--/g) || []).length, 3, 'Exactly three game sections required.');
  assert.equal((html.match(/class="screenshot-link"/g) || []).length, 12, 'Four screenshot links per game required.');
  assert.equal((html.match(/https:\/\/www\.rustore\.ru\/catalog\/app\//g) || []).length, 3);
  assert.equal((html.match(/https:\/\/appgallery\.huawei\.com\/app\//g) || []).length, 3);
  assert(html.includes('href="/app-ads.txt"'));
  assert(html.includes('Content-Security-Policy'));
  assert(html.includes("media-src 'self'"), 'Local video must be permitted by CSP.');
  const videos = [...html.matchAll(/<video\b[^>]*>/g)];
  assert.equal(videos.length, 1, 'Exactly one Arrows Cube trailer is expected.');
  assert(videos[0][0].includes('controls') && videos[0][0].includes('playsinline'));
  assert(videos[0][0].includes('preload="none"') && !videos[0][0].includes('autoplay'), 'Video must load and play on request.');
  assert(html.includes(`<source src="/${media.file}" type="video/mp4">`), 'The page must play the verified trailer.');
  assert(html.includes(`${media.durationSeconds} ${lang === 'ru' ? 'секунд' : 'seconds'}`), 'Trailer duration must match the manifest.');
  const updateCopy = lang === 'ru'
    ? ['4 000 уровней', '8 фигур', '24 испытания', 'Сердце', 'разветвители ×4', 'Пробой', 'Импульс', 'Стазис']
    : ['4,000 levels', '8 shapes', '24 challenges', 'The heart', '×4 splitters', 'Pierce', 'Pulse', 'Stasis'];
  for (const caption of updateCopy) assert(html.includes(caption), `Missing update feature: ${caption}`);
  assert(!/<script\b[^>]*>\s*[^<\s]/.test(html), 'Inline scripts are forbidden.');
  assert(!/\son[a-z]+\s*=/.test(html), 'Inline handlers are forbidden.');
  assert(!/<(?:iframe|form)\b/i.test(html), 'No embedded apps or forms.');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate element IDs.');
  for (const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) {
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
