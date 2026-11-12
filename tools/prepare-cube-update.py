"""Export the Heart update's screenshots and trailer for the website."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, shutil

root = Path(__file__).resolve().parents[1]
user = root.parents[1]
assets = user / 'ArrowsCube' / 'StoreAssets'
release = assets / 'RuStore_2026-11_Heart'
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

for lang in ('ru', 'en'):
    image(release / lang.upper() / '08-new-shapes.jpg', f'cube-{lang}-new-shapes')
    image(release / lang.upper() / '09-challenges.jpg', f'cube-{lang}-challenges-24')
image(release / 'poster-ru.jpg', 'cube-heart-trailer-poster')

video_source = release / 'ArrowsCube-RuStore-RU-38s-1080x1920.mp4'
video_target = root / 'dist/assets/video/arrows-cube-gameplay-heart.mp4'
video_target.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(video_source, video_target)
digest = hashlib.sha256(video_target.read_bytes()).hexdigest()
assert digest == hashlib.sha256(video_source.read_bytes()).hexdigest()
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(root / 'media-sources.json').write_text(json.dumps([{
    'file': video_target.relative_to(root / 'dist').as_posix(),
    'source': video_source.relative_to(user).as_posix(),
    'sha256': digest,
    'bytes': video_target.stat().st_size,
    'durationSeconds': 38,
    'onScreenLanguage': 'ru',
}], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'newImages': 5, 'videoBytes': video_target.stat().st_size, 'videoSha256': digest}))
