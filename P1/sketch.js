// Global logo variable
let logo;

// Global start button
let start_button;

// Global game state
let game_state;

// Global list of bricks
let bricks = [];

// Global ball variable
let balls = [];

// Global paddle var
let paddle;

// Global count of killed mutants
let mutants_killed = 0;

// Global key array
let keyArray = [];

// Functions to track what keys are actively pressed
function keyPressed() {
    keyArray[keyCode] = 1;
}

function keyReleased() {
    keyArray[keyCode] = 0;
}

// Class for the mutants bomb
class Bomb {
    // Create bomb with pos and size
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // Move bomb down, check for collisions, and draw
    draw() {
        fill("red");
        // Adjust pos
        this.y += this.height / 8;
        // Draw
        ellipse(this.x, this.y, this.width, this.height);

        // Check for collision with the paddle
        if (
            (
                (
                    this.x - this.width / 2 >= paddle.x - paddle.width / 2 && 
                    this.x - this.width / 2 <= paddle.x + paddle.width / 2
                ) ||
                (
                    this.x + this.width / 2 >= paddle.x - paddle.width / 2 &&
                    this.x + this.width / 2 <= paddle.x + paddle.width / 2
                ) 
            ) &&
            (
                this.y >= paddle.y - paddle.height / 2 &&
                this.y <= paddle.y + paddle.height / 2
            )
        ) {
            // End the game if the paddle was hit
            game_state = "game_over";
        }
    }
}

// Class for the brick which can transform into a space invader
class MutantBrick {
    // Set size, pos, and the mutant size
    constructor(x, y, canvas_width, canvas_height) {
        this.x = x;
        this.y = y;
        this.width = canvas_width / 10;
        this.height = canvas_height * 0.025;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.state = "brick";
        this.mutant_width = (this.x + this.height * 2) - (this.x - this.height * 2)
        this.mutant_height = this.height * 2;
    }

    // Function to draw the brick as a brick
    draw_brick() {
        fill("red");
        rect(this.x, this.y, this.width, this.height);
    }

    // Function to adjust coord to x and y being centered
    adjust_coords() {
        this.x = this.x + this.width / 2;
        this.y = this.y + this.height / 2;
        this.dir = round(random(1, 2));
        if (this.dir = 2) {
            this.dir = -1;
        }
        this.bomb_count = 0;
        this.bombs = [];
    }

    // Function to spawn a bomb with a 1 in 2000 chance of success
    drop_bomb() {
        if (random(0, 500) > 499) {
            this.bomb_count++;
            // add bomb to list
            this.bombs.push(
                new Bomb(
                    this.x, 
                    this.y, 
                    this.height, 
                    this.height
                )
            );
        }
    }

    // FUnction to update all bombs on screen
    update_bombs() {
        for (var i = 0; i < this.bombs.length; i++) {
            if (this.bombs[i].y < this.canvas_height) {
                this.bombs[i].draw();
            }
        }
    }

    // Function to draw brick as a mutant
    draw_mutant() {
        noStroke();
        fill("green");
        this.x = this.x + this.dir;
        if (
            this.x + this.width / 2 > this.canvas_width || 
            this.x - this.width / 2 < 0
        ) {
            this.dir = -this.dir;
            this.y = this.y + 10;
        }
        ellipse(this.x, this.y, this.width, this.height); 

        triangle(
            this.x, this.y, 
            this.x + this.height, this.y + this.height,
            this.x + this.height, this.y
        );
        triangle(
            this.x, this.y,
            this.x - this.height, this.y + this.height,
            this.x - this.height, this.y
        );

        triangle(
            this.x + this.height / 2, this.y, 
            this.x + this.height * 2, this.y + this.height,
            this.x + this.height * 2, this.y
        );
        triangle(
            this.x - this.height / 2, this.y,
            this.x - this.height * 2, this.y + this.height,
            this.x - this.height * 2, this.y
        );

        triangle(
            this.x, this.y, 
            this.x + this.height, this.y - this.height,
            this.x + this.height, this.y
        );
        triangle(
            this.x, this.y,
            this.x - this.height, this.y - this.height,
            this.x - this.height, this.y
        );


        // Check if a mutant hit the paddle
        if (
            (
                (
                    this.x - this.mutant_width / 2 >= paddle.x - paddle.width / 2 && 
                    this.x - this.mutant_width / 2 <= paddle.x + paddle.width / 2
                ) ||
                (
                    this.x + this.mutant_width / 2 >= paddle.x - paddle.width / 2 &&
                    this.x + this.mutant_width / 2 <= paddle.x + paddle.width / 2
                ) 
            )&&
            (
                this.y >= paddle.y - paddle.height / 2 &&
                this.y <= paddle.y + paddle.height / 2
            )
        ) {
            // End game if paddle is hit
            game_state = "game_over";
        }
        stroke(0, 0, 0);
    }
};

