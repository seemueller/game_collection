import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock sounds to avoid AudioContext issues
vi.mock('./sounds', () => ({
  playFlip: vi.fn(),
  playMatch: vi.fn(),
  playNoMatch: vi.fn(),
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playWin: vi.fn(),
  playStreak: vi.fn(),
  playClick: vi.fn(),
}));

vi.mock('./confetti', () => ({
  spawnConfetti: vi.fn(),
}));

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe('App routing', () => {
  it('renders Home at /', () => {
    const { container } = renderApp('/');
    expect(container.querySelector('.home-title').textContent).toContain('Spielesammlung');
  });

  it('renders Memory at /memory', () => {
    const { container } = renderApp('/memory');
    expect(container.querySelector('.game-title').textContent).toContain('Memory');
    expect(container.querySelector('.game-info').textContent).toBe('Finde alle passenden Paare!');
  });

  it('renders Zahlenspiel at /zahlenspiel', () => {
    const { container } = renderApp('/zahlenspiel');
    expect(container.querySelector('.game-title').textContent).toContain('Zahlenspiel');
    expect(container.querySelector('.game-info').textContent).toBe('Loese die Aufgaben und sammle Sterne!');
  });

  it('renders FarbenQuiz at /farbenquiz', () => {
    const { container } = renderApp('/farbenquiz');
    expect(container.querySelector('.game-title').textContent).toContain('Farben-Quiz');
    expect(container.querySelector('.game-info').textContent).toBe('Welche Farbe siehst du?');
  });
});
