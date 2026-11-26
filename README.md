# Doktor Tapok Games

Единая русская и английская витрина Ханойских башен, Arrows Cube и Arrows Cascade для Android: https://doktortapok.github.io/ и https://doktortapok.github.io/en/.

GitHub Pages публикует только папку dist. У каждой игры есть ссылки на RuStore и Huawei AppGallery. Общий рекламный файл находится в корне: https://doktortapok.github.io/app-ads.txt.

Arrows Cascade использует обновлённые русские и английские материалы из ArrowPuzzle/Docs/Publishing/2026-11-25-v1. Для подготовки веб-копий запустите `python tools/prepare-cascade-update.py`.

## Проверка

- Собрать страницы: `node tools/build.mjs`.
- Проверить страницы и SHA-256 рекламного файла: `node tools/verify.mjs`.
- Сверить опубликованные файлы с рабочей копией: `node tools/verify-live.mjs`.

Контрольная сумма в app-ads.sha256 соответствует предоставленному владельцем файлу «app-ads (5).txt» от 26 ноября 2026 года. Файл скопирован побайтно. При намеренной замене рекламного файла обновите контрольную сумму вместе с файлом.
