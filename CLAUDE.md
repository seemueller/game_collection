# CLAUDE.md

## Project Overview

**Spielesammlung** (Game Collection) — a browser-based collection of educational mini-games for children (ages ~4-9). All UI text is in German. Pure frontend application with no backend or database.

### Games

- **Memory** (`/memory`) — Card matching game with emoji pairs, difficulty levels (6 or 8 pairs)
- **Zahlenspiel** (`/zahlenspiel`) — Math quiz with addition/subtraction (1-10 range), 10 questions per round
- **Farben-Quiz** (`/farbenquiz`) — Color recognition with 4-option multiple choice, 10 rounds

## Tech Stack

- **React 19** with functional components and hooks
- **React Router DOM 7** using `HashRouter` for GitHub Pages compatibility
- **Vite 6** as build tool and dev server
- **No TypeScript** — plain JavaScript with JSX
- **No testing framework** configured
- **No linter/formatter** configured
- **Deployment:** GitHub Pages via GitHub Actions

## Project Structure

```
src/
  main.jsx            # Entry point, wraps App in HashRouter + StrictMode
  App.jsx             # Route definitions (/, /memory, /zahlenspiel, /farbenquiz)
  index.css           # All styles (single global stylesheet)
  confetti.js         # Celebration animation utility
  components/
    Home.jsx          # Landing page with game selection grid
    Memory.jsx        # Memory card matching game
    Zahlenspiel.jsx   # Math quiz game
    FarbenQuiz.jsx    # Color recognition game
    Overlay.jsx       # Reusable win/completion modal
index.html            # HTML entry point
vite.config.js        # Vite config (base: '/game_collection/')
package.json          # Dependencies and scripts
.github/workflows/
  deploy.yml          # CI/CD: build + deploy to GitHub Pages
```

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (localhost:5173)
npm run build         # Production build to /dist
npm run preview       # Preview production build locally
```

There are no test, lint, or format commands.

## Build & Deployment

- Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Uses Node.js 20 with `npm ci` for clean installs
- Builds with `vite build`, outputs to `dist/`
- Deploys to GitHub Pages automatically
- Base path is `/game_collection/` (set in `vite.config.js`)

## Code Conventions

### Naming
- **Components:** PascalCase (`Memory`, `FarbenQuiz`, `Overlay`)
- **Functions:** camelCase (`buildCards`, `makeTask`, `handleAnswer`)
- **Constants:** UPPER_CASE (`ALL_EMOJIS`, `TOTAL`, `COLORS`)
- **CSS classes:** kebab-case (`.back-button`, `.memory-grid`)

### React Patterns
- Functional components only — no class components
- State via `useState`, memoized handlers via `useCallback`, non-render state via `useRef`
- Local component state only — no global state management (no Redux/Context)
- `Overlay` is a shared component used by all three games for win screens
- Inline styles used only for dynamic values (background colors); static styles in `index.css`

### Styling
- Single global CSS file (`src/index.css`) — no CSS modules or CSS-in-JS
- Child-friendly fonts: Segoe UI / Comic Sans MS
- Purple gradient backgrounds (`#667eea` to `#764ba2`)
- Responsive breakpoint at 600px
- CSS transforms for animations (3D card flips, confetti)

### Game Logic Patterns
- Fisher-Yates shuffle for randomization
- Factory functions generate game state (`buildCards()`, `makeTask()`, `makeQuestion()`)
- `setTimeout` for delayed transitions (card flip reveals, round transitions)
- Confetti animation spawns 40 DOM elements with auto-cleanup after 5 seconds

## Architecture Notes

- **Routing:** `HashRouter` is used instead of `BrowserRouter` for GitHub Pages compatibility (avoids 404s on direct navigation)
- **No persistence:** All game state resets on page reload
- **No external APIs:** Self-contained frontend application
- **Minimal dependencies:** Only React, React DOM, React Router, Vite
