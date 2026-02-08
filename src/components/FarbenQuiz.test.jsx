import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeQuestion, COLORS, TOTAL } from './FarbenQuiz';
import FarbenQuiz from './FarbenQuiz';

vi.mock('../sounds', () => ({
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playWin: vi.fn(),
  playStreak: vi.fn(),
}));

vi.mock('../confetti', () => ({
  spawnConfetti: vi.fn(),
}));

// --- Pure function tests ---

describe('makeQuestion', () => {
  it('returns an object with correct and options', () => {
    const q = makeQuestion();
    expect(q).toHaveProperty('correct');
    expect(q).toHaveProperty('options');
  });

  it('always has exactly 4 options', () => {
    for (let i = 0; i < 30; i++) {
      expect(makeQuestion().options).toHaveLength(4);
    }
  });

  it('the correct color is among the options', () => {
    for (let i = 0; i < 30; i++) {
      const q = makeQuestion();
      const names = q.options.map((o) => o.name);
      expect(names).toContain(q.correct.name);
    }
  });

  it('all options are distinct colors', () => {
    for (let i = 0; i < 30; i++) {
      const q = makeQuestion();
      const names = q.options.map((o) => o.name);
      expect(new Set(names).size).toBe(4);
    }
  });

  it('all options come from COLORS', () => {
    const validNames = COLORS.map((c) => c.name);
    for (let i = 0; i < 30; i++) {
      const q = makeQuestion();
      q.options.forEach((opt) => {
        expect(validNames).toContain(opt.name);
      });
    }
  });

  it('correct color has hex and btn properties', () => {
    const q = makeQuestion();
    expect(q.correct).toHaveProperty('hex');
    expect(q.correct).toHaveProperty('btn');
    expect(q.correct).toHaveProperty('name');
  });
});

describe('COLORS', () => {
  it('has 10 colors', () => {
    expect(COLORS).toHaveLength(10);
  });

  it('each color has name, hex, and btn', () => {
    COLORS.forEach((c) => {
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('hex');
      expect(c).toHaveProperty('btn');
    });
  });

  it('all color names are unique', () => {
    const names = COLORS.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('Gelb and Weiss are marked as light', () => {
    const gelb = COLORS.find((c) => c.name === 'Gelb');
    const weiss = COLORS.find((c) => c.name === 'Weiss');
    expect(gelb.light).toBe(true);
    expect(weiss.light).toBe(true);
  });

  it('dark colors do not have light flag', () => {
    const dark = COLORS.filter((c) => !['Gelb', 'Weiss'].includes(c.name));
    dark.forEach((c) => {
      expect(c.light).toBeFalsy();
    });
  });
});

describe('TOTAL', () => {
  it('is 10', () => {
    expect(TOTAL).toBe(10);
  });
});

// --- Helpers ---

function getColorBtns(container) {
  return Array.from(container.querySelectorAll('.color-btn'));
}

function findCorrectColorName(container) {
  const bgColor = container.querySelector('.color-display').style.backgroundColor;
  const match = COLORS.find((c) => {
    const r = parseInt(c.hex.slice(1, 3), 16);
    const g = parseInt(c.hex.slice(3, 5), 16);
    const b = parseInt(c.hex.slice(5, 7), 16);
    return bgColor === `rgb(${r}, ${g}, ${b})`;
  });
  return match ? match.name : null;
}

// --- Component tests ---

function renderFarbenQuiz() {
  return render(
    <MemoryRouter>
      <FarbenQuiz />
    </MemoryRouter>
  );
}

describe('FarbenQuiz component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title and instructions', () => {
    const { container } = renderFarbenQuiz();
    expect(container.querySelector('.game-title').textContent).toContain('Farben-Quiz');
    expect(container.querySelector('.game-info').textContent).toBe('Welche Farbe siehst du?');
  });

  it('shows the initial score', () => {
    const { container } = renderFarbenQuiz();
    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Richtig: 0 / 10'))).toBe(true);
  });

  it('renders 4 color answer buttons', () => {
    const { container } = renderFarbenQuiz();
    expect(getColorBtns(container)).toHaveLength(4);
  });

  it('shows a color display area', () => {
    const { container } = renderFarbenQuiz();
    const display = container.querySelector('.color-display');
    expect(display).not.toBeNull();
    expect(display.style.backgroundColor).toBeTruthy();
  });

  it('shows back button linking to home', () => {
    const { container } = renderFarbenQuiz();
    const backLink = container.querySelector('.back-button');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('shows the question text', () => {
    const { container } = renderFarbenQuiz();
    expect(container.querySelector('.question-text').textContent).toBe('Welche Farbe ist das?');
  });

  it('shows correct feedback on right answer', () => {
    const { container } = renderFarbenQuiz();
    const correctName = findCorrectColorName(container);

    if (correctName) {
      const correctBtn = getColorBtns(container).find((b) => b.textContent === correctName);
      act(() => { fireEvent.click(correctBtn); });
      const stats = Array.from(container.querySelectorAll('.stat'));
      expect(stats.some((s) => s.textContent.includes('Richtig: 1 / 10'))).toBe(true);
    }
  });

  it('shows wrong feedback and reveals correct color name', () => {
    const { container } = renderFarbenQuiz();
    const correctName = findCorrectColorName(container);

    if (correctName) {
      const wrongBtn = getColorBtns(container).find((b) => b.textContent !== correctName);
      act(() => { fireEvent.click(wrongBtn); });

      const stats = Array.from(container.querySelectorAll('.stat'));
      expect(stats.some((s) => s.textContent.includes('Richtig: 0 / 10'))).toBe(true);
      expect(container.querySelector('.feedback').textContent).toContain(correctName);
    }
  });

  it('disables buttons after choosing', () => {
    const { container } = renderFarbenQuiz();

    const btns = getColorBtns(container);
    act(() => { fireEvent.click(btns[0]); });

    getColorBtns(container).forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
  });

  it('advances to next round after timeout', () => {
    const { container } = renderFarbenQuiz();

    act(() => { fireEvent.click(getColorBtns(container)[0]); });
    act(() => { vi.advanceTimersByTime(1500); });

    // Buttons should be enabled again for the new round
    getColorBtns(container).forEach((btn) => {
      expect(btn.disabled).toBe(false);
    });
  });

  it('resets game when clicking "Neues Spiel"', () => {
    const { container } = renderFarbenQuiz();

    act(() => { fireEvent.click(getColorBtns(container)[0]); });
    act(() => { vi.advanceTimersByTime(1500); });

    const resetBtn = Array.from(container.querySelectorAll('.btn.btn-green'))
      .find((b) => b.textContent === 'Neues Spiel');
    act(() => { fireEvent.click(resetBtn); });

    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Richtig: 0 / 10'))).toBe(true);
  });

  it('shows win overlay after 10 rounds', () => {
    const { container } = renderFarbenQuiz();

    for (let i = 0; i < TOTAL; i++) {
      act(() => { fireEvent.click(getColorBtns(container)[0]); });
      act(() => { vi.advanceTimersByTime(1500); });
    }

    expect(container.querySelector('.overlay.active')).toBeTruthy();
    expect(container.querySelector('.overlay-text').textContent)
      .toMatch(/Du hast \d+ von 10 Farben richtig erkannt!/);
  });

  it('Weiss color has correct hex value', () => {
    const weiss = COLORS.find((c) => c.name === 'Weiss');
    expect(weiss.hex).toBe('#f7f7f7');
  });
});
