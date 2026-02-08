import { describe, it, expect } from 'vitest';
import { shuffle, pick, rand } from './utils';

describe('shuffle', () => {
  it('returns an array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffle(input)).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('handles duplicate values correctly', () => {
    const input = [1, 1, 2, 2, 3];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });
});

describe('pick', () => {
  it('returns an element from the array', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(pick(arr));
    }
  });

  it('works with a single-element array', () => {
    expect(pick([99])).toBe(99);
  });
});

describe('rand', () => {
  it('returns a value within [min, max]', () => {
    for (let i = 0; i < 100; i++) {
      const result = rand(3, 7);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(7);
    }
  });

  it('returns the value when min equals max', () => {
    expect(rand(5, 5)).toBe(5);
  });

  it('returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const result = rand(1, 10);
      expect(Number.isInteger(result)).toBe(true);
    }
  });

  it('can reach both boundary values', () => {
    const results = new Set();
    for (let i = 0; i < 200; i++) {
      results.add(rand(0, 1));
    }
    expect(results.has(0)).toBe(true);
    expect(results.has(1)).toBe(true);
  });
});
