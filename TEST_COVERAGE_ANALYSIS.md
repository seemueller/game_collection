# Test Coverage Analysis

## Current State

The project has **zero test coverage**. There are no test files, no testing framework installed, and no test/lint/format scripts in `package.json`. Every area described below is a gap.

## Recommended Testing Stack

Since the project uses Vite, **Vitest** is the natural choice for a test runner — it shares the same config, supports ESM natively, and requires minimal setup. For component testing, **@testing-library/react** with **jsdom** provides a DOM environment.

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## Priority 1: Pure Function Unit Tests (High value, low effort)

These are standalone functions with no React dependencies. They can be tested immediately with just Vitest and no DOM environment.

### `shuffle(arr)` — `Memory.jsx:30`, `FarbenQuiz.jsx:43`

Duplicated Fisher-Yates implementation in two files. Tests should verify:
- Output contains exactly the same elements as input (no loss/duplication)
- Output length matches input length
- Does not mutate the original array
- Empty and single-element arrays are handled

This is also a candidate for extraction into a shared utility.

### `buildCards(pairCount)` — `Memory.jsx:39`

Generates the card grid for the Memory game. Tests should verify:
- Returns `pairCount * 2` cards
- Each emoji appears exactly twice
- Every card has `{ id, emoji, flipped: false, matched: false }`
- Emojis are drawn from `ALL_EMOJIS` (no invented values)
- Works for all difficulty levels: 6, 8, 10, 12 pairs

### `formatTime(seconds)` — `Memory.jsx:49`

Converts elapsed seconds to `M:SS` display. Tests should cover:
- `0` → `"0:00"`
- `59` → `"0:59"`
- `60` → `"1:00"`
- `125` → `"2:05"` (zero-padding of seconds)
- Large values like `600` → `"10:00"`

### `makeTask()` — `Zahlenspiel.jsx:23`

Generates math problems. Tests should verify:
- Addition tasks: both operands ≥ 1, sum ≤ 10
- Subtraction tasks: result ≥ 0 (no negative answers)
- Always produces exactly 4 options
- The correct answer is always among the options
- All options are unique
- All options are within the valid range (0–20)
- The `text` field matches the operation (contains `+` or `−`)

Run this in a loop (e.g., 100 iterations) to catch stochastic edge cases.

### `makeQuestion()` — `FarbenQuiz.jsx:50`

Generates color quiz questions. Tests should verify:
- Returns exactly 4 options
- The correct color is among the options
- All 4 options are distinct colors
- Options are drawn from the `COLORS` array

### `rand(min, max)` — `Zahlenspiel.jsx:19`

Simple random integer. Tests should verify:
- Result is always within `[min, max]` (run many iterations)
- `rand(5, 5)` always returns `5`

### `pick(arr)` — `Zahlenspiel.jsx:55`, `FarbenQuiz.jsx:47`

Another duplicated utility. Test that:
- Returns an element that exists in the input array
- Doesn't fail on single-element arrays

---

## Priority 2: Game Logic & State Transitions (High value, moderate effort)

These tests require rendering React components with `@testing-library/react` and simulating user interactions.

### Memory: Card Flip & Match Logic (`Memory.jsx`, `flipCard` at line ~80)

This is the most complex logic in the codebase. Tests should cover:

- **Basic flip:** clicking a card sets it to `flipped: true`
- **Match detection:** flipping two cards with the same emoji marks both as `matched: true`
- **Mismatch handling:** flipping two different cards flips them back after 900ms timeout
- **Lock mechanism:** clicking while two cards are face-up is ignored (`lockedRef`)
- **Already matched/flipped cards:** clicking them is a no-op
- **Move counter:** increments only when a second card is flipped (a pair attempt)
- **Win condition:** matching all pairs triggers overlay after 400ms delay
- **Streak tracking:** 3+ consecutive matches trigger streak banner

### Memory: 2-Player Mode (`Memory.jsx`, lines ~90–170)

- Turn switches to the other player on a mismatch
- Turn does NOT switch on a match (same player goes again)
- Scores increment correctly per player
- Win text correctly determines winner, or declares a tie

### Memory: Star Rating (`Memory.jsx`, line ~175)

- `moves <= pairCount + 2` → 3 stars
- `moves <= pairCount * 2` → 2 stars
- `moves > pairCount * 2` → 1 star

### Zahlenspiel: Answer Flow (`Zahlenspiel.jsx`, `handleAnswer` at line ~75)

