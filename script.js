const puzzle = document.getElementById("puzzle");
const size = 6;
let pieces = [];

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundPosition = `${(x * 100) / (size - 1)}% ${(y * 100) / (size - 1)}%`;
    piece.dataset.index = y * size + x;
    pieces.push(piece);
  }
}

shuffleArray(pieces);

pieces.forEach((piece, index) => {
  piece.draggable = true;
  piece.dataset.current = index;
  setPosition(piece, index);
  puzzle.appendChild(piece);
});

function setPosition(piece, index) {
  piece.style.gridColumnStart = (index % size) + 1;
  piece.style.gridRowStart = Math.floor(index / size) + 1;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Sürükle bırak
let draggedPiece = null;

pieces.forEach(piece => {
  piece.addEventListener("dragstart", () => {
    draggedPiece = piece;
  });

  piece.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  piece.addEventListener("drop", () => {
    if (draggedPiece === piece) return;

    const tempIndex = piece.dataset.current;
    piece.dataset.current = draggedPiece.dataset.current;
    draggedPiece.dataset.current = tempIndex;

    setPosition(piece, piece.dataset.current);
    setPosition(draggedPiece, draggedPiece.dataset.current);

    checkCompletion();
  });

  // Mobil destek
  piece.addEventListener("touchstart", (e) => {
    draggedPiece = piece;
    e.preventDefault();
  }, { passive: false });

  piece.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!target || !target.classList.contains("piece") || target === draggedPiece) return;

    const tempIndex = target.dataset.current;
    target.dataset.current = draggedPiece.dataset.current;
    draggedPiece.dataset.current = tempIndex;

    setPosition(target, target.dataset.current);
    setPosition(draggedPiece, draggedPiece.dataset.current);

    checkCompletion();
  }, { passive: false });
});

function checkCompletion() {
  let correct = 0;
  pieces.forEach((p, i) => {
    if (parseInt(p.dataset.index) === parseInt(p.dataset.current)) {
      correct++;
    }
  });

  if (correct === size * size) {
    showMessage();
    startFireworks();
  }
}

// Müzik butonu
const playButton = document.getElementById("playButton");
const bgMusic = document.getElementById("bgMusic");
playButton.addEventListener("click", () => {
  bgMusic.play();
});

// Mesaj kutusu ve kapanma
const messageBox = document.getElementById("messageBox");
const closeMessage = document.getElementById("closeMessage");
closeMessage.addEventListener("click", () => {
  messageBox.classList.remove("show");
});

// Göster mesaj
function showMessage() {
  messageBox.classList.add("show");
}

// Basit kalp havai fişek
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function startFireworks() {
  let hearts = [];

  function Heart(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10 + Math.random() * 10;
    this.life = 60;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    hearts.forEach((h, i) => {
      h.x += h.vx;
      h.y += h.vy;
      h.life--;

      ctx.fillStyle = "rgba(255,0,100,0.8)";
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.bezierCurveTo(h.x - h.size / 2, h.y - h.size / 2, h.x - h.size, h.y + h.size / 2, h.x, h.y + h.size);
      ctx.bezierCurveTo(h.x + h.size, h.y + h.size / 2, h.x + h.size / 2, h.y - h.size / 2, h.x, h.y);
      ctx.fill();

      if (h.life <= 0) hearts.splice(i, 1);
    });

    if (messageBox.classList.contains("show")) {
      if (Math.random() < 0.3) {
        hearts.push(new Heart(Math.random() * canvas.width, Math.random() * canvas.height));
      }
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
