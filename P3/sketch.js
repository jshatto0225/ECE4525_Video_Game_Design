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
var enemy_img1;
var enemy_img2;

// Tile map variable used for initialization 40x40
// c = Character
// p = prize
// e = enemy
// o = obstacle
const tile_map = [
    "                                        ",
    "     p                         e     p  ",
    "                                        ",
    "            oooo                        ",
    "         e     o                        ",
    "               o                        ",
    "          p    o           p        o   ",
    "                                        ",
    "       o              ooo               ",
    "       o        e      o          e     ",
    "       o               o                ",
    "       ooooo           o                ",
    "       o                                ",
    "   p   o                                ",
    "                p              p        ",
    "  e                                     ",
    "                                        ",
    "                                        ",
    "                    oooooooo            ",
    "              e                         ",
    "                                        ",
    "   p                   e           p    ",
    "                                oooo    ",
    "             o             p    o       ",
    "                                        ",
    "                             e          ",
    "         o  e                           ",
    "    e    o                              ",
    "         o        p                     ",
    "       ooo             oooooo           ",
    "                     ooo    e           ",
    "                                        ",
    "             e                          ",
    "                                        ",
    "                                        ",
    "         p                              ",
    "                                        ",
    "                                        ",
    "                                   c    ",
    "                                        ",
];

// Class for the cahracters missles
class Missle {
    constructor(dir) {
        this.x = 0;
        this.y = 0;
        this.dir = dir;
        this.active = true;
    }

    // Function to check if and enemy was hit
    check_enemy() {
        let y = (this.y * cos(this.dir) + character.y * tile_size) / tile_size;
        let x = (this.y * sin(-this.dir) + character.x * tile_size) / tile_size;
        for (var i = 0; i < enemies.length; i++) {
            if (
                round(x) === round(enemies[i].x) &&
                round(y) === round(enemies[i].y) &&
                enemies[i].alive
            ) {
                enemies[i].hp -= 1;
                this.active = false;
                break;
            }
        }
    }

    // function to check if an obstacle was hit
    check_obstacles() {
        let y = (this.y * cos(this.dir) + character.y * tile_size) / tile_size;
        let x = (this.y * sin(-this.dir) + character.x * tile_size) / tile_size;
        for (var i = 0; i < obstacles.length; i++) {
            if (
                round(x) === round(obstacles[i].x) &&
                round(y) === round(obstacles[i].y) &&
                obstacles[i].active
            ) {
                this.active = false;
                break;
            }

        }

        if (y < 0 || y > 800 || x < 0 || x > 800) {
            this.active = 0;
        }
    }

    // Function to draw the rotated misle sprite and and call functiosn to check for collisions
    update_and_draw() {
        if (this.active) {
            let dist = sqrt(5*5 + 5*5);
            this.y -= dist;

            rectMode(CENTER);
            push();
            rotate(this.dir);
            fill(0, 0, 255);
            triangle(
                this.x - 6, this.y + 7.5,
                this.x, this.y + 7.5,
                this.x, this.y - 9
            );
            triangle(
                this.x, this.y + 7.5,
                this.x + 6, this.y + 7.5,
                this.x, this.y - 9
            );
            triangle(
                this.x - 3, this.y - 7.5,
                this.x + 3, this.y - 7.5,
                this.x, this.y - 11
            );
            rect(this.x, this.y, 7, 15);
            pop();
            rectMode(CORNER);

            this.check_enemy();
            this.check_obstacles();
        }
    }
};

