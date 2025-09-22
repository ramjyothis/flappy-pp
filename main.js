
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const SCREEN_WIDTH = canvas.width;
const SCREEN_HEIGHT = canvas.height;

let gravity = 0.5;
let score = 0;
let highScore = 0;
let state = "start"; // start, play, game_over

// Load images
const birdImg = new Image();
birdImg.src = "bird.png";

// Background music
let bgMusic = new Audio("bg-music.mp3");
bgMusic.loop = true;
bgMusic.volume = 1.0;

// Bird class
class Bird {
  constructor() {
    this.x = 100;
    this.y = SCREEN_HEIGHT / 2;
    this.width = 50;
    this.height = 40;
    this.velocity = 0;
  }

  flap() {
    this.velocity = -8;
  }

  move() {
    this.velocity += gravity;
    this.y += this.velocity;
  }

  draw() {
    ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
  }

  getRect() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}

// Pipe class
class Pipe {
  constructor(x) {
    this.gap = 200;
    this.width = 50;
    this.height = Math.floor(Math.random() * 200) + 100;
    this.x = x;
    this.y = 0;
  }

  move() {
    this.x -= 2;
  }

  draw() {
    ctx.fillStyle = "green";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillRect(this.x, this.height + this.gap, this.width, SCREEN_HEIGHT - this.height - this.gap);
  }

  getRects() {
    return [
      { x: this.x, y: this.y, w: this.width, h: this.height },
      { x: this.x, y: this.height + this.gap, w: this.width, h: SCREEN_HEIGHT - this.height - this.gap }
    ];
  }
}

let bird, pipes;

function resetGame() {
  bird = new Bird();
  pipes = [new Pipe(300)];
  score = 0;
  state = "start";
}

// Collision detection
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.y + rect1.h > rect2.y
  );
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  if (state === "start") {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Flappy Bird", 80, 200);
    ctx.font = "25px Arial";
    ctx.fillText("Tap / Press SPACE", 60, 300);

    // Start music
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {
        // Will start on first tap
      });
    }
  } else if (state === "play") {
    bird.move();
    bird.draw();

    // Pipes
    for (let pipe of pipes) {
      pipe.move();
      pipe.draw();

      // Collision check
      for (let rect of pipe.getRects()) {
        if (isColliding(bird.getRect(), rect)) {
          state = "game_over";
        }
      }
    }

    // Add new pipes
    if (pipes[pipes.length - 1].x < 200) {
      pipes.push(new Pipe(SCREEN_WIDTH));
    }

    // Remove old pipes
    if (pipes[0].x < -50) {
      pipes.shift();
      score++;
      if (score > highScore) highScore = score;
    }

    // Check borders
    if (bird.y <= 0 || bird.y + bird.height >= SCREEN_HEIGHT) {
      state = "game_over";
    }

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "35px Arial";
    ctx.fillText(score, SCREEN_WIDTH / 2, 50);

  } else if (state === "game_over") {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", 90, 250);
    ctx.font = "25px Arial";
    ctx.fillText("Tap / Press R", 110, 320);

    // Show high score
    ctx.font = "20px Arial";
    ctx.fillText("High Score: " + highScore, 120, 370);

    // Stop music
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (state === "start") {
      state = "play";
    } else if (state === "play") {
      bird.flap();
    }
  }
  if (e.code === "KeyR" && state === "game_over") {
    resetGame();
  }
});

canvas.addEventListener("mousedown", () => {
  if (state === "start") {
    state = "play";
  } else if (state === "play") {
    bird.flap();
  } else if (state === "game_over") {
    resetGame();
  }
});

// Start game
resetGame();
gameLoop();

