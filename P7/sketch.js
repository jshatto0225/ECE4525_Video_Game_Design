var key_codes = [];

// Track pressed and released keys
function keyPressed() {
    key_codes[keyCode] = 1;
}
function keyReleased() {
    key_codes[keyCode] = 0;
}

var points = [];
var p2 = [];
var attackers = [];
var player;
let score = 0;

var splitPoints = function() {
    p2.splice(0, p2.length);
    for (var i = 0; i < points.length - 1; i++) {
        p2.push(new p5.Vector(points[i].x, points[i].y));
        p2.push(new p5.Vector((points[i].x + points[i+1].x)/2, (points[i].y + points[i+1].y)/2));
    }
    p2.push(new p5.Vector(points[i].x, points[i].y));
    p2.push(new p5.Vector((points[0].x + points[i].x)/2, (points[0].y + points[i].y)/2));
};

var average = function() {
    for (var i = 0; i < p2.length - 1; i++) {
        var x = (p2[i].x + p2[i+1].x)/2;
        var y = (p2[i].y + p2[i+1].y)/2;
        p2[i].set(x, y);
    }
    var x = (p2[i].x + points[0].x)/2;
    var y = (p2[i].y + points[0].y)/2;
    points.splice(0, points.length);
    for (i = 0; i < p2.length; i++) {
        points.push(new p5.Vector(p2[i].x, p2[i].y));
    }
};

var subdivide = function() {
    splitPoints();
    average();
};

class Rocket {
    constructor() {
        this.x = 200;
        this.y = 360;
        this.shoot_time = 0;
        this.missles = [];
    }

    shoot() {
        if (this.shoot_time === 0) {
            this.shoot_time = 60;
            this.missles.push(new Missle(this.x, this.y));
        }
    }

    update() {
        if (key_codes[LEFT_ARROW] === 1) {
            this.x -= 5;
        }
        if (key_codes[RIGHT_ARROW] === 1) {
            this.x += 5;
        }
        if (key_codes[32] === 1) {
            this.shoot();
        }

        if (this.shoot_time > 0) {
            this.shoot_time--;
        }

        for (let i = 0; i < this.missles.length; i++) {
            if (this.missles[i].state === "alive" || this.missles[i].state === "ash") {
                this.missles[i].update();
            }
            else {
                this.missles.splice(i, 1);
            }
        }
    }

    draw() {
        fill(0, 0, 255);
        noStroke();
        triangle(this.x - 17.5, this.y + 35, this.x + 17.5, this.y + 35, this.x, this.y);
        triangle(this.x, this.y + 35, this.x - 17.5, this.y + 35, this.x - 17.5, this.y + 15);
        triangle(this.x, this.y + 35, this.x + 17.5, this.y + 35, this.x + 17.5, this.y + 15);

        for (let i = 0; i < this.missles.length; i++) {
            if (this.missles[i].state === "alive" || this.missles[i].state === "ash") {
                this.missles[i].draw();
            }
        }
    }
}

class AttackerMissle {
    constructor(x, y, missle) {
        this.x = x;
        this.y = y;
        this.missle = missle;
        this.state = "alive";
        this.particles = [];
        this.speed = [0, 0];
    }