// Class for the character
class Character {
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.rot = 0;
        this.speed = [0, 0];
        this.dead = false;
        this.missles = [];
        this.fire_delay = 0;
        this.health = 3;
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
            if (obstacles[i].active) {
                // Determine the collision direction and lock position accordingly
                let left = this.x <= obstacles[i].x + 1 && this.x >= obstacles[i].x
                let right = this.x + 1 <= obstacles[i].x + 1 && this.x + 1 >= obstacles[i].x
                let top = this.y <= obstacles[i].y + 1 && this.y >= obstacles[i].y
                let bottom = this.y + 1 <= obstacles[i].y + 1 && this.y + 1 >= obstacles[i].y
                let vert = obstacles[i].y - this.y;
                let hor = obstacles[i].x - this.x;
                let dir = abs(vert) < abs(hor);

                if (top && (left || right) && !dir) {
                    this.y = round(this.y) + 0.5;
                }
                if (bottom && (left || right) && !dir) {
                    this.y = round(this.y) - 0.5;
                }

                if (left && (top || bottom) && dir) {
                    this.x = round(this.x) + 0.5;
                }
                if (right && (top || bottom) && dir) {
                    this.x = round(this.x) - 0.5;
                }

                if ((right || left) && (top || bottom)) {
                    obstacles[i].active = false;

                    this.health -= 1;

                    if (this.health === 0) {
                        this.dead = true;
                    }
                }
            }
        }
    }

    shoot() {
        if (this.fire_delay === 0) {
            this.missles.push(new Missle(this.rot));
            this.fire_delay = 20;
        }
    }

    update_and_draw() {
        if (!this.dead) {
            if (this.fire_delay > 0) {
                this.fire_delay -= 1;
            }
            if (this.health === 3) {
                fill(0, 255, 0);
            }
            if (this.health === 2) {
                fill(255, 255, 0);
            }
            if (this.health === 1) {
                fill(255, 0, 0);
            }
            push();
            rotate(character.rot);

            // Get player input and set acceleration
            if (key_codes[UP_ARROW] === 1) {
                this.speed[1] = -0.1 * cos(this.rot);
                this.speed[0] = 0.1 * sin(this.rot);
            }
            else if (key_codes[DOWN_ARROW] === 1) {
                this.speed[1] = 0.1 * cos(this.rot);
                this.speed[0] = -0.1 * sin(this.rot);
            }
            else {
                this.speed[1] = 0;
                this.speed[0] = 0;
            }

            if (key_codes[32] === 1) {
                this.shoot();
            }

            // Get input
            if (key_codes[RIGHT_ARROW] === 1) {
                this.rot += 0.02;
            }
            else if (key_codes[LEFT_ARROW] === 1) {
                this.rot -= 0.02;
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
            rectMode(CENTER);
            rect(
                0,
                0,
                tile_size,
                tile_size
            );
            rectMode(CORNER);
            pop();

            for (var i = 0; i < this.missles.length; i++) {
                this.missles[i].update_and_draw();
            }
        }
    }
};

// Class for obstacles
class Obstacle {
    // Set pos
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.active = true;
    }

    // Draw the obstacle
    draw() {
        if (this.active) {
            fill(0, 0, 0);
            ellipse(
              this.x * tile_size - character.x * tile_size,
              this.y * tile_size - character.y * tile_size,
              tile_size,
              tile_size
            );
        }
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
            image(
                prize_image,
                this.x * tile_size - character.x * tile_size - 0.5 * tile_size,
                this.y * tile_size - character.y * tile_size - 0.5 * tile_size
            );
        }
    }
};

// The class for the enemies default state
// The enemy will move in a straight ine and bounce off walls
class WanderState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    execute() {
        // Bounce off walls
        if (this.enemy.x < 0) {
            this.enemy.speed[0] *= -1;
        }
        if (this.enemy.x + 1 > num_tiles) {
            this.enemy.x = num_tiles - 1;
            this.enemy.speed[0] *= -1;
        }
        if (this.enemy.y < 0) {
            this.enemy.y = 0;
            this.enemy.speed[1] *= -1;
        }
        if (this.enemy.y + 1 > num_tiles) {
            this.enemy.y = num_tiles - 1;
            this.enemy.speed[1] *= -1;
        }

        // Move enemy
        this.enemy.x += this.enemy.speed[0];
        this.enemy.y += this.enemy.speed[1];
    }
}

