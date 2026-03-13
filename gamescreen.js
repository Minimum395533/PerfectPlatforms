 

// <!-- L3-WN-Canvas Setup-3/03/26 -->
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const leaderboardCanvas = document.getElementById('leaderboard');
const leaderboardCtx = leaderboardCanvas.getContext('2d');

let gameState = 'START'; 
let lives = 3;
let startTime = 0;
let currentLevelIndex = 1;
// this is on purpose not 0, -1 is finish, but the numbers are freaky deaky
let levels = [];
let activePlayer;
// <!-- L3-WN-Add Listening for Keys-3/05/26 -->
// Track which keys are currently being held down
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    a: false,
    d: false,
    w: false
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
async function initLeaderboard() {
    // 1. ERASE THE CANVAS! We have to wipe the old scores before drawing the new ones
    leaderboardCtx.clearRect(0, 0, leaderboardCanvas.width, leaderboardCanvas.height);

    try {
        // 2. THE ULTIMATE CACHE BUSTER: Add "?t=" + Date.now() to trick the browser
        const response = await fetch(`get_leaderboard.php?t=${Date.now()}`, { cache: 'no-store' });
        const topScores = await response.json();

        // 3. Loop through the data and draw each player
        leaderboardCtx.textAlign = 'left';
        let yOffset = 70; // Starting Y position for the first score

        if (topScores.length === 0) {
            leaderboardCtx.fillStyle = '#adb5bd';
            leaderboardCtx.font = '14px Arial, sans-serif';
            leaderboardCtx.textAlign = 'center';
            leaderboardCtx.fillText('No scores yet!', leaderboardCanvas.width / 2, yOffset);
            return;
        }

        topScores.forEach((player, index) => {
            // Draw Rank & Name
            leaderboardCtx.fillStyle = '#ffc107'; // Gold for rank
            leaderboardCtx.font = 'bold 14px Arial, sans-serif';
            leaderboardCtx.fillText(`#${index + 1}`, 10, yOffset);

            leaderboardCtx.fillStyle = '#ffffff'; 
            let displayName = player.playerName.length > 10 ? player.playerName.substring(0, 8) + '...' : player.playerName;
            leaderboardCtx.fillText(displayName, 35, yOffset);

            // Draw Score (Level) and Time
            yOffset += 20;
            leaderboardCtx.fillStyle = '#adb5bd'; // Light gray for stats
            leaderboardCtx.font = '12px Arial, sans-serif';
            leaderboardCtx.fillText(`Lvl: ${player.score} | Time: ${Number(player.Time).toFixed(2)}s`, 35, yOffset);

            yOffset += 30; // Add space before the next player
        });

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardCtx.fillStyle = '#dc3545';
        leaderboardCtx.font = '12px Arial, sans-serif';
        leaderboardCtx.textAlign = 'center';
        leaderboardCtx.fillText('Offline', leaderboardCanvas.width / 2, 70);
    } 
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
    drawLivesDisplay(ctx, lives);
    // 4. Ask the browser to run this loop again for the next frame
    requestAnimationFrame(gameLoop);
}
function startGame() {
    gameState = 'PLAYING';
    lives = 3;
    currentLevelIndex = 1;
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
// <!-- L3-WN-Add Lives-3/09/26 -->
function handleDeath() {
    lives--; // Take away a life

    if (lives > 0) {
        // Respawn the player at the start of the current level
        const spawnCoords = getSpawnPosition(currentLevelIndex);
        activePlayer.x = spawnCoords.x;
        activePlayer.y = spawnCoords.y;

        // Reset velocity so they don't carry momentum from their death!
        activePlayer.vx = 0;
        activePlayer.vy = 0;

        // UNLOCK the player so they can interact with tiles again!
        activePlayer.isDone = false; 

    }  else {
        // changed to end state
        triggerEndState(false); // false = they lost
        
    }
}
// <!-- L3-WN-Display Lives-3/13/26 -->
//oooOooH spooky, I added this on friday the 13th, its gonna be cursed
function drawLivesDisplay(ctx, currentLives) {
    // Customize your bars here!
    const barWidth = 30;
    const barHeight = 8;
    const gap = 5;       // Space between each bar
    const startX = 20;   // Distance from the left side of the screen
    const startY = 20;   // Distance from the top of the screen

    // Set the paintbrush to a nice, bright green
    ctx.fillStyle = '#4CAF50'; 

    // Loop through however many lives the player currently has
    for (let i = 0; i < currentLives; i++) {
        // Calculate the Y position so they stack nicely
        // (i * (barHeight + gap)) pushes each new bar down below the last one
        let currentY = startY + (i * (barHeight + gap));

        ctx.fillRect(startX, currentY, barWidth, barHeight);
    }
}
function handleLevelComplete() {
    // 1. Did they just beat the final level (index 0)?
    if (currentLevelIndex === 0) {
        triggerEndState(true); // Now trigger the final popup!
        return; 
    }

    // 2. Otherwise, move to the next level
    currentLevelIndex++;

    // 3. Check if we just beat the final normal level
    if (currentLevelIndex >= levels.length) {
        // Send them to the special victory lap level!
        currentLevelIndex = 0; 
    }

    // 4. Move the player to the new start position
    const spawnCoords = getSpawnPosition(currentLevelIndex);
    activePlayer.x = spawnCoords.x;
    activePlayer.y = spawnCoords.y;
    activePlayer.vx = 0;
    activePlayer.vy = 0;
    activePlayer.isDone = false;
}
function resetToMainMenu() {
    // 1. Reset the State Machine
    gameState = 'START';

    // 2. Reset Global Game Stats
    currentLevelIndex = 1; 
    lives = 3;             

    // 3. Reset the Player Object (if it exists)
    if (activePlayer) {
        activePlayer.totalJumps = 0;
    }

    // 4. Clear the Canvas and draw your ACTUAL start screen!
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStartScreen(); 
//init leaderboard here so it updates :3
    initLeaderboard();
}
function triggerEndState(didWin) {
    gameState = 'GAME_OVER'; 
    const leaderboardCard = document.getElementById('leaderboard').closest('.card');
    if (leaderboardCard) {
        leaderboardCard.style.display = 'flex';
    }

    // 1. Calculate all the required data points
    const timeSpent = Number(((Date.now() - startTime) / 1000).toFixed(2)); 
    const finalScore = didWin ? 0 : currentLevelIndex; // Let's ensure Level 0 is recorded if they win!
    const finalLives = didWin ? lives : 0; 
    const jumps = activePlayer ? activePlayer.totalJumps : 0;
    const currentTimestamp = Math.floor(Date.now() / 1000); 

    // 2. Darken the gamefield
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw the Popup Title
    ctx.fillStyle = didWin ? '#20c997' : '#dc3545'; 
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(didWin ? 'YOU WIN!' : 'GAME OVER', canvas.width / 2, 130);

    // 4. Draw the Data Points
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(`Level Reached: ${finalScore}`, canvas.width / 2, 190);
    ctx.fillText(`Time: ${timeSpent}s`, canvas.width / 2, 230);
    ctx.fillText(`Lives Remaining: ${finalLives}`, canvas.width / 2, 270);
    ctx.fillText(`Total Jumps: ${jumps}`, canvas.width / 2, 310);

    ctx.font = '18px Arial, sans-serif';
    ctx.fillStyle = '#adb5bd';
    ctx.fillText('Check your browser prompt to save your score!', canvas.width / 2, 400);

    // 5. Ask for name and send to PHP
    setTimeout(() => {
        let name = prompt("Enter your player name for the Leaderboard:");
        if (!name || name.trim() === "") name = "Anonymous";

        const gameData = {
            playerName: name,
            score: finalScore,
            Time: timeSpent,
            dateTime: currentTimestamp,
            Livesremaining: finalLives,
            TotalJumps: jumps
        };

        // Beam the data to our PHP script
        // Beam the data to our PHP script
        fetch('save_score.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gameData)
        })
        .then(async response => {   // <--- 1. We make this block 'async'

            // Read the JSON data
            const data = await response.json();
            console.log("Server response:", data);

            // --- THE NEW SEAMLESS LOOP CODE ---

            // 2. Refresh the leaderboard visually on the canvas AND WAIT for it to finish
            await initLeaderboard();  // <--- 3. We 'await' the fetch here!

            // 4. Reset the game state and go back to the start menu ONLY AFTER the above is done
            resetToMainMenu(); 
        })
        .catch(error => {
            console.error("Error saving score:", error);
            // Even if the save fails, we should still let them play again
            resetToMainMenu();
        });

    }, 100); 
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
