import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawnConfetti } from './confetti';

describe('spawnConfetti', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any remaining confetti elements
    document.querySelectorAll('.confetti').forEach((el) => el.remove());
    vi.useRealTimers();
  });

  it('creates exactly 40 confetti elements', () => {
    spawnConfetti();
    const confetti = document.querySelectorAll('.confetti');
    expect(confetti).toHaveLength(40);
  });

  it('appends confetti elements to document.body', () => {
    spawnConfetti();
    const confetti = document.body.querySelectorAll('.confetti');
    expect(confetti.length).toBe(40);
  });

  it('each element has the "confetti" class', () => {
    spawnConfetti();
    const confetti = document.querySelectorAll('.confetti');
    confetti.forEach((el) => {
      expect(el.className).toBe('confetti');
    });
  });

  it('each element has a left position set', () => {
    spawnConfetti();
    const confetti = document.querySelectorAll('.confetti');
    confetti.forEach((el) => {
      expect(el.style.left).toMatch(/[\d.]+vw/);
    });
  });

  it('each element has a background color', () => {
    spawnConfetti();
    const confetti = document.querySelectorAll('.confetti');
    confetti.forEach((el) => {
      expect(el.style.background).toBeTruthy();
    });
  });

  it('each element has animationDelay and animationDuration', () => {
    spawnConfetti();
    const confetti = document.querySelectorAll('.confetti');
    confetti.forEach((el) => {
      expect(el.style.animationDelay).toMatch(/[\d.]+s/);
      expect(el.style.animationDuration).toMatch(/[\d.]+s/);
    });
  });

  it('removes all elements after 5000ms', () => {
    spawnConfetti();
    expect(document.querySelectorAll('.confetti')).toHaveLength(40);

    vi.advanceTimersByTime(5000);

    expect(document.querySelectorAll('.confetti')).toHaveLength(0);
  });

  it('does not remove elements before 5000ms', () => {
    spawnConfetti();
    vi.advanceTimersByTime(4999);
    expect(document.querySelectorAll('.confetti').length).toBeGreaterThan(0);
  });
});
