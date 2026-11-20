"""Prepare web-sized copies of the owner's Android artwork; never edit originals."""
from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
USER = ROOT.parents[1]
OUT = ROOT / 'dist' / 'assets' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
manifest_path = ROOT / 'asset-sources.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

def prepare(source, name, origin):
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        original = im.size
        for width in (480, 1080):
            version = im.copy()
            version.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
            version.save(OUT / f'{name}-{width}.webp', 'WEBP', quality=85, method=6)
    manifest[:] = [entry for entry in manifest if entry['name'] != name]
    manifest.append({'name': name, 'source': origin, 'originalSize': original})

cube = USER / 'ArrowsCube' / 'StoreAssets'
prepare(cube / 'RuStore_2026-09_v2/Source/01-cube-en.png', 'cube-classic', 'ArrowsCube/StoreAssets/RuStore_2026-09_v2/Source/01-cube-en.png')
for lang, language in (('ru', 'Russian'), ('en', 'English')):
    for kind in ('torus', 'challenge'):
        prepare(cube / f'RuStore_2026-10_Update/Source/Screenshots/{kind}-{language}.png', f'cube-{lang}-{kind}', f'ArrowsCube/StoreAssets/RuStore_2026-10_Update/Source/Screenshots/{kind}-{language}.png')
prepare(cube / 'RuStore_2026-10_Reactor/Source/Screenshots/reactor-Russian.png', 'cube-reactor', 'ArrowsCube/StoreAssets/RuStore_2026-10_Reactor/Source/Screenshots/reactor-Russian.png')


manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
