// === Memory Spiel ===

const EMOJIS = [
  '🐶', '🐱', '🐸', '🦊', '🐻', '🐼',
  '🐵', '🦁', '🐮', '🐷', '🐰', '🐨',
  '🐯', '🦄', '🐔', '🐧'
];

let currentPairs = 6;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startGame(pairs) {
  currentPairs = pairs || currentPairs;
  matchedPairs = 0;
  moves = 0;
  flippedCards = [];
  isLocked = false;

  document.getElementById('moves').textContent = '0';
  document.getElementById('pairs').textContent = '0';
  document.getElementById('total-pairs').textContent = currentPairs;

  // Update difficulty buttons
  document.querySelectorAll('.difficulty-select .btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.pairs) === currentPairs);
  });

  // Select and shuffle emoji pairs
  const selected = shuffle(EMOJIS).slice(0, currentPairs);
  cards = shuffle([...selected, ...selected]);

  // Adjust grid columns
  const grid = document.getElementById('grid');
  const cols = currentPairs <= 6 ? 4 : 4;
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Render cards
  grid.innerHTML = '';
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML = `
      <div class="card-front">?</div>
      <div class="card-back">${emoji}</div>
    `;
    card.addEventListener('click', () => flipCard(card, index));
    grid.appendChild(card);
  });
}

function flipCard(card, index) {
  if (isLocked) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  if (flippedCards.length >= 2) return;

  card.classList.add('flipped');
  flippedCards.push({ card, index });

  if (flippedCards.length === 2) {
    moves++;
    document.getElementById('moves').textContent = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [first, second] = flippedCards;
  isLocked = true;

  if (cards[first.index] === cards[second.index]) {
    // Match found
    first.card.classList.add('matched');
    second.card.classList.add('matched');
    matchedPairs++;
    document.getElementById('pairs').textContent = matchedPairs;
    flippedCards = [];
    isLocked = false;

    if (matchedPairs === currentPairs) {
      setTimeout(showWin, 500);
    }
  } else {
    // No match - flip back
    setTimeout(() => {
      first.card.classList.remove('flipped');
      second.card.classList.remove('flipped');
      flippedCards = [];
      isLocked = false;
    }, 800);
  }
}

function showWin() {
  const text = `Du hast alle ${currentPairs} Paare in ${moves} Zuegen gefunden!`;
  document.getElementById('win-text').textContent = text;
  document.getElementById('win-overlay').classList.add('active');
  spawnConfetti();
}

function closeOverlay() {
  document.getElementById('win-overlay').classList.remove('active');
}

function spawnConfetti() {
  const colors = ['#f093fb', '#f5576c', '#43e97b', '#38f9d7', '#667eea', '#ffd700'];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 1.5 + 's';
    confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}

// Start game on load
startGame(6);
