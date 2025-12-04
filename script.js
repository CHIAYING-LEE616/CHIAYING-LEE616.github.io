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

    // 啟動跳躍
    isJumping = true;
    jumpCount++;
    
    // 移除舊的跳躍 class，強制重繪，以便重新啟動動畫
    player.classList.remove('jump');
    void player.offsetWidth; 
    
    // 加上跳躍 class，啟動 CSS 動畫
    player.classList.add('jump');
}

// 監聽 CSS 動畫結束事件 (用於判斷是否回到地面，並重置跳躍計數)
player.addEventListener('animationend', (event) => {
    if (event.animationName === 'playerJump') {
        // 確保動畫播放完畢後，如果主角真的在地面位置，則重置跳躍計數
        const playerBottom = parseInt(window.getComputedStyle(player).bottom);
        if (playerBottom <= 20) { // 20px 是地面高度
             jumpCount = 0;
        }
    }
});


// --- 4. 障礙物生成與移動 ---
function generateObstacle() {
    // 移除舊的障礙物動畫，準備重新設定
    obstacle.style.animation = 'none';
    
    // 隨機障礙物速度 (讓遊戲更有挑戰性，範圍從 1.5s (快) 到 4s (慢))
    const randomDuration = Math.random() * 2.5 + 1.5; 
    
    // 隨機障礙物高度
    const randomHeight = Math.random() < 0.5 ? 40 : 60; 
    obstacle.style.height = `${randomHeight}px`;
    obstacle.style.width = '20px'; // 保持寬度一致

    // 重新設定動畫，使用隨機速度
    obstacle.style.animation = `moveObstacle ${randomDuration}s linear infinite`;
}


// --- 5. 碰撞檢測 ---
function checkCollision() {
    if (isGameOver) return;
    
    // 獲取元素在視口中的位置和大小
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // 碰撞條件：四個邊界是否重疊
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
    player.style.animation = 'none'; // 停止主角呼吸/站立動畫
    obstacle.style.animation = 'none'; // 停止障礙物移動
    groundLine.style.animation = 'none'; // 停止地面移動

    // 顯示遊戲結束畫面 (使用內建 alert，您可以替換成更美觀的 DOM 彈窗)
    alert(`💥 遊戲結束！您的最終分數是: ${Math.floor(score / 10)} 分\n\n按下「Space」或「上鍵」重新開始！`);
}

// --- 7. 遊戲主循環 ---
function gameLoop() {
    // 持續檢查碰撞
    checkCollision();
    
    // 透過 requestAnimationFrame 實現更流暢的動畫和循環
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- 8. 遊戲啟動 ---
function startGame() {
    if (!isGameOver) return; // 避免重複啟動

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
    
    // 顯示初始分數
    scoreDisplay.textContent = '分數: 0'; 
    
    // 啟動障礙物生成與移動
    generateObstacle();
    // 設定定時器：讓障礙物在移動結束前重新生成
    obstacleInterval = setInterval(generateObstacle, 3000); 
    
    // 設定定時器：分數計算 (每 100 毫秒加分)
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
        event.preventDefault(); // 防止按鍵默認行為
        handleJump();
    }
});

// 監聽點擊事件 (用於移動設備和開始遊戲)
gameContainer.addEventListener('click', () => {
    handleJump();
});


// 初始提示與遊戲開始
document.addEventListener('DOMContentLoaded', () => {
    // 遊戲啟動時的初始提示
    alert('按下「Space」或「上鍵」開始跑酷遊戲！');
});
