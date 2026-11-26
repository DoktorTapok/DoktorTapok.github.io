"""Create web-sized copies of the owner's November 25 Cascade store artwork."""
from pathlib import Path
from PIL import Image, ImageOps
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parents[1] / 'ArrowPuzzle/Docs/Publishing/2026-11-25-v1'
OUT = ROOT / 'dist/assets/images'
manifest_path = ROOT / 'asset-sources.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
names = ['01-clear-the-way', '02-5000-levels', '03-new-mechanics', '04-unlock-your-style']
for lang in ['ru', 'en']:
    for index, source_name in enumerate(names, 1):
        source = SOURCE / lang / f'{source_name}.png'
        name = f'cascade-{lang}-{index}-202611'
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image).convert('RGB')
            original_size = image.size
            for width in [480, 1080]:
                version = image.copy()
                version.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
                version.save(OUT / f'{name}-{width}.webp', 'WEBP', quality=85, method=6)
        manifest = [entry for entry in manifest if entry['name'] != name]
        manifest.append({'name': name, 'source': source.relative_to(ROOT.parents[1]).as_posix(), 'originalSize': original_size})
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
