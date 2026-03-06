
// <!-- L3-WN-Player Class Sprite loading-3/04/26 -->




class Player {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;

        this.width = 40; 
        this.height = 40; 

        // Add a movement speed (pixels per frame)
        this.speed = 5; 

        // <!-- L3-WN-Friction and Acceleration-3/06/26 -->
        this.vx = 0;             // Current horizontal velocity
        this.maxSpeed = 6;       // Top speed the player can reach
        this.acceleration = 1.2; // How quickly they speed up
        this.friction = 0.8;     // How quickly they slide to a stop (closer to 1 = ice, closer to 0 = mud)

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

        if (keys.ArrowLeft || keys.a) {
            this.vx -= this.acceleration;
        }
        if (keys.ArrowRight || keys.d) {
            this.vx += this.acceleration;
        }

        // 2. Apply friction (this runs every frame, naturally slowing the player down)
        this.vx *= this.friction;

        // 3. Clamp the velocity to the maximum speed
        if (this.vx > this.maxSpeed) {
            this.vx = this.maxSpeed;
        } else if (this.vx < -this.maxSpeed) {
            this.vx = -this.maxSpeed;
        }

        // 4. Stop completely if the movement is microscopic (prevents infinite sliding decimals)
        if (Math.abs(this.vx) < 0.1) {
            this.vx = 0;
        }

        // 5. Finally, apply the velocity to the player's actual X position
        this.x += this.vx;



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
   
 



    
}

