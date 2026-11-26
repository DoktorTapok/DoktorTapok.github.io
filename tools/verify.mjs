import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://doktortapok.github.io';

const bytes = await readFile(path.join(dist, 'app-ads.txt'));
const hash = createHash('sha256').update(bytes).digest('hex');
const expectedHash = (await readFile(path.join(root, 'app-ads.sha256'), 'utf8')).trim();
assert.equal(hash, expectedHash, 'app-ads.txt differs from the approved file.');

const adsText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

assert(!adsText.includes('<'), 'app-ads.txt must be plain text.');

const records = adsText.split(/\r?\n/).filter(line => line.trim() && !line.trimStart().startsWith('#'));

assert(records.length > 0, 'app-ads.txt is empty.');

const sellerDomainsWithNonstandardSyntax = [];
for (const line of records) {
  assert(
    /^[^,\s]+\s*,\s*[^,\s]+,\s*(DIRECT|RESELLER)(?:\s*,\s*[^,\s]+)?\s*$/i.test(line),
    `Invalid seller record: ${line}`
  );
  const domain = line.split(',', 1)[0].trim();
  if (!/^[a-z0-9.-]+$/i.test(domain)) sellerDomainsWithNonstandardSyntax.push(domain);
}
if (sellerDomainsWithNonstandardSyntax.length) {
  console.warn(`Nonstandard seller domains in the approved app-ads.txt: ${sellerDomainsWithNonstandardSyntax.join(', ')}.`);
}

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
  const gameIds = [...html.matchAll(/<section class="game game--[^"]+" id="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(gameIds, ['hanoi-tower', 'arrows-cube', 'arrows-cascade'], 'Unexpected game sections.');
  assert.equal((html.match(/class="screenshot-link"/g) || []).length, gameIds.length * 4, 'Four screenshot links per game required.');
  assert.equal((html.match(/https:\/\/www\.rustore\.ru\/catalog\/app\//g) || []).length, gameIds.length);
  assert.equal((html.match(/https:\/\/appgallery\.huawei\.com\/app\//g) || []).length, gameIds.length);
  assert(html.includes('href="/app-ads.txt"'));
  assert(html.includes('Content-Security-Policy'));
  const pagePath = lang === 'ru' ? '/' : '/en/';
  assert(html.includes('<link rel="canonical" href="' + origin + pagePath + '">'));
  assert(!html.includes('chatgpt.site'), 'The unified site must not link to the retired site.');
  const shareImage = html.match(/property="og:image" content="([^"]+)"/)[1];
  assert.equal(new URL(shareImage).origin, origin);
  assert((await stat(path.join(dist, new URL(shareImage).pathname))).isFile());
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const entry of match[1].split(',')) {
      const [url] = entry.trim().split(/\s+/);
      assert(url.startsWith('/assets/') && (await stat(path.join(dist, url))).isFile());
    }
  }
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
  for (let i = 1; i <= 4; i++) assert(html.includes(`cascade-${lang}-${i}-202611`), 'Updated localized Cascade screenshots required.');
  assert(html.includes(lang === 'ru' ? '5 000 уровней' : '5,000 levels'));
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
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.equal(robots, 'User-agent: *\nAllow: /\nSitemap: ' + origin + '/sitemap.xml\n');
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]), [origin + '/', origin + '/en/']);
for (const file of ['404.html', '.nojekyll']) assert((await stat(path.join(dist, file))).isFile());
console.log(`PASS: RU/EN, all three games and the Arrows Cube trailer, local assets and plain-text app-ads.txt (${records.length} seller records).`);
console.log(`app-ads.txt SHA-256: ${hash}`);
