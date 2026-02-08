import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { buildCards, formatTime, getStarRating, ALL_EMOJIS, DIFFICULTIES } from './Memory';
import Memory from './Memory';

// Mock sounds to avoid AudioContext issues in tests
vi.mock('../sounds', () => ({
  playFlip: vi.fn(),
  playMatch: vi.fn(),
  playNoMatch: vi.fn(),
  playWin: vi.fn(),
  playStreak: vi.fn(),
}));

vi.mock('../confetti', () => ({
  spawnConfetti: vi.fn(),
}));

// --- Pure function tests ---

describe('buildCards', () => {
  it('returns pairCount * 2 cards', () => {
    for (const pairs of [6, 8, 10, 12]) {
      expect(buildCards(pairs)).toHaveLength(pairs * 2);
    }
  });

  it('each emoji appears exactly twice', () => {
    const cards = buildCards(6);
    const counts = {};
    cards.forEach((c) => {
      counts[c.emoji] = (counts[c.emoji] || 0) + 1;
    });
    Object.values(counts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('all emojis come from ALL_EMOJIS', () => {
    const cards = buildCards(12);
    cards.forEach((card) => {
      expect(ALL_EMOJIS).toContain(card.emoji);
    });
  });

  it('all cards start unflipped and unmatched', () => {
    const cards = buildCards(8);
    cards.forEach((card) => {
      expect(card.flipped).toBe(false);
      expect(card.matched).toBe(false);
    });
  });

  it('each card has a unique id', () => {
    const cards = buildCards(10);
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('formatTime', () => {
  it('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats seconds with zero-padding', () => {
    expect(formatTime(5)).toBe('0:05');
  });

  it('formats 59 seconds', () => {
    expect(formatTime(59)).toBe('0:59');
  });

  it('formats exactly 1 minute', () => {
    expect(formatTime(60)).toBe('1:00');
  });

  it('formats minutes and seconds', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('formats 10 minutes', () => {
    expect(formatTime(600)).toBe('10:00');
  });
});

describe('getStarRating', () => {
  it('returns 3 stars when moves <= pairCount + 2', () => {
    expect(getStarRating(8, 6)).toBe(3);
    expect(getStarRating(6, 6)).toBe(3);
  });

  it('returns 2 stars when moves <= pairCount * 2', () => {
    expect(getStarRating(10, 6)).toBe(2);
    expect(getStarRating(12, 6)).toBe(2);
  });

  it('returns 1 star when moves > pairCount * 2', () => {
    expect(getStarRating(13, 6)).toBe(1);
    expect(getStarRating(20, 6)).toBe(1);
  });

  it('boundary: exactly pairCount + 2 gives 3 stars', () => {
    expect(getStarRating(10, 8)).toBe(3);
  });

  it('boundary: exactly pairCount * 2 gives 2 stars', () => {
    expect(getStarRating(16, 8)).toBe(2);
  });
});

describe('DIFFICULTIES', () => {
  it('has 4 difficulty levels', () => {
    expect(DIFFICULTIES).toHaveLength(4);
  });

  it('each difficulty has pairs, label, and cols', () => {
    DIFFICULTIES.forEach((d) => {
      expect(d).toHaveProperty('pairs');
      expect(d).toHaveProperty('label');
      expect(d).toHaveProperty('cols');
    });
  });

  it('pairs are in ascending order', () => {
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      expect(DIFFICULTIES[i].pairs).toBeGreaterThan(DIFFICULTIES[i - 1].pairs);
    }
  });
});

// --- Component tests ---

function renderMemory() {
  return render(
    <MemoryRouter>
      <Memory />
    </MemoryRouter>
  );
}

describe('Memory component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title and instructions', () => {
    const { container } = renderMemory();
    expect(container.querySelector('.game-title').textContent).toContain('Memory');
    expect(container.querySelector('.game-info').textContent).toBe('Finde alle passenden Paare!');
  });

  it('renders 12 cards by default (6 pairs)', () => {
    const { container } = renderMemory();
    expect(container.querySelectorAll('.memory-card')).toHaveLength(12);
  });

  it('shows back button linking to home', () => {
    const { container } = renderMemory();
    const backLink = container.querySelector('.back-button');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('shows difficulty buttons', () => {
    const { container } = renderMemory();
    const btns = container.querySelectorAll('.difficulty-select .btn');
    const labels = Array.from(btns).map((b) => b.textContent);
    expect(labels).toContain('Leicht (6)');
    expect(labels).toContain('Mittel (8)');
    expect(labels).toContain('Schwer (10)');
    expect(labels).toContain('Sehr schwer (12)');
  });

  it('shows player mode buttons', () => {
    const { container } = renderMemory();
    const modeBtns = container.querySelectorAll('.mode-select .btn');
    const labels = Array.from(modeBtns).map((b) => b.textContent);
    expect(labels.some((l) => l.includes('1 Spieler'))).toBe(true);
    expect(labels.some((l) => l.includes('2 Spieler'))).toBe(true);
  });

  it('changes card count when switching difficulty', () => {
    const { container } = renderMemory();

    const btns = container.querySelectorAll('.difficulty-select .btn');
    const mittelBtn = Array.from(btns).find((b) => b.textContent === 'Mittel (8)');

    act(() => { fireEvent.click(mittelBtn); });
    expect(container.querySelectorAll('.memory-card')).toHaveLength(16);

    const schwerBtn = Array.from(container.querySelectorAll('.difficulty-select .btn'))
      .find((b) => b.textContent === 'Schwer (10)');
    act(() => { fireEvent.click(schwerBtn); });
    expect(container.querySelectorAll('.memory-card')).toHaveLength(20);
  });

  it('flips a card when clicked', () => {
    const { container } = renderMemory();
    const cards = container.querySelectorAll('.memory-card');

    act(() => { fireEvent.click(cards[0]); });
    expect(cards[0].classList.contains('flipped')).toBe(true);
  });

  it('flips two matching cards and marks them matched', () => {
    const { container } = renderMemory();
    const cards = container.querySelectorAll('.memory-card');
    const backTexts = Array.from(cards).map((c) => c.querySelector('.card-back').textContent);
    const firstEmoji = backTexts[0];
    const matchIndex = backTexts.indexOf(firstEmoji, 1);

    act(() => { fireEvent.click(cards[0]); });
    act(() => { fireEvent.click(cards[matchIndex]); });

    expect(cards[0].classList.contains('matched')).toBe(true);
    expect(cards[matchIndex].classList.contains('matched')).toBe(true);
  });

  it('flips mismatched cards back after timeout', () => {
    const { container } = renderMemory();
    const cards = container.querySelectorAll('.memory-card');
    const backTexts = Array.from(cards).map((c) => c.querySelector('.card-back').textContent);
    let secondIndex = 1;
    while (backTexts[secondIndex] === backTexts[0] && secondIndex < cards.length) {
      secondIndex++;
    }

    act(() => { fireEvent.click(cards[0]); });
    act(() => { fireEvent.click(cards[secondIndex]); });

    expect(cards[0].classList.contains('flipped')).toBe(true);
    expect(cards[secondIndex].classList.contains('flipped')).toBe(true);

    act(() => { vi.advanceTimersByTime(1000); });

    expect(cards[0].classList.contains('flipped')).toBe(false);
    expect(cards[secondIndex].classList.contains('flipped')).toBe(false);
  });

  it('shows 2-player mode turn indicator', () => {
    const { container } = renderMemory();
    const modeBtns = container.querySelectorAll('.mode-select .btn');
    const twoPlayerBtn = Array.from(modeBtns).find((b) => b.textContent.includes('2 Spieler'));

    act(() => { fireEvent.click(twoPlayerBtn); });
    expect(container.querySelector('.turn-indicator').textContent).toBe('Spieler 1 ist dran');
  });

  it('resets the game on "Nochmal spielen"', () => {
    const { container } = renderMemory();
    const cards = container.querySelectorAll('.memory-card');

    act(() => { fireEvent.click(cards[0]); });
    expect(cards[0].classList.contains('flipped')).toBe(true);

    const resetBtn = Array.from(container.querySelectorAll('.btn.btn-green'))
      .find((b) => b.textContent === 'Nochmal spielen');
    act(() => { fireEvent.click(resetBtn); });

    container.querySelectorAll('.memory-card').forEach((c) => {
      expect(c.classList.contains('flipped')).toBe(false);
    });
  });

  it('increments moves only on second card flip', () => {
    const { container } = renderMemory();
    const stats = () => container.querySelectorAll('.stat');
    const moveStat = () => Array.from(stats()).find((s) => s.textContent.includes('Zuege'));

    expect(moveStat().textContent).toContain('Zuege: 0');

    const cards = container.querySelectorAll('.memory-card');
    act(() => { fireEvent.click(cards[0]); });
    expect(moveStat().textContent).toContain('Zuege: 0');

    // Find a non-matching card
    const backTexts = Array.from(cards).map((c) => c.querySelector('.card-back').textContent);
    let secondIndex = 1;
    while (backTexts[secondIndex] === backTexts[0]) secondIndex++;

    act(() => { fireEvent.click(cards[secondIndex]); });
    expect(moveStat().textContent).toContain('Zuege: 1');
  });
});
