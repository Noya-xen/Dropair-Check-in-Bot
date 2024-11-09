const puppeteer = require('puppeteer');
const tokens = require('./tokens.json');

async function checkIn(authToken) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Setel token autentikasi di cookies
    await page.setCookie({
        name: 'auth-token',
        value: authToken,
        domain: 'dropair.io'
    });

    // Buka website Dropair.io
    await page.goto('https://dropair.io/', { waitUntil: 'networkidle2' });

    // Tunggu tombol "Start" sebelum mengklik
    try {
        await page.waitForSelector('button.bg-[#15ef93]', { timeout: 10000 });
        await page.click('button.bg-[#15ef93]');
        console.log('Check-in selesai untuk token:', authToken);
    } catch (error) {
        console.log('Check-in sudah selesai atau tombol tidak ditemukan untuk token:', authToken);
    }

    await browser.close();
}

(async () => {
    // Loop melalui setiap token dengan jeda 5 detik
    for (const authToken of tokens) {
        await checkIn(authToken);
        await new Promise(resolve => setTimeout(resolve, 5000)); // jeda 5 detik
    }

    // Jadwalkan skrip untuk berjalan lagi dalam 24 jam
    setTimeout(() => {
        console.log('Memulai check-in harian...');
        (async () => {
            for (const authToken of tokens) {
                await checkIn(authToken);
                await new Promise(resolve => setTimeout(resolve, 5000)); // jeda 5 detik
            }
        })();
    }, 24 * 60 * 60 * 1000); // 24 jam dalam milidetik
})();
