import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://doktortapok.github.io';
const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const chevron = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const download = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const esc = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));

const copy = {
  ru: {
    title: 'Doktor Tapok Games — головоломки для Android',
    description: 'Три игры, три способа подумать: Ханойские башни, Arrows Cube и Arrows Cascade. Правила, скриншоты и ссылки на RuStore и AppGallery.',
    skip: 'К содержимому', games: 'Игры', about: 'О студии', contact: 'Связаться',
    eyebrow: 'НЕЗАВИСИМАЯ ИГРОВАЯ СТУДИЯ', hero: 'Есть минутка?<br>Есть <span>головоломка.</span>',
    intro: 'Переставить кольцо. Найти свободную стрелку. Сделать ещё один ход. Небольшие игры, от которых трудно оторваться.',
    cta: 'Найти свою игру', platform: 'Для Android', deck: 'Три игры. Твой ход.',
    small: 'Поиграем?', collection: 'Разные игры.<br>Общее — удовольствие от решения.',
    collectionText: 'Выберите, что хочется разгадать сегодня.', how: 'Как играть',
    screenshots: 'Скриншоты игры', enlarge: 'Увеличить', previous: 'Предыдущий скриншот', next: 'Следующий скриншот',
    galleryHint: 'Листайте и нажимайте, чтобы рассмотреть', close: 'Закрыть изображение',
    studioLabel: 'О СТУДИИ', studioTitle: 'Простая идея.<br>Интересная задача.',
    studioText: 'Doktor Tapok Games — независимая студия игр для Android. Здесь любят понятные правила, приятные детали и то самое чувство, когда решение наконец нашлось.',
    contactLabel: 'Есть вопрос или идея?', contactTitle: 'Давайте на связи.',
    footer: 'Небольшие игры для любопытного ума.', top: 'Наверх',
    gamesData: [
      {
        id: 'hanoi-tower', theme: 'hanoi', number: '01', tag: 'ЦВЕТА · КОЛЬЦА · ЛОГИКА', title: 'Ханойские<br>башни', english: 'Hanoi Tower',
        short: 'Каждому цвету — свою башню.',
        text: 'Уютная объёмная головоломка о цветах и размерах. Собирайте башни, раскрывайте скрытые кольца и находите решение за меньшее число ходов.',
        stats: ['200 уровней', 'Скрытые кольца', 'Свой стиль'],
        rules: ['Коснитесь штыря, затем другого, чтобы переместить верхнее кольцо.', 'На непустой штырь кладите только меньшее кольцо того же цвета.', 'Соберите каждый цвет в отдельную башню: большие кольца внизу, маленькие наверху.'],
        images: ['hanoi-ru-1','hanoi-ru-2','hanoi-ru-3','hanoi-ru-4'],
        captions: ['Соберите каждый цвет', 'Раскройте скрытые кольца', 'Выберите свой стиль', 'Найдите путь к победе'],
        rustore: 'com.DoktorTapokGames.HanoiTower', huawei: 'C118121171',
      },
      {
        id: 'arrows-cube', theme: 'cube', number: '02', tag: 'ОБЪЁМ · СТРЕЛКИ · ПЕРСПЕКТИВА', title: 'Arrows<br>Cube', english: 'Arrows Cube',
        short: 'Посмотрите на задачу с другой стороны.',
        text: 'Вращайте фигуру, распутывайте стрелки и освобождайте грани одну за другой. В классике можно подумать без спешки, а в «Реакторе» — проверить свой темп.',
        stats: ['3 000 уровней', '6 фигур', '12 испытаний'],
        rules: ['Вращайте и приближайте фигуру, чтобы рассмотреть пути стрелок.', 'Нажимайте на стрелку, перед которой свободен путь. Заблокированная стрелка отнимает жизнь.', 'Уберите все стрелки. Подсказка и стирание помогут в сложной ситуации.'],
        note: ['ЕЩЁ ОДИН РЕЖИМ', '«Реактор»: держите энергию, собирайте серии и ставьте рекорд в бесконечных волнах.'],
        images: ['cube-classic','cube-ru-torus','cube-ru-challenge','cube-reactor'],
        captions: ['Рассмотрите все грани', 'Освойте новую геометрию', 'Пройдите особые испытания', 'Зарядите «Реактор»'],
        rustore: 'com.DoktorTapokGames.ArrowsCube.hw', huawei: 'C118768849',
      },
      {
        id: 'arrows-cascade', theme: 'cascade', number: '03', tag: 'СТРЕЛКИ · ФИГУРЫ · СПОКОЙСТВИЕ', title: 'Arrows<br>Cascade', english: 'Arrows Cascade',
        short: 'Большая задача начинается с одной стрелки.',
        text: 'Найдите правильный порядок ходов и очистите поле. От простых раскладок до фигурных головоломок — всё интереснее, стрелка за стрелкой.',
        stats: ['775 уровней', 'Фигурные поля', 'Без таймера'],
        rules: ['Посмотрите, куда направлены стрелки, и найдите свободный путь.', 'Убирайте стрелки в правильном порядке, освобождая путь другим.', 'Очистите всё поле. У вас три жизни, две подсказки и одно стирание на уровень.'],
        images: ['cascade-1','cascade-2','cascade-3','cascade-4'],
        captions: ['Фигуры с характером', 'Найдите первую стрелку', 'Разгадайте всю картину', 'Освободите игровое поле'],
        rustore: 'com.DoktorTapokGames.ArrowsCascade', huawei: 'C118009291',
      },
    ],
  },
  en: {
    title: 'Doktor Tapok Games — Android puzzle games',
    description: 'Three games, three ways to think: Hanoi Tower, Arrows Cube and Arrows Cascade. Discover the rules, screenshots and links to RuStore and AppGallery.',
    skip: 'Skip to content', games: 'Games', about: 'The studio', contact: 'Get in touch',
    eyebrow: 'INDEPENDENT GAME STUDIO', hero: 'Got a minute?<br>Meet your next <span>puzzle.</span>',
    intro: 'Move a ring. Find a free arrow. Make one more move. Little games that give your curiosity somewhere to play.',
    cta: 'Find your game', platform: 'For Android', deck: 'Three games. Your move.',
    small: 'Shall we play?', collection: 'Different puzzles.<br>The same joy of figuring it out.',
    collectionText: 'Pick something to untangle today.', how: 'How to play',
    screenshots: 'Game screenshots', enlarge: 'Enlarge', previous: 'Previous screenshot', next: 'Next screenshot',
    galleryHint: 'Swipe and tap to take a closer look', close: 'Close image',
    studioLabel: 'THE STUDIO', studioTitle: 'A simple idea.<br>A satisfying challenge.',
    studioText: 'Doktor Tapok Games is an independent Android game studio. We love clear rules, thoughtful little details and that lovely moment when a solution finally clicks.',
    contactLabel: 'A question or an idea?', contactTitle: 'Let’s keep in touch.',
    footer: 'Little games for curious minds.', top: 'Back to top',
    gamesData: [
      {
        id: 'hanoi-tower', theme: 'hanoi', number: '01', tag: 'COLORS · RINGS · LOGIC', title: 'Hanoi<br>Tower', english: 'Hanoi Tower',
        short: 'A little tower for every color.',
        text: 'A cozy 3D puzzle about colors, sizes and clever moves. Build towers, uncover hidden rings and find a solution in fewer moves.',
        stats: ['200 levels', 'Hidden rings', 'Your own style'],
        rules: ['Tap one peg, then another to move its top ring.', 'On an occupied peg, place only a smaller ring of the same color.', 'Bring each color together on one peg, with larger rings below smaller ones.'],
        images: ['hanoi-en-1','hanoi-en-2','hanoi-en-3','hanoi-en-4'],
        captions: ['Bring every color together', 'Uncover the hidden rings', 'Find your own style', 'Make your way to victory'],
        rustore: 'com.DoktorTapokGames.HanoiTower', huawei: 'C118121171',
      },
      {
        id: 'arrows-cube', theme: 'cube', number: '02', tag: 'SHAPES · ARROWS · PERSPECTIVE', title: 'Arrows<br>Cube', english: 'Arrows Cube',
        short: 'A fresh perspective changes everything.',
        text: 'Rotate the shape, untangle the arrows and clear every face. Take your time in classic puzzles, or pick up the pace in Reactor mode.',
        stats: ['3,000 levels', '6 shapes', '12 challenges'],
        rules: ['Rotate and zoom in to see where the arrows lead.', 'Tap an arrow with a clear path. A blocked arrow costs a life.', 'Remove every arrow. A hint or an eraser can help when you get stuck.'],
        note: ['ANOTHER WAY TO PLAY', 'Reactor: keep the energy flowing, build combos and beat your record through endless waves.'],
        images: ['cube-classic','cube-en-torus','cube-en-challenge','cube-reactor'],
        captions: ['Explore every face', 'Discover a new geometry', 'Take on special challenges', 'Power up the Reactor'],
        rustore: 'com.DoktorTapokGames.ArrowsCube.hw', huawei: 'C118768849',
      },
      {
        id: 'arrows-cascade', theme: 'cascade', number: '03', tag: 'ARROWS · PATTERNS · CALM', title: 'Arrows<br>Cascade', english: 'Arrows Cascade',
        short: 'Every big puzzle starts with one arrow.',
        text: 'Find the right order and clear the board. From simple layouts to playful shaped puzzles, discover a little more with every arrow.',
        stats: ['775 levels', 'Shaped boards', 'No timer'],
        rules: ['Follow the arrows and look for one with a clear path.', 'Remove arrows in the right order to open a way for the others.', 'Clear the board. Each level gives you three lives, two hints and one eraser.'],
        images: ['cascade-1','cascade-2','cascade-3','cascade-4'],
        captions: ['Puzzles with personality', 'Find your first arrow', 'See the bigger picture', 'Clear the whole board'],
        rustore: 'com.DoktorTapokGames.ArrowsCascade', huawei: 'C118009291',
      },
    ],
  },
};

