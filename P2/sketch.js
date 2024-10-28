// Helpful variables
const tilemap_size = 800;
const tile_size = 20;
const num_tiles = 800 / 20;
const enemy_chase_dist_px = 150;
const enemy_chase_dist_tiles = enemy_chase_dist_px / 20;

// variables for important game objects/mechanics
var key_codes = [];
var character;
var enemies = [];
var obstacles = [];
var prizes = [];
var score = 0;
var prize_image;

// Tile map variable used for initialization 40x40
// c = Character
// p = prize
// e = enemy
// o = obstacle
const tile_map = [
    "                                        ",
    "     p                               p  ",
    "                        e               ",
    "            o                           ",
    "    e                                   ",
    "                                e       ",
    "          p                p        o   ",
    "                                        ",
    "       o              o                 ",
    "    e                                   ",
    "                  e                     ",
    "                                     e  ",
    "                                        ",
    "   p   o                                ",
    "                p     e        p        ",
    "                                        ",
    "                                        ",
    "                                     e  ",
    "                           o            ",
    "       e                                ",
    "                                        ",
    "   p                     e         p    ",
    "                                   o    ",
    "             o             p            ",
    "                                        ",
    "                                        ",
    "    e                                   ",
    "                                        ",
    "                  p             e       ",
    "       o                    o           ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "         p                              ",
    "                                        ",
    "                                        ",
    "                                   c    ",
    "                                        ",
];

// Class for the character
class Character {
    // Initialize the pos, speed, acceleration, and friction
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.speed = [0, 0];
        this.accel = [0, 0];
        this.friction = [0, 0];
        this.dead = false;
    }

    // Check for prize collision
    check_prizes() {
        for (var i = 0; i < prizes.length; i++) {
            if (
                !prizes[i].collected &&
                round(this.x) === prizes[i].x &&
                round(this.y) === prizes[i].y
            ) {
                // Collect the prize and adjust the score
                prizes[i].collected = true;
                score++;
            }
        }
    }

    // Check for enemy collision
    check_enemies() {
        for (var i = 0; i < enemies.length; i++) {
            if (
                enemies[i].alive &&
                round(this.x) === round(enemies[i].x) &&
                round(this.y) === round(enemies[i].y)
            ) {
                // Kill character
                this.dead = true;
            }
        }
    }

    // Check for obstacle collision
    check_obstacles() {
        for (var i = 0; i < obstacles.length; i++) {
            if (
                (
                    (
                        this.x < obstacles[i].x + 1 &&
                        this.x > obstacles[i].x
                    ) ||
                    (
                        this.x + 1 < obstacles[i].x + 1 &&
                        this.x + 1 > obstacles[i].x
                    )
                ) &&
                    (
                        (
                            this.y < obstacles[i].y + 1 &&
                            this.y > obstacles[i].y
                        ) ||
                        (
                            this.y + 1 < obstacles[i].y + 1 &&
                            this.y + 1 > obstacles[i].y
                        )
                    )
            ) {
                // Flip speed
                this.speed[0] *= -5;
                this.speed[1] *= -5;

                // Move character back so a second collision does not happen
                if (this.x < obstacles[i].x) {
                    this.x -= 0.1;
                }
                if (this.x > obstacles[i].x) {
                    this.x += 0.1;
                }
                if (this.y < obstacles[i].y) {
                    this.y -= 0.1;
                }
                if (this.y > obstacles[i].y) {
                    this.y += 0.1;
                }
            }
        }
    }

    update_and_draw() {
        if (!this.dead) {
            fill(0, 0, 255);

            // Get player input and set acceleration
            if (key_codes[UP_ARROW] === 1) {
                this.accel[1] = -0.04;
            }
            else if (key_codes[DOWN_ARROW] === 1) {
                this.accel[1] = 0.04;
            }
            else {
                this.accel[1] = 0;
            }

            // Apply friction in the opposite direction of the speed
            if (this.speed[1] < 0) {
                this.friction[1] = 0.02;
            }
            if (this.speed[1] > 0) {
                this.friction[1] = -0.02;
            }

            // Get input
            if (key_codes[RIGHT_ARROW] === 1) {
                this.accel[0] = 0.04;
            }
            else if (key_codes[LEFT_ARROW] === 1) {
                this.accel[0] = -0.04;
            }
            else {
                this.accel[0] = 0;
            }

            // Apply friction
            if (this.speed[0] < 0) {
                this.friction[0] = 0.02;
            }
            if (this.speed[0] > 0) {
                this.friction[0] = -0.02;
            }

            // If speed is small set to zero and set friction to zero
            if (this.speed[0] < 0.001 && this.speed[0] > -0.001) {
                this.speed[0] = 0;
                this.friction[0] = 0;
            }
            if (this.speed[1] < 0.001 && this.speed[1] > -0.001) {
                this.speed[1] = 0;
                this.friction[1] = 0;
            }

            // apply accel and friction to speed
            this.speed[0] += this.accel[0] + this.friction[0];
            this.speed[1] += this.accel[1] + this.friction[1];

            // Cap speed
            if (this.speed[0] > 0.1) {
                this.speed[0] = 0.1;
            }
            if (this.speed[0] < -0.1) {
                this.speed[0] = -0.1;
            }
            if (this.speed[1] > 0.1) {
                this.speed[1] = 0.1;
            }
            if (this.speed[1] < -0.1) {
                this.speed[1] = -0.1;
            }

            // Apply speed to pos
            this.x += this.speed[0];
            this.y += this.speed[1];

            // Stop moving at map border
            if (this.x + 1 > num_tiles) {
                this.x = num_tiles - 1;
            }
            if (this.x < 0) {
                this.x = 0;
            }
            if (this.y + 1 > num_tiles) {
                this.y = num_tiles - 1;
            }
            if (this.y < 0) {
                this.y = 0;
            }

            // Check collisions
            this.check_prizes();
            this.check_enemies();
            this.check_obstacles();

            // Draw
            rect(this.x * tile_size, this.y * tile_size, tile_size, tile_size);
        }
    }
};