// Start Button class
// Contains functions for drawing the button and for checking if
// the mouse is overthe button
class StartButton {
    // Set button size
    constructor(canvas_width, canvas_height) {
        this.width = canvas_width / 2;
        this.height = canvas_height / 8;
        this.x = this.width / 2;
        this.y = canvas_height - this.height;
        this.text_x_offset = this.width / 4.5;
    }

    // Draw button rect and text
    draw() {
        fill("green");
        rect(this.x, this.y, this.width, this.height);
        textSize(50);
        fill("black");
        text(
            "Start", 
            this.x + this.text_x_offset, 
            this.y, 
            this.width, 
            this.height
        );
    }

    // return true if mouse is over button false otherwise
    mouse_hover(x, y) {
        if (x > this.x && 
            y > this.y && 
            x < this.width + this.x &&
            y < this.height + this.y) {
            return true;
        }
        return false;
    }
};

// Class to draw and animate the logo.
// The logo are my initials JS but the j and s are split 
// in to two segments each that fly in from the corner of 
// the screen and meet to create a logo.
// The animation is on a loop but can 
// easily be changed to be a single loop
// by not resetting the timer once it expires
class Logo {
    // Create Logo oject with canvas size
    // Logo size will be calculated based on canvas size
    // Timer variable t is initialized
    constructor(canvas_width, canvas_height) {
        // Store canvas size
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;

        // Timer variable
        this.t = 0;

        // Logo size
        this.logo_width = canvas_width / 2.0;
        this.logo_height = canvas_height / 2.0;
    }

    // Functions that will update the logo animation
    // It will use the timer value to move the 4 pieces 
    // of the logo into position then repeat
    draw() {
        rectMode(CORNER);
        // Reset timer if at max value
        // This effectively resets the animation
        if (this.t >= 150) {
            this.t = 0;
        }

        // Set pos and size of the j stem
        let j_stem_x_max = this.canvas_width * 0.375;
        let j_stem_y_max = this.canvas_height * 0.25;
        let j_stem_x = (this.t / 100.0) * j_stem_x_max;
        let j_stem_y = (this.t / 100.0) * j_stem_y_max;
        let j_stem_width = this.logo_width / 4;
        let j_stem_height = this.logo_height * (3.0 / 4.0);

        // Set pos to max if pos is past max
        if (j_stem_x > j_stem_x_max) {
            j_stem_x = j_stem_x_max;
        }
        if (j_stem_y > j_stem_y_max) {
            j_stem_y = j_stem_y_max;
        }

        // Draw stem
        rect(j_stem_x, j_stem_y, j_stem_width, j_stem_height);

        // Set j arc size and pos
        let j_arc_x_max = this.canvas_width * 0.375;
        let j_arc_y_min = this.canvas_height * 0.625;
        let j_arc_x = (this.t / 100.0) * j_arc_x_max;
        let j_arc_y = 
            this.canvas_height - 
            (this.t / 100.0) * 
            (this.canvas_height - j_arc_y_min);
        let j_arc_width = this.logo_width / 2.0;
        let j_arc_height = this.logo_height / 2.0;

        // Set x to max if x is past max
        if (j_arc_x > j_arc_x_max) {
            j_arc_x = j_arc_x_max;
        }
        // Set y to min if y is past min
        if (j_arc_y < j_arc_y_min) {
            j_arc_y = j_arc_y_min;
        }

        // Draw arc
        arc(j_arc_x, j_arc_y, j_arc_width, j_arc_height, 0, PI);

        // Set size and pos of top half of s
        let s_arc_width = this.logo_width / 2.0;
        let s_arc_height = this.logo_height / 2.0;
        let s_arc1_x_min = this.canvas_width * 0.625;
        let s_arc1_y_max = this.canvas_height * 0.375;
        let s_arc1_x = 
            this.canvas_width - 
            (this.t / 100.0) * 
            (this.canvas_width - s_arc1_x_min);
        let s_arc1_y = (this.t / 100.0) * s_arc1_y_max;

        // Set x to min if x is past min
        if (s_arc1_x < s_arc1_x_min) {
            s_arc1_x = s_arc1_x_min;
        }
        // Set y to min if y is past min
        if (s_arc1_y > s_arc1_y_max) {
            s_arc1_y = s_arc1_y_max;
        }

        // Draw top arc
        arc(
            s_arc1_x, 
            s_arc1_y, 
            s_arc_width, 
            s_arc_height, 
            PI / 2.0,
            PI * (3.0 / 2.0)
        );

        // Set s bottom arc size and pos
        let s_arc2_x_min = this.canvas_width * 0.625;
        let s_arc2_y_min = this.canvas_height * 0.625;
        let s_arc2_x = 
            this.canvas_width - 
            (this.t / 100.0) * 
            (this.canvas_width - s_arc2_x_min);
        let s_arc2_y = 
            this.canvas_height - 
            (this.t / 100.0) * 
            (this.canvas_height - s_arc2_y_min);

        // Set x to min if x is past min
        if (s_arc2_x < s_arc2_x_min) {
            s_arc2_x = s_arc2_x_min;
        }
        // Set y to max if y is past max
        if (s_arc2_y < s_arc2_y_min) {
            s_arc2_y = s_arc2_y_min;
        }

        // Draw bottom s arc
        arc(
            s_arc2_x, 
            s_arc2_y, 
            s_arc_width, 
            s_arc_height, 
            PI * (3.0 / 2.0),
            PI / 2
        );

        // Increment timer
        this.t++;
    }
}