    update() {
        if (this.state === "alive") {
            if (this.missle.state === "alive") {
                let x_dist = this.missle.x - this.x;
                let y_dist = this.missle.y - this.y;
                let mag = sqrt(x_dist * x_dist + y_dist * y_dist);
                x_dist /= mag;
                y_dist /= mag;
                x_dist *= 3;
                y_dist *= 3;
                this.speed[0] = x_dist;
                this.speed[1] = y_dist;
            }

            this.x += this.speed[0];
            this.y += this.speed[1];

            if (this.particles.length < 500) {
                this.particles.push(new AttackerMissleParticle());
                this.particles.push(new AttackerMissleParticle());
                this.particles.push(new AttackerMissleParticle());
            }

            if (this.x < 0 || this.x > 400 || this.y < 0 || this.y > 400) {
                this.state = "dead";
            }

            let rot = PI - atan2(this.speed[0], this.speed[1]);
            push();
            translate(this.x, this.y);
            rotate(rot);

            for (var i = 0; i < this.particles.length; i++) {
                if ((this.particles[i].lifespan > 0) && (this.particles[i].y < 400)) {
                    this.particles[i].draw();
                    this.particles[i].update();
                }
                else {
                    this.particles.splice(i, 1);
                }
            }

            pop();
        }
        else if (this.state === "ash") {
            this.y += 2;
            if (this.particles.length < 500) {
                this.particles.push(new AshMissleParticle());
                this.particles.push(new AshMissleParticle());
                this.particles.push(new AshMissleParticle());
            }
            for (var i = 0; i < this.particles.length; i++) {
                if ((this.particles[i].lifespan > 0) && (this.particles[i].y < 400)) {
                    this.particles[i].draw();
                    this.particles[i].update();
                }
                else {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    draw() {
        if (this.state === "alive") {
            let rot = PI - atan2(this.speed[0], this.speed[1]);

            push();
            translate(this.x, this.y);
            rotate(rot);

            stroke(0, 0, 0);
            fill(255, 0 ,0);
            rectMode(CENTER);
            rect(0, 2.5, 10, 15);
            triangle(0, -10, -5, -5, 5, -5);

            pop();
        }

    }
}

class Missle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = "alive";
        this.particles = [];
    }

    check_attackers() {
        for (let i = 0; i < attackers.length; i++) {
            let attacker = attackers[i];
            if (
                (
                    (
                        this.x > attacker.x &&
                        this.x < attacker.x + 35
                    ) ||
                    (
                        this.x + 10 > attacker.x &&
                        this.x + 10 < attacker.x + 35
                    )
                ) &&
                (
                    (
                        this.y > attacker.y &&
                        this.y < attacker.y + 35
                    ) ||
                    (
                        this.y + 20 > attacker.y &&
                        this.y + 20 < attacker.y + 35
                    )
                )
            ) {
                this.state = "ash";
                this.particles = [];
                score++;
                print("Enemy Collision");
            }
        }
    }

    check_attacker_missles() {
        for (let i = 0; i < attackers.length; i++) {
            for (let j = 0; j < attackers[i].missles.length; j++) {
                let missle = attackers[i].missles[j];
                if (
                    (
                        (
                            this.x > missle.x &&
                            this.x < missle.x + 15
                        ) ||
                        (
                            this.x + 15 > missle.x &&
                            this.x + 15 < missle.x + 15
                        )
                    ) &&
                    (
                        (
                            this.y > missle.y &&
                            this.y < missle.y + 15
                        ) ||
                        (
                            this.y + 15 > missle.y &&
                            this.y + 15 < missle.y + 15
                        )
                    ) &&
                    missle.state === "alive"
                ) {
                    this.state = "ash";
                    this.particles = [];
                    missle.state = "ash";
                    missle.particles = [];
                    print("Attacker Missle Collision");
                }
            }
        }
    }

    update() {
        if (this.state === "alive") {
            this.y -= 5;

            if (this.particles.length < 500) {
                this.particles.push(new MissleParticle(this.x, this.y + 10));
                this.particles.push(new MissleParticle(this.x, this.y + 10));
                this.particles.push(new MissleParticle(this.x, this.y + 10));
            }

            if (this.x < 0 || this.x > 400 || this.y < 0 || this.y > 400) {
                this.state = "dead";
            }

            for (var i = 0; i < this.particles.length; i++) {
                if ((this.particles[i].lifespan > 0) && (this.particles[i].y < 400)) {
                    this.particles[i].draw();
                    this.particles[i].update();
                }
                else {
                    this.particles.splice(i, 1);
                }
            }

            this.check_attacker_missles();
            this.check_attackers();
        }
        else if (this.state === "ash") {
            if (this.particles.length < 500) {
                this.particles.push(new AshMissleParticle(this.x, this.y));
                this.particles.push(new AshMissleParticle(this.x, this.y));
                this.particles.push(new AshMissleParticle(this.x, this.y));
            }

            for (var i = 0; i < this.particles.length; i++) {
                if ((this.particles[i].lifespan > 0) && (this.particles[i].y < 400)) {
                    this.particles[i].draw();
                    this.particles[i].update();
                }
                else {
                    this.particles.splice(i, 1);
                }
            }

            this.y += 2;
        }
    }

    draw() {
        if (this.state === "alive") {
            stroke(0, 0, 0);
            fill(0, 255 ,0);
            rectMode(CENTER);
            rect(this.x, this.y + 2.5, 10, 15);
            triangle(this.x, this.y - 10, this.x - 5, this.y - 5, this.x + 5, this.y - 5);
        }
    }
}

var monteCarlo = function() {
    var v1 = random(220, 255);
    var v2 = random(220, 255);
    while (v2 > v1) {
        v1 = random(220, 255);
        v2 = random(220, 255);
    }
    return(v1);
};

class AttackerMissleParticle {
    constructor() {
        this.x = 0;
        this.y = 10;
        this.speed = [random(-0.5, 0.5), random(0.5, 1)];
        this.lifespan = 30;
        this.size = random(1, 5);
        this.c1 = monteCarlo();
        this.c2 = monteCarlo();
    }

    update() {
        this.x += this.speed[0];
        this.y += this.speed[1];
        this.lifespan--;
    }

    draw() {
        noStroke();
        fill(this.c1, this.c2 - 180, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }
}

class MissleParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = [random(-0.5, 0.5), random(0.5, 1) - 5];
        this.lifespan = 30;
        this.size = random(1, 5);
        this.c1 = monteCarlo();
        this.c2 = monteCarlo();
    }

    update() {
        this.x += this.speed[0];
        this.y += this.speed[1];
        this.lifespan--;
    }

    draw() {
        noStroke();
        fill(this.c1, this.c2 - 180, 0);
        ellipse(this.x, this.y, this.size, this.size);
    }
}

class AshMissleParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = [random(-1.5, 1.5), random(2.0, 2.5)];
        this.lifespan = 240;
        this.size = random(1, 3);
        this.c1 = monteCarlo();
    }

    update() {
        this.x += this.speed[0];
        this.y += this.speed[1];
        this.lifespan--;
    }

    draw() {
        noStroke();
        fill(this.c1 - 180, this.c1 - 180, this.c1 - 180);
        ellipse(this.x, this.y, this.size, this.size);
    }
}

