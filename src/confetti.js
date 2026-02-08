const COLORS = ['#f093fb', '#f5576c', '#43e97b', '#38f9d7', '#667eea', '#ffd700'];

export function spawnConfetti() {
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDelay = Math.random() * 1.5 + 's';
    el.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}
