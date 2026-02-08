/** Fisher-Yates shuffle — returns a new array without mutating the original. */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Return a random element from an array. */
export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Return a random integer in [min, max]. */
export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
