// --- 1. 取得 DOM 元素 ---
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score-display');
const groundLine = document.getElementById('ground-line');

// --- 2. 遊戲狀態變數 ---
let isJumping = false;
let jumpCount = 0; 
let isGameOver = true;
let score = 0;

const MAX_JUMPS = 2;        // 雙重跳限制
const GROUND_POSITION = 20; // 主角在地面時的 bottom 值 (px)
const JUMP_VELOCITY = 15;   // 每次跳躍的起始速度
const GRAVITY = 1;          // 模擬重力加速度
const UPDATE_INTERVAL = 20; // 遊戲更新間隔 (毫秒)

let velocityY = 0; // 主角垂直速度
let jumpTimer = null; // 確保初始值為 null

let obstacleInterval; 
let scoreInterval;    

// --- 3. 核心功能：使用 JS 控制跳躍 (物理模擬) ---

function applyGravity() {
    let currentBottom = parseInt(window.getComputedStyle(player).bottom);
    
    // 應用重力，減慢向上速度或加速向下速度
    velocityY -= GRAVITY;     
    currentBottom += velocityY; 

    // 落地檢查：主角是否到達或穿過地面
    if (currentBottom <= GROUND_POSITION) {
        currentBottom = GROUND_POSITION;
        player.style.bottom = `${currentBottom}px`;
        
        // ============== 落地清理 (解決「只能跳一次」的關鍵) ==============
        velocityY = 0;
        isJumping = false;
        jumpCount = 0;           // 歸零跳躍次數，允許下次跳躍
        clearInterval(jumpTimer); 
        jumpTimer = null;        // 將計時器標記為 null，允許重新啟動
        return; // 落地後停止執行
    }

    player.style.bottom = `${currentBottom}px`;
}

function startJumpLoop() {
    // 避免重複啟動多個定時器
    if (jumpTimer) {
        clearInterval(jumpTimer);
    }
    // 每 20 毫秒執行一次重力模擬
    jumpTimer = setInterval(applyGravity, UPDATE_INTERVAL); 
}

function handleJump() {
    if (isGameOver) {
        startGame();
        return;
    }

    if (jumpCount >= MAX_JUMPS) {
        return;
    }

    jumpCount++;
    isJumping = true;
    
    // 重設向上的初始速度，實現新鮮的跳躍或雙重跳
    velocityY = JUMP_VELOCITY; 
    
    // 僅在定時器停止時才啟動 (落地後 jumpTimer 會被設為 null)
    if (jumpTimer === null) {
        startJumpLoop();
    }
}


// --- 4. 障礙物生成與移動 ---
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
}


// --- 6. 遊戲結束功能 ---
function gameOver() {
    isGameOver = true;
    
    clearInterval(obstacleInterval);
    clearInterval(scoreInterval);
    clearInterval(jumpTimer); 
    jumpTimer = null;

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
    player.style.bottom = `${GROUND_POSITION}px`; // 確保主角在地面

    obstacle.style.right = '-20px'; 
    obstacle.style.height = '40px'; 
    
    scoreDisplay.textContent = '分數: 0'; 
    
    generateObstacle();
    obstacleInterval = setInterval(generateObstacle, 3000); 
    
    scoreInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `分數: ${Math.floor(score / 10)}`;
    }, 100);

    // 啟動重力循環，確保主角可以落地
    startJumpLoop(); 
    
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