// Ball class
// Ball interacts with the bricks in brick mode and the paddle only
class Ball {
    // Set the balls coords and pos and direction
    constructor(x, y, canvas_width, canvas_height) {
        this.width = canvas_width / 50;
        this.height = canvas_height / 50;
        this.x = x;
        this.y = y;
        this.dir = [ round(random(1, 2)), round(random(1, 2)) ];
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
    }

    draw() {
        // Move the ball, draw the ball, and check collisions
        fill("black");
        rect(this.x, this.y, this.width, this.height);
        this.x += this.dir[0];
        this.y += this.dir[1];
        // Bunce of walls and paddle
        if (this.x < 0) {
            this.dir[0] = round(random(1, 2));
        }
        else if (this.x + this.width > this.canvas_width) {
            this.dir[0] = -round(random(1, 2));
        }
        if (this.y < 0) {
            this.dir[1] = round(random(1, 2));
        }
        // Paddle collision check
        else if (
            (
                this.y + this.height > paddle.y - paddle.height / 2 &&
                this.y + this.height < paddle.y + paddle.height / 2
            ) &&
            (
                (
                    this.x > paddle.x - paddle.width / 2 && 
                    this.x < paddle.x + paddle.width / 2
                ) ||
                (
                    this.x + this.width > paddle.x - paddle.width / 2 &&
                    this.x + this.width < paddle.x + paddle.width / 2
                )
            )
        ) {
            this.dir[1] = -round(random(1, 2));
        }
        // Ball has left the screen
        else if (this.y + this.height > this.canvas_height) {
            game_state = "game_over";
        }
    }

    // Function to check if the ball has hit a brick
    check_bricks() {
        for (var i = 0; i < bricks.length; i++) {
            const brick = bricks[i];

            // If the brick is not a mutant or dead
            if (brick.state === "brick") {
                const vert = 
                    (
                        this.y < brick.y + brick.height &&
                        this.y > brick.y
                    ) &&
                    (
                        (
                            this.x > brick.x &&
                            this.x < brick.x + brick.width
                        ) ||
                        (
                            this.x + this.width > brick.x &&
                            this.x + this.width < brick.x + brick.width
                        )
                    );
                const hor =
                    (
                        this.x < brick.x + brick.width &&
                        this.x > brick.x
                    ) &&
                    (
                        (
                            this.y > brick.y &&
                            this.y < brick.y + brick.height
                        ) ||
                        (
                            this.y + this.height > brick.y &&
                            this.y + this.height < brick.y + brick.height
                        )
                    );
                // Set brick to a mutant and reverse direction if brick is hit
                if (vert || hor) {
                    this.dir[1] = -this.dir[1];
                    brick.state = "mutant";
                    brick.adjust_coords();
                    break;
                }
            }

        }
    }
};

