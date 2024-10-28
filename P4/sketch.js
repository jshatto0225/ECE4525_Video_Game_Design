var key_codes = [];
var bird;
var wizard1;
var wizard2;
var red_boomerang;
var blue_boomerang;
let score = 0;

// Class for the wizards boomerangs
class Boomerang {
    constructor(type, x, y) {
        this.type = type;
        this.active = true;
        this.y = y;
        this.x = x;
        this.speed = random(1, 3);

        // Set speed based on what side of the canvas they are on
        if (this.x > 200) {
            this.speed *= -1;
        }
        this.rot = 2;
    }

    // Do physicas and logic updates
    update() {
        if (this.active) {
            // apply velocity and rotation
            this.x += this.speed;
            this.rot += this.speed / 50.0;

            // Check if past the edge of the map
            if (
                (this.speed > 0 && this.x > 400) ||
                (this.speed < 0 && this.x < 0) ||
                this.y > 400
            ) {
                // If the boomerang is blue decrease score
                if (this.type === "blue") {
                    score--;
                }
                this.active = false;
            }
        }
    }

    // Draw boomerang using image based on type
    draw() {
        push();
        translate(this.x, this.y);
        rotate(this.rot);
        if (this.type === "red") {
            image(red_boomerang, 0, 0);
        }
        else {
            image(blue_boomerang, 0, 0);
        }
        pop();
    }
}

// Class for wizards
class Wizard {
    constructor(x, boomerang_type) {
        this.x = x;
        this.y = 400 - 20;
        this.speed = 0;
        this.boomerang_delay = round(random(0, 30));
        this.boomerangs = [];
        this.boomerang_type = boomerang_type;
    }

    // Add new boomerang to the list
    throw_boomerang(type) {
        this.boomerangs.push(new Boomerang(
            this.boomerang_type,
            this.x,
            this.y
        ));
    }

    // Do physics and logic updates
    update() {
        // Apply gravity
        this.speed -= 0.2;

        // Dont move past floor
        if (this.y > 380) {
            this.y = 380;
            this.speed = 0;
        }

        // Jump if on floor
        if (this.y === 380) {
            this.speed = random(9.5, 11.5);
        }

        // Thropw boomerang after 30-60 frames
        if (this.boomerang_delay > 60) {
            this.boomerang_delay = round(random(0, 30));
            this.throw_boomerang();
        }

        this.boomerang_delay++;

        // Move
        this.y -= this.speed;

        // Update boomerangs
        for (let i = 0; i < this.boomerangs.length; i++) {
            if (this.boomerangs[i].active) {
                this.boomerangs[i].update();
            }
        }
    }

    // Draw wizard
    draw() {
        fill(0, 0, 220);
        rectMode(CENTER);
        rect(this.x, this.y, 20, 40);
        triangle(
            this.x - 12,
            this.y - 20,
            this.x + 12,
            this.y - 20,
            this.x,
            this.y - 40
        );
        rect(this.x, this.y - 20, 30, 5);

        // Draw boomerangs
        for (let i = 0; i < this.boomerangs.length; i++) {
            if (this.boomerangs[i].active) {
                this.boomerangs[i].draw();
            }
        }
    }
}

// Class for bombs
class Bomb {
    constructor() {
        this.active = false;
    }

    // Reset the bomb to the y pos and with speed
    reset(y, speed) {
        this.y = y;

        // If speed > 0 set speed to 0 else use speed param
        if (speed > 0) {
            this.speed = 0;
        }
        else {
            this.speed = speed;
        }
        this.active = true;
    }

    // Check collision with blue boomerangs
    check_blue_boomerangs() {
        for (let i = 0; i < wizard2.boomerangs.length; i++) {
            let boomerang = wizard2.boomerangs[i];
            if (
                (
                    (
                        200 > boomerang.x &&
                        200 < boomerang.x + 30
                    ) ||
                    (
                        200 + 15 > boomerang.x &&
                        200 + 15 < boomerang.x + 30
                    )
                ) &&
                (
                    (
                        this.y > boomerang.y &&
                        this.y < boomerang.y + 30
                    ) ||
                    (
                        this.y + 15 > boomerang.y &&
                        this.y + 15 < boomerang.y + 30
                    )
                ) &&
                boomerang.active
            ) {
                // Decrease score, deativate this and boomerang and return
                this.active = false;
                score--;
                wizard2.boomerangs[i].active = false;
                return;
            }
        }
    }

    // Check collision with red boomerangs
    check_red_boomerangs() {
        for (let i = 0; i < wizard1.boomerangs.length; i++) {
            let boomerang = wizard1.boomerangs[i];
            if (
                (
                    (
                        200 > boomerang.x &&
                        200 < boomerang.x + 30
                    ) ||
                    (
                        200 + 15 > boomerang.x &&
                        200 + 15 < boomerang.x + 30
                    )
                ) &&
                (
                    (
                        this.y > boomerang.y &&
                        this.y < boomerang.y + 30
                    ) ||
                    (
                        this.y + 15 > boomerang.y &&
                        this.y + 15 < boomerang.y + 30
                    )
                ) &&
                boomerang.active
            ) {
                // Deactivate self and boomerang and increase score
                this.active = false;
                score++;
                wizard1.boomerangs[i].active = false;
                return;
            }
        }
    }

