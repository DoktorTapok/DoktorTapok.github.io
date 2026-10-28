"""Prepare web-sized copies of the owner's Android artwork; never edit originals."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, shutil, urllib.request

ROOT = Path(__file__).resolve().parents[1]
USER = ROOT.parents[1]
OUT = ROOT / 'dist' / 'assets' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
RAW = ROOT / '.preview' / 'source-assets'
RAW.mkdir(parents=True, exist_ok=True)
manifest = []

def prepare(source, name, origin):
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        original = im.size
        for width in (480, 1080):
            version = im.copy()
            version.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
            version.save(OUT / f'{name}-{width}.webp', 'WEBP', quality=85, method=6)
    manifest.append({'name': name, 'source': origin, 'originalSize': original})

hanoi = USER / 'HanoyTower' / 'marketing' / '2026-10'
for lang in ('ru', 'en'):
    for i, kind in enumerate(('colors', 'mystery', 'style', 'win'), 1):
        prepare(hanoi / 'raw' / f'phone-{lang}-{i:02}-{kind}.png', f'hanoi-{lang}-{i}', f'HanoyTower/marketing/2026-10/raw/phone-{lang}-{i:02}-{kind}.png')

cube = USER / 'ArrowsCube' / 'StoreAssets'
prepare(cube / 'RuStore_2026-09_v2/Source/01-cube-en.png', 'cube-classic', 'ArrowsCube/StoreAssets/RuStore_2026-09_v2/Source/01-cube-en.png')
for lang, language in (('ru', 'Russian'), ('en', 'English')):
    for kind in ('torus', 'challenge'):
        prepare(cube / f'RuStore_2026-10_Update/Source/Screenshots/{kind}-{language}.png', f'cube-{lang}-{kind}', f'ArrowsCube/StoreAssets/RuStore_2026-10_Update/Source/Screenshots/{kind}-{language}.png')
prepare(cube / 'RuStore_2026-10_Reactor/Source/Screenshots/reactor-Russian.png', 'cube-reactor', 'ArrowsCube/StoreAssets/RuStore_2026-10_Reactor/Source/Screenshots/reactor-Russian.png')

cascade = [
    'https://static.rustore.ru/2026/7/11/26/apk/2063721258/content/SCREENSHOT/042d092e-d3cb-4d8a-a7fd-01d0a24119ec.png',
    'https://static.rustore.ru/2026/6/8/9f/apk/2063721258/content/SCREENSHOT/c9948373-4575-43de-a24a-1806d25c9081.png',
    'https://static.rustore.ru/2026/7/11/1e/apk/2063721258/content/SCREENSHOT/4bd24a1d-82b7-45e3-a793-947d1745764e.png',
    'https://static.rustore.ru/2026/6/8/a7/apk/2063721258/content/SCREENSHOT/72e2f85a-37f3-4ced-a196-ac6e3b81d92e.png',
]
for i, url in enumerate(cascade, 1):
    local = RAW / f'cascade-{i}.png'
    if not local.exists():
        with urllib.request.urlopen(url, timeout=45) as response:
            local.write_bytes(response.read())
    prepare(local, f'cascade-{i}', url)

prepare(hanoi / 'branding/app-icon-512.png', 'hanoi-icon', 'HanoyTower/marketing/2026-10/branding/app-icon-512.png')
shutil.copyfile(USER / 'Downloads' / 'app-ads.txt', ROOT / 'dist' / 'app-ads.txt')
digest = hashlib.sha256((ROOT / 'dist' / 'app-ads.txt').read_bytes()).hexdigest()
(ROOT / 'app-ads.sha256').write_text(digest + '\n', encoding='ascii')
(ROOT / 'asset-sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'images': len(manifest), 'adsSha256': digest, 'imageBytes': sum(p.stat().st_size for p in OUT.iterdir())}))
