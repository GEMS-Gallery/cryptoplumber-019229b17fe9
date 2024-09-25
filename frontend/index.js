import { backend } from 'declarations/backend';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const JUMP_STRENGTH = 10;
const MOVE_SPEED = 5;

let score = 0;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocityY = 0;
        this.jumping = false;
    }

    draw() {
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (!this.jumping) {
            this.velocityY = -JUMP_STRENGTH;
            this.jumping = true;
        }
    }

    update() {
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.jumping = false;
        }
    }
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 10;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Bitcoin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
    }

    draw() {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'orange';
        ctx.font = '14px Arial';
        ctx.fillText('₿', this.x + 5, this.y + 15);
    }
}

const player = new Player(50, canvas.height - 30);
const platforms = [
    new Platform(0, canvas.height - 20, canvas.width),
    new Platform(200, 300, 100),
    new Platform(400, 200, 100),
    new Platform(600, 100, 100),
];
const bitcoins = [
    new Bitcoin(250, 250),
    new Bitcoin(450, 150),
    new Bitcoin(650, 50),
];

let leftPressed = false;
let rightPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') leftPressed = true;
    if (e.code === 'ArrowRight') rightPressed = true;
    if (e.code === 'Space') player.jump();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateHighScores() {
    backend.getHighScores().then((highScores) => {
        const highScoresList = document.getElementById('highScoresList');
        highScoresList.innerHTML = '';
        highScores.forEach(([name, score]) => {
            const li = document.createElement('li');
            li.textContent = `${name}: ${score}`;
            highScoresList.appendChild(li);
        });
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (leftPressed) player.x -= MOVE_SPEED;
    if (rightPressed) player.x += MOVE_SPEED;

    player.update();

    platforms.forEach(platform => {
        platform.draw();
        if (checkCollision(player, platform) && player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
        }
    });

    bitcoins.forEach((bitcoin, index) => {
        bitcoin.draw();
        if (checkCollision(player, bitcoin)) {
            bitcoins.splice(index, 1);
            score += 10;
            document.getElementById('scoreValue').textContent = score;
        }
    });

    player.draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
updateHighScores();

// Add event listener for game over (e.g., when player falls off the screen)
setInterval(() => {
    if (player.y > canvas.height) {
        const playerName = prompt('Game Over! Enter your name:');
        if (playerName) {
            backend.addHighScore(playerName, score).then(() => {
                updateHighScores();
                // Reset game state
                player.x = 50;
                player.y = canvas.height - 30;
                score = 0;
                document.getElementById('scoreValue').textContent = score;
            });
        }
    }
}, 1000);