// Class for obstacles
class Obstacle {
    // Set pos
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
    }

    // Draw the obstacle
    draw() {
        fill(0, 0, 0);
        rect(this.x * tile_size, this.y * tile_size, tile_size, tile_size);
    }
};

// Class for the prizes
class Prize {
    // Set position and status
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.collected = false;
    }

    // Draw prize from image if it has not been collected
    draw() {
        if (!this.collected) {
            fill(0, 255, 0);
            image(prize_image, this.x * tile_size, this.y * tile_size);
        }
    }
};

// Class for an enemy
// enemies start by moving randomly then lock on to the character if they are
// close enough
class Enemy {
    // Set position and random speed
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.speed = [0, 0];

        if (random(0, 10) > 5) {
            this.speed[0] = 0.1;
        }
        else {
            this.speed[0] = -0.1;
        }

        if (random(0, 10) > 5) {
            this.speed[1] = 0.1;
        }
        else {
            this.speed[1] = -0.1;
        }

        this.alive = true;
        this.chase = false;
    }

    // Check for collision with obstacles
    check_obstacles() {
        for (var i = 0; i < obstacles.length; i++) {
            if (
                (
                    (
                        this.x < obstacles[i].x + 1 &&
                        this.x > obstacles[i].x
                    ) ||
                    (
                        this.x + 1 < obstacles[i].x + 1 &&
                        this.x + 1 > obstacles[i].x
                    )
                ) &&
                    (
                        (
                            this.y < obstacles[i].y + 1 &&
                            this.y > obstacles[i].y
                        ) ||
                        (
                            this.y + 1 < obstacles[i].y + 1 &&
                            this.y + 1 > obstacles[i].y
                        )
                    )
            ) {
                // invert speed and assign random position away from obstacle
                this.speed[0] *= -1;
                this.speed[1] *= -1;

                if (this.x < obstacles[i].x) {
                    this.x -= random(0, 1);
                }
                if (this.x > obstacles[i].x) {
                    this.x += random(0, 1);
                }
                if (this.y < obstacles[i].y) {
                    this.y -= random(0, 1);
                }
                if (this.y > obstacles[i].y) {
                    this.y += random(0, 1);
                }
            }
        }
    }

    // Check for prize collision
    check_prizes() {
        for (var i = 0; i < prizes.length; i++) {
            if (
                round(this.x) === round(prizes[i].x) &&
                round(this.y) === round(prizes[i].y)
            ) {
                // Kill enemy
                this.alive = false;
            }
        }
    }

    update_and_draw() {
        fill(255, 0, 0);
        if (this.alive) {
            // Check collisions first
            this.check_obstacles();
            this.check_prizes();

            // If close to the character move towards it
            if (this.chase) {
                if (this.x < character.x) {
                    this.speed[0] = 0.05;
                }
                if (this.x > character.x) {
                    this.speed[0] = -0.05;
                }
                if (this.y < character.y) {
                    this.speed[1] = 0.05;
                }
                if (this.y > character.y) {
                    this.speed[1] = -0.05;
                }
            }

            // set max speed
            if (this.speed[0] > 0.05) {
                this.speed[0] = 0.05;
            }
            if (this.speed[0] < -0.05) {
                this.speed[0] = -0.05;
            }
            if (this.speed[1] > 0.05) {
                this.speed[1] = 0.05;
            }
            if (this.speed[1] < -0.05) {
                this.speed[1] = -0.05;
            }

            // Move enemy
            this.x += this.speed[0];
            this.y += this.speed[1];

            // Bounce off walls
            if (this.x < 0) {
                this.speed[0] *= -1;
            }
            if (this.x + 1 > num_tiles) {
                this.x = num_tiles - 1;
                this.speed[0] *= -1;
            }
            if (this.y < 0) {
                this.y = 0;
                this.speed[1] *= -1;
            }
            if (this.y + 1 > num_tiles) {
                this.y = num_tiles - 1;
                this.speed[1] *= -1;
            }

            // Check dist to character and start chasing if close enough
            var x_dist = this.x - character.x;
            var y_dist = this.y - character.y;
            var dist = sqrt(x_dist * x_dist + y_dist * y_dist);

            if (dist < 150) {
                this.chase = true;
            }

            // Draw enemy
            rect(this.x * tile_size, this.y * tile_size, tile_size, tile_size);
        }
    }
};

