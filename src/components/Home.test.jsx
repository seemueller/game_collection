import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home', () => {
  it('renders the title', () => {
    const { container } = renderHome();
    expect(container.querySelector('.home-title').textContent).toContain('Spielesammlung');
  });

  it('renders the subtitle', () => {
    const { container } = renderHome();
    expect(container.querySelector('.home-subtitle').textContent).toBe('Waehle ein Spiel und hab Spass!');
  });

  it('renders exactly 3 game cards', () => {
    const { container } = renderHome();
    expect(container.querySelectorAll('.game-card')).toHaveLength(3);
  });

  it('displays Memory game card with correct link', () => {
    const { container } = renderHome();
    const cards = container.querySelectorAll('.game-card');
    const card = Array.from(cards).find(
      (c) => c.querySelector('.game-card-title').textContent === 'Memory'
    );
    expect(card).toBeTruthy();
    expect(card.getAttribute('href')).toBe('/memory');
  });

  it('displays Zahlenspiel game card with correct link', () => {
    const { container } = renderHome();
    const cards = container.querySelectorAll('.game-card');
    const card = Array.from(cards).find(
      (c) => c.querySelector('.game-card-title').textContent === 'Zahlenspiel'
    );
    expect(card).toBeTruthy();
    expect(card.getAttribute('href')).toBe('/zahlenspiel');
  });

  it('displays Farben-Quiz game card with correct link', () => {
    const { container } = renderHome();
    const cards = container.querySelectorAll('.game-card');
    const card = Array.from(cards).find(
      (c) => c.querySelector('.game-card-title').textContent === 'Farben-Quiz'
    );
    expect(card).toBeTruthy();
    expect(card.getAttribute('href')).toBe('/farbenquiz');
  });

  it('shows game descriptions', () => {
    const { container } = renderHome();
    const descs = Array.from(container.querySelectorAll('.game-card-desc')).map(
      (el) => el.textContent
    );
    expect(descs).toContain('Finde die passenden Paare!');
    expect(descs).toContain('Rechne und sammle Sterne!');
    expect(descs).toContain('Erkennst du alle Farben?');
  });

  it('game cards have staggered animation delays', () => {
    const { container } = renderHome();
    const cards = container.querySelectorAll('.game-card');
    expect(cards[0].style.animationDelay).toBe('0s');
    expect(cards[1].style.animationDelay).toBe('0.12s');
    expect(cards[2].style.animationDelay).toBe('0.24s');
  });
});
