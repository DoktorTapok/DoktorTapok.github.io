# Doktor Tapok Games

Статическая визитка трёх Android-игр. Русская версия: https://doktortapok.github.io/; английская: https://doktortapok.github.io/en/.

Сайт: HTML, CSS, JavaScript, собственные изображения. Без PHP, сервера приложений, внешних библиотек, аналитики и форм. Посетители могут только читать опубликованные файлы.

## app-ads.txt — самое важное

На сайте файл доступен по адресу https://doktortapok.github.io/app-ads.txt.

В карточках **всех трёх игр в RuStore и Huawei AppGallery** укажите сайт разработчика `https://doktortapok.github.io/`. После обновления карточек проверьте обнаружение файла в кабинете РСЯ. Эти настройки магазинов не изменяются при публикации сайта.

### Обновить через GitHub без установки программ

1. Скачайте актуальный `app-ads.txt` из кабинета РСЯ. Не переписывайте вручную строки продавцов.
2. Откройте https://github.com/DoktorTapok/DoktorTapok.github.io/tree/main/dist.
3. Нажмите **Add file → Upload files**, перетащите новый файл `app-ads.txt` и сохраните изменение в основной ветке. GitHub Actions проверит файл и остановит публикацию, пока контрольная сумма не обновлена.
4. Посчитайте SHA-256 скачанного файла в PowerShell:

   ```powershell
   (Get-FileHash -LiteralPath "$env:USERPROFILE\Downloads\app-ads.txt" -Algorithm SHA256).Hash.ToLowerInvariant()
   ```

5. Откройте https://github.com/DoktorTapok/DoktorTapok.github.io/blob/main/app-ads.sha256, нажмите карандаш и замените единственную строку полученной суммой. Сохраните изменение. Не меняйте сумму, если вы не меняли файл намеренно.
6. Во вкладке **Actions** дождитесь зелёного результата `Publish website` для последнего изменения. До успешного завершения посетители видят прежнюю версию.
7. Откройте https://doktortapok.github.io/app-ads.txt и проверьте статус в РСЯ. Обновление статуса в рекламной сети может произойти позже публикации.

Проще также передать скачанный файл в этот чат: агент сможет скопировать его без изменения байтов, обновить сумму и проверить публикацию.

### Обновить локально

Рабочая папка: `C:\Users\bobrm\WebPage\developer-site`.

```powershell
Copy-Item -LiteralPath "$env:USERPROFILE\Downloads\app-ads.txt" -Destination '.\dist\app-ads.txt'
$adsChecksum = (Get-FileHash -LiteralPath '.\dist\app-ads.txt' -Algorithm SHA256).Hash.ToLowerInvariant()
[System.IO.File]::WriteAllText((Join-Path (Get-Location) 'app-ads.sha256'), $adsChecksum + "`n", [System.Text.Encoding]::ASCII)
node tools/verify.mjs
git add -- dist/app-ads.txt app-ads.sha256
git commit -m "Update authorized advertising sellers"
git push origin main
```

Файл обновляется в интернете только после `git push` и успешной публикации. Атрибут Git `-text` сохраняет исходные переводы строк в `app-ads.txt`.

## Просмотр и изменение сайта

```powershell
node tools/build.mjs
node tools/verify.mjs
node tools/serve.mjs
```

Локальный адрес: http://127.0.0.1:8137/. Остановить сервер: Ctrl+C.

Тексты и разметка обеих версий находятся в `tools/build.mjs`, стили — в `dist/assets/site.css`, галереи — в `dist/assets/site.js`. После изменения текстов запустите сборку и включите обновлённые HTML в коммит. Сборка не изменяет `app-ads.txt`.

При публикации GitHub получает только содержимое `dist`. Файлы проекта игр, APK, ключи подписи и конфигурации рекламных SDK сюда не входят. Список использованных Android-изображений находится в `asset-sources.json`; подготовка изменяла только их копии. Скрипт `tools/prepare-assets.py` нужен только для повторной подготовки из оригинальных материалов на компьютере автора, в публикации и обычных обновлениях он не участвует.

## Защита и восстановление

- Включите двухфакторную аутентификацию или passkey в GitHub и защитите связанную почту. Пароли и резервные коды не храните в репозитории.
- Публикация выполняется только из `main`, изменения проходят автоматическую проверку. Действия GitHub закреплены по конкретным коммитам, право записи в Pages есть только у задания публикации.
- Защита ветки запрещает принудительную перезапись и удаление. Она не запрещает владельцу намеренно публиковать обновления.
- Контрольная сумма обнаруживает случайную замену файла, но не защищает от злоумышленника, получившего право менять и файл, и контрольную сумму.
- Для отката используйте обратный коммит (`git revert <commit>`), затем обычный `git push`. Не используйте `git push --force`. При откате файла рекламы откатывайте вместе с ним и `app-ads.sha256`.
- GitHub Pages управляет HTTPS и сервером. Политика CSP встроена в HTML; произвольные HTTP-заголовки GitHub Pages не настраивает. На сайте нет обещания полной защиты от взлома аккаунта или сбоев хостинга.

## Источники

- Android-материалы Hanoi Tower и Arrows Cube из проектов автора.
- Скриншоты Arrows Cascade из собственной карточки автора в RuStore, без изменения игрового содержимого.
- Ссылки Huawei AppGallery предоставлены владельцем; дополнительные параметры распространения удалены.
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
- [Файл app-ads.txt в РСЯ](https://ads.yandex.com/helpcenter/ru/monetization/app/ads-txt).