// Track pressed and released keys
function keyPressed() {
    key_codes[keyCode] = 1;
}
function keyReleased() {
    key_codes[keyCode] = 0;
}

// Initialize the game
function setup() {
    createCanvas(400, 400);

    // Create prize image
    fill(255, 0, 0);
    ellipse(10, 8, 10, 10);
    ellipse(10, 15, 10, 10);
    ellipse(15, 10, 10, 10);
    ellipse(5, 10, 10, 10);
    fill(0, 255, 0);
    rect(8, 0, 4, 10);
    prize_image = get(0, 0, 20, 20);

    // Loop through tilemap and initilaize obstacles, prizes and the character
    for (var y = 0; y < num_tiles; y++) {
        for (var x = 0; x < num_tiles; x++) {
            switch (tile_map[y][x]) {
                case 'c':
                    character = new Character(x, y);
                    break;
                case 'o':
                    obstacles.push(new Obstacle(x, y));
                    break;
                case 'e':
                    enemies.push(new Enemy(x, y));
                    break;
                case 'p':
                    prizes.push(new Prize(x, y));
                    break;
            }
        }
    }
}

function draw() {
    background(220);
    // Main loop if character is alive and has not won yet
    if (!character.dead && score < prizes.length) {
        push();

        // Translate so that the character is in the center of the canvas
        translate(
            200 + (-character.x * tile_size),
            200 + (-character.y * tile_size)
        );

        // Map Border
        fill(0, 0, 0);
        rect(-200,  800, 1200, 200);
        rect(-200, -200, 1200, 200);
        rect( 800, -200, 200,  1200);
        rect(-200,  0,   200,  1200);

        // Update all game objects
        character.update_and_draw();
        for (var i = 0; i < obstacles.length; i++) {
            obstacles[i].draw();
        }
        for (var i = 0; i < enemies.length; i++) {
            enemies[i].update_and_draw();
        }
        for (var i = 0; i < prizes.length; i++) {
            prizes[i].draw();
        }

        pop();
    }

    // Game over and win screens
    fill(0, 0, 0);
    textSize(50);
    if (score === prizes.length) {
        text("You Win!", 100, 100);
    }

    if (character.dead) {
        text("Game Over", 70, 100);
    }
}
