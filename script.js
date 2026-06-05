const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("game-overlay");
const startBtn = document.getElementById("start-btn");

let gameRunning = false;
let score = 0;

// İyice Yavaşlatılmış ve Süzülen Fizik Ayarları
const player = {
    x: 50,
    y: 180,
    width: 34,
    height: 34,
    gravity: 0.12,      /* Düşüş hızı iyice yavaşlatıldı (Pamuk gibi süzülür) */
    velocity: 0,
    jump: -3.8         /* Yeni yerçekimine göre zıplama sarsıntısız hale getirildi */
};

// Engeller (Sınav Konuları)
let pipes = [];
const pipeWidth = 55;
const pipeGap = 145;   /* Geçiş aralığı genişletildi, hata payı rahatlatıldı */
const pipeSpeed = 1.4;  /* Engellerin akış hızı ciddi oranda yavaşlatıldı */

// Sınav engel kelimeleri
const examTexts = ["ANATOMİ", "FİZYOLOJİ", "FİNAL", "ORGANİK KİMYA", "BÜT", "GENEL KİMYA"];

function spawnPipe() {
    const minHeight = 40;
    const maxHeight = canvas.height - pipeGap - 40;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + pipeGap,
        text: examTexts[Math.floor(Math.random() * examTexts.length)],
        passed: false
    });
}

function startGame() {
    player.y = 180;
    player.velocity = 0;
    pipes = [];
    score = 0;
    gameRunning = true;
    overlay.style.display = "none";
    
    spawnPipe();
    requestAnimationFrame(updateGame);
}

function gameOver() {
    gameRunning = false;
    overlay.style.display = "flex";
    startBtn.innerHTML = `Tekrar Dene ✍️<br><span style='font-size:0.9rem;'>Skor: ${score}</span>`;
}

function playerJump() {
    if (gameRunning) {
        player.velocity = player.jump;
    }
}

// Kontroller
window.addEventListener("keydown", (e) => { if(e.code === "Space") { e.preventDefault(); playerJump(); } });
canvas.addEventListener("touchstart", (e) => { e.preventDefault(); playerJump(); });
canvas.addEventListener("mousedown", playerJump);

// Oyun Döngüsü
function updateGame() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fizik hesaplamaları
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Tavan ve taban sınır kontrolleri
    if (player.y + player.height > canvas.height || player.y < 0) {
        gameOver();
        return;
    }

    // Oyuncuyu Çiz (Kaplan Emojisi Yapıldı 🐯)
    ctx.font = "30px Arial";
    ctx.fillText("🐯", player.x, player.y + 26);

    // Engelleri Yönet
    for (let i = pipes.length - 1; i >= 0; i--) {
        let p = pipes[i];
        p.x -= pipeSpeed;

        // Engel Tasarımı
        ctx.fillStyle = "rgba(255, 0, 64, 0.15)";
        ctx.strokeStyle = "#ff4d6d";
        ctx.lineWidth = 2;

        // Üst Engel
        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);

        // Alt Engel
        ctx.fillRect(p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);
        ctx.strokeRect(p.x, p.bottomY, pipeWidth, canvas.height - p.bottomY);

        // Yazılar
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x + pipeWidth/2, p.topHeight - 15);
        ctx.fillText(p.text, p.x + pipeWidth/2, p.bottomY + 25);

        // Çarpışma Algılayıcı (Görsel olarak tam çarpmadan yanmasın diye tolerans artırıldı)
        if (player.x + 8 < p.x + pipeWidth && player.x + player.width - 8 > p.x) {
            if (player.y + 8 < p.topHeight || player.y + player.height - 8 > p.bottomY) {
                gameOver();
                return;
            }
        }

        // Skor tablosu güncelleme
        if (!p.passed && p.x + pipeWidth < player.x) {
            p.passed = true;
            score++;
        }

        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    // Yeni engel üretme sıklığı (Yavaş hıza uygun olarak mesafe açıldı)
    if (pipes.length > 0 && pipes[pipes.length - 1].x < canvas.width - 220) {
        spawnPipe();
    }

    // Skoru Yazdır
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Segoe UI";
    ctx.textAlign = "left";
    ctx.fillText(`Geçilen Sınav: ${score}`, 20, 35);

    



    requestAnimationFrame(updateGame);
}

function sendMoralMessage() {
    // Ekranda önce güzel bir uyarı gösteriyoruz
    alert('Moral ve motivasyon enerjisi başarıyla gönderildi! 🚀 Sınavları dert etme, sen zaten en iyisini yapacaksın. Yanındayım! 🧠💪🔥');

    // Sizin telefon numaranız (Başında ülke koduyla, sıfır olmadan yazılmalı. Örn: 90505...)
    const telefonNumarasi = "905551869588"; 
    
    // Gaplanım'ın size göndereceği otomatik mesaj
    const mesaj = "Sınavlar vız gelir, moral deposu yüklendi! Desteğin için sağ ol kanka 🐯🔥";
    
    // WhatsApp yönlendirme linki (Hem mobil hem web uyumlu)
    const whatsappURL = `https://api.whatsapp.com/send?phone=${telefonNumarasi}&text=${encodeURIComponent(mesaj)}`;
    
    // Yeni sekmede WhatsApp'ı açar ve mesajı hazırlar
    window.open(whatsappURL, '_blank');
}
