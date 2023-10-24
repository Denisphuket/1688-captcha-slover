# CAPTCHA Solver Service

## Описание

Этот сервис использует Puppeteer для решения CAPTCHA на сайте 1688.com.

## API

### `GET /get-x5sec`

Возвращает куки `x5sec` после успешного решения CAPTCHA.

## Запуск

1. Установите зависимости: `npm install`
2. Запустите сервер: `npm run start`
