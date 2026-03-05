 

// <!-- L3-WN-Canvas Setup-3/03/26 -->
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const leaderboardCanvas = document.getElementById('leaderboard');
const leaderboardCtx = leaderboardCanvas.getContext('2d');

let gameState = 'START'; 
let lives = 3;
let startTime = 0;
let currentLevelIndex = 0;
let levels = [];
let activePlayer;
// <!-- L3-WN-Add Listening for Keys-3/05/26 -->
// Track which keys are currently being held down
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    d: false
};

// Listen for keys being pressed
window.addEventListener('keydown', function(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

// Listen for keys being released
window.addEventListener('keyup', function(event) {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});
const playButtonRect = { 
    x: canvas.width / 2 - 100, 
    y: canvas.height / 2 + 20, 
    w: 200, 
    h: 60 
};




const TILE_SIZE = 40;
const COLS = 20;
const ROWS = 12;





const imagePaths = {
    'G': 'assets/ground.png',
    'P': 'assets/platform.png',
    'X': 'assets/hazard.png',
    'S': 'assets/start.png',
    'F': 'assets/finish.png'
};


const images = {};
let imagesLoaded = 0;
const totalImages = Object.keys(imagePaths).length;




function drawLevel(levelIndex) {
    
    if (!levels || levels.length === 0) return;

    const level = levels[levelIndex];
    const data = level.data;

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    
    for (let i = 0; i < data.length; i++) {
        const char = data[i];

      
        if (char === '0') continue; 

        
        const x = (i % COLS) * TILE_SIZE;
        const y = Math.floor(i / COLS) * TILE_SIZE;

       
        if (images[char]) {
            ctx.drawImage(images[char], x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    // <!-- L3-WN-Hint Rendering-3/03/26 -->
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(level.hint, canvas.width / 2, 30);
}
// <!-- L3-WN-Play Button Function-3/04/26 -->
function drawStartScreen() {
    ctx.fillStyle = '#212529'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Perfect Platforms', canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(playButtonRect.x, playButtonRect.y, playButtonRect.w, playButtonRect.h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText('PLAY', canvas.width / 2, playButtonRect.y + 38);
}
// <!-- L3-WN-Placeholder Leaderboard Function-3/03/26 -->
function initLeaderboard() {
    leaderboardCtx.fillStyle = '#212529'; 
    leaderboardCtx.fillRect(0, 0, leaderboardCanvas.width, leaderboardCanvas.height);

    leaderboardCtx.fillStyle = '#ffffff';
    leaderboardCtx.font = 'bold 18px Arial, sans-serif';
    leaderboardCtx.textAlign = 'center';
    leaderboardCtx.fillText('Top Scores', leaderboardCanvas.width / 2, 30);
}

// <!-- L3-WN-Image Loading after JSON is ready.-3/03/26 -->
function preloadImages() {
    for (const key in imagePaths) {
        images[key] = new Image();
        images[key].src = imagePaths[key];

        images[key].onload = function() {
            imagesLoaded++;

            // If all images are loaded, initialize the game visually
               // <!-- L3-WN-Game Start Function-3/04/26 -->
            if (imagesLoaded === totalImages) {
                    initLeaderboard();
                    if (gameState === 'START') {
                        drawStartScreen();
                    } else {
                        drawLevel(currentLevelIndex);
                    }
                }
            
            
        };

        images[key].onerror = function() {
            console.error(`Failed to load asset: ${imagePaths[key]}`);

            // <!-- L3-WN-Ensures that game loads even if assets are missing-3/03/26 -->
            imagesLoaded++; 

            if (imagesLoaded === totalImages) {
                initLeaderboard();
                if (gameState === 'START') {
                    drawStartScreen();
                } else {
                    drawLevel(currentLevelIndex);
                }
            }
        };
    }
}

canvas.addEventListener('click', function(event) {
    if (gameState === 'START') {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const mouseX = (event.clientX - rect.left) * scaleX;
        const mouseY = (event.clientY - rect.top) * scaleY;

        if (mouseX >= playButtonRect.x && mouseX <= playButtonRect.x + playButtonRect.w &&
            mouseY >= playButtonRect.y && mouseY <= playButtonRect.y + playButtonRect.h) {
            startGame();
        }
    }
});
 // <!-- L3-Spawn Player at the 'S' Tile-3/05/26 -->
function getSpawnPosition(levelIndex) {
    if (!levels || levels.length === 0) return { x: 50, y: 50 }; 

    const data = levels[levelIndex].data;

    for (let i = 0; i < data.length; i++) {
        if (data[i] === 'S') {
            const x = (i % COLS) * TILE_SIZE;
            const y = Math.floor(i / COLS) * TILE_SIZE;
            return { x: x, y: y };
        }
    }

    return { x: 50, y: 50 }; 
}
// The main game loop that runs every frame
function gameLoop() {
    if (gameState !== 'PLAYING') return;

    // 1. Update the player's position based on keys pressed
    if (activePlayer) {
        activePlayer.update(keys);
    }

    // 2. Clear the screen and redraw the level
    drawLevel(currentLevelIndex);

    // 3. Draw the player at their new position
    if (activePlayer) {
        activePlayer.draw(ctx);
    }

    // 4. Ask the browser to run this loop again for the next frame
    requestAnimationFrame(gameLoop);
}
function startGame() {
    gameState = 'PLAYING';
    lives = 3;
    currentLevelIndex = 0;
    startTime = Date.now();

    const spawnCoords = getSpawnPosition(currentLevelIndex);
    activePlayer = new Player(spawnCoords.x, spawnCoords.y);

    const leaderboardCard = document.getElementById('leaderboard').closest('.card');
    if (leaderboardCard) {
        leaderboardCard.style.display = 'none';
    }

    // Start the continuous game loop!
    requestAnimationFrame(gameLoop);
}
    

// <!-- L3-WN-Loading images after JSON has loaded-3/03/26 -->
window.onload = async function() {
    try {
        const response = await fetch('assets/levels.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        levels = await response.json();
        console.log("Levels loaded successfully:", levels);

      
        preloadImages();

    } catch (error) {
        console.error("Could not load levels.json. Are you running a local web server?", error);

        // <!-- L3-WN-Error Message-3/03/26 -->
        ctx.fillStyle = '#dc3545'; // Danger Red
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading assets/levels.json!', canvas.width / 2, canvas.height / 2);
        ctx.fillText('Check the console for details.', canvas.width / 2, (canvas.height / 2) + 30);
    }
};


    window.addEventListener('keydown', function(event) {
      // <!-- L3-WN-Debug Feature for Viewing Levels-3/03/26 -->
         // <!-- L3-WN-Fix for level changes-3/05/26 -->
        if (!levels || levels.length === 0) return;

            if (event.key === '9') {
                if (currentLevelIndex > 0) {
                    currentLevelIndex--;

                    // Get the new 'S' tile position for this level
                    const newSpawn = getSpawnPosition(currentLevelIndex);
                    if (activePlayer) {
                        activePlayer.x = newSpawn.x;
                        activePlayer.y = newSpawn.y;
                    }

                    drawLevel(currentLevelIndex);
                    if (activePlayer) activePlayer.draw(ctx); 
                    console.log("Switched to level:", currentLevelIndex + 1);
                }
            } else if (event.key === '0') {
                if (currentLevelIndex < levels.length - 1) {
                    currentLevelIndex++;

                    // Get the new 'S' tile position for this level
                    const newSpawn = getSpawnPosition(currentLevelIndex);
                    if (activePlayer) {
                        activePlayer.x = newSpawn.x;
                        activePlayer.y = newSpawn.y;
                    }

                    drawLevel(currentLevelIndex);
                    if (activePlayer) activePlayer.draw(ctx); 
                    console.log("Switched to level:", currentLevelIndex + 1);
                }
            }
        });
