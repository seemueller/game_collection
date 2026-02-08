// === Zahlenspiel ===

const TOTAL_TASKS = 10;
const EMOJI_OBJECTS = ['🍎', '🌟', '🎈', '🍪', '🐟', '🌸', '🍬', '🎯'];

let currentTask = 0;
let score = 0;
let correctAnswer = 0;
let isAnswered = false;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  currentTask = 0;
  score = 0;
  isAnswered = false;
  document.getElementById('score').textContent = '0';
  document.getElementById('current-task').textContent = '1';
  document.getElementById('total-tasks').textContent = TOTAL_TASKS;
  document.getElementById('progress').style.width = '0%';
  closeOverlay();
  generateTask();
}

function generateTask() {
  isAnswered = false;
  document.getElementById('feedback').textContent = '';

  // Generate a simple addition or subtraction
  const isAddition = Math.random() > 0.3; // more additions for young kids
  let a, b;

  if (isAddition) {
    a = randomInt(1, 8);
    b = randomInt(1, 10 - a);
    correctAnswer = a + b;
    document.getElementById('task').textContent = `${a} + ${b} = ?`;
  } else {
    correctAnswer = randomInt(1, 8);
    b = randomInt(1, 10 - correctAnswer);
    a = correctAnswer + b;
    document.getElementById('task').textContent = `${a} - ${b} = ?`;
  }

  // Visual help with emoji
  const emoji = EMOJI_OBJECTS[randomInt(0, EMOJI_OBJECTS.length - 1)];
  if (isAddition) {
    const groupA = emoji.repeat(a);
    const groupB = emoji.repeat(b);
    document.getElementById('visual-help').textContent = groupA + ' + ' + groupB;
  } else {
    const groupA = emoji.repeat(a);
    document.getElementById('visual-help').textContent = groupA;
  }

  // Generate answer options (4 choices)
  const answers = new Set([correctAnswer]);
  while (answers.size < 4) {
    let wrong = correctAnswer + randomInt(-3, 3);
    if (wrong >= 0 && wrong <= 20 && wrong !== correctAnswer) {
      answers.add(wrong);
    }
  }

  // Shuffle and render
  const shuffled = [...answers].sort(() => Math.random() - 0.5);
  const container = document.getElementById('answers');
  container.innerHTML = '';

  shuffled.forEach(answer => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.addEventListener('click', () => checkAnswer(btn, answer));
    container.appendChild(btn);
  });
}

function checkAnswer(btn, answer) {
  if (isAnswered) return;
  isAnswered = true;

  const buttons = document.querySelectorAll('.answer-btn');
  buttons.forEach(b => b.disabled = true);

  if (answer === correctAnswer) {
    btn.classList.add('correct');
    score++;
    document.getElementById('score').textContent = score;
    document.getElementById('feedback').textContent = '✅ Richtig!';
  } else {
    btn.classList.add('wrong');
    // Highlight correct answer
    buttons.forEach(b => {
      if (parseInt(b.textContent) === correctAnswer) {
        b.classList.add('correct');
      }
    });
    document.getElementById('feedback').textContent = '❌ Nicht ganz!';
  }

  currentTask++;
  const progress = (currentTask / TOTAL_TASKS) * 100;
  document.getElementById('progress').style.width = progress + '%';

  if (currentTask >= TOTAL_TASKS) {
    setTimeout(showWin, 1200);
  } else {
    document.getElementById('current-task').textContent = currentTask + 1;
    setTimeout(generateTask, 1200);
  }
}

function showWin() {
  const stars = '⭐'.repeat(score);
  document.getElementById('win-text').textContent =
    `Du hast ${score} von ${TOTAL_TASKS} Aufgaben richtig geloest!`;
  document.getElementById('win-stars').textContent = stars || '💪 Beim naechsten Mal klappt es besser!';

  if (score >= 8) {
    document.getElementById('win-overlay').querySelector('.overlay-icon').textContent = '🏆';
  } else if (score >= 5) {
    document.getElementById('win-overlay').querySelector('.overlay-icon').textContent = '🌟';
  } else {
    document.getElementById('win-overlay').querySelector('.overlay-icon').textContent = '💪';
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
