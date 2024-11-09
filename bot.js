const puppeteer = require('puppeteer');
const tokens = require('./tokens.json');

console.log("Bot ini dibuat oleh NOLIYADI - Terimakasih\n");
console.log("Memulai check-in harian...\n");

async function checkIn(authToken, akunIndex) {
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

    try {
        // Tunggu hingga elemen tombol dengan kelas yang sesuai muncul
        await page.waitForSelector('button.text-xs.py-1.px-3.rounded-full.text-black', { timeout: 10000 });

        // Cari tombol dengan teks "Start"
        const checkinButton = await page.$("button.text-xs.py-1.px-3.rounded-full.text-black");
        const buttonText = await page.evaluate(button => button.innerText, checkinButton);

        if (buttonText === "Start") {
            await checkinButton.click();
            console.log(`[Akun ${akunIndex}] Check-in berhasil.`);
        } else {
            console.log(`[Akun ${akunIndex}] Check-in sudah dilakukan atau tombol tidak ditemukan.`);
        }
    } catch (error) {
        console.log(`[Akun ${akunIndex}] Terjadi kesalahan saat mencoba check-in:`, error.message);
    }

    await browser.close();
}

async function startCheckIn() {
    for (let i = 0; i < tokens.length; i++) {
        await checkIn(tokens[i], i + 1); // Menampilkan akun sebagai "Akun 1", "Akun 2", dst.
        console.log("Jeda 5 detik sebelum akun berikutnya...\n");
        await new Promise(resolve => setTimeout(resolve, 5000)); // jeda 5 detik
    }

    console.log("Check-in selesai untuk semua akun. Check-in berikutnya akan dilakukan dalam 24 jam.\n");
    countdownToNextCheckIn();
}

function countdownToNextCheckIn() {
    let remainingTime = 24 * 60 * 60; // 24 jam dalam detik

    const interval = setInterval(() => {
        const hours = String(Math.floor(remainingTime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, '0');
        const seconds = String(remainingTime % 60).padStart(2, '0');

        process.stdout.write(`\rMenghitung mundur hingga check-in berikutnya: ${hours}:${minutes}:${seconds}`);
        
        remainingTime -= 1;

        if (remainingTime < 0) {
            clearInterval(interval);
            console.log("\nCheck-in berikutnya dimulai!\n");
            startCheckIn(); // Memulai check-in ulang setelah 24 jam
        }
    }, 1000);
}

// Jalankan check-in pertama kali
startCheckIn();
