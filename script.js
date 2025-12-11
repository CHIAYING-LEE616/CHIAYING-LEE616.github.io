 // --- 1. 取得 DOM 元素 ---
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score-display');
const groundLine = document.getElementById('ground-line');

// --- 2. 遊戲狀態變數 ---
let isJumping = false;
let jumpCount = 0; // 用於雙重跳
let isGameOver = true;
let score = 0;

const MAX_JUMPS = 2; // 雙重跳限制
let obstacleInterval; 
let scoreInterval;    

// --- 3. 核心功能：主角跳躍 ---
function handleJump() {
    if (isGameOver) {
        startGame();
        return;
    }

    if (jumpCount >= MAX_JUMPS) {
        return;
    }

    isJumping = true;
    jumpCount++;
    
    // 步驟 1: 移除 jump class
    player.classList.remove('jump');
    // 步驟 2: 強制瀏覽器重繪/重計算 (這是重新觸發 CSS 動畫的關鍵！)
    void player.offsetWidth; 
    
    // 步驟 3: 加上 jump class，啟動動畫
    player.classList.add('jump');
}

// 監聽 CSS 動畫結束事件
player.addEventListener('animationend', (event) => {
    // 只有在 'playerJump' 動畫結束時才執行邏輯
    if (event.animationName === 'playerJump') {
        
        // 判斷主角是否已經落回地面位置 (bottom: 20px)
        const playerBottom = parseInt(window.getComputedStyle(player).bottom);
        
        // 如果主角在地面，重置跳躍計數
        if (playerBottom <= 20) { 
             jumpCount = 0;
        }
        
        isJumping = false; 
        
        // **關鍵修正：** 確保動畫結束後，將 jump class 移除，讓主角回到靜止狀態。
        player.classList.remove('jump');
    }
});


// --- 4. 障礙物生成與移動 (其餘邏輯保持不變，因為跳躍問題與此無關) ---
function generateObstacle() {
    obstacle.style.animation = 'none';
    const randomDuration = Math.random() * 2.5 + 1.5; 
    const randomHeight = Math.random() < 0.5 ? 40 : 60; 
    obstacle.style.height = `${randomHeight}px`;
    obstacle.style.width = '20px';
    obstacle.style.animation = `moveObstacle ${randomDuration}s linear forwards`; 
}


// --- 5. 碰撞檢測 ---
function checkCollision() {
    if (isGameOver) return;
    
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const horizontalOverlap = 
        playerRect.left < obstacleRect.right && 
        playerRect.right > obstacleRect.left;

    const verticalOverlap = 
        playerRect.top < obstacleRect.bottom && 
        playerRect.bottom > obstacleRect.top;

    if (horizontalOverlap && verticalOverlap) {
        gameOver();
    }
    
    // 確保主角不會無限下落（雖然 CSS 已經處理，但作為安全機制）
    if (playerRect.bottom > gameContainer.getBoundingClientRect().bottom - 20) {
        player.style.bottom = '20px';
    }
}


// --- 6. 遊戲結束功能 ---
function gameOver() {
    isGameOver = true;
    
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);

    player.style.animation = 'none'; 
    obstacle.style.animation = 'none'; 
    groundLine.style.animation = 'none'; 

    alert(`💥 遊戲結束！您的最終分數是: ${Math.floor(score / 10)} 分\n\n按下「Space」或「上鍵」重新開始！`);
}

// --- 7. 遊戲主循環 ---
function gameLoop() {
    checkCollision();
    
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- 8. 遊戲啟動 ---
function startGame() {
    if (!isGameOver) return; 

    isGameOver = false;
    score = 0;
    jumpCount = 0;
    
    player.style.animation = ''; 
    groundLine.style.animation = ''; 

    obstacle.style.right = '-20px'; 
    obstacle.style.height = '40px'; 
    
    scoreDisplay.textContent = '分數: 0'; 
    
    generateObstacle();
    obstacleInterval = setInterval(generateObstacle, 3000); 
    
    scoreInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `分數: ${Math.floor(score / 10)}`;
    }, 100);

    requestAnimationFrame(gameLoop);
}


// --- 9. 事件監聽 (Space 或 上箭頭) ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault(); 
        handleJump();
    }
});

// 監聽點擊事件
gameContainer.addEventListener('click', () => {
    handleJump();
});


// 初始提示
document.addEventListener('DOMContentLoaded', () => {
    alert('按下「Space」或「上鍵」開始跑酷遊戲！');
});