// Class for bullet that shoots from the paddle and can hit a mutant
class Bullet {
    // Set size and pos
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    // Update bullet if it is still on the screen
    draw() {
        if (this.active) {
            for (var i = 0; i < bricks.length; i++) {
                var brick = bricks[i];

                // Collision detection with mutants
                const vert = 
                    (
                        this.y - this.height / 2 < brick.y + brick.mutant_height / 2 &&
                        this.y - this.height / 2 > brick.y - brick.height / 2
                    ) &&
                    (
                        (
                            this.x - this.width / 2 > brick.x - brick.mutant_width / 2 &&
                            this.x - this.width / 2 < brick.x + brick.mutant_width / 2
                        ) ||
                        (
                            this.x + this.width / 2 > brick.x - brick.mutant_width / 2 &&
                            this.x + this.width / 2 < brick.x + brick.mutant_width / 2
                        )
                    );
                const hor =
                    (
                        this.x - this.width / 2 < brick.x + brick.mutant_width / 2 &&
                        this.x - this.width / 2 > brick.x - brick.mutant_width / 2
                    ) &&
                    (
                        (
                            this.y - this.height / 2 > brick.y - brick.mutant_height / 2 &&
                            this.y - this.height / 2 < brick.y + brick.mutant_height / 2
                        ) ||
                        (
                            this.y + this.height / 2 > brick.y - brick.mutant_height / 2 &&
                            this.y + this.height / 2 < brick.y + brick.mutant_height / 2
                        )
                    );
                // If collided and brick is a mutant kill mutant and bullet
                if ((vert || hor) && brick.state === "mutant") {
                    this.active = false;
                    brick.state = "dead";
                    mutants_killed++;
                    break;
                }
            }

            fill("black");
            this.y -= this.width / 2;
            ellipse(this.x, this.y, this.width, this.height);
            // Kill bullet if it is off the screen
            if (this.y < 0) {
                this.active = false;
            }
        }
    }
};

// Class for the paddle
class Paddle {
    // Set the paddle size, pos, list of bullets, and fire rate
    constructor(canvas_width, canvas_height) {
        this.y = canvas_height - canvas_height / 10;
        this.width = canvas_width / 5;
        this.height = canvas_height / 40;
        this.x = canvas_width / 2;
        this.bullets = [];
        this.fire_rate = 10;
        this.delay = 0;
        this.canvas_height = canvas_height;
    }

    // Shoot bullets if possible
    shoot() {
        // Check delay with fire rate to determine if a bullet can be shot
        if (this.delay === 0) {
            // Add new bullet at paddle location
            this.bullets.push(
                new Bullet(
                    this.x, 
                    this.y, 
                    this.height / 2, 
                    this.height / 2
                )
            );
            // reset delay
            this.delay = this.fire_rate;
        }
    }

    // Update all bullets
    update_bullets() {
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].draw();
        }
    }

    // Draw paddle and shoot
    draw() {
        rectMode(CENTER);
        // If space is pressed try to fire a bullet
        if (keyIsPressed && key === ' ') {
            this.shoot();
        }
        // Draw the paddle
        rect(this.x, this.y, this.width, this.height);
        this.update_bullets();
        rectMode(CORNER);
        if (this.delay > 0) {
            this.delay--;
        }
    }
};

// Function to setup canvas and create logo
function setup() {
    createCanvas(400, 400);
    // Create new logo object
    logo = new Logo(400, 400);
    // Create start button
    start_button = new StartButton(400, 400);
    // Create the 2 balls
    balls.push(new Ball(200, 350, 400, 400));
    balls.push(new Ball(200, 350, 400, 400));
    // Create the paddle
    paddle = new Paddle(400, 400);
    // Set the game state
    game_state = "menu";
    
    // Create bricks
    x = 0;
    y = 30;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 10; j++) {
            bricks.push(new MutantBrick(x, y, 400, 400));
            x += 400 / 10;
        }
        x = 0;
        y += 10;
    }
}

// On mouse click check for start btton pressed
function mouseClicked() {
    if (start_button.mouse_hover(mouseX, mouseY) && game_state === "menu") {
        game_state = "game";
    }
}

// Function where logo will be updated
function draw() {
    background(220);
    switch (game_state) {
        // Main menu state
        case "menu":
            // Animate logo
            logo.draw();
            // Draw start button
            start_button.draw();
            break;
        // Playing game state
        case "game":
            // Draw bricks
            for (var i = 0; i < bricks.length; i++) {
                if (bricks[i].state === "brick") {
                    bricks[i].draw_brick();
                }
            }
            // Draw mutants over bricks
            for (var i = 0; i < bricks.length; i++) {
                if (bricks[i].state === "mutant") {
                    bricks[i].draw_mutant();
                    bricks[i].drop_bomb();
                }
                if (bricks[i].state != "brick") {
                    bricks[i].update_bombs();
                }
            } 
            // Draw balls and check for collisions
            balls[0].draw();
            balls[1].draw();
            balls[0].check_bricks();
            balls[1].check_bricks();
            // Paddle movement based on left and right arrow keys
            if (keyArray[LEFT_ARROW] === 1) {
                paddle.x -= 3;
            }
            if (keyArray[RIGHT_ARROW] === 1) {
                paddle.x += 3;
            }
            // Draw paddle
            paddle.draw();

            // Check for win condition
            if (mutants_killed > 30) {
                game_state = "win";
            }

            break;
        // Game over state
        case "game_over":
            // Display Game Over text
            text("Game Over", 70, 100);
            break;
        // Game won state
        case "win":
            // Display You Win! text
            text("You Win!", 100, 100);
            break;
    }
}
