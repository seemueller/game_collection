import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { makeTask, TOTAL } from './Zahlenspiel';
import Zahlenspiel from './Zahlenspiel';

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

describe('makeTask', () => {
  it('returns an object with text, answer, visual, and options', () => {
    const task = makeTask();
    expect(task).toHaveProperty('text');
    expect(task).toHaveProperty('answer');
    expect(task).toHaveProperty('visual');
    expect(task).toHaveProperty('options');
  });

  it('always has exactly 4 options', () => {
    for (let i = 0; i < 50; i++) {
      expect(makeTask().options).toHaveLength(4);
    }
  });

  it('the correct answer is among the options', () => {
    for (let i = 0; i < 50; i++) {
      const task = makeTask();
      expect(task.options).toContain(task.answer);
    }
  });

  it('all options are unique', () => {
    for (let i = 0; i < 50; i++) {
      const task = makeTask();
      expect(new Set(task.options).size).toBe(4);
    }
  });

  it('all options are non-negative and <= 20', () => {
    for (let i = 0; i < 100; i++) {
      const task = makeTask();
      task.options.forEach((opt) => {
        expect(opt).toBeGreaterThanOrEqual(0);
        expect(opt).toBeLessThanOrEqual(20);
      });
    }
  });

  it('answer is within valid range for addition (sum <= 10)', () => {
    for (let i = 0; i < 100; i++) {
      const task = makeTask();
      if (task.text.includes('+')) {
        expect(task.answer).toBeGreaterThanOrEqual(2);
        expect(task.answer).toBeLessThanOrEqual(10);
      }
    }
  });

  it('answer is non-negative for subtraction', () => {
    for (let i = 0; i < 100; i++) {
      const task = makeTask();
      if (task.text.includes('\u2212')) {
        expect(task.answer).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('text contains + or \u2212 operator', () => {
    for (let i = 0; i < 50; i++) {
      const task = makeTask();
      const hasOp = task.text.includes('+') || task.text.includes('\u2212');
      expect(hasOp).toBe(true);
    }
  });

  it('visual contains emoji characters', () => {
    const task = makeTask();
    expect(task.visual.length).toBeGreaterThan(0);
  });
});

describe('TOTAL', () => {
  it('is 10', () => {
    expect(TOTAL).toBe(10);
  });
});

// --- Helper to parse the displayed math task ---

function parseAnswer(container) {
  const text = container.querySelector('.task-display').textContent;
  if (text.includes('+')) {
    const parts = text.match(/(\d+)\s*\+\s*(\d+)/);
    return parseInt(parts[1]) + parseInt(parts[2]);
  } else {
    const parts = text.match(/(\d+)\s*\u2212\s*(\d+)/);
    return parseInt(parts[1]) - parseInt(parts[2]);
  }
}

function getAnswerBtns(container) {
  return Array.from(container.querySelectorAll('.answer-btn'));
}

// --- Component tests ---

function renderZahlenspiel() {
  return render(
    <MemoryRouter>
      <Zahlenspiel />
    </MemoryRouter>
  );
}

describe('Zahlenspiel component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the title and instructions', () => {
    const { container } = renderZahlenspiel();
    expect(container.querySelector('.game-title').textContent).toContain('Zahlenspiel');
    expect(container.querySelector('.game-info').textContent).toBe('Loese die Aufgaben und sammle Sterne!');
  });

  it('shows the initial score and round', () => {
    const { container } = renderZahlenspiel();
    const stats = Array.from(container.querySelectorAll('.stat')).map((s) => s.textContent);
    expect(stats.some((s) => s.includes('Sterne: 0'))).toBe(true);
    expect(stats.some((s) => s.includes('Aufgabe: 1 / 10'))).toBe(true);
  });

  it('renders 4 answer buttons', () => {
    const { container } = renderZahlenspiel();
    expect(getAnswerBtns(container)).toHaveLength(4);
  });

  it('shows back button linking to home', () => {
    const { container } = renderZahlenspiel();
    const backLink = container.querySelector('.back-button');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/');
  });

  it('displays the math task text', () => {
    const { container } = renderZahlenspiel();
    const taskDisplay = container.querySelector('.task-display');
    expect(taskDisplay).not.toBeNull();
    const text = taskDisplay.textContent;
    expect(text.includes('+') || text.includes('\u2212')).toBe(true);
  });

  it('shows correct feedback when clicking the right answer', () => {
    const { container } = renderZahlenspiel();
    const answer = parseAnswer(container);

    const correctBtn = getAnswerBtns(container).find(
      (b) => b.textContent === String(answer)
    );
    act(() => { fireEvent.click(correctBtn); });

    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Sterne: 1'))).toBe(true);
  });

  it('shows wrong feedback when clicking incorrect answer', () => {
    const { container } = renderZahlenspiel();
    const answer = parseAnswer(container);

    const wrongBtn = getAnswerBtns(container).find(
      (b) => b.textContent !== String(answer)
    );
    act(() => { fireEvent.click(wrongBtn); });

    // Score stays 0
    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Sterne: 0'))).toBe(true);
    // Feedback shows cross
    expect(container.querySelector('.feedback').textContent).toMatch(/\u274C/);
  });

  it('disables buttons after choosing an answer', () => {
    const { container } = renderZahlenspiel();

    const btns = getAnswerBtns(container);
    act(() => { fireEvent.click(btns[0]); });

    getAnswerBtns(container).forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
  });

  it('advances to next round after timeout', () => {
    const { container } = renderZahlenspiel();

    const btns = getAnswerBtns(container);
    act(() => { fireEvent.click(btns[0]); });

    act(() => { vi.advanceTimersByTime(1500); });

    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Aufgabe: 2 / 10'))).toBe(true);
  });

  it('resets game when clicking "Neues Spiel"', () => {
    const { container } = renderZahlenspiel();

    // Answer a question
    const btns = getAnswerBtns(container);
    act(() => { fireEvent.click(btns[0]); });
    act(() => { vi.advanceTimersByTime(1500); });

    // Click reset
    const resetBtn = Array.from(container.querySelectorAll('.btn.btn-green'))
      .find((b) => b.textContent === 'Neues Spiel');
    act(() => { fireEvent.click(resetBtn); });

    const stats = Array.from(container.querySelectorAll('.stat'));
    expect(stats.some((s) => s.textContent.includes('Sterne: 0'))).toBe(true);
    expect(stats.some((s) => s.textContent.includes('Aufgabe: 1 / 10'))).toBe(true);
  });

  it('shows win overlay after 10 rounds', () => {
    const { container } = renderZahlenspiel();

    for (let i = 0; i < TOTAL; i++) {
      const btns = getAnswerBtns(container);
      act(() => { fireEvent.click(btns[0]); });
      act(() => { vi.advanceTimersByTime(1500); });
    }

    expect(container.querySelector('.overlay.active')).toBeTruthy();
    expect(container.querySelector('.overlay-text').textContent)
      .toMatch(/Du hast \d+ von 10 Aufgaben richtig geloest!/);
  });
});
