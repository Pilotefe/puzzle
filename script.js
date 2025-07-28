const container = document.getElementById("puzzle-container");
const rows = 6;
const cols = 6;

function getPieceSize() {
  return container.clientWidth / cols;
}

let pieces = [];

function createPuzzle() {
  const size = getPieceSize();

  // Temizle
  container.innerHTML = "";
  pieces = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const piece = document.createElement("div");
      piece.classList.add("piece");
      piece.style.backgroundPosition = `-${x * size}px -${y * size}px`;
      piece.dataset.correctX = x;
      piece.dataset.correctY = y;

      piece.style.left = `${x * size}px`;
      piece.style.top = `${y * size}px`;

      piece.dataset.x = x;
      piece.dataset.y = y;

      piece.style.width = size + "px";
      piece.style.height = size + "px";

      piece.style.backgroundSize = `${container.clientWidth}px ${container.clientHeight}px`;

      piece.setAttribute("draggable", "true");

      piece.addEventListener("dragstart", dragStart);
      piece.addEventListener("dragover", dragOver);
      piece.addEventListener("drop", drop);
      piece.addEventListener("dragend", dragEnd);

      piece.addEventListener("touchstart", touchStart);
      piece.addEventListener("touchmove", touchMove);
      piece.addEventListener("touchend", touchEnd);

      container.appendChild(piece);
      pieces.push(piece);
    }
  }

  shufflePuzzle(100);
}

function shufflePuzzle(times) {
  for (let i = 0; i < times; i++) {
    const idx1 = Math.floor(Math.random() * pieces.length);
    let idx2 = Math.floor(Math.random() * pieces.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * pieces.length);
    }
    swapPositions(pieces[idx1], pieces[idx2]);
  }
}

function swapPositions(p1, p2) {
  const tempX = p1.dataset.x;
  const tempY = p1.dataset.y;

  p1.dataset.x = p2.dataset.x;
  p1.dataset.y = p2.dataset.y;
  p1.style.left = `${p1.dataset.x * getPieceSize()}px`;
  p1.style.top = `${p1.dataset.y * getPieceSize()}px`;

  p2.dataset.x = tempX;
  p2.dataset.y = tempY;
  p2.style.left = `${p2.dataset.x * getPieceSize()}px`;
  p2.style.top = `${p2.dataset.y * getPieceSize()}px`;
}

let draggedPiece = null;

function dragStart(e) {
  draggedPiece = e.target;
  e.dataTransfer.effectAllowed = "move";
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function drop(e) {
  e.preventDefault();
  const target = e.target;
  if (!target.classList.contains("piece") || target === draggedPiece) return;

  swapPositions(draggedPiece, target);
  checkComplete();
}

function dragEnd(e) {
  draggedPiece = null;
}

let touchDraggedPiece = null;

function touchStart(e) {
  e.preventDefault();
  touchDraggedPiece = e.target;
}

function touchMove(e) {
  e.preventDefault();
}

function touchEnd(e) {
  e.preventDefault();
  if (!touchDraggedPiece) return;

  const touch = e.changedTouches[0];
  const dropX = touch.clientX;
  const dropY = touch.clientY;

  const target = document.elementFromPoint(dropX, dropY);
  if (target && target.classList.contains("piece") && target !== touchDraggedPiece) {
    swapPositions(touchDraggedPiece, target);
    checkComplete();
  }

  touchDraggedPiece = null;
}

function checkComplete() {
  let correct = 0;
  for (const p of pieces) {
    if (
      parseInt(p.dataset.x) === parseInt(p.dataset.correctX) &&
      parseInt(p.dataset.y) === parseInt(p.dataset.correctY)
    ) {
      correct++;
    }
  }
  console.log("Doğru parçalar:", correct, "/", pieces.length);
  if (correct === pieces.length) {
    document.getElementById("message").style.display = "block";
    launchFireworks();
  }
}

createPuzzle();

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
let fireworksActive = false;

function launchFireworks() {
  fireworksActive = true;
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
  }
}

class Particle {
  constructor() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.size = Math.random() * 8 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.speedY = Math.random() * 6 - 3;
    this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
    this.life = 100;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (fireworksActive) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.update();
      p.draw();
      if (p.life <= 0) particles.splice(i, 1);
    });

    if (particles.length === 0) fireworksActive = false;
  }
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  createPuzzle();
});
