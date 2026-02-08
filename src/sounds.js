// === Sound-Modul mit Web Audio API ===
// Erzeugt kurze, kindgerechte Toene ohne externe Dateien.

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

function playTone(freq, duration, type = 'sine', volume = 0.25, delay = 0) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration);
  } catch {
    // Audio nicht verfuegbar - kein Problem
  }
}

// Karte umdrehen (kurzer Klick)
export function playFlip() {
  playTone(800, 0.08, 'sine', 0.15);
}

// Paar gefunden (froeliches Ding-Ding)
export function playMatch() {
  playTone(523, 0.15, 'sine', 0.25);
  playTone(659, 0.15, 'sine', 0.25, 0.12);
  playTone(784, 0.2, 'sine', 0.25, 0.24);
}

// Kein Paar (sanftes Wah-Wah)
export function playNoMatch() {
  playTone(300, 0.2, 'triangle', 0.15);
  playTone(250, 0.25, 'triangle', 0.12, 0.15);
}

// Richtige Antwort (helles Pling)
export function playCorrect() {
  playTone(587, 0.12, 'sine', 0.2);
  playTone(880, 0.18, 'sine', 0.25, 0.1);
}

// Falsche Antwort (tiefes Bonk)
export function playWrong() {
  playTone(220, 0.15, 'square', 0.1);
  playTone(180, 0.2, 'square', 0.08, 0.12);
}

// Spiel gewonnen (Fanfare)
export function playWin() {
  playTone(523, 0.15, 'sine', 0.2);
  playTone(659, 0.15, 'sine', 0.2, 0.15);
  playTone(784, 0.15, 'sine', 0.2, 0.3);
  playTone(1047, 0.35, 'sine', 0.3, 0.45);
}

// Streak-Sound (aufsteigend je nach Streak-Laenge)
export function playStreak(count) {
  const baseFreq = 523;
  for (let i = 0; i < Math.min(count, 5); i++) {
    playTone(baseFreq + i * 100, 0.1, 'sine', 0.15, i * 0.08);
  }
}

// Button-Klick
export function playClick() {
  playTone(600, 0.05, 'sine', 0.1);
}
