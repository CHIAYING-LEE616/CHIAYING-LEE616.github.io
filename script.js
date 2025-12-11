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
        // 如果遊戲結束，按下跳躍鍵則重新開始遊戲
        startGame();
        return;
    }

    // 檢查跳躍次數是否已達上限
    if (jumpCount >= MAX_JUMPS) {
        return;
    }

    isJumping = true;
    jumpCount++;
    
    // 步驟 1: 移除 jump class
    player.classList.remove('jump');
    // 步驟 2: 強制瀏覽器重繪/重計算 (解決無法重複觸發跳躍的關鍵)
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
        
        // 確保動畫結束後，將 jump class 移除，讓主角回到靜止狀態。
        player.classList.remove('jump');
    }
});


// --- 4. 障礙物生成與移動 ---
function generateObstacle() {
    obstacle.style.animation = 'none';
    
    // 隨機障礙物速度 (1.5s (快) 到 4s (慢))
    const randomDuration = Math.random() * 2.5 + 1.5; 
    
    // 隨機障礙物高度
    const randomHeight = Math.random() < 0.5 ? 40 : 60; 
    obstacle.style.height = `${randomHeight}px`;
    obstacle.style.width = '20px';

    // 重新設定動畫，使用隨機速度
    obstacle.style.animation = `moveObstacle ${randomDuration}s linear forwards`; 
}


// --- 5. 碰撞檢測 ---
function checkCollision() {
    if (isGameOver) return;
    
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // 判斷水平和垂直是否重疊
    const horizontalOverlap = 
        playerRect.left < obstacleRect.right && 
        playerRect.right > obstacleRect.left;

    const verticalOverlap = 
        playerRect.top < obstacleRect.bottom && 
        playerRect.bottom > obstacleRect.top;

    if (horizontalOverlap && verticalOverlap) {
        gameOver();
    }
}


// --- 6. 遊戲結束功能 ---
function gameOver() {
    isGameOver = true;
    
    // 停止所有定時器
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);

    // 停止所有動畫
    player.style.animation = 'none'; 
    obstacle.style.animation = 'none'; 
    groundLine.style.animation = 'none'; 

    // 顯示遊戲結束訊息
    alert(`💥 遊戲結束！您的最終分數是: ${Math.floor(score / 10)} 分\n\n按下「Space」或「上鍵」重新開始！`);
}

// --- 7. 遊戲主循環 ---
function gameLoop() {
    checkCollision();
    
    // 透過 requestAnimationFrame 實現平滑循環
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- 8. 遊戲啟動 ---
function startGame() {
    if (!isGameOver) return; 

    // 重置狀態
    isGameOver = false;
    score = 0;
    jumpCount = 0;
    
    // 恢復動畫
    player.style.animation = ''; 
    groundLine.style.animation = ''; 

    // 重置障礙物位置和樣式
    obstacle.style.right = '-20px'; 
    obstacle.style.height = '40px'; 
    
    scoreDisplay.textContent = '分數: 0'; 
    
    // 啟動障礙物生成與移動
    generateObstacle();
    // 設定定時器：讓障礙物在 3 秒左右重新生成
    obstacleInterval = setInterval(generateObstacle, 3000); 
    
    // 設定定時器：分數計算
    scoreInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `分數: ${Math.floor(score / 10)}`;
    }, 100);

    // 啟動遊戲主循環 (處理碰撞)
    requestAnimationFrame(gameLoop);
}


// --- 9. 事件監聽 (Space 或 上箭頭) ---
document.addEventListener('keydown', (event) => {
    // Space (空白鍵) 或 ArrowUp (上箭頭)
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