// Class that represent the character chase state
// the enemy will rotate and move towards the character
class ChaseState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    execute() {
        let new_rot = atan2(this.enemy.speed[1], this.enemy.speed[0]);
        let vec = [character.x - this.enemy.x, character.y - this.enemy.y];
        let rot = new_rot - atan2(vec[1], vec[0]);
        let len = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        const x = -len * sin(new_rot);

        if (rot > PI) {
            rot -= PI;
        }
        if (rot < -PI) {
            rot += PI;
        }

        if (rot > 0.01) {
            new_rot -= 0.02;
        }
        else if (rot < 0.01) {
            new_rot += 0.02;
        }

        this.enemy.speed[0] = 0.0707 * cos(new_rot);
        this.enemy.speed[1] = 0.0707 * sin(new_rot);

        this.enemy.x += this.enemy.speed[0];
        this.enemy.y += this.enemy.speed[1];
    }

}

// Class to represent the state where the enemy is avoiding obstacles
// The enemy will stop and rotate until the obstacle is not in range then 
// revert to its previous state
class AvoidObstacleState {
    constructor(enemy) {
        this.enemy = enemy;
    }

    execute() {
        for (var i = 0; i < obstacles.length; i++) {
            let vec = [obstacles[i].x - this.enemy.x, obstacles[i].y - this.enemy.y];

            // Get distance to obstacles
            let len = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);

            // Get Current Rotation
            let rot = atan2(this.enemy.speed[1], this.enemy.speed[0]) - atan2(vec[1], vec[0]);
            // Get Y dist relative to this
            const x = -len * sin(rot);

            let new_rot = atan2(this.enemy.speed[1], this.enemy.speed[0]);
            if (x < 1 && x > 0 && this.enemy.last_dir === 0) {
                this.enemy.last_dir = -0.02;
            }
            else if (x > -1 && x <= 0 && this.enemy.last_dir === 0) {
                this.enemy.last_dir = 0.02;
            }

            new_rot += this.enemy.last_dir;

            if (new_rot != atan2(this.enemy.speed[1], this.enemy.speed[0])) {
                this.enemy.speed[0] = 0.0707 * cos(new_rot);
                this.enemy.speed[1] = 0.0707 * sin(new_rot);
                return;
            }
        }
    }
}

// Class for an enemy
// enemies start by moving randomly then lock on to the character if they are
// close enough
class Enemy {
    // Set position and random speed
    constructor(tile_x, tile_y) {
        this.x = tile_x;
        this.y = tile_y;
        this.speed = [0, 0];
        this.hp = 2;
        this.chase_cooldown = 120;
        this.last_dir = 0;

        this.states = [
            new WanderState(this),
            new ChaseState(this),
            new AvoidObstacleState(this)
        ];

        this.state = 0;

        // 0.05 is the speed in tiles per frame which is equal to 1 pixel per frame
        if (random(0, 10) > 5) {
            this.speed[0] = 0.05;
        }
        else {
            this.speed[0] = -0.05;
        }

        if (random(0, 10) > 5) {
            this.speed[1] = 0.05;
        }
        else {
            this.speed[1] = -0.05;
        }

        this.alive = true;
    }

    kill() {
        this.alive = false;
    }

    // Check to see if obstacles should be avoided
    check_obstacles() {
        for (var i = 0; i < obstacles.length; i++) {
            let vec = [obstacles[i].x - this.x, obstacles[i].y - this.y];

            // Get distance to obstacles
            let len = sqrt(vec[0] * vec[0] + vec[1] * vec[1]);

            // Get Current Rotation
            let rot = atan2(this.speed[1], this.speed[0]) - atan2(vec[1], vec[0]);
            // Get Y dist relative to this
            const x = -len * sin(rot);
            const y = len * cos(rot);

            if (y < 0 || y > 4 || x > 1 || x < -1) {
                continue;
            }

            if (this.state != 2) {
                this.last_dir = 0;
                this.state = 2;
            }
            return;
        }
        // Reset to wander state
        if (this.state === 2) {
            this.state = 0;
        }
    }

