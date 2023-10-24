const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


const app = express();
const port = 3000;

const options = {
		key: fs.readFileSync('./sslcert/key.pem'),
		cert: fs.readFileSync('./sslcert/cert.pem'),
};


app.get('/get-x5sec', async (req, res) => {
		try {
				console.log('Запускаем браузер...');
				const browser = await puppeteer.launch({
						executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
						defaultViewport: {width: 1280, height: 720},
				});

				const page = await browser.newPage();
				await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537');


				await page.goto('https://detail.1688.com/offer/731969077013.html');
				console.log('Ожидаем элемент ползунка...');
				await page.waitForSelector('#nc_1_n1z', {timeout: 15000});


				console.log('Пытаемся переместить ползунок...');
				const slider = await page.$('#nc_1_n1z');
				const boundingBox = await slider.boundingBox();


				const initialX = 100;
				const initialY = 420;
				await page.mouse.move(initialX, initialY);

				// Круговые и хаотичные движения вокруг ползунка
				const circleRadius = 150;
				let steps = 20;
				for (let i = 0; i < steps; i++) {
						const angle = (Math.PI * 2 * i) / steps;
						const x = boundingBox.x + circleRadius * Math.cos(angle) + Math.random() * 10 - 5; // Хаотичность по X
						const y = boundingBox.y + circleRadius * Math.sin(angle) + Math.random() * 10 - 5; // Хаотичность по Y
						await page.mouse.move(x, y);
						await page.waitForTimeout(100 + Math.random() * 50);
				}

				// Захватываем ползунок
				const startX = boundingBox.x + boundingBox.width / 2;
				const startY = boundingBox.y + boundingBox.height / 2;
				await page.mouse.move(startX, startY);
				await page.mouse.down();

				// Перетаскиваем ползунок с случайными остановками и изменением скорости
				const endX = boundingBox.x + boundingBox.width + 700;
				steps = 10 + Math.floor(Math.random() * 10); // случайное количество шагов
				const minDelay = 50;
				const maxDelay = 250;

				let lastX = startX;
				let lastY = startY;

				for (let i = 1; i <= steps; i++) {
						const curveFactor = Math.sin((Math.PI * i) / steps); // добавляем кривизну
						const moveX = startX + (endX - startX) * curveFactor;
						const moveY = startY + Math.sin(curveFactor * Math.PI * 4) * 5; // небольшие колебания по Y

						// случайные остановки
						if (Math.random() < 0.2) {
								await page.waitForTimeout(400 + Math.random() * 200);
						}

						await page.mouse.move(moveX, moveY, {steps: Math.floor(2 + Math.random() * 3)});
						const randomDelay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
						await page.waitForTimeout(randomDelay);
				}


				await page.mouse.up();


				const cookies = await page.cookies();
				const cookie = cookies.find(el => el.name === 'x5sec');

				if (!cookie) {
						throw new Error('Cookie "x5sec" не найден');
				}

				console.log('Найденный Cookie:', cookie);

				// Завершение работы
				console.log('Завершаем работу...');
				await browser.close();

				res.send(cookie);
		} catch (error) {
				console.error('Произошла ошибка:', error);
				if (error.message === 'Cookie "x5sec" не найден') {
						res.status(404).send('Cookie "x5sec" не найден');
				} else {
						res.status(500).send('Произошла ошибка при выполнении бота.');
				}
		}
});


app.use(express.static(path.join(__dirname, 'public')));

const server = https.createServer(options, app);

server.listen(port, () => {
		console.log(`Сервер запущен на https://localhost:${port}`);
});
