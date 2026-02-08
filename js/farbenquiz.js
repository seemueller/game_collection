// === Farben-Quiz ===

const COLORS = [
  { name: 'Rot',     hex: '#e53e3e', btnBg: '#e53e3e' },
  { name: 'Blau',    hex: '#3182ce', btnBg: '#3182ce' },
  { name: 'Gruen',   hex: '#38a169', btnBg: '#38a169' },
  { name: 'Gelb',    hex: '#ecc94b', btnBg: '#d69e2e' },
  { name: 'Orange',  hex: '#ed8936', btnBg: '#dd6b20' },
  { name: 'Lila',    hex: '#805ad5', btnBg: '#805ad5' },
  { name: 'Rosa',    hex: '#ed64a6', btnBg: '#d53f8c' },
  { name: 'Braun',   hex: '#8B4513', btnBg: '#8B4513' },
  { name: 'Schwarz', hex: '#1a202c', btnBg: '#2d3748' },
  { name: 'Weiss',   hex: '#f7f7f7', btnBg: '#a0aec0' },
];

const TOTAL_ROUNDS = 10;

let currentRound = 0;
let score = 0;
let correctColor = null;
let isAnswered = false;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startGame() {
  currentRound = 0;
  score = 0;
  isAnswered = false;
  document.getElementById('score').textContent = '0';
  document.getElementById('total').textContent = TOTAL_ROUNDS;
  closeOverlay();
  renderDots();
  nextRound();
}

function renderDots() {
  const container = document.getElementById('round-dots');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const dot = document.createElement('div');
    dot.className = 'round-dot';
    dot.id = `dot-${i}`;
    container.appendChild(dot);
  }
}

function nextRound() {
  isAnswered = false;
  document.getElementById('feedback').textContent = '';

  // Mark current dot
  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) dot.classList.toggle('current', i === currentRound);
  }

  // Pick correct color
  correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  // Show color circle
  const display = document.getElementById('color-display');
  display.style.backgroundColor = correctColor.hex;
  display.classList.remove('bounce');
  void display.offsetWidth; // force reflow
  display.classList.add('bounce');

  // Handle white specially - add visible border
  if (correctColor.name === 'Weiss') {
    display.style.border = '6px solid #ccc';
  } else {
    display.style.border = '6px solid white';
  }

  // Generate wrong answers
  const wrongChoices = shuffle(COLORS.filter(c => c.name !== correctColor.name)).slice(0, 3);
  const allChoices = shuffle([correctColor, ...wrongChoices]);

  // Render buttons
  const container = document.getElementById('answers');
  container.innerHTML = '';
  allChoices.forEach(color => {
    const btn = document.createElement('button');
    btn.className = 'color-btn';
    btn.textContent = color.name;
    btn.style.backgroundColor = color.btnBg;

    // Special styling for light colors
    if (color.name === 'Gelb' || color.name === 'Weiss') {
      btn.style.color = '#333';
      btn.style.textShadow = 'none';
    }

    btn.addEventListener('click', () => checkAnswer(btn, color));
    container.appendChild(btn);
  });
}

function checkAnswer(btn, color) {
  if (isAnswered) return;
  isAnswered = true;

  const buttons = document.querySelectorAll('.color-btn');
  buttons.forEach(b => b.disabled = true);

  const dot = document.getElementById(`dot-${currentRound}`);

  if (color.name === correctColor.name) {
    btn.classList.add('correct');
    score++;
    document.getElementById('score').textContent = score;
    document.getElementById('feedback').textContent = '✅ Richtig!';
    if (dot) {
      dot.classList.remove('current');
      dot.classList.add('correct');
    }
  } else {
    btn.classList.add('wrong');
    // Highlight correct answer
    buttons.forEach(b => {
      if (b.textContent === correctColor.name) {
        b.classList.add('correct');
      }
    });
    document.getElementById('feedback').textContent = `❌ Das war ${correctColor.name}!`;
    if (dot) {
      dot.classList.remove('current');
      dot.classList.add('wrong');
    }
  }

  currentRound++;

  if (currentRound >= TOTAL_ROUNDS) {
    setTimeout(showWin, 1200);
  } else {
    setTimeout(nextRound, 1200);
  }
}

function showWin() {
  const pct = Math.round((score / TOTAL_ROUNDS) * 100);
  document.getElementById('win-text').textContent =
    `Du hast ${score} von ${TOTAL_ROUNDS} Farben richtig erkannt!`;

  if (score >= 9) {
    document.getElementById('win-icon').textContent = '🏆';
    document.getElementById('win-title').textContent = 'Farben-Profi!';
  } else if (score >= 6) {
    document.getElementById('win-icon').textContent = '🎨';
    document.getElementById('win-title').textContent = 'Toll gemacht!';
  } else {
    document.getElementById('win-icon').textContent = '💪';
    document.getElementById('win-title').textContent = 'Weiter ueben!';
  }

  document.getElementById('win-overlay').classList.add('active');
  if (score >= 5) spawnConfetti();
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

// Start on load
startGame();