- Correct answer increments score
- Wrong answer does not increment score
- After 10 rounds, game ends and overlay shows
- Streak counter resets on wrong answer
- Streak ≥ 3 shows fire emoji in feedback
- Double-clicking an answer is ignored (`chosen !== null` guard)
- Win icon/title thresholds: ≥ 8 → trophy, ≥ 5 → star, < 5 → muscle

### FarbenQuiz: Answer Flow (`FarbenQuiz.jsx`, `handleAnswer` at line ~73)

- Same structure as Zahlenspiel — test the same patterns
- Wrong answer feedback includes the correct color name ("Das war Rot!")
- Win thresholds differ: ≥ 9 → trophy, ≥ 6 → palette, < 6 → muscle

### Difficulty Selection (Memory)

- Changing difficulty resets the game (moves, matched pairs, timer)
- Grid columns change per difficulty: 4, 4, 5, 6
- Card count matches: 12, 16, 20, 24

---

## Priority 3: Component Rendering & Navigation (Moderate value, moderate effort)

### Overlay Component (`Overlay.jsx`)

- Renders with `active` class when `show` is `true`
- Does not render as active when `show` is `false`
- Displays passed `icon`, `title`, `text`, and optional `extra`
- "Nochmal spielen" button calls `onAction`
- "Zur Startseite" link navigates to `/`

### Home Page (`Home.jsx`)

- Renders exactly 3 game cards
- Each card links to the correct route (`/memory`, `/zahlenspiel`, `/farbenquiz`)
- Game titles and descriptions are displayed

### Routing (`App.jsx`)

- `/` renders Home
- `/memory` renders Memory
- `/zahlenspiel` renders Zahlenspiel
- `/farbenquiz` renders FarbenQuiz
- Unknown routes do not crash (currently no 404 page — could be a gap)

### Back Navigation

- Each game has a back button (← link to `/`)

---

## Priority 4: Edge Cases & Robustness (Moderate value, higher effort)

### Timer Lifecycle (Memory)

- Timer starts on game load
- Timer stops when the game is won
- Timer resets on "Nochmal spielen"
- Timer stops/restarts correctly when switching difficulty mid-game
- No interval leaks (the `useEffect` cleanup runs)

### Confetti (`confetti.js`)

- Creates exactly 40 DOM elements with class `confetti`
- Elements are appended to `document.body`
- All elements are removed after 5000ms
- Colors are drawn from the defined `COLORS` array

### Sound Module (`sounds.js`)

- `getCtx()` lazily creates an `AudioContext` singleton
- Each sound function calls `playTone` without throwing, even if `AudioContext` is unavailable
- `playStreak(count)` caps at 5 tones regardless of count

### Multiple-Choice Edge Cases

- `makeTask()`: when `answer` is 0, 1, or 2, wrong options near the boundary (e.g., negative values) are excluded
- `makeQuestion()`: with only 10 colors, 4 options always possible without duplicates

---

## Priority 5: Accessibility & Integration (Lower priority, higher effort)

- All interactive elements are keyboard-accessible
- `aria-label="Zurueck"` on back buttons is correct
- Color quiz is not solely color-dependent (color names are displayed as text)
- Screen reader behavior with overlay open/close
- Responsive layout at 600px breakpoint renders correctly

---

## Suggested Refactoring to Improve Testability

1. **Extract shared utilities** — `shuffle`, `pick`, and `rand` are duplicated across files. Move them to a `src/utils.js` module for single-source testing.

2. **Extract game logic from components** — Functions like `buildCards`, `makeTask`, and `makeQuestion` are already pure and can be tested directly if exported. Currently they're module-scoped but not exported. Adding named exports (or moving them to separate files) makes testing straightforward.

3. **Extract win-condition logic** — The star rating, win text, and win icon computations are inline in the render. Moving these to testable helper functions reduces the need for full component rendering to verify them.

4. **Add a 404 route** — There's no fallback route for unknown paths. Adding one improves robustness and is easy to test.

---

## Estimated Test Distribution

| Category | Approx. test count | Framework needed |
|---|---|---|
| Pure functions (Priority 1) | ~30–40 | Vitest only |
| Game logic/state (Priority 2) | ~30–40 | Vitest + Testing Library |
| Component rendering (Priority 3) | ~15–20 | Vitest + Testing Library |
| Edge cases (Priority 4) | ~15–20 | Vitest + Testing Library |
| Accessibility (Priority 5) | ~10 | Vitest + Testing Library + axe |

**Recommended starting point:** Priority 1 (pure functions) gives the highest coverage-to-effort ratio and requires only `vitest` with no DOM setup.
