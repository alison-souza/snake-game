// ======== ELEMENTOS ========
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const startButton = document.getElementById("startButton");
const scoreDisplay = document.getElementById("score");
const muteButton = document.getElementById("muteButton");

// ======== VARIÁVEIS ========
let snake = [{ x: 9 * box, y: 10 * box }];
let food = spawnFood();
let score = 0;
let direction = "";
let game;
let isGameOver = false;
let speed = 100; // velocidade inicial (ms)
let isMuted = false;

// ======== SONS ========
const moveSound = new Audio("sounds/move.mp3");
const eatSound = new Audio("sounds/eat.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const music = new Audio("sounds/music.mp3");
music.loop = true;
music.volume = 0.2;

// ======== BOTÃO MUTE ========
muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  music.muted = isMuted;
  muteButton.textContent = isMuted ? "🔇" : "🔊";
});

// ======== DETECTAR TECLAS ========
document.addEventListener("keydown", setDirection);
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && isGameOver) startGame();
});

function setDirection(event) {
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";

  if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) {
    moveSound.currentTime = 0;
    moveSound.play();
  }
}

// ======== INICIAR / REINICIAR JOGO ========
startButton.addEventListener("click", startGame);

function startGame() {
  clearInterval(game);
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = "";
  score = 0;
  scoreDisplay.innerText = score;
  food = spawnFood();
  isGameOver = false;
  speed = 100;
  game = setInterval(draw, speed);
  if (!isMuted) music.play();
}

// ======== GERAR COMIDA ========
function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

// ======== DETECÇÃO DE COLISÃO ========
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  )
    return true;
  return false;
}

// ======== GERENCIAR RANKING ========
function saveHighScore(score) {
  let scores = JSON.parse(localStorage.getItem("snakeRanking")) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  if (scores.length > 5) scores = scores.slice(0, 5);
  localStorage.setItem("snakeRanking", JSON.stringify(scores));
  return scores;
}

// ======== GAME OVER CUSTOMIZADO ========
function gameOver() {
  clearInterval(game);
  music.pause();
  gameOverSound.play();
  isGameOver = true;

  const ranking = saveHighScore(score);

  // Fundo escuro
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texto GAME OVER
  ctx.fillStyle = "#ff0000";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

  // Pontuação atual
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";
  ctx.fillText("Pontuação: " + score, canvas.width / 2, canvas.height / 2 - 20);

  // Ranking
  ctx.fillText("Top 5 Pontuações:", canvas.width / 2, canvas.height / 2 + 20);
  ranking.forEach((s, i) => {
    ctx.fillText(
      `${i + 1}º - ${s}`,
      canvas.width / 2,
      canvas.height / 2 + 50 + i * 25
    );
  });

  ctx.fillText(
    "Pressione ESPAÇO ou INICIAR para jogar novamente",
    canvas.width / 2,
    canvas.height - 30
  );
}

// ======== FUNÇÃO PRINCIPAL ========
function draw() {
  // Fundo
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Borda
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Cobra
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#4caf50" : "#2e7d32";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  // Comida
  ctx.fillStyle = "#f44336";
  ctx.fillRect(food.x, food.y, box, box);

  if (isGameOver) return;

  // Cabeça
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // Comer comida
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreDisplay.innerText = score;
    eatSound.currentTime = 0;
    eatSound.play();
    food = spawnFood();

    // Aumenta velocidade a cada 5 pontos
    if (score % 5 === 0 && speed > 40) {
      speed -= 10;
      clearInterval(game);
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // Colisão
  if (collision(newHead, snake)) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(newHead.x, newHead.y, box, box);
    gameOver();
    return;
  }

  snake.unshift(newHead);
}