function picture(name, alt, eager = false, sizes = '(max-width: 600px) 72vw, 260px') {
  return `<img src="/assets/images/${name}-480.webp" srcset="/assets/images/${name}-480.webp 480w, /assets/images/${name}-1080.webp 1080w" sizes="${sizes}" alt="${esc(alt)}" width="1080" height="1920" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
}
function renderGame(g, t) {
  return `<section class="game game--${g.theme}" id="${g.id}" aria-labelledby="${g.id}-title">
    <div class="game-copy">
      <p class="game-tag"><span>${g.number}</span> ${g.tag}</p>
      <h2 id="${g.id}-title">${g.title.replaceAll('<br>', '<br> ')}</h2>
      <p class="game-short">${g.short}</p><p class="game-description">${g.text}</p>
      <ul class="game-stats" aria-label="${g.english}">${g.stats.map(s => `<li>${s}</li>`).join('')}</ul>
      <h3>${t.how}</h3><ol class="rules">${g.rules.map(s => `<li>${s}</li>`).join('')}</ol>
      ${g.note ? `<aside class="reactor-note"><span class="spark" aria-hidden="true">✳</span><p><strong>${g.note[0]}</strong>${g.note[1]}</p></aside>` : ''}
      <div class="store-links"><a href="https://www.rustore.ru/catalog/app/${g.rustore}" target="_blank" rel="noopener noreferrer" aria-label="${g.english} — RuStore">${download}<span><small>${t.platform}</small>RuStore</span>${arrow}</a><a href="https://appgallery.huawei.com/app/${g.huawei}" target="_blank" rel="noopener noreferrer" aria-label="${g.english} — Huawei AppGallery">${download}<span><small>HUAWEI</small>AppGallery</span>${arrow}</a></div>
    </div>
    <div class="gallery" aria-label="${t.screenshots}: ${g.english}">
      <div class="gallery-track" tabindex="0" role="region" aria-label="${t.screenshots}: ${g.english}">
        ${g.images.map((name, i) => `<figure class="gallery-slide"><a class="screenshot-link" href="/assets/images/${name}-1080.webp" data-caption="${esc(g.captions[i])}" aria-label="${t.enlarge}: ${esc(g.captions[i])}">${picture(name, `${g.english} — ${g.captions[i]}`)}<span class="zoom-mark" aria-hidden="true">↗</span></a><figcaption><span>0${i + 1}</span>${g.captions[i]}</figcaption></figure>`).join('')}
      </div>
      <div class="gallery-footer"><p>${t.galleryHint}</p><div class="gallery-controls" hidden><button class="gallery-prev icon-button" aria-label="${t.previous}">${chevron}</button><span class="gallery-count" aria-live="polite">01 / 04</span><button class="gallery-next icon-button" aria-label="${t.next}">${chevron}</button></div></div>
    </div>
  </section>`;
}

for (const lang of ['ru', 'en']) {
  const t = copy[lang];
  const other = lang === 'ru' ? '/en/' : '/';
  const canonical = origin + (lang === 'ru' ? '/' : '/en/');
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'">
  <meta name="referrer" content="no-referrer"><meta name="color-scheme" content="light"><meta name="theme-color" content="#f7f8f2">
  <title>${t.title}</title><meta name="description" content="${t.description}">
  <link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="ru" href="${origin}/"><link rel="alternate" hreflang="en" href="${origin}/en/"><link rel="alternate" hreflang="x-default" href="${origin}/">
  <meta property="og:type" content="website"><meta property="og:title" content="${t.title}"><meta property="og:description" content="${t.description}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/assets/images/hanoi-icon-1080.webp"><meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script>
</head>
<body id="top">
  <a href="#main" class="skip-link">${t.skip}</a>
  <header class="site-header"><div class="header-inner">
    <a class="brand" href="${lang === 'ru' ? '/' : '/en/'}" aria-label="Doktor Tapok Games"><span class="brand-symbol" aria-hidden="true">dt<span>↗</span></span><span>Doktor Tapok<span class="brand-sub">GAMES</span></span></a>
    <nav class="main-nav" aria-label="${t.games}"><a href="#games">${t.games}</a><a href="#studio">${t.about}</a><a href="#contact">${t.contact} ${arrow}</a></nav>
    <div class="language-switch" aria-label="Language"><span aria-current="page">${lang.toUpperCase()}</span><a href="${other}" class="language-link" hreflang="${lang === 'ru' ? 'en' : 'ru'}" lang="${lang === 'ru' ? 'en' : 'ru'}">${lang === 'ru' ? 'EN' : 'RU'}</a></div>
  </div></header>
  <main id="main">
    <section class="hero wrap" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span>${t.eyebrow}</p><h1 id="hero-title">${t.hero}</h1><p class="hero-description">${t.intro}</p><div class="hero-actions"><a class="primary-button" href="#games">${t.cta}${arrow}</a><span class="android-label"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m6.4 4.2-1-1.6.8-.5 1.1 1.7a9.8 9.8 0 0 1 9.4 0l1.1-1.7.8.5-1 1.6A8.7 8.7 0 0 1 22 11H2a8.7 8.7 0 0 1 4.4-6.8ZM7 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM3 13h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>${t.platform}</span></div></div>
      <div class="hero-art" aria-label="${t.deck}"><span class="orbit orbit-one" aria-hidden="true"></span><span class="orbit orbit-two" aria-hidden="true"></span>
        ${t.gamesData.map((g, i) => `<a class="hero-phone hero-phone--${g.theme}" href="#${g.id}" aria-label="${g.english}">${picture(g.images[0], g.english, true, '(max-width: 600px) 30vw, 210px')}<span>${g.english}${arrow}</span></a>`).join('')}
        <span class="hero-sticker">${t.deck}<svg viewBox="0 0 50 45" fill="none" aria-hidden="true"><path d="M5 10c32-21 49 13 25 29m0 0 1-12m-1 12 12-1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
    </section>
    <div class="game-index wrap">${t.gamesData.map(g => `<a href="#${g.id}"><span class="index-number">${g.number}</span><span class="index-text"><strong>${lang === 'ru' && g.theme === 'hanoi' ? 'Ханойские башни' : g.english}</strong><small>${g.short}</small></span>${arrow}</a>`).join('')}</div>
    <section class="collection wrap" id="games" aria-labelledby="collection-title"><div class="section-heading"><div><p class="eyebrow">${t.small}</p><h2 id="collection-title">${t.collection}</h2></div><p>${t.collectionText}</p></div>${t.gamesData.map(g => renderGame(g, t)).join('')}</section>
    <section class="studio wrap" id="studio" aria-labelledby="studio-title"><div class="studio-visual" aria-hidden="true"><span class="studio-monogram">dt<span>↗</span></span><span class="studio-ring"></span><span class="studio-star">✳</span><span class="studio-caption">INDEPENDENT<br>& CURIOUS</span></div><div><p class="eyebrow">${t.studioLabel}</p><h2 id="studio-title">${t.studioTitle}</h2><p>${t.studioText}</p><a class="text-link" href="mailto:bobrmen94@yandex.ru">${t.contact}${arrow}</a></div></section>
    <section class="contact wrap" id="contact" aria-labelledby="contact-title"><div><p class="eyebrow">${t.contactLabel}</p><h2 id="contact-title">${t.contactTitle}</h2></div><a href="mailto:bobrmen94@yandex.ru">bobrmen94@yandex.ru${arrow}</a></section>
  </main>
  <footer class="site-footer wrap"><div><a class="footer-brand" href="#top">Doktor Tapok Games</a><p>${t.footer}</p></div><div class="footer-links"><a href="/app-ads.txt">app-ads.txt${arrow}</a><a class="language-link" href="${other}" hreflang="${lang === 'ru' ? 'en' : 'ru'}">${lang === 'ru' ? 'English' : 'Русский'}</a><a href="#top">${t.top} ↑</a></div><p class="copyright">© 2026 Doktor Tapok Games</p></footer>
  <dialog class="lightbox" aria-label="${t.screenshots}"><div class="lightbox-toolbar"><span class="lightbox-counter"></span><button class="lightbox-close icon-button" aria-label="${t.close}">✕</button></div><div class="lightbox-stage"><button class="lightbox-prev icon-button" aria-label="${t.previous}">${chevron}</button><img class="lightbox-image" alt=""><button class="lightbox-next icon-button" aria-label="${t.next}">${chevron}</button></div><p class="lightbox-caption"></p></dialog>
</body></html>`;
  const folder = lang === 'ru' ? dist : path.join(dist, 'en');
  await mkdir(folder, {recursive: true});
  await writeFile(path.join(folder, 'index.html'), html);
}
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/en/</loc></url></urlset>\n`);
await writeFile(path.join(dist, '.nojekyll'), '');
await writeFile(path.join(dist, '404.html'), '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>404 — Doktor Tapok Games</title><link rel="stylesheet" href="/assets/site.css"><body><main class="not-found wrap"><p class="eyebrow">404</p><h1>Кажется, здесь нет хода.</h1><p>This page does not exist.</p><a class="primary-button" href="/">На главную / Home ↗</a></main></body></html>');
console.log('Built Russian and English static pages. app-ads.txt is untouched.');