    // Logic and physics checks
    update() {
        if (this.active) {
            // apply gravity and cap max speed
            this.speed -= 0.2;
            if (this.speed < -5) {
                this.speed = -5;
            }

            // Move
            this.y -= this.speed;

            // Kill if off screen
            if (this.y > 400) {
                this.active = false;
            }

            // Check collisions
            this.check_red_boomerangs();
            this.check_blue_boomerangs();
        }
    }

    // Draw bomb
    draw() {
        if (this.active) {
            fill(0, 0, 0);
            ellipse(200, this.y, 15, 15);
        }
    }
}

// Class for the bird
class Bird {
    constructor() {
        this.y = 200;
        this.speed = 0;
        this.bomb = new Bomb();
        this.alive = true;
    }

    // Drop the bomb
    // The same bomb is used every time
    drop_bomb() {
        this.bomb.reset(this.y, this.speed);
    }

    // Chekc for blue bomerang collision
    check_blue_boomerangs() {
        for (let i = 0; i < wizard2.boomerangs.length; i++) {
            let boomerang = wizard2.boomerangs[i];
            if (
                (
                    (
                        200 > boomerang.x &&
                        200 < boomerang.x + 30
                    ) ||
                    (
                        200 + 30 > boomerang.x &&
                        200 + 30 < boomerang.x + 30
                    )
                ) &&
                (
                    (
                        this.y > boomerang.y &&
                        this.y < boomerang.y + 30
                    ) ||
                    (
                        this.y + 30 > boomerang.y &&
                        this.y + 30 < boomerang.y + 30
                    )
                ) &&
                boomerang.active
            ) {
                // Increase score and disable boomerang
                score++;
                wizard2.boomerangs[i].active = false;
            }
        }
    }

    // Check red boomerang collision
    check_red_boomerangs() {
        for (let i = 0; i < wizard1.boomerangs.length; i++) {
            let boomerang = wizard1.boomerangs[i];
            if (
                (
                    (
                        200 > boomerang.x &&
                        200 < boomerang.x + 30
                    ) ||
                    (
                        200 + 30 > boomerang.x &&
                        200 + 30 < boomerang.x + 30
                    )
                ) &&
                (
                    (
                        this.y > boomerang.y &&
                        this.y < boomerang.y + 30
                    ) ||
                    (
                        this.y + 30 > boomerang.y &&
                        this.y + 30 < boomerang.y + 30
                    )
                ) &&
                boomerang.active
            ) {
                // Kill player and boomerang
                this.alive = false;
                wizard1.boomerangs[i].active = false;
            }
        }
    }

    // Physics and logic update
    update() {
        // read input for jumping
        // If moving down allow jumps
        if (key_codes[UP_ARROW] && this.speed < 0) {
            this.speed = 5;
        }
        // Check input for bomb
        // Bonb can be dropped after it deactivates
        if (key_codes[DOWN_ARROW] && !this.bomb.active) {
            this.drop_bomb();
        }

        // Update bomb
        this.bomb.update();

        // Apply Physics
        this.speed -= 0.2;
        if (this.speed < -3) {
            this.speed = -3;
        }
        this.y -= this.speed;

        // Check collisions with boomerangs and map borders
        this.check_red_boomerangs();
        this.check_blue_boomerangs();
        if (this.y < 0 || this.y > 400) {
            this.alive = false;
        }
    }

    //Draw character
    draw() {
        imageMode(CENTER);

        if (this.speed <= 0) {
            //image(bird_img1, 200, this.y);
        }
        else {
            //image(bird_img2, 200, this.y);
        }

        fill(255, 255, 0);
        noStroke();
        ellipse(200, this.y, 30, 20);
        fill(200, 200, 0);
        triangle(190, this.y - sin(this.speed) * 15, 190, this.y, 205, this.y);

        // Draw bomb
        this.bomb.draw();
    }
}

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

    fill(0, 0, 0, 0);
    rect(-400, -400, 400, 400);
    noStroke();

    // Red boomerang
    fill(255, 0, 0);
    triangle(30, 30, 45, 0, 45, 15);
    triangle(60, 30, 45, 0, 45, 15);
    red_boomerang = get(30, 0, 30, 30);

    // blue boomerang
    fill(0, 0, 255);
    triangle(30, 30, 45, 0, 45, 15);
    triangle(60, 30, 45, 0, 45, 15);
    blue_boomerang = get(30, 0, 30, 30);

    wizard1 = new Wizard(20, "red");
    wizard2 = new Wizard(380, "blue");

    bird = new Bird();
}

function draw() {
    background(220);
    if (bird.alive && score > -4 && score < 10) {
        bird.update();
        wizard1.update();
        wizard2.update();

        wizard1.draw();
        wizard2.draw();
        bird.draw();

        // Display score
        fill(0, 0, 0);
        textSize(10);
        text("Score: " + score, 10, 10);
    }
    // Win condition
    else if (score >= 10) {
        textSize(50);
        fill(0, 255, 0);
        text("You Win!", 100, 100);
    }
    // Loss
    else {
        fill(255, 0, 0);
        textSize(50);
        text("Game Over", 70, 100);
    }
}
