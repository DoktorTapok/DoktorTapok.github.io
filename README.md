# Arrows Cube

Русская и английская витрины Arrows Cube для Android: https://doktortapok.github.io/ и https://doktortapok.github.io/en/.

GitHub Pages публикует только папку dist. Сайт остальных игр и прежний рекламный файл доступны на https://doktor-tapok-games.doktortapok94.chatgpt.site/.

## Проверка

- Собрать страницы: `node tools/build.mjs`.
- Проверить страницы и SHA-256 рекламного файла: `node tools/verify.mjs`.
- Сверить опубликованные файлы с рабочей копией: `node tools/verify-live.mjs`.

Контрольная сумма в app-ads.sha256 соответствует опубликованному app-ads.txt от 18 ноября 2026 года, включая заключительный перевод строки. При намеренной замене рекламного файла обновите контрольную сумму вместе с файлом.