class Attacker {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.speed = [round(random(1, 2)), round(random(1, 3))];

        this.missle_timer = 0;
        this.missles = [];
    }

    shoot(missle) {
        if (this.missle_timer === 0) {
            this.missle_timer = 180;
            this.missles.push(new AttackerMissle(this.x, this.y, missle));
        }
    }

    update() {
        this.x += this.speed[0];
        this.y += this.speed[1];

        if (this.x > 365 || this.x < 0) {
            this.speed[0] *= -1;
        }

        if (this.y < 0 || this.y > 165) {
            this.speed[1] *= -1;
        }

        for (let i = 0; i < player.missles.length; i++) {
            let x_dist = this.x - player.missles[i].x;
            let y_dist = this.y - player.missles[i].y;
            let dist = sqrt(x_dist * x_dist + y_dist * y_dist);
            if (dist < 120 && player.missles[i].state === "alive") {
                this.shoot(player.missles[i]);
                break;
            }
        }
        if (this.missle_timer > 0) {
            this.missle_timer--;
        }

        for (let i = 0; i < this.missles.length; i++) {
            if (this.missles[i].state === "alive" || this.missles[i].state === "ash") {
                this.missles[i].update();
            }
            else {
                this.missles.splice(i, 1);
            }
        }
    }

    draw() {
        fill(255, 255, 255);
        stroke(0, 0, 0);
        beginShape();
        for (var i = 0; i < points.length; i++) {
            vertex(points[i].x + this.x, points[i].y + this.y);
        }
        vertex(points[0].x + this.x, points[0].y + this.y);
        endShape();

        for (let i = 0; i < this.missles.length; i++) {
            this.missles[i].draw();
        }
    }
}

var setup = function() {
    createCanvas(400, 400);

    fill(0, 0, 0, 0)
    rect(-400, -400, 400, 400);

    points.push(new p5.Vector(0, 35));
    points.push(new p5.Vector(0, 10));
    points.push(new p5.Vector(17.5, 0));
    points.push(new p5.Vector(35, 10));
    points.push(new p5.Vector(35, 35));

    points.push(new p5.Vector(25, 25));
    points.push(new p5.Vector(17.5, 35));
    points.push(new p5.Vector(10, 25));

    subdivide();
    subdivide();
    subdivide();
    subdivide();
    subdivide();

    attackers.push(new Attacker(0, 0));
    attackers.push(new Attacker(100, 0));
    attackers.push(new Attacker(200, 0));
    attackers.push(new Attacker(300, 0));

    player = new Rocket();
}

var reset_game = function() {
    fill(0, 0, 0, 0)
    rect(-400, -400, 400, 400);

    points = [];
    points.push(new p5.Vector(0, 35));
    points.push(new p5.Vector(0, 10));
    points.push(new p5.Vector(17.5, 0));
    points.push(new p5.Vector(35, 10));
    points.push(new p5.Vector(35, 35));

    points.push(new p5.Vector(25, 25));
    points.push(new p5.Vector(17.5, 35));
    points.push(new p5.Vector(10, 25));

    subdivide();
    subdivide();
    subdivide();
    subdivide();
    subdivide();

    attackers = [];

    attackers.push(new Attacker(0, 0));
    attackers.push(new Attacker(100, 0));
    attackers.push(new Attacker(200, 0));
    attackers.push(new Attacker(300, 0));

    player = new Rocket();

    score = 0;
}

var draw = function() {
    background(220);
    if (score < 10) {

        for (var i = 0; i < attackers.length; i++) {
            attackers[i].update();
            attackers[i].draw();
        }

        player.update();
        player.draw();
    }
    else {
        textSize(50);
        fill(0, 255, 0);
        text("You Win!", 100, 100);

        textSize(25);
        fill(0, 0, 0);
        text("Press Enter To Play Again", 50, 200);
        if (key_codes[13] === 1) {
            reset_game();
        }
    }
}

