
// <!-- L3-WN-Player Class Sprite loading-3/04/26 -->




class Player {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        
        // <!-- L3-WN-Player Gravity Attributes-3/09/26 -->
        this.vy = 0;              // Current vertical velocity
        this.gravity = 0.5;       // How fast they get pulled down
        this.maxFallSpeed = 10;   // Terminal velocity (max fall speed)
        this.jumpForce = 12;
        this.isGrounded = false;
        
        
        this.width = 40; 
        this.height = 40; 

        // Add a movement speed (pixels per frame)
        this.speed = 5; 

        // <!-- L3-WN-Friction and Acceleration-3/06/26 -->
        this.vx = 0;             // Current horizontal velocity
        this.maxSpeed = 6;       // Top speed the player can reach
        this.acceleration = 1.2; // How quickly they speed up
        this.friction = 0.8;     // How quickly they slide to a stop (closer to 1 = ice, closer to 0 = mud)
        this.airFriction = 0.95;
        this.sprites = {};
        this.currentSprite = null;
        this.state = 'idle';

        // Load your initial default sprite
        this.loadSprite('idle', 'assets/player/idle.png');
        this.loadSprite('walk', 'assets/player/walk.png');
        // examples for future sprites
        // this.loadSprite('run', 'assets/player/run.png');
        // this.loadSprite('jump', 'assets/player/jump.png'); etc...
    }

    /**
     * Loads a new image and adds it to the sprites dictionary.
     */
    loadSprite(stateName, imagePath) {
        const img = new Image();
        img.src = imagePath;
        this.sprites[stateName] = img;

        // Set the very first loaded image as the active one to prevent drawing errors
        if (!this.currentSprite) {
            this.currentSprite = img;
        }
    }

    /**
     * Changes the active sprite being drawn based on the passed state.
     */
    setSpriteState(newState) {
        if (this.sprites[newState] && this.state !== newState) {
            this.state = newState;
            this.currentSprite = this.sprites[newState];
        }
    }

    update(keys) {
        // --- HORIZONTAL MOVEMENT ---
        if (keys.ArrowLeft || keys.a) {
            this.vx -= this.acceleration;
        }
        if (keys.ArrowRight || keys.d) {
            this.vx += this.acceleration;
        }

        // --- THE REPLACED FRICTION LOGIC ---
        if (this.isGrounded) {
            this.vx *= this.friction;    // Use sticky ground friction (0.8)
        } else {
            this.vx *= this.airFriction; // Use slippery air friction (0.95)
        }
        // -----------------------------------

        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        else if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;

        // Apply X velocity and immediately check X collisions
        this.x += this.vx;
        this.checkCollisions('x');

        // Wrap logic (Keep your custom 70/680 numbers here)
        if (this.x > 680) this.x = 70; 
        else if (this.x < 70) this.x = 680; 

        // --- VERTICAL MOVEMENT ---
        // 1. Jump (Only if we are touching a floor/platform!)
        if ((keys.ArrowUp || keys.w) && this.isGrounded) {
            this.vy = -this.jumpForce; 
            this.isGrounded = false; 
        }

        // 2. Apply Gravity
        this.vy += this.gravity;
        if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;

        // Apply Y velocity, reset ground check, and immediately check Y collisions
        this.y += this.vy;
        this.isGrounded = false; 
        this.checkCollisions('y');

        // --- TOP & BOTTOM SCREEN TRIGGERS ---
        // Top of screen
        if (this.y < 0) {
            console.log("Hit Top of Screen!");
        }
        // Bottom of screen (12 tiles * 40px = 480px total height)
        if (this.y > 480) {
            console.log("Hit Bottom of Screen!");
        }
    }

    draw(ctx) {
        // Only attempt to draw the image if it has fully loaded
        if (this.currentSprite && this.currentSprite.complete) {
            ctx.drawImage(this.currentSprite, this.x, this.y, this.width, this.height);
        } else {
            // Fallback yellow box just in case the image path is broken or loading is slow
            ctx.fillStyle = '#ffc107'; 
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
       
    }
    // <!-- L3-WN-Collision Detection-3/09/26 -->
    checkCollisions(axis) {
        // Grab the level data
        if (!levels || levels.length === 0) return;
        const data = levels[currentLevelIndex].data;

        for (let i = 0; i < data.length; i++) {
            const tile = data[i];

            // Skip empty tiles and the Start tile
            if (tile === ' ' || tile === '0' || tile === 'S') continue;

            // Calculate exact tile coordinates on the canvas
            // If your level grid is offset by 70px to the right, change this to: ((i % COLS) * TILE_SIZE) + 70;
            const tileX = (i % COLS) * TILE_SIZE; 
            const tileY = Math.floor(i / COLS) * TILE_SIZE;

            // Check if the player is intersecting with this tile
            const isColliding = (
                this.x < tileX + TILE_SIZE &&
                this.x + this.width > tileX &&
                this.y < tileY + TILE_SIZE &&
                this.y + this.height > tileY
            );

            if (isColliding) {
                // --- TRIGGER TILES (Hazard / Finish) ---
                if (tile === 'H') { // Change 'H' to your hazard letter
                    console.log("Hit Hazard!");
                } else if (tile === 'F') { // Change 'F' to your finish letter
                    console.log("Hit Finish Line!");
                }

                // --- FULL COLLISION (Ground) ---
                if (tile === 'G') { // Change 'G' to your ground letter
                    if (axis === 'x') {
                        if (this.vx > 0) { // Moving right, hit left wall
                            this.x = tileX - this.width;
                            this.vx = 0;
                        } else if (this.vx < 0) { // Moving left, hit right wall
                            this.x = tileX + TILE_SIZE;
                            this.vx = 0;
                        }
                    } else if (axis === 'y') {
                        if (this.vy > 0) { // Falling down, hit floor
                            this.y = tileY - this.height;
                            this.vy = 0;
                            this.isGrounded = true; // We can jump again!
                        } else if (this.vy < 0) { // Jumping up, hit ceiling
                            this.y = tileY + TILE_SIZE;
                            this.vy = 0;
                        }
                    }
                }

                // --- ONE-WAY COLLISION (Platforms) ---
                if (tile === 'P' && axis === 'y') { // Change 'P' to your platform letter
                    // We need to know where the player's bottom was exactly one frame ago
                    const prevBottom = (this.y - this.vy) + this.height;

                    // Only land if we are falling AND our previous bottom was ABOVE the platform
                    // This is what allows us to jump up through it!
                    if (this.vy > 0 && prevBottom <= tileY + 0.1) { 
                        this.y = tileY - this.height;
                        this.vy = 0;
                        this.isGrounded = true;
                    }
                }
            }
        }
    }
 



    
}