    // Check for prize collision
    check_prizes() {
        for (var i = 0; i < prizes.length; i++) {
            if (
                round(this.x) === round(prizes[i].x) &&
                round(this.y) === round(prizes[i].y) &&
                !prizes[i].collected
            ) {
                // Kill enemy
                this.alive = false;
            }
        }
    }

    // Check if character is cloes enough to enter chase state
    check_character() {
        // Check dist to character and start chasing if close enough
        var x_dist = this.x - character.x;
        var y_dist = this.y - character.y;
        var dist = sqrt(x_dist * x_dist + y_dist * y_dist);
        if (dist < 7.5 /* 150px=7.5tiles */ && this.state != 2) {
            this.state = 1;
        }
    }

    // Check if enemy should bounce off walls
    check_borders() {
        if (this.x < 0) {
            this.speed[0] *= -1;
            this.x += this.speed[0];
            this.y += this.speed[1];
        }
        if (this.x + 1 > num_tiles) {
            this.speed[0] *= -1;
            this.x += this.speed[0];
            this.y += this.speed[1];
        }
        if (this.y < 0) {
            this.speed[1] *= -1;
            this.x += this.speed[0];
            this.y += this.speed[1];
        }
        if (this.y + 1 > num_tiles) {
            this.speed[1] *= -1;
            this.x += this.speed[0];
            this.y += this.speed[1];
        }

    }

    update_and_draw() {
        fill(255, 0, 0);
        if (this.alive) {
            // Update state
            this.check_prizes();
            this.check_character();
            this.check_obstacles();
            this.check_borders();

            // Execute state
            this.states[this.state].execute();

            let rot = -atan2(this.speed[0], this.speed[1]);

            // Draw enemy
            push();
            rectMode(CENTER);
            translate(
                this.x * tile_size - character.x * tile_size,
                this.y * tile_size - character.y * tile_size
            );
            rotate(rot);
            if (this.hp === 2) {
                image(
                    enemy_img1,
                    -10,
                    -10
                );
            }
            else if (this.hp === 1) {
                image(
                    enemy_img2,
                    -10,
                    -10
                );
            }
            else if (this.hp === 0) {
                this.kill();
            }
            rotate(-rot);
            rectMode(CORNER);
            pop();
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

    background(0, 0, 0, 0);

    // Create prize image
    fill(255, 0, 0);
    ellipse(10, 8, 10, 10);
    ellipse(10, 15, 10, 10);
    ellipse(15, 10, 10, 10);
    ellipse(5, 10, 10, 10);
    fill(0, 255, 0);
    rect(8, 0, 4, 10);
    prize_image = get(0, 0, 20, 20);

    // Create enemy images
    fill(255, 255, 0);
    triangle(20, 20, 40, 20, 30, 40);
    enemy_img1 = get(20, 20, 20, 20);

    fill(255, 0, 0);
    triangle(40, 40, 60, 40, 50, 60);
    enemy_img2 = get(40, 40, 20, 20);

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

        //  Translate so that the character is in the center of the canvas
        rectMode(CENTER);
        translate(
            200,
            200
        );
        rotate(-character.rot);
        rectMode(CORNER);

        // Map Border
        fill(0, 0, 0);
        rect(
            -200 - character.x * tile_size - 0.5 * tile_size,
            800 - character.y * tile_size - 0.5 * tile_size,
            1200,
            200
        );
        rect(
            -200 - character.x * tile_size - 0.5 * tile_size,
            -200 - character.y * tile_size - 0.5 * tile_size,
            1200,
            200
        );
        rect(
            800 - character.x * tile_size - 0.5 * tile_size,
            -200 - character.y * tile_size - 0.5 * tile_size,
            200,
            1200
        );
        rect(
            -200 - character.x * tile_size - 0.5 * tile_size,
            -200 - character.y * tile_size - 0.5 * tile_size,
            200,
            1200
        );

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
