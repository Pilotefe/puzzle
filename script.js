const puzzleContainer = document.getElementById("puzzle-container");
const rows = 6;
const cols = 6;
const imageSrc = "puzzle.jpg";

let pieces = [];
let draggedPiece = null;
let puzzleCompleted = false;

function getPieceSize() {
  return puzzleContainer.clientWidth / cols;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createPuzzle() {
  puzzleContainer.innerHTML = "";
  pieces = [];
  puzzleCompleted = false;

  const size = getPieceSize();
  puzzleContainer.style.height = puzzleContainer.clientWidth + "px";

  const positions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions.push({ x, y });
    }
  }

  const shuffledPositions = shuffle(positions.slice());

  for (let i = 0; i < positions.length; i++) {
    const correctPos = positions[i];
    const randomPos = shuffledPositions[i];

    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.width = size + "px";
    piece.style.height = size + "px";

    piece.style.backgroundImage = `url(${imageSrc})`;
    piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    piece.style.backgroundPosition = `${(correctPos.x / (cols - 1)) * 100}% ${(correctPos.y / (rows - 1)) * 100}%`;

    piece.dataset.correctX = correctPos.x;
    piece.dataset.correctY = correctPos.y;

    piece.style.position = "absolute";
    piece.style.left = `${randomPos.x * size}px`;
    piece.style.top = `${randomPos.y * size}px`;

    piece.setAttribute("draggable", !puzzleCompleted);

    piece.addEventListener("dragstart", dragStart);
    piece.addEventListener("dragover", dragOver);
    piece.addEventListener("drop", drop);
    piece.addEventListener("dragend", dragEnd);

    piece.addEventListener("touchstart", touchStart, { passive: false });
    piece.addEventListener("touchmove", touchMove, { passive: false });
    piece.addEventListener("touchend", touchEnd);

    puzzleContainer.appendChild(piece);
    pieces.push(piece);
  }
}

function dragStart(e) {
  if (puzzleCompleted) {
    e.preventDefault();
    return;
  }
  draggedPiece = e.target;
  e.dataTransfer.setData("text/plain", "");
}

function dragOver(e) {
  if (puzzleCompleted) return;
  e.preventDefault();
}

function drop(e) {
  if (puzzleCompleted) return;
  e.preventDefault();
  const target = e.target;
  if (!target.classList.contains("piece") || target === draggedPiece) return;

  swapPieces(draggedPiece, target);
  draggedPiece = null;
  checkComplete();
}

function dragEnd(e) {
  draggedPiece = null;
}

let touchDrag = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function touchStart(e) {
  if (puzzleCompleted) return;
  e.preventDefault();
  touchDrag = e.target;
  const touch = e.touches[0];
  const rect = touchDrag.getBoundingClientRect();
  touchOffsetX = touch.clientX - rect.left;
  touchOffsetY = touch.clientY - rect.top;
}

function touchMove(e) {
  if (puzzleCompleted) return;
  e.preventDefault();
  if (!touchDrag) return;
  const touch = e.touches[0];
  const left = touch.clientX - touchOffsetX - puzzleContainer.getBoundingClientRect().left;
  const top = touch.clientY - touchOffsetY - puzzleContainer.getBoundingClientRect().top;

  const size = getPieceSize();

  touchDrag.style.left = `${Math.min(Math.max(left, 0), puzzleContainer.clientWidth - size)}px`;
  touchDrag.style.top = `${Math.min(Math.max(top, 0), puzzleContainer.clientHeight - size)}px`;
}

function touchEnd(e) {
  if (puzzleCompleted) return;
  e.preventDefault();
  if (!touchDrag) return;

  const touch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  if (dropTarget && dropTarget.classList.contains("piece") && dropTarget !== touchDrag) {
    swapPieces(touchDrag, dropTarget);
    checkComplete();
  }

  touchDrag = null;
}

function swapPieces(p1, p2) {
  const left1 = p1.style.left;
  const top1 = p1.style.top;
  const left2 = p2.style.left;
  const top2 = p2.style.top;

  p1.style.left = left2;
  p1.style.top = top2;
  p2.style.left = left1;
  p2.style.top = top1;
}

function checkComplete() {
  const size = getPieceSize();

  for (const piece of pieces) {
    const left = parseFloat(piece.style.left);
    const top = parseFloat(piece.style.top);
    const correctX = parseInt(piece.dataset.correctX);
    const correctY = parseInt(piece.dataset.correctY);

    if (
      Math.abs(left - correctX * size) > 10 ||
      Math.abs(top - correctY * size) > 10
    ) {
      return false;
    }
  }

  puzzleCompleted = true;
  showMessage();
  launchFireworks();
  return true;
}

function showMessage() {
  const messageBox = document.getElementById("message");
  messageBox.style.opacity = 0;
  messageBox.style.display = "block";

  let opacity = 0;
  function fadeIn() {
    opacity += 0.05;
    if (opacity >= 1) {
      opacity = 1;
      messageBox.style.opacity = opacity;
    } else {
      messageBox.style.opacity = opacity;
      requestAnimationFrame(fadeIn);
    }
  }
  fadeIn();
}

document.getElementById("close-message").addEventListener("click", () => {
  const messageBox = document.getElementById("message");
  fadeOut(messageBox, () => {
    messageBox.style.display = "none";
  });
  stopFireworks();
});

function fadeOut(element, callback) {
  let opacity = 1;
  function fade() {
    opacity -= 0.05;
    if (opacity <= 0) {
      opacity = 0;
      element.style.opacity = opacity;
      if (callback) callback();
    } else {
      element.style.opacity = opacity;
      requestAnimationFrame(fade);
    }
  }
  fade();
}

// --- Havai Fişek Animasyonu ---

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];
let fireworksActive = false;

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 5 + 3;
    this.color = color;
    this.angle = Math.random() * 2 * Math.PI;
    this.speed = Math.random() * 4 + 2;
    this.life = 80;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.life--;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const x = this.x;
    const y = this.y;
    const size = this.radius;
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.closePath();
    ctx.fill();
  }
}

function launchFireworks() {
  fireworksActive = true;
  particles = [];
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height / 2;
    const hue = 330;
    const color = `hsl(${hue + Math.random() * 30}, 100%, 70%)`;
    particles.push(new Particle(x, y, color));
  }
}

function stopFireworks() {
  fireworksActive = false;
  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (fireworksActive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.update();
      p.draw();

      if (p.life <= 0) {
        particles.splice(i, 1);
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height / 2;
        const hue = 330;
        const color = `hsl(${hue + Math.random() * 30}, 100%, 70%)`;
        particles.push(new Particle(x, y, color));
      }
    });
  }
  requestAnimationFrame(animate);
}
animate();

// Müzik butonu

const musicBtn = document.getElementById("music-button");
const bgMusic = document.getElementById("bg-music");
let musicPlaying = false;

musicBtn.addEventListener("click", () => {
  if (!musicPlaying) {
    bgMusic.play();
    musicPlaying = true;
    musicBtn.style.transform = "scale(1.2)";
    setTimeout(() => (musicBtn.style.transform = "scale(1)"), 300);
  } else {
    bgMusic.pause();
    musicPlaying = false;
    musicBtn.style.transform = "scale(0.9)";
    setTimeout(() => (musicBtn.style.transform = "scale(1)"), 300);
  }
});

window.addEventListener("resize", () => {
  createPuzzle();
});

// Sayfa açıldığında puzzle oluştur
window.onload = createPuzzle;
