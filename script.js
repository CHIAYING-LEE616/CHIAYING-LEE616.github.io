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
let jumpTimer = null; 
// 移除 obstacleTimeout 變數
let scoreInterval;    

// --- 3. 核心功能：使用 JS 控制跳躍 (物理模擬) ---

function applyGravity() {
    let currentBottom = parseInt(window.getComputedStyle(player).bottom);
    
    velocityY -= GRAVITY;     
    currentBottom += velocityY; 

    // 落地檢查
    if (currentBottom <= GROUND_POSITION) {
        currentBottom = GROUND_POSITION;
        player.style.bottom = `${currentBottom}px`;
        
        // 落地清理
        velocityY = 0;
        isJumping = false;
        jumpCount = 0;           
        clearInterval(jumpTimer); 
        jumpTimer = null;        
        return; 
    }
    player.style.bottom = `${currentBottom}px`;
}

function startJumpLoop() {
    if (jumpTimer) {
        clearInterval(jumpTimer);
    }
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
    velocityY = JUMP_VELOCITY; 
    
    if (jumpTimer === null) {
        startJumpLoop();
    }
}


// --- 4. 障礙物生成與移動 ---
function generateObstacle() {
    // 步驟 1: 移除舊的動畫，將障礙物重置到右側起始點
    obstacle.style.animation = 'none';
    obstacle.style.right = '-20px'; 
    
    // 步驟 2: 強制瀏覽器重繪
    void obstacle.offsetWidth;
    
    // 步驟 3: 設置隨機速度 (動畫持續時間 1.5秒 ~ 4秒) 和高度
    // 速度隨機 ==> 障礙物之間的距離/時間就不固定
    const randomDuration = Math.random() * 2.5 + 1.5; 
    const randomHeight = Math.random() < 0.5 ? 40 : 60; 
    
    obstacle.style.height = `${randomHeight}px`;
    obstacle.style.width = '20px';
    
    // 步驟 4: 啟動新動畫
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
    
    clearInterval(scoreInterval);
    clearInterval(jumpTimer); 
    // 移除清除 obstacleTimeout 的邏輯
    jumpTimer = null;

    player.style.animation = 'none'; 
    groundLine.style.animation = 'none'; 
    
    // 確保障礙物停止並回到初始狀態
    obstacle.style.animation = 'none'; 
    obstacle.style.right = '-20px'; 
    
    alert(`💥 遊戲結束！您的最終分數是: ${Math.floor(score / 10)} 分\n\n按下「Space」或「上鍵」重新開始！`);
}

// --- 7. 遊戲主循環 ---
function gameLoop() {
    checkCollision();
    
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- 8. 遊戲啟動 (核心變動區：立刻生成第一個障礙物) ---
function startGame() {
    if (!isGameOver) return; 

    isGameOver = false;
    score = 0;
    jumpCount = 0;
    
    player.style.animation = ''; 
    groundLine.style.animation = ''; 
    player.style.bottom = `${GROUND_POSITION}px`; 

    // 重置並準備障礙物
    obstacle.style.animation = 'none';
    obstacle.style.right = '-20px'; 

    scoreDisplay.textContent = '分數: 0'; 
    
    // **NEW LOGIC: 遊戲開始時立刻生成第一個障礙物**
    generateObstacle(); 
    
    scoreInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `分數: ${Math.floor(score / 10)}`;
    }, 100);

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


// --- 10. 監聽障礙物動畫結束，自動生成下一個障礙物 ---
obstacle.addEventListener('animationend', (event) => {
    if (event.animationName === 'moveObstacle' && !isGameOver) {
        generateObstacle();
    }
});


// 初始提示
document.addEventListener('DOMContentLoaded', () => {
    alert('按下「Space」或「上鍵」開始跑酷遊戲！');
});
