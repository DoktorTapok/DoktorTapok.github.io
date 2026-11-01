"""Copy the November Android update's approved media without touching app-ads.txt."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, shutil

root = Path(__file__).resolve().parents[1]
user = root.parents[1]
assets = user / 'ArrowsCube' / 'StoreAssets'
release = assets / 'RuStore_2026-11_Video_RU_v2'
out = root / 'dist' / 'assets' / 'images'
manifest_path = root / 'asset-sources.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

def image(source, name):
    with Image.open(source) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        original = im.size
        for width in (480, 1080):
            resized = im.copy()
            resized.thumbnail((width, width * 4), Image.Resampling.LANCZOS)
            resized.save(out / f'{name}-{width}.webp', 'WEBP', quality=85, method=6)
    manifest[:] = [entry for entry in manifest if entry['name'] != name]
    manifest.append({'name': name, 'source': source.relative_to(user).as_posix(), 'originalSize': original})

for lang, filename in [('ru', 'reactor-Russian-089.png'), ('en', 'reactor-English-088.png')]:
    image(assets / f'RuStore_2026-11_Skull/Source/Screenshots/skull-level1-{lang}.png', f'cube-{lang}-skull')
    image(release / 'Source' / 'QA' / filename, f'cube-{lang}-reactor-202611')

video_source = release / 'ArrowsCube-RuStore-RU-v2-32s-1080x1920.mp4'
video_target = root / 'dist/assets/video/arrows-cube-gameplay-2026-11.mp4'
video_target.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(video_source, video_target)
digest = hashlib.sha256(video_target.read_bytes()).hexdigest()
assert digest == hashlib.sha256(video_source.read_bytes()).hexdigest()
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(root / 'media-sources.json').write_text(json.dumps([{
    'file': 'assets/video/arrows-cube-gameplay-2026-11.mp4',
    'source': video_source.relative_to(user).as_posix(),
    'sha256': digest,
    'bytes': video_target.stat().st_size,
    'durationSeconds': 32,
    'onScreenLanguage': 'ru',
}], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'newImages': 4, 'videoBytes': video_target.stat().st_size, 'videoSha256': digest}))
